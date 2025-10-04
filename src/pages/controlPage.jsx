import { Routes, Route, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import HeaderControl from "../components/headerControl";
import ControlHomePage from "./control/controlHomePage";
import MembersPage from "./control/membersPage";
import ApplyLoanPage from "./control/applyLoanPage";
import ApproveLoanPage from "./control/approveLoan";
import LoanGrantPage from "./control/loanGrantPage";
import LoanRepaymentPage from "./control/loanRepayment";
import ReceiptMembershipPage from "./control/receiptMembershipPage";
import CashBook from "./control/cashRegister";
import LedgerLoan from "./control/ledgerLoan";
import FundTransferPage from "./control/fundTransferPage";

import ProductOverview from "./client/productOverview";
import CartPage from "./client/cart";
import CheckOutPage from "./client/checkOut";
import Contact from "./client/contact";
import NotFoundPage from "./notFoundPage";

function Layout() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <HeaderControl />
      <main className="w-full flex-grow flex flex-col items-center px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default function ControlPage() {
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("token");

    if (!token) {
      setStatus("unauthenticated");
      toast.error("Please login");
      navigate("/login", { replace: true });
      return;
    }

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/user/`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
      .then((res) => {
        const role = res.data.memberRole?.toLowerCase();
        const allowedRoles = ["admin", "chairman", "secretary", "treasurer", "manager"];

        if (!allowedRoles.includes(role)) {
          setStatus("unauthorized");
          toast.error("Unauthorized access");
          navigate("/", { replace: true });
        } else {
          setStatus("authenticated");
        }
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setStatus("unauthenticated");
          toast.error("Session expired. Please login again");
          navigate("/login", { replace: true });
        }
      });

    return () => controller.abort();
  }, [navigate]);

  if (status === "loading") {
    return <p className="text-center mt-10 text-lg font-semibold">Loading...</p>;
  }

  return (
    <Routes>
      <Route path="*" element={<Layout />}>
        <Route index element={<ControlHomePage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="apply-loan" element={<ApplyLoanPage />} />
        <Route path="approve-loan" element={<ApproveLoanPage />} />
        <Route path="grant-loan" element={<LoanGrantPage />} />
        <Route path="loan-repayment" element={<LoanRepaymentPage />} />
        <Route path="receipt-membership" element={<ReceiptMembershipPage />} />
        <Route path="cash-book" element={<CashBook />} />
        <Route path="ledger-loan" element={<LedgerLoan />} />
        <Route path="fund-transfer" element={<FundTransferPage />} />
        <Route path="contact" element={<Contact />} />
        <Route path="overview/:Id" element={<ProductOverview />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckOutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
