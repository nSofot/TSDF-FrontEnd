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
      setError("⚠️ From Date must be earlier than or equal to To Date");
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
    if (!accountName) return toast.error("Please submit account name.");

    const headerAccountId = header.trim().toLowerCase() === "cash" ? "325" : "327";
    const payload = {
      accountType: "Asset",
      headerAccountId,
      accountName,
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts/${headerAccountId}`,
        payload
      );
      toast.success("🎉 Account submitted successfully!");
      setIsAddAccountModalOpen(false);
      setIsLoading(true); // reload accounts
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error("❌ Failed to submit account. Please try again.");
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 rounded-md p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-700">💵 Cash Register</h1>
          <p className="text-sm text-gray-600">
            View and filter all cash and bank transactions easily
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-end">
          <button
            onClick={() => setIsAddAccountModalOpen(true)}
            className="px-4 py-2 text-sm font-semibold shadow rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 active:scale-95 transition"
          >
            + Add Account
          </button>
          <Link
            to="/control"
            className="flex items-center justify-center w-11 h-11 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full shadow hover:scale-105 active:scale-95 transition"
            title="Go to Home"
          >
            <HiOutlineHome className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4">
        {/* Account selector */}
        <div className="flex-1">
          <label className="text-sm font-medium block text-gray-700 mb-1">Account</label>
          <select
            value={selectAccount}
            onChange={handleAccountChange}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">-- Select --</option>
            {accounts.map((a, idx) => (
              <option key={`${a.accountId || a._id}-${idx}`} value={a.accountId || a._id}>
                {a.accountName || a.accountsName}
              </option>
            ))}
          </select>
        </div>

        {/* Balance */}
        <div className="flex-1">
          <label className="text-sm font-medium block text-gray-700 mb-1">
            Current Balance
          </label>
          <div className="w-full px-3 py-2 text-sm text-right border border-gray-300 rounded-lg bg-gradient-to-r from-green-50 to-green-100 font-semibold text-green-700">
            Rs.{" "}
            {Number(accountBalance ?? 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>

      {/* DATE FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 mb-3">
        <div className="flex-1">
          <label className="text-sm font-medium block text-gray-700 mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              validateDates(e.target.value, toDate);
            }}
            max={toDate}
            className="w-full text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium block text-gray-700 mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              validateDates(fromDate, e.target.value);
            }}
            min={fromDate}
            className="w-full text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {/* CASHBOOK */}
      <div className="flex-1 overflow-y-auto bg-white shadow-md rounded-xl border border-gray-200">
        <Cashbook accountId={selectAccount} fromDate={fromDate} toDate={toDate} />
      </div>

      {/* ADD ACCOUNT MODAL */}
      <Modal
        isOpen={isAddAccountModalOpen}
        onRequestClose={() => setIsAddAccountModalOpen(false)}
        contentLabel="Add New Account"
        overlayClassName="fixed inset-0 bg-[#00000090] flex items-center justify-center z-50"
        className="max-w-lg w-full max-h-[90vh] overflow-y-auto bg-white p-6 rounded-2xl shadow-xl border border-gray-200"
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-indigo-600">📒 Add New Account</h2>
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setIsAddAccountModalOpen(false)}
            >
              ✖
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-gray-600 font-semibold">Account Type</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                value={header}
                onChange={(e) => setHeader(e.target.value)}
              >
                <option value="">Select Type</option>
                <option value="Cash">Cash</option>
                <option value="Bank">Bank</option>
              </select>
            </div>
            <div>
              <label className="text-gray-600 font-semibold">Account Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
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
