import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/loadingSpinner.jsx";
import { ArrowLeft, SendHorizontal, Search } from "lucide-react";

export default function ExpensePage() {
  const [accounts, setAccounts] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [member, setMember] = useState({});
  const [accountFrom, setAccountFrom] = useState("");
  const [accountFromName, setAccountFromName] = useState("");
  const [accountFromBalance, setAccountFromBalance] = useState(0);
  const [voucherNo, setVoucherNo] = useState("");
  const [selectedExpenseType, setSelectedExpenseType] = useState("");
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split("T")[0]);
  const [transferAmount, setTransferAmount] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [receiptNoOk, setReceiptNoOk] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [showMemberSection, setShowMemberSection] = useState(true);
  const [showVoucherSection, setShowVoucherSection] = useState(true);
  const [showAccountSection, setShowAccountSection] = useState(true);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) navigate("/login");

  let expenseType = [];
  if (user.memberRole === "manager") {
    expenseType = ["ලාභ ආපසු ගෙවීම්", "කොටස් ආපසු ගෙවීම්", "අයකර ගැනීම්"];
  } else if (user.memberRole === "treasurer") {
    expenseType = [
      "සාමාජික පවුලේ අවමංගල්‍ය පරිත්‍යාග",
      "කලත්රයාගේ පවුලේ අවමංගල්‍ය පරිත්‍යාග",
      "ශිෂ්‍යත්ව පරිත්‍යාග",
    ];
  }

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
        const memberRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer`);
        setMembers(memberRes.data);
      } catch (err) {
        toast.error("Failed to fetch account/bank data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllAccounts();
  }, [isLoading]);

  const searchMember = async (id) => {
    if (!id || id === "0") return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`);
      if (res.data) {
        setMember(res.data);
        setTransferAmount("");
        setVoucherNo("");
      }
    } catch (err) {
      setMember({});
      toast.error(err.response?.data?.message || "වලංගු නොවන සාමාජික අංකයක්");
    } finally {
      setIsLoading(false);
    }
  };

  const checkVoucherExists = async (no) => {
    try {
      const trxType = "voucher";
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/bookReferences/trxbook/${no}/${trxType}`
      );
      if (res.data.exists) {
        setError("🚨 මෙම වවුචර් අංකය දැනටමත් පවතී!");
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
    if (!selectedExpenseType) return toast.error("කරුණාකර වියදම් වර්ගය තෝරන්න.");
    if (!accountFrom) return toast.error("කරුණාකර ගිණුම තෝරන්න.");
    if (transferAmount <= 0) return toast.error("කරුණාකර මුදල ඇතුලත් කරන්න");
    if (!voucherNo || !receiptNoOk)
      return toast.error("කරුණාකර වලංගු වවුචර් අංකයක් ඇතුලත් කරන්න.");

    setIsSubmitting(true);
    let newReferenceNo =
      user.memberRole === "treasurer" ? `TEXP-${Date.now()}` : `MEXP-${Date.now()}`;

    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts/subtract-balance`, {
        updates: [{ accountId: accountFrom, amount: Number(transferAmount) }],
      });

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerTransactions`, {
        trxId: newReferenceNo,
        trxBookNo: voucherNo,
        trxDate: new Date(transferDate).toISOString(),
        transactionType: "voucher",
        accountId: accountFrom,
        description: selectedExpenseType,
        isCredit: true,
        trxAmount: Number(transferAmount),
      });

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/bookReferences`, {
        transactionType: "voucher",
        trxBookNo: String(voucherNo),
        trxReference: String(newReferenceNo),
      });

      setIsSubmitted(true);
      toast.success("✅ සාර්ථකව ඉදිරිපත් කරන ලදී");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to submit transfer. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto w-full px-2 sm:px-6 py-6 space-y-6">
      {/* HEADER */}
      <header className="text-center">
        <h1 className="text-lg md:text-2xl font-bold text-orange-600">💸 සාමාජිකයින් සඳහා ගෙවීම්</h1>
        <p className="text-gray-500 text-sm">සාමාජික ගෙවීම් සහ වියදම් කළමනාකරණය.</p>
      </header>

      {/* MEMBER SECTION */}
      <div className="bg-white shadow-lg rounded-xl border-l-4 border-green-700 overflow-hidden">
        <button
          className="w-full flex justify-between items-center px-4 py-3 font-medium text-green-700 hover:bg-green-50"
          onClick={() => setShowMemberSection((prev) => !prev)}
        >
          <span>සාමාජික තොරතුරු</span>
          {showMemberSection ? "▲" : "▼"}
        </button>
        {showMemberSection && (
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">සාමාජික අංකය</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  maxLength={3}
                  disabled={isSubmitted || isSubmitting}
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value.replace(/\D/g, ""))}
                  onBlur={() => memberId && searchMember(memberId)}
                  className="flex-1 text-center border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-green-600"
                  placeholder="000"
                />
                <button
                  disabled={!memberId || isSubmitting}
                  onClick={() => searchMember(memberId)}
                  className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                >
                  <Search size={18} />
                </button>
              </div>
              {member?.name && (
                <p className="mt-2 text-center font-semibold text-green-700 bg-green-50 py-2 rounded-lg">
                  {member.name}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* VOUCHER & DETAILS SECTION */}
      <div className="bg-white shadow-lg rounded-xl border-l-4 border-blue-700 overflow-hidden">
        <button
          className="w-full flex justify-between items-center px-4 py-3 font-medium text-blue-700 hover:bg-blue-50"
          onClick={() => setShowVoucherSection((prev) => !prev)}
        >
          <span>වවුචර් & විස්තර</span>
          {showVoucherSection ? "▲" : "▼"}
        </button>
        {showVoucherSection && (
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">වවුචර් අංකය</label>
              <input
                type="text"
                className={`mt-1 w-full text-center tracking-widest rounded-lg px-3 py-2 text-sm border focus:ring-2 focus:ring-blue-500 ${
                  error ? "border-red-500 text-red-600" : "border-gray-300 text-gray-700"
                }`}
                value={voucherNo}
                disabled={isSubmitted || isSubmitting}
                placeholder="0000"
                onChange={(e) => setVoucherNo(e.target.value.replace(/\D/g, ""))}
                onBlur={() => {
                  const formatted = voucherNo.padStart(4, "0");
                  setVoucherNo(formatted);
                  if (formatted !== "0000") checkVoucherExists(formatted);
                }}
                maxLength={4}
              />
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">දිනය</label>
                <input
                  type="date"
                  value={transferDate}
                  disabled={isSubmitted || isSubmitting}
                  onChange={(e) => setTransferDate(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm border-gray-300 text-gray-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">වියදම් වර්ගය</label>
                <select
                  value={selectedExpenseType}
                  disabled={isSubmitted || isSubmitting}
                  onChange={(e) => setSelectedExpenseType(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500"
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
          </div>
        )}
      </div>

      {/* ACCOUNT & AMOUNT SECTION */}
      <div className="bg-white shadow-lg rounded-xl border-l-4 border-purple-700 overflow-hidden">
        <button
          className="w-full flex justify-between items-center px-4 py-3 font-medium text-purple-700 hover:bg-purple-50"
          onClick={() => setShowAccountSection((prev) => !prev)}
        >
          <span>ගිණුම & මුදල</span>
          {showAccountSection ? "▲" : "▼"}
        </button>
        {showAccountSection && (
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">ගිණුම</label>
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
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- තෝරන්න --</option>
                {accounts.map((a, idx) => (
                  <option key={idx} value={a.accountId}>
                    {a.accountName}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-sm text-right text-gray-500">
                <span className="font-semibold text-purple-600">ශේෂය: </span>
                {Number(accountFromBalance ?? 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">මුදල</label>
              <input
                type="number"
                value={transferAmount}
                disabled={isSubmitted || isSubmitting}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button
          disabled={isSubmitting || isSubmitted}
          onClick={handleTransfer}
          className={`w-full sm:w-1/2 py-3 rounded-lg text-white font-semibold transition-all ${
            isSubmitting || isSubmitted
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isSubmitting
            ? "ඉදිරිපත් වෙමින්..."
            : isSubmitted
            ? "ඉදිරිපත් අවසන්"
            : "ඉදිරිපත් කරන්න"}
        </button>
        <button
          disabled={isSubmitting}
          onClick={() => navigate("/control")}
          className="w-full sm:w-1/2 py-3 border border-gray-400 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          ආපසු යන්න
        </button>
      </div>
    </div>
  );
}
