import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function FundTransferPage() {
    const [accounts, setAccounts] = useState([]);
    const [accountFrom, setAccountFrom] = useState("");
    const [accountTo, setAccountTo] = useState("");
    const [accountFromBalance, setAccountFromBalance] = useState(0);
    const [accountToBalance, setAccountToBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [accountFromName, setAccountFromName] = useState("");
    const [accountToName, setAccountToName] = useState("");
    const [transferDate, setTransferDate] = useState(new Date().toISOString().split("T")[0]);
    const [transferAmount, setTransferAmount] = useState(0);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      if (!isLoading) return;
      const fetchAllAccounts = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts`
          );        
          const filtered = res.data.filter(
            (a) => a.headerAccountId === "325" || a.headerAccountId === "327"
          );         
          setAccounts(filtered.sort((a, b) => a.accountId.localeCompare(b.accountId)));
        } catch (err) {
          toast.error("Failed to fetch account/bank data.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchAllAccounts();
    }, [isLoading]);    

    const handleTransfer = async () => {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Unauthorized. Please log in.");
      if (!accountFrom) {
        setIsSubmitting(false);
        return toast.error("කරුණාකර ප්‍රධාන ගිණුම තෝරන්න.");
      }
      if (!accountTo) {
        setIsSubmitting(false);
        return toast.error("කරුණාකර ද්විතීයික ගිණුම තෝරන්න.");
      } 
      if (accountFrom === accountTo) {
        setIsSubmitting(false);
        return toast.error("ප්‍රධාන ගිණුම සහ ද්විතීයික ගිණුම සමාන නොවිය යුතුය.");
      }
      if (!transferAmount) {
        setIsSubmitting(false);
        return toast.error("කරුණාකර මුදල ඇතුලත් කරන්න");
      }

      const newReferenceNo = `TRNF-${Date.now()}`;

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
            `${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts/subtract-balance`,
            payload
            );
        } catch (error) {
            console.log("1️⃣⚠️ update main account error: ", error);
        }

        //2️⃣update cash book
        try {
            const accTrxPayload = {
                trxId: newReferenceNo,
                trxBookNo: "",
                trxDate: new Date(transferDate).toISOString(),
                transactionType: "transfer",
                transactionCategory: "",
                accountId: accountFrom,
                description: `${accountToName || "Unknown Account"}`,
                isCredit: true,
                trxAmount: Number(transferAmount)
            };
                
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerTransactions`, accTrxPayload);
        } catch (error) {
            console.log('2️⃣⚠️ create main account transaction error: ', error); 
        }

        //3️⃣update cash book
       try {
            const payload = {
            updates: [
                {
                accountId: accountTo,
                amount: Number(transferAmount)
                }
            ]
            };

            await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts/add-balance`,
            payload

            );
        } catch (error) {
            console.log("3️⃣⚠️ update secondary account error: ", error);
        }

        //4️⃣update cash book
        try {
            const accTrxPayloadTo = {
                trxId: newReferenceNo,
                trxBookNo: "",
                trxDate: new Date(transferDate).toISOString(),
                transactionType: "transfer",
                transactionCategory: "",
                accountId: accountTo,
                description: `${accountFromName || "Unknown Account"}`,
                isCredit: false,
                trxAmount: Number(transferAmount),
            };
         
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerTransactions`, accTrxPayloadTo);
        } catch (error) {
            console.log('4️⃣⚠️ create secondary account transaction error: ', error); 
        }
        setIsSubmitted(true);
        setIsSubmitting(false);
        toast.success("✅ මාරු කිරීම සාර්ථකව ඉදිරිපත් කරන ලදී");
      } catch (err) {
        toast.error("❌ Failed to submit transfer. Try again.");
      }
    };

    return (
        <div className="max-w-5xl p-2 w-full h-full flex flex-col space-y-6 overflow-hidden">
            {/* HEADER */}
            <div className="text-left p-2">
                <h1 className="text-lg md:text-2xl font-bold text-orange-600">🔁 මුදල් මාරු කිරීම්</h1>
                <p className="text-gray-600 text-sm sm:text-base">සියලුම අභ්‍යන්තර මුදල් චලනයන් කළමනාකරණය කිරීම.</p>
            </div>

            {/* DATES */}
            <div className="bg-gray-50 shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-orange-500">
                <div>
                    <label className="text-xs font-semibold text-gray-600">දිනය</label>
                    <input
                        type="date"
                        disabled={isSubmitted || isSubmitting}
                        value={transferDate}
                        onChange={(e) => {
                            setTransferDate(e.target.value);
                        }}
                        className="w-full mt-1 px-3 py-2 text-sm text-gray-600 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-600">ගිණුමේ සිට</label>
                    <select
                        value={accountFrom}
                        disabled={isSubmitted || isSubmitting}
                        onChange={(e) => {
                            const selectedAccountId = e.target.value;
                            setAccountFrom(selectedAccountId);

                            // Find the account object and set its name
                            const selectedAccount = accounts.find(
                                (a) => (a.accountId || a._id) === selectedAccountId
                            );
                            if (selectedAccount) {
                                setAccountFromName(selectedAccount.accountName || selectedAccount.accountsName);
                                setAccountFromBalance(selectedAccount.accountBalance);
                                setTransferAmount("");
                            }
                        }}
                        className="w-full mt-1 px-3 py-2 text-sm text-gray-600 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-700"
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
                    <div className="mt-1 gap-2 text-sm flex justify-end font-semibold text-gray-600">
                        <label className="text-xs text-blue-600">ගිණුම් ශේෂය</label>
                        Rs.{" "}
                        {Number(accountFromBalance ?? 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                    </div>
                </div>

                <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-600">ගිණුම වෙත</label>
                    <select
                        value={accountTo}
                        disabled={isSubmitted || isSubmitting}
                        onChange={(e) => {
                            const selectedAccountId = e.target.value;
                            setAccountTo(selectedAccountId);

                            // Find the account object and set the name
                            const selectedAccount = accounts.find(
                                (a) => (a.accountId || a._id) === selectedAccountId
                            );
                            if (selectedAccount) {
                                setAccountToName(selectedAccount.accountName || selectedAccount.accountsName);
                                setAccountToBalance(selectedAccount.accountBalance);
                                setTransferAmount("");
                            }
                        }}
                        className="w-full mt-1 px-3 py-2 text-sm text-gray-600 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-700"
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
                    <div className="mt-1 gap-2 text-sm flex justify-end font-semibold text-gray-600">
                        <label className="text-xs text-blue-600">ගිණුම් ශේෂය</label>
                        Rs.{" "}
                        {Number(accountToBalance ?? 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                    </div>
                </div>   
                    
                <div>
                    <label className="text-xs font-semibold text-gray-600">මුදල</label>
                    <input
                        type="number"
                        disabled={isSubmitted || isSubmitting}
                        value={transferAmount}
                        onChange={(e) => {
                            setTransferAmount(e.target.value);
                        }}
                        className="w-full mt-1 px-3 py-2 text-sm text-gray-600 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                </div>              
            </div>
            {error && <p className="px-4 text-red-600 text-xs">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button
                    disabled={isSubmitting || isSubmitted}
                    className={`rounded-lg w-full h-12 text-white font-semibold ${
                        isSubmitting 
                        ? "bg-gray-400 cursor-not-allowed" 
                        :isSubmitted ?
                        "bg-gray-600 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"}`}
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
                    onClick={() => navigate('/control')}
                    className="w-full h-12 text-gray-600 border border-gray-600 hover:bg-gray-700 hover:text-white rounded-lg font-semibold transition mb-4"
                >
                    ආපසු යන්න
                </button>          
            </div>
        </div>
    );
}
