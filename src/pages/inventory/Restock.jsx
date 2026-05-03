import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, Image as ImageIcon, Check } from 'lucide-react';
import api from '../../services/api';

const Restock = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [stockToAdd, setStockToAdd] = useState(0);
    const [note, setNote] = useState('');
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${id}`);
                const data = response.data;
                const inv = data.Inventories && data.Inventories.length > 0 ? data.Inventories[0] : { quantity: 0, low_stock_threshold: 5 };
                setProduct({
                    id: data.product_id,
                    name: data.product_name,
                    sku: data.sku,
                    currentStock: inv.quantity,
                    lowStockAlert: inv.low_stock_threshold,
                    imageUrl: data.image_url
                });
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Failed to load product details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleStockChange = (delta) => {
        setStockToAdd(prev => Math.max(0, prev + delta));
    };

    const handleRestock = async () => {
        if (stockToAdd <= 0) {
            alert('Please enter a quantity greater than 0');
            return;
        }
        setIsSubmitting(true);
        try {
            await api.post(`/inventory/restock/${id}`, {
                quantity: stockToAdd,
                note: note
            });
            // Redirect to success page with data
            navigate('/inventory/restock-success', {
                state: {
                    product: product,
                    stockAdded: stockToAdd,
                    note: note
                }
            });
        } catch (err) {
            console.error('Error restocking:', err);
            alert('Failed to update stock. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-[#6c757d]">Loading...</div>;
    if (error || !product) return <div className="p-8 text-center text-red-500">{error || 'Product not found'}</div>;

    return (
        <div className="container mx-auto px-4 max-w-[1400px]">
            {/* Breadcrumb */}
            <nav className="flex text-[#6c757d] mb-4">
                <ol className="flex items-center space-x-2">
                    <li><Link to="/products" className="hover:text-[#212529] hover:underline text-[#d4af37]">Products</Link></li>
                    <li className="text-[#6c757d] before:content-['/'] before:mx-2">Restock Product</li>
                </ol>
            </nav>

            <form>
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Product Info Card */}
                    <div className="w-full lg:w-1/2">
                        <div className="bg-white rounded shadow-sm border border-[#e3e6f0] flex flex-col h-full">
                            <div className="bg-[#f8f9fa] border-b border-[#e3e6f0] px-4 py-3">
                                <h5 className="m-0 font-medium text-[#212529] text-[1.25rem]">Restock Product</h5>
                            </div>
                            <div className="p-4 flex-grow">
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <div className="flex-shrink-0">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className="rounded object-cover w-[150px] h-[150px]" />
                                        ) : (
                                            <div className="w-[150px] h-[150px] rounded bg-[#f8f9fa] flex items-center justify-center border border-[#dee2e6]">
                                                <ImageIcon className="h-16 w-16 text-[#6c757d]" />
                                            </div>
                                        )}
                                        <div className="mt-2 text-center">
                                            <span className="inline-block px-2 py-1 text-xs font-semibold bg-[#ffc107] text-black rounded">
                                                <i className="bi bi-exclamation-triangle mr-1"></i>{product.currentStock} units
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-[1.5rem] font-medium mb-4 text-[#212529]">{product.name}</h4>
                                        <div className="mb-2">
                                            <span className="text-[#6c757d] mb-3 mr-2">SKU:</span>
                                            <span className="font-bold text-[#212529]">{product.sku}</span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-[#6c757d] mr-2">Current Stock:</span>
                                            <span className="font-bold text-[#212529]">{product.currentStock}</span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-[#6c757d] mr-2">Low Stock Alert:</span>
                                            <span className="font-bold text-[#212529]">{product.lowStockAlert} units</span>
                                        </div>
                                    </div>
                                </div>

                                <hr className="my-6 border-[#e3e6f0]" />

                                <div>
                                    <label className="block text-[#212529] font-bold mb-2">Product Information</label>
                                    <textarea readOnly rows="3" className="w-full px-3 py-2 bg-[#e9ecef] border border-[#ced4da] rounded text-[#6c757d] cursor-not-allowed resize-y" value="No additional product information available."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Restock Details Card */}
                    <div className="w-full lg:w-1/2">
                        <div className="bg-white rounded shadow-sm border border-[#e3e6f0] flex flex-col h-full">
                            <div className="bg-[#f8f9fa] border-b border-[#e3e6f0] px-4 py-3">
                                <h5 className="m-0 font-medium text-[#212529] text-[1.25rem]">Restock Details</h5>
                            </div>
                            <div className="p-4 flex-grow">
                                <div className="mb-4">
                                    <label className="block text-[#212529] mb-2">Current Stock</label>
                                    <select disabled className="w-full px-3 py-2 bg-[#e9ecef] border border-[#ced4da] rounded text-[#6c757d] cursor-not-allowed hidden md:block appearance-none">
                                        <option>{product.currentStock}</option>
                                    </select>
                                    {/* Webkit fix for disabled select text color */}
                                    <input type="text" disabled value={product.currentStock} className="w-full px-3 py-2 bg-[#e9ecef] border border-[#ced4da] rounded text-[#6c757d] cursor-not-allowed md:hidden" />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-[#212529] mb-2">Stock to Add</label>
                                    <div className="flex">
                                        <input
                                            type="number"
                                            value={stockToAdd}
                                            onChange={(e) => setStockToAdd(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-full px-3 py-2 bg-white border border-[#ced4da] border-r-0 rounded-l focus:outline-none focus:ring-0 focus:border-[#86b7fe] transition-all z-10"
                                        />
                                        <button type="button" onClick={() => handleStockChange(-1)} className="px-3 border border-[#ced4da] bg-white text-[#6c757d] hover:bg-[#f8f9fa] hover:text-[#212529] transition-colors flex items-center justify-center w-10 z-0 border-l-0">
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => handleStockChange(1)} className="px-3 border border-[#ced4da] bg-white text-[#6c757d] hover:bg-[#f8f9fa] hover:text-[#212529] transition-colors rounded-r flex items-center justify-center w-10 z-0 border-l-0">
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-[#212529] mb-2">New Stock Level:</label>
                                    <span className="inline-flex items-center px-2 py-1 text-sm font-semibold bg-[#198754] text-white rounded">
                                        <Check className="h-4 w-4 mr-1" />{product.currentStock + stockToAdd}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-[#212529] mb-2">Note</label>
                                    <input
                                        type="text"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded text-[#212529] focus:outline-none focus:ring-1 focus:ring-[#86b7fe] focus:border-[#86b7fe] transition-all"
                                        placeholder="Optional note..."
                                    />
                                </div>
                            </div>
                            <div className="bg-white border-t border-[#e3e6f0] px-4 py-3 flex justify-end gap-2 rounded-b">
                                <Link to="/inventory" className="px-3 py-1.5 border border-[#6c757d] text-[#6c757d] hover:bg-[#6c757d] hover:text-white rounded transition-colors text-sm font-medium">Cancel</Link>
                                <button type="button" onClick={handleRestock} disabled={isSubmitting || stockToAdd <= 0} className="px-3 py-1.5 bg-[#d4af37] text-white hover:bg-[#b8860b] rounded transition-colors shadow-sm text-sm font-medium disabled:opacity-50">
                                    {isSubmitting ? 'Updating...' : 'Update Stock'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Restock;
