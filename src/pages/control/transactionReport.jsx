import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { formatNumber } from "../../utils/numberFormat.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Reports() {
    const printRef = useRef();

    const [dateFrom, setDateFrom] = useState(() => {
        const now = new Date();
        const firstOfYear = new Date(now.getFullYear(), 0, 1);
        return firstOfYear.toLocaleDateString("en-CA");
    });

    const [dateTo, setDateTo] = useState(() => {
        const now = new Date();
        const lastOfYear = new Date(now.getFullYear(), 11, 31);
        return lastOfYear.toLocaleDateString("en-CA");
    });

    const [transactions, setTransactions] = useState([]);
    const [transactionType, setTransactionType] = useState("all");
    const [cashBookType, setCashBookType] = useState("all");
    const [isGenerating, setIsGenerating] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const navigate = useNavigate();

    const GenerateReport = async () => {
        setIsGenerating(true);
        setTransactions([]);

        try {
            const response = await axios.get(import.meta.env.VITE_BACKEND_URL + "/api/ledgerTransactions");

            let dataArray = Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data.data)
                ? response.data.data
                : [];

            // ✅ Filter by cash book type
            if (cashBookType !== "all") {
                dataArray = dataArray.filter(
                    (transaction) => transaction.accountId === cashBookType
                );
            }

            // ✅ Filter by transaction type
            if (transactionType !== "all") {
                dataArray = dataArray.filter(
                    (transaction) => transaction.transactionType === transactionType
                );
            }

            // ✅ Filter by date range
            const from = new Date(dateFrom);
            const to = new Date(dateTo);
            dataArray = dataArray.filter((transaction) => {
                const trxDate = new Date(transaction.trxDate);
                return trxDate >= from && trxDate <= to;
            });

            if (dataArray.length === 0) {
                toast.error("No transactions found for this period");
                setIsGenerating(false);
                return;
            }

            // ✅ Sort by trxBookNo (numerically or alphabetically)
            dataArray.sort((a, b) => {
                const aNum = Number(a.trxBookNo);
                const bNum = Number(b.trxBookNo);
                if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum; // numeric sort
                return (a.trxBookNo || "").localeCompare(b.trxBookNo || ""); // fallback to string sort
            });

            setTransactions(dataArray);

            const total = dataArray.reduce((sum, trx) => sum + Number(trx.trxAmount || 0), 0);
            setTotalAmount(total);

            toast.success(`Report generated: ${dataArray.length} transactions`);
        } catch (e) {
            console.error(e);
            toast.error(e?.response?.data?.message || "Failed to generate report");
        } finally {
            setIsGenerating(false);
        }
    };


    const exportToExcel = () => {
        if (!transactions || transactions.length === 0) {
            toast.error("No transactions to export");
            return;
        }

        const excelData = transactions.map((trx, index) => ({
            "#": index + 1,
            "Ref/No": trx.trxBookNo,
            "Date": new Date(trx.trxDate).toLocaleDateString("en-GB"),
            "Category": trx.transactionCategory,
            "Details": trx.description,
            "Amount": trx.trxAmount,
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, "transactions_report.xlsx");
    };

    return (
        <div className="w-full min-h-screen flex flex-col bg-gray-100 rounded-md px-4 md:px-12 py-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                <div className="flex flex-col">
                    <h1 className="text-lg md:text-xl font-semibold text-gray-800">
                        📥📗 Transaction Reports
                    </h1>
                    <p className="text-sm text-gray-600">
                        Generate and download all transaction reports from here.
                    </p>
                </div>
                <button
                    onClick={exportToExcel}
                    className="bg-yellow-600 text-white px-3 py-2 text-sm md:text-base rounded hover:bg-yellow-700 transition"
                >
                    Export Excel
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-md flex flex-col md:flex-row justify-between w-full p-4 gap-4 md:items-end">
                <div className="flex flex-col w-full md:w-1/4">
                    <label className="text-sm font-medium mb-1">Date from:</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-blue-600"
                    />
                </div>

                <div className="flex flex-col w-full md:w-1/4">
                    <label className="text-sm font-medium mb-1">Date to:</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-blue-600"
                    />
                </div>

                <div className="flex flex-col w-full md:w-1/4">
                    <label className="text-sm font-medium mb-1">Transaction type:</label>
                    <select
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-blue-600"
                    >
                        <option value="all">All</option>
                        <option value="receipt">Income</option>
                        <option value="voucher">Expense</option>
                    </select>
                </div>

                <div className="flex flex-col w-full md:w-1/4">
                    <label className="text-sm font-medium mb-1">Cash Book type:</label>
                    <select
                        value={cashBookType}
                        onChange={(e) => setCashBookType(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-blue-600"
                    >
                        <option value="all">All</option>
                        <option value="325-0001">Manager</option>
                        <option value="325-0002">Treasurer</option>
                    </select>
                </div>

                <button
                    disabled={isGenerating}
                    onClick={GenerateReport}
                    className={`w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition ${
                        isGenerating ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    {isGenerating ? "Generating..." : "Generate"}
                </button>
            </div>

            {/* Table Section */}
            <div ref={printRef} className="mt-6 w-full overflow-x-auto">
                <h1 className="text-center text-base md:text-lg font-bold">
                    Thewana Shakthi Development Foundation
                </h1>
                <h2 className="text-center text-base md:text-lg font-bold">
                    Transactions Report
                </h2>
                <p className="text-center text-xs md:text-sm font-semibold mt-1">
                    For the period of: {dateFrom} to {dateTo}
                </p>

                <table className="min-w-full border-collapse mt-3">
                    <thead className="bg-gray-200">
                        <tr>
                            {["#", "Ref/No", "Date", "Category", "Details", "Amount"].map((col) => (
                                <th
                                    key={col}
                                    className="text-left text-[10px] md:text-sm font-semibold p-2 border-b"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((trx, index) => (
                            <tr
                                key={`${trx.trxId || trx.trxBookNo || trx.trxDate}-${index}`}
                                className="odd:bg-white even:bg-gray-50"
                            >
                                <td className="text-[10px] md:text-sm p-2">{index + 1}</td>
                                <td className="text-[10px] md:text-sm p-2">{trx.trxBookNo}</td>
                                <td className="text-[10px] md:text-sm p-2">
                                    {new Date(trx.trxDate).toLocaleDateString("en-GB")}
                                </td>
                                <td className="text-[10px] md:text-sm p-2">{trx.transactionCategory}</td>
                                <td className="text-[10px] md:text-sm p-2">{trx.description}</td>
                                <td className="text-[10px] md:text-sm p-2 text-right">
                                    {formatNumber(trx.trxAmount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {transactions.length > 0 && (
                        <tfoot>
                            <tr className="font-bold border-t">
                                <td colSpan="5" className="text-right text-[10px] md:text-sm p-2">
                                    Total
                                </td>
                                <td className="text-right text-[10px] md:text-sm p-2">
                                    {formatNumber(totalAmount)}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>

                <p className="text-right text-[10px] md:text-sm mt-3">
                    Printed on: {new Date().toLocaleDateString()}
                </p>
            </div>
        </div>
    );
}
