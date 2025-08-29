import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatNumber } from "../../utils/numberFormat.js";
import { a } from "framer-motion/client";


export default function LoanGrantPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const token = localStorage.getItem("token");

    const [applicantId, setApplicantId] = useState("");
    const [applicant, setApplicant] = useState({});
    const [applicantLoans, setApplicantLoans] = useState([]);
    const [selectedLoanType, setSelectedLoanType] = useState("");
    const [amount, setAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [interest, setInterest] = useState("");
    const [duration, setDuration] = useState("");
    const [maxDuration, setMaxDuration] = useState("");
    const [firstInstallment, setFirstInstallment] = useState("");
    const [firstGuranter, setFirstGuaranter] = useState("");
    const [secondGuranter, setSecondGuaranter] = useState("");
    const [firstGuranterId, setFirstGuranterId] = useState("");
    const [secondGuranterId, setSecondGuranterId] = useState("");
    const [firstGuranterLoans, setFirstGuranterLoans] = useState([]);
    const [secondGuranterLoans, setSecondGuranterLoans] = useState([]);
    const [isEligible, setIsEligible] = useState(false);

    const loanTypes = [
        "Welfare Loan",
        "Short Term Loan",
        "Long Term Loan",
        "Project Loan"
    ];


    const searchApplicant = async (id) => {
        if (!id || id === "0") {
            console.warn("Invalid customer ID");
            return;
        }
        setIsLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`);
            setApplicant(res.data);
            const loan = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/pending/${id}`);
            setApplicantLoans(loan.data);
        } catch (err) {
            // console.error("Search failed:", err.response?.status, err.response?.data);
            toast.error(err.response?.data?.message || "Applicant not found");
        } finally {
            setIsLoading(false);
        }
    };


    const searchFirstGuranter = async (id) => {
        if (!id || id === "0") {
            console.warn("Invalid member ID");
            return;
        }
        setIsLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`);
            setFirstGuaranter(res.data);
            const loan = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/pending/${id}`);
            setFirstGuranterLoans(loan.data);
        } catch (err) {
            // console.error("Search failed:", err.response?.status, err.response?.data);
            toast.error(err.response?.data?.message || "Member not found");
        } finally {
            setIsLoading(false);
        }
    };


    const searchSecondGuranter = async (id) => {
        if (!id || id === "0") {
            console.warn("Invalid member ID");
            return;
        }
        setIsLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`);
            setSecondGuaranter(res.data);
            const loan = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/pending/${id}`);
            setSecondGuranterLoans(loan.data);
        } catch (err) {
            // console.error("Search failed:", err.response?.status, err.response?.data);
            toast.error(err.response?.data?.message || "Member not found");
        } finally {
            setIsLoading(false);
        }
    };    

    const setInstallments = (selectedLoanType) => {
        setIsEligible(false);
        setDuration("");
        setAmount("");
        if (selectedLoanType === "Welfare Loan") {
            setMaxDuration(2);
            setInterest(5);
            setMaxAmount(applicant.shares * 40 / 100);
        } else if (selectedLoanType === "Short Term Loan") {
            // setDuration(12);
            setMaxDuration(12);
            setInterest(2.5);
            setMaxAmount(applicant.shares * 70 / 100);
        } else if (selectedLoanType === "Long Term Loan") {
            // setDuration(24);
            setMaxDuration(24);
            setInterest(1.5);
            setMaxAmount(applicant.shares * 150 / 100);
        } else if (selectedLoanType === "Project Loan") {
            // setDuration(48);
            setInterest(1.5);
            setMaxAmount(200000);
        }
    };


    useEffect(() => {
        // setInstallments(selectedLoanType); 
        if (amount>0 && duration>0 && interest>0) {      
            setFirstInstallment(((amount / duration) + (amount * (interest / 100))).toFixed(2));
        } else {
            setFirstInstallment("");
        }
    }, [selectedLoanType, amount, duration]);


    const validateLoanGrant = () => {      
        setIsEligible(false);
        if (!applicantId) {
            return toast.error("Please submit the Applicant ID first to proceed.");
        }
        if (!selectedLoanType) {
            return toast.error("Please select a Loan Type to continue.");
        }
        if (!amount) {
            return toast.error("Please enter the Loan Amount to proceed.");
        }
        if (!duration) {
            return toast.error("Please enter the repayment duration to proceed.");
        }      
        if (selectedLoanType === "Long Term Loan" || selectedLoanType === "Project Loan") {           
            if (!firstGuranterId || !secondGuranterId) {
                return toast.error("Please provide guarantor details to proceed.");
            }
            if (firstGuranterId === secondGuranterId) {
                return toast.error("First Guarantor and Second Guarantor cannot be the same person.");
            }
            if (secondGuranterId === applicantId || secondGuranterId  === applicantId) {
                return toast.error("Applicant cannot be selected as a guarantor.");
            } 
        }
  
        setIsEligible(true);        
    };


    const handleLoanGrant = async () => {
        // Check guarantors are not the same


        // then continue loan grant flow
        toast.success("Validation passed! Ready to grant loan");

        // your saving logic goes here...
    };


    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">🛒 Loan Granting</h1>
                    <p className="text-sm text-gray-500">Process, approve and grant loans to members</p>
                </div>
            </div>

            <div className="bg-white w-full h-full flex flex-col">
                <div className="w-full py-2 rounded-md  bg-blue-500">
                    <div className="w-full flex justify-center gap-4">
                        <label className="block font-medium text-gray-700">Membership No: </label>
                        <input
                            className="w-[60px] border border-gray-300 rounded-md text-center"
                            type="text"
                            placeholder="000"
                            maxLength={3}
                            value={applicantId}
                            onChange={async (e) => {
                                const value = e.target.value;
                                setApplicantId(value);
                                if (value.length === 3) {
                                    setAmount(0);
                                    setMaxAmount(0);
                                    setInterest(0);
                                    setDuration(0);
                                    setMaxDuration(0);
                                    setFirstInstallment(0);                                    
                                    await searchApplicant(value); 
                                }
                            }}
                        />
                    </div>
                </div>

                <div>
                    {/* {isLoading ? (
                        <LoadingSpinner />
                    ) : ( */}
                        <>
                            <div className="w-full flex justify-center gap-4">
                                {/* <label className="block font-medium text-gray-700">Name: </label> */}
                                <span className="block text-xl font-medium text-gray-700 mt-2">{applicant?.name || ""}</span>
                            </div>

                            <div className="w-full h-full flex flex-col mt-4">
                                <span className="block text-lg font-medium text-gray-700 mt-2">Join Date: {applicant?.joinDate || ""}</span>
                                <div className="w-full flex justify-start gap-4">
                                <label className="block font-medium text-gray-700">Membership Fee: </label>
                                <span>{formatNumber(applicant?.membership) || ""}</span>
                                </div>
                                <div className="w-full flex justify-start gap-4">
                                <label className="block font-medium text-gray-700">Shares: </label>
                                <span>{formatNumber(applicant?.shares) || ""}</span>
                                </div>
                            </div>

                            <div className="w-full h-full flex flex-col mt-4">
                                <label className="block font-medium text-gray-700">Available Loans: </label>
                                <table className="w-full">
                                    <thead>
                                    <tr className="text-sm w-full bg-blue-100">
                                        <th className="px-4 py-2">Date</th>
                                        <th className="px-4 py-2">Loan Type</th>
                                        <th className="px-4 py-2">Amount</th>
                                        <th className="px-4 py-2">Pending</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {applicantLoans?.length === 0 ? (
                                        <tr>
                                        <td colSpan="4" className="text-center py-2 text-gray-500">
                                            No Loans Available
                                        </td>
                                        </tr>
                                    ) : (
                                        applicantLoans?.loans?.map((loan) => (
                                        <tr key={loan.id}>
                                            <td className="border px-4 py-2">{loan.issuedDate}</td>
                                            <td className="border px-4 py-2">{loan.loanType}</td>
                                            <td className="border px-4 py-2">{formatNumber(loan.amount)}</td>
                                            <td className="border px-4 py-2">{formatNumber(loan.dueAmount)}</td>
                                        </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="w-full h-full flex justify-between mt-4">
                                <div className="w-[45%]">
                                    <label className="block font-medium text-gray-700">Loan Type: </label>
                                    <select
                                        className="border rounded p-2 w-full text-md"
                                        value={selectedLoanType}
                                        onChange={(e) => {
                                            setSelectedLoanType(e.target.value);
                                            setInstallments(e.target.value);
                                        }}
                                    >
                                        <option value="">Select Loan Type</option>
                                        {loanTypes.map((loanType) => (
                                        <option key={loanType} value={loanType}>
                                            {loanType}
                                        </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-[25%]">
                                    <label className="block font-medium text-gray-700">Amount: </label>
                                    <input
                                        type="number"
                                        placeholder="Loan Amount"
                                        className="w-full p-2 rounded-lg border"
                                        value={amount}
                                        onChange={(e) => {
                                            const value = Number(e.target.value);
                                            if (value <= maxAmount) {
                                                setAmount(value);
                                            } else {
                                                toast.error(`Amount cannot be greater than ${formatNumber(maxAmount)}`);
                                                setAmount(maxAmount);
                                            }
                                        }}
                                    />
                                    <label className="block font-medium text-gray-700">Max: {formatNumber(maxAmount)}</label>
                                </div> 
                                <div className="w-[20%]">
                                    <label className="block font-medium text-gray-700">Duration: </label>
                                    <input
                                        type="number"
                                        placeholder="months"
                                        className="w-full p-2 rounded-lg border"
                                        value={duration}
                                        onChange={(e) => {
                                            const value = Number(e.target.value);
                                            if (value <= maxDuration) {
                                                setDuration(value);
                                            } else {
                                                toast.error(`Duration cannot be greater than ${maxDuration}`);
                                                setDuration(maxDuration);
                                            }
                                        }}
                                    />  
                                    <label className="block font-medium text-gray-700">Max: {maxDuration}</label>
                                </div>                                 
                            </div>
                            <div className="w-full h-full flex justify-between mt-4">
                                <label className="block font-medium text-gray-700">Interest rate per month: {interest}%</label>
                                <label className="block font-medium text-gray-700">First Installment: {formatNumber(firstInstallment)}</label>
                            </div>

                            <div className="mt-4">
                                {(selectedLoanType === "Long Term Loan" || selectedLoanType === "Project Loan") && (
                                    <div>
                                        <label className="block font-medium text-gray-700">First Guranter:</label>
                                        <div className="w-full flex justify-start gap-4 mt-2">
                                            {/* <label className="block font-medium text-gray-700">:</label> */}
                                            <input
                                                className="w-[60px] border border-gray-300 rounded-md text-center"
                                                type="text"
                                                placeholder="000"
                                                maxLength={3}
                                                value={firstGuranterId}
                                                onChange={async (e) => {
                                                    const value = e.target.value;
                                                    setFirstGuranterId(value);
                                                    if (value.length === 3) {                                  
                                                        await searchFirstGuranter(value); 
                                                    }
                                                }}
                                            />
                                            <label className="block font-medium text-gray-700">{firstGuranter?.name || ""}</label>
                                        </div>
                                        <label className="block font-medium text-gray-700 mt-2">Second Guranter:</label>
                                        <div className="w-full flex justify-start gap-4 mt-2">
                                            <input
                                                className="w-[60px] border border-gray-300 rounded-md text-center"
                                                type="text"
                                                placeholder="000"
                                                maxLength={3}
                                                value={secondGuranterId}
                                                onChange={async (e) => {
                                                    const value = e.target.value;
                                                    setSecondGuranterId(value);
                                                    if (value.length === 3) {                                  
                                                        await searchSecondGuranter(value); 
                                                    }
                                                }}
                                            />
                                            <label className="block font-medium text-gray-700">{secondGuranter?.name || ""}</label>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="w-full flex flex-col items-center">
                                <button
                                    className={'px-8 py-2 rounded-md text-sm font-medium shadow mt-8 bg-blue-500 hover:bg-blue-600 text-white'}
                                    onClick={validateLoanGrant}
                                >
                                    Verify Loan
                                </button>

                                <button
                                    disabled={!isEligible}
                                    className={`px-8 py-2 rounded-md text-sm font-medium shadow mt-8 
                                        ${ (!isEligible) ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"}
                                    `}
                                    onClick={handleLoanGrant}
                                >
                                    Grant Loan
                                </button>                                
                            </div>


                        </>
                    {/* )} */}
                </div>
            </div>
        </div>
    );
}