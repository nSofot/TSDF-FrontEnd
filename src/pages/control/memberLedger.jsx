import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/loadingSpinner";
import { formatNumber } from "../../utils/numberFormat.js";
import ViewMemberLedger from "../../components/viewMemberLedger.jsx";


export default function MemberLedger() {
    const navigate = useNavigate();
    const [applicantId, setApplicantId] = useState("");
    const [applicant, setApplicant] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const formatLocalISODate = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    const [fromDate, setFromDate] = useState(() => {
        const today = new Date();
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1); // January = 0
        return formatLocalISODate(firstDayOfYear);
    });


    const [toDate, setToDate] = useState(() => formatLocalISODate(new Date()));
    const [error, setError] = useState("");

    const user = JSON.parse(localStorage.getItem("user") || "null");

    const validateDates = (start, end) => {
        if (start && end && new Date(start) > new Date(end)) {
        setError("⚠️ From Date must be earlier than To Date");
        } else {
        setError("");
        }
    };
  
  
    useEffect(() => {      
      if (user?.userId) {
        if (user.memberRole !== "treasurer" || user.memberRole !== "admin") {
            setApplicantId(user.userId);
            if (user.userId.length === 3) {
            searchApplicant(user.userId);
            }            
        }
      }
    }, [user?.userId]);

     // Fetch applicant
    const searchApplicant = async (id) => {
        if (!id || id === "0") return;

        setIsLoading(true);
        try {
            const appRes = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`
            );

            if (appRes.data) {
                setApplicant(appRes.data);
            } else {
                setApplicant({});
            }       
        } catch (err) {
            toast.error(err.response?.data?.message || "Member not found");
            setApplicant({});
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="max-w-5xl w-full h-full flex flex-col space-y-6 overflow-hidden">
            <div className="bg-white shadow rounded-md max-h-[calc(100vh-120px)] space-y-6 overflow-y-auto">
                <div className="p-6 space-y-4">
                    <h1 className="text-lg md:text-2xl font-bold text-orange-700">💵 සාමාජික මුදල් ලෙජරය</h1>
                    <p className="text-gray-600 text-sm sm:text-base">සියලුම සාමාජික මුදල් ගනුදෙනු සහ ශේෂයන් නිරීක්ෂණය කරන්න</p>
                </div>
            

                {/* Applicant Card */}
                <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-indigo-600 mt-6">
                    <div>
                        <label className="block text-sm font-medium text-indigo-600 mb-1">
                            සාමාජික අංකය
                        </label>

                        {user.memberRole === "treasurer"  || user.memberRole === "admin" ? (
                            <input
                                type="text"
                                className="w-full border border-indigo-300 rounded-lg p-3 text-center text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
                    ) : applicant ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-indigo-600 mb-1">
                                    සාමාජිකයාගේ නම
                                </label>
                                <div className="w-full bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center font-medium text-indigo-600">
                                    {applicant?.nameSinhala || applicant?.name || ""}
                                </div>
                            </div>

                            <div className="flex justify-between w-full bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center font-medium text-indigo-600">
                                <label className="block text-sm font-medium">
                                    ගිණුම් ශේෂය
                                </label>
                                Rs. {formatNumber(applicant?.membership) || ""}
                            </div>
                            {user?.memberRole === "treasurer" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-indigo-600">දින සිට</label>
                                        <input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => {
                                            setFromDate(e.target.value);
                                            validateDates(e.target.value, toDate);
                                            }}
                                            max={toDate}
                                            className="mt-1 w-full p-3 border border-indigo-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-indigo-600">දිනය දක්වා</label>
                                        <input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => {
                                            setToDate(e.target.value);
                                            validateDates(fromDate, e.target.value);
                                            }}
                                            min={fromDate}
                                            className="mt-1 w-full p-3 border border-indigo-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">සාමාජික ගිණුමක් සොයාගත නොහැක.</p>
                    )}
                </div>
                    
                {applicant ? (
                    <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border-l-4 border-green-600 mt-6">
                        <ViewMemberLedger customerId={applicant.customerId} fromDate={fromDate} toDate={toDate} />
                    </div>
                ) : (
                    <p className="text-center text-gray-500 mt-6">සාමාජික ගිණුමක් සොයාගත නොහැක.</p>
                )}
            </div>
                <button
                    onClick={() => navigate('/control')}
                    className="w-full h-12 text-gray-600 border border-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition mb-4"
                >
                    ආපසු යන්න
                </button>             
        </div>
    );
}
