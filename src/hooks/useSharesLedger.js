import { useEffect, useState } from "react";
import axios from "axios";

/* ---------------------------------------------------------------------- */
/* Number formatter (1,234.56)                                             */
/* ---------------------------------------------------------------------- */
const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/* ---------------------------------------------------------------------- */
/* Hook                                                                   */
/* ---------------------------------------------------------------------- */
export function useSharesLedger(customerId) {
  const [sharesLedger, setSharesLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerId) return;

    const fetchSharesLedger = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/sharesTransactions/transactions/${encodeURIComponent(
            customerId
          )}`
        );

        const ledgerArray = Array.isArray(data) ? data : data?.rows || [];
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
/* Transform ledger + running balance                                     */
/* ---------------------------------------------------------------------- */
function transformSharesLedger(data) {
  // Start: January 1st, 2024
  const start = new Date(2024, 0, 1); // year, month (0 = Jan), day
  start.setHours(0, 0, 0, 0);


  // End: Today
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const beforeStart = [];
  const inRange = [];

  for (const trx of data) {
    const d = new Date(trx.transactionDate);
    if (d < start) beforeStart.push(trx);
    else if (d <= end) inRange.push(trx);
  }

  // Balance B/F
  const balanceBF = beforeStart.reduce(
    (sum, t) =>
      sum + (!t.isCredit ? Number(t.trxAmount) : -Number(t.trxAmount)),
    0
  );

  let rows = [];
  let running = Number(balanceBF);

  // Balance B/F row
  if (balanceBF !== 0) {
    rows.push(
      makeRow(
        {
          transactionDate: start,
          trxBookNo: "B/F",
          transactionType: "Balance B/F",
          description: `As at ${start.toLocaleDateString("en-GB")}`,
          isCredit: balanceBF < 0,
          trxAmount: Math.abs(balanceBF),
          createdAt: start,
        },
        running
      )
    );
  }

  // Sort and map transactions
  const mapped = inRange
    .sort(
      (a, b) =>
        new Date(a.transactionDate) - new Date(b.transactionDate)
    )
    .map((trx) => {
      running += !trx.isCredit
        ? Number(trx.trxAmount)
        : -Number(trx.trxAmount);

      return makeRow(trx, running);
    });

  return {
    rows: [...rows, ...mapped],
  };
}

/* ---------------------------------------------------------------------- */
/* Create a ledger row                                                     */
/* ---------------------------------------------------------------------- */
function makeRow(trx, runningBalance) {
  const isCredit = trx.isCredit;

  return {
    date: new Date(trx.transactionDate).toLocaleDateString("en-GB"),
    trxId: trx.trxBookNo || trx.trxId || "",
    trxType: trx.transactionType || "",
    description: trx.description || "",

    debit: !isCredit
      ? numberFormatter.format(Number(trx.trxAmount))
      : "0.00",

    credit: isCredit
      ? numberFormatter.format(Number(trx.trxAmount))
      : "0.00",

    balance: numberFormatter.format(Number(runningBalance)),

    createdAt: new Date(trx.createdAt),
  };
}
