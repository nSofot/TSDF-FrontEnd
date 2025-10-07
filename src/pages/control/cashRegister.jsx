import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Cashbook from "../../components/viewCashbook";

export default function CashRegisterPage() {
    const [accounts, setAccounts] = useState([]);
    const [selectAccount, setSelectAccount] = useState("");
    const [accountBalance, setAccountBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [header, setHeader] = useState("");
    const [accountName, setAccountName] = useState("");

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

    return (
        <div className="max-w-5xl p-2 w-full h-full flex flex-col space-y-6 overflow-hidden">
            {/* HEADER */}
            <div className="sticky top-0 z-30 bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-b-lg">
                <div>
                    <h1 className="text-xl font-bold">💵 මුදල් පොත</h1>
                    <p className="text-xs opacity-90">මුදල් සහ බැංකු ගනුදෙනු නිරීක්ෂණය කරන්න</p>
                </div>
            </div>

            <div className="bg-white shadow rounded-md max-h-[calc(100vh-230px)] space-y-8 overflow-y-auto">
              <div className="bg-gray-50 shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-indigo-500 mt-6">
                  <div className="flex-1">
                      <label className="text-xs font-semibold text-indigo-600">ගිණුම</label>
                      <select
                        value={selectAccount}
                        onChange={handleAccountChange}
                        className="w-full mt-1 px-3 py-2 text-sm text-indigo-600 rounded-lg border border-indigo-500 focus:ring-2 focus:ring-indigo-400"
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
                      <div className="mt-1 px-3 py-2 text-sm flex justify-between rounded-lg border bg-indigo-50 font-semibold text-indigo-700">
                          <label className="text-xs font-semibold">ගිණුම් ශේෂය</label>
                          Rs.{" "}
                          {Number(accountBalance ?? 0).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                      </div>
                  </div>
              </div>         

              {/* DATES */}
              <div className="bg-gray-50 shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-orange-500 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-xs font-semibold text-orange-600">දින සිට</label>
                          <input
                              type="date"
                              value={fromDate}
                              onChange={(e) => {
                                setFromDate(e.target.value);
                                validateDates(e.target.value, toDate);
                              }}
                              max={toDate}
                              className="w-full mt-1 px-3 py-2 text-sm border border-orange-600 rounded-lg focus:ring-2 focus:ring-blue-400"
                          />
                      </div>
                      <div>
                          <label className="text-xs font-semibold text-orange-600">දිනය දක්වා</label>
                          <input
                              type="date"
                              value={toDate}
                              onChange={(e) => {
                                setToDate(e.target.value);
                                validateDates(fromDate, e.target.value);
                              }}
                              min={fromDate}
                              className="w-full mt-1 px-3 py-2 text-sm border border-orange-600 rounded-lg focus:ring-2 focus:ring-blue-400"
                          />
                      </div>
                  </div>
              </div>
              {error && <p className="px-4 text-red-600 text-xs">{error}</p>}

      
              {/* CASHBOOK */}
              <div className="bg-gray-50 shadow-lg rounded-xl py-6 px-2 space-y-4 border-l-4 border-pink-500 mt-6">
                <Cashbook accountId={selectAccount} fromDate={fromDate} toDate={toDate} />
              </div>
            </div>
        </div>
    );
}
