import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";

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
        <div className="w-full h-full flex flex-col p-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">🛍️ Members</h1>
                    <p className="text-sm text-gray-500">Manage members</p>
                </div>
            </div>


            <div className="bg-white shadow rounded-md overflow-hidden">
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="overflow-y-auto max-h-[500px]">
                        <table className="w-full text-sm text-left border border-gray-200">
                            <thead className="bg-purple-600 text-white sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-2">#</th>
                                    <th className="px-4 py-2">Mem/Id</th>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Mobile</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {customers.map((item, index) => (
                                    <tr
                                        key={item.customerId}
                                        onClick={() => {
                                            setActiveRecord(item);
                                            setIsModalOpen(true);
                                        }}
                                        // className="cursor-pointer hover:bg-tableHover transition duration-150"                                        
                                        className="hover:bg-purple-100 transition duration-150"
                                    >
                                        <td className="px-4 py-2">{index + 1}</td>
                                        <td className="px-4 py-2 font-medium">{item.customerId}</td>
                                        <td className="px-4 py-2">{item.name}</td>
                                        <td className="px-4 py-2">{item.mobile}</td>
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
				contentLabel="Member Details"
				overlayClassName="fixed inset-0 bg-[#00000099] bg-opacity-50 flex items-center justify-center z-50"
				className="max-w-5xl w-full h-[97vh] overflow-y-auto bg-white p-6 rounded-lg shadow-2xl border-4 border-gray-400"
			>
				{activeRecord && (
					<div className="space-y-4">
						<div className="w-full flex justify-between items-center pb-2">
							<h2 className="text-2xl font-bold text-gray-800">👤 Member Details</h2>
							<button
								className="text-gray-500 hover:text-gray-800"
								onClick={() => setIsModalOpen(false)}
							>
								✖
							</button>
						</div>
                        <div>
				            <p className="text-lg font-semibold">Number: {activeRecord.customerId}</p>
                            <p className="text-lg font-semibold">Name  : {activeRecord.title ? `${activeRecord.title} ${activeRecord.name}` : activeRecord.name}</p>
                        </div>
		
						{/* Tabs */}
						<div className="flex border-b gap-6 text-sm font-medium text-gray-600">
							{['Overview' ].map(tab => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`pb-2 ${
								activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : ''
								}`}
							>
								{tab}
							</button>
							))}
						</div>

					   	{/* {activeTab === 'Overview' && (
							<CustomerOverview customerId={activeRecord.customerId} />
						)} */}
					</div>
				)}
			</Modal>

        </div>
    );
}
