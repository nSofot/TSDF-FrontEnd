import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import mediaUpload from "../../utils/mediaUpload";

export default function AddCustomerPage() {
    const navigate = useNavigate();

    const [customerId, setCustomerId] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [mobile, setMobile] = useState("");
    const [image, setImage] = useState([]);
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [notes, setNotes] = useState("");


    const handleAddProduct = async () => {
        const token = localStorage.getItem("token");
        if (!token) return toast.error("Please log in first.");

        if (!name || !address) {
            return toast.error("Please fill in all fields.");
        }

        // if (image.length === 0) {
        //     return toast.error("Please select at least one product image.");
        // }

        try {         
            const uploadedImages = await Promise.all(image.map((img) => mediaUpload(img)));
            const newCustomer = {
                customerId,
                name,
                // customerType,
                // title,
                address,
                mobile,
                phone,
                email,
                // image: uploadedImages,
                // birthDate,
                notes,
                // isActive
            };
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/customer`, newCustomer, {
              headers: { Authorization: `Bearer ${token}` },
            });

            toast.success("Member added successfully!");
            navigate(-1);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="w-full h-full flex flex-col p-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">🛒 Add New Member</h1>
                    <p className="text-sm text-gray-500">Fill the member details to add it</p>
                </div>
                {/* Add Button */}
                <div className="flex justify-end gap-6">
                    <button
                        onClick={handleAddProduct}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-smfont-medium shadow-md transition duration-300"
                    >
                        Add Member
                    </button>
                
                    <Link
                        to="/admin/member"
                        className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-md text-sm font-medium shadow"
                    >
                        Cancel
                    </Link>
                </div>
            </div>

            <div className="bg-white w-full h-full px-10 py-6 shadow rounded-xl border border-gray-200 flex flex-col">
                <div className="flex justify-between">
                    {/* Left Column */}
                    <div className="w-[55%] h-full space-y-10">
                        <div className="w-full flex justify-between">
                            <div className="w-[20%]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Member ID</label>
                                <input
                                  type="text"
                                  value={customerId}
                                  onChange={(e) => setCustomerId(e.target.value)}
                                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="w-[75%]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Member Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Apple iPhone 15"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address (comma-separated)</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. No 123, Main Street, Kegalle."
                            />
                        </div>

                        <div className="w-full flex justify-between">
                            <div className="w-[25%]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                <input
                                  type="text"
                                  value={mobile}
                                  onChange={(e) => setMobile(e.target.value)}
                                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="e.g. 0711234567"
                                />
                            </div>
                            <div className="w-[25%]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. 0761234567"
                                />
                            </div>
                            <div className="w-[45%]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. 150"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                rows="3"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Write a notes here..."
                            ></textarea>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className="w-[40%] h-full rounded-lg flex flex-col justify-between">
                        <p className="text-sm text-gray-700 font-medium mb-1">Selected Images</p>
                        <div className="w-full h-80 overflow-y-auto bg-white rounded-md shadow-inner">
                            {image.length > 0 && (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-3 gap-3">
                                        {image.map((file, index) => (
                                            <div key={`new-${index}`} className="relative border rounded-md overflow-hidden group">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`new-${index}`}
                                                    className="w-full h-20 object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                      const filtered = image.filter((_, i) => i !== index);
                                                      setImage(filtered);
                                                    }}
                                                    className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs rounded-full px-2 py-0.5 hover:bg-red-600"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
                            <input
                                type="file"
                                multiple
                                onChange={(e) => setImage(Array.from(e.target.files))}
                                className="w-full text-sm text-blue-500 font-italic file-input file-input-bordered rounded-lg cursor-pointer hover:text-blue-800"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}