import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingSpinner from "../../components/loadingSpinner";
import { FaUser } from "react-icons/fa";
import { formatNumber } from "../../utils/numberFormat.js";

export default function MembersPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true);

    axios
      .get(import.meta.env.VITE_BACKEND_URL + "/api/customer")
      .then((res) => {
        const filteredList = res.data
          .filter((customer) => customer.customerType === "shareholder")
          .sort((a, b) => a.customerId.localeCompare(b.customerId));

        setCustomers(filteredList);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching customers:", err);
        setIsLoading(false);
      });
  }, [location]);


  return (
    <div className="w-full max-w-6xl mx-auto p-2 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <h1 className="text-lg md:text-3xl font-bold text-orange-600">🧑‍🤝‍🧑 සාමාජික ලැයිස්තුව</h1>
        <p className="text-gray-600 text-sm md:text-base">පදනමේ සාමාජික ලැයිස්තුව</p>
      </div>

      {/* Members Table Card */}
      <div className="bg-white overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="min-w-full text-left divide-y divide-orange-300">
            <thead className="bg-orange-100">
              <tr>
                <th className="px-2 py-2 text-sm font-medium text-orange-700">#</th>
                <th className="px-2 py-2 px-2 text-sm font-medium text-orange-700">ID</th>
                <th className="px-2 py-2 text-sm font-medium text-orange-700">Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-300">
              {customers.map((item, index) => (
                <tr
                  key={item.customerId}
                  onClick={() => {
                    setActiveRecord(item);
                    setIsModalOpen(true);
                  }}
                  className="hover:bg-orange-100 cursor-pointer transition-colors"
                >
                  <td className="px-2 py-2">{index + 1}</td>
                  <td className="px-2 py-2">{item.customerId}</td>
                  <td className="px-2 py-2">{item.nameSinhala || item.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Member Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        appElement={document.getElementById("root")}
        overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
        className="max-w-3xl w-full bg-white rounded-xl shadow-2xl overflow-y-auto max-h-[90vh] p-6"
      >
        {activeRecord && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-orange-600 flex items-center gap-2">
                <FaUser /> Member Details
              </h2>
              <button
                className="text-gray-500 hover:text-gray-800 text-lg font-bold"
                onClick={() => setIsModalOpen(false)}
              >
                ✖
              </button>
            </div>

            <div className="bg-orange-50 rounded-lg shadow-sm p-4 flex flex-col gap-4">
              <table className="w-full text-sm text-left">
                <tbody>
                  {[
                    ["Number", activeRecord.customerId],
                    ["Name", activeRecord.title ? `${activeRecord.title} ${activeRecord.name}` : activeRecord.name],
                    ["In Sinhala", activeRecord.nameSinhala],
                    ["Address", activeRecord.address],
                    ["Mobile", activeRecord.mobile],
                    ["Phone", activeRecord.phone],
                    ["Email", activeRecord.email],
                    ["Status", activeRecord.isActive ? "Active" : "Inactive"],
                    ["Date Joined", activeRecord.date ? activeRecord.date.slice(0, 10) : "—"],
                    ["Role", activeRecord.memberRole ? activeRecord.memberRole.charAt(0).toUpperCase() + activeRecord.memberRole.slice(1) : "—"],
                    ["Mem/Fee", formatNumber(activeRecord.membership)],
                    ["Shares", formatNumber(activeRecord.shares)],
                    ["Notes", activeRecord.notes],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-gray-200">
                      <td className="py-2 font-medium text-orange-600 w-1/3">{label}</td>
                      <td className="py-2 text-gray-800">{value || "—"}</td>
                    </tr>
                  ))}

                  {/* Family Members */}
                  <tr className="border-b border-gray-200 align-top">
                    <td className="py-2 font-medium text-orange-600">Family</td>
                    <td className="py-2 text-gray-800">
                      {activeRecord.familyMembers?.length > 0 ? (
                        <ul className="space-y-1 list-disc list-inside">
                          {activeRecord.familyMembers.map((fm, idx) => (
                            <li key={idx} className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">{fm.name}</span>
                              <span
                                className={`text-sm capitalize ${
                                  fm.relationship === "other" ? "text-red-600" : "text-green-600"
                                }`}
                              >
                                {fm.relationship || "—"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
        <button
          onClick={() => navigate('/control')}
          className="w-full md:w-auto h-12 rounded-lg border border-gray-700 text-gray-700 hover:bg-gray-200 font-semibold transition"
        >
          ආපසු යන්න
        </button>     
    </div>
  );
}
