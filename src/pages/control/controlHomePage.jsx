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

        // Fetch customers
        const cusRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer`);
        const customers = cusRes.data;
        setCustomers(customers);

        // Fetch pending approvals & grants
        const [approvalsRes, loansRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/approval`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/grant`),
        ]);

        setPendingApprovals(
          approvalsRes.data.map((loan) => ({
            ...loan,
            customerName:
              customers.find((c) => String(c.customerId) === String(loan.customerId))?.name ||
              "Unknown",
          }))
        );

        setPendingLoans(
          loansRes.data.map((loan) => ({
            ...loan,
            customerName:
              customers.find((c) => String(c.customerId) === String(loan.customerId))?.name ||
              "Unknown",
          }))
        );

        // Fetch ledger accounts
        const cashRegisterRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts`);
        const accounts = cashRegisterRes.data;

        setCashRegister(accounts.filter((a) => a.headerAccountId === "325"));
        setBankRegister(accounts.filter((a) => a.headerAccountId === "327"));
        setLoanRegister(accounts.filter((a) => a.headerAccountId === "330"));
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <LoadingSpinner />;

  const Card = ({ title, icon, children }) => (
    <div className="bg-white shadow-md rounded-xl border-l-4 border-orange-600 p-4 flex flex-col gap-3 hover:shadow-lg transition-shadow duration-200">
      <h2 className="flex items-center gap-2 text-gray-700 font-semibold text-lg">
        {icon} {title}
      </h2>
      {children}
    </div>
  );

  const AccountItem = ({ name, balance }) => (
    <div className="flex justify-between items-center p-3 rounded-md bg-gray-50 border border-gray-200">
      <span className="font-medium text-gray-800">{name}</span>
      <span className="font-semibold text-gray-700">{formatNumber(balance)}</span>
    </div>
  );

  const LoanItem = ({ customerName, customerId, loanType, amount }) => (
    <div className="flex justify-between items-center p-3 rounded-md bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors">
      <div>
        <p className="font-medium text-gray-800">{customerName}</p>
        <p className="text-sm text-gray-500">
          ID: {customerId} • {loanType}
        </p>
      </div>
      <span className="font-semibold text-blue-700">{formatNumber(amount)}</span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-2 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col items-start md:items-center gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-orange-600">🖥️ පාලන පුවරුව</h1>
        <p className="text-gray-600 text-sm md:text-base">ණය සහ මූල්‍ය දළ විශ්ලේෂණය</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <Card title="අනුමැතිය සඳහා පොරොත්තු ණය අයදුම්පත්" icon={<FaUserClock className="text-blue-500 " />}>
          {pendingApprovals.length > 0 ? (
            pendingApprovals.map((loan) => <LoanItem key={loan._id} {...loan} />)
          ) : (
            <p className="text-gray-400 text-sm">No pending approvals</p>
          )}
        </Card>

        {/* Pending Loans */}
        <Card title="නිකුත් කිරීම සඳහා පොරොත්තු ණය" icon={<FaHandHoldingUsd className="text-green-500" />}>
          {pendingLoans.length > 0 ? (
            pendingLoans.map((loan) => <LoanItem key={loan._id} {...loan} />)
          ) : (
            <p className="text-gray-400 text-sm">No pending loans</p>
          )}
        </Card>

        {/* Cash Register */}
        <Card title="මුදල් ගිණුම්" icon={<FaMoneyCheckAlt className="text-yellow-500" />}>
          {cashRegister.length > 0 ? (
            cashRegister.map((acc) => <AccountItem key={acc._id} name={acc.accountName} balance={acc.accountBalance} />)
          ) : (
            <p className="text-gray-400 text-sm">No cash accounts found</p>
          )}
        </Card>

        {/* Bank Register */}
        <Card title="බැංකු ගිණුම්" icon={<FaMoneyCheckAlt className="text-yellow-500" />}>
          {bankRegister.length > 0 ? (
            bankRegister.map((acc) => <AccountItem key={acc._id} name={acc.accountName} balance={acc.accountBalance} />)
          ) : (
            <p className="text-gray-400 text-sm">No bank accounts found</p>
          )}
        </Card>

        {/* Loan Register */}
        <Card title="ණය ගිණුම්" icon={<FaMoneyCheckAlt className="text-yellow-500" />}>
          {loanRegister.length > 0 ? (
            loanRegister.map((acc) => <AccountItem key={acc._id} name={acc.accountName} balance={acc.accountBalance} />)
          ) : (
            <p className="text-gray-400 text-sm">No loan accounts found</p>
          )}
        </Card>
      </div>
    </div>
  );
}
