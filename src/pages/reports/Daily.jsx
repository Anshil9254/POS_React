import React, { useState, useEffect } from 'react';
import { Search, Printer, Inbox } from 'lucide-react';
import api from '../../services/api';

const PRINT_STYLES = `
@media print {
  body * { visibility: hidden !important; }
  #print-area, #print-area * { visibility: visible !important; }
  #print-area {
    position: fixed !important;
    inset: 0 !important;
    width: 210mm !important;
    min-height: 297mm !important;
    padding: 14mm 16mm !important;
    background: #fff !important;
    font-family: 'Segoe UI', Arial, sans-serif !important;
    font-size: 10pt !important;
    color: #000 !important;
  }
  @page { size: A4 portrait; margin: 0; }
  #print-area table { page-break-inside: avoid; }
  #print-area * { color: #000 !important; background: #fff !important; }
  #print-area th { background: #fff !important; border-bottom: 2px solid #000 !important; }
}
`;

const DailyReport = () => {
    const today = new Date().toISOString().split('T')[0];
    const [reportDate, setReportDate] = useState(today);
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReport = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/reports/daily', {
                params: { date: reportDate }
            });
            setReportData(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching daily report:', err);
            setError('Failed to load report data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchReport(); }, []);

    const handleSearch = (e) => { e.preventDefault(); fetchReport(); };

    const summary = {
        totalSales: reportData?.totalSales?.toFixed(2) || '0.00',
        transactions: reportData?.totalBills || 0,
        averageOrderValue: reportData?.totalBills
            ? (reportData.totalSales / reportData.totalBills).toFixed(2)
            : '0.00'
    };

    const paymentMethods = reportData?.paymentsByMethod
        ? Object.entries(reportData.paymentsByMethod).map(([method, amount]) => ({ method, amount: amount.toFixed(2) }))
        : [];

    const transactions = reportData?.bills || [];

    const totals = {
        subtotal: (reportData?.totalSales - (reportData?.totalTax || 0)).toFixed(2) || '0.00',
        tax: reportData?.totalTax?.toFixed(2) || '0.00',
        total: reportData?.totalSales?.toFixed(2) || '0.00'
    };

    const printDateLabel = new Date(reportDate).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const handlePrint = () => window.print();


    return (
        <>
            {/* inject print styles */}
            <style>{PRINT_STYLES}</style>

            {/* ══════════════ SCREEN UI (hidden on print) ══════════════ */}
            <div className="container mx-auto px-4 py-4 max-w-[1400px] print:hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-[2rem] font-bold text-[#212529] m-0 font-montserrat">Daily Sales Report</h2>
                    <form className="flex items-center gap-2" onSubmit={handleSearch}>
                        <input
                            type="date"
                            value={reportDate}
                            onChange={(e) => setReportDate(e.target.value)}
                            className="px-3 py-2 bg-white border border-[#ced4da] rounded text-[#212529] focus:outline-none focus:ring-1 focus:ring-[#86b7fe] focus:border-[#86b7fe]"
                        />
                        <button type="submit" className="px-3 py-2 bg-[#d4af37] text-white hover:bg-[#b8860b] rounded transition-colors shadow-sm flex items-center justify-center">
                            <Search className="h-4 w-4" />
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">{error}</div>
                )}

                {isLoading ? (
                    <div className="py-20 flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e293b]" />
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-[#d4af37] text-white rounded shadow-sm">
                                <div className="p-4">
                                    <h6 className="text-white/75 mb-2 text-[1rem]">Total Sales</h6>
                                    <h2 className="text-[2rem] font-medium m-0">₹{summary.totalSales}</h2>
                                </div>
                            </div>
                            <div className="bg-[#198754] text-white rounded shadow-sm">
                                <div className="p-4">
                                    <h6 className="text-white/75 mb-2 text-[1rem]">Transactions</h6>
                                    <h2 className="text-[2rem] font-medium m-0">{summary.transactions}</h2>
                                </div>
                            </div>
                            <div className="bg-[#0dcaf0] text-white rounded shadow-sm">
                                <div className="p-4">
                                    <h6 className="text-white/75 mb-2 text-[1rem]">Average Order Value</h6>
                                    <h2 className="text-[2rem] font-medium m-0">₹{summary.averageOrderValue}</h2>
                                </div>
                            </div>
                        </div>

                      

                        {/* Transactions Table */}
                        <div className="bg-white rounded shadow-sm border border-[#e3e6f0]">
                            <div className="bg-[#f8f9fa] border-b border-[#e3e6f0] px-4 py-3 flex justify-between items-center">
                                <h5 className="m-0 font-medium text-[#212529] text-[1.25rem]">
                                    Transactions — {printDateLabel}
                                </h5>
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="px-3 py-1 bg-transparent border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-white rounded transition-colors text-sm font-medium flex items-center gap-1"
                                >
                                    <Printer className="h-4 w-4" /> Print / PDF
                                </button>
                            </div>
                            <div className="p-0 overflow-x-auto">
                                {transactions.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#f8f9fa] border-b border-[#dee2e6]">
                                                <th className="p-3 font-bold text-[#212529]">Bill #</th>
                                                <th className="p-3 font-bold text-[#212529]">Time</th>
                                                <th className="p-3 font-bold text-[#212529]">Cashier</th>
                                                <th className="p-3 font-bold text-[#212529] text-right">Subtotal</th>
                                                <th className="p-3 font-bold text-[#212529] text-right">Tax</th>
                                                <th className="p-3 font-bold text-[#212529] text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map((item) => {
                                                const timeStr = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                const itemsCount = item.items?.length || 0;
                                                const subtotal = (parseFloat(item.total) - parseFloat(item.tax)).toFixed(2);
                                                return (
                                                    <tr key={item.bill_id} className="border-b border-[#dee2e6] hover:bg-[#f8f9fa] transition-colors">
                                                        <td className="p-3 text-[#d4af37] font-medium">{item.bill_number}</td>
                                                        <td className="p-3 text-[#212529]">{timeStr}</td>
                                                        <td className="p-3 text-[#212529]">{item.User?.full_name || 'Unknown'}</td>
                                                        <td className="p-3 text-right text-[#212529]">₹{subtotal}</td>
                                                        <td className="p-3 text-right text-[#212529]">₹{parseFloat(item.tax).toFixed(2)}</td>
                                                        <td className="p-3 text-right font-bold text-[#212529]">₹{parseFloat(item.total).toFixed(2)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-[#f8f9fa] border-t border-[#dee2e6]">
                                                <th colSpan="4" className="p-3 font-bold text-[#212529]">Total</th>
                                                <th className="p-3 font-bold text-[#212529] text-right">₹{totals.subtotal}</th>
                                                <th className="p-3 font-bold text-[#212529] text-right">₹{totals.tax}</th>
                                                <th className="p-3 font-bold text-[#212529] text-right">₹{totals.total}</th>
                                            </tr>
                                        </tfoot>
                                    </table>
                                ) : (
                                    <div className="py-12 text-center">
                                        <Inbox className="h-24 w-24 text-[#6c757d] mx-auto opacity-50 mb-4" strokeWidth={1} />
                                        <p className="text-[#6c757d]">No transactions for this date</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ══════════════ PRINT-ONLY AREA ══════════════ */}
            <div id="print-area" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>

                {/* ── Header ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '12px' }}>
                    <div>
                        <div style={{ fontSize: '18pt', fontWeight: '800', color: '#000', letterSpacing: '1px' }}>SmartPOS</div>
                        <div style={{ fontSize: '8pt', color: '#000', marginTop: '2px' }}>Point of Sale Management System</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13pt', fontWeight: '700', color: '#000' }}>Daily Sales Report</div>
                        <div style={{ fontSize: '8.5pt', color: '#000', marginTop: '2px' }}>{printDateLabel}</div>
                        <div style={{ fontSize: '7.5pt', color: '#000' }}>Generated: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                    </div>
                </div>

                {/* ── KPI summary strip ── */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                    {[
                        { label: 'Total Sales', value: `₹${summary.totalSales}` },
                        { label: 'Total Transactions', value: summary.transactions },
                        { label: 'Avg. Order Value', value: `₹${summary.averageOrderValue}` },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ flex: 1, border: '1px solid #000', padding: '8px 12px' }}>
                            <div style={{ fontSize: '7.5pt', color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                            <div style={{ fontSize: '14pt', fontWeight: '700', color: '#000', marginTop: '3px' }}>{value}</div>
                        </div>
                    ))}
                </div>

                {/* ── Table label ── */}
                <div style={{ fontSize: '8pt', fontWeight: '700', textTransform: 'uppercase', color: '#000', letterSpacing: '0.6px', marginBottom: '5px', borderBottom: '1px solid #000', paddingBottom: '3px' }}>
                    Transactions — {printDateLabel}
                </div>

                {/* ── Table ── */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt', tableLayout: 'fixed', border: '1px solid #000' }}>
                    <colgroup>
                        <col style={{ width: '18%' }} />
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '22%' }} />
                        <col style={{ width: '16%' }} />
                        <col style={{ width: '16%' }} />
                        <col style={{ width: '16%' }} />
                    </colgroup>
                    <thead>
                        <tr>
                            {['Bill #', 'Time', 'Cashier', 'Subtotal', 'Tax', 'Total'].map((h, i) => (
                                <th key={h} style={{ padding: '6px 8px', textAlign: i >= 3 ? 'right' : 'left', fontWeight: '700', fontSize: '8pt', borderBottom: '2px solid #000', borderRight: '1px solid #000' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? transactions.map((item) => {
                            const timeStr = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const itemsCount = item.items?.length || 0;
                            const subtotal = (parseFloat(item.total) - parseFloat(item.tax)).toFixed(2);
                            return (
                                <tr key={item.bill_id}>
                                    <td style={{ padding: '5px 8px', color: '#000', borderBottom: '1px solid #ccc', borderRight: '1px solid #ccc' }}>{item.bill_number}</td>
                                    <td style={{ padding: '5px 8px', color: '#000', borderBottom: '1px solid #ccc', borderRight: '1px solid #ccc' }}>{timeStr}</td>
                                    <td style={{ padding: '5px 8px', color: '#000', borderBottom: '1px solid #ccc', borderRight: '1px solid #ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.User?.full_name || 'Unknown'}</td>
                                    <td style={{ padding: '5px 8px', textAlign: 'right', color: '#000', borderBottom: '1px solid #ccc', borderRight: '1px solid #ccc' }}>₹{subtotal}</td>
                                    <td style={{ padding: '5px 8px', textAlign: 'right', color: '#000', borderBottom: '1px solid #ccc', borderRight: '1px solid #ccc' }}>₹{parseFloat(item.tax).toFixed(2)}</td>
                                    <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: '700', color: '#000', borderBottom: '1px solid #ccc', borderRight: '1px solid #ccc' }}>₹{parseFloat(item.total).toFixed(2)}</td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#000' }}>No transactions recorded for this date.</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="3" style={{ padding: '7px 8px', fontWeight: '700', borderTop: '2px solid #000', borderRight: '1px solid #000' }}>TOTAL</td>
                            <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: '700', borderTop: '2px solid #000', borderRight: '1px solid #ccc' }}>₹{totals.subtotal}</td>
                            <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: '700', borderTop: '2px solid #000', borderRight: '1px solid #ccc' }}>₹{totals.tax}</td>
                            <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: '700', borderTop: '2px solid #000' }}>₹{totals.total}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* ── Footer ── */}
                <div style={{ marginTop: '20px', borderTop: '1px solid #000', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '7.5pt', color: '#000' }}>
                        <strong>SmartPOS</strong> — Confidential Business Report<br />
                        This document is auto-generated. Do not alter.
                    </div>
                    <div style={{ fontSize: '7.5pt', color: '#000', textAlign: 'right' }}>
                        Report Date: {printDateLabel}<br />
                        Printed: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DailyReport;
