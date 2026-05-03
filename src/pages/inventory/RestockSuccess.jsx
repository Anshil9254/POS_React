import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Image as ImageIcon, CheckCircle, ArrowUp, Check } from 'lucide-react';

const RestockSuccess = () => {
    const location = useLocation();

    // Redirect back to inventory if accessed without state
    if (!location.state || !location.state.product) {
        return <Navigate to="/inventory" />;
    }

    const { product, stockAdded, note } = location.state;

    // Computed Product Data based on passed state
    const displayData = {
        name: product.name,
        sku: product.sku,
        previousStock: product.currentStock,
        stockAdded: stockAdded,
        currentStock: product.currentStock + stockAdded,
        lowStockAlert: product.lowStockAlert,
        note: note,
        imageUrl: product.imageUrl
    };

    return (
        <div className="container mx-auto px-4 py-4 max-w-[1400px]">
            {/* Breadcrumb */}
            <nav className="flex text-[#6c757d] mb-4">
                <ol className="flex items-center space-x-2">
                    <li><Link to="/products" className="hover:text-[#212529] hover:underline text-[#d4af37]">Products</Link></li>
                    <li className="text-[#6c757d] before:content-['/'] before:mx-2">Restock Product</li>
                </ol>
            </nav>

            {/* Success Message */}
            <div className="bg-[#d1e7dd] text-[#0f5132] px-4 py-3 rounded border border-[#badbcc] flex items-center mb-6">
                <CheckCircle className="h-6 w-6 mr-3 flex-shrink-0" />
                <span className="text-[1.25rem] font-medium">Stock level updated successfully</span>
            </div>

            <h2 className="text-[2rem] font-bold text-[#212529] mb-6 font-montserrat">Restock Product</h2>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Product Info Card */}
                <div className="w-full lg:w-1/2">
                    <div className="bg-white rounded shadow-sm border border-[#e3e6f0] flex flex-col h-full">
                        <div className="bg-[#f8f9fa] border-b border-[#e3e6f0] px-4 py-3">
                            <h5 className="m-0 font-medium text-[#212529] text-[1.25rem]">Restock Product</h5>
                        </div>
                        <div className="p-4 flex-grow">
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="flex-shrink-0 relative">
                                    {displayData.imageUrl ? (
                                        <img src={displayData.imageUrl} alt={displayData.name} className="rounded object-cover w-[150px] h-[150px]" />
                                    ) : (
                                        <div className="w-[150px] h-[150px] rounded bg-[#f8f9fa] flex items-center justify-center border border-[#dee2e6]">
                                            <ImageIcon className="h-16 w-16 text-[#6c757d]" />
                                        </div>
                                    )}
                                    <div className="mt-2 text-center absolute -bottom-3 left-0 w-full flex justify-center space-x-1">
                                        <span className="inline-block px-2 py-1 text-xs font-semibold bg-[#198754] text-white rounded">
                                            x {displayData.currentStock}
                                        </span>
                                        <span className="inline-flex items-center px-1 py-1 bg-[#f8f9fa] border border-[#dee2e6] rounded">
                                            <ArrowUp className="h-3 w-3 text-[#198754]" />
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-grow pt-2">
                                    <h4 className="text-[1.5rem] font-medium mb-4 text-[#212529]">{displayData.name}</h4>
                                    <p className="text-[#6c757d] mb-3">SKU, {displayData.sku}</p>

                                    <div className="mb-2">
                                        <span className="text-[#6c757d] mr-2">Low Stock Alert:</span>
                                        <span className="font-bold text-[#212529]">{displayData.lowStockAlert} units</span>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-6 border-[#e3e6f0] mt-8" />

                            <div className="mb-3">
                                <label className="block text-[#212529] font-bold mb-2">Restock Note</label>
                                <p className="mb-0 text-[#6c757d]">{displayData.note || "No note provided"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Restock Summary Card */}
                <div className="w-full lg:w-1/2">
                    <div className="bg-white rounded shadow-sm border border-[#e3e6f0] flex flex-col h-full">
                        <div className="bg-[#f8f9fa] border-b border-[#e3e6f0] px-4 py-3">
                            <h5 className="m-0 font-medium text-[#212529] text-[1.25rem]">Restock Details</h5>
                        </div>
                        <div className="p-4 flex-grow">
                            <table className="w-full text-left">
                                <tbody>
                                    <tr className="border-b border-[#dee2e6]">
                                        <td className="py-3 text-[#6c757d]">Current Stock</td>
                                        <td className="py-3 text-right text-[#212529]">{displayData.previousStock}</td>
                                    </tr>
                                    <tr className="border-b border-[#dee2e6]">
                                        <td className="py-3 text-[#6c757d]">Stock Added</td>
                                        <td className="py-3 text-right text-[#198754]">+{displayData.stockAdded}</td>
                                    </tr>
                                    <tr className="border-b border-[#dee2e6]">
                                        <td className="py-3 text-[#6c757d]">New Stock Level:</td>
                                        <td className="py-3 text-right">
                                            <span className="inline-flex items-center px-2 py-1 text-sm font-semibold bg-[#198754] text-white rounded">
                                                <Check className="h-4 w-4 mr-1" />{displayData.currentStock}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 text-[#6c757d]">Restock Note</td>
                                        <td className="py-3 text-right text-[#212529]">{displayData.note || "N/A"}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-[#f8f9fa] border-t border-[#e3e6f0] px-4 py-3 rounded-b text-center">
                            <Link to="/inventory" className="inline-block px-12 py-2 bg-[#d4af37] text-white hover:bg-[#b8860b] rounded transition-colors shadow-sm font-medium">OK</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestockSuccess;
