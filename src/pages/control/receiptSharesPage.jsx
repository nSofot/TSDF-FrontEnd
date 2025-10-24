import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner.jsx";
import { formatNumber } from "../../utils/numberFormat.js";

export default function ReceiptSharesPage() {
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
        toast.error("🚫 වලංගු නොවන සාමාජික අංකයක්");
        setMember(null);
        setTotalAmount("");
        setReceiptNo("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "🚫 වලංගු නොවන සාමාජික අංකයක්");
      setMember(null);
      setTotalAmount("");
      setReceiptNo("");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔢 Check receipt number validity
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
      console.error("Error checking receipt:", err);
      setError("⚠️ Error validating receipt");
    }
  };

  // 💾 Save Handler
  const handleSave = async () => {
    setIsSubmitting(true);

    if (!memberId || memberId === "0") {
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
      toast.error("කරුණාකර ගෙවන මුදල ඇතුළත් කරන්න.");
      setIsSubmitting(false);
      return;
    }
    if (
      !receiptNo ||
      !/^\d{6}$/.test(receiptNo) ||
      receiptNo === "000000" ||
      receiptNoOk === false
    ) {
      toast.error("කරුණාකර වලංගු 6 අංක රිසිට්පත් අංකයක් ඇතුළත් කරන්න.");
      setIsSubmitting(false);
      return;
    }
    if (error) {
      toast.error(error);
      setIsSubmitting(false);
      return;
    }

    const lgAcIdDr = "325-0001";
    const trxDes = "කොටස් මුදල්";
    let newReferenceNo = "";

    try {
      // 1️⃣ Create shares transaction
      const trxPayload = {
        trxBookNo: receiptNo,
        customerId: memberId,
        transactionDate: new Date(trxDate).toISOString(),
        trxAmount: parseFloat(totalAmount) || 0,
        transactionType: "receipt",
        isCredit: false,
        description: trxDes,
      };
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/sharesTransactions/create`,
        trxPayload
      );
      newReferenceNo = res.data.transaction.trxNumber;

      // 2️⃣ Update customer shares
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/customer/shares-add`, {
        updates: [{ customerId: memberId, amount: parseFloat(totalAmount) || 0 }],
      });

      // 3️⃣ Update cash book
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts/add-balance`, {
        updates: [{ accountId: lgAcIdDr, amount: parseFloat(totalAmount) || 0 }],
      });

      // 4️⃣ Ledger transaction
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerTransactions`, {
        trxId: String(newReferenceNo),
        trxBookNo: String(receiptNo),
        trxDate: new Date().toISOString(),
        transactionType: "receipt",
        accountId: lgAcIdDr,
        description: `${trxDes} - ${member?.nameSinhala || member?.name}`,
        isCredit: false,
        trxAmount: parseFloat(totalAmount) || 0,
      });

      // 5️⃣ Book reference
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/bookReferences`, {
        transactionType: "receipt",
        trxBookNo: String(receiptNo),
        trxReference: String(newReferenceNo),
      });

      toast.success("🎉 රිසිට්පත සාර්ථකව ඉදිරිපත් කළා!");
      setIsSubmitted(true);
    } catch (err) {
      console.error("⚠️ Submit failed:", err);
      toast.error("❌ රිසිට්පත ඉදිරිපත් කිරීමට අසමත් විය. කරුණාකර නැවත උත්සාහ කරන්න.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl w-full flex flex-col space-y-6">
      <div className="bg-white shadow rounded-md p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-orange-600">🧾 කොටස් මුදල් ලැබීම්</h1>
          <p className="text-sm text-gray-600">කොටස් මුදල් ගෙවීම් කළමනාකරණය සහ ගෙවීම් සිදුකිරීම.</p>
        </div>

        {/* Member Search */}
        <div className="bg-white shadow-md rounded-xl border-l-4 border-blue-500 p-6 space-y-4">
          <label className="block text-sm font-medium text-blue-500 mb-1">සාමාජික අංකය</label>
          <input
            type="text"
            className="w-full border border-blue-300 rounded-lg p-3 text-blue-500 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="000"
            maxLength={3}
            value={memberId}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setMemberId(value);
              if (value.length === 3) searchMember(value);
              else setMember(null);
            }}
          />

          {/* Member Info */}
          {isLoading ? (
            <LoadingSpinner />
          ) : member ? (
            <>
              <div>
                <label className="block text-sm font-medium text-blue-500 mb-1">
                  සාමාජිකයාගේ නම
                </label>
                <div className="w-full bg-blue-50 border border-blue-300 rounded-lg p-3 text-center font-medium text-blue-500">
                  {member?.nameSinhala || member?.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-500 mb-1">
                  කොටස් ගිණුම ශේෂය
                </label>
                <div className="w-full bg-blue-50 border border-blue-300 rounded-lg p-3 text-center font-medium text-blue-500">
                  {formatNumber(member?.shares || 0)}
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-blue-500">🚫 වලංගු සාමාජික අංකයක් නොවේ.</p>
          )}
        </div>

        {/* Receipt Input Section — only visible if member found */}
        {member && (
          <div className="bg-white shadow-md rounded-xl border-l-4 border-orange-500 p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">රිසිට් අංකය</label>
              <input
                type="text"
                className={`w-full p-3 rounded-lg text-gray-600 text-center border ${
                  error ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                value={receiptNo}
                placeholder="000000"
                onChange={(e) => setReceiptNo(e.target.value.replace(/\D/g, ""))}
                onBlur={() => {
                  const formatted = String(receiptNo).padStart(6, "0");
                  setReceiptNo(formatted);
                  if (formatted !== "000000") checkReceiptExists(formatted);
                }}
                maxLength={6}
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">ගෙවීම් දිනය</label>
              <input
                type="date"
                value={trxDate}
                onChange={(e) => setTrxDate(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-lg text-gray-600 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">ගෙවන මුදල</label>
              <input
                type="number"
                value={totalAmount}
                placeholder="0.00"
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-lg text-gray-600 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        {member && (
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <button
              disabled={isSubmitting || isSubmitted}
              onClick={handleSave}
              className={`w-full md:w-auto h-12 rounded-lg font-semibold text-white transition ${
                isSubmitting
                  ? "bg-gray-400"
                  : isSubmitted
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting
                ? "ගෙවීම සිදු වෙමින් පවතී ..."
                : isSubmitted
                ? "✅ ගෙවීම සම්පූර්ණයි"
                : "ගෙවීම තහවුරු කරන්න"}
            </button>
            <button
              onClick={() => navigate("/control")}
              className="w-full md:w-auto h-12 rounded-lg border border-gray-700 text-gray-700 hover:bg-gray-200 font-semibold transition"
            >
              ආපසු යන්න
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
