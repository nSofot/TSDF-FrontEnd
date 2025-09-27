import { Routes, Route, Outlet } from "react-router-dom";
import HeaderControl from "../components/headerControl";
import ControlHomePage from "./control/controlHomePage";
import MembersPage from "./control/membersPage";
import ApplyLoanPage from "./control/applyLoanPage";
import ApproveLoanPage from "./control/approveLoan";
import LoanGrantPage from "./control/loanGrantPage";
import ReceiptLoanPage from "./control/receiptLoanPage";
import ReceiptMembershipPage from "./control/receiptMembershipPage";
import CashBook from "./control/cashRegister";
import LedgerLoan from "./control/ledgerLoan";

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
  return (
    <Routes>
      <Route path="*"                     element={<Layout />}>
        <Route index                      element={<ControlHomePage />} />
        <Route path="members"             element={<MembersPage />} />
        <Route path="apply-loan"          element={<ApplyLoanPage />} />
        <Route path="approve-loan"        element={<ApproveLoanPage />} />
        <Route path="grant-loan"          element={<LoanGrantPage />} />
        <Route path="receipts-loan"        element={<ReceiptLoanPage />} />
        <Route path="receipt-membership"  element={<ReceiptMembershipPage />} />
        <Route path="cash-book"           element={<CashBook />} />
        <Route path="ledger-loan"         element={<LedgerLoan />} />
        <Route path="contact"             element={<Contact />} />
        <Route path="overview/:Id"        element={<ProductOverview />} />
        <Route path="cart"                element={<CartPage />} />
        <Route path="checkout"            element={<CheckOutPage />} />
        <Route path="*"                   element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
