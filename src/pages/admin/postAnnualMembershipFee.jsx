import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner";
import { formatNumber } from "../../utils/numberFormat.js";
import toast from "react-hot-toast";

export default function PostAnnualMembershipFee() {
    const [isLoading, setIsLoading] = useState(true);

    const [postingDate, setPostingDate] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), 0, 1);
    });

    const [customers, setCustomers] = useState([]);
    const [isPosting, setIsPosting] = useState(false);
    const [isPosted, setIsPosted] = useState(false);


    useEffect(() => {
    const fetchCustomers = async () => {
        try {
        window.scrollTo(0, 0);
        setIsLoading(true);

        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer`);

        // ✅ enrich each customer with annualFee = 150 + (75 * count of 'other' family members)
        const enrichedCustomers = res.data.map((customer) => {
            const otherCount = customer.familyMembers
            ? customer.familyMembers.filter(fm => fm.relationship === 'other').length
            : 0;

            return {
            ...customer,
            annualFee: 150 + ( 75 * otherCount ),
            };
        });

        setCustomers(enrichedCustomers);
        } catch (err) {
        console.error("Error fetching customers:", err);
        } finally {
        setIsLoading(false);
        }
    };

    fetchCustomers();
    }, []);

    const handlePost = async () => {
        setIsPosting(true);

        try {
            for (const customer of customers) {
                // 1️⃣ post annual membership fee for the customer
                try {
                    const customerPayload = {
                        updates: [
                            {
                                customerId: customer.customerId,
                                amount: parseFloat(customer.annualFee) || 0, // use enriched annualFee
                            },
                        ],
                    };
                    await axios.put(
                        `${import.meta.env.VITE_BACKEND_URL}/api/customer/membershipFee-add`,
                        customerPayload
                    );
                } catch (err) {
                    console.error(`1️⃣⚠️ Error posting fee for customer ${customer.customerId}:`, err);
                }

                // 2️⃣ post annual membership fee transaction for the customer
                try {
                    const trxPayload = {
                        trxBookNo: "",
                        customerId: customer.customerId,
                        transactionDate: new Date(postingDate).toISOString(),
                        trxAmount: parseFloat(customer.annualFee) || 0,
                        transactionType: "membershipFee",
                        isCredit: false,
                        description: `Annual membership fee for ${postingDate.getFullYear()}`,
                    };
                    const res = await axios.post(
                        `${import.meta.env.VITE_BACKEND_URL}/api/membershipTransactions/create`,
                        trxPayload
                    );

                 } catch (err) {
                    console.error(`2️⃣⚠️ Error posting fee transaction for customer ${customer.customerId}:`, err);
                }
            }

            setIsPosted(true);
            toast.success("Annual membership fee posted successfully for all customers!");
        } catch (err) {
            console.error("⚠️ Error posting fees:", err);
            toast.error("Error posting some fees. Check console for details.");
        } finally {
            setIsPosting(false);
        }
    };


    return (
        <div className="w-full h-full flex flex-col items-center p-6">
            <div className="flex flex-col items-center mb-4">
                <p className="text-3xl font-bold text-gray-700">
                    Post Annual Membership Fee
                </p>
                <p className="text-xl text-gray-600">
                    Year: {postingDate.getFullYear()}
                </p>
            </div>

            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <div className="h-[70vh] overflow-y-auto w-4xl flex flex-col gap-2 p-4 rounded-md border border-gray-200">
                    {customers.map((customer) => (
                        <div
                            key={customer._id || customer.customerId}
                            className="flex justify-between items-center p-3 rounded-md bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                        >
                            <div className="flex gap-3 items-center">
                                <p className="text-sm text-gray-500">
                                    {customer.customerId}
                                </p>
                                <p className="font-medium text-gray-800">
                                    {customer.name}
                                </p>
                            </div>
                            <span className="font-semibold text-blue-700">
                                {formatNumber(customer.annualFee || 0)}
                            </span>
                        </div>
                    ))}
                </div>                                
            )}
            <p className="text-sm text-gray-500 mt-4">
                Total:{" "}
                {formatNumber(
                    customers.reduce((total, customer) => total + (customer.annualFee || 0), 0)
                )}
            </p>
            <button
                disabled={isPosting || isPosted}
                onClick={async () => {
                    setIsPosting(true);
                    await handlePost();
                    setIsPosting(false);
                    setIsPosted(true);
                }}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                {isPosting ? "Posting..." : isPosted ? "Posted" : "Post Annual Fee"}
            </button>
        </div>
    );
}
