import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingSpinner from "../../components/loadingSpinner";

export default function MembersPage() {
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeRecord, setActiveRecord] = useState(null);    
    const [activeTab, setActiveTab] = useState('Overview');
    const token = localStorage.getItem("token");

    useEffect(() => {
        window.scrollTo(0, 0);
        setIsLoading(true);
        axios
            .get(import.meta.env.VITE_BACKEND_URL + "/api/customer")
            .then((res) => {
                setCustomers(res.data);
                setIsLoading(false);
            });
    }, [location]);

    return (
        <div className="max-w-5xl w-full h-full flex flex-col space-y-6 overflow-hidden">
            <div className="bg-white shadow rounded-md max-h-[calc(100vh-120px)] space-y-8">
                <div className="bg-gray-50 shadow-lg rounded-xl p-6 space-y-4 border-l-6 border-green-700">
                    <h1 className="text-xl md:text-2xl font-semibold text-green-700">🧑‍🤝‍🧑සාමාජික ලැයිස්තුව</h1>
                    <p className="text-sm text-green-700">පදනමේ සාමාජික ලැයිස්තුව</p>
                </div>
            </div>


            <div className="bg-gray-50 shadow-lg rounded-xl p-6 space-y-4 border-l-6 border-red-700 max-h-[calc(100vh-250px)] space-y-8 overflow-y-auto">
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="overflow-y-auto max-h-[calc(100vh-230px)]">
                        <table className="">
                            <tbody className="divide-y divide-orange-300">
                                {customers.map((item, index) => (
                                    <tr
                                        key={item.customerId}
                                        onClick={() => {
                                            setActiveRecord(item);
                                            setIsModalOpen(true);
                                        }}
                                        // className="cursor-pointer hover:bg-tableHover transition duration-150"                                        
                                        className="hover:bg-orange-200 transition duration-150"
                                    >
                                        <td className="px-2 py-2">{index + 1}</td>
                                        <td className="px-2 py-2">{item.customerId}</td>
                                        <td className="px-2 py-2">{item.nameSinhala ? item.nameSinhala : item.name }</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                appElement={document.getElementById('root')}
                contentLabel="Member Details"
                overlayClassName="fixed inset-0 bg-[#00000099] flex items-center justify-center"
                className="max-w-5xl w-full h-[97vh]-[100px] overflow-y-auto bg-orange-50 p-6 rounded-lg shadow-2xl border-4 border-gray-400"
            >
				{activeRecord && (
					<div className="space-y-4">
						<div className="w-full flex justify-between items-center pb-2">
							<h2 className="text-2xl font-bold text-orange-600">👤 Member Details</h2>
							<button
								className="text-gray-500 hover:text-gray-800"
								onClick={() => setIsModalOpen(false)}
							>
								✖
							</button>
						</div>
                        <div className="bg-orange-50 border border-orange-400 rounded-lg p-4 mt-4">
                        <table className="w-full text-sm text-left">
                            <tbody>
                            {[
                                ["Number", activeRecord.customerId],
                                ["Name", activeRecord.title ? `${activeRecord.title} ${activeRecord.name}` : activeRecord.name],
                                ["Address", activeRecord.address],
                                ["Mobile", activeRecord.mobile],
                                ["Email", activeRecord.email],
                                ["Status", activeRecord.status],
                                ["Date Joined", activeRecord.date ? activeRecord.date.slice(0, 10) : "—"],
                                ["Role", activeRecord.memberRole],
                                ["Notes", activeRecord.notes],
                            ].map(([label, value]) => (
                                <tr key={label} className="border-b border-gray-200">
                                <td className="py-2 font-medium text-orange-600 w-1/3">{label}</td>
                                <td className="py-2 text-gray-800">{value || "—"}</td>
                                </tr>
                            ))}

                            {/* Family Members Row */}
                            <tr className="border-b border-gray-200 align-top">
                                <td className="py-2 font-medium text-orange-600 w-1/4">Family</td>
                                <td className="py-2 text-gray-800">
                                {activeRecord.familyMembers && activeRecord.familyMembers.length > 0 ? (
                                    <ul className="space-y-1 list-disc list-inside">
                                    {activeRecord.familyMembers.map((fm, index) => (
                                        <li key={index} className="text-sm flex justify-between">
                                            <div className="flex justify-start space-x-2">
                                                <span className="text-orange-500 font-bold">•</span>
                                                <span className="font-semibold text-gray-700">{fm.name}</span>{" "}
                                            </div>
                                            <span
                                                className={`block text-sm capitalize ${
                                                    fm.relationship === "other" ? "text-red-600" : "text-gray-600"
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
        </div>
    );
}