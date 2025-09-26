import { useEffect, useState } from "react";
import axios from "axios";

/**
 * React hook that returns a cash‑book ready for display.
 *
 * @param {string} loanId   – account number (e.g. "325‑0001")
 *
 * @returns {object} { cashbook, loading, error }
 */
export function useLoanLedger(loanId) {
  const [loanLedger, setLoanLedger] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    // wait until all required props are present
    if (!loanId) return;

    const fetchLoanLedger = async () => {
      setLoading(true);
      setError(null);
      try {
        /* 1️⃣  Load every transaction for the account */
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/loanTransactions/transactions/${loanId}`
        );

        /* 2️⃣  Transform + filter + balance in one go */
        const rows = transformLoanLedger(data);

        setLoanLedger(rows);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch cash‑book data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoanLedger();
  }, [loanId]);

  return { loanLedger, loading, error };
}

/* ---------------------------------------------------------------------- */
/* Helper: massage the raw data into table rows                           */
/* ---------------------------------------------------------------------- */
function transformLoanLedger(data) {

  /* 🔹 Split data into “before start” and “in range” */
  const inRange     = [];

  for (const trx of data) {
    const d = new Date(trx.trxDate);
    inRange.push(trx);
  }

  let rows = [];
  let running = 0;

  /* 🔹 Map in-range rows, sorted ascending, with running balance */
  const mapped = inRange
    .sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate))
    .map(trx => {

    const isCredit = trx.isCredit;
    const amount = trx.transactionType === 'receipt' ? trx.installment : trx.totalAmount
          
      running += !isCredit ?  amount : -amount;
      return makeRow(trx, running);
    });

  /* 🔹 Reverse so newest appears first (UI preference) */
  return [...rows, ...mapped];
}

/* ---------------------------------------------------------------------- */
/* Helper: build one display‑ready row                                    */
/* ---------------------------------------------------------------------- */
function makeRow(trx, runningBalance) {
  const isCredit = trx.isCredit;
  const amount = trx.transactionType === 'receipt' ? trx.installment : trx.totalAmount

  return {
    date       : new Date(trx.transactionDate).toLocaleDateString("en-GB"),     // dd/mm/yyyy
    trxId      : trx.trxBookNo,
    trxType    : trx.transactionType || "",
    interest   : trx.interest || 0,
    debit      : isCredit ?  amount.toLocaleString("en-US", { minimumFractionDigits: 2 })
                         :  "0.00",
    credit     : isCredit ?  "0.00"
                         :  amount.toLocaleString("en-US", { minimumFractionDigits: 2 }),
    balance    : runningBalance.toLocaleString("en-US", { minimumFractionDigits: 2 }),
    createdAt  : new Date(trx.createdAt),       // keep as Date if you need sorting
  };
}
