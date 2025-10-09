import { useEffect, useState } from "react";
import axios from "axios";


export function useSharesLedger(customerId) {
  const [sharesLedger, setSharesLedger] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (!customerId) return;

    const fetchSharesLedger = async () => {
      if (!customerId) return;

      setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/sharesTransactions/transactions/${encodeURIComponent(customerId)}`
        );

        const ledgerArray = Array.isArray(data) ? data : data.rows || [];
        const { rows } = transformSharesLedger(ledgerArray);

        setSharesLedger(rows);

      } catch (err) {
        console.error(err);
        setError("Failed to fetch shares data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSharesLedger();
  }, [customerId]);

  return { sharesLedger, loading, error };
}

/* ---------------------------------------------------------------------- */
/* Helper: transform + totals                                             */
/* ---------------------------------------------------------------------- */
function transformSharesLedger(data) {

  // Start: January 1st
  const start = new Date();
  start.setMonth(0);      // January
  start.setDate(1);       // 1st
  start.setHours(0, 0, 0, 0);

  // End: Today
  const end = new Date();
  end.setHours(23, 59, 59, 999); 

  const beforeStart = [];
  const inRange     = [];

  for (const trx of data) {
    const d = new Date(trx.transactionDate);
    if (d < start)      beforeStart.push(trx);
    else if (d <= end)  inRange.push(trx);
  }

  // 🔹 Balance B/F
  const balanceBF = beforeStart.reduce(
    (sum, t) => sum + (!t.isCredit ? t.trxAmount : -t.trxAmount),
    0
  );

  let rows = [];
  let running = balanceBF;

  if (balanceBF !== 0) {
    rows.push(makeRow({
      trxDate   : start,
      trxId     : "B/F",
      transactionType: "Balance B/F",
      description: "As At " + start.toLocaleDateString("en-GB"),
      isCredit  : balanceBF < 0,
      trxAmount : Math.abs(balanceBF),
      createdAt : start,
    }, balanceBF));
  }

  const mapped = inRange
    .sort((a, b) => new Date(a.trxDate) - new Date(b.trxDate))
    .map(trx => {
      running += !trx.isCredit ? trx.trxAmount : -trx.trxAmount;

      return makeRow(trx, running);
    });

  return {
    rows: [...rows, ...mapped],
  };
}

/* ---------------------------------------------------------------------- */
function makeRow(trx, runningBalance) {
  const isCredit = trx.isCredit;

  return {
    date       : new Date(trx.transactionDate).toLocaleDateString("en-GB"),
    trxId      : trx.trxBookNo || trx.trxId,
    trxType    : trx.transactionType || "",
    description: trx.description || "",
    debit      : !isCredit ? trx.trxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00",
    credit     : isCredit  ? trx.trxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00",
    balance    : runningBalance.toLocaleString("en-US", { minimumFractionDigits: 2 }),
    createdAt  : new Date(trx.createdAt),
  };
}
