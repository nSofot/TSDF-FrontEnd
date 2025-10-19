import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingSpinner from "../../components/loadingSpinner";
import { formatNumber } from "../../utils/numberFormat.js";

export default function SharesPage() {
  const [customers, setCustomers] = useState([]);
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
          .sort((a, b) => a.customerId.localeCompare(b.customerId));
          setCustomers(filteredList);
        setIsLoading(false);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [location]);

  return (
    <div className="max-w-6xl w-full mx-auto p-2 flex flex-col space-y-6">
      {/* Page Header */}
      <div className="flex flex-col items-start items-center gap-2">
          <h1 className="text-lg md:text-3xl font-bold text-orange-600">🧑‍🤝‍🧑 සාමාජික කොටස් මුදල්</h1>
          <p className="text-gray-600 text-sm md:text-base">පදනමේ සාමාජික කොටස් මුදල් සහ ලාභාංශ ලැයිස්තුව</p>
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
                <th className="px-2 py-2 text-sm font-semibold text-orange-700">ID</th>
                <th className="px-2 py-2 text-sm font-semibold text-orange-700">Name</th>
                <th className="px-2 py-2 text-sm font-semibold text-orange-700 text-right">Shares</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-300">
              {customers.map((item) => (
                <tr
                  key={item.customerId}
                  className="hover:bg-orange-100 cursor-pointer transition-colors"
                >
                  <td className="px-2 py-2">{item.customerId}</td>
                  <td className="px-2 py-2">{item.nameSinhala || item.name}</td>
                  <td className="px-2 py-2 text-right">{formatNumber(item.shares)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-orange-100">
                <th className="px-2 py-2 text-sm font-semibold text-orange-700">Total</th>
                <th className="px-2 py-2 text-sm font-semibold text-orange-700"></th>
                <th className="px-2 py-2 text-sm font-semibold text-orange-700 text-right">
                  {formatNumber(customers.reduce((total, item) => total + item.shares, 0))}
                </th>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
        <button
          onClick={() => navigate('/control')}
          className="w-full md:w-auto h-12 rounded-lg border border-gray-700 text-gray-700 hover:bg-gray-200 font-semibold transition"
        >
          ආපසු යන්න
        </button>         
    </div>
  );
}
