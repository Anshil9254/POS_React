import React, { useState, useEffect } from 'react';
import { Package, Receipt, AlertTriangle, IndianRupee, RefreshCw, Download, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Dashboard = () => {
    const [data, setData] = useState({
        totalProducts: 0,
        lowStockProducts: 0,
        todaySales: 0,
        todayTransactions: 0,
        recentSales: [],
        lowStockAlerts: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardStats = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/dashboard/stats');
            setData(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError('Failed to load dashboard statistics.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const handleExportReport = () => {
        if (!data) return;
        
        try {
            const doc = new jsPDF();
            
            // Set font styles and title
            doc.setFontSize(22);
            doc.setTextColor(212, 175, 55); // #d4af37 (Gold)
            doc.text("Dashboard Summary Report", 14, 22);
            
            doc.setFontSize(11);
            doc.setTextColor(108, 117, 125); // #6c757d (Gray)
            doc.text(`Generated Date: ${new Date().toLocaleString()}`, 14, 30);
            
            // Summary Stats Section
            doc.setFontSize(16);
            doc.setTextColor(33, 37, 41); // #212529 (Dark)
            doc.text("Overview Statistics", 14, 45);
            
            autoTable(doc, {
                startY: 50,
                head: [['Statistic', 'Value']],
                body: [
                    ['Total Products', data.totalProducts || 0],
                    ['Low Stock Items', data.lowStockProducts || 0],
                    ["Today's Sales", data.todaySales ? `Rs. ${data.todaySales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Rs. 0.00'],
                    ['Today Transactions', data.todayTransactions || 0],
                ],
                theme: 'grid',
                headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 11, cellPadding: 4 },
                columnStyles: { 0: { fontStyle: 'bold' } }
            });
            
            // Recent Sales Section
            const finalY = doc.lastAutoTable.finalY || 50;
            doc.setFontSize(16);
            doc.setTextColor(33, 37, 41);
            doc.text("Recent Sales", 14, finalY + 15);
            
            if (data.recentSales && data.recentSales.length > 0) {
                const recentSalesBody = data.recentSales.map(sale => [
                    `#${sale.billNumber}`,
                    `Rs. ${sale.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                    sale.paymentMethod,
                    sale.time,
                    'Completed'
                ]);

                autoTable(doc, {
                    startY: finalY + 20,
                    head: [['Bill Number', 'Amount', 'Payment Method', 'Time', 'Status']],
                    body: recentSalesBody,
                    theme: 'striped',
                    headStyles: { fillColor: [33, 37, 41], textColor: [255, 255, 255], fontStyle: 'bold' },
                    styles: { fontSize: 10, cellPadding: 4 },
                });
            } else {
                doc.setFontSize(11);
                doc.setTextColor(108, 117, 125);
                doc.text("No sales recorded today.", 14, finalY + 25);
            }
            
            doc.save(`Dashboard_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("Error exporting PDF report:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-[1400px] flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto max-w-[1400px]">
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-center">
                    {error}
                </div>
                <div className="flex justify-center mt-4">
                    <button onClick={fetchDashboardStats} className="flex items-center gap-2 bg-[#d4af37] text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        <RefreshCw className="h-4 w-4" /> Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-[1400px]">
            {/* Header matches header section in MVC */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-[#d4af37] text-[28px] font-montserrat font-bold mb-1">Store Dashboard</h2>
                    <p className="text-[#6c757d] mb-0">Welcome back, Admin User</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={fetchDashboardStats}
                        disabled={isLoading}
                        className="flex items-center gap-2 border border-[#0000001a] text-[#6c757d] hover:text-[#212529] hover:border-[#212529] px-4 py-2 rounded-lg font-medium transition-colors bg-white disabled:opacity-50 tracking-wide"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <button 
                        onClick={handleExportReport}
                        className="flex items-center gap-2 bg-gradient-to-br from-[#d4af37] to-[#b8860b] text-white hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:-translate-y-[1px] px-5 py-2 rounded-lg font-semibold transition-all border-0 tracking-wide"
                    >
                        <Download className="h-4 w-4" /> Export Report
                    </button>
                </div>
            </div>

            {/* Stats Row matches .row.g-4.mb-5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                {/* Total Products */}
                <div className="bg-white border border-[#0000001a] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-[2px] transition-all duration-300">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[#6c757d] mb-1 font-medium">Total Products</p>
                            <h3 className="text-3xl font-bold text-[#212529] m-0">{data.totalProducts}</h3>
                        </div>
                        <div className="bg-[#d4af371a] p-3 rounded-lg">
                            <Package className="h-6 w-6 text-[#d4af37]" />
                        </div>
                    </div>
                </div>

                {/* Low Stock */}
                <div className="bg-white border border-[#0000001a] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-[2px] transition-all duration-300">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[#6c757d] mb-1 font-medium">Low Stock</p>
                            <h3 className="text-3xl font-bold text-[#212529] m-0">{data.lowStockProducts}</h3>
                        </div>
                        <div className="bg-[#ffc1071a] p-3 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-[#ffc107]" />
                        </div>
                    </div>
                </div>

                {/* Today's Sales */}
                <div className="bg-white border border-[#0000001a] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-[2px] transition-all duration-300">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[#6c757d] mb-1 font-medium">Today's Sales</p>
                            <h3 className="text-3xl font-bold text-[#212529] m-0 flex items-center">
                                <IndianRupee className="h-6 w-6 mr-1" />
                                {data.todaySales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                        <div className="bg-[#1987541a] p-3 rounded-lg">
                            <IndianRupee className="h-6 w-6 text-[#198754]" />
                        </div>
                    </div>
                </div>

                {/* Transactions */}
                <div className="bg-white border border-[#0000001a] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-[2px] transition-all duration-300">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[#6c757d] mb-1 font-medium">Transactions</p>
                            <h3 className="text-3xl font-bold text-[#212529] m-0">{data.todayTransactions}</h3>
                        </div>
                        <div className="bg-[#0dcaf01a] p-3 rounded-lg">
                            <Receipt className="h-6 w-6 text-[#0dcaf0]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Sales & Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Sales (Takes up 2/3 space) */}
                <div className="lg:col-span-2 bg-white border border-[#0000001a] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-[2px] transition-all duration-300 flex flex-col">
                    <div className="flex justify-between items-center p-6 border-b border-[#0000001a]">
                        <h5 className="m-0 text-lg font-montserrat font-bold">Recent Sales</h5>
                        <button className="px-3 py-1.5 text-sm border border-[#0000001a] text-[#6c757d] hover:text-[#212529] hover:border-[#212529] rounded-lg transition-colors">
                            View All
                        </button>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="py-4 px-6 font-medium text-xs uppercase tracking-wider text-[#6c757d]">Bill #</th>
                                    <th className="py-4 px-6 font-medium text-xs uppercase tracking-wider text-[#6c757d]">Amount</th>
                                    <th className="py-4 px-6 font-medium text-xs uppercase tracking-wider text-[#6c757d]">Payment</th>
                                    <th className="py-4 px-6 font-medium text-xs uppercase tracking-wider text-[#6c757d]">Time</th>
                                    <th className="py-4 px-6 font-medium text-xs uppercase tracking-wider text-[#6c757d]">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentSales.length > 0 ? (
                                    data.recentSales.map((sale, index) => (
                                        <tr key={index} className="hover:bg-black/5 transition-colors border-t border-[#00000005]">
                                            <td className="py-4 px-6"><span className="text-[#d4af37] font-medium">#{sale.billNumber}</span></td>
                                            <td className="py-4 px-6 font-bold flex items-center">
                                                <IndianRupee className="h-4 w-4 mr-0.5" />
                                                {sale.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 px-6">{sale.paymentMethod}</td>
                                            <td className="py-4 px-6 text-[#6c757d]">{sale.time}</td>
                                            <td className="py-4 px-6">
                                                <span className="bg-[#00b89426] text-[#00b894] border border-[#00b8944d] px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wide">
                                                    Completed
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-[#6c757d]">No sales today</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Stock Alerts (Takes up 1/3 space) */}
                <div className="bg-white border border-[#0000001a] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-[2px] transition-all duration-300 flex flex-col">
                    <div className="flex justify-between items-center p-6 border-b border-[#0000001a]">
                        <h5 className="m-0 text-lg font-montserrat font-bold">Low Stock Alerts</h5>
                        <button className="px-3 py-1.5 text-sm border border-[#0000001a] text-[#6c757d] hover:text-[#212529] hover:border-[#212529] rounded-lg transition-colors">
                            Manage
                        </button>
                    </div>
                    <div className="flex flex-col">
                        {data.lowStockAlerts.length > 0 ? (
                            data.lowStockAlerts.map((item, index) => (
                                <div key={item.id} className="flex justify-between items-center px-6 py-4 border-b border-[#0000001a] last:border-0 hover:bg-black/5 transition-colors">
                                    <div>
                                        <h6 className="m-0 font-semibold text-[15px]">{item.productName}</h6>
                                        <small className="text-[#6c757d]">SKU: {item.sku}</small>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <span className="bg-[#fdcb6e26] text-[#fdcb6e] border border-[#fdcb6e4d] px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wide">
                                            {item.currentStock} Left
                                        </span>
                                        <button className="text-[#d4af37] text-sm font-medium hover:underline p-0 bg-transparent border-0">
                                            Restock
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-[#6c757d]">
                                <CheckCircle className="h-12 w-12 text-[#198754] mx-auto mb-3" />
                                <p className="m-0">Everything in stock</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
