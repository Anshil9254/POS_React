import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Image as ImageIcon, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const LowStock = () => {
    const [lowStockItems, setLowStockItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLowStock = async () => {
            try {
                const response = await api.get('/inventory/lowstock');
                setLowStockItems(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching low stock items:', err);
                setError('Failed to load low stock items');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLowStock();
    }, []);

    return (
        <div className="container mx-auto px-4 py-4 max-w-[1400px]">
            <h2 className="text-[2rem] font-bold text-[#212529] mb-4 flex items-center font-montserrat">
                <AlertTriangle className="h-8 w-8 text-[#ffc107] mr-2" fill="currentColor" strokeWidth={0} /> Low Stock Items
            </h2>

            <div className="bg-white rounded shadow-sm border border-[#e3e6f0]">
                {isLoading ? (
                    <div className="py-12 flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e293b]"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-600 bg-red-50">{error}</div>
                ) : lowStockItems.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f8f9fa] border-b border-[#dee2e6]">
                                    <th className="p-3 font-bold text-[#212529]">Product</th>
                                    <th className="p-3 font-bold text-[#212529]">SKU</th>
                                    <th className="p-3 font-bold text-[#212529]">Category</th>
                                    <th className="p-3 font-bold text-[#212529]">Current Stock</th>
                                    <th className="p-3 font-bold text-[#212529]">Threshold</th>
                                    <th className="p-3 font-bold text-[#212529]">Status</th>
                                    <th className="p-3 font-bold text-[#212529]">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockItems.map((item) => {
                                    const product = item.Product || {};
                                    const isOutOfStock = item.quantity === 0;
                                    const status = isOutOfStock ? 'Out of Stock' : 'Low Stock';
                                    const statusColorClass = isOutOfStock ? 'bg-[#dc3545] text-white' : 'bg-[#ffc107] text-[#212529]';

                                    return (
                                        <tr key={item.inventory_id} className="border-b border-[#dee2e6] hover:bg-[#f8f9fa] transition-colors align-middle">
                                            <td className="p-3">
                                                <div className="flex items-center">
                                                    <div className="mr-3 flex-shrink-0">
                                                        {product.image_url ? (
                                                            <img src={product.image_url} alt={product.product_name} className="w-10 h-10 rounded object-cover" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded bg-[#f8f9fa] border border-[#dee2e6] flex items-center justify-center">
                                                                <ImageIcon className="h-5 w-5 text-[#6c757d]" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-[#212529]">{product.product_name || 'Unknown Product'}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-[#e83e8c] font-mono text-sm bg-[#f8f9fa] rounded inline-block mt-2 ml-3 px-1.5 py-0.5">{product.sku || '-'}</td>
                                            <td className="p-3 text-[#212529]">{product.Category?.category_name || '-'}</td>
                                            <td className="p-3">
                                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${statusColorClass}`}>
                                                    {item.quantity} units
                                                </span>
                                            </td>
                                            <td className="p-3 text-[#212529]">{item.low_stock_threshold} units</td>
                                            <td className="p-3">
                                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${statusColorClass}`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <Link to={`/inventory/restock/${item.product_id}`} className="inline-block px-3 py-1 bg-[#d4af37] text-white hover:bg-[#b8860b] rounded text-sm transition-colors shadow-sm">
                                                    Restock
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <CheckCircle className="h-24 w-24 text-[#198754] mx-auto opacity-75" strokeWidth={1} />
                        <p className="mt-4 text-[#6c757d] mb-4">All products are well stocked!</p>
                        <Link to="/" className="inline-block px-4 py-2 bg-[#d4af37] text-white hover:bg-[#b8860b] rounded transition-colors shadow-sm">
                            Back to Dashboard
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LowStock;
