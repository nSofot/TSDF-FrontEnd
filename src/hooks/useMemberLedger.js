import { useEffect, useState } from "react";
import axios from "axios";

/* ---------------------------------------------------------------------- */
/* Number formatter (1,234.56)                                             */
/* ---------------------------------------------------------------------- */
const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function useMemberLedger(customerId, fromDate, toDate) {
  const [memberLedger, setMemberLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [balanceBF, setBalanceBF] = useState(0);
  const [receivedAm, setReceivedAm] = useState(0);
  const [spentAm, setSpentAm] = useState(0);

  useEffect(() => {
    if (!customerId || !fromDate || !toDate) return;

    const fetchMemberLedger = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/membershipTransactions/transactions/${encodeURIComponent(
            customerId
          )}`
        );

        const ledgerArray = Array.isArray(data) ? data : data?.rows || [];
        const { rows, totals } = transformMemberLedger(
          ledgerArray,
          fromDate,
          toDate
        );

        setMemberLedger(rows);
        setBalanceBF(totals.balanceBF);
        setReceivedAm(totals.receivedAm);
        setSpentAm(totals.spentAm);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch member ledger data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMemberLedger();
  }, [customerId, fromDate, toDate]);

  return {
    memberLedger,
    loading,
    error,
    balanceBF,
    receivedAm,
    spentAm,
  };
}

/* ---------------------------------------------------------------------- */
/* Transform ledger + totals                                               */
/* ---------------------------------------------------------------------- */
function transformMemberLedger(data, fromDate, toDate) {
  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(toDate);
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

  if (balanceBF !== 0) {
    rows.push(
      makeRow(
        {
          transactionDate: start,
          trxId: "B/F",
          transactionType: "Balance B/F",
          description: `As At ${start.toLocaleDateString("en-GB")}`,
          isCredit: balanceBF < 0,
          trxAmount: Math.abs(balanceBF),
          createdAt: start,
        },
        running
      )
    );
  }

  let receivedAm = 0;
  let spentAm = 0;

  const mapped = inRange
    .sort(
      (a, b) =>
        new Date(a.transactionDate) - new Date(b.transactionDate)
    )
    .map((trx) => {
      const amount = Number(trx.trxAmount);

      running += !trx.isCredit ? amount : -amount;

      if (!trx.isCredit) receivedAm += amount;
      else spentAm += amount;

      return makeRow(trx, running);
    });

  return {
    rows: [...rows, ...mapped],
    totals: {
      balanceBF,
      receivedAm,
      spentAm,
    },
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
