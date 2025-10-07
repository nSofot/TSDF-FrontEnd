import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner";
import { formatNumber } from "../../utils/numberFormat.js";


export default function LoanGrantPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isGranting, setIsGranting] = useState(false);

    const [applicantId, setApplicantId] = useState("");
    const [loanDetails, setLoanDetails] = useState({});
    const [applicant, setApplicant] = useState({});
    const [selectedLoanType, setSelectedLoanType] = useState("");
    const [amount, setAmount] = useState("");
    const [interest, setInterest] = useState("");
    const [duration, setDuration] = useState("");
    const [firstInstallment, setFirstInstallment] = useState("");
    const [voucherNo, setVoucherNo] = useState("");
    const [error, setError] = useState("");

    // const loanTypes = ["සුභසාධන ණය", "කෙටි කාලීන ණය", "දිගු කාලීන ණය", "ව්යාපෘති ණය"];
    // const loanTypesValue = ["Welfare Loan", "Short Term Loan", "Long Term Loan", "Project Loan"];

    const [approvals, setApprovals] = useState({
        chairman: false,
        secretary: false,
        treasurer: false,
        executive: false,
        manager: false
    });


    // Fetch applicant
    const searchApplicant = async (id) => {
      if (!id || id === "0") return;
      setIsLoading(true);
      setSelectedLoanType("");
      setAmount("");
      setInterest(0);
      setDuration("");
      setFirstInstallment(0);  

      setApprovals({
          chairman: false,
          secretary: false,
          treasurer: false,
          executive: false,
          manager: false,
      });

      try {
        const appRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/pending-grant/${id}`);    
        if (appRes.data) {      
          setLoanDetails(appRes.data);

          const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`);
          setApplicant(res.data);

          if (appRes.data.loanType === "Welfare Loan") {
            setSelectedLoanType("සුභසාධන ණය");
          } else if (appRes.data.loanType === "Short Term Loan") {
            setSelectedLoanType("කෙටි කාලීන ණය");
          } else if (appRes.data.loanType === "Long Term Loan") {
            setSelectedLoanType("දිගු කාලීන ණය");
          } else if (appRes.data.loanType === "Project Loan") {
            setSelectedLoanType("ව්යාපෘති ණය");                       
          }
          setAmount(appRes.data.amount);
          setInterest(appRes.data.loanInterestRate);
          setDuration(appRes.data.loanDuration);          
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Applicant not found");
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
        if (loanDetails) {
            setApprovals({
                chairman: loanDetails.isApprovedChairman || false,
                secretary: loanDetails.isApprovedSecretary || false,
                treasurer: loanDetails.isApprovedTreasurer || false,
                executive: loanDetails.isApprovedExecutive || false,
                manager: loanDetails.isApprovedManager || false,
            });
        }
    }, [loanDetails]);    

    useEffect(() => {
      if (amount > 0 && duration > 0 && interest > 0) {
        setFirstInstallment(((amount / duration) + ((amount * interest) / 100)).toFixed(2));
      } else setFirstInstallment("");
    }, [selectedLoanType, amount, duration]);


    // function VoucherInput() {
    const checkVoucherExists = async (no) => {
        try {
          const trxType = "voucher";
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
    

    const validateLoanGrant = () => {
      setIsEligible(false);
      setReason("");
      if (!applicantId) return toast.error("පළමුව අයදුම්කරුගේ සාමාජික අංකය ඉදිරිපත් කරන්න.");
      if (!selectedLoanType) return toast.error("ණය වර්ගය තෝරන්න");
      if (!amount) return toast.error("ණය මුදල ඇතුළත් කරන්න");
      if (!duration) return toast.error("ආපසු ගෙවීමේ කාලය ඇතුළත් කරන්න");

      if (selectedLoanType === "Long Term Loan" || selectedLoanType === "Project Loan") {
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
          setReason("❌ ඔබගේ සාමාජික ගාස්තු ගෙවීම් යාවත්කාලීන නොවේ. එබැවින්, මෙම අවස්ථාවේදී ණයක් සඳහා අයදුම් කිරීමට ඔබට සුදුසුකම් නොමැත.");
          setIsEligible(false);
          return;
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
        if (firstGuarantorLoans.length > 0) {
            setReason("❌ තෝරාගත් පළමු ඇපකරු දැනටමත් තවත් ණයක් සඳහා අත්සන් කර ඇති අතර එම නිසා නැවත අත්සන් කිරීමට සුදුසුකම් නොලබයි.");
            setIsEligible(false);
            return;         
        } else if ((amount/4) > (Number(firstGuarantor.shares) + Number(firstGuarantor.profits))) {
            setReason("❌ මෙම ණය මුදල සඳහා අත්සන් කිරීමට පළමු ඇපකරුගේ කොටස් මුදල ප්‍රමාණවත් නොවේ.");
            setIsEligible(false);
            return;          
        }
        if (secondGuarantorLoans.length > 0) {
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
        
        if (!voucherNo) {
          setIsGranting(false);
          return toast.error("කරුණාකර වවුචර් අංකය ඇතුළත් කරන්න.");
        }
        const referenceNo = loanDetails.loanId;
        const lgAcIdCr = "325-0001";  //Manager Cash Book Account
        let lgAcIdDr = "";     //Loan Account
        let newReferenceNo = "";

        // const loanTypes = ["සුභසාධන ණය", "කෙටි කාලීන ණය", "දිගු කාලීන ණය", "ව්යාපෘති ණය"];
        // const loanTypesValue = ["Welfare Loan", "Short Term Loan", "Long Term Loan", "Project Loan"];      
        let loanTypeEnglish = "";
        switch (selectedLoanType) {
            case "සුභසාධන ණය":
                loanTypeEnglish = "Welfare Loan";
                lgAcIdDr = "330-0001";
                break;
            case "කෙටි කාලීන ණය":
                loanTypeEnglish = "Short Term Loan";
                lgAcIdDr = "330-0002";
                break;
            case "දිගු කාලීන ණය":
                loanTypeEnglish = "Long Term Loan";
                lgAcIdDr = "330-0003";
                break;
            case "ව්යාපෘති ණය":
                loanTypeEnglish = "Project Loan";
                lgAcIdDr = "330-0004";
                break;
            default:
                break;
        }
        try {
            //1️⃣create loan master
            try {
                const loanMasterpayload = {
                    issuedDate: new Date(),
                    isGranted: true,
                    voucherNumber: voucherNo
                }
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/update/${referenceNo}`, loanMasterpayload);
            } catch (error) {
                console.log('1️⃣⚠️ create loan master error: ', error);
            }

            // 2️⃣create loan transaction
            try {
                const loanTrxPayload = {
                    trxBookNo: voucherNo,
                    loanId: referenceNo,
                    customerId: applicantId,
                    transactionType: "voucher",
                    transactionDate: new Date(),
                    totalAmount: amount,
                    isCredit: false,
                    description: selectedLoanType
                };            
                const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/loanTransactions`, loanTrxPayload);         
                newReferenceNo = res.data.transaction.trxNumber;           
            } catch (error) {
                console.log('2️⃣⚠️ create loan transaction error: ', error);
            }

            //3️⃣update cash book
            try {
              const payload = {
                updates: [
                  {
                    accountId: lgAcIdCr,
                    amount: amount   // ✅ must be "amount"
                  }
                ]
              };

              await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts/subtract-balance`,
                payload

              );
            } catch (error) {
              console.log("3️⃣⚠️ update cash book error: ", error);
            }

            //4️⃣create cash book transaction
            try {
                const accTrxPayload = {
                    trxId: newReferenceNo,
                    trxBookNo: voucherNo,
                    trxDate: new Date(),
                    transactionType: "voucher",
                    accountId: lgAcIdCr,
                    description: selectedLoanType + " " + applicant.name,
                    isCredit: true,
                    trxAmount: amount
                }          
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerTransactions`, accTrxPayload);
            } catch (error) {
                console.log('4️⃣⚠️ create cash book transaction error: ', error); 
            }

            //5️⃣update loan account
            try {
              const payload = {
                updates: [
                  {
                    accountId: lgAcIdDr,
                    amount: amount   // ✅ must be "amount"
                  }
                ]
              };

              await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts/add-balance`,
                payload
                // {
                //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                // }
              );
            } catch (error) {
              console.log("5️⃣⚠️ update loan account error: ", error);
            }


            //6️⃣create cash book transaction
            try {
                const accTrxPayload = {
                    trxId: newReferenceNo,
                    trxBookNo: voucherNo,
                    trxDate: new Date(),
                    transactionType: "voucher",
                    accountId: lgAcIdDr,
                    description: selectedLoanType + " " + applicant.name,
                    isCredit: false,
                    trxAmount: amount
                }          
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerTransactions`, accTrxPayload);
            } catch (error) {
                console.log('6️⃣⚠️ create loan account transaction error: ', error); 
            }  
            
            //7️⃣create book reference
            try {
                const refPayload = {
                    referenceType: "voucher",
                    bookNo: voucherNo,
                    trxReference: newReferenceNo
                };
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/bookReferences`, refPayload);
            } catch (error) {
                console.log('3️⃣⚠️ create book reference error: ', error);
            } 

            toast.success("ඔබගේ ණය නිකුතුව සාර්ථකව අවසන් කර ඇත. කරුණාකර ඔබගේ ගිණුම පරීක්ෂා කරන්න.");
        } catch (error) {
            console.log(error);
        }
    }

    return (
      <div className="max-w-5xl w-full h-full flex flex-col space-y-6 overflow-hidden">

        {/* Header */}
        <div className="text-center p-2 border-b sticky top-0 z-10 mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">🛒 ණය ප්‍රදානය</h1>
          <p className="text-gray-600 text-sm">අනුමත ණය සඳහා මුදල් ගෙවීමේ පිටුව</p>
        </div>

        {/* Applicant Search */}
        <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-6 border-indigo-500">
            <div className="flex flex-col md:flex-row md:items-center gap-1">
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
            </div>

        {/* Applicant Card */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          applicant?.name && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-indigo-700 font-medium">
              <div className="flex justify-between">
                <span>නම:</span>
                <span>{applicant?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>ණය වර්ගය:</span>
                <span>{selectedLoanType}</span>
              </div>
              <div className="flex justify-between">
                <span>මුදල:</span>
                <span>රු. {formatNumber(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>කාලය (මාස):</span>
                <span>{duration}</span>
              </div>
              <div className="flex justify-between">
                <span>මාසික පොලී:</span>
                <span>{interest}%</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>පළමු වාරිකය:</span>
                <span>රු. {formatNumber(firstInstallment)}</span>
              </div>
            </div>
    
          )
        )}
        </div>

        {/* Approvals */}
        <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-6 border-teal-600">
          <p className="text-teal-600 font-semibold sm:text-base">ණය අනුමත කිරීම:</p>
          <div className="flex flex-col gap-2">
            {selectedLoanType === "ව්යාපෘති ණය" ||
            selectedLoanType === "දිගු කාලීන ණය" ? (
              <ApprovalCheckbox label="සභාපති" checked={approvals.chairman} />
            ) : null}

            <ApprovalCheckbox label="ලේකම්" checked={approvals.secretary} />

            {(selectedLoanType === "ව්යාපෘති ණය" ||
              selectedLoanType === "දිගු කාලීන ණය" ||
              selectedLoanType === "කෙටි කාලීන ණය") && (
              <ApprovalCheckbox label="භාණ්ඩාගාරික" checked={approvals.treasurer} />
            )}

            {selectedLoanType === "ව්යාපෘති ණය" && (
              <ApprovalCheckbox label="විධායක කමිටුව" checked={approvals.executive} />
            )}

            <ApprovalCheckbox label="කළමනාකරු" checked={approvals.manager} />
          </div>
        </div>

        {/* Voucher Input */}
        <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-6 border-pink-600">
          <label className="block font-medium text-pink-600 text-lg">වවුචර් අංකය</label>
          <input
            type="text"
            className={`text-pink-600 border border-pink-300 rounded-lg w-full p-3 text-center tracking-widest focus:ring-2 focus:ring-purple-500 outline-none ${
              error ? "border-red-500" : "border-gray-300"
            }`}
            value={voucherNo}
            placeholder="0000"
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setVoucherNo(val);
            }}
            onBlur={() => {
              const formatted = voucherNo.padStart(4, "0");
              setVoucherNo(formatted);
              if (formatted !== "0000") checkVoucherExists(formatted);
            }}
            maxLength={4}
          />
          {error && (
            <div className="bg-red-50 text-red-600 p-2 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Sticky Action Button */}
       <div className="mt-6">
          <button
            disabled={isGranting}
            onClick={async () => {
              setIsGranting(true);
              await handleLoanGrant();
            }}
            className={`w-full h-12 rounded-lg font-bold text-lg transition ${
              !isGranting
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                : "bg-gray-300 cursor-not-allowed text-gray-600"
            }`}
          >
            {isGranting ? "✅ ණය ප්‍රදානය සාර්ථකයි" : "ණය මුදල ලබා දෙන්න"}
          </button>

          <button
              onClick={() => navigate(-1)}
              className="mt-6 w-full h-12 rounded-lg font-semibold text-gray-600 border border-gray-600 hover:bg-red-600 transition"
          >
              ආපසු යන්න
          </button>          
        </div>
      </div>
    );

    // ✅ Reusable approval checkbox
    function ApprovalCheckbox({ label, checked }) {
      return (
        <label className="flex items-center gap-2 text-gray-700">
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="h-5 w-5 text-purple-600 rounded-md border-gray-300 focus:ring-purple-500"
          />
          {label} අනුමැතිය
        </label>
      );
    }
  }