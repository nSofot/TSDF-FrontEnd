import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner.jsx";
import { formatNumber } from "../../utils/numberFormat.js";


export default function ReceiptMembershipPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [memberId, setMemberId] = useState("");
    const [member, setMember] = useState({});
    const [trxDate, setTrxDate] = useState(new Date().toISOString().split("T")[0]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [receiptNo, setReceiptNo] = useState(0);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [receiptNoOk, setReceiptNoOk] = useState(false);
    const navigate = useNavigate();
    

    // Fetch applicant
    const searchMember = async (id) => {
        if (!id || id === "0") return;

        setIsLoading(true);
        try {         
            // Fetch applicant details
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`
            );
            if (res.data) {
                setMember(res.data);
                setTotalAmount("");
                setReceiptNo("");
            }           
        } catch (err) {
            toast.error(err.response?.data?.message || "වලංගු නොවන සාමාජික අංකයක්");
        } finally {
            setIsLoading(false);
        }
    };


    // function VoucherInput() {
    const checkReceiptExists = async (no) => {
        try {
          const trxType = "receipt";
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/bookReferences/trxbook/${no}/${trxType}`
          );
          if (res.data.exists) {
            setError("🚨 මෙම රිසිට්පත් අංකය දැනටමත් පවතී!");
            setReceiptNoOk(false);
          } else {
            setError("");
            setReceiptNoOk(true);
          }
        } catch (err) {
          console.error("Error checking voucher:", err);
          setError("⚠️ Error validating voucher");
        }
    }; 


    const handleSave = async () => {
        setIsSubmitting(true);

        if (!memberId || memberId === "0") {
            toast.error("වලංගු නොවන සාමාජික අංකයක්");
            setIsSubmitting(false);
            return;
        }

        if (!trxDate) {
            toast.error("කරුණාකර ලැබීම් දිනය තෝරන්න.");
            setIsSubmitting(false);
            return;
        }

        if (totalAmount <= 0) {
            toast.error("කරුණාකර ගෙවන​ මුදල ඇතුලත් කරන්න");
            setIsSubmitting(false);
            return;
        }

        if (
            !receiptNo || 
            !/^\d{6}$/.test(receiptNo) || // not exactly 6 digits
            receiptNo === "000000"     || // not all zeros
            receiptNoOk === false
            ) {
            toast.error("කරුණාකර වලංගු 6 අංක ලදුපත් අංකයක් ඇතුළත් කරන්න.");
            setIsSubmitting(false);
            return;
        }


        if (error) {
            toast.error(error);
            setIsSubmitting(false);
            return;
        }

        const lgAcIdDr = "325-0002";
        const trxDes = "සාමාජික ගාස්තු";
        let newReferenceNo = "";

        try {
             //1️⃣ create membership transaction
             try {
                const trxPayload = {
                    trxBookNo: receiptNo,
                    customerId: memberId,
                    transactionDate: new Date(trxDate).toISOString(),
                    trxAmount: parseFloat(totalAmount) || 0,
                    transactionType: "receipt", 
                    isCredit: true,
                    description: trxDes
                 };                
                const res = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/membershipTransactions/create`,
                    trxPayload
                );
                newReferenceNo = res.data.transaction.trxNumber; 
            } catch (error) {
                console.log('1️⃣⚠️ create loan transaction error: ', error);
            }

            //2️⃣update customer
            try {
                const customerPayload = {
                    customerId: memberId,
                    amount: parseFloat(totalAmount) || 0
                };               
                await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/customer/membershipFee-subtract`,
                customerPayload
                );
            } catch (error) {
                console.log('2️⃣⚠️ update customer error: ', error);
            }   

 
            //3️⃣update cash book
            try {
                const payload = {
                    updates: [
                        {
                        accountId: lgAcIdDr,
                        amount: parseFloat(totalAmount) || 0
                        }
                    ]
                };
                await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts/add-balance`,
                    payload

                );
            } catch (error) {
              console.log("3️⃣⚠️ update cash book error: ", error);
            }

            //4️⃣create cash book transaction
            try {
                const accTrxPayload = {
                    trxId: String(newReferenceNo),
                    trxBookNo: String(receiptNo),
                    trxDate: new Date().toISOString(),
                    transactionType: "receipt",
                    accountId: lgAcIdDr,
                    description: `${trxDes} - ${member?.name || ""}`,
                    isCredit: false,
                    trxAmount: parseFloat(totalAmount) || 0
                };
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerTransactions`, accTrxPayload);
            } catch (error) {
                console.error("4️⃣⚠️ create cash book transaction error:", error.response?.data || error.message);
            }     
            
            //5️⃣create book reference
            try {
                const refPayload = {
                    transactionType: "receipt",
                    trxBookNo: String(receiptNo),
                    trxReference: String(newReferenceNo)
                };
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/bookReferences`, refPayload);
            } catch (error) {
                console.log('3️⃣⚠️ create book reference error: ', error);
            }

            toast.success("🎉 රිසිට්පත සාර්ථකව ඉදිරිපත් කළා!");
            setIsSubmitted(true); // ✅ only on success
        } catch (error) {
            console.error("⚠️ Submit failed:", error);
            toast.error("❌ රිසිට්පත ඉදිරිපත් කිරීමට අසමත් විය. කරුණාකර නැවත උත්සාහ කරන්න.");
        } finally {
            setIsSubmitting(false); // ✅ always reset
        }
    };

    return (
        <div className="max-w-5xl w-full h-full flex flex-col space-y-6 overflow-hidden">
            <div className="bg-white shadow rounded-md max-h-[calc(100vh-120px)] space-y-8 overflow-y-auto">
                {/* Header */}
                <div className="bg-white shadow-md rounded-xl border-l-6 border-green-700 p-6 space-y-4">
                    <h1 className="text-lg md:text-2xl font-bold text-green-700">🧾 සාමාජික ගාස්තු ලැබීම්</h1>
                    <p className="text-sm text-green-700">
                        සාමාජික ගාස්තු පිළිබඳ ගෙවීම් කළමනාකරණය සහ ගෙවීම් සිදුකිරීම.
                    </p>
                </div>

                {/* Applicant Card */}
                <div className="bg-white shadow-md rounded-xl border-l-6 border-blue-500 p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-blue-500 mb-1">
                            සාමාජික අංකය
                        </label>
                        <input
                            type="text"
                            className="w-full border border-blue-300 rounded-lg p-3 text-blue-500 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="000"
                            maxLength={3}
                            value={memberId}
                            onChange={async (e) => {
                                const value = e.target.value;
                                setMemberId(value);
                                if (value.length === 3) {
                                await searchMember(value);
                                }
                            }}
                        />
                    </div>

                    {isLoading ? (
                        <LoadingSpinner />
                    ) : member ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-500 mb-1">
                                    සාමාජිකයාගේ නම
                                </label>
                                <div className="w-full bg-blue-50 border border-blue-300 rounded-lg p-3 text-center font-medium text-blue-500">
                                    {member?.name || ""}
                                </div>
                            </div>

                            {/* Loan Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-blue-500 mb-1">
                                    සාමාජික ගාස්තු ගිණුම ශේෂය
                                </label>
                                <div className="w-full bg-blue-50 border border-blue-300 rounded-lg p-3 text-center font-medium text-blue-500">
                                    {member?.membership || ""}
                                </div>                                
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-blue-500">සාමාජික ගිණුම සොයාගත නොහැක.</p>
                    )}
                </div>

                <div className="bg-white shadow-md rounded-xl border-l-6 border-orange-500 p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-orange-500 mb-1">ගෙවීම් දිනය</label>
                        <input 
                            type="date" 
                            value={trxDate} 
                            onChange={(e) => setTrxDate(e.target.value)} 
                            className="w-full p-3 border border-orange-300 rounded-lg text-orange-500 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-orange-500 mb-1">ගෙවන මුදල</label>
                        <input
                            type="number"
                            value={totalAmount}
                            placeholder="0.00"
                            onChange={(e) => setTotalAmount(e.target.value)}
                            className="w-full p-3 border border-orange-300 rounded-lg text-orange-500 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-orange-500 mb-1">රිසිට් අංකය</label>
                        <input
                            type="text"
                            className={`w-full p-3 rounded-lg text-orange-500 text-center border ${
                                error ? "border-red-500" : "border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                            value={receiptNo}
                            placeholder="000000"
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                setReceiptNo(val);
                            }}
                            onBlur={() => {
                                const formatted = String(receiptNo).padStart(6, "0");
                                setReceiptNo(formatted);
                                if (formatted !== "000000") checkReceiptExists(formatted);
                            }}
                            maxLength={6}
                        />
                        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-4 md:space-y-0 md:flex md:gap-4 mt-6">
                    <button
                        disabled={isSubmitting || isSubmitted}
                        onClick={async () => {
                        setIsSubmitting(true);
                        await handleSave();
                        }}
                        className={`w-full h-12 rounded-lg font-semibold text-white transition ${
                        !isSubmitting && !isSubmitted
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                    >
                        {isSubmitting
                        ? "ගෙවීම ඉදිරිපත් කරයි..."
                        : isSubmitted
                        ? "✅ ගෙවීම් සම්පූර්ණයි"
                        : "තහවුරු කරන්න"}
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="w-full h-12 hover:bg-gray-700 text-gray-700 rounded-lg border border-gray-700 font-semibold transition mb-6"
                    >
                        ආපසු යන්න
                    </button>
                </div>
            </div>
        </div>
    );
};