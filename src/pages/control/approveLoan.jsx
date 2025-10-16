import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner";
import { formatNumber } from "../../utils/numberFormat.js";

export default function ApproveLoanPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isGranting, setIsGranting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [applicantId, setApplicantId] = useState("");
    const [loanApplication, setLoanApplication] = useState({});
    const [applicant, setApplicant] = useState({});
    const [applicantLoans, setApplicantLoans] = useState([]);
    const [selectedLoanType, setSelectedLoanType] = useState("");
    const [amount, setAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [interest, setInterest] = useState("");
    const [duration, setDuration] = useState("");
    const [maxDuration, setMaxDuration] = useState("");
    const [firstInstallment, setFirstInstallment] = useState("");
    const [firstGuarantor, setFirstGuarantor] = useState("");
    const [secondGuarantor, setSecondGuarantor] = useState("");
    const [firstGuarantorId, setFirstGuarantorId] = useState("");
    const [secondGuarantorId, setSecondGuarantorId] = useState("");
    const [fGuarantoredLoans, setFGuarantoredLoans] = useState([]);
    const [sGuarantoredLoans, setSGuarantoredLoans] = useState([]);
    const [reason, setReason] = useState("");
    const [isEligible, setIsEligible] = useState(false);
    const [approvals, setApprovals] = useState({
      chairman: false,
      secretary: false,
      treasurer: false,
      executive: false,
      manager: false
    });

    const currentMonth = new Date().getMonth();

    const user = JSON.parse(localStorage.getItem("user"));

    // Fetch applicant
    const searchApplicant = async (id) => {
        if (!id || id === "0") return;
        setIsLoading(true);
        setSelectedLoanType("");
        setAmount("");
        setMaxAmount(0);
        setInterest(0);
        setDuration("");
        setMaxDuration(0);
        setFirstInstallment(0);
        setFirstGuarantorId("");
        setSecondGuarantorId("");    
        setReason("");     

        try {
          const appRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/pending-approval/${id}`);    

          if (appRes.data) {      
            setLoanApplication(appRes.data);
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`);
            setApplicant(res.data);
            const loan = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/pending-customer/${id}`);
            setApplicantLoans(loan.data);  
            const loanDetails = appRes.data;
            const totShares = Number(res.data.shares? res.data.shares:0) + Number(res.data.profit? res.data.profit:0);             
            if (loanDetails.loanType === "Welfare Loan") {
              setMaxDuration(2);
              setInterest(5);
              setMaxAmount(totShares * 0.4);
              setSelectedLoanType("සුභසාධන ණය");
            } else if (loanDetails.loanType === "Short Term Loan") {
              setMaxDuration(12);
              setInterest(2.5);
              setMaxAmount(totShares * 0.7);
              setSelectedLoanType("කෙටි කාලීන ණය");
            } else if (loanDetails.loanType === "Long Term Loan") {
              setMaxDuration(24);
              setInterest(1.5);
              setMaxAmount(totShares * 1.5);
              setSelectedLoanType("දිගු කාලීන ණය");
              setFirstGuarantorId(loanDetails.firstGuarantorId);
              setSecondGuarantorId(loanDetails.secondGuarantorId);
              searchFirstGuarantor(loanDetails.firstGuarantorId);
              searchSecondGuarantor(loanDetails.secondGuarantorId);
            } else if (loanDetails.loanType === "Project Loan") {
              setMaxDuration(24);
              setInterest(1.5);
              setMaxAmount(200000);
              setSelectedLoanType("ව්යාපෘති ණය");           
              setFirstGuarantorId(loanDetails.firstGuarantorId);
              setSecondGuarantorId(loanDetails.secondGuarantorId);
              searchFirstGuarantor(loanDetails.firstGuarantorId);
              searchSecondGuarantor(loanDetails.secondGuarantorId);            
            }
            setAmount(loanDetails.amount);
            // setInterest(loanDetails.interest);
            setDuration(loanDetails.loanDuration);
            setFirstInstallment(((amount / duration) + ((amount * interest) / 100)).toFixed(2));
            setReason("");            
          }
        } catch (err) {
          toast.error(err.response?.data?.message || "Applicant not found");
        } finally {
          setIsLoading(false);
        }
    };


    const searchFirstGuarantor = async (id) => {     
        if (!id || id === "0") return;
        setIsLoading(true);
        try {
          const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`);
          setFirstGuarantor(res.data);
          // const loan = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/pending-customer/${id}`);
          // setFirstGuarantorLoans(loan.data);
          const fGLoans = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/pending-guarantor/${id}`);
          setFGuarantoredLoans(fGLoans.data);
        } catch (err) {
          toast.error(err.response?.data?.message || "Member not found");
        } finally {
          setIsLoading(false);
        }
    };

    const searchSecondGuarantor = async (id) => {
        if (!id || id === "0") return;
        setIsLoading(true);
        try {
          const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`);
          setSecondGuarantor(res.data);
          // const loan = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/pending-customer/${id}`);
          // setSecondGuarantorLoans(loan.data);
          const sGLoans = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/pending-guarantor/${id}`);
          setSGuarantoredLoans(sGLoans.data);
        } catch (err) {
          toast.error(err.response?.data?.message || "Member not found");
        } finally {
          setIsLoading(false);
        }
    };

    useEffect(() => {
        if (amount > 0 && duration > 0 && interest > 0) {
          setFirstInstallment(((amount / duration) + ((amount * interest) / 100)).toFixed(2));
        } else setFirstInstallment("");
    }, [selectedLoanType, amount, duration]);
      

    const validateLoanGrant = () => {
        setIsEligible(false);
        setReason("");
        if (!applicantId) return toast.error("පළමුව අයදුම්කරුගේ සාමාජික අංකය ඉදිරිපත් කරන්න.");
        if (!selectedLoanType) return toast.error("ණය වර්ගය තෝරන්න");
        if (!amount) return toast.error("ණය මුදල ඇතුළත් කරන්න");
        if (!duration) return toast.error("ආපසු ගෙවීමේ කාලය ඇතුළත් කරන්න");

        if (selectedLoanType === "දිගු කාලීන ණය" || selectedLoanType === "ව්යාපෘති ණය") {
          if (!firstGuarantorId || !secondGuarantorId) return toast.error("ඇපකරුවන්ගේ විස්තර සපයන්න");
          if (firstGuarantorId === secondGuarantorId) return toast.error("ඇපකරුවන්ට එකම සාමාජිකයෙකු විය නොහැක.");
          if (firstGuarantorId === applicantId || secondGuarantorId === applicantId) return toast.error("අයදුම්කරුට ඇපකරුවෙකු විය නොහැක.");
        }

        if (selectedLoanType === "ව්යාපෘති ණය" ||  selectedLoanType === "දිගු කාලීන ණය") {
          if (!approvals.chairman) return toast.error("සභාපතිවරයාගේ අනුමැතිය ලැබී නැත..");
        }  
        
        if (!approvals.secretary) return toast.error("ලේකම් අනුමැතිය ලැබී නැත.");

        if (selectedLoanType === "ව්යාපෘති ණය" || selectedLoanType === "දිගු කාලීන ණය" || selectedLoanType === "කෙටි කාලීන ණය") {
          if (!approvals.treasurer) return toast.error("භාණ්ඩාගාරික අනුමැතිය ලැබී නැත.");
        }

        if (selectedLoanType === "ව්යාපෘති ණය") {
          if (!approvals.executive) return toast.error("විධායක කමිටුවේ අනුමැතිය ලැබී නැත.");
        }

        if (!approvals.manager) return toast.error("කළමනාකරුගේ අනුමැතිය ලැබී නැත.");

        //check for loan eligibility
        //check membership duration
        const joinDate = new Date(applicant.joinDate);
        const today = new Date();
        const diffYears = today.getFullYear() - joinDate.getFullYear();
        let isMoreThanOneYear = false;
        if (diffYears > 1) {
            isMoreThanOneYear = true;
        } else if (diffYears === 1) {
            const monthDiff = today.getMonth() - joinDate.getMonth();
            if (monthDiff > 0) {
              isMoreThanOneYear = true;
            } else if (monthDiff === 0) {
              if (today.getDate() >= joinDate.getDate()) {
                isMoreThanOneYear = true;
              }
            }
        }
        //Membership fee
        let membershipFee = applicant?.membership ? Number(applicant.membership) : 0;
        //check shares
        let sharesAmount = Number(applicant?.shares) + Number(applicant?.profits) 

        if (!isMoreThanOneYear) {
            setReason("❌ ඔබගේ සාමාජිකත්ව කාලය තවමත් වසරකට ළඟා වී නැත. මෙම අවස්ථාවේදී ණයක් සඳහා අයදුම් කිරීමට ඔබට සුදුසුකම් නොමැත.");
            setIsEligible(false);
            return;
        } else if (membershipFee > 0) {
            const membershipFeePercentage =  ((12 - currentMonth) * 150)
            if (membershipFee < membershipFeePercentage) {
              setReason("❌ ඔබගේ සාමාජික ගාස්තු ගෙවීම් යාවත්කාලීන නොවේ. එබැවින්, මෙම අවස්ථාවේදී ණයක් සඳහා අයදුම් කිරීමට ඔබට සුදුසුකම් නොමැත.");
              setIsEligible(false);
              setIsValidating(false);
            return;        
            }
        } else if (sharesAmount < 5000) {
            setReason("❌ ඔබගේ කොටස් දායකත්වය අවශ්‍ය අවම මුදලට ළඟා වී නොමැත. එබැවින්, මෙම අවස්ථාවේදී ණයක් නිකුත් කළ නොහැක.");
            setIsEligible(false);
            return;      
        } 
        {
          applicantLoans.map((loan) => {
            if (loan.loanType === selectedLoanType) {
                setReason("❌ ඔබ ඉල්ලා සිටින ණය වර්ගය දැනටමත් ලබාගෙන ඇත. එබැවින්, මේ අවස්ථාවේ දී එම වර්ගයේම තවත් ණයක් නිකුත් කළ නොහැක.");
                setIsEligible(false);
                return;
            } else if ((loan.loanType !== "Welfare Loan") && (selectedLoanType !== "Welfare Loan")) {
                setReason("❌ ඔබට දැනටමත් ක්‍රියාකාරී ණයක් තිබේ. එබැවින්, මෙම අවස්ථාවේදී නව ණයක් නිකුත් කළ නොහැක.");
                setIsEligible(false);
                return;        
            } else if (((loan.amount/2) < (loan.dueAmount)) && (selectedLoanType === "Welfare Loan")) {
                setReason("❌ ඔබගේ පවතින ණය මුදලින් අවම වශයෙන් 50% ක්වත් පියවා නොමැති බැවින්, මෙම අවස්ථාවේදී සුභසාධන ණයක් නිකුත් කළ නොහැක.");
                setIsEligible(false);
                return;              
            }
        })}
        if (selectedLoanType === "Long Term Loan") {
          if (fGuarantoredLoans.length > 0) {
              setReason("❌ තෝරාගත් පළමු ඇපකරු දැනටමත් තවත් ණයක් සඳහා අත්සන් කර ඇති අතර එම නිසා නැවත අත්සන් කිරීමට සුදුසුකම් නොලබයි.");
              setIsEligible(false);
              return;         
          } else if ((amount/4) > (Number(firstGuarantor.shares) + Number(firstGuarantor.profits))) {
              setReason("❌ මෙම ණය මුදල සඳහා අත්සන් කිරීමට පළමු ඇපකරුගේ කොටස් මුදල ප්‍රමාණවත් නොවේ.");
              setIsEligible(false);
              return;          
          }
          if (sGuarantoredLoans.length > 0) {
              setReason("❌ තෝරාගත් දෙවන ඇපකරු දැනටමත් තවත් ණයක් සඳහා අත්සන් කර ඇති අතර එම නිසා නැවත අත්සන් කිරීමට සුදුසුකම් නොලබයි.");
              setIsEligible(false);
              return;         
          } else if ((amount/4) > (Number(secondGuarantor.shares) + Number(secondGuarantor.profits))) {
              setReason("❌ මෙම ණය මුදල සඳහා අත්සන් කිරීමට දෙවන ඇපකරුගේ කොටස් මුදල ප්‍රමාණවත් නොවේ.");
              setIsEligible(false);
              return;          
          }      
        }

        setReason("✅ණය අයදුම්පත අනුමත කර ඇති අතර එය ලබා දීමට සුදුසුකම් ලබා ඇත. ක්‍රියාවලිය සම්පූර්ණ කිරීම සඳහා කරුණාකර ගෙවීම සමඟ ඉදිරියට යන්න.");
        setIsEligible(true);
    };


    const handleLoanGrant = async () => {
          if (!isEligible) return;

          const referenceNo = loanApplication.loanId;

          try {
              //1️⃣create loan master
              try {
                  const loanMasterpayload = {
                      approvalDate: new Date(),
                      isApprovedChairman: approvals.chairman,
                      isApprovedSecretary: approvals.secretary,
                      isApprovedTreasurer: approvals.treasurer,
                      isApprovedExecutive: approvals.executive,
                      isApprovedManager: approvals.manager,
                      isApproved: true,
                      isGranted: false
                  }
                  await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/update/${referenceNo}`, loanMasterpayload);
              } catch (error) {
                  console.log('1️⃣⚠️ create loan master error: ', error);
              }
              toast.success("ණය අනුමත කරන ලදී.");
          } catch (error) {
              console.log(error);
          }
    }


    const handleLoanReject = async () => {
          setIsRejecting(true);
          const referenceNo = loanApplication.loanId;
          //1️⃣create loan master
          try {
              const loanMasterpayload = {
                  approvalDate: new Date(),
                  isApproved: false,
                  isRejected: true,
                  isGranted: false
              }
              const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/update/${referenceNo}`, loanMasterpayload);
              toast.success("ණය අයදුම්පත ප්‍රතික්ෂේප කරන ලදී.");
          } catch (error) {
              console.log('1️⃣⚠️ Reject loan error: ', error);
          }
    }

    return (
        <div className="max-w-5xl w-full h-full flex flex-col space-y-6 overflow-hidden">
          
            {/* Header */}
            <div className="text-center p-2">
              <h1 className="text-lg md:text-2xl font-bold text-orange-600">🛒 ණය අයදුම්පත් අනුමත කිරීම</h1>
              <p className="text-gray-600 text-sm sm:text-base">අයදුම්පත් තොරතුරු තහවුරු කර ණය අනුමත කිරීම.</p>
            </div>

            <div className="bg-white shadow rounded-md max-h-[calc(100vh-200px)] space-y-8 overflow-y-auto">

                {/* Applicant Info Card */}
                <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-indigo-500">
                    {/* <div className="flex flex-col md:flex-row md:items-center gap-1">
                        <label className="font-semibold text-indigo-700 w-40">සාමාජික අංකය:</label>
                        <input
                          type="text"
                          className="border border-indigo-300 rounded-lg p-2 w-full md:w-24 text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          placeholder="000"
                          maxLength={3}
                          value={applicantId}
                          onChange={async (e) => {
                            const value = e.target.value;
                            setApplicantId(value);
                            if (value.length === 3) await searchApplicant(value);
                          }}
                        />
                    </div> */}
                    <div className="flex flex-col md:flex-row md:items-center gap-1">
                        <label className="font-semibold text-indigo-700 w-40">සාමාජික අංකය:</label>

                        {["manager", "admin"].includes(user?.memberRole) ? (
                          // If manager or admin → allow input
                          <input
                            type="text"
                            className="border border-indigo-300 rounded-lg p-2 w-full md:w-24 text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            placeholder="000"
                            maxLength={3}
                            value={applicantId}
                            onChange={async (e) => {
                              const value = e.target.value;
                              setApplicantId(value);
                              if (value.length === 3) await searchApplicant(value);
                            }}
                          />
                        ) : (
                          // If member → just display his member id
                          <input
                            type="text"
                            className="border border-indigo-300 rounded-lg p-2 w-full md:w-24 text-center bg-gray-100 cursor-not-allowed"
                            value={user?.memberId || ""}
                            readOnly
                          />
                        )}
                    </div>

                    {isLoading ? (
                      <LoadingSpinner />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-indigo-700 font-medium">
                          <div className="mt-4 flex justify-between">
                            <span>නම:</span>
                            <span>{applicant?.name || "-"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>සම්බන්ධ දිනය:</span>
                            <span>{applicant?.joinDate?.slice(0, 10) || "-"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>හිග​ සාමාජික ගාස්තු:</span>
                            <span>{formatNumber(applicant?.membership)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>කොටස් මුදල:</span>
                            <span>{formatNumber(applicant?.shares)}</span>
                          </div>
                      </div>
                    )}
                </div>

                {/* Membership Table */}
                {/* <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-purple-500">
                    <p className="font-semibold text-purple-700">සාමාජික ගාස්තු පිළිබඳ විස්තර</p>
                    <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md text-sm sm:text-base">
                      <thead className="bg-purple-50 text-purple-700">
                        <tr>
                          <th className="px-2 py-1">දිනය</th>
                          <th className="px-2 py-1">විස්තරය</th>
                          <th className="px-2 py-1">මුදල</th>
                          <th className="px-2 py-1">ශේෂය</th>
                        </tr>
                      </thead>
                      <tbody>
                        {memberShipFee?.length ? memberShipFee.map(trx => (
                          <tr key={trx.id} className="hover:bg-purple-50">
                            <td className="px-2 py-1">{trx.transactionDate}</td>
                            <td className="px-2 py-1">{trx.transactionType} {trx.description}</td>
                            <td className={`px-2 py-1 ${trx.isCredit ? 'text-green-500' : 'text-red-500'}`}>{formatNumber(trx.amount)}</td>
                            <td className="px-2 py-1">{formatNumber(trx.dueAmount)}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan="4" className="text-center py-2 text-gray-500">ගනුදෙනු කිසිවක් හමු නොවේ</td></tr>
                        )}
                      </tbody>
                    </table>
                </div> */}

                {/* Loan Table */}
                <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-orange-500">
                    <p className="text-orange-600 font-semibold text-sm sm:text-base">ලබාගෙන ඇති අනෙකුත් ණය:</p>
                    <table className="w-full border-collapse text-sm">
                      <thead className="bg-orange-50 text-orange-700 font-semibold">
                        <tr>
                          <th className="border px-3 py-2">දිනය</th>
                          <th className="border px-3 py-2">ණය වර්ගය</th>
                          <th className="border px-3 py-2">මුදල</th>
                          <th className="border px-3 py-2">ශේෂය</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applicantLoans?.length ? applicantLoans.map((loan, idx) => (
                          <tr key={loan.id ?? idx} className="hover:bg-orange-50 transition">
                            <td className="border px-3 py-1">{new Date(loan.issuedDate).toLocaleDateString("en-GB")}</td>
                            <td className="border px-3 py-1">{loan.loanType}</td>
                            <td className="border px-3 py-1">{formatNumber(loan.amount)}</td>
                            <td className="border px-3 py-1">{formatNumber(loan.dueAmount)}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="4" className="text-center py-3 text-gray-400 italic">වෙනත් ණය ගෙන නැත</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                </div>

                {/* Loan Summary Card */}
                <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-pink-500">
                    <p className="text-pink-600 font-semibold sm:text-base">අයදුම් කළ ණය පිළිබඳ විස්තර:</p>
                    <div className="flex justify-between">
                      <span className="font-medium text-pink-500">ණය වර්ගය:</span>
                      <span>{selectedLoanType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-pink-500">මුදල (Max- {formatNumber(maxAmount)}):</span>
                      <span>{formatNumber(amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-pink-500">කාල සීමාව මාස (Max- {maxDuration}):</span>
                      <span>{duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-pink-500">මාසික පොලී අනුපාතය:</span>
                      <span>{interest}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-pink-500">පළමු වාරිකය:</span>
                      <span>{formatNumber(firstInstallment)}</span>
                    </div>
                </div>

                {/* Approval Checkboxes */}
                <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-teal-600">
                    <p className="text-teal-600 font-semibold text-sm sm:text-base">ණය අනුමත කිරීම:</p>

                    {(selectedLoanType === "ව්යාපෘති ණය" || selectedLoanType === "දිගු කාලීන ණය" ) && (
                      <label className="flex items-center gap-2 text-teal-600">
                        <input
                          type="checkbox"
                          name="chairman"
                          checked={approvals.chairman}
                          onChange={(e) => setApprovals(prev => ({ ...prev, chairman: e.target.checked }))}
                          className="form-checkbox h-5 w-5 text-teal-600"
                        />
                        සභාපති අනුමැතිය
                      </label>
                    )}

                    <label className="flex items-center gap-2 text-teal-600">
                      <input
                        type="checkbox"
                        name="secretary"
                        checked={approvals.secretary}
                        onChange={(e) => setApprovals(prev => ({ ...prev, secretary: e.target.checked }))}
                        className="form-checkbox h-5 w-5 text-teal-600"
                      />
                      ලේකම් අනුමැතිය
                    </label>

                    {(selectedLoanType === "ව්යාපෘති ණය" || selectedLoanType === "දිගු කාලීන ණය" || selectedLoanType === "කෙටි කාලීන ණය") && (
                      <label className="flex items-center gap-2 text-teal-600">
                        <input
                          type="checkbox"
                          name="treasurer"
                          checked={approvals.treasurer}
                          onChange={(e) => setApprovals(prev => ({ ...prev, treasurer: e.target.checked }))}
                          className="form-checkbox h-5 w-5 text-teal-600"
                        />
                        භාණ්ඩාගාරික අනුමැතිය
                      </label>
                    )}

                    {selectedLoanType === "ව්යාපෘති ණය" && (
                      <label className="flex items-center gap-2 text-teal-600">
                        <input
                          type="checkbox"
                          name="executive"
                          checked={approvals.executive}
                          onChange={(e) =>
                            setApprovals((prev) => ({ ...prev, executive: e.target.checked }))
                          }
                          className="form-checkbox h-5 w-5 text-teal-600"
                        />
                        විධායක කමිටුවේ අනුමැතිය
                      </label>
                    )}

                    <label className="flex items-center gap-2 text-teal-600">
                      <input
                        type="checkbox"
                        name="manager"
                        checked={approvals.manager}
                        onChange={(e) => setApprovals(prev => ({ ...prev, manager: e.target.checked }))}
                        className="form-checkbox h-5 w-5 text-teal-600"
                      />
                      කළමනාකරු අනුමැතිය
                    </label>                
                </div> 

                {/* Reason */}
                <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-blue-500">
                    <p className="text-blue-600 font-semibold sm:text-base">ඉදිරිපත් කළ ණය අයදුම්පත:</p>
                    <textarea
                      className={`w-full rounded p-2 focus:ring-2 focus:ring-blue-400 ${!isEligible ? "text-red-600" : "text-blue-600"}`}
                      rows={4}
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      disabled={!isEligible}
                    />
                </div>
          
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <button
                      className={`w-full h-12 rounded-lg ${!isEligible ? "bg-gradient-to-r from-indigo-400 to-indigo-600 text-white hover:from-indigo-500 hover:to-indigo-700" : "bg-gray-400 cursor-not-allowed"}`}
                      onClick={validateLoanGrant}
                    >
                      {isEligible ? 'ණය සත්‍යාපනය කර ඇත' : 'ණය අයදුම්පත සත්‍යාපනය කරන්න'}
                    </button>

                    <button
                      disabled={!isEligible || isGranting}
                      className={`rounded-lg w-full h-12 ${isEligible && !isGranting ? "bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700" : "bg-gray-400 cursor-not-allowed"}`}
                      onClick={async () => {
                        setIsGranting(true);
                        await handleLoanGrant();
                      }}
                    >
                      {isGranting ? "ණය අනුමත කරන ලදී" : "ණය අනුමත කරන්න"}
                    </button>

                    <button
                      disabled={isRejecting || isGranting}
                      className={`rounded-lg w-full h-12 ${!isRejecting && !isGranting ? "bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700" : "bg-gray-400 cursor-not-allowed"}`}
                      onClick={handleLoanReject}
                    >
                      {isRejecting ? "අයදුම්පත ප්‍රතික්ෂේප කරන ලදී" : "අයදුම්පත ප්‍රතික්ෂේප කරන්න"}
                    </button>

                    <button
                      onClick={() => navigate('/control')}
                      className="w-full h-12 text-gray-600 border border-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition mb-4"
                    >
                      ආපසු යන්න
                    </button>          
                </div>
            </div>
        </div>
    );
}    