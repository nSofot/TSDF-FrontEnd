import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner";
import { formatNumber } from "../../utils/numberFormat.js";

export default function ApplyLoanPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [referenceNo, setReferenceNo] = useState("");
    const [applicantId, setApplicantId] = useState("");
    const [applicant, setApplicant] = useState({});
    const [applicantLoans, setApplicantLoans] = useState([]);
    const [selectedLoanType, setSelectedLoanType] = useState("");
    const [amount, setAmount] = useState(0);
    const [maxAmount, setMaxAmount] = useState(0);
    const [interest, setInterest] = useState(0);
    const [duration, setDuration] = useState(0);
    const [maxDuration, setMaxDuration] = useState(0);
    const [firstInstallment, setFirstInstallment] = useState(0);
    const [firstGuranter, setFirstGuaranter] = useState("");
    const [secondGuranter, setSecondGuaranter] = useState("");
    const [firstGuranterId, setFirstGuranterId] = useState("");
    const [secondGuranterId, setSecondGuranterId] = useState("");
    const [fGuranteredLoans, setFGuranteredLoans] = useState([]);
    const [sGuranteredLoans, setSGuranteredLoans] = useState([]);
    const [reason, setReason] = useState("");
    const [isEligible, setIsEligible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [isRemoved, setIsRemoved] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isNewLoan, setIsNewLoan] = useState(true);

    const loanTypes = ["සුභසාධන ණය", "කෙටි කාලීන ණය", "දිගු කාලීන ණය", "ව්යාපෘති ණය"];
    const loanTypesValue = ["Welfare Loan", "Short Term Loan", "Long Term Loan", "Project Loan"];

    const user = JSON.parse(localStorage.getItem("user") || "null");

  
    useEffect(() => {      
      if (user?.userId) {
        setApplicantId(user.userId);
        if (user.userId.length === 3) {
          searchApplicant(user.userId);
        }
      }
    }, [user?.userId]);


    // Fetch applicant
    const searchApplicant = async (id) => {    
      if (!id || id === "0") return;
      setIsLoading(true);
      setApplicant({});
      
      try {
          // fetch applicant details
          try {
              const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`);
              if (!res.data) {
                  toast.error("සාමාජික අංකය වලංගු නැත");
                  return;
              }
              setApplicant(res.data);
          } catch (error) {
              if (error.response?.status === 404) {
                  toast.error("සාමාජික අංකය නොමැත.");
              } else {
                  toast.error("අයදුම්පත සෙවීම අසාර්ථක විය.");
                  console.error(error);
              }
          }

        // fetch applicant loans
        const loan = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/pending-customer/${id}`);
        setApplicantLoans(loan.data);    
          
        // fetch applcant submitted loans
        try {         
            const appRes = await axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/application/${id}`
            );                     
            if (appRes.data) {          
                setReferenceNo(appRes.data.loanId);
                setSelectedLoanType(appRes.data.loanType);
                setAmount(appRes.data.amount ?? 0);
                setMaxAmount(appRes.data.maxAmount ?? 0);
                setInterest(appRes.data.loanInterestRate ?? 0);
                setDuration(appRes.data.loanDuration ?? 0);
                setMaxDuration(appRes.data.maxDuration ?? 0);
                setFirstInstallment(appRes.data.firstInstallment ?? 0);     
                // setIsApproved(appRes.data.isApproved);
                setIsGranted(appRes.data.isGranted);
                setFirstGuranterId(appRes.data.firstGuarantorId ?? "");
                setSecondGuranterId(appRes.data.secondGuarantorId ?? "");
                setIsNewLoan(false);
                if (appRes.data.isRejected) {
                    setReason("⛔කණගාටුයි, ඔබේ ණය අයදුම්පත ප්‍රතික්ෂේප කර ඇත. කරුණාකර වැඩි විස්තර සඳහා කළමනාකරු අමතන්න.");   
                } else if (appRes.data.isApproved)  {
                    setReason("✅ඔබගේ ණය අයදුම්පත අනුමත කර ඇත. කරුණාකර කළමනාකරුගෙන් ණය මුදල ලබා ගන්න.");
                } else {
                    setReason("⌛ඔබගේ ණය අයදුම්පත අනුමැතිය සඳහා සමාලෝචනය කෙරෙමින් පවතී. කරුණාකර රැඳී සිටින්න.");
                }
            }
        } catch (error) {
            if (error.response?.status === 404) {
                // reset fields
              resetFields();
            } else {
                toast.error("අයදුම්පත සෙවීම අසාර්ථක විය.");
            }
        }
      } finally {
        setIsLoading(false);
      }
    };

    const searchFirstGuranter = async (id) => {
        if (!id || id === "0") return;
        setIsLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`);
            if (!res.data) return toast.error("සාමාජික අංකය වලංගු නැත");
            setFirstGuaranter(res.data);

            try {
                const fGLoans = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/pending-guarantor/${id}`);
                setFGuranteredLoans(fGLoans.data);
            } catch (error) {
              if (error.response?.status === 404) {
                  setFGuranteredLoans([]); // no loans found
              } else {
                  console.error(error);
                  toast.error("Failed to fetch guarantor loans");
              }
            }
        } finally {
            setIsLoading(false);
        }
    };

      const searchSecondGuranter = async (id) => {
        if (!id || id === "0") return;
        setIsLoading(true);
        try {
          const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`);
          if (!res.data) return toast.error("සාමාජික අංකය වලංගු නැත");
          setSecondGuaranter(res.data);

          try {
            const sGLoans = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/pending-guarantor/${id}`);
            setSGuranteredLoans(sGLoans.data);
          } catch (error) {
            if (error.response?.status === 404) {
              setSGuranteredLoans([]); // no loans for this guarantor
            } else {
              console.error(error);
              toast.error("Guarantor loans fetch failed");
            }
          }

        } finally {
          setIsLoading(false);
        }
      };

    const setInstallments = (loanType) => {
      setIsEligible(false);
      setDuration("");
      setAmount("");
      setInterest("");
      setMaxAmount("");
      setMaxDuration("");
      setFirstGuranterId("");
      setSecondGuranterId("");
      if (loanType === "Welfare Loan") {
        setMaxDuration(2);
        setInterest(5);
        setMaxAmount(applicant.shares * 0.4);
      } else if (loanType === "Short Term Loan") {
        setMaxDuration(12);
        setInterest(2.5);
        setMaxAmount(applicant.shares * 0.7);
      } else if (loanType === "Long Term Loan") {
        setMaxDuration(24);
        setInterest(1.5);
        setMaxAmount(applicant.shares * 1.5);
      } else if (loanType === "Project Loan") {
        setInterest(1.5);
        setMaxAmount(200000);
      }
    };

    useEffect(() => {
      if (amount > 0 && duration > 0 && interest > 0) {
        setFirstInstallment(((amount / duration) + ((amount * interest) / 100)).toFixed(2));
      } else setFirstInstallment("");
    }, [selectedLoanType, amount, duration]);

    const resetFields = () => {         
        // reset fields
        // setReferenceNo("");
        // setSelectedLoanType("");
        // setAmount(0);
        // setMaxAmount(0);
        // setInterest(0);
        // setDuration(0);
        // setMaxDuration(0);
        // setFirstInstallment(0);
        // setFirstGuranterId("");
        // setSecondGuranterId("");   
        // setApplicantLoans([]);  
        // setReason("");    
        // setIsNewLoan(true);
        // setIsValidating(false);
        // setIsEligible(false);
        // setIsSubmitting(false);
        // setIsSubmitted(false);
        // setIsRemoving(false);
    }


    const validateLoanGrant = () => {     
      setReason("");

      if (!applicantId) {
        setIsEligible(false);
        setIsValidating(false);
        return toast.error("පළමුව අයදුම්කරුගේ සාමාජික අංකය ඉදිරිපත් කරන්න.");
      }
      if (!selectedLoanType) {
        setIsEligible(false);
        setIsValidating(false);        
        return toast.error("ණය වර්ගය තෝරන්න");
      }
      if (!amount) {
        setIsEligible(false);
        setIsValidating(false);         
        return toast.error("ණය මුදල ඇතුළත් කරන්න");
      }
      if (!duration) {
        setIsEligible(false);
        setIsValidating(false);         
        return toast.error("ආපසු ගෙවීමේ කාලය ඇතුළත් කරන්න");
      }

      if (selectedLoanType === "Long Term Loan" || selectedLoanType === "Project Loan") {
        if (!firstGuranterId || !secondGuranterId) {
          setIsEligible(false);
          setIsValidating(false);
          return toast.error("ඇපකරුවන්ගේ විස්තර සපයන්න");
        }
        if (firstGuranterId === secondGuranterId) {
          setIsEligible(false);
          setIsValidating(false);
          return toast.error("ඇපකරුවන්ට එකම සාමාජිකයෙකු විය නොහැක.");
        }
        if (firstGuranterId === applicantId || secondGuranterId === applicantId) {
          setIsEligible(false);
          setIsValidating(false);          
          return toast.error("අයදුම්කරුට ඇපකරුවෙකු විය නොහැක.");
        }
      }

      // check membership duration
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

      let membershipFee = applicant?.membership ? Number(applicant.membership) : 0;
      let sharesAmount = Number(applicant?.shares) + Number(applicant?.profits);

      if (!isMoreThanOneYear) {
        setReason("❌ ඔබගේ සාමාජිකත්ව කාලය තවමත් වසරකට ළඟා වී නැත. මෙම අවස්ථාවේදී ණයක් සඳහා අයදුම් කිරීමට ඔබට සුදුසුකම් නොමැත.");
        setIsEligible(false);
        setIsValidating(false);
        return;
      } else if (membershipFee > 0) {
        setReason("❌ ඔබගේ සාමාජික ගාස්තු ගෙවීම් යාවත්කාලීන නොවේ. එබැවින්, මෙම අවස්ථාවේදී ණයක් සඳහා අයදුම් කිරීමට ඔබට සුදුසුකම් නොමැත.");
        setIsEligible(false);
        setIsValidating(false);
        return;
      } else if (sharesAmount < 5000) {
        setReason("❌ ඔබගේ කොටස් දායකත්වය අවශ්‍ය අවම මුදලට ළඟා වී නොමැත. එබැවින්, මෙම අවස්ථාවේදී ණයක් නිකුත් කළ නොහැක.");
        setIsEligible(false);
        setIsValidating(false);
        return;      
      }

      // ✅ FIX: use for...of instead of map so we can exit validateLoanGrant
      for (let loan of applicantLoans) {
        if (loan.loanType === selectedLoanType) {                 
          setReason("❌ ඔබ ඉල්ලා සිටින ණය වර්ගය දැනටමත් ලබාගෙන ඇත. එබැවින්, මේ අවස්ථාවේ දී එම වර්ගයේම තවත් ණයක් නිකුත් කළ නොහැක.");
          setIsEligible(false);
          setIsValidating(false);
          return;
        } else if ((loan.loanType !== "Welfare Loan") && (selectedLoanType !== "Welfare Loan")) {
          setReason("❌ ඔබට දැනටමත් ක්‍රියාකාරී ණයක් තිබේ. එබැවින්, මෙම අවස්ථාවේදී නව ණයක් නිකුත් කළ නොහැක.");
          setIsEligible(false);
          setIsValidating(false);
          return;        
        } else if (((loan.amount / 2) < loan.dueAmount) && (selectedLoanType === "Welfare Loan")) {
          setReason("❌ ඔබගේ පවතින ණය මුදලින් අවම වශයෙන් 50% ක්වත් පියවා නොමැති බැවින්, මෙම අවස්ථාවේදී සුභසාධන ණයක් නිකුත් කළ නොහැක.");
          setIsEligible(false);
          setIsValidating(false);
          return;              
        }
      }

      if (selectedLoanType === "Long Term Loan") {
        if (fGuranteredLoans.length > 0) {
          setReason("❌ තෝරාගත් පළමු ඇපකරු දැනටමත් තවත් ණයක් සඳහා අත්සන් කර ඇති අතර එම නිසා නැවත අත්සන් කිරීමට සුදුසුකම් නොලබයි.");
          setIsEligible(false);
          setIsValidating(false);
          return;         
        } else if ((amount / 4) > (Number(firstGuranter.shares) + Number(firstGuranter.profits))) {
          setReason("❌ මෙම ණය මුදල සඳහා අත්සන් කිරීමට පළමු ඇපකරුගේ කොටස් මුදල ප්‍රමාණවත් නොවේ.");
          setIsEligible(false);
          setIsValidating(false);
          return;          
        }
        if (sGuranteredLoans.length > 0) {
          setReason("❌ තෝරාගත් දෙවන ඇපකරු දැනටමත් තවත් ණයක් සඳහා අත්සන් කර ඇති අතර එම නිසා නැවත අත්සන් කිරීමට සුදුසුකම් නොලබයි.");
          setIsEligible(false);
          setIsValidating(false);
          return;         
        } else if ((amount / 4) > (Number(secondGuranter.shares) + Number(secondGuranter.profits))) {
          setReason("❌ මෙම ණය මුදල සඳහා අත්සන් කිරීමට දෙවන ඇපකරුගේ කොටස් මුදල ප්‍රමාණවත් නොවේ.");
          setIsEligible(false);
          setIsValidating(false);
          return;          
        }     
      }
      setReason("✅ඔබගේ ණය අයදුම්පත සූදානම් සහ ඉදිරිපත් කිරීමට සුදුසුකම් ලබා ඇත. අනුමැතිය සඳහා එය ඉදිරිපත් කිරීමට කරුණාකර පහත බොත්තම ක්ලික් කරන්න.");
      setIsEligible(true);
      setIsValidating(false);
    };


    const handleLoanGrant = async () => {
      if (!isEligible) return;
      let newReferenceNo = "";
      // const lgAcId = "325-0001";
      try {
          //1️⃣create loan master
          try {
              const loanMasterpayload = {
                  customerId: applicantId,
                  firstGuarantorId: firstGuranterId,
                  secondGuarantorId: secondGuranterId,
                  applicationDate: new Date(),
                  loanType: selectedLoanType,
                  amount: amount,
                  loanDuration: duration,
                  loanInterestRate: interest,
                  dueAmount: amount,
                  isGranted: false
              }          
              const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster`, loanMasterpayload);
              newReferenceNo = res.data.referenceNo;
              setReferenceNo(res.data.referenceNo);
          } catch (error) {
              console.log('1️⃣⚠️ create loan application error: ', error);
          }
      } catch (error) {
          console.log(error);
      }
      toast.success("ඔබගේ ණය අයදුම්පත සාර්ථකව ඉදිරිපත් කර ඇත. අනුමැතිය සඳහා එය සමාලෝචනය කරන තෙක් රැඳී සිටින්න.");
      setIsSubmitted(true);
      setIsSubmitting(false);
    }

    const handleDeleteApplication = async () => {
      if (isNewLoan || !referenceNo) return toast.error("ඇතුළත් කළ අයදුම්පතක් නොමැත.");
      const loanId = referenceNo;
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/delete/${loanId}`);
        toast.success("ණය අයදුම්පත සාර්ථකව ඉවත් කර ඇත.");
        setIsRemoved(true);
        navigate(-1);
      } catch (error) {
        console.error("Delete loan error:", error);
        toast.error("අයදුම්පත ඉවත් කිරීම අසාර්ථක විය.");
      }
    };

      
    return (
        <div className="max-w-5xl w-full h-full flex flex-col space-y-6 overflow-hidden">

            {/* Header */}
            <div className="text-center p-2 bg-white">
                <h1 className="text-lg md:text-2xl font-bold text-orange-600 mb-1">🛒 ණය අයදුම්පත</h1>
                <p className="text-gray-600 text-sm">ඉක්මනින් සහ ආරක්ෂිතව ණයක් සඳහා අයදුම් කරන්න.</p>
            </div>

            <div className="bg-white shadow rounded-md max-h-[calc(100vh-230px)] space-y-8 overflow-y-auto">
                {/* Applicant Info Card */}
                <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-indigo-500">
                    <div className="flex flex-col md:flex-row md:items-center gap-1">
                        <label className="font-semibold text-indigo-700 w-40">සාමාජික අංකය:</label>
                        
                        {user.memberRole === "manager" ? (
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
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-indigo-700 font-medium mt-4">
                            <div className="flex justify-between">
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

                {/* Loan Table */}
                <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-orange-500">
                    <p className="text-orange-600 font-semibold sm:text-base">ලබාගෙන ඇති අනෙකුත් ණය:</p>
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

                {/* Loan Application Inputs */}
                <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-pink-500">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Loan Type */}
                        <div>
                            <label className="font-medium text-pink-700">ණය වර්ගය</label>
                            <select
                                disabled={!isNewLoan}
                                className={`mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-pink-400 ${
                                  !isNewLoan ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""
                                }`}
                                value={selectedLoanType ?? ""}
                                onChange={e => {
                                  setSelectedLoanType(e.target.value);
                                  setInstallments(e.target.value);
                                }}
                            >
                                <option value="">තෝරන්න</option>
                                {loanTypes.map((lt, idx) => (
                                  <option key={loanTypesValue[idx]} value={loanTypesValue[idx]}>
                                    {lt}
                                  </option>
                                ))}
                            </select>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="font-medium text-pink-700">මුදල</label>
                            <input
                                type="number"
                                disabled={!isNewLoan}
                                value={amount || ""}
                                onChange={e => {
                                  const value = Number(e.target.value);
                                  if (value <= maxAmount) setAmount(value);
                                  else {
                                    toast.error(`Amount cannot exceed ${formatNumber(maxAmount)}`);
                                    setAmount(maxAmount);
                                  }
                                }}
                                className={`mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-pink-400 ${
                                  !isNewLoan ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""
                                }`}
                            />
                            <small className="text-gray-400">Max: {formatNumber(maxAmount)}</small>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="font-medium text-pink-700">කාල සීමාව (මාස)</label>
                            <input
                                type="number"
                                disabled={!isNewLoan}
                                value={duration || ""}
                                onChange={e => {
                                  const value = Number(e.target.value);
                                  if (value <= maxDuration) setDuration(value);
                                  else {
                                    toast.error(`Duration cannot exceed ${maxDuration}`);
                                    setDuration(maxDuration);
                                  }
                                }}
                                className={`mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-pink-400 ${
                                  !isNewLoan ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""
                                }`}
                            />
                            <small className="text-gray-400">Max: {maxDuration}</small>
                        </div>
                    </div>

                    {/* Interest + First Installment */}
                    <div className="flex flex-col sm:flex-row justify-between text-pink-700 font-semibold mt-2">
                        <span>පොලී අනුපාතය: {interest}%</span>
                        <span>පළමු වාරිකය: {formatNumber(firstInstallment)}</span>
                    </div>
                </div>

                {/* Guarantors */}
                {(selectedLoanType === "Long Term Loan" || selectedLoanType === "Project Loan") && (
                    <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-green-500">
                        {[{label: "පළමු ඇපකරු", value: firstGuranterId, setValue: setFirstGuranterId, data: firstGuranter, searchFn: searchFirstGuranter},
                          {label: "දෙවන ඇපකරු", value: secondGuranterId, setValue: setSecondGuranterId, data: secondGuranter, searchFn: searchSecondGuranter}
                        ].map((guar, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row items-center gap-3">
                                <label className="font-medium text-green-700 w-32">{guar.label}</label>
                                <input
                                    type="text"
                                    maxLength={3}
                                    value={guar.value || ""}
                                    onChange={async e => {
                                      guar.setValue(e.target.value);
                                      if (e.target.value.length === 3) await guar.searchFn(e.target.value);
                                    }}
                                    className="border rounded-lg p-2 w-full sm:w-24 text-center focus:ring-2 focus:ring-green-400"
                                />
                                <span className="text-gray-600 font-medium">{guar.data?.name || "-"}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reason */}
                <div className="h-auto bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-blue-500">
                    <p className="text-blue-600 font-semibold sm:text-base">ඉදිරිපත් කළ ණය අයදුම්පත:</p>
                    <textarea
                        className={`w-full h-auto focus:ring-2 focus:ring-blue-400 ${!isEligible ? "text-blue-600" : "text-blue-600"}`}
                        rows={4}
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        disabled={!isEligible}
                    />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">                      
                    <button
                        disabled={!isNewLoan || isValidating}
                        onClick={async () => { 
                          setIsValidating(true); 
                          await validateLoanGrant(); 
                        }}
                        className={`w-full h-12 text-white font-semibold rounded-lg transition ${
                          isNewLoan && !isValidating
                            ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                      {isValidating
                          ? 'අයදුම්පත සත්‍යාපනය වෙමින් පවතී...'
                          : !isEligible && isNewLoan
                            ? 'අයදුම්පත සත්‍යාපනය කරන්න'
                            : 'අයදුම්පත සත්‍යාපනය කර ඇත'}
                    </button>

                    <button
                        disabled={!isEligible || isSubmitting || isSubmitted || !isNewLoan}
                        onClick={async () => { setIsSubmitting(true); await handleLoanGrant(); }}
                        className={`w-full h-12 rounded-lg text-white font-semibold transition ${isEligible && !isSubmitted 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                        {!isSubmitted && isNewLoan ? 'අනුමැතිය සඳහා ඉදිරිපත් කරන්න' : isSubmitting ? 'අයදුම්පත ඉදිරිපත් වෙමින් පවතී' : 'ඉදිරිපත් කිරීම සම්පූර්ණයි'  }
                    </button>

                    {!isNewLoan && (
                      <button
                        disabled={isRemoved || isRemoving}
                        onClick={async () => { 
                          setIsRemoving(true); 
                          await handleDeleteApplication(); 
                        }}
                        className="w-full h-12 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
                      >
                        {!isRemoved ? 'ණය අයදුම්පත ඉවත් කරන්න' : 'ණය අයදුම්පත ඉවත් කළා'}
                      </button>
                    )}

                    <button
                      onClick={() => navigate(-1)}
                      // className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-xl p-3 font-semibold transition"
                      className="w-full h-12 text-gray-600 font-semibold border border-gray-600 hover:bg-purple-700 active:bg-purple-800 rounded-lg transition"
                    >
                      ආපසු යන්න
                    </button>
                </div>
            </div>
        </div>
    )
}