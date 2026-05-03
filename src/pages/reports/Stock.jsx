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

const StockReport = () => {

    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReport = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/reports/stock', {

            });
            setReportData(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching stock report:', err);
            setError('Failed to load report data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchReport();
    };

    const inventoryList = reportData?.inventory || [];

    const stockItems = inventoryList.map(item => {
        const product = item.Product || {};
        const category = product.Category || {};
        const price = parseFloat(product.price || 0);
        const quantity = item.quantity || 0;
        const threshold = item.low_stock_threshold || 0;

        let status = 'In Stock';
        if (quantity === 0) status = 'Out of Stock';
        else if (quantity <= threshold) status = 'Low Stock';

        return {
            id: item.inventory_id,
            name: product.product_name,
            sku: product.sku,
            category: category.category_name || 'N/A',
            quantity: quantity,
            threshold: threshold,
            price: price.toFixed(2),
            stockValue: (quantity * price).toFixed(2),
            status: status
        };
    });

    const summary = {
        totalProducts: stockItems.length,
        totalStock: stockItems.reduce((acc, item) => acc + item.quantity, 0),
        totalStockValue: reportData?.totalValue?.toFixed(2) || '0.00',
        lowStockCount: stockItems.filter(item => item.status === 'Low Stock').length,
        outOfStockCount: stockItems.filter(item => item.status === 'Out of Stock').length
    };

    const printDateLabel = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    return (
        <>
            <style>{PRINT_STYLES}</style>

            {/* ══════════════ SCREEN UI (hidden on print) ══════════════ */}
            <div className="container mx-auto px-4 py-4 max-w-[1400px] print:hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-[2rem] font-bold text-[#212529] m-0 font-montserrat">Stock Report</h2>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <form className="flex items-center gap-2" onSubmit={handleSearch}>

                            <button type="submit" disabled={isLoading} className="px-3 py-2 bg-[#d4af37] text-white hover:bg-[#b8860b] rounded flex items-center justify-center transition-colors shadow-sm disabled:opacity-50">
                                <Search className="h-4 w-4" />
                            </button>
                        </form>
                        <button type="button" onClick={() => window.print()} className="px-3 py-2 bg-transparent border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-white rounded transition-colors text-sm font-medium flex items-center justify-center whitespace-nowrap">
                            <Printer className="h-4 w-4 mr-1" />Print Report
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="py-20 flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e293b]"></div>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <div className="bg-white rounded shadow-sm border border-[#e3e6f0]">
                                <div className="p-4">
                                    <h6 className="text-[#6c757d] mb-2 text-[1rem]">Total Products</h6>
                                    <h3 className="text-[1.75rem] font-medium text-[#212529] m-0">{summary.totalProducts}</h3>
                                </div>
                            </div>
                            <div className="bg-white rounded shadow-sm border border-[#e3e6f0]">
                                <div className="p-4">
                                    <h6 className="text-[#6c757d] mb-2 text-[1rem]">Total Stock</h6>
                                    <h3 className="text-[1.75rem] font-medium text-[#212529] m-0">{summary.totalStock} units</h3>
                                </div>
                            </div>
                            <div className="bg-white rounded shadow-sm border border-[#e3e6f0]">
                                <div className="p-4">
                                    <h6 className="text-[#6c757d] mb-2 text-[1rem]">Stock Value</h6>
                                    <h3 className="text-[1.75rem] font-medium text-[#212529] m-0">₹{summary.totalStockValue}</h3>
                                </div>
                            </div>
                            <div className="bg-white rounded shadow-sm border border-[#ffc107]">
                                <div className="p-4">
                                    <h6 className="text-[#6c757d] mb-2 text-[1rem]">Low/Out of Stock</h6>
                                    <h3 className="text-[1.75rem] font-medium text-[#ffc107] m-0">{summary.lowStockCount} / {summary.outOfStockCount}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Stock Table */}
                        <div className="bg-white rounded shadow-sm border border-[#e3e6f0]">
                            <div className="bg-[#f8f9fa] border-b border-[#e3e6f0] px-4 py-3 border-t">
                                <h5 className="m-0 font-medium text-[#212529] text-[1.25rem]">Inventory Details</h5>
                            </div>
                            <div className="p-0 overflow-x-auto">
                                {stockItems.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#f8f9fa] border-b border-[#dee2e6]">
                                                <th className="p-3 font-bold text-[#212529]">Product</th>
                                                <th className="p-3 font-bold text-[#212529]">SKU</th>
                                                <th className="p-3 font-bold text-[#212529]">Category</th>
                                                <th className="p-3 font-bold text-[#212529] text-center">Quantity</th>
                                                <th className="p-3 font-bold text-[#212529] text-center">Threshold</th>
                                                <th className="p-3 font-bold text-[#212529] text-right">Price</th>
                                                <th className="p-3 font-bold text-[#212529] text-right">Stock Value</th>
                                                <th className="p-3 font-bold text-[#212529]">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stockItems.map((item) => (
                                                <tr key={item.id} className="border-b border-[#dee2e6] hover:bg-[#f8f9fa] transition-colors">
                                                    <td className="p-3 text-[#212529]">{item.name}</td>
                                                    <td className="p-3"><code className="text-[#e83e8c] bg-[#f8f9fa] px-1.5 py-0.5 rounded text-sm">{item.sku}</code></td>
                                                    <td className="p-3 text-[#212529]">{item.category}</td>
                                                    <td className="p-3 text-center text-[#212529]">{item.quantity}</td>
                                                    <td className="p-3 text-center text-[#212529]">{item.threshold}</td>
                                                    <td className="p-3 text-right text-[#212529]">₹{item.price}</td>
                                                    <td className="p-3 text-right text-[#212529]">₹{item.stockValue}</td>
                                                    <td className="p-3">
                                                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${item.status === 'In Stock' ? 'bg-[#198754] text-white' :
                                                            item.status === 'Low Stock' ? 'bg-[#ffc107] text-black' :
                                                                'bg-[#dc3545] text-white'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="py-12 text-center">
                                        <Inbox className="h-24 w-24 text-[#6c757d] mx-auto opacity-50 mb-4" strokeWidth={1} />
                                        <p className="text-[#6c757d]">No inventory data</p>
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
                        <div style={{ fontSize: '13pt', fontWeight: '700', color: '#000' }}>Stock Report</div>
                        <div style={{ fontSize: '8.5pt', color: '#000', marginTop: '2px' }}>{printDateLabel}</div>
                        <div style={{ fontSize: '7.5pt', color: '#000' }}>Generated: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                    </div>
                </div>

                {/* ── KPI summary strip ── */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                    {[
                        { label: 'Total Products', value: summary.totalProducts },
                        { label: 'Total Stock', value: `${summary.totalStock} units` },
                        { label: 'Stock Value', value: `₹${summary.totalStockValue}` },
                        { label: 'Low / Out of Stock', value: `${summary.lowStockCount} / ${summary.outOfStockCount}` },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ flex: 1, border: '1px solid #000', padding: '8px 12px' }}>
                            <div style={{ fontSize: '7.5pt', color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                            <div style={{ fontSize: '14pt', fontWeight: '700', color: '#000', marginTop: '3px' }}>{value}</div>
                        </div>
                    ))}
                </div>

                {/* ── Table label ── */}
                <div style={{ fontSize: '8pt', fontWeight: '700', textTransform: 'uppercase', color: '#000', letterSpacing: '0.6px', marginBottom: '5px', borderBottom: '1px solid #000', paddingBottom: '3px' }}>
                    Inventory Details
                </div>

                {/* ── Table ── */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt', tableLayout: 'fixed', border: '1px solid #000' }}>
                    <colgroup>
                        <col style={{ width: '18%' }} />
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '14%' }} />
                        <col style={{ width: '12%' }} />
                    </colgroup>
                    <thead>
                        <tr>
                            {['Product', 'SKU', 'Category', 'Qty', 'Threshold', 'Price', 'Stock Value', 'Status'].map((h, i) => (
                                <th key={h} style={{ padding: '6px 6px', textAlign: i >= 5 && i <= 6 ? 'right' : (i >= 3 && i <= 4 ? 'center' : 'left'), fontWeight: '700', fontSize: '7.5pt', borderBottom: '2px solid #000', borderRight: '1px solid #000' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {stockItems.length > 0 ? stockItems.map((item) => (
                            <tr key={item.id}>
                                <td style={{ padding: '4px 6px', color: '#000', borderBottom: '1px solid #ccc', borderRight: '1px solid #ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</td>
                                <td style={{ padding: '4px 6px', color: '#000', borderBottom: '1px solid #ccc', borderRight: '1px solid #ccc' }}>{item.sku}</td>
                                <td style={{ padding: '4px 6px', color: '#000', borderBottom: '1px solid #ccc', borderRight: '1px solid #ccc' }}>{item.category}</td>
                                <td style={{ padding: '4px 6px', color: '#000', borderBottom: '1px solid #ccc', borderRight: '1px solid #ccc', textAlign: 'center' }}>{item.quantity}</td>
                                <td style={{ padding: '4px 6px', color: '#000', borderBottom: '1px solid #ccc', borderRight: '1px solid #ccc', textAlign: 'center' }}>{item.threshold}</td>
                                <td style={{ padding: '4px 6px', color: '#000', borderBottom: '1px solid #ccc', borderRight: '1px solid #ccc', textAlign: 'right' }}>₹{item.price}</td>
                                <td style={{ padding: '4px 6px', color: '#000', borderBottom: '1px solid #ccc', borderRight: '1px solid #ccc', textAlign: 'right', fontWeight: '700' }}>₹{item.stockValue}</td>
                                <td style={{ padding: '4px 6px', color: '#000', borderBottom: '1px solid #ccc' }}>{item.status}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#000' }}>No inventory data available.</td>
                            </tr>
                        )}
                    </tbody>
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

export default StockReport;
