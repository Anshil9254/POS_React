import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, DollarSign, Plus, Search, ArrowUpDown, Pencil, MapPin, Trash2, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Inventory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categories, setCategories] = useState([]);

    const [data, setData] = useState({
        inventory: [],
        totalStock: 0,
        lowStockCount: 0,
        outOfStockCount: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories');
                setCategories(res.data);
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        fetchCategories();
    }, []);

    // Fetch Inventory
    useEffect(() => {
        const fetchInventory = async () => {
            setIsLoading(true);
            try {
                const params = {};
                if (debouncedSearch) params.search = debouncedSearch;
                if (categoryId) params.categoryId = categoryId;
                if (statusFilter) params.status = statusFilter;

                const response = await api.get('/inventory', { params });
                setData(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching inventory:', err);
                setError('Failed to load inventory data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInventory();
    }, [debouncedSearch, categoryId, statusFilter]);

    const getStatusInfo = (qty, threshold) => {
        if (qty === 0) return { label: 'Out of Stock', color: 'bg-[#dc3545]', text: 'text-white' };
        if (qty <= threshold) return { label: 'Low Stock', color: 'bg-[#ffc107]', text: 'text-[#212529]' };
        return { label: 'In Stock', color: 'bg-[#198754]', text: 'text-white' };
    };

    return (
        <div className="container mx-auto max-w-[1400px]">
            <h2 className="text-[28px] font-montserrat font-bold text-[#212529] mb-4">Inventory</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-[#0000001a] p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#cfe2ff] flex items-center justify-center shrink-0">
                        <Package className="h-6 w-6 text-[#d4af37]" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[#212529] leading-none mb-1">{data.totalStock}</div>
                        <div className="text-sm text-[#6c757d] font-medium">Total Stock</div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-[#0000001a] p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#fff3cd] flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-6 w-6 text-[#ffc107]" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[#212529] leading-none mb-1">{data.lowStockCount}</div>
                        <div className="text-sm text-[#6c757d] font-medium">Low Stock</div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-[#0000001a] p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#f8d7da] flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-6 w-6 text-[#dc3545]" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[#212529] leading-none mb-1">{data.outOfStockCount}</div>
                        <div className="text-sm text-[#6c757d] font-medium">Out of Stock</div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-[#0000001a] p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#d1e7dd] flex items-center justify-center shrink-0">
                        <DollarSign className="h-6 w-6 text-[#198754]" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[#212529] leading-none mb-1">
                            ₹{data.inventory.reduce((sum, item) => sum + (item.quantity * (item.Product?.price || 0)), 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-[#6c757d] font-medium">Total Value</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-[#0000001a] p-4 mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-[#6c757d]" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all"
                        placeholder="Search by product name or SKU..."
                    />
                </div>
                <div className="w-full md:w-48">
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full md:w-48">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
                    >
                        <option value="">All Statuses</option>
                        <option value="instock">In Stock</option>
                        <option value="lowstock">Low Stock</option>
                        <option value="outofstock">Out of Stock</option>
                    </select>
                </div>
                {/* Note: In future we could add Receive Stock modal. Temporarily omit the mock button as it does not do anything at the moment */}
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#0000001a] overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e293b]"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-600 bg-red-50">{error}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#f8f9fa] text-[#212529] font-medium border-b border-[#0000001a]">
                                <tr>
                                    <th className="p-3 pl-4 w-12"><input type="checkbox" className="rounded border-gray-300" /></th>
                                    <th className="p-3 whitespace-nowrap">Product <ArrowUpDown className="inline-block h-3 w-3 ml-1 text-[#6c757d]" /></th>
                                    <th className="p-3 whitespace-nowrap">SKU <ArrowUpDown className="inline-block h-3 w-3 ml-1 text-[#6c757d]" /></th>
                                    <th className="p-3 whitespace-nowrap">Category <ArrowUpDown className="inline-block h-3 w-3 ml-1 text-[#6c757d]" /></th>
                                    <th className="p-3 whitespace-nowrap">Stock <ArrowUpDown className="inline-block h-3 w-3 ml-1 text-[#6c757d]" /></th>
                                    <th className="p-3 whitespace-nowrap">Status <ArrowUpDown className="inline-block h-3 w-3 ml-1 text-[#6c757d]" /></th>
                                    <th className="p-3 w-32 pr-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#0000001a]">
                                {data.inventory.length > 0 ? (
                                    data.inventory.map(item => {
                                        const statusInfo = getStatusInfo(item.quantity, item.low_stock_threshold);

                                        return (
                                            <tr key={item.inventory_id} className="hover:bg-black/5 transition-colors">
                                                <td className="p-3 pl-4"><input type="checkbox" className="rounded border-[#0000001a]" /></td>
                                                <td className="p-3">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-[#f8f9fa] rounded flex items-center justify-center mr-3 border border-[#0000001a]">
                                                            {item.Product?.image_url ? (
                                                                <img src={item.Product.image_url} alt="" className="h-full w-full object-cover rounded" />
                                                            ) : (
                                                                <ImageIcon className="h-5 w-5 text-[#6c757d]" />
                                                            )}
                                                        </div>
                                                        <Link to={`/products/${item.product_id}`} className="text-[#d4af37] font-medium hover:underline">
                                                            {item.Product?.product_name || 'Unknown Product'}
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <code className="bg-[#f8f9fa] text-[#d63384] px-1.5 py-0.5 rounded text-sm">{item.Product?.sku || '-'}</code>
                                                </td>
                                                <td className="p-3 text-sm text-[#212529]">
                                                    {item.Product?.Category?.category_name || '-'}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${statusInfo.text} ${statusInfo.color}`}>
                                                        x {item.quantity}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${statusInfo.text} ${statusInfo.color}`}>
                                                        {statusInfo.label}
                                                    </span>
                                                </td>
                                                <td className="p-3 pr-4">
                                                    <div className="flex gap-1 bg-white border border-[#0000001a] rounded-lg overflow-hidden w-fit shadow-sm">
                                                        <Link to={`/inventory/restock/${item.product_id}`} className="p-2 text-[#d4af37] hover:bg-[#d4af37] hover:text-white transition-colors" title="Restock">
                                                            <Plus className="h-4 w-4" />
                                                        </Link>
                                                        <Link to={`/inventory/history/${item.product_id}`} className="p-2 border-l border-[#0000001a] text-[#0dcaf0] hover:bg-[#0dcaf0] hover:text-white transition-colors" title="History">
                                                            <MapPin className="h-4 w-4" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-[#6c757d]">
                                            No inventory found matching criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inventory;
