import { useEffect, useState } from "react";
import axios from "axios";

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
          `${import.meta.env.VITE_BACKEND_URL}/api/membershipTransactions/transactions/${encodeURIComponent(customerId)}`
        );

        const ledgerArray = Array.isArray(data) ? data : data.rows || [];
        const { rows, totals } = transformMemberLedger(ledgerArray, fromDate, toDate);

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

  return { memberLedger, loading, error, balanceBF, receivedAm, spentAm };
}

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

  const balanceBF = beforeStart.reduce(
    (sum, t) => sum + (!t.isCredit ? t.trxAmount : -t.trxAmount),
    0
  );

  let rows = [];
  let running = balanceBF;

  if (balanceBF !== 0) {
    rows.push(
      makeRow(
        {
          transactionDate: start,
          trxId: "B/F",
          transactionType: "Balance B/F",
          description: "As At " + start.toLocaleDateString("en-GB"),
          isCredit: balanceBF < 0,
          trxAmount: Math.abs(balanceBF),
          createdAt: start,
        },
        balanceBF
      )
    );
  }

  let receivedAm = 0;
  let spentAm = 0;

  const mapped = inRange
    .sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate))
    .map((trx) => {
      running += !trx.isCredit ? trx.trxAmount : -trx.trxAmount;
      if (!trx.isCredit) receivedAm += trx.trxAmount;
      else spentAm += trx.trxAmount;
      return makeRow(trx, running);
    });

  return {
    rows: [...rows, ...mapped],
    totals: { balanceBF, receivedAm, spentAm },
  };
}

function makeRow(trx, runningBalance) {
  const isCredit = trx.isCredit;
  return {
    date: new Date(trx.transactionDate).toLocaleDateString("en-GB"),
    trxId: trx.trxBookNo || trx.trxId,
    trxType: trx.transactionType || "",
    description: trx.description || "",
    debit: !isCredit
      ? trx.trxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })
      : "0.00",
    credit: isCredit
      ? trx.trxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })
      : "0.00",
    balance: runningBalance.toLocaleString("en-US", { minimumFractionDigits: 2 }),
    createdAt: new Date(trx.createdAt),
  };
}
