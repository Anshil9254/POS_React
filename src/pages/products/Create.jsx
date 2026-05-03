import React, { useState, useEffect } from 'react';
import { Camera, Plus, Minus, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ProductCreate = () => {
    const [manageStock, setManageStock] = useState(true);
    const [stockCount, setStockCount] = useState(0);
    const [lowStockAlert, setLowStockAlert] = useState(5);

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        product_name: '',
        sku: '',
        category_id: '',
        price: '',
        description: '',
        image_url: 'placeholder.png',
        is_active: 1
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data);
            } catch (err) {
                console.error('Failed to fetch categories', err);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError(null);

            const payload = {
                ...formData,
                quantity: manageStock ? stockCount : 0,
                low_stock_threshold: manageStock ? lowStockAlert : 5
            };

            await api.post('/products', payload);
            navigate('/products');
        } catch (err) {
            console.error('Error creating product:', err);
            setError(err.response?.data?.message || 'Failed to create product.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-[1400px]">
            {/* Breadcrumb */}
            <nav className="flex text-sm text-[#6c757d] mb-4">
                <ol className="flex items-center space-x-2">
                    <li><Link to="/products" className="hover:text-[#212529] hover:underline text-[#d4af37]">Products</Link></li>
                    <li className="text-[#6c757d] before:content-['/'] before:mx-2">Add New Product</li>
                </ol>
            </nav>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Product Details Card */}
                    <div className="w-full lg:w-7/12">
                        <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#0000001a] overflow-hidden">
                            <div className="bg-[#f8f9fa] border-b border-[#0000001a] px-6 py-4">
                                <h5 className="m-0 text-lg font-bold text-[#212529]">Product Details</h5>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Image Upload */}
                                    <div className="w-full md:w-1/3">
                                        <div className="flex flex-col">
                                            <div className="w-full h-[180px] border-2 border-dashed border-[#dee2e6] rounded-xl bg-[#f8f9fa] flex items-center justify-center overflow-hidden relative mb-2">
                                                <Camera className="h-12 w-12 text-[#6c757d] opacity-50" />
                                            </div>
                                            <label className="flex items-center justify-center gap-1 w-full bg-[#d4af37] hover:bg-[#b8860b] text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-sm">
                                                <Plus className="h-4 w-4" /> Upload Image
                                                <input type="file" className="hidden" accept="image/*" />
                                            </label>
                                            <small className="text-[#6c757d] text-xs mt-1 text-center block">Accepted formats: JPG, PNG, GIF</small>
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="w-full md:w-2/3">
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-[#212529] mb-1">Product Name <span className="text-[#dc3545]">*</span></label>
                                            <input type="text" name="product_name" value={formData.product_name} onChange={handleChange} required className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" placeholder="Enter product name" />
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-[#212529] mb-1">SKU (Stock Keeping Unit) <span className="text-[#dc3545]">*</span></label>
                                            <input type="text" name="sku" value={formData.sku} onChange={handleChange} required className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" placeholder="e.g., MOUSE-001" />
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-[#212529] mb-1">Category <span className="text-[#dc3545]">*</span></label>
                                                <select name="category_id" value={formData.category_id} onChange={handleChange} required className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all">
                                                    <option value="">Select Category</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-[#212529] mb-1">Price <span className="text-[#dc3545]">*</span></label>
                                                <div className="flex border border-[#ced4da] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#d4af37] transition-all">
                                                    <span className="bg-[#e9ecef] px-3 py-2 text-[#495057] border-r border-[#ced4da]">₹</span>
                                                    <input type="number" name="price" value={formData.price} onChange={handleChange} required className="flex-1 px-3 py-2 bg-white text-[#212529] focus:outline-none" placeholder="0.00" step="0.01" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-[#212529] mb-1">Product Description <span className="text-[#dc3545]">*</span></label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all resize-y" placeholder="Add description..."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stock Management Card */}
                    <div className="w-full lg:w-5/12">
                        <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#0000001a] overflow-hidden sticky top-6">
                            <div className="bg-[#f8f9fa] border-b border-[#0000001a] px-6 py-4">
                                <h5 className="m-0 text-lg font-bold text-[#212529]">Manage Stock</h5>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center mb-6">
                                    <input
                                        type="checkbox"
                                        id="manageStock"
                                        checked={manageStock}
                                        onChange={() => setManageStock(!manageStock)}
                                        className="w-4 h-4 text-[#d4af37] border-[#00000040] rounded focus:ring-[#d4af37]"
                                    />
                                    <label htmlFor="manageStock" className="ml-2 block text-[0.95rem] text-[#212529]">Manage Stock</label>
                                </div>

                                {manageStock && (
                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-[#212529] mb-1">Stock Quantity</label>
                                            <div className="flex border border-[#ced4da] rounded-lg overflow-hidden">
                                                <input type="number" value={stockCount} readOnly className="flex-1 px-3 py-2 bg-white text-[#212529] focus:outline-none" />
                                                <button type="button" onClick={() => setStockCount(Math.max(0, stockCount - 1))} className="px-3 bg-[#f8f9fa] border-l border-[#ced4da] hover:bg-[#e9ecef] text-[#6c757d] transition-colors">
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <button type="button" onClick={() => setStockCount(stockCount + 1)} className="px-3 bg-[#f8f9fa] border-l border-[#ced4da] hover:bg-[#e9ecef] text-[#6c757d] transition-colors">
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-[#212529] mb-1">Low Stock Alert</label>
                                            <div className="flex border border-[#ced4da] rounded-lg overflow-hidden">
                                                <input type="number" value={lowStockAlert} readOnly className="flex-1 px-3 py-2 bg-white text-[#212529] focus:outline-none" />
                                                <button type="button" onClick={() => setLowStockAlert(Math.max(0, lowStockAlert - 1))} className="px-3 bg-[#f8f9fa] border-l border-[#ced4da] hover:bg-[#e9ecef] text-[#6c757d] transition-colors">
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <button type="button" onClick={() => setLowStockAlert(lowStockAlert + 1)} className="px-3 bg-[#f8f9fa] border-l border-[#ced4da] hover:bg-[#e9ecef] text-[#6c757d] transition-colors">
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-[#212529] mb-1">Status</label>
                                    <select name="is_active" value={formData.is_active} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all">
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="bg-[#f8f9fa] border-t border-[#0000001a] px-6 py-4 flex justify-end gap-2">
                                <Link to="/products" className="px-4 py-2 bg-white border border-[#6c757d] hover:bg-[#f8f9fa] text-[#6c757d] rounded-lg font-medium transition-colors">
                                    Cancel
                                </Link>
                                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-[#d4af37] hover:bg-[#b8860b] text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
                                    {isLoading ? 'Saving...' : 'Add Product'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductCreate;
