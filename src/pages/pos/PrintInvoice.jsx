import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PrintInvoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bill, setBill] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBill = async () => {
            try {
                const response = await api.get(`/billing/invoice/${id}`);
                setBill(response.data);
                // Trigger print dialog automatically when loaded
                setTimeout(() => window.print(), 500);
            } catch (err) {
                console.error('Failed to fetch invoice:', err);
                alert('Invoice not found.');
                navigate('/checkout');
            } finally {
                setIsLoading(false);
            }
        };
        fetchBill();
    }, [id, navigate]);

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading invoice...</div>;
    }

    if (!bill) {
        return null;
    }

    const storeName = bill.User?.Store?.store_name || "POS System";
    const storeAddress = bill.User?.Store?.address || "Main Store Location";
    const storeGst = bill.User?.Store?.gst_number || "";

    return (
        <div className="max-w-[400px] mx-auto p-5 font-mono text-sm text-gray-900 bg-white">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-1">{storeName}</h2>
                <p className="text-xs mb-1 text-gray-600">{storeAddress}</p>
                {storeGst && <p className="text-xs text-gray-600">GST: {storeGst}</p>}
                <div className="border-b-2 border-dashed border-gray-300 my-3"></div>
                <h3 className="text-lg font-semibold">TAX INVOICE</h3>
            </div>

            <div className="flex justify-between items-center text-xs mb-4">
                <div>
                    <div><strong>Bill No:</strong> {bill.bill_number}</div>
                    <div><strong>Date:</strong> {new Date(bill.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                    <div><strong>Cashier:</strong> {bill.User?.name || 'Staff'}</div>
                    {bill.Customer && <div><strong>Customer:</strong> {bill.Customer.name}</div>}
                </div>
            </div>

            <table className="w-full text-xs text-left mb-4">
                <thead>
                    <tr className="border-y-2 border-dashed border-gray-300">
                        <th className="py-2">Item</th>
                        <th className="py-2 text-center">Qty</th>
                        <th className="py-2 text-right">Price</th>
                        <th className="py-2 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {bill.BillItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100 last:border-0">
                            <td className="py-2 max-w-[150px] truncate">{item.Product?.product_name || `Item ${item.product_id}`}</td>
                            <td className="py-2 text-center">{item.quantity}</td>
                            <td className="py-2 text-right">{(parseFloat(item.price)).toFixed(2)}</td>
                            <td className="py-2 text-right">{(parseFloat(item.total)).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="border-t-2 border-dashed border-gray-300 pt-3">
                <div className="flex justify-between mb-1">
                    <span>Subtotal:</span>
                    <span>{(parseFloat(bill.subtotal)).toFixed(2)}</span>
                </div>
                {parseFloat(bill.discount_amount || 0) > 0 && (
                    <div className="flex justify-between mb-1">
                        <span>Discount:</span>
                        <span>-{(parseFloat(bill.discount_amount)).toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between mb-2">
                    <span>Tax (18%):</span>
                    <span>{(parseFloat(bill.tax)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-y-2 border-gray-300 py-2 mb-3">
                    <span>Grand Total:</span>
                    <span>{(parseFloat(bill.total)).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-xs mb-1">
                    <span>Payment Method:</span>
                    <span>{bill.Payments?.[0]?.payment_method || 'Cash'}</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                    <span>Paid Amount:</span>
                    <span>{bill.Payments?.[0]?.payment_amount ? parseFloat(bill.Payments[0].payment_amount).toFixed(2) : parseFloat(bill.total).toFixed(2)}</span>
                </div>
                {parseFloat(bill.balance) > 0 && (
                    <div className="flex justify-between text-xs font-bold mt-1">
                        <span>Balance Due:</span>
                        <span>{parseFloat(bill.balance).toFixed(2)}</span>
                    </div>
                )}
            </div>

            <div className="text-center mt-8 text-xs text-gray-500">
                <p>Thank you for shopping with us!</p>
                <p>Please visit again</p>
            </div>
            
            <div className="mt-6 flex justify-center print:hidden">
                <button 
                    onClick={() => navigate('/checkout')} 
                    className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 mr-2"
                >
                    Back to POS
                </button>
                <button 
                    onClick={() => window.print()} 
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded shadow hover:bg-gray-300 flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    Print Again
                </button>
            </div>
        </div>
    );
};

export default PrintInvoice;
