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
  const [isGranted, setIsGranted] = useState(false);

  const [applicantId, setApplicantId] = useState("");
  const [loanDetails, setLoanDetails] = useState(null);
  const [applicant, setApplicant] = useState(null);
  const [selectedLoanType, setSelectedLoanType] = useState("");
  const [amount, setAmount] = useState("");
  const [interest, setInterest] = useState("");
  const [duration, setDuration] = useState("");
  const [firstInstallment, setFirstInstallment] = useState("");
  const [voucherNo, setVoucherNo] = useState("");
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");

  const [approvals, setApprovals] = useState({
    chairman: false,
    secretary: false,
    treasurer: false,
    executive: false,
    manager: false,
  });

  // ✅ fetch applicant
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
      const appRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/pending-grant/${id}`
      );
      if (appRes.data) {
        setLoanDetails(appRes.data);

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`
        );
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
      setApplicant(null);
      setLoanDetails(null);
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
      setFirstInstallment(
        ((amount / duration) + (amount * interest) / 100).toFixed(2)
      );
    } else setFirstInstallment("");
  }, [selectedLoanType, amount, duration]);

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

  const handleLoanGrant = async () => {
    if (!voucherNo) {
      setIsGranting(false);
      return toast.error("කරුණාකර වවුචර් අංකය ඇතුළත් කරන්න.");
    }

    const referenceNo = loanDetails.loanId;
    const lgAcIdCr = "325-0001"; //Manager Cash Book Account
    let lgAcIdDr = "";
    let newReferenceNo = "";

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

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/update/${referenceNo}`,
        {
          issuedDate: new Date(voucherDate).toISOString(),
          isGranted: true,
          voucherNumber: voucherNo,
        }
      );

      const loanTrxPayload = {
        trxBookNo: voucherNo,
        loanId: referenceNo,
        customerId: applicantId,
        transactionDate: new Date(voucherDate).toISOString(),
        interest: parseFloat(0),
        installment: parseFloat(0),   
        totalAmount: Number(amount),     
        transactionType: "voucher",
        isCredit: false,
        description: loanTypeEnglish,      
      };
     
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/loanTransactions`,
        loanTrxPayload
      );
      newReferenceNo = res.data.transaction.trxNumber;

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts/subtract-balance`,
        { updates: [{ accountId: lgAcIdCr, amount: amount }] }
      );

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledgerTransactions`,
        {
          trxId: String(newReferenceNo),
          trxBookNo: String(voucherNo),
          trxDate: new Date(voucherDate).toISOString(),
          transactionType: "voucher",
          transactionCategory: selectedLoanType,
          accountId: lgAcIdCr,
          description: (applicant.nameSinhala || applicant.name),
          isCredit: true,
          trxAmount: parseFloat(amount),
        }
      );

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts/add-balance`,
        { updates: [{ accountId: lgAcIdDr, amount: amount }] }
      );

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledgerTransactions`,
        {
          trxId: String(newReferenceNo),
          trxBookNo: String(voucherNo),
          trxDate: new Date(voucherDate).toISOString(),
          transactionType: "voucher",
          transactionCategory: selectedLoanType,
          accountId: lgAcIdDr,
          description: (applicant.nameSinhala || applicant.name),
          isCredit: false,
          trxAmount: parseFloat(amount),
        }
      );

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/bookReferences`, {
        transactionType: "voucher",
        trxBookNo: voucherNo,
        trxReference: newReferenceNo,
      });

      setIsGranting(false);
      setIsGranted(true);
      toast.success(
        "ඔබගේ ණය නිකුතුව සාර්ථකව අවසන් කර ඇත. කරුණාකර ඔබගේ ගිණුම පරීක්ෂා කරන්න."
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-5xl w-full h-full flex flex-col space-y-6 overflow-hidden">
      {/* Header */}
      <div className="text-center p-2 mb-8">
        <h1 className="text-lg md:text-3xl font-extrabold text-orange-600">
          🛒 ණය ප්‍රදානය
        </h1>
        <p className="text-gray-600 text-sm">
          අනුමත ණය සඳහා මුදල් ගෙවීමේ පිටුව
        </p>
      </div>

      {/* Applicant Search */}
      <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-indigo-500">
        <div className="flex flex-col md:flex-row md:items-center gap-1">
          <label className="font-semibold text-indigo-700 w-40">
            සාමාජික අංකය:
          </label>
          <input
            type="text"
            className="border border-indigo-300 rounded-lg p-2 w-full md:w-24 text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="000"
            maxLength={3}
            value={applicantId}
            onChange={async (e) => {
              setApplicant(null);
              const value = e.target.value;
              setApplicantId(value);
              if (value.length === 3) await searchApplicant(value);
            }}
          />
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : applicant ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-indigo-700 font-medium">
            <div className="w-[250px] flex justify-between">
              <span>නම:</span>
              <span>{applicant?.nameSinhala || applicant?.name}</span>
            </div>
            <div className="w-[250px] flex justify-between">
              <span>ණය වර්ගය:</span>
              <span>{selectedLoanType}</span>
            </div>
            <div className="w-[250px] flex justify-between">
              <span>මුදල:</span>
              <span>රු. {formatNumber(amount)}</span>
            </div>
            <div className="w-[250px] flex justify-between">
              <span>කාලය (මාස):</span>
              <span>{duration}</span>
            </div>
            <div className="w-[250px] flex justify-between">
              <span>මාසික පොලී:</span>
              <span>{interest}%</span>
            </div>
            <div className="w-[250px] flex justify-between font-bold">
              <span>පළමු වාරිකය:</span>
              <span>රු. {formatNumber(firstInstallment)}</span>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-600 border rounded-lg bg-gray-50">
            ⚠️ අනුමත ණය ගිණුමක් සොයාගත නොහැක.
          </div>
        )}
      </div>

      {/* ✅ Show remaining sections only if applicant found */}
      {applicant && (
        <>
          {/* Approvals */}
          <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-teal-600">
            <p className="text-teal-600 font-semibold sm:text-base">
              ණය අනුමත කිරීම:
            </p>
            <div className="flex flex-col gap-2">
              {(selectedLoanType === "ව්යාපෘති ණය" ||
                selectedLoanType === "දිගු කාලීන ණය") && (
                <ApprovalCheckbox label="සභාපති" checked={approvals.chairman} />
              )}

              <ApprovalCheckbox label="ලේකම්" checked={approvals.secretary} />

              {(selectedLoanType === "ව්යාපෘති ණය" ||
                selectedLoanType === "දිගු කාලීන ණය" ||
                selectedLoanType === "කෙටි කාලීන ණය") && (
                <ApprovalCheckbox
                  label="භාණ්ඩාගාරික"
                  checked={approvals.treasurer}
                />
              )}

              {selectedLoanType === "ව්යාපෘති ණය" && (
                <ApprovalCheckbox label="විධායක කමිටුව" checked={approvals.executive} />
              )}

              <ApprovalCheckbox label="කළමනාකරු" checked={approvals.manager} />
            </div>
          </div>

          {/* Voucher Input */}
          <div className="flex flex-col sm:flex-row sm:justify-between bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-pink-600">
            <div>
                <label className="block font-medium text-pink-600 text-lg">
                  වවුචර් අංකය
                </label>
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

            <div>
                <label className="text-sm font-semibold text-orange-500">දිනය</label>
                <input
                type="date"
                disabled={isGranting}
                value={voucherDate}
                onChange={(e) => setVoucherDate(e.target.value)}
                className="mt-1 w-full border rounded-lg p-3 text-orange-500 border-orange-300 focus:ring-2 focus:ring-orange-500"
                />
            </div>              
          </div>

          {/* Buttons */}
          <div className="mt-6">
            <button
              disabled={isGranting || isGranted}
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
              {isGranting ?  "Processing ..." : isGranted ? "✅ ණය ප්‍රදානය සාර්ථකයි" : "ණය මුදල ලබා දෙන්න"}
            </button>

            <button
              onClick={() => navigate("/control")}
              className="mt-6 w-full h-12 rounded-lg font-semibold text-gray-600 border border-gray-600 hover:bg-gray-600 hover:text-white transition"
            >
              ආපසු යන්න
            </button>
          </div>
        </>
      )}
    </div>
  );

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
