import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner.jsx";
import { formatNumber } from "../../utils/numberFormat.js";


export default function LoanRepaymentPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingLoan, setIsLoadingLoan] = useState(false);
    const [applicantId, setApplicantId] = useState("");
    const [applicant, setApplicant] = useState({});
    const [applicantLoans, setApplicantLoans] = useState([]);
    const [loanDetails, setLoanDetails] = useState({});
    const [selectedLoanType, setSelectedLoanType] = useState("");
    const [selectedLoanId, setSelectedLoanId] = useState("");
    const [dateEnded, setDateEnded] = useState("");
    const [lastTransaction, setLastTransaction] = useState({});
    const [interest, setInterest] = useState(0);
    const [installment, setInstallment] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [receiptNo, setReceiptNo] = useState(0);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();
    
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
                        `${import.meta.env.VITE_BACKEND_URL}/api/loanTransactions/last-trx/${customerId}/${loanId}/${transactionType}`
                        );
                        if (resTrx.data) {                                                     
                            setLastTransaction(resTrx.data);
                        } else {
                            setLastTransaction({});
                            setInterest(0);
                        }
                    } catch (err) {
                        console .error("Error fetching last transaction:", err);
                    }   
                    
                    setLoanDetails(res.data);
                    setSelectedLoanType(res.data.loanType);

                    const startDate = new Date(res.data.issuedDate);

                    // calculate end date
                    const endDate = new Date(startDate);
                    endDate.setMonth(startDate.getMonth() + res.data.loanDuration);
                    setDateEnded(endDate);

                    // interest
                    setInterest(res.data.loanInterestRate || 0);

                    // regular monthly installment
                    const regInstallment = Number(res.data.amount) / Number(res.data.loanDuration) || 0;

                    // number of days since last payment
                    const dayCount = getDaysSinceLastPaid(startDate);

                    // approximate number of months passed
                    const monthsDiff = Math.floor(dayCount / 30);

                    // total due so far
                    const dueAmount = regInstallment * monthsDiff;

                    // amount already paid
                    const paidSoFar = Number(res.data.amount) - Number(res.data.dueAmount) || 0;

                    // remaining due installments
                    const dueInstallments = regInstallment + (dueAmount - paidSoFar);

                    // set installment (never negative)
                    setInstallment(dueInstallments > 0 ? dueInstallments.toFixed(2) : 0);
                
                } else {
                    setLoanDetails({});
                    setDateEnded("");
                    setLastTransaction({});
                    setInterest(0);
                }

            } catch (err) {
                toast.error(err.response?.data?.message || "Loan details not found");
            } finally {
                setIsLoadingLoan(false);
            }
        };

        fetchLoanDetails();
    }, [selectedLoanId]);

    
    function getDaysSinceLastPaid(lastPaidDate) {
        const today = new Date();
        const paidDate = new Date(lastPaidDate);

        // Difference in milliseconds
        const diffMs = today.getTime() - paidDate.getTime();

        // Convert to full days
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    useEffect(() => {     
        const lastPaidDate = lastTransaction && lastTransaction.createdAt ? new Date(lastTransaction.createdAt) : loanDetails.issuedDate ? new Date(loanDetails.issuedDate) : null;               
        const days = lastPaidDate ? getDaysSinceLastPaid(lastPaidDate) : 0;
        const interestPerMonth = ((loanDetails.dueAmount || 0) * (loanDetails.loanInterestRate || 0)) / 100;
        const interestPerDay = interestPerMonth / 30;
        const calculatedInterest = (days * interestPerDay).toFixed(2);  
        const total = parseFloat(calculatedInterest || 0) + parseFloat(installment || 0); 
        setInterest(calculatedInterest);      
        setTotalAmount(total);
    }, [interest, installment]);


    // function VoucherInput() {
    const checkVoucherExists = async (no) => {
        try {
          const trxType = "receipt";
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/bookReferences/trxbook/${no}/${trxType}`
          );
          if (res.data.exists) {
            setError("🚨 This voucher number already exists!");
          } else {
            setError("");
          }
        } catch (err) {
          console.error("Error checking voucher:", err);
          setError("⚠️ Error validating voucher");
        }
    };  


    const handleSave = async () => {
        setIsSubmitting(true);

        if (!applicantId || applicantId === "0") {
            toast.error("වලංගු නොවන අයදුම්කරු අංකයක්");
            setIsSubmitting(false);
            return;
        }

        if (!receiptNo) {
            toast.error("කරුණාකර ලදුපත් අංකයක් ඇතුළත් කරන්න.");
            setIsSubmitting(false);
            return;
        }

        if (error) {
            toast.error(error);
            setIsSubmitting(false);
            return;
        }

        let lgAcIdCr = "";
        const lgAcIdDr = "325-0001";
        const referenceNo = loanDetails.loanId;
        let newReferenceNo = "";

        switch (selectedLoanType) {
            case "Welfare Loan":
                lgAcIdCr = "211-0003"; break;
            case "Short Term Loan":
                lgAcIdCr = "211-0004"; break;
            case "Long Term Loan":
                lgAcIdCr = "211-0005"; break;
            case "Project Loan":
                lgAcIdCr = "211-0006"; break;
            default:
                toast.error("Invalid loan type");
                setIsSubmitting(false);
                return;
        }

        try {
             //1️⃣ create loan transaction
             try {
                const loanTrxPayload = {
                    trxBookNo: receiptNo,
                    loanId: selectedLoanId,
                    customerId: applicantId,
                    transactionDate: new Date(),
                    interest: parseFloat(interest) || 0,
                    installment: parseFloat(installment) || 0,
                    totalAmount: parseFloat(totalAmount) || 0,
                    transactionType: "receipt", 
                    isCredit: true,
                    description: selectedLoanType
                 };
                const res = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/loanTransactions`,
                    loanTrxPayload
                );
                newReferenceNo = res.data.transaction.trxNumber; 
            } catch (error) {
                console.log('1️⃣⚠️ create loan transaction error: ', error);
            }

            //2️⃣create loan master
            try {
                const loanMasterpayload = {
                    dueAmount: Math.max((loanDetails.dueAmount || 0) - (installment || 0), 0),
                }
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/update/${referenceNo}`, loanMasterpayload);
            } catch (error) {
                console.log('2️⃣⚠️ create loan master error: ', error);
            }

 
            //3️⃣update cash book
            try {
                const payload = {
                    updates: [
                        {
                        accountId: lgAcIdDr,
                        amount: parseFloat(totalAmount) || 0
                        }
                    ]
                };
                await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts/add-balance`,
                    payload

                );
            } catch (error) {
              console.log("3️⃣⚠️ update cash book error: ", error);
            }

            //4️⃣create cash book transaction
            try {
                const accTrxPayload = {
                    trxId: String(newReferenceNo),
                    trxBookNo: String(receiptNo).padStart(6, "0"),
                    trxDate: new Date().toISOString(),
                    transactionType: "receipt",
                    accountId: lgAcIdDr,
                    description: `${selectedLoanType} ${applicant?.name || ""}`,
                    isCredit: false,
                    trxAmount: parseFloat(totalAmount) || 0
                };
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerTransactions`, accTrxPayload);
            } catch (error) {
                console.error("4️⃣⚠️ create cash book transaction error:", error.response?.data || error.message);
            }


            //5️⃣update loan account
            try {
                const payload = {
                    updates: [
                        {
                        accountId: lgAcIdCr,
                        amount: parseFloat(installment) || 0
                        }
                    ]
                };
                await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts/subtract-balance`,
                    payload
                );
            } catch (error) {
              console.log("5️⃣⚠️ update loan account error: ", error);
            }

            //6️⃣create cash book transaction
            try {
                const accTrxPayload = {
                    trxId: newReferenceNo,
                    trxBookNo: receiptNo,
                    trxDate: new Date().toISOString(),
                    transactionType: "receipt",
                    accountId: lgAcIdCr,
                    description: selectedLoanType + " " + applicant.name,
                    isCredit: true,
                    trxAmount: installment
                }                         
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerTransactions`, accTrxPayload);
            } catch (error) {
                console.log('6️⃣⚠️ create loan account transaction error: ', error); 
            }   
            
            //7️⃣create book reference
            try {
                const refPayload = {
                    referenceType: "receipt",
                    bookNo: receiptNo,
                    trxReference: newReferenceNo
                };
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/bookReferences`, refPayload);
            } catch (error) {
                console.log('3️⃣⚠️ create book reference error: ', error);
            }

            toast.success("🎉 කුවිතාන්සිය සාර්ථකව ඉදිරිපත් කළා!");
            setIsSubmitted(true); // ✅ only on success
        } catch (error) {
            console.error("⚠️ Submit failed:", error);
            toast.error("❌ රිසිට්පත ඉදිරිපත් කිරීමට අසමත් විය. කරුණාකර නැවත උත්සාහ කරන්න.");
        } finally {
            setIsSubmitting(false); // ✅ always reset
        }
    };

    return (
        <div className="max-w-5xl w-full h-full flex flex-col space-y-6 overflow-hidden">
            {/* Header */}
            <div className="text-center border-b pb-2 space-y-1">
                <h1 className="text-lg md:text-2xl font-bold text-gray-800">🧾 ණය ආපසු ගෙවීම</h1>
                <p className="text-sm text-gray-600">
                    ණය වාරික සහ පොලී ගෙවීම් පිළිබඳ විස්තර සහ ගෙවීම් සිදුකිරීම.
                </p>
            </div>

            <div className="bg-white shadow rounded-md max-h-[calc(100vh-230px)] space-y-8 overflow-y-auto">
         
                {/* Applicant Card */}
                <div className="bg-white shadow-md rounded-xl border-l-6 border-blue-500 p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-blue-500 mb-1">
                            සාමාජික අංකය
                        </label>
                        <input
                            type="text"
                            className="w-full border border-blue-300 rounded-lg p-3 text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    </div>

                    {isLoading ? (
                        <LoadingSpinner />
                    ) : applicantLoans && applicantLoans.length > 0 ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-500 mb-1">
                                    සාමාජිකයාගේ නම
                                </label>
                                <div className="w-full bg-purple-50 border border-blue-300 rounded-lg p-3 text-center font-medium text-blue-500">
                                    {applicant?.name || ""}
                                </div>
                            </div>

                            {/* Loan Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-blue-500 mb-1">
                                    ණය ගිණුම තෝරා ගන්න
                                </label>
                                <select
                                    className="w-full p-3 text-blue-500 rounded-lg border border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <p className="text-center text-blue-500">ණය ගිණුමක් සොයාගත නොහැක.</p>
                    )}
                </div>

                {/* Loan Details */}
                {isLoadingLoan ? (
                <LoadingSpinner />
                ) : loanDetails && loanDetails.loanId ? (
                    <div className="bg-white shadow-md rounded-xl border-l-6 border-pink-500 p-6 space-y-3">
                        <h2 className="font-semibold text-pink-500">📊 ණය විස්තර</h2>
                        <div className="space-y-2 text-sm text-pink-500">
                            <div className="flex justify-between">
                                <span>ලබාගත් ණය මුදල:</span>
                                <span className="font-medium">{formatNumber(loanDetails.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>ගෙවීමට නියමිත ශේෂය:</span>
                                <span className="font-medium">{formatNumber(loanDetails.dueAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>මාසික පොලී අනුපාතය:</span>
                                <span>{loanDetails.loanInterestRate}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>වාරික ගණන:</span>
                                <span>{loanDetails.loanDuration}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>ණය නිකුත් කළ දිනය:</span>
                                <span>{new Date(loanDetails.issuedDate).toLocaleDateString("uk")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>අවසන් කළ යුතු දිනය:</span>
                                <span>{new Date(dateEnded).toLocaleDateString("uk")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>අවසන් ගෙවීම් දිනය:</span>
                                <span>
                                    {lastTransaction?.createdAt
                                    ? new Date(lastTransaction.createdAt).toLocaleDateString("uk")
                                    : "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : null}

                    {/* Payment Section */}
                    {loanDetails && loanDetails.loanId ? (
                    <>
                        <div className="bg-white shadow-md rounded-xl border-l-6 border-orange-500 p-6 space-y-4">
                            <h2 className="font-semibold text-orange-500">💰 ගෙවීම් විස්තර</h2>

                            <div>
                                <label className="block text-sm text-orange-500 mb-1">අදාළ පොලිය</label>
                                <input
                                type="number"
                                value={interest}
                                readOnly
                                className="w-full p-3 border border-orange-300 rounded-lg text-orange-500 text-right focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-orange-500 mb-1">අදාළ වාරිකය</label>
                                <input
                                    type="number"
                                    value={installment}
                                    onChange={(e) => setInstallment(e.target.value)}
                                    className="w-full p-3 border border-orange-300 rounded-lg text-orange-500 text-right focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div className="flex justify-between items-center text-orange-500 border border-orange-300 rounded-lg p-3 bg-orange-50 text-lg font-semibold pt-3">
                                <span>මුළු ගෙවීම්:</span>
                                <span>{formatNumber(totalAmount)}</span>
                            </div>

                            <div>
                                <label className="block text-sm text-orange-500 mb-1">රිසිට් අංකය</label>
                                <input
                                    type="text"
                                    className={`w-full p-3 rounded-lg text-orange-500 text-center border ${
                                        error ? "border-red-500" : "border-gray-300"
                                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                    value={receiptNo}
                                    placeholder="000000"
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        setReceiptNo(val);
                                    }}
                                    onBlur={() => {
                                        const formatted = String(receiptNo).padStart(6, "0");
                                        setReceiptNo(formatted);
                                        if (formatted !== "000000") checkReceiptExists(formatted);
                                    }}
                                    maxLength={6}
                                />
                                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4 mt-6">
                            <button
                                disabled={isSubmitting || isSubmitted}
                                onClick={async () => {
                                setIsSubmitting(true);
                                await handleSave();
                                }}
                                className={`w-full h-12 rounded-lg font-semibold text-white transition ${
                                !isSubmitting && !isSubmitted
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-gray-400 cursor-not-allowed"
                                }`}
                            >
                                {isSubmitting
                                ? "ගෙවීම ඉදිරිපත් කරයි..."
                                : isSubmitted
                                ? "✅ ගෙවීම් සම්පූර්ණයි"
                                : "තහවුරු කරන්න"}
                            </button>

                            <button
                                onClick={() => navigate(-1)}
                                className="w-full h-12 hover:bg-gray-700 text-gray-700 rounded-lg border border-gray-700 font-semibold transition mb-6"
                            >
                                ආපසු යන්න
                            </button>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};