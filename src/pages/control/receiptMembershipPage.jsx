import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner.jsx";
import { t } from "i18next";

export default function ReceiptMembershipPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [member, setMember] = useState({});
  const [trxDate, setTrxDate] = useState(new Date().toISOString().split("T")[0]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [receiptNo, setReceiptNo] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [receiptNoOk, setReceiptNoOk] = useState(false);

  const [showMemberSection, setShowMemberSection] = useState(true);
  const [showPaymentSection, setShowPaymentSection] = useState(true);

  const navigate = useNavigate();

  const searchMember = async (id) => {
    if (!id || id === "0") return;

    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`);
      if (res.data) {
        setMember(res.data);
        setTotalAmount("");
        setReceiptNo("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "🚫 වලංගු නොවන සාමාජික අංකයක්");
    } finally {
      setIsLoading(false);
    }
  };

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
    if (error) {
      toast.error(error);
      setIsSubmitting(false);
      return;
    }

    let newRefferenceNo = "";
    const lgAcIdDr = "325-0002";

    try {
      //1️⃣ save receipt
      try {
          const updates = [{
            customerId: memberId,
            amount: parseFloat(totalAmount) || 0
          }];

          await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/api/customer/membershipFee-subtract`,
            { updates } // wrap in an object!
          );
                    
      } catch (err) {
        toast.error("1️⃣⚠️රිසිට්පත ඉදිරිපත් කිරීමට අසමත් විය. නැවත උත්සාහ කරන්න.");
        console.error(err);
      }

      //2️⃣ update member
      try {
          const trxPayload = {
              trxBookNo: String(receiptNo),
              customerId: memberId,
              transactionDate: new Date(trxDate).toISOString(),
              trxAmount: parseFloat(totalAmount) || 0,
              transactionType: "receipt",
              isCredit: true,
              description: 'සාමාජික ගාස්තු',
          };
          const res = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/api/membershipTransactions/create`,
              trxPayload
          );
          newRefferenceNo = res.data.trxNumber;
      } catch (err) {
        toast.error("2️⃣⚠️රිසිට්පත ඉදිරිපත් කිරීමට අසමත් විය. නැවත උත්සාහ කරන්න.");
        console.error(err);
      }

      //3️⃣ update cash book
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
      } catch (err) {
        toast.error("3️⃣⚠️රිසිට්පත ඉදිරිපත් කිරීමට අසමත් විය. නැවත උත්සාහ කරන්න.");
        console.error(err);
      }

      //4️⃣ update ledger transaction
      try {
          const accTrxPayload = {
              trxId: String(newRefferenceNo),
              trxBookNo: String(receiptNo),
              trxDate: new Date(trxDate).toISOString(),
              transactionType: "receipt",
              accountId: lgAcIdDr,
              description: `'සාමාජික ගාස්තු' - ${member?.nameSinhala || member?.name}`,
              isCredit: false,
              trxAmount: parseFloat(totalAmount) || 0
          };
          await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerTransactions`, accTrxPayload);

      } catch (err) {
        toast.error("4️⃣⚠️රිසිට්පත ඉදිරිපත් කිරීමට අසමත් විය. නැවත උත්සාහ කරන්න.");
        console.error(err);
      }

      //5️⃣ update book reference
      try {
          const refPayload = {
              transactionType: "receipt",
              trxBookNo: String(receiptNo),
              trxReference: String(newRefferenceNo)
          };
          await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/bookReferences`, refPayload);
      } catch (err) {
        toast.error("5️⃣⚠️රිසිට්පත ඉදිරිපත් කිරීමට අසමත් විය. නැවත උත්සාහ කරන්න.");
        console.error(err);
      }

      toast.success("🎉 රිසිට්පත සාර්ථකව ඉදිරිපත් කළා!");
      setIsSubmitted(true);
    } catch (err) {
      setIsSubmitting(false);
      toast.error("❌ රිසිට්පත ඉදිරිපත් කිරීමට අසමත් විය. නැවත උත්සාහ කරන්න.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-2 py-6 flex flex-col space-y-6">
      {/* Header */}
      <div className="bg-white p-2 space-y-2">
        <h1 className="text-lg md:text-2xl font-bold text-green-700">🧾 සාමාජික ගාස්තු ලැබීම්</h1>
        <p className="text-sm text-gray-600">සාමාජික ගාස්තු පිළිබඳ ගෙවීම් සිදුකිරීම.</p>
      </div>

      {/* Member Section */}
      <div className="bg-white shadow-md rounded-xl border-l-4 border-blue-700 overflow-hidden">
        <button
          onClick={() => setShowMemberSection(prev => !prev)}
          className="w-full flex justify-between items-center px-2 py-3 font-medium text-blue-700 hover:bg-blue-50"
        >
          <span>සාමාජික තොරතුරු</span>
          {showMemberSection ? "▲" : "▼"}
        </button>
        {showMemberSection && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-700">සාමාජික අංකය</label>
              <input
                type="text"
                className="w-full border border-blue-300 rounded-lg p-3 text-center text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="000"
                maxLength={3}
                value={memberId}
                onChange={async (e) => {
                  const value = e.target.value;
                  setMemberId(value);
                  if (value.length === 3) await searchMember(value);
                }}
              />
            </div>

            {isLoading ? (
              <LoadingSpinner />
            ) : member?.name ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-blue-700">සාමාජිකයාගේ නම</label>
                  <div className="w-full bg-blue-50 border border-blue-300 rounded-lg p-3 text-center font-medium text-blue-700">{member.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">සාමාජික ගාස්තු ශේෂය</label>
                  <div className="w-full bg-blue-50 border border-blue-300 rounded-lg p-3 text-center font-medium text-blue-700">{member.membership || 0}</div>
                </div>
              </div>
            ) : (
              <p className="text-center text-blue-700">සාමාජික ගිණුම සොයාගත නොහැක.</p>
            )}
          </div>
        )}
      </div>

      {/* Payment Section */}
      <div className="bg-white shadow-md rounded-xl border-l-4 border-orange-700 overflow-hidden">
        <button
          onClick={() => setShowPaymentSection(prev => !prev)}
          className="w-full flex justify-between items-center px-4 py-3 font-medium text-orange-700 hover:bg-orange-50"
        >
          <span>ගෙවීම් තොරතුරු</span>
          {showPaymentSection ? "▲" : "▼"}
        </button>
        {showPaymentSection && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm text-orange-700">රිසිට් අංකය</label>
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
                className={`w-full p-3 rounded-lg text-center text-orange-700 border ${
                  error ? "border-red-500" : "border-orange-300"
                } focus:outline-none focus:ring-2 focus:ring-purple-400`}
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>            
            <div>
              <label className="block text-sm text-orange-700">ගෙවීම් දිනය</label>
              <input
                type="date"
                value={trxDate}
                onChange={(e) => setTrxDate(e.target.value)}
                className="w-full p-3 border border-orange-300 rounded-lg text-center text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm text-orange-700">ගෙවන මුදල</label>
              <input
                type="number"
                value={totalAmount}
                placeholder="0.00"
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full p-3 border border-orange-300 rounded-lg text-center text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <button
          disabled={isSubmitting || isSubmitted}
          onClick={handleSave}
          className={`w-full md:w-auto h-12 rounded-lg font-semibold text-white transition ${
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
          onClick={() => navigate('/control')}
          className="w-full md:w-auto h-12 rounded-lg border border-gray-700 text-gray-700 hover:bg-gray-200 font-semibold transition"
        >
          ආපසු යන්න
        </button>
      </div>
    </div>
  );
}
