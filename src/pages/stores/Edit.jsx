import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const StoreEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        store_name: '',
        contact_number: '',
        address: '',
        razorpay_key_id: '',
        razorpay_key_secret: '',
        gst_number: '',
        is_active: true
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const response = await api.get(`/stores/${id}`);
                const store = response.data;
                setFormData({
                    store_name: store.store_name || '',
                    contact_number: store.contact_number || '',
                    address: store.address || '',
                    razorpay_key_id: store.razorpay_key_id || '',
                    razorpay_key_secret: store.razorpay_key_secret || '',
                    gst_number: store.gst_number || '',
                    is_active: store.is_active === undefined ? true : store.is_active
                });
            } catch (err) {
                console.error('Error fetching store:', err);
                setError('Failed to load store details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchStore();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await api.put(`/stores/${id}`, formData);
            navigate('/stores');
        } catch (err) {
            console.error('Error updating store:', err);
            setError(err.response?.data?.message || 'Failed to update store');
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-[1400px] flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e293b]"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-[1400px]">
            {/* Breadcrumb */}
            <nav className="flex text-sm text-[#6c757d] mb-4">
                <ol className="flex items-center space-x-2">
                    <li><Link to="/stores" className="hover:text-[#212529] hover:underline text-[#d4af37]">Stores</Link></li>
                    <li className="text-[#6c757d] before:content-['/'] before:mx-2">Edit Store</li>
                </ol>
            </nav>

            <div className="flex justify-center">
                <div className="w-full md:w-8/12">
                    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/20 p-6">
                        <h2 className="text-[28px] font-montserrat font-bold text-[#212529] mb-6">Edit Store</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <h5 className="text-[1.25rem] font-medium text-[#d4af37] mb-4">Store Details</h5>

                            <div className="flex flex-col md:flex-row gap-4 mb-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-[#212529] mb-1">Store Name *</label>
                                    <input
                                        type="text"
                                        name="store_name"
                                        value={formData.store_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-[#212529] mb-1">Contact Number</label>
                                    <input
                                        type="text"
                                        name="contact_number"
                                        value={formData.contact_number}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-[#212529] mb-1">Address</label>
                                <textarea
                                    rows="2"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all resize-y"
                                ></textarea>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 mb-4 flex-wrap">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-[#212529] mb-1">Razorpay Key ID</label>
                                    <input
                                        type="text"
                                        name="razorpay_key_id"
                                        value={formData.razorpay_key_id}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
                                    />
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-[#212529] mb-1">Razorpay Key Secret</label>
                                    <input
                                        type="password"
                                        name="razorpay_key_secret"
                                        value={formData.razorpay_key_secret}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
                                    />
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-[#212529] mb-1">GST Number</label>
                                    <input
                                        type="text"
                                        name="gst_number"
                                        value={formData.gst_number}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="mb-4 flex items-end">
                                <div className="flex items-center mb-2">
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            id="toggleEditActive"
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                            className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out border-[#ced4da] checked:border-[#d4af37] checked:translate-x-5"
                                        />
                                        <label htmlFor="toggleEditActive" className={`toggle-label block overflow-hidden h-5 rounded-full bg-[#e9ecef] cursor-pointer ${formData.is_active ? 'bg-[#d4af37]' : ''}`}></label>
                                    </div>
                                    <label htmlFor="toggleEditActive" className="text-sm font-medium text-[#212529]">Store Active</label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-8">
                                <Link to="/stores" className="px-4 py-2 bg-[#6c757d] hover:bg-[#5c636a] text-white rounded-lg font-medium transition-colors">
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-[#d4af37] hover:bg-[#b8860b] text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreEdit;
