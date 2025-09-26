import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatNumber } from "../../utils/numberFormat.js";
import { FaMoneyCheckAlt, FaUserClock, FaHandHoldingUsd } from "react-icons/fa";

export default function ControlHomePage() {
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [cashRegister, setCashRegister] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 1️⃣ Fetch customers
        const cusRes = await axios.get(
          import.meta.env.VITE_BACKEND_URL + "/api/customer"
        );
        const customers = cusRes.data;
        setCustomers(customers);

        // 2️⃣ Fetch pending approvals & grants
        const [approvalsRes, loansRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/approval`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/grant`),
        ]);

        setPendingApprovals(
          approvalsRes.data.map((loan) => ({
            ...loan,
            customerName:
              customers.find((c) => String(c.customerId) === String(loan.customerId))
                ?.name || "Unknown",
          }))
        );

        setPendingLoans(
          loansRes.data.map((loan) => ({
            ...loan,
            customerName:
              customers.find((c) => String(c.customerId) === String(loan.customerId))
                ?.name || "Unknown",
          }))
        );

        // 3️⃣ Fetch cash register
        const cashRegisterRes = await axios.get(
          import.meta.env.VITE_BACKEND_URL + "/api/ledgerAccounts"
        );
        const cashAccount = cashRegisterRes.data.find(
          (account) => account.headerAccountId === "325"
        );
        setCashRegister(cashAccount);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto min-h-screen bg-gradient-to-br from-orange-50 to-orange-200 flex flex-col">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md p-4 rounded-b-xl">
        <h1 className="text-xl md:text-2xl font-bold">📊 පාලන පුවරුව</h1>
        <p className="text-xs opacity-80">ණය, අනුමැතීන් සහ මුදල් ප්‍රවාහය කළමනාකරණය කිරීමේ පිටුව</p>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Pending Approvals */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FaUserClock className="text-blue-500" /> අනුමැතිය සඳහා පොරොත්තු ණය අයදුම්පත්
          </h2>
          {pendingApprovals.length > 0 ? (
            <div className="mt-3 space-y-3">
              {pendingApprovals.map((loan) => (
                <div
                  key={loan._id}
                  className="p-3 rounded-lg border bg-gradient-to-r from-blue-50 to-blue-100 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-800">{loan.customerName}</p>
                    <p className="text-xs text-gray-500">
                      ID: {loan.customerId} • {loan.loanType}
                    </p>
                  </div>
                  <span className="text-blue-700 font-semibold">
                    {formatNumber(loan.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 mt-3 text-sm">No pending approvals</p>
          )}
        </div>

        {/* Pending Loans */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FaHandHoldingUsd className="text-green-500" /> නිකුත් කිරීම සඳහා පොරොත්තු ණය
          </h2>
          {pendingLoans.length > 0 ? (
            <div className="mt-3 space-y-3">
              {pendingLoans.map((loan) => (
                <div
                  key={loan._id}
                  className="p-3 rounded-lg border bg-gradient-to-r from-green-50 to-green-100 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-800">{loan.customerName}</p>
                    <p className="text-xs text-gray-500">
                      ID: {loan.customerId} • {loan.loanType}
                    </p>
                  </div>
                  <span className="text-green-700 font-semibold">
                    {formatNumber(loan.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 mt-3 text-sm">No pending loans</p>
          )}
        </div>

        {/* Cash Register */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FaMoneyCheckAlt className="text-yellow-500" /> මුදල් පොත්
          </h2>
          {cashRegister ? (
            <div className="mt-3 flex justify-between items-center p-3 rounded-lg border bg-gradient-to-r from-yellow-50 to-yellow-100">
              <span className="font-medium text-gray-800">
                {cashRegister.accountName}
              </span>
              <span className="text-yellow-700 font-bold">
                {formatNumber(cashRegister.accountBalance)}
              </span>
            </div>
          ) : (
            <p className="text-gray-400 mt-3 text-sm">No cash register found</p>
          )}
        </div>
      </div>
    </div>
  );
}
