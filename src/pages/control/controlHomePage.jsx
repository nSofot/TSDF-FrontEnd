import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner";
import { formatNumber } from "../../utils/numberFormat.js";
import {
  FaMoneyCheckAlt,
  FaUserClock,
  FaHandHoldingUsd,
  FaChevronDown,
  FaChevronUp,
  FaUsersCog,
} from "react-icons/fa";

export default function ControlHomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [cashRegister, setCashRegister] = useState([]);
  const [bankRegister, setBankRegister] = useState([]);
  const [loanRegister, setLoanRegister] = useState([]);
  const [excoMembers, setExcoMembers] = useState([]);
  const [openSections, setOpenSections] = useState({
    approvals: true,
    loans: true,
    cash: false,
    bank: false,
    loanAcc: false,
    exco: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const cusRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer`);
        const customers = cusRes.data;
        setCustomers(customers);

        const executiveRoles = ["chairman", "secretary", "treasurer", "manager", "executive"];
        const filteredExcoMembers = customers
          .filter((c) => executiveRoles.includes(c.memberRole?.toLowerCase()))
          .sort(
            (a, b) =>
              executiveRoles.indexOf(a.memberRole?.toLowerCase()) -
              executiveRoles.indexOf(b.memberRole?.toLowerCase())
          );
        setExcoMembers(filteredExcoMembers);

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

        const cashRegisterRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts`);
        const accounts = cashRegisterRes.data;

        setCashRegister(accounts.filter((a) => a.headerAccountId === "325"));
        setBankRegister(
          accounts
            .filter((a) => a.headerAccountId === "327")
            .sort((a, b) => a.accountId.localeCompare(b.accountId))
        );
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

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const Card = ({ title, icon, sectionKey, children }) => (
    <div className="bg-white shadow-md rounded-xl border-l-4 border-orange-600 overflow-hidden transition-all duration-300">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex justify-between items-center p-4 bg-orange-50 hover:bg-orange-100 transition-colors"
      >
        <h2 className="flex items-center gap-2 text-gray-700 font-semibold text-md">
          {icon} {title}
        </h2>
        {openSections[sectionKey] ? (
          <FaChevronUp className="text-gray-600" />
        ) : (
          <FaChevronDown className="text-gray-600" />
        )}
      </button>

      <div
        className={`transition-all duration-300 ${
          openSections[sectionKey] ? "max-h-[1000px] p-4" : "max-h-0 p-0"
        } overflow-hidden`}
      >
        {children}
      </div>
    </div>
  );

  const AccountItem = ({ name, balance }) => (
    <div className="flex justify-between items-center p-3 rounded-md bg-gray-50 border border-gray-200 mb-2">
      <span className="font-medium text-gray-800">{name}</span>
      <span className="font-semibold text-gray-700">{formatNumber(balance)}</span>
    </div>
  );

  const LoanItem = ({ customerName, customerId, loanType, amount }) => (
    <div className="flex justify-between items-center p-3 rounded-md bg-blue-50 border border-blue-100 mb-2 hover:bg-blue-100 transition-colors">
      <div>
        <p className="font-medium text-gray-800">{customerName}</p>
        <p className="text-sm text-gray-500">
          ID: {customerId} • {loanType}
        </p>
      </div>
      <span className="font-semibold text-blue-700">{formatNumber(amount)}</span>
    </div>
  );

  const Exco = ({ customerId, customerName, memberRole, image }) => (
    <div className="flex justify-between items-center p-3 rounded-md bg-blue-50 border border-blue-100 mb-2 hover:bg-blue-100 transition-colors">
      <div className="flex items-center gap-3">
        <div>
          <p className="font-medium text-gray-800">{customerName}</p>
          <p className="text-sm text-gray-500">ID: {customerId}</p>
        </div>
      </div>
      <span className="font-semibold text-blue-700 capitalize">{memberRole}</span>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-2 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col items-start md:items-center gap-2">
        <h1 className="text-lg md:text-3xl font-bold text-orange-600">
          🖥️ පාලන පුවරුව
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          ණය, සාමාජික මුදල් සහ මූල්‍ය දළ විශ්ලේෂණය
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card
          title="ණය අයදුම්පත්"
          icon={<FaUserClock className="text-blue-500" />}
          sectionKey="approvals"
        >
          {pendingApprovals.length ? (
            pendingApprovals.map((loan) => <LoanItem key={loan._id} {...loan} />)
          ) : (
            <p className="text-gray-400 text-sm">No pending approvals</p>
          )}
        </Card>

        <Card
          title="නිකුත් කිරීම සඳහා ණය"
          icon={<FaHandHoldingUsd className="text-green-500" />}
          sectionKey="loans"
        >
          {pendingLoans.length ? (
            pendingLoans.map((loan) => <LoanItem key={loan._id} {...loan} />)
          ) : (
            <p className="text-gray-400 text-sm">No pending loans</p>
          )}
        </Card>

        <Card
          title="මුදල් ගිණුම්"
          icon={<FaMoneyCheckAlt className="text-yellow-500" />}
          sectionKey="cash"
        >
          {cashRegister.length ? (
            cashRegister.map((acc) => (
              <AccountItem key={acc._id} name={acc.accountName} balance={acc.accountBalance} />
            ))
          ) : (
            <p className="text-gray-400 text-sm">No cash accounts found</p>
          )}
        </Card>

        <Card
          title="බැංකු ගිණුම්"
          icon={<FaMoneyCheckAlt className="text-yellow-500" />}
          sectionKey="bank"
        >
          {bankRegister.length ? (
            bankRegister.map((acc) => (
              <AccountItem key={acc._id} name={acc.accountName} balance={acc.accountBalance} />
            ))
          ) : (
            <p className="text-gray-400 text-sm">No bank accounts found</p>
          )}
        </Card>

        <Card
          title="ණය ගිණුම්"
          icon={<FaMoneyCheckAlt className="text-yellow-500" />}
          sectionKey="loanAcc"
        >
          {loanRegister.length ? (
            loanRegister.map((acc) => (
              <AccountItem key={acc._id} name={acc.accountName} balance={acc.accountBalance} />
            ))
          ) : (
            <p className="text-gray-400 text-sm">No loan accounts found</p>
          )}
        </Card>

        <Card
          title="නිලධාරි මණ්ඩලය"
          icon={<FaUsersCog className="text-indigo-500" />}
          sectionKey="exco"
        >
          {excoMembers.length ? (
            excoMembers.map((acc) => (
              <Exco
                key={acc._id}
                customerId={acc.customerId}
                customerName={acc.nameSinhala || acc.name}
                memberRole={acc.memberRole}
                image={acc.image}
              />
            ))
          ) : (
            <p className="text-gray-400 text-sm">No members found</p>
          )}
        </Card>
      </div>
    </div>
  );
}
