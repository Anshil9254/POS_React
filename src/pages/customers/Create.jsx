import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, User, Phone, Mail, MapPin, Save } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';

const CustomerCreate = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/customers', formData);
            navigate('/customers');
        } catch (error) {
            console.error('Error creating customer:', error);
            alert(error.response?.data?.message || 'Failed to create customer.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/customers" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft className="h-6 w-6 text-gray-600" />
                </Link>
                <h2 className="text-2xl font-bold text-gray-800">Add New Customer</h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <User className="h-4 w-4 text-[#d4af37]" />
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af3726] focus:border-[#d4af37] transition-all"
                                placeholder="Enter customer name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-[#d4af37]" />
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af3726] focus:border-[#d4af37] transition-all"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-[#d4af37]" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af3726] focus:border-[#d4af37] transition-all"
                                    placeholder="Enter email (optional)"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-[#d4af37]" />
                                Address
                            </label>
                            <textarea
                                name="address"
                                rows="3"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af3726] focus:border-[#d4af37] transition-all"
                                placeholder="Enter customer address (optional)"
                                value={formData.address}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/customers')}
                            className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            variant="primary"
                            className="flex-1 px-6 py-3"
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-black rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save className="h-5 w-5 mr-2" />
                                    Save Customer
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerCreate;
