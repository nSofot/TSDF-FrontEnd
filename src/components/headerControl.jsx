import { Link, useNavigate, useLocation } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import {
  FaRegUser,
  FaHome,
  FaUsers,
  FaFileSignature,
  FaCheckCircle,
  FaHandHoldingUsd,
  FaReceipt,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaWallet,
  FaChartLine,
  FaBook,
  FaAddressBook,
  FaClipboardList,
  FaChartPie,
  FaSignOutAlt
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { FaU } from "react-icons/fa6";

export default function Header() {
  const [sideDrawerOpened, setSideDrawerOpened] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  useEffect(() => {
    setSideDrawerOpened(false);
  }, [location.pathname]);

  const roleBasedNavLinks = {
    common: [
      { path: "/control/", label: "Home", icon: <FaHome /> },
      { path: "/control/members", label: "Members", icon: <FaUsers /> },
      { path: "/control/cash-book", label: "Cash Book", icon: <FaBook /> },
      { path: "/contact", label: "Shares", icon: <FaChartPie /> },      
    ],
    admin: [
      { path: "/control/apply-loan", label: "Apply Loan", icon: <FaFileSignature /> },
      { path: "/control/approve-loan", label: "Approve Loan", icon: <FaCheckCircle /> },
      { path: "/control/grant-loan", label: "Grant Loan", icon: <FaHandHoldingUsd /> },   
      { path: "/control/loan-repayment", label: "Loan Repayment", icon: <FaMoneyBillWave /> },  
      { path: "/control/receipts-membership", label: "Membership Receipt", icon: <FaReceipt /> }, 
      { path: "/control/expense", label: "Expenses", icon: <FaWallet /> },
      { path: "/control/expense-others", label: "Other Expenses", icon: <FaWallet /> },
      { path: "/control/income", label: "Income", icon: <FaChartLine /> },
      { path: "/control/fund-transfer", label: "Fund Transfer", icon: <FaExchangeAlt /> },
      { path: "/control/ledger-membership", label: "Membership Ledger", icon: <FaAddressBook /> }, 
      { path: "/control/ledger-loan", label: "Loan Ledger", icon: <FaClipboardList /> },       
    ],
    manager: [
      { path: "/control/apply-loan", label: "Apply Loan", icon: <FaFileSignature /> },
      { path: "/control/approve-loan", label: "Approve Loan", icon: <FaCheckCircle /> },
      { path: "/control/grant-loan", label: "Grant Loan", icon: <FaHandHoldingUsd /> },   
      { path: "/control/loan-repayment", label: "Loan Repayment", icon: <FaMoneyBillWave /> },   
      { path: "/control/expense", label: "Expenses", icon: <FaWallet /> },
      { path: "/control/expense-others", label: "Other Expenses", icon: <FaWallet /> },
      { path: "/control/income", label: "Income", icon: <FaChartLine /> },
      { path: "/control/fund-transfer", label: "Fund Transfer", icon: <FaExchangeAlt /> },
      { path: "/control/ledger-loan", label: "Loan Ledger", icon: <FaClipboardList /> },      
    ],
    treasurer: [
      { path: "/control/receipts-membership", label: "Membership Fee", icon: <FaReceipt /> },
      { path: "/control/fund-transfer", label: "Fund Transfer", icon: <FaExchangeAlt /> },
      { path: "/control/expense", label: "Expenses", icon: <FaWallet /> },
      { path: "/control/expense-other", label: "Other Expenses", icon: <FaWallet /> },
      { path: "/control/income", label: "Income", icon: <FaChartLine /> },
      { path: "/control/ledger-membership", label: "Members Ledger", icon: <FaAddressBook /> },      
    ],
    secretary: [
      { path: "/control/approve-loan", label: "Approve Loan", icon: <FaCheckCircle /> },
      { path: "/control/add-customer-secretary", label: "Add New Customer", icon: <FaUsers /> },
      { path: "/control/edit-customer-secretary", label: "Edit Customer", icon: <FaUsers /> },
    ],
    chairman: [
      { path: "/control/approve-loan", label: "Approve Loan", icon: <FaCheckCircle /> },
    ],
  };
 

  const allowedRoles = ["admin", "executive", "manager", "chairman", "secretary", "treasurer"];
  const showLinks = allowedRoles.includes(user?.memberRole);
  
  const userRole = user?.memberRole?.toLowerCase();

  const navLinks = [
    ...(roleBasedNavLinks.common || []),
    ...(roleBasedNavLinks[userRole] || []),
  ];

  return (
    <header className="w-full h-[64px] shadow-lg flex justify-between items-center px-4 bg-white z-50">
      {/* Mobile Hamburger + Title */}
      <div className="w-full flex justify-between items-center">
          <GiHamburgerMenu
            className="text-4xl text-green-700 cursor-pointer"
            onClick={() => setSideDrawerOpened(true)}
          />

          <h1 className="text-sm font-bold text-green-700 leading-tight">
            තෙවන ශක්ති සංවර්ධන පදනම
          </h1>
      
          {/* Logo */}
          <img
            src="/LogoTSDF.png"
            alt="Logo"
            className="w-[70px] h-[70px] object-cover cursor-pointer"
            onClick={() => navigate("/")}
          />
      </div>

      {/* Mobile Side Drawer */}
      <div
        className={`fixed inset-0 bg-black/60  transition-opacity duration-300 ${
          sideDrawerOpened ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSideDrawerOpened(false)}
      >
        <aside
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className={`w-[280px] bg-green-700 h-full shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col justify-between ${
            sideDrawerOpened ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="h-[64px] w-full flex justify-between items-center px-4 border-b border-white">
              <GiHamburgerMenu
                className="text-4xl text-white cursor-pointer"
                onClick={() => setSideDrawerOpened(false)}
              />
            {/* <div className="p-4 flex items-center gap-3 border-b border-white/20"> */}
              <h1 className="text-white font-semibold text-lg  leading-tight" >
                {user
                  ? user.memberRole
                  : "Guest"}
              </h1>
          </div>

          {/* Drawer Nav */}
          {showLinks && (
            <nav className="flex flex-col text-white p-4 gap-5 flex-1 overflow-y-auto">
              {navLinks.map(({ path, label, icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setSideDrawerOpened(false)}
                  className={`flex items-center gap-2 text-white text-base font-semibold hover:text-gray-200 transition ${
                    location.pathname === path ? "text-blue-700 underline" : "text-gray-800"
                  }`}
                >
                  {icon} {label}
                </Link>
              ))}
            </nav>
          )}

          {/* Footer (Logout/Login) */}
          <div className="p-4 border-t border-white">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-white text-lg font-semibold w-full"
              >
                <FaSignOutAlt /> Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setSideDrawerOpened(false)}
                className="flex items-center gap-3 text-red-600 text-lg"
              >
                <FaRegUser /> Login
              </Link>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
}
