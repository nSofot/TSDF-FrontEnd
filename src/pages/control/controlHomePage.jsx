import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner";
import { formatNumber } from "../../utils/numberFormat.js";

export default function ControlHomePage() {
    const token = localStorage.getItem('token');
    const [isLoading, setIsLoading] = useState(true);
    const [customers, setCustomers] = useState([]);
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

                // 2️⃣ Fetch pending loans
                const penLoansRes = await axios.get(
                    import.meta.env.VITE_BACKEND_URL + '/api/loanMaster/pending-grant'
                    // {
                    //     headers: { Authorization: `Bearer ${token}` }
                    // }
                );

                // 3️⃣ Enrich each loan with customer name
                const enrichedLoans = penLoansRes.data.map(loan => {
                    const customer = customers.find(c => c.customerId === loan.customerId);
                    return {
                        ...loan,
                        customerName: customer ? customer.name : "Unknown"
                    };
                });

                setPendingLoans(enrichedLoans);

                // 4️⃣ Fetch cash register account
                const cashRegisterRes = await axios.get(
                    import.meta.env.VITE_BACKEND_URL + '/api/ledgerAccounts'
                    // {
                    //     headers: { Authorization: `Bearer ${token}` }
                    // }
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
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-200 to-yellow-100 p-4">
            <h1 className="text-2xl font-bold text-red-700 mb-4">Control Dashboard</h1>

            <div className="w-full max-w-md bg-white rounded-xl shadow p-4">
                <h2 className="text-xl font-semibold text-gray-700">Pending Loans for Grant</h2>
                {pendingLoans.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                        {pendingLoans.map(loan => (
                            <li key={loan._id} className="text-gray-800">
                                {loan.customerId} - {loan.customerName} - {loan.loanType} - {formatNumber(loan.amount)}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 mt-2">No pending loans</p>
                )}
            </div>

            <div className="w-full bg-white rounded-xl shadow p-4 mt-6">
                <h2 className="text-xl font-semibold text-gray-700">Cash Register</h2>
                {cashRegister ? (
                    <div className="w-full flex justify-between">
                      <p className="text-gray-800 mt-2">
                          {cashRegister.accountName}
                      </p>
                      <p className="text-gray-800 mt-2">
                          {formatNumber(cashRegister.accountBalance)}
                      </p>                      
                    </div>
                ) : (
                    <p className="text-gray-400 mt-2">No cash register account found</p>
                )}
            </div>

        </div>
    );
}
