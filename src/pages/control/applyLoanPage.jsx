import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatNumber } from "../../utils/numberFormat.js";

export default function ApplyLoanPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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
  const [reason, setReason] = useState("");
  const [isEligible, setIsEligible] = useState(false);

  const loanTypes = ["සුභසාධන ණය", "කෙටි කාලීන ණය", "දිගු කාලීන ණය", "ව්යාපෘති ණය"];
  const loanTypesValue = ["Welfare Loan", "Short Term Loan", "Long Term Loan", "Project Loan"];

  // Fetch applicant
  const searchApplicant = async (id) => {
    if (!id || id === "0") return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`);
      setApplicant(res.data);
      const loan = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/pending/${id}`);
      setApplicantLoans(loan.data);
      setSelectedLoanType("");
      setAmount("");
      setMaxAmount(0);
      setInterest(0);
      setDuration("");
      setMaxDuration(0);
      setFirstInstallment(0);     
      setReason(""); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Applicant not found");
    } finally {
      setIsLoading(false);
    }
  };

  const searchFirstGuranter = async (id) => {
    if (!id || id === "0") return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`);
      setFirstGuaranter(res.data);
      const loan = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/pending/${id}`);
      setFirstGuranterLoans(loan.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Member not found");
    } finally {
      setIsLoading(false);
    }
  };

  const searchSecondGuranter = async (id) => {
    if (!id || id === "0") return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`);
      setSecondGuaranter(res.data);
      const loan = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/pending/${id}`);
      setSecondGuranterLoans(loan.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Member not found");
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
      setFirstInstallment(((amount / duration) + (amount * (interest / 100))).toFixed(2));
    } else setFirstInstallment("");
  }, [selectedLoanType, amount, duration]);

  const validateLoanGrant = () => {
    setIsEligible(false);
    setReason("");
    if (!applicantId) return toast.error("පළමුව අයදුම්කරුගේ සාමාජික අංකය ඉදිරිපත් කරන්න.");
    if (!selectedLoanType) return toast.error("ණය වර්ගය තෝරන්න");
    if (!amount) return toast.error("ණය මුදල ඇතුළත් කරන්න");
    if (!duration) return toast.error("ආපසු ගෙවීමේ කාලය ඇතුළත් කරන්න");

    if (selectedLoanType === "Long Term Loan" || selectedLoanType === "Project Loan") {
      if (!firstGuranterId || !secondGuranterId) return toast.error("ඇපකරුවන්ගේ විස්තර සපයන්න");
      if (firstGuranterId === secondGuranterId) return toast.error("ඇපකරුවන්ට එකම සාමාජිකයෙකු විය නොහැක.");
      if (firstGuranterId === applicantId || secondGuranterId === applicantId) return toast.error("අයදුම්කරුට ඇපකරුවෙකු විය නොහැක.");
    }

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
    let sharesAmount = Number(applicant?.shares)

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
    //check membership fee
    //check shares and profits 
    //check other loans


    setReason("✅ඔබගේ ණය අයදුම්පත සූදානම් සහ ඉදිරිපත් කිරීමට සුදුසුකම් ලබා ඇත. අනුමැතිය සඳහා එය ඉදිරිපත් කිරීමට කරුණාකර පහත බොත්තම ක්ලික් කරන්න.");
    setIsEligible(true);
  };

  const handleLoanGrant = () => {

    toast.success("ඔබගේ ණය අයදුම්පත සාර්ථකව ඉදිරිපත් කර ඇත. අනුමැතිය සඳහා එය සමාලෝචනය කරන තෙක් රැඳී සිටින්න.");
  }
    
  return (
    <div className="flex flex-col w-full px-4 py-6 space-y-6">
      
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-indigo-700">🛒 ණය අයදුම්පත</h1>
        <p className="text-indigo-400">ඉක්මනින් සහ ආරක්ෂිතව ණයක් සඳහා අයදුම් කරන්න.</p>
      </div>

      {/* Applicant Card */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 shadow rounded-lg p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <label className="font-medium text-indigo-700">සාමාජික අංකය:</label>
          <input
            type="text"
            className="border border-indigo-300 rounded-md p-2 w-full md:w-24 text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
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

        {isLoading ? <LoadingSpinner /> : (
          <div className="space-y-2 text-indigo-700">
            <div className="font-semibold">{applicant?.name || ""}</div>
            <div className="">
                සම්බන්ධ වූ දිනය: {applicant?.joinDate?.slice(0, 10) || ""}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div>සාමාජික ගාස්තු: {formatNumber(applicant?.membership)}</div>
              <div>කොටස් මුදල: {formatNumber(applicant?.shares)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Loan Table */}
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead className="bg-indigo-100 text-indigo-700">
            <tr>
              <th className="border px-2 py-1">දිනය</th>
              <th className="border px-2 py-1">ණය වර්ගය</th>
              <th className="border px-2 py-1">මුදල</th>
              <th className="border px-2 py-1">ශේෂය</th>
            </tr>
          </thead>
          <tbody>
            {applicantLoans?.loans?.length ? applicantLoans.loans.map(loan => (
              <tr key={loan.id} className="hover:bg-indigo-50">
                <td className="border px-2 py-1">{loan.issuedDate}</td>
                <td className="border px-2 py-1">{loan.loanType}</td>
                <td className="border px-2 py-1">{formatNumber(loan.amount)}</td>
                <td className="border px-2 py-1">{formatNumber(loan.dueAmount)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="text-center py-2 text-gray-500">වෙනත් ණය ගෙන නැත</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Loan Inputs */}
      <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4 space-y-4 shadow">
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
                <label className="font-medium text-pink-700">ණය වර්ගය</label>
                <select
                    className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-pink-400"
                    value={selectedLoanType}
                    onChange={e => {
                    setSelectedLoanType(e.target.value);
                    setInstallments(e.target.value);
                    }}
                >
                    <option value="">ණය වර්ගය තෝරන්න</option>
                    {loanTypes.map((lt, idx) => (
                    <option key={loanTypesValue[idx]} value={loanTypesValue[idx]}>
                        {lt}
                    </option>
                    ))}
                </select>
            </div>

          <div className="flex-1">
            <label className="font-medium text-pink-700">මුදල</label>
            <input
              type="number"
              className="w-full border rounded p-2 focus:ring-2 focus:ring-pink-400"
              value={amount}
              onChange={e => {
                const value = Number(e.target.value);
                if (value <= maxAmount) setAmount(value);
                else { toast.error(`Amount cannot exceed ${formatNumber(maxAmount)}`); setAmount(maxAmount); }
              }}
              placeholder="Loan Amount"
            />
            <small>Max: {formatNumber(maxAmount)}</small>
          </div>
          <div className="flex-1">
            <label className="font-medium text-pink-700">කාල සීමාව (මාස)</label>
            <input
              type="number"
              className="w-full border rounded p-2 focus:ring-2 focus:ring-pink-400"
              value={duration}
              onChange={e => {
                const value = Number(e.target.value);
                if (value <= maxDuration) setDuration(value);
                else { toast.error(`Duration cannot exceed ${maxDuration}`); setDuration(maxDuration); }
              }}
              placeholder="Duration"
            />
            <small>Max: {maxDuration}</small>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 text-pink-700 font-medium">
          <div>පොලී අනුපාතය: {interest}%</div>
          <div>පළමු වාරිකය: {formatNumber(firstInstallment)}</div>
        </div>
      </div>

      {/* Guarantors */}
      {(selectedLoanType === "Long Term Loan" || selectedLoanType === "Project Loan") && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 space-y-4 shadow">
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <label className="font-medium text-green-700">පළමු ඇපකරයr</label>
            <input
              type="text"
              className="border rounded p-2 w-full sm:w-24 text-center focus:ring-2 focus:ring-green-400"
              maxLength={3}
              value={firstGuranterId}
              onChange={async e => { setFirstGuranterId(e.target.value); if (e.target.value.length===3) await searchFirstGuranter(e.target.value); }}
            />
            <span>{firstGuranter?.name}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <label className="font-medium text-green-700">දෙවන ඇපකරු</label>
            <input
              type="text"
              className="border rounded p-2 w-full sm:w-24 text-center focus:ring-2 focus:ring-green-400"
              maxLength={3}
              value={secondGuranterId}
              onChange={async e => { setSecondGuranterId(e.target.value); if (e.target.value.length===3) await searchSecondGuranter(e.target.value); }}
            />
            <span>{secondGuranter?.name}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button
          className="w-full sm:w-1/2 bg-gradient-to-r from-indigo-400 to-indigo-600 text-white rounded p-2 hover:from-indigo-500 hover:to-indigo-700"
          onClick={validateLoanGrant}
        >
            {isEligible ? 'යෙදුම සත්‍යාපනය කර ඇත' : 'ණය අයදුම්පත සත්‍යාපනය කරන්න'}
        </button>

        <div className="w-full sm:w-1/2 flex flex-col gap-2">
          <label className="font-medium text-pink-700">ඉදිරිපත් අයදුම්පත</label>
          <textarea
            className={`w-full border rounded p-2 focus:ring-2 focus:ring-pink-400 
              ${!isEligible ? "text-red-600" : "text-green-600"}`}
            rows={5}
            value={reason}
            onChange={e => setReason(e.target.value)}
            disabled={!isEligible} // prevent typing if not eligible
          />
        </div>

        <button
          className={`w-full sm:w-1/2 rounded p-2 ${isEligible ? 'bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:from-pink-500 hover:to-pink-700' : 'bg-gray-400 cursor-not-allowed'}`}
          disabled={!isEligible}
          onClick={handleLoanGrant}
        >
          ඉදිරිපත් කරන්න
        </button>
      </div>

    </div>
  );
}
