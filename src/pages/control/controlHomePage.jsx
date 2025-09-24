import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner";
import { formatNumber } from "../../utils/numberFormat.js";

export default function ControlHomePage() {
    const token = localStorage.getItem('token');
    const [isLoading, setIsLoading] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [pendingLoans, setPendingLoans] = useState([]);
    const [cashRegister, setCashRegister] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // 1️⃣ Fetch customers
                const cusRes = await axios.get(
                    import.meta.env.VITE_BACKEND_URL + '/api/customer'
                    // {
                    //     headers: { Authorization: `Bearer ${token}` }
                    // }
                );
                const customers = cusRes.data;
                setCustomers(customers);

                // 2️⃣ Fetch pending approvals
                const [approvalsRes, loansRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/approval`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/loanMaster/grant`)
                ]);

                setPendingApprovals(
                approvalsRes.data.map(loan => ({
                    ...loan,
                    customerName: customers.find(c => String(c.customerId) === String(loan.customerId))?.name || "Unknown"
                }))
                );

                setPendingLoans(
                loansRes.data.map(loan => ({
                    ...loan,
                    customerName: customers.find(c => String(c.customerId) === String(loan.customerId))?.name || "Unknown"
                }))
                );



                // 4️⃣ Fetch cash register account
                const cashRegisterRes = await axios.get(
                    import.meta.env.VITE_BACKEND_URL + '/api/ledgerAccounts'
                );
                const cashAccount = cashRegisterRes.data.find(account => account.headerAccountId === '325');
                setCashRegister(cashAccount);

            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    
    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-top bg-gradient-to-br from-orange-400 to-orange-200 p-4">
            <h1 className="text-2xl font-bold text-red-700 mb-4">Control Dashboard</h1>

            <div className="w-full bg-white rounded-xl shadow p-4">
                <h2 className="text-xl font-semibold text-gray-700">Pending Loans for Approval</h2>
                {pendingApprovals.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                        {pendingApprovals.map(loan => (
                            <li key={loan._id} className="text-gray-800">
                                <div>{loan.customerId} - {loan.customerName}</div>
                                <div className="text-end">{loan.loanType} - {formatNumber(loan.amount)}</div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 mt-2">No pending loans for approval</p>
                )}
            </div>

            <div className="w-full bg-white rounded-xl shadow p-4 mt-6">
                <h2 className="text-xl font-semibold text-gray-700">Pending Loans for Grant</h2>
                {pendingLoans.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                        {pendingLoans.map(loan => (
                            <li key={loan._id} className="text-gray-800">
                                <div>{loan.customerId} - {loan.customerName}</div>
                                <div className="text-end">{loan.loanType} - {formatNumber(loan.amount)}</div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 mt-2">No pending loans for grant</p>
                )}
            </div>

            <div className="w-full bg-white rounded-xl shadow p-4 mt-6">
                <h2 className="text-xl font-semibold text-gray-700">Cash Register</h2>

                {cashRegister ? (
                    <ul className="mt-2 space-y-1 flex justify-between">
                        <span>{cashRegister.accountName}</span>
                        <span>{formatNumber(cashRegister.accountBalance)}</span>
                    </ul>
                ) : (
                    <p className="text-gray-400 mt-2">No cash register account found</p>
                )}
            </div>
        </div>
    );
}
