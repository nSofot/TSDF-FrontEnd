import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingSpinner from "../../components/loadingSpinner";
import { formatNumber } from "../../utils/numberFormat.js";

export default function MembershipPage() {
  const [customers, setCustomers] = useState([]);
  const [creditCustomers, setCreditCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true);

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/customer`)
      .then((res) => {
        const filteredList = res.data
          .filter((customer) => customer.membership > 0)
          .sort((a, b) => a.customerId.localeCompare(b.customerId));

        const creditList = res.data
          .filter((customer) => customer.membership < 0)
          .sort((a, b) => a.customerId.localeCompare(b.customerId));

        setCustomers(filteredList);
        setCreditCustomers(creditList);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching customers:", err);
        setIsLoading(false);
      });
  }, [location]);

  return (
    <div className="max-w-6xl w-full mx-auto p-2 flex flex-col space-y-6">
      {/* Page Header */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-lg md:text-3xl font-bold text-orange-600">
          🧑‍🤝‍🧑 අයවිය යුතු සාමාජික මුදල්
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          අයවිය යුතු සාමාජික මුදල් ලැයිස්තුව
        </p>
      </div>

      {/* Customer Shares List */}
      <div className="bg-white overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full table-auto text-left border-collapse">
            <thead>
              <tr className="bg-orange-100">
                <th className="px-2 py-2 font-semibold text-orange-700">ID</th>
                <th className="px-2 py-2 font-semibold text-orange-700">නම​</th>
                <th className="px-2 py-2 font-semibold text-orange-700 text-right">මුදල​</th>
              </tr>
            </thead>

            {/* Positive Memberships */}
            <tbody className="divide-y divide-orange-300">
              {customers.map((item) => (
                <tr key={item.customerId} className="hover:bg-orange-100 cursor-pointer transition-colors">
                  <td className="px-2 py-2">{item.customerId}</td>
                  <td className="px-2 py-2">{item.nameSinhala || item.name}</td>
                  <td className="px-2 py-2 text-right">{formatNumber(item.membership)}</td>
                </tr>
              ))}
              <tr className="bg-orange-100 font-semibold">
                <td></td>
                <td className="px-2 py-2 text-orange-700">අයවිය යුතු</td>
                <td className="px-2 py-2 text-right text-orange-700">
                  {formatNumber(customers.reduce((total, item) => total + item.membership, 0))}
                </td>
              </tr>
            </tbody>

            {/* Negative Memberships */}
            <tbody className="divide-y divide-red-300">
              <tr>
                <td colSpan="3" className="py-3"></td>
              </tr>
              {creditCustomers.map((item) => (
                <tr key={item.customerId} className="hover:bg-red-50 cursor-pointer transition-colors">
                  <td className="px-2 py-2">{item.customerId}</td>
                  <td className="px-2 py-2">{item.nameSinhala || item.name}</td>
                  <td className="px-2 py-2 text-right text-red-600">{formatNumber(item.membership)}</td>
                </tr>
              ))}
              <tr className="bg-red-100 font-semibold">
                <td></td>
                <td className="px-2 py-2 text-red-700">ඉදිරියට ගෙවූ</td>
                <td className="px-2 py-2 text-right text-red-700">
                  {formatNumber(creditCustomers.reduce((total, item) => total + item.membership, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/control")}
        className="w-full md:w-auto h-12 rounded-lg border border-gray-700 text-gray-700 hover:bg-gray-200 font-semibold transition"
      >
        ආපසු යන්න
      </button>
    </div>
  );
}
