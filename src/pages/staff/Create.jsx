import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';

const StaffCreate = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role_id: '',
        store_id: '',
        razorpay_key_id: '',
        razorpay_key_secret: '',
        is_active: true
    });
    const [roles, setRoles] = useState([]);
    const [stores, setStores] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [rolesRes, storesRes] = await Promise.all([
                    api.get('/staff/roles'),
                    api.get('/stores')
                ]);
                setRoles(rolesRes.data);
                setStores(storesRes.data);
            } catch (err) {
                console.error('Error fetching dropdowns:', err);
                setError('Failed to load roles and stores.');
            }
        };
        fetchDropdowns();
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
        try {
            setIsSubmitting(true);
            const payload = { ...formData };
            if (!payload.store_id) delete payload.store_id; // Set undefined if empty
            await api.post('/staff', payload);
            navigate('/staff');
        } catch (err) {
            console.error('Error creating staff:', err);
            setError(err.response?.data?.message || 'Failed to create staff');
            setIsSubmitting(false);
        }
    };

    // Helper to find selected role name for UI logic
    const selectedRole = roles.find(r => r.role_id.toString() === formData.role_id.toString());
    const roleName = selectedRole ? selectedRole.role_name : '';

    return (
        <div className="container mx-auto max-w-[1400px]">
            {/* Breadcrumb */}
            <nav className="flex text-sm text-[#6c757d] mb-4">
                <ol className="flex items-center space-x-2">
                    <li><Link to="/staff" className="hover:text-[#212529] hover:underline text-[#d4af37]">Staff</Link></li>
                    <li className="text-[#6c757d] before:content-['/'] before:mx-2">Add New Staff</li>
                </ol>
            </nav>

            <div className="flex justify-center">
                <div className="w-full md:w-1/2">
                    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/20 p-6">
                        <h4 className="m-0 text-xl font-bold text-[#212529] mb-6">Add Staff Member</h4>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-[#212529] mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-[#212529] mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
                                    placeholder="Login email"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-[#212529] mb-1">Role</label>
                                <select
                                    name="role_id"
                                    value={formData.role_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
                                >
                                    <option value="">Select Role</option>
                                    {roles.map(r => (
                                        <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
                                    ))}
                                </select>
                            </div>

                            {roleName !== 'Cashier' && (
                                <div className="space-y-4 mb-4 transition-all">
                                    <div>
                                        <label className="block text-sm font-medium text-[#212529] mb-1">Razorpay Key ID</label>
                                        <input
                                            type="text"
                                            name="razorpay_key_id"
                                            value={formData.razorpay_key_id}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
                                            placeholder="rzp_test_..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#212529] mb-1">Razorpay Key Secret</label>
                                        <input
                                            type="password"
                                            name="razorpay_key_secret"
                                            value={formData.razorpay_key_secret}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
                                            placeholder="Key Secret"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-[#212529] mb-1">Assign to Existing Store</label>
                                <select
                                    name="store_id"
                                    value={formData.store_id}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all mb-1"
                                >
                                    <option value="">-- No Store (Unassigned) --</option>
                                    {stores.map(store => (
                                        <option key={store.store_id} value={store.store_id}>{store.store_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center">
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            id="toggle"
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                            className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out border-[#ced4da] checked:border-[#d4af37] checked:translate-x-5"
                                        />
                                        <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-5 rounded-full bg-[#e9ecef] cursor-pointer ${formData.is_active ? 'bg-[#d4af37]' : ''}`}></label>
                                    </div>
                                    <label htmlFor="toggle" className="text-sm font-medium text-[#212529]">Account Active</label>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-[#212529] mb-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                    className="w-full px-3 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all mb-1"
                                    placeholder="Enter password"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    variant="primary"
                                    className="w-full py-2"
                                >
                                    {isSubmitting ? 'Saving...' : 'Add Staff Member'}
                                </Button>
                                <Link to="/staff" className="w-full py-2 text-center bg-transparent border border-[#6c757d] hover:bg-[#f8f9fa] text-[#6c757d] rounded-lg font-medium transition-colors">
                                    Back to List
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffCreate;
