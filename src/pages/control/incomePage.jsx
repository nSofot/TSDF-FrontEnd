import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/loadingSpinner.jsx";

export default function IncomePage() {
  const [accounts, setAccounts] = useState([]);
  const [accountFrom, setAccountFrom] = useState("");
  const [accountFromName, setAccountFromName] = useState("");
  const [accountFromBalance, setAccountFromBalance] = useState(0);
  const [voucherNo, setVoucherNo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExpenseType, setSelectedExpenseType] = useState("");
  const formatLocalISODate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const [transferDate, setTransferDate] = useState(() => formatLocalISODate(new Date()));

  const [transferAmount, setTransferAmount] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [receiptNoOk, setReceiptNoOk] = useState(false);

  const [showDetailsSection, setShowDetailsSection] = useState(true);
  const [showAccountSection, setShowAccountSection] = useState(true);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) navigate("/login");

  const expenseType =
    user?.memberRole === "manager"
      ? ["බැංකු පොලිය", "සාමාජික අරමුදල් වලින්", "වෙනත් ආදායම්"]
      : ["බැංකු  පොලිය", "කොටස් අරමුදල් වලින්", "ලොතරැයි ආදායම", "වෙනත් ආදායම්"];

  useEffect(() => {
    if (!isLoading) return;
    const fetchAllAccounts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts`);
        let filtered = [];
        if (user.memberRole === "manager") {
          filtered = res.data.filter((a) =>
            ["325-0001", "327-0001", "327-0002", "327-0003", "327-0004"].includes(a.accountId)
          );
        } else if (user.memberRole === "treasurer") {
          filtered = res.data.filter((a) =>
            ["325-0002", "327-0005", "327-0006", "327-0007", "327-0008"].includes(a.accountId)
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

  const handleTransfer = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Unauthorized. Please log in.");
    if (!selectedExpenseType) return toast.error("කරුණාකර ලැබීම් වර්ගය තෝරන්න.");
    if (!accountFrom) return toast.error("කරුණාකර ලැබීම් ගිණුම තෝරන්න.");
    if (transferAmount <= 0) return toast.error("කරුණාකර මුදල ඇතුලත් කරන්න");
    if (!voucherNo) return toast.error("කරුණාකර රිසිට්පත් අංකය තෝරන්න.");

    let newReferenceNo = user.memberRole === "treasurer" ? `TREC-${Date.now()}` : `MREC-${Date.now()}`;
    setIsSubmitting(true);

    try {
      // 1️⃣ Update main account
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts/add-balance`, {
        updates: [{ accountId: accountFrom, amount: Number(transferAmount) }],
      });

      // 2️⃣ Create ledger transaction
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerTransactions`, {
        trxId: newReferenceNo,
        trxBookNo: voucherNo,
        trxDate: new Date(transferDate).toISOString(),
        transactionType: "receipt",
        accountId: accountFrom,
        description: selectedExpenseType,
        isCredit: false,
        trxAmount: Number(transferAmount),
      });

      // 3️⃣ Create book reference
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/bookReferences`, {
        transactionType: "receipt",
        trxBookNo: voucherNo,
        trxReference: newReferenceNo,
      });

      toast.success("✅ සාර්ථකව ඉදිරිපත් කරන ලදී");
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to submit transfer. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl w-full mx-auto px-2 py-6 space-y-6">
      {/* HEADER */}
      <header className="text-left">
        <h1 className="text-lg md:text-2xl font-bold text-orange-700">💸 වෙනත් ලැබීම්</h1>
        <p className="text-gray-500 text-sm">අනෙකුත් විවිධ ලැබීම් කළමනාකරණය.</p>
      </header>

      {/* DETAILS SECTION */}
      <div className="bg-white shadow-lg p-2 rounded-xl border-l-4 border-orange-700 overflow-hidden">
     
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* RECEIPT NO */}
              <div >
                <label className="text-sm font-semibold text-gray-700">රිසිට්පත් අංකය</label>
                <input
                  type="text"
                  className={`mt-1 w-full text-center tracking-widest rounded-lg p-3 border focus:ring-2 focus:ring-orange-500 ${
                    error ? "border-red-500 text-red-600" : "border-gray-300 text-gray-700"
                  }`}
                  value={voucherNo}
                  disabled={isSubmitted || isSubmitting}
                  placeholder="000000"
                  onChange={(e) => setVoucherNo(e.target.value.replace(/\D/g, ""))}
                  onBlur={() => {
                    const formatted = voucherNo.padStart(6, "0");
                    setVoucherNo(formatted);
                    if (formatted !== "000000") checkReceiptExists(formatted);
                  }}
                  maxLength={6}
                />
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
              </div>              
              {/* DATE */}
              <div>
                <label className="text-sm font-semibold text-gray-700">දිනය</label>
                <input
                  type="date"
                  disabled={isSubmitted || isSubmitting}
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  className="mt-1 w-full border rounded-lg p-3 text-gray-700 border-gray-300 focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* EXPENSE TYPE */}
            <div >
              <label className="text-sm font-semibold text-gray-700">ලැබීම් වර්ගය</label>
              <select
                value={selectedExpenseType}
                disabled={isSubmitted || isSubmitting}
                onChange={(e) => setSelectedExpenseType(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-orange-500"
              >
                <option value="">-- තෝරන්න --</option>
                {expenseType.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
      
          <div className="p-4 space-y-4">
            {/* ACCOUNT SELECTION */}
            <div>
              <label className="text-sm font-semibold text-gray-700">ලැබීම් ගිණුම</label>
              <select
                value={accountFrom}
                disabled={isSubmitted || isSubmitting}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setAccountFrom(selectedId);
                  const acc = accounts.find((a) => a.accountId === selectedId);
                  if (acc) {
                    setAccountFromName(acc.accountName);
                    setAccountFromBalance(acc.accountBalance);
                  }
                }}
                className="mt-1 w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- තෝරන්න --</option>
                {accounts.map((a, idx) => (
                  <option key={idx} value={a.accountId}>
                    {a.accountName}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-sm text-right text-gray-500">
                <span className="font-semibold text-blue-600">ශේෂය: </span>
                {Number(accountFromBalance ?? 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>

            {/* AMOUNT */}
            <div>
              <label className="text-sm font-semibold text-gray-700">මුදල</label>
              <input
                type="number"
                disabled={isSubmitted || isSubmitting}
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500"
                placeholder="උදාහරණයක් ලෙස: 1500.00"
              />
            </div>
          </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button
          disabled={isSubmitting || isSubmitted}
          className={`w-full sm:w-1/2 py-3 rounded-lg text-white font-semibold transition-all ${
            isSubmitting 
            ? "bg-gray-400 cursor-not-allowed" 
            : isSubmitted
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={handleTransfer}
        >
          {isSubmitting ? "ඉදිරිපත් කිරීම සිදු වෙමින් පවතී ..." : isSubmitted ? "ඉදිරිපත් කිරීම අවසන්" : "ඉදිරිපත් කරන්න"}
        </button>
        <button
          disabled={isSubmitting}
          onClick={() => navigate('/control')}
          className="w-full sm:w-1/2 py-3 border border-gray-400 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          ආපසු යන්න
        </button>
      </div>
    </div>
  );
}
