import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function MemberProfilePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [member, setMember] = useState({});

    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        if (user?.userId) {
        if (user.userId.length === 3) {
            searchCustomer(user.userId);
        }
        }
    }, [user?.userId]);

    const searchCustomer = async (id) => {
        if (!id || id === "0") return;

        setIsLoading(true);
        try {
        const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/customer/${id}`
        );
        if (res.data) setMember(res.data);
        } catch (err) {
        toast.error(err.response?.data?.message || "වලංගු නොවන සාමාජික අංකයක්");
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl w-full h-full flex flex-col space-y-6 overflow-hidden">
            <div className="bg-white shadow rounded-md max-h-[calc(100vh-150px)] space-y-8 overflow-y-auto">
                {/* Header */}
                <div className="bg-gray-50 shadow-lg rounded-xl p-6 space-y-4 border-l-6 border-green-700">
                    <h1 className="text-xl font-semibold text-gray-800">
                        ✏️ සාමාජිකයාගේ තොරතුරු
                    </h1>
                    <p className="text-sm text-gray-500">
                        සාමාජික තොරතුරු සහ පුද්ගලික දත්ත
                    </p>
                </div>

                {isLoading ? (
                    <p className="text-center text-gray-600">Loading...</p>
                ) : member && Object.keys(member).length > 0 ? (
                //   <div className="bg-gray-50 shadow-lg rounded-xl p-6 space-y-4 border-l-6 border-blue-700">
                    <div className="bg-white w-full p-4 sm:p-8 shadow rounded-xl border border-gray-200">
                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                            {/* Left Column */}
                            <div className="flex flex-col gap-3 flex-1 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Number
                                        </label>
                                        <div className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-gray-50">
                                            {member.customerId || "—"}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title
                                        </label>
                                        <div className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-gray-50">
                                            {member.title || "—"}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name (English)
                                    </label>
                                    <div className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-gray-50">
                                        {member.name || "—"}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name (Sinhala)
                                    </label>
                                    <div className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-gray-50">
                                        {member.nameSinhala || "—"}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Member Role
                                    </label>
                                    <div className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-gray-50 capitalize">
                                        {member.memberRole || "Not Assigned"}
                                    </div>
                                </div>

                                {/* Family Members */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Family Members
                                    </label>

                                    {member.familyMembers && member.familyMembers.length > 0 ? (
                                        <div className="space-y-2 border border-gray-200 p-2 rounded-lg bg-gray-50">
                                            {member.familyMembers.map((fm, index) => (
                                                <div
                                                    key={index}
                                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                                                >
                                                    <div className="w-full sm:w-2/3 flex justify-between">
                                                        <span className="block text-sm text-gray-800 font-medium">
                                                            {fm.name || "Unnamed"}
                                                        </span>                                                          
                                                        <span
                                                            className={`block text-sm capitalize ${
                                                                fm.relationship === "other" ? "text-red-600" : "text-gray-600"
                                                            }`}
                                                        >
                                                            {fm.relationship || "—"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No family members listed.</p>
                                    )}
                                </div>                                
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col gap-3 flex-1">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                                    </label>
                                    <div className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-gray-50">
                                        {Array.isArray(member.address)
                                            ? member.address.join(", ")
                                            : member.address || "—"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mobile
                                        </label>
                                        <div className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-gray-50">
                                            {member.mobile || "—"}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone
                                        </label>
                                        <div className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-gray-50">
                                            {member.phone || "—"}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <div className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-gray-50">
                                            {member.email || "—"}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <div className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-gray-50 min-h-[80px] whitespace-pre-wrap">
                                        {member.notes && member.notes.trim() !== ""
                                            ? member.notes
                                            : "No description available."}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Member Images
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-300 p-2 rounded-lg shadow-inner">
                                        {member.image && member.image.length > 0 ? (
                                            member.image.map((imgUrl, index) => (
                                            <div key={index} className="rounded-md overflow-hidden">
                                                <img
                                                    src={imgUrl}
                                                    alt={`Member image ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-md"
                                                />
                                            </div>
                                            ))
                                        ) : (
                                            <p className="col-span-full text-sm text-gray-500 text-center">
                                                No images available.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                <p className="text-center text-blue-700">
                    සාමාජික ගිණුම සොයාගත නොහැක.
                </p>
                )}
            </div>
        </div>
    );
}