import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner.jsx";

export default function ReceiptMembershipPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [member, setMember] = useState(null);
  const [trxDate, setTrxDate] = useState(new Date().toISOString().split("T")[0]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [receiptNo, setReceiptNo] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [receiptNoOk, setReceiptNoOk] = useState(false);

  const navigate = useNavigate();

  // 🔍 Search Member
  const searchMember = async (id) => {
    if (!id || id === "0") return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`);
      if (res.data) {
        setMember(res.data);
        setTotalAmount("");
        setReceiptNo("");
      } else {
        setMember(null);
        toast.error("🚫 වලංගු නොවන සාමාජික අංකයක්");
      }
    } catch (err) {
      setMember(null);
      toast.error(err.response?.data?.message || "🚫 වලංගු නොවන සාමාජික අංකයක්");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 Auto-search member when 3 digits entered
  useEffect(() => {
    if (memberId && memberId.length === 3) searchMember(memberId);
  }, [memberId]);

  // ✅ Validate receipt number
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
    } catch {
      setError("⚠️ Error validating voucher");
    }
  };

  // 💾 Save Membership Receipt
  const handleSave = async () => {
    setIsSubmitting(true);
    if (!member || !memberId) {
      toast.error("🚫 වලංගු නොවන සාමාජික අංකයක්");
      setIsSubmitting(false);
      return;
    }
    if (!trxDate) {
      toast.error("කරුණාකර ලැබීම් දිනය තෝරන්න.");
      setIsSubmitting(false);
      return;
    }
    if (totalAmount <= 0) {
      toast.error("කරුණාකර ගෙවන මුදල ඇතුළත් කරන්න");
      setIsSubmitting(false);
      return;
    }
    if (!receiptNo || !/^\d{6}$/.test(receiptNo) || receiptNo === "000000" || receiptNoOk === false) {
      toast.error("කරුණාකර වලංගු 6 අංක රිසිට්පත් අංකයක් ඇතුළත් කරන්න.");
      setIsSubmitting(false);
      return;
    }

    let newRefferenceNo = "";
    const lgAcIdDr = "325-0002";

    try {
      // 1️⃣ update member membership fee
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/customer/membershipFee-subtract`, {
        updates: [{ customerId: memberId, amount: parseFloat(totalAmount) || 0 }],
      });
      // 2️⃣ create membership transaction
      const trxPayload = {
        trxBookNo: String(receiptNo),
        customerId: memberId,
        transactionDate: new Date(trxDate).toISOString(),
        trxAmount: parseFloat(totalAmount) || 0,
        transactionType: "receipt",
        isCredit: true,
        description: `සාමාජික ගාස්තු`,
      };
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/membershipTransactions/create`,
        trxPayload
      );
      newRefferenceNo = res.data.trxNumber;
      // 3️⃣ update ledger account balance
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts/add-balance`, {
        updates: [{ accountId: lgAcIdDr, amount: parseFloat(totalAmount) || 0 }],
      });
      // 4️⃣ create ledger transaction
      const accTrxPayload = {
        trxId: String(newRefferenceNo),
        trxBookNo: String(receiptNo),
        trxDate: new Date(trxDate).toISOString(),
        transactionType: "receipt",
        transactionCategory: "සාමාජික ගාස්තු",
        accountId: lgAcIdDr,
        description: `${member?.nameSinhala || member?.name}`,
        isCredit: false,
        trxAmount: parseFloat(totalAmount) || 0,
      };
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerTransactions`, accTrxPayload);
      // 5️⃣ create book reference
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/bookReferences`, {
        transactionType: "receipt",
        trxBookNo: String(receiptNo),
        trxReference: String(newRefferenceNo),
      });

      toast.success("🎉 රිසිට්පත සාර්ථකව ඉදිරිපත් කළා!");
      setIsSubmitted(true);
    } catch (err) {
      toast.error("❌ රිසිට්පත ඉදිරිපත් කිරීමට අසමත් විය. නැවත උත්සාහ කරන්න.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-2 py-6 flex flex-col space-y-6">
      <div className="bg-white p-2 space-y-2">
        <h1 className="text-lg md:text-2xl font-bold text-green-700">🧾 සාමාජික ගාස්තු ලැබීම්</h1>
        <p className="text-sm text-gray-600">සාමාජික ගාස්තු පිළිබඳ ගෙවීම් සිදුකිරීම.</p>
      </div>

      {/* 🔍 Member Search */}
      <div className="bg-white shadow-md rounded-xl border-l-4 border-blue-700 overflow-hidden p-4">
        <label className="block text-sm font-medium text-blue-700">සාමාජික අංකය</label>
        <input
          type="text"
          className="w-full border border-blue-300 rounded-lg p-3 text-center text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-1"
          placeholder="000"
          maxLength={3}
          value={memberId}
          onChange={(e) =>{
            setMember(null);
            setError("");
            setIsSubmitted(false);
            setReceiptNoOk(false);
            setReceiptNo("");
            setTotalAmount(0);
            setMemberId(e.target.value.replace(/\D/g, ""))}
          } 
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : member ? (
        <>
          {/* ✅ Member Details */}
          <div className="bg-white shadow-md rounded-xl border-l-4 border-blue-700 overflow-hidden p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-700">සාමාජිකයාගේ නම</label>
              <div className="w-full bg-blue-50 border border-blue-300 rounded-lg p-3 text-center font-medium text-blue-700 mt-1">
                {member.nameSinhala || member.name}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700">සාමාජික ගාස්තු ශේෂය</label>
              <div className="w-full bg-blue-50 border border-blue-300 rounded-lg p-3 text-center font-medium text-blue-700 mt-1">
                {member.membership || 0}
              </div>
            </div>
          </div>

          {/* ✅ Show this section only if member found */}
          <div className="bg-white shadow-md rounded-xl border-l-4 border-orange-700 overflow-hidden p-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">රිසිට් අංකය</label>
              <input
                type="text"
                value={receiptNo}
                maxLength={6}
                placeholder="000000"
                onChange={(e) => setReceiptNo(e.target.value.replace(/\D/g, ""))}
                onBlur={() => {
                  const formatted = String(receiptNo).padStart(6, "0");
                  setReceiptNo(formatted);
                  if (formatted !== "000000") checkReceiptExists(formatted);
                }}
                disabled={!member}
                className={`w-full p-3 rounded-lg text-center text-gray-600 border ${
                  error ? "border-red-500" : "border-gray-600"
                } focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                  !member ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">ගෙවීම් දිනය</label>
              <input
                type="date"
                value={trxDate}
                onChange={(e) => setTrxDate(e.target.value)}
                disabled={!member}
                className={`w-full p-3 border border-gray-600 rounded-lg text-center text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                  !member ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">ගෙවන මුදල</label>
              <input
                type="number"
                value={totalAmount}
                placeholder="0.00"
                onChange={(e) => setTotalAmount(e.target.value)}
                disabled={!member}
                className={`w-full p-3 border border-gray-600 rounded-lg text-center text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                  !member ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>
          </div>

          {/* ✅ Actions */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <button
              disabled={!member || isSubmitting || isSubmitted}
              onClick={handleSave}
              className={`w-full md:w-auto h-12 px-4 rounded-lg font-semibold text-white transition ${
                isSubmitting
                  ? "bg-gray-400 hover:bg-green-700"
                  : isSubmitted
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting
                ? "ගෙවීම් කිරීම සිදු වෙමින් පවතී"
                : isSubmitted
                ? "ගෙවීම් කිරීම සම්පූර්ණයි"
                : "ගෙවීම් කිරීම තහවුරු කරන්න"}
            </button>

            <button
              onClick={() => navigate("/control")}
              className="w-full md:w-auto h-12 px-4 rounded-lg border border-gray-700 text-gray-700 hover:bg-gray-200 font-semibold transition"
            >
              ආපසු යන්න
            </button>
          </div>
        </>
      ) : memberId.length === 3 && !isLoading ? (
        // Shown when no valid member found
        <div className="p-4 text-center text-gray-600 border rounded-lg bg-gray-50">
          ⚠️ කරුණාකර වලංගු සාමාජික අංකයක් ඇතුලත් කරන්න.
        </div>
      ) : null}
    </div>
  );
}
