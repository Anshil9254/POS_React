import React, { useState, useEffect } from 'react';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardBody } from '../../components/ui/Card';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/categories');
            setCategories(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Failed to load categories.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                await api.delete(`/categories/${id}`);
                setCategories(categories.filter(category => category.category_id !== id));
            } catch (err) {
                console.error('Error deleting category:', err);
                alert('Cannot delete category in use or server error.');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-[1400px] flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto max-w-[1400px]">
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-center">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-[1400px]">
            <PageHeader
                title="Product Categories"
                description="Manage product classification"
                breadcrumbs={[{ label: 'Categories', link: '/categories' }, { label: 'Categories Management' }]}
                actionButton={
                    <Button to="/categories/create" variant="primary">
                        <PlusCircle className="h-5 w-5 mr-2" /> Add New Category
                    </Button>
                }
            />

            <Card>
                <CardBody noPadding>
                    <TableContainer>
                        <Thead>
                            <Tr isHoverable={false}>
                                <Th className="rounded-tl-lg">Category Name</Th>
                                <Th>Description</Th>
                                <Th>Products Count</Th>
                                <Th isAction className="rounded-tr-lg">Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {categories.length > 0 ? (
                                categories.map(item => (
                                    <Tr key={item.category_id}>
                                        <Td>
                                            <div className="font-bold text-[#212529]">{item.category_name}</div>
                                        </Td>
                                        <Td className="text-sm text-[#212529]">{item.description}</Td>
                                        <Td>
                                            <Badge variant="light" className="uppercase tracking-wide">
                                                {item.productCount || 0} products
                                            </Badge>
                                        </Td>
                                        <Td isAction>
                                            <div className="flex justify-end ml-auto bg-white border border-[#0000001a] rounded-lg overflow-hidden w-fit shadow-sm">
                                                <Button to={`/categories/edit/${item.category_id}`} variant="ghostPrimary" size="icon" className="border-r border-[#0000001a] rounded-none hover:text-white" title="Edit">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghostDanger" size="icon" onClick={() => handleDelete(item.category_id)} className="rounded-none hover:text-white" title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <Tr>
                                    <Td colSpan="4" className="text-center py-8 text-[#6c757d]">No categories found</Td>
                                </Tr>
                            )}
                        </Tbody>
                    </TableContainer>
                </CardBody>
            </Card>
        </div>
    );
};

export default Categories;
