import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, FileText, IndianRupee, CreditCard, Banknote, QrCode, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const BnplDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const storeId = queryParams.get('storeId');

    const [customer, setCustomer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [settlingBill, setSettlingBill] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserRole(user.role);
        fetchDetails();

        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            const rzpScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
            if (rzpScript) rzpScript.remove();
        };
    }, [id, storeId]);

    const fetchDetails = async () => {
        try {
            const url = storeId ? `/bnpl/customer/${id}?storeId=${storeId}` : `/bnpl/customer/${id}`;
            const response = await api.get(url);
            setCustomer(response.data);
        } catch (error) {
            console.error('Error fetching details:', error);
            alert('Failed to load customer details.');
            navigate('/bnpl');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSettleSubmit = async (e) => {
        e.preventDefault();
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) return alert('Enter valid amount');
        if (parseFloat(paymentAmount) > settlingBill.balance) return alert('Amount cannot exceed balance');

        const submitSettlement = async (razorpayPaymentId = null) => {
            setIsSubmitting(true);
            try {
                await api.post('/bnpl/settle', {
                    billId: settlingBill.bill_id,
                    amount: parseFloat(paymentAmount),
                    paymentMethod: paymentMethod,
                    razorpayPaymentId: razorpayPaymentId
                });
                setSettlingBill(null);
                setPaymentAmount('');
                fetchDetails();
            } catch (error) {
                console.error('Settlement failed:', error);
                alert(error.response?.data?.message || 'Payment settlement failed.');
            } finally {
                setIsSubmitting(false);
            }
        };

        if (paymentMethod !== 'Cash') {
            try {
                setIsSubmitting(true);
                const orderRes = await api.post('/razorpay/create-order', { amount: parseFloat(paymentAmount) });
                
                if (!orderRes.data.success) {
                    setIsSubmitting(false);
                    return alert(orderRes.data.message || 'Failed to initialize payment');
                }

                const options = {
                    key: orderRes.data.keyId,
                    amount: orderRes.data.amount,
                    currency: orderRes.data.currency,
                    name: orderRes.data.storeName || 'POS System',
                    description: `Bill Settlement #${settlingBill.bill_number}`,
                    order_id: orderRes.data.orderId,
                    handler: function (response) {
                        submitSettlement(response.razorpay_payment_id);
                    },
                    prefill: {
                        name: customer?.customer?.name || 'Customer',
                        contact: customer?.customer?.phone || ''
                    },
                    theme: { color: '#3399cc' }
                };
                
                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    setIsSubmitting(false);
                    alert("Payment Failed: " + response.error.description);
                });
                rzp.open();
            } catch (error) {
                setIsSubmitting(false);
                console.error("Payment initialization error:", error);
                alert(error.response?.data?.message || "Failed to initialize payment gateway");
            }
        } else {
            submitSettlement();
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-64">Loading details...</div>;

    const unpaidBills = customer?.bills?.filter(b => b.balance > 0) || [];
    const totalDebt = parseFloat(customer?.totalDebt || 0);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link to="/bnpl" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft className="h-6 w-6 text-gray-600" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{customer?.customer?.name}</h2>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {customer?.customer?.phone}</p>
                </div>
                <div className="ml-auto text-right">
                    <p className="text-xs text-gray-400 uppercase font-black">Total Outstanding</p>
                    <h2 className="text-3xl font-black text-red-600">₹{parseFloat(customer?.totalDebt || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Unpaid Bills */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-red-50/30 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <h3 className="text-lg font-bold text-red-800">Unpaid / Partial Bills</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-3 text-left">Date</th>
                                    <th className="px-6 py-3 text-left">Bill No</th>
                                    <th className="px-6 py-3 text-left">Total Amount</th>
                                    <th className="px-6 py-3 text-left">Paid Amount</th>
                                    <th className="px-6 py-3 text-left text-red-600">Balance Due</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {customer?.bills?.filter(b => b.balance > 0).length > 0 ? (
                                    customer.bills.filter(b => b.balance > 0).map(bill => (
                                        <tr key={bill.bill_id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 text-xs text-gray-600">
                                                {new Date(bill.created_at || bill.CreatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">#{bill.bill_number}</td>
                                            <td className="px-6 py-4 text-sm">₹{parseFloat(bill.total).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm text-green-600 font-medium">₹{(parseFloat(bill.total) - parseFloat(bill.balance)).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-base font-black text-red-600">₹{parseFloat(bill.balance).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => navigate(`/billing/invoice/${bill.bill_id}`)}
                                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                                        title="View Bill"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSettlingBill(bill);
                                                            setPaymentAmount(parseFloat(bill.balance).toFixed(2));
                                                        }}
                                                        className="bg-[#d4af37] text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-[#b8962d] transition-colors shadow-sm"
                                                    >
                                                        Settle
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500 italic">No pending bills.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Cleared History */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-green-50/30 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-bold text-green-800">Payment History (Cleared)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-3 text-left">Date</th>
                                    <th className="px-6 py-3 text-left">Bill No</th>
                                    <th className="px-6 py-3 text-left">Amount</th>
                                    <th className="px-6 py-3 text-left">Payment Method</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {customer?.bills?.filter(b => b.balance == 0).length > 0 ? (
                                    customer.bills.filter(b => b.balance == 0).map(bill => (
                                        <tr key={bill.bill_id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 text-xs text-gray-600">
                                                {new Date(bill.created_at || bill.CreatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">#{bill.bill_number}</td>
                                            <td className="px-6 py-4 text-sm font-bold">₹{parseFloat(bill.total).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-xs">
                                                {bill.Payments?.length > 0 ? [...new Set(bill.Payments.map(p => p.payment_method))].join(', ') : 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Paid</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => navigate(`/billing/invoice/${bill.bill_id}`)}
                                                    className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition-all"
                                                >
                                                    View Bill
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500 italic">No cleared bills.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Settlement Modal */}
            {settlingBill && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-xl text-gray-800">Settle Payment</h3>
                            <button onClick={() => setSettlingBill(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <AlertCircle className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleSettleSubmit} className="p-8 space-y-6">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-2">
                                <div className="flex justify-between text-xs text-blue-600 font-bold mb-1 uppercase tracking-wider">
                                    <span>Bill Number</span>
                                    <span>Balance Due</span>
                                </div>
                                <div className="flex justify-between text-xl font-black text-blue-900">
                                    <span>#{settlingBill.bill_number}</span>
                                    <span>₹{parseFloat(settlingBill.balance).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Amount to Settle</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="number"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            step="0.01"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-lg font-bold"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Payment Method</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'Cash', icon: <Banknote className="h-4 w-4" /> },
                                            { id: 'UPI', icon: <QrCode className="h-4 w-4" />, disabled: userRole === 'Cashier' },
                                            { id: 'Card', icon: <CreditCard className="h-4 w-4" />, disabled: userRole === 'Cashier' }
                                        ].map(method => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                disabled={method.disabled}
                                                onClick={() => setPaymentMethod(method.id)}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                                                    paymentMethod === method.id
                                                    ? 'bg-blue-50 border-blue-600 text-blue-600'
                                                    : 'border-gray-100 text-gray-500 hover:border-gray-200'
                                                } ${method.disabled ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
                                            >
                                                {method.icon}
                                                <span className="text-[10px] font-bold uppercase">{method.id}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {userRole === 'Cashier' && (
                                        <p className="text-[10px] text-red-500 font-medium">Note: Cashiers are restricted to Cash settlements only.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSettlingBill(null)}
                                    className="flex-1 py-4 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Processing...' : 'Settle Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BnplDetails;
