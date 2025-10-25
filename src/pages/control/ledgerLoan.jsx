import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/loadingSpinner";
import { formatNumber } from "../../utils/numberFormat.js";
import LoanLedger from "../../components/viewLoanLedger";


export default function LedgerLoanPage() {
    const [applicantId, setApplicantId] = useState("");
    const [applicant, setApplicant] = useState({});
    const [applicantLoans, setApplicantLoans] = useState([]);
    const [selectedLoanId, setSelectedLoanId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingLoan, setIsLoadingLoan] = useState(false);
    const [loanDetails, setLoanDetails] = useState({});
    const [loanTransactions, setLoanTransactions] = useState([]);

    const user = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {      
      if (user?.userId) {
        setApplicantId(user.userId);
        if (user.userId.length === 3) {
          searchApplicant(user.userId);
        }
      }
    }, [user?.userId]);


    // Mapping English loan types to Sinhala
    const loanTypeMap = {
        "Welfare Loan": "සුභසාධන ණය",
        "Short Term Loan": "කෙටි කාලීන ණය",
        "Long Term Loan": "දිගු කාලීන ණය",
        "Project Loan": "ව්යාපෘති ණය",
    };

     // Fetch applicant
    const searchApplicant = async (id) => {
        if (!id || id === "0") return;

        setIsLoading(true);
        try {
            // Fetch applicant loans
            const appRes = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/customer/${id}`
            );

            // Enrich each loan with Sinhala label
            if (appRes.data) {
            const enrichedLoans = appRes.data.map((loan) => ({
                ...loan,
                loanTypeSinhala: loanTypeMap[loan.loanType] || loan.loanType, // fallback
            }));
            setApplicantLoans(enrichedLoans);            

            // Fetch applicant details
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`
            );

            if (res.data) {
                setApplicant(res.data);
            }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Applicant not found");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch loan details when selectedLoanType changes
    useEffect(() => {
        const fetchLoanDetails = async () => {           
            if (!selectedLoanId) return;
            setIsLoadingLoan(true);
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/loan/${selectedLoanId}`
                );

                if (res.data) {
                    try {
                        const customerId = applicantId;
                        const loanId = selectedLoanId;
                        const transactionType = 'receipt';

                        const resTrx = await axios.get(
                        `${import.meta.env.VITE_BACKEND_URL}/api/loanTransactions/transactions/${loanId}`
                        );
                        if (resTrx.data) {                                                     
                            setLoanTransactions(resTrx.data);
                        } else {
                            setLoanTransactions({});
                        }
                    } catch (err) {
                        console .error("Error fetching last transaction:", err);
                    }   
                    
                    setLoanDetails(res.data);
                
                } else {
                    setLoanDetails({});
                    setLoanTransactions([]);
                }

            } catch (err) {
                toast.error(err.response?.data?.message || "Loan details not found");
            } finally {
                setIsLoadingLoan(false);
            }
        };

        fetchLoanDetails();
    }, [selectedLoanId]);


    return (
        <div className="flex flex-col  max-w-5xl mx-auto min-h-screen">
            {/* HEADER */}
            <div className="p-4 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-lg md:text-2xl font-bold text-orange-600">💵 ණය ලෙජරය</h1>
                    <p className="text-xs">සියලුම ණය ගනුදෙනු සහ ශේෂයන් නිරීක්ෂණය කරන්න</p>
                </div>
            </div>

            {/* Applicant Card */}
            <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-indigo-500 mt-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        සාමාජික අංකය
                    </label>

                    {user.memberRole === "manager" 
                    || user.memberRole === "admin" 
                    || user.memberRole === "chairman"
                    || user.memberRole === "secretary"
                    || user.memberRole === "treasurer" ? (
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-3 text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="000"
                            maxLength={3}
                            value={applicantId}
                            onChange={async (e) => {
                                const value = e.target.value;
                                setApplicantId(value);
                                if (value.length === 3) {
                                await searchApplicant(value);
                                }
                            }}
                        />
                    ) : (
                          <input
                            type="text"
                            className="border border-indigo-300 rounded-lg p-2 w-full md:w-24 text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            maxLength={3}
                            value={applicantId}
                            readOnly
                          />
                    )}                    
                </div>

                {isLoading ? (
                    <LoadingSpinner />
                ) : applicantLoans && applicantLoans.length > 0 ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                සාමාජිකයාගේ නම
                            </label>
                            <div className="w-full bg-purple-50 border border-purple-200 rounded-lg p-3 text-center font-medium text-purple-700">
                                {applicant?.nameSinhala || applicant?.name || ""}
                            </div>
                        </div>

                        {/* Loan Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ණය ගිණුම තෝරා ගන්න
                            </label>
                            <select
                                className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={selectedLoanId}
                                onChange={(e) => setSelectedLoanId(e.target.value)}
                            >
                                <option value="">Select Loan Type</option>
                                    {applicantLoans.map((loan) => (
                                    <option
                                        key={loan.id || loan._id}
                                        value={loan.loanId || loan.loanId}
                                    >
                                        {loan.loanTypeSinhala}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">ණය ගිණුමක් සොයාගත නොහැක.</p>
                )}
            </div>
                
            {isLoadingLoan ? (
                <LoadingSpinner />
            ) : loanTransactions && loanTransactions.length > 0 ? (
                <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-green-600 mt-6">

                    <div className="flex justify-between w-full bg-green-50 border border-green-200 rounded-lg text-center font-medium text-green-600">
                        <label className="block text-sm font-medium">
                            ගිණුම් ශේෂය
                        </label>
                        Rs. {formatNumber(loanDetails?.dueAmount) || ""}
                    </div>
                    <LoanLedger loanId={loanDetails.loanId} />
                </div>
            ) : (
                <p className="text-center text-gray-500 mt-6">ණය ගනුදෙනු සොයාගත නොහැක.</p>
            )}
        </div>
    );
}
