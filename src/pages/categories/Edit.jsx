import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const CategoryEdit = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        category_name: '',
        description: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await api.get(`/categories/${id}`);
                setFormData({
                    category_name: response.data.category_name || '',
                    description: response.data.description || ''
                });
            } catch (err) {
                console.error('Error fetching category:', err);
                setError('Failed to load category details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategory();
    }, [id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            setError(null);
            await api.put(`/categories/${id}`, formData);
            navigate('/categories');
        } catch (err) {
            console.error('Error updating category:', err);
            setError(err.response?.data?.message || 'Failed to update category.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-[1400px] flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-[1400px]">
            {/* Breadcrumb */}
            <nav className="flex text-sm text-[#6c757d] mb-4">
                <ol className="flex items-center space-x-2">
                    <li><Link to="/categories" className="hover:text-[#212529] hover:underline text-[#d4af37]">Categories</Link></li>
                    <li className="text-[#6c757d] before:content-['/'] before:mx-2">Edit Categories</li>
                </ol>
            </nav>

            <div className="flex justify-center">
                <div className="w-full md:w-1/2">
                    <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#0000001a] p-6 transition-all duration-300">
                        <h2 className="text-[28px] font-montserrat font-bold text-[#212529] mb-6">Edit Category</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-[#212529] mb-2">Category Name</label>
                                <input
                                    type="text"
                                    name="category_name"
                                    value={formData.category_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-[#212529] mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2 bg-white border border-[#ced4da] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all resize-y"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Link to="/categories" className="px-4 py-2 bg-[#6c757d] hover:bg-[#5c636a] text-white rounded-lg font-medium transition-colors">
                                    Cancel
                                </Link>
                                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-[#d4af37] hover:bg-[#b8860b] text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryEdit;
