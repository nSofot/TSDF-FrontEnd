import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Cashbook from "../../components/viewCashbook";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CashRegisterPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [selectAccount, setSelectAccount] = useState("");
  const [accountBalance, setAccountBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fromDate, setFromDate] = useState(new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");

  const [showAccountSection, setShowAccountSection] = useState(true);
  const [showDateSection, setShowDateSection] = useState(true);
  const [showCashbookSection, setShowCashbookSection] = useState(true);

  useEffect(() => {
    if (!isLoading) return;

    const fetchAccounts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts`);
        const filtered = res.data.filter(a => a.headerAccountId === "325" || a.headerAccountId === "327");
        setAccounts(filtered.sort((a, b) => a.accountId.localeCompare(b.accountId)));
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch account/bank data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
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
    const selected = accounts.find(a => a.accountId === value || a._id === value);
    setAccountBalance(selected?.accountBalance ?? 0);
  };

  return (
    <div className="max-w-6xl w-full mx-auto px-2 py-6 flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h1 className="text-xl md:text-3xl font-bold text-green-700">💵 මුදල් පොත</h1>
        <p className="text-gray-600 text-sm md:text-base mt-1">
          මුදල් සහ බැංකු ගනුදෙනු නිරීක්ෂණය කරන්න
        </p>
      </div>

      {/* Account Selection */}
      <div className="bg-white rounded-xl border-l-4 border-green-700 shadow-md">
        <button
          onClick={() => setShowAccountSection(prev => !prev)}
          className="w-full flex justify-between items-center px-4 py-3 text-left font-medium text-green-700 hover:bg-green-50 rounded-t-xl"
        >
          <span>ගිණුම් තෝරන්න</span>
          {showAccountSection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {showAccountSection && (
          <div className="px-4 py-4 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1">
              <label className="text-sm font-medium text-green-700">ගිණුම</label>
              <select
                value={selectAccount}
                onChange={handleAccountChange}
                className="mt-1 w-full md:w-auto px-3 py-2 border border-green-400 rounded-lg text-sm focus:ring-2 focus:ring-green-300"
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
              <label className="text-sm font-medium text-green-700">ගිණුම් ශේෂය</label>
              <div className="mt-1 px-3 py-2 bg-green-50 rounded-lg border border-green-300 text-right font-semibold text-gray-800">
                Rs. {Number(accountBalance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Date Range */}
      <div className="bg-white rounded-xl border-l-4 border-green-700 shadow-md">
        <button
          onClick={() => setShowDateSection(prev => !prev)}
          className="w-full flex justify-between items-center px-4 py-3 text-left font-medium text-green-700 hover:bg-green-50 rounded-t-xl"
        >
          <span>දිනයන් තෝරන්න</span>
          {showDateSection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {showDateSection && (
          <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-green-700">දින සිට</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  validateDates(e.target.value, toDate);
                }}
                max={toDate}
                className="mt-1 w-full px-3 py-2 border border-green-400 rounded-lg text-sm focus:ring-2 focus:ring-green-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-green-700">දිනය දක්වා</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  validateDates(fromDate, e.target.value);
                }}
                min={fromDate}
                className="mt-1 w-full px-3 py-2 border border-green-400 rounded-lg text-sm focus:ring-2 focus:ring-green-300"
              />
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-sm px-2">{error}</p>}

      {/* Cashbook */}
      <div className="bg-white rounded-xl border-l-4 border-green-700 shadow-md">
        <button
          onClick={() => setShowCashbookSection(prev => !prev)}
          className="w-full flex justify-between items-center px-4 py-3 text-left font-medium text-green-700 hover:bg-green-50 rounded-t-xl"
        >
          <span>මුදල් පොත විවෘත කරන්න</span>
          {showCashbookSection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {showCashbookSection && (
          <div className="px-4 py-4">
            <Cashbook accountId={selectAccount} fromDate={fromDate} toDate={toDate} />
          </div>
        )}
      </div>
        <button
          onClick={() => navigate('/control')}
          className="w-full md:w-auto h-12 rounded-lg border border-gray-700 text-gray-700 hover:bg-gray-200 font-semibold transition"
        >
          ආපසු යන්න
        </button>      
    </div>
  );
}
