import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingSpinner from "../../components/loadingSpinner";

export default function MembersPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const formatLocalISODate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const [markedDate, setMarkedDate] = useState(() =>
    formatLocalISODate(new Date())
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true);
    axios
      .get(import.meta.env.VITE_BACKEND_URL + "/api/customer")
      .then((res) => {
        setCustomers(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [location]);

  const handleCheckboxChange = (customerId) => {
    setSelectedMembers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId) // uncheck
        : [...prev, customerId] // check
    );
  };

    const handleSubmit = (e) => {
    e.preventDefault();

    if (customers.length === 0) return;

    setIsSubmitting(true);


    const data = customers
    .filter((member) => selectedMembers.includes(member.customerId)) // only checked members
    .map((member) => ({
        memberId: member.customerId,
        date: markedDate,
        isPresent: true, // since only checked members are saved
    }));

    axios
        .post(import.meta.env.VITE_BACKEND_URL + "/api/attendanceRecord", data)
        .then(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        })
        .catch(() => setIsSubmitting(false));
    };


  return (
    <div className="max-w-6xl mx-auto p-4 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <h1 className="text-lg md:text-3xl font-bold text-orange-600">
          🧑‍🤝‍🧑 පැමිණීම සලකුණු කිරීම
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          සාමාජිකයින්ගේ මාසික රැස්වීමට පැමිණීම සලකුණු කිරීම
        </p>
      </div>

      {/* Date Selector */}
      <div>
        <label className="text-sm font-semibold text-gray-700">දිනය</label>
        <input
          type="date"
          value={markedDate}
          disabled={isSubmitted || isSubmitting}
          onChange={(e) => setMarkedDate(e.target.value)}
          className="mt-1 w-full border rounded-lg p-2 border-gray-300 text-gray-700 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Members Table Card */}
      <div className="bg-white sm:p-6 overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="min-w-full text-left divide-y divide-orange-300">
            <tbody className="divide-y divide-orange-300">
              {customers.map((item) => (
                <tr key={item.customerId}>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(item.customerId)}
                      onChange={() => handleCheckboxChange(item.customerId)}
                      disabled={isSubmitted || isSubmitting}
                      className="h-5 w-5 text-purple-600 rounded-md border-gray-300 focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-3 py-2">{item.customerId}</td>
                  <td className="px-3 py-2">{item.nameSinhala || item.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Marked Count */}
      <p className="mt-4">
        Marked Count: {selectedMembers.length} / {customers.length}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          disabled={isSubmitting || isSubmitted}
          onClick={handleSubmit}
          className={`w-full sm:w-1/2 py-3 rounded-lg text-white font-semibold transition-all ${
            isSubmitting || isSubmitted
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isSubmitting
            ? "ඉදිරිපත් කිරීම සිදු වෙමින් පවතී ..."
            : isSubmitted
            ? "ඉදිරිපත් කිරීම අවසන්"
            : "ඉදිරිපත් කරන්න"}
        </button>
        <button
          disabled={isSubmitting}
          onClick={() => navigate("/control")}
          className="w-full sm:w-1/2 py-3 border border-gray-400 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          ආපසු යන්න
        </button>
      </div>
    </div>
  );
}
