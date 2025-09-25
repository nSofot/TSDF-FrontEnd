import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { HiOutlineHome } from "react-icons/hi";
import toast from "react-hot-toast";
import Modal from "react-modal";
import Cashbook from "../../components/viewCashbook";

export default function CashRegisterPage() {
  const [accounts, setAccounts] = useState([]);
  const [selectAccount, setSelectAccount] = useState("");
  const [accountBalance, setAccountBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [header, setHeader] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fromDate, setFromDate] = useState(new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");

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
        console.error("Failed to fetch accounts:", err);
        toast.error("Failed to fetch account/bank data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllAccounts();
  }, [isLoading]);

  const validateDates = (start, end) => {
    if (start && end && new Date(start) > new Date(end)) {
      setError("⚠️ From Date must be earlier than To Date");
    } else {
      setError("");
    }
  };

  const handleAccountChange = (e) => {
    const value = e.target.value;
    setSelectAccount(value);
    const selected = accounts.find((a) => a.accountId === value || a._id === value);
    setAccountBalance(selected?.accountBalance ?? 0);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Unauthorized. Please log in.");
    if (!header) return toast.error("Please select account type.");
    if (!accountName) return toast.error("Please enter account name.");

    const headerAccountId = header.trim().toLowerCase() === "cash" ? "325" : "327";
    const payload = { accountType: "Asset", headerAccountId, accountName };

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts/${headerAccountId}`,
        payload
      );
      toast.success("🎉 Account created successfully!");
      setIsAddAccountModalOpen(false);
      setHeader("");
      setAccountName("");
      setIsLoading(true);
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error("❌ Failed to submit account. Try again.");
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-b-lg">
        <div>
          <h1 className="text-xl font-bold">💵 මුදල් පොත</h1>
          <p className="text-xs opacity-90">මුදල් සහ බැංකු ගනුදෙනු නිරීක්ෂණය කරන්න</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsAddAccountModalOpen(true)}
            className="px-3 py-2 text-xs md:text-sm font-semibold rounded-full bg-white text-blue-600 shadow hover:bg-gray-100 active:scale-95 transition"
          >
            + Add Account
          </button>
          <Link
            to="/control"
            className="flex items-center justify-center w-10 h-10 bg-white text-red-500 rounded-full shadow hover:scale-105 active:scale-95 transition"
            title="Go Home"
          >
            <HiOutlineHome className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* FILTERS */}
      <div className="p-4 space-y-3 bg-white shadow-sm md:flex md:gap-4 md:space-y-0">
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-600">ගිණුම</label>
          <select
            value={selectAccount}
            onChange={handleAccountChange}
            className="w-full mt-1 px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-indigo-400"
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
          <label className="text-xs font-semibold text-gray-600">ගිණුම් ශේෂය</label>
          <div className="mt-1 px-3 py-2 text-sm text-right rounded-lg border bg-green-50 font-semibold text-green-700">
            Rs.{" "}
            {Number(accountBalance ?? 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>

      {/* DATES */}
      <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white border-b">
        <div>
          <label className="text-xs font-semibold text-gray-600">දින සිට</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              validateDates(e.target.value, toDate);
            }}
            max={toDate}
            className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600">දිනය දක්වා</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              validateDates(fromDate, e.target.value);
            }}
            min={fromDate}
            className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
      {error && <p className="px-4 text-red-600 text-xs">{error}</p>}

      {/* CASHBOOK */}
      <div className="flex-1 overflow-y-auto bg-white m-4 p-2 rounded-xl shadow border">
        <Cashbook accountId={selectAccount} fromDate={fromDate} toDate={toDate} />
      </div>

      {/* ADD ACCOUNT MODAL (mobile-friendly bottom sheet) */}
      <Modal
        isOpen={isAddAccountModalOpen}
        onRequestClose={() => setIsAddAccountModalOpen(false)}
        contentLabel="Add New Account"
        overlayClassName="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
        className="w-full md:max-w-lg md:rounded-2xl md:shadow-xl bg-white p-6 rounded-t-2xl"
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-indigo-600">📒 Add Account</h2>
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setIsAddAccountModalOpen(false)}
            >
              ✖
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Account Type</label>
              <select
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
                value={header}
                onChange={(e) => setHeader(e.target.value)}
              >
                <option value="">Select Type</option>
                <option value="Cash">Cash</option>
                <option value="Bank">Bank</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Account Name</label>
              <input
                type="text"
                autoFocus
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
          </div>

          <button
            disabled={isSubmitting}
            onClick={async () => {
              if (!header || !accountName) return toast.error("Please fill all fields.");
              if (isSubmitting) return;
              setIsSubmitting(true);
              const id = toast.loading("Submitting...");
              await handleSubmit();
              toast.dismiss(id);
              setIsSubmitting(false);
            }}
            className="w-full py-2 text-sm font-semibold shadow bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 active:scale-95 disabled:opacity-50 transition"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
