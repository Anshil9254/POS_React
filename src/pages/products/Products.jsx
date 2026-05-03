import React, { useState, useEffect } from 'react';
import { Search, Plus, ArrowUpDown, Pencil, RefreshCw, Trash2, CheckCircle, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardBody } from '../../components/ui/Card';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

const Products = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/products');
            setProducts(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(products.filter(p => p.product_id !== id));
            } catch (err) {
                console.error('Error deleting product:', err);
                alert('Cannot delete product or server error.');
            }
        }
    };

    const getStock = (product) => {
        if (product.Inventory && product.Inventory.quantity !== undefined) return product.Inventory.quantity;
        if (product.Inventories && product.Inventories.length > 0) return product.Inventories[0].quantity;
        return 0;
    };

    // Filter products based on tabs
    const filteredProducts = products.filter(product => {
        const stock = getStock(product);
        if (activeTab === 'instock') return stock > 5;
        if (activeTab === 'lowstock') return stock > 0 && stock <= 5;
        if (activeTab === 'outofstock') return stock === 0;
        return true;
    });

    const lowStockProduct = products.find(p => {
        const stock = getStock(p);
        return stock > 0 && stock <= 5;
    });

    const totalProducts = products.length;

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
                title="Products Management"
                breadcrumbs={[{ label: 'Products', link: '/products' }, { label: 'Products Management' }]}
            />

            {/* Low Stock Alert */}
            {lowStockProduct && (
                <div className="bg-[#fff3cd] border border-[#ffe69c] text-[#664d03] px-4 py-3 rounded-lg mb-6 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span><strong>Low Stock alert</strong> - {lowStockProduct.product_name} is low on stock and needs restocking.</span>
                    </div>
                    <Button to={`/inventory/restock/${lowStockProduct.product_id}`} variant="primary" size="sm">
                        Restock
                    </Button>
                </div>
            )}

            {/* Filter Tabs & Add Button */}
            <div className="flex justify-between items-center mb-6">
                <ul className="flex flex-wrap border-b-0 gap-1 rounded-lg">
                    <li>
                        <Button
                            onClick={() => setActiveTab('all')}
                            variant={activeTab === 'all' ? 'primary' : 'ghostPrimary'}
                        >
                            All ({totalProducts})
                        </Button>
                    </li>
                    <li>
                        <Button
                            onClick={() => setActiveTab('instock')}
                            variant={activeTab === 'instock' ? 'primary' : 'ghostPrimary'}
                        >
                            In Stock
                        </Button>
                    </li>
                    <li>
                        <Button
                            onClick={() => setActiveTab('lowstock')}
                            variant={activeTab === 'lowstock' ? 'primary' : 'ghostPrimary'}
                        >
                            Low Stock
                        </Button>
                    </li>
                    <li>
                        <Button
                            onClick={() => setActiveTab('outofstock')}
                            variant={activeTab === 'outofstock' ? 'primary' : 'ghostPrimary'}
                        >
                            Out of Stock
                        </Button>
                    </li>
                </ul>
                <Button to="/products/create" variant="primary">
                    <Plus className="h-4 w-4 mr-2" /> Add Product
                </Button>
            </div>

            {/* Search Bar */}
            <Card className="mb-6">
                <CardBody noPadding className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-[#6c757d]" />
                        </div>
                        <input type="text" className="w-full pl-10 pr-4 py-2 bg-[#f8f9fa] border border-[#0000001a] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af3780] focus:border-[#d4af37] transition-all" placeholder="Search products..." />
                    </div>
                    <div className="w-full md:w-48">
                        <select className="w-full px-4 py-2 bg-[#f8f9fa] border border-[#0000001a] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af3780] focus:border-[#d4af37] transition-all appearance-none">
                            <option value="">All Categories</option>
                            <option value="1">Beverages</option>
                            <option value="2">Bakery</option>
                            <option value="3">Snacks</option>
                        </select>
                    </div>
                    <div className="w-full md:w-48">
                        <select className="w-full px-4 py-2 bg-[#f8f9fa] border border-[#0000001a] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af3780] focus:border-[#d4af37] transition-all appearance-none">
                            <option value="">All Stores</option>
                            <option value="1">Main Store</option>
                            <option value="2">Branch 1</option>
                        </select>
                    </div>
                    <div className="w-full md:w-48">
                        <select className="w-full px-4 py-2 bg-[#f8f9fa] border border-[#0000001a] rounded-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#d4af3780] focus:border-[#d4af37] transition-all appearance-none">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </CardBody>
            </Card>

            {/* Products Table */}
            <Card>
                <CardBody noPadding>
                    <TableContainer>
                        <Thead>
                            <Tr isHoverable={false}>
                                <Th className="w-16">Image</Th>
                                <Th className="whitespace-nowrap">Product <ArrowUpDown className="inline-block h-3 w-3 ml-1" /></Th>
                                <Th className="whitespace-nowrap">SKU <ArrowUpDown className="inline-block h-3 w-3 ml-1" /></Th>
                                <Th className="whitespace-nowrap">Category <ArrowUpDown className="inline-block h-3 w-3 ml-1" /></Th>
                                <Th className="whitespace-nowrap">Store <ArrowUpDown className="inline-block h-3 w-3 ml-1" /></Th>
                                <Th className="whitespace-nowrap">Stock <ArrowUpDown className="inline-block h-3 w-3 ml-1" /></Th>
                                <Th className="whitespace-nowrap">Price <ArrowUpDown className="inline-block h-3 w-3 ml-1" /></Th>
                                <Th className="whitespace-nowrap">Status <ArrowUpDown className="inline-block h-3 w-3 ml-1" /></Th>
                                <Th isAction>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((item) => {
                                    const stock = getStock(item);
                                    let stockStatusClass = "text-[#198754]";
                                    if (stock <= 5 && stock > 0) stockStatusClass = "text-[#ffc107]";
                                    else if (stock === 0) stockStatusClass = "text-[#dc3545]";

                                    return (
                                        <Tr key={item.product_id}>
                                            <Td className="w-16">
                                                <div className="h-10 w-10 rounded-lg overflow-hidden bg-[#f8f9fa] flex items-center justify-center border border-[#0000001a]">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.product_name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="h-5 w-5 text-[#6c757d]" />
                                                    )}
                                                </div>
                                            </Td>
                                            <Td>
                                                <div className="font-semibold text-[#212529]">{item.product_name}</div>
                                            </Td>
                                            <Td>
                                                <Badge variant="light" className="font-mono">{item.sku}</Badge>
                                            </Td>
                                            <Td>{item.Category ? item.Category.category_name : 'N/A'}</Td>
                                            <Td>Main Store</Td>
                                            <Td>
                                                <span className={`${stockStatusClass} font-medium`}>{stock}</span>
                                            </Td>
                                            <Td className="font-medium">${parseFloat(item.price).toFixed(2)}</Td>
                                            <Td>
                                                {item.is_active ? (
                                                    <Badge variant="successLight">Active</Badge>
                                                ) : (
                                                    <Badge variant="dangerLight">Inactive</Badge>
                                                )}
                                            </Td>
                                            <Td isAction>
                                                <div className="flex justify-end ml-auto bg-white border border-[#0000001a] rounded-lg overflow-hidden w-fit shadow-sm">
                                                    <Button to={`/products/edit/${item.product_id}`} variant="ghostPrimary" size="icon" className="border-r border-[#0000001a] rounded-none hover:text-white" title="Edit">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghostDanger" size="icon" onClick={() => handleDelete(item.product_id)} className="rounded-none hover:text-white" title="Delete">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    );
                                })
                            ) : (
                                <Tr>
                                    <Td colSpan="9" className="text-center py-8 text-[#6c757d]">No products found</Td>
                                </Tr>
                            )}
                        </Tbody>
                    </TableContainer>
                </CardBody>
            </Card>
        </div>
    );
};

export default Products;
