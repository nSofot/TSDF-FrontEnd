import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingSpinner from "../../components/loadingSpinner";
import { formatNumber } from "../../utils/numberFormat.js";

export default function LoanPage() {
  const [customers, setCustomers] = useState([]);
  const [welfareLoans, setWelfareLoans] = useState([]);
  const [shortTermLoans, setShortTermLoans] = useState([]);
  const [longTermLoans, setLongTermLoans] = useState([]);
  const [projectLoans, setProjectLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true);

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/customer`)
      .then((res) => {
        const customerList = res.data;
        setCustomers(customerList);

        return axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/pending-all`
        ).then((res) => {
          const loans = res.data;
          const enriched = loans.map((loan) => {
            const customer = customerList.find(
              (c) => c.customerId === loan.customerId
            );
            return {
              ...loan,
              customerName: customer
                ? customer.nameSinhala || customer.name
                : "Unknown Customer",
            };
          });

          setWelfareLoans(
            enriched.filter((l) => l.loanType === "Welfare Loan")
          );
          setShortTermLoans(
            enriched.filter((l) => l.loanType === "Short Term Loan")
          );
          setLongTermLoans(enriched.filter((l) => l.loanType === "Long Term Loan"));
          setProjectLoans(enriched.filter((l) => l.loanType === "Project Loan"));

          setIsLoading(false);
        });
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setIsLoading(false);
      });
  }, [location]);

  const sections = [
    { title: "සුභසාධන ණය", color: "orange", data: welfareLoans },
    { title: "කෙටි කාලීන ණය", color: "red", data: shortTermLoans },
    { title: "දිගු කාලීන ණය", color: "blue", data: longTermLoans },
    { title: "ව්‍යාපෘති ණය", color: "green", data: projectLoans },
  ];

  return (
    <div className="max-w-6xl w-full mx-auto p-3 flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl md:text-3xl font-bold text-orange-600">
          🧑‍🤝‍🧑 අයවිය යුතු ණය මුදල්
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          අයවිය යුතු ණය මුදල් ලැයිස්තුව
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {sections.map(({ title, color, data }) => (
            <div key={title} className="bg-white shadow-sm rounded-lg overflow-hidden">
              {/* Section Header */}
              <div
                className={`sticky top-0 bg-${color}-100 border-l-4 border-${color}-500 px-3 py-2`}
              >
                <h2
                  className={`text-${color}-700 font-semibold text-base md:text-lg`}
                >
                  {title}
                  <span className="ml-2 text-gray-500 text-xs md:text-sm">
                    ({data.length} entries)
                  </span>
                </h2>
              </div>

              {/* Table for Desktop */}
              <div className="hidden md:block overflow-x-auto">
                {data.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 font-semibold text-gray-600">ID</th>
                        <th className="px-3 py-2 font-semibold text-gray-600">
                          Customer Name
                        </th>
                        <th className="px-3 py-2 font-semibold text-gray-600 text-right">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.map((item) => (
                        <tr
                          key={item.customerId}
                          className={`hover:bg-${color}-50 cursor-pointer transition`}
                        >
                          <td className="px-3 py-2">{item.customerId}</td>
                          <td className="px-3 py-2">{item.customerName}</td>
                          <td className="px-3 py-2 text-right">
                            {formatNumber(item.dueAmount)}
                          </td>
                        </tr>
                      ))}
                      <tr className={`bg-${color}-50 font-semibold`}>
                        <td></td>
                        <td className={`px-3 py-2 text-${color}-700`}>Total</td>
                        <td
                          className={`px-3 py-2 text-right text-${color}-700`}
                        >
                          {formatNumber(
                            data.reduce((t, i) => t + i.dueAmount, 0)
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No {title} records found
                  </p>
                )}
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden space-y-2 p-2">
                {data.length > 0 ? (
                  data.map((item) => (
                    <div
                      key={item.customerId}
                      className={`p-3 rounded-xl bg-${color}-50 hover:bg-${color}-100 transition`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">
                          {item.customerName}
                        </span>
                        <span
                          className={`text-${color}-700 font-semibold text-sm`}
                        >
                          {formatNumber(item.dueAmount)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {item.customerId}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4 text-sm">
                    No {title} records
                  </p>
                )}
                {data.length > 0 && (
                  <div
                    className={`flex justify-between px-3 py-2 mt-2 bg-${color}-100 rounded-lg font-semibold text-${color}-700`}
                  >
                    <span>එකතුව​</span>
                    <span>
                      {formatNumber(data.reduce((t, i) => t + i.dueAmount, 0))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate("/control")}
        className="w-full md:w-auto h-12 rounded-lg border border-gray-700 text-gray-700 hover:bg-gray-200 font-semibold transition mt-3"
      >
        ආපසු යන්න
      </button>
    </div>
  );
}
