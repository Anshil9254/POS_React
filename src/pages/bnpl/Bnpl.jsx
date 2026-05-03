import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, CreditCard, ChevronRight, Store, ArrowUpRight, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const Bnpl = () => {
    const [debtors, setDebtors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserRole(user.role);
        fetchDebtors();
    }, []);

    const fetchDebtors = async () => {
        try {
            const response = await api.get('/bnpl');
            setDebtors(response.data);
        } catch (error) {
            console.error('Error fetching debtors:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredDebtors = debtors.filter(d =>
        d.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.customer?.phone.includes(searchTerm) ||
        d.storeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Grouping debtors by store for Admin
    const groupedDebtors = filteredDebtors.reduce((acc, debtor) => {
        const store = debtor.storeName || 'Other';
        if (!acc[store]) acc[store] = [];
        acc[store].push(debtor);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">BNPL Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Customers with outstanding payments (Buy Now Pay Later).</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by customer or store..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af3726] focus:border-[#d4af37]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="bg-white p-12 rounded-xl border border-gray-100 text-center text-gray-500">
                    Loading debtors list...
                </div>
            ) : Object.keys(groupedDebtors).length > 0 ? (
                Object.entries(groupedDebtors).map(([storeName, items]) => (
                    <div key={storeName} className="space-y-4">
                        {userRole === 'Admin' && (
                            <div className="flex items-center gap-2 text-primary border-b border-gray-100 pb-2">
                                <Store className="h-5 w-5 text-[#d4af37]" />
                                <h3 className="text-lg font-bold text-gray-800">{storeName}</h3>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((debtor, index) => (
                                <div key={`${debtor.customer?.customer_id}-${index}`} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold">
                                                    {debtor.customer?.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{debtor.customer?.name}</h4>
                                                    <p className="text-xs text-gray-500">{debtor.customer?.phone}</p>
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase">Due</span>
                                        </div>
                                        
                                        <div className="border-t border-gray-50 pt-4 flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Total Pending</p>
                                                <p className="text-2xl font-black text-red-600">₹{parseFloat(debtor.totalDebt).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                            </div>
                                            <Link
                                                to={`/bnpl/details/${debtor.customer?.customer_id}${userRole === 'Admin' ? `?storeId=${debtor.store_id}` : ''}`}
                                                className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1"
                                            >
                                                View History
                                                <ArrowUpRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="bg-white p-12 rounded-xl border border-gray-100 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                        <CheckCircle className="h-16 w-16 mb-4 text-green-500 opacity-20" />
                        <h3 className="text-xl font-bold text-gray-800">No Outstanding Payments</h3>
                        <p className="text-gray-500">All customers are clear.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bnpl;
