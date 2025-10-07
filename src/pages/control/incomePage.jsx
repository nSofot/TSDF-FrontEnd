import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Cashbook from "../../components/viewCashbook";
import LoadingSpinner from "../../components/loadingSpinner.jsx";

export default function IncomePage() {
    const [accounts, setAccounts] = useState([]);
    const [accountFrom, setAccountFrom] = useState("");
    const [accountFromName, setAccountFromName] = useState("");
    const [accountFromBalance, setAccountFromBalance] = useState(0);
    const [voucherNo, setVoucherNo] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedExpenseType, setSelectedExpenseType] = useState("");
    const [transferDate, setTransferDate] = useState(new Date().toISOString().split("T")[0]);
    const [transferAmount, setTransferAmount] = useState(0);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "null");

    let expenseType = [];
    if (!user) navigate("/login");
    if (user.memberRole === 'manager') {
        expenseType = [
            'බැංකු පොලිය', 
            'සාමාජික අරමුදලට ගෙවීම්', 
            'කොටස් මුදල්'
        ];
    } else if (user.memberRole === 'treasurer') {
        expenseType = [
            'බැංකු  පොලිය', 
            'කොටස් අරමුදල් වලින්', 
            'ලොතරැයි ආදායම'
        ];
    }
    
    useEffect(() => {
        if (!isLoading) return;
        const fetchAllAccounts = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts`
                );

                let filtered = [];
                if (user.memberRole === "manager") {
                    filtered = res.data.filter(
                        (a) =>
                            a.accountId === "325-0001" ||
                            a.accountId === "327-0001" ||
                            a.accountId === "327-0002" ||
                            a.accountId === "327-0003" ||
                            a.accountId === "327-0004"
                    );
                } else if (user.memberRole === "treasurer") {
                    filtered = res.data.filter(
                        (a) =>
                            a.accountId === "325-0002" ||
                            a.accountId === "327-0005" ||
                            a.accountId === "327-0006" ||
                            a.accountId === "327-0007" ||
                            a.accountId === "327-0008"
                    );
                }
                setAccounts(filtered.sort((a, b) => a.accountId.localeCompare(b.accountId)));

            } catch (err) {
                toast.error("Failed to fetch account/bank data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllAccounts();
    }, [isLoading]);
   

    const checkVoucherExists = async (no) => {
        try {
          const trxType = "receipt";
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/bookReferences/trxbook/${no}/${trxType}`
          );
          if (res.data.exists) {
            setError("🚨 This voucher number already exists!");
          } else {
            setError("");
          }
        } catch (err) {
          console.error("Error checking voucher:", err);
          setError("⚠️ Error validating voucher");
        }
    }; 


    const handleTransfer = async () => {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Unauthorized. Please log in.");
      if (!selectedExpenseType) {
        setIsSubmitting(false);
        return toast.error("කරුණාකර ලැබීම් වර්ගය තෝරන්න.");
      }
      if (!accountFrom) {
        setIsSubmitting(false);
        return toast.error("කරුණාකර ලැබීම් ගිණුම තෝරන්න.");
      } 
      if (transferAmount <= 0) {
        setIsSubmitting(false);
        return toast.error("කරුණාකර මුදල ඇතුලත් කරන්න");
      }
      if (!voucherNo) {
        setIsSubmitting(false);
        return toast.error("කරුණාකර රිසිට්පත් අංකය තෝරන්න.");
      }
      let newReferenceNo = "";
      if (user.memberRole === 'treasurer') {
          newReferenceNo = `TREC-${Date.now()}`;
      } else if (user.memberRole === 'manager') {
          newReferenceNo = `MREC-${Date.now()}`;
      }

      try {
        //1️⃣update cash book
        try {
            const payload = {
                updates: [
                    {
                    accountId: accountFrom,
                    amount: Number(transferAmount),
                    },
                ],
            };
            await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts/add-balance`,
            payload
            );
        } catch (error) {
            console.log("1️⃣⚠️ update main account error: ", error);
        }

        //2️⃣update cash book
        try {
            const accTrxPayload = {
                trxId: newReferenceNo,
                trxBookNo: voucherNo,
                trxDate: new Date(transferDate).toISOString(),
                transactionType: "receipt",
                accountId: accountFrom,
                description: selectedExpenseType,
                isCredit: false,
                trxAmount: Number(transferAmount)
            };
                
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerTransactions`, accTrxPayload);
        } catch (error) {
            console.log('2️⃣⚠️ create main account transaction error: ', error); 
        }

        //3️⃣create book reference
        try {
            const refPayload = {
                referenceType: "receipt",
                bookNo: voucherNo,
                trxReference: newReferenceNo
            };
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/bookReferences`, refPayload);
        } catch (error) {
            console.log('3️⃣⚠️ create book reference error: ', error);
        }        

        setIsSubmitted(true);
        setIsSubmitting(false);
        toast.success("✅ සාර්ථකව ඉදිරිපත් කරන ලදී");
      } catch (err) {
        toast.error("❌ Failed to submit transfer. Try again.");
      }
    };

    return (
        <div className="max-w-5xl p-2 w-full h-full flex flex-col space-y-6 overflow-hidden">
            {/* HEADER */}
            <div className="text-left p-2 sticky top-0 z-10">
                <h1 className="text-lg md:text-2xl font-bold">💸 වෙනත් ලැබීම්</h1>
                <p className="text-gray-600 text-sm sm:text-base">අනෙකුත් විවිධ ලැබීම් කළමනාකරණය.</p>
            </div>

            {/* DATES */}
            <div className="bg-gray-50 shadow-lg rounded-xl p-6 space-y-4 border-l-6 border-orange-500">
                <div>
                    <label className="text-xs font-semibold text-orange-600">දිනය</label>
                    <input
                        type="date"
                        value={transferDate}
                        onChange={(e) => {
                            setTransferDate(e.target.value);
                        }}
                        className="w-full mt-1 px-3 py-2 text-sm text-orange-600 border border-orange-600 rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div className="flex-1">
                    <label className="text-xs font-semibold text-orange-600">ලැබීම් වර්ගය</label>
                    <select
                        value={selectedExpenseType}  // ✅ FIXED HERE
                        onChange={(e) => {
                        const value = e.target.value;
                        setSelectedExpenseType(value);
                        setTransferAmount("");
                        }}
                        className="w-full mt-1 px-3 py-2 text-sm text-orange-600 rounded-lg border border-orange-600 focus:ring-2 focus:ring-orange-700"
                    >
                        <option value="">-- Select --</option>
                        {expenseType.map((type, idx) => (
                        <option key={idx} value={type}>
                            {type}
                        </option>
                        ))}
                    </select>
                </div>

                <div className="flex-1">
                    <label className="text-xs font-semibold text-orange-600">ලැබීම් ගිණුම</label>
                    <select
                        value={accountFrom}
                        onChange={(e) => {
                            const selectedAccountId = e.target.value;
                            setAccountFrom(selectedAccountId);

                            // Find the account object and set the name
                            const selectedAccount = accounts.find(
                                (a) => (a.accountId || a._id) === selectedAccountId
                            );
                            if (selectedAccount) {
                                setAccountFromName(selectedAccount.accountName || selectedAccount.accountsName);
                                setAccountFromBalance(selectedAccount.accountBalance);
                                setTransferAmount("");
                            }
                        }}
                        className="w-full mt-1 px-3 py-2 text-sm text-orange-600 rounded-lg border border-orange-600 focus:ring-2 focus:ring-orange-700"
                    >
                        <option value="">-- Select --</option>
                        {accounts.map((a, idx) => (
                            <option key={`${a.accountId || a._id}-${idx}`} value={a.accountId || a._id}>
                                {a.accountName || a.accountsName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex-1">                   
                    <div className="mt-1 text-sm flex justify-end font-semibold text-orange-600">
                        <label className="text-xs font-semibold">ගිණුම් ශේෂය </label>
                        -{" "}
                        {Number(accountFromBalance ?? 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                    </div>
                </div>   
                    
                <div>
                    <label className="text-xs font-semibold text-orange-600">මුදල</label>
                    <input
                        type="number"
                        value={transferAmount}
                        onChange={(e) => {
                            setTransferAmount(e.target.value);
                        }}
                        className="w-full mt-1 px-3 py-2 text-sm text-orange-600 border border-orange-600 rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                </div>    

                <div>
                    <label className="text-xs font-semibold text-orange-600">රිසිට්පත් අංකය</label>
                    <input
                        type="text"
                        className={`mt-1 px-3 py-2 text-sm text-orange-600 border border-orange-600 rounded-lg w-full text-center tracking-widest focus:ring-2 focus:ring-purple-500 outline-none ${
                        error ? "border-red-500" : "border-gray-300"
                        }`}
                        value={voucherNo}
                        placeholder="0000"
                        onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setVoucherNo(val);
                        }}
                        onBlur={() => {
                        const formatted = voucherNo.padStart(4, "0");
                        setVoucherNo(formatted);
                        if (formatted !== "0000") checkVoucherExists(formatted);
                        }}
                        maxLength={4}
                    />
                        {error && (
                        <div className="bg-red-50 text-red-600 p-2 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </div>
            {error && <p className="px-4 text-red-600 text-xs">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button
                    disabled={isSubmitting || isSubmitted}
                    className={`rounded-lg w-full h-12 text-white font-semibold ${isSubmitting || isSubmitted ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                    onClick={ async () => {
                        setIsSubmitting(true),
                        await handleTransfer() 
                    }}
                >
                    {isSubmitting
                    ? "මාරු කිරීම වෙමින් පවතී"
                    : isSubmitted
                    ? "මාරු කිරීම අවසන්"
                    : "ඉදිරිපත් කරන්න"}
                </button>

                <button
                    disabled={isSubmitting}
                    onClick={() => navigate(-1)}
                    className="w-full h-12 text-gray-600 border border-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition mb-4"
                >
                    ආපසු යන්න
                </button>          
            </div>
        </div>
    );
}
