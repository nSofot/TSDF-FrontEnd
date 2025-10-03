import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner";
import { formatNumber } from "../../utils/numberFormat.js";
import { FaMoneyCheckAlt, FaUserClock, FaHandHoldingUsd } from "react-icons/fa";

export default function ControlHomePage() {
    const token = localStorage.getItem("token");
    const [isLoading, setIsLoading] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [pendingLoans, setPendingLoans] = useState([]);
    const [cashRegister, setCashRegister] = useState([]);
    const [bankRegister, setBankRegister] = useState([]);
    const [loanRegister, setLoanRegister] = useState([]);

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
          const cashAccounts = cashRegisterRes.data.filter(
            (account) => account.headerAccountId === "325"
          );
          setCashRegister(cashAccounts);
          const bankAccounts = cashRegisterRes.data.filter(
            (account) => account.headerAccountId === "327"
          );
          setBankRegister(bankAccounts);     
          const loanAccounts = cashRegisterRes.data.filter(
            (account) => account.headerAccountId === "330"
          );
          setLoanRegister(loanAccounts);               
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
        <div className="max-w-4xl w-full h-full flex flex-col overflow-hidden">
            {/* PAGE HEADER */}
            <div className="sticky top-0 z-30 text-orange-600 p-4 sticky top-0 z-10 border border-orange-600 rounded-md">
                <h1 className="text-lg md:text-2xl font-bold">🖥️ පාලන පුවරුව</h1>
                <p className="text-sm opacity-80">ණය සහ මූල්‍ය දළ විශ්ලේෂණය</p>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="bg-white shadow rounded-md max-h-[calc(100vh-200px)] overflow-y-auto mt-4">

                {/* Pending Approvals */}
                <div className="bg-orange-100 rounded-xl shadow-md p-4">
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
                <div className="bg-orange-100 rounded-xl shadow-md p-4">
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
                <div className="bg-orange-100 rounded-xl shadow-md p-4">
                  <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1">
                    <FaMoneyCheckAlt className="text-yellow-500" /> මුදල් ගිණුම්
                  </h2>
                  {cashRegister && cashRegister.length > 0 ? (
                    cashRegister.map((account) => (
                      <div
                        key={account._id}
                        className="p-3 rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{account.accountName}</p>
                          {/* <p className="text-xs text-gray-500">ID: {account.accountId}</p> */}
                        </div>
                        <span className="text-yellow-700 font-semibold">
                          {formatNumber(account.accountBalance)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 mt-3 text-sm">No cash register found</p>
                  )}
                </div>

                {/* Bank Register */}
                <div className="bg-orange-100 rounded-xl shadow-md p-4">
                  <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1">
                    <FaMoneyCheckAlt className="text-yellow-500" /> බැංකු ගිණුම්
                  </h2>
                  {bankRegister && bankRegister.length > 0 ? (
                    bankRegister.map((account) => (
                      <div
                        key={account._id}
                        className="p-3 rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{account.accountName}</p>
                          {/* <p className="text-xs text-gray-500">ID: {account.accountId}</p> */}
                        </div>
                        <span className="text-yellow-700 font-semibold">
                          {formatNumber(account.accountBalance)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 mt-3 text-sm">No bank accounts found</p>
                  )}
                </div>

                {/* Loan Register */}
                <div className="bg-orange-100 rounded-xl shadow-md p-4">
                  <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1">
                    <FaMoneyCheckAlt className="text-yellow-500" /> ණය ගිණුම්
                  </h2>
                  {loanRegister && loanRegister.length > 0 ? (
                    loanRegister.map((account) => (
                      <div
                        key={account._id}
                        className="p-3 rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{account.accountName}</p>
                          {/* <p className="text-xs text-gray-500">ID: {account.accountId}</p> */}
                        </div>
                        <span className="text-yellow-700 font-semibold">
                          {formatNumber(account.accountBalance)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 mt-3 text-sm">No loan accounts found</p>
                  )}
                </div>
            </div>
        </div>
    );
}