import React, { useState, useEffect } from 'react';
import { Ticket, Target, Shield, Calendar, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PromoCodeCreate = () => {
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'Percentage',
        value: '',
        scope: 'Global',
        target_id: '',
        usage_limit: '',
        min_order_amount: '',
        max_discount_amount: '',
        start_date: '',
        end_date: '',
        is_active: true
    });

    // Options from API
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await api.get('/promocodes/form-data');
                setCategories(res.data.categories || []);
                setProducts(res.data.products || []);
            } catch (err) {
                console.error('Error fetching form data:', err);
                setError('Failed to load form options');
            }
        };
        fetchOptions();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await api.post('/promocodes', {
                ...formData,
                usage_limit: formData.usage_limit || null,
                min_order_amount: formData.min_order_amount || null,
                max_discount_amount: formData.max_discount_amount || null,
                target_id: formData.scope === 'Global' ? null : formData.target_id
            });
            navigate('/promocodes');
        } catch (err) {
            console.error('Error creating promo code:', err);
            setError(err.response?.data?.message || 'Failed to create promo code');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <h1 className="text-[1.75rem] font-medium text-[#5a5c69] mb-0 font-montserrat">Create Promo Code</h1>
                <Link to="/promocodes" className="hidden sm:inline-flex items-center px-3 py-1 bg-[#858796] hover:bg-[#717384] text-white rounded shadow-sm text-sm transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex flex-col xl:flex-row gap-6">
                    {/* Left Column */}
                    <div className="w-full xl:w-2/3 lg:w-7/12 flex flex-col gap-6">

                        {/* General Information Card */}
                        <div className="bg-white rounded shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] border-0 overflow-hidden">
                            <div className="bg-[#f8f9fc] border-b border-[#e3e6f0] px-5 py-3">
                                <h6 className="m-0 font-bold text-[#4e73df] flex items-center">
                                    <Ticket className="h-4 w-4 mr-2" /> General Information
                                </h6>
                            </div>
                            <div className="p-5">
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-[#858796] mb-2">Promo Code</label>
                                    <input type="text" name="code" value={formData.code} onChange={handleChange} required className="w-full px-3 py-2 bg-white border border-[#d1d3e2] rounded text-[#6e707e] focus:outline-none focus:ring-1 focus:ring-[#4e73df] focus:border-[#4e73df] transition-all uppercase" placeholder="e.g., SUMMER10" />
                                </div>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-[#858796] mb-2">Discount Type</label>
                                        <select name="discount_type" value={formData.discount_type} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-[#d1d3e2] rounded text-[#6e707e] focus:outline-none focus:ring-1 focus:ring-[#4e73df] focus:border-[#4e73df] transition-all">
                                            <option value="Percentage">Percentage (%)</option>
                                            <option value="Fixed">Fixed Amount</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-[#858796] mb-2">Value</label>
                                        <input type="number" name="value" value={formData.value} onChange={handleChange} required step="0.01" className="w-full px-3 py-2 bg-white border border-[#d1d3e2] rounded text-[#6e707e] focus:outline-none focus:ring-1 focus:ring-[#4e73df] focus:border-[#4e73df] transition-all" placeholder="0.00" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scope & Target Card */}
                        <div className="bg-white rounded shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] border-0 overflow-hidden">
                            <div className="bg-[#f8f9fc] border-b border-[#e3e6f0] px-5 py-3">
                                <h6 className="m-0 font-bold text-[#4e73df] flex items-center">
                                    <Target className="h-4 w-4 mr-2" /> Scope & Targets
                                </h6>
                            </div>
                            <div className="p-5">
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-[#858796] mb-2">Application Scope</label>
                                    <select
                                        name="scope"
                                        value={formData.scope}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white border border-[#d1d3e2] rounded text-[#6e707e] focus:outline-none focus:ring-1 focus:ring-[#4e73df] focus:border-[#4e73df] transition-all"
                                    >
                                        <option value="Global">Global (Entire Bill)</option>
                                        <option value="Category">Specific Category</option>
                                        <option value="Product">Specific Product</option>
                                    </select>
                                </div>

                                {formData.scope === 'Category' && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold text-[#858796] mb-2">Select Category</label>
                                        <select name="target_id" value={formData.target_id} onChange={handleChange} required className="w-full px-3 py-2 bg-white border border-[#d1d3e2] rounded text-[#6e707e] focus:outline-none focus:ring-1 focus:ring-[#4e73df] focus:border-[#4e73df] transition-all">
                                            <option value="">-- Select Category --</option>
                                            {categories.map(c => (
                                                <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {formData.scope === 'Product' && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold text-[#858796] mb-2">Select Product</label>
                                        <select name="target_id" value={formData.target_id} onChange={handleChange} required className="w-full px-3 py-2 bg-white border border-[#d1d3e2] rounded text-[#6e707e] focus:outline-none focus:ring-1 focus:ring-[#4e73df] focus:border-[#4e73df] transition-all">
                                            <option value="">-- Select Product --</option>
                                            {products.map(p => (
                                                <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Usage Restrictions Card */}
                        <div className="bg-white rounded shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] border-0 overflow-hidden mb-6 xl:mb-0">
                            <div className="bg-[#f8f9fc] border-b border-[#e3e6f0] px-5 py-3">
                                <h6 className="m-0 font-bold text-[#4e73df] flex items-center">
                                    <Shield className="h-4 w-4 mr-2" /> Usage Restrictions (Optional)
                                </h6>
                            </div>
                            <div className="p-5">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-[#858796] mb-2">Usage Limit</label>
                                        <input type="number" name="usage_limit" value={formData.usage_limit} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-[#d1d3e2] rounded text-[#6e707e] focus:outline-none focus:ring-1 focus:ring-[#4e73df] focus:border-[#4e73df] mb-1" placeholder="No limit" />
                                        <small className="text-[#858796]">Max times code can be used.</small>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-[#858796] mb-2">Min Order Amount</label>
                                        <input type="number" name="min_order_amount" value={formData.min_order_amount} onChange={handleChange} step="0.01" className="w-full px-3 py-2 bg-white border border-[#d1d3e2] rounded text-[#6e707e] focus:outline-none focus:ring-1 focus:ring-[#4e73df] focus:border-[#4e73df]" placeholder="0.00" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-[#858796] mb-2">Max Discount</label>
                                        <input type="number" name="max_discount_amount" value={formData.max_discount_amount} onChange={handleChange} step="0.01" className="w-full px-3 py-2 bg-white border border-[#d1d3e2] rounded text-[#6e707e] focus:outline-none focus:ring-1 focus:ring-[#4e73df] focus:border-[#4e73df]" placeholder="0.00" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="w-full xl:w-1/3 lg:w-5/12 flex flex-col gap-6">

                        {/* Validity Period Card */}
                        <div className="bg-white rounded shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] border-0 overflow-hidden">
                            <div className="bg-[#f8f9fc] border-b border-[#e3e6f0] px-5 py-3">
                                <h6 className="m-0 font-bold text-[#4e73df] flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" /> Validity Period
                                </h6>
                            </div>
                            <div className="p-5">
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-[#858796] mb-2">Start Date</label>
                                    <input type="datetime-local" name="start_date" value={formData.start_date} onChange={handleChange} required className="w-full px-3 py-2 bg-white border border-[#d1d3e2] rounded text-[#6e707e] focus:outline-none focus:ring-1 focus:ring-[#4e73df] focus:border-[#4e73df]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#858796] mb-2">End Date</label>
                                    <input type="datetime-local" name="end_date" value={formData.end_date} onChange={handleChange} required className="w-full px-3 py-2 bg-white border border-[#d1d3e2] rounded text-[#6e707e] focus:outline-none focus:ring-1 focus:ring-[#4e73df] focus:border-[#4e73df]" />
                                </div>
                            </div>
                        </div>

                        {/* Status & Action Card */}
                        <div className="bg-white rounded shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] border-0 overflow-hidden">
                            <div className="bg-[#f8f9fc] border-b border-[#e3e6f0] px-5 py-3">
                                <h6 className="m-0 font-bold text-[#4e73df] flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-2" /> Status & Action
                                </h6>
                            </div>
                            <div className="p-5">
                                <div className="border border-[#e3e6f0] p-3 rounded mb-4">
                                    <div className="flex items-center">
                                        <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                id="togglePromo"
                                                checked={formData.is_active}
                                                onChange={handleChange}
                                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out border-[#d1d3e2] checked:border-[#1cc88a] checked:translate-x-6"
                                            />
                                            <label htmlFor="togglePromo" className={`toggle-label block overflow-hidden h-6 rounded-full bg-[#eaecf4] cursor-pointer ${formData.is_active ? 'bg-[#1cc88a]' : ''}`}></label>
                                        </div>
                                        <label htmlFor="togglePromo" className={`text-base font-bold cursor-pointer transition-colors ${formData.is_active ? 'text-[#1cc88a]' : 'text-[#858796]'}`}>
                                            Active Promo Code
                                        </label>
                                    </div>
                                </div>
                                <hr className="mt-0 mb-4 border-t border-[#e3e6f0]" />
                                <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center px-4 py-3 text-base bg-[#4e73df] hover:bg-[#2e59d9] text-white rounded font-normal transition-colors shadow-sm cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed">
                                    <i className="fas fa-save fa-sm text-white/50 mr-2"></i> {isSubmitting ? 'Creating...' : 'Create Promo Code'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </form>
        </div>
    );
};

export default PromoCodeCreate;
