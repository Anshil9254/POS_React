import React, { useState, useEffect } from 'react';
import { PlusCircle, Pencil, Trash2, User } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardBody } from '../../components/ui/Card';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

const Store = () => {
    const [stores, setStores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStores = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/stores');
            setStores(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching stores:', err);
            setError('Failed to load stores.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    // Note: Delete Store endpoint might not exist, but adding handler assuming we might add it or just log error
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this store?")) {
            // For now, assume backend route doesn't exist to delete fully, 
            // but if it does, this will catch error gracefully.
            try {
                await api.delete(`/stores/${id}`);
                setStores(stores.filter(store => store.store_id !== id));
            } catch (err) {
                console.error('Error deleting store:', err);
                alert(err.response?.data?.message || 'Cannot delete store. Please try deactivating it instead.');
            }
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
            <PageHeader
                title="Stores"
                actionButton={
                    <Button to="/stores/create" variant="primary">
                        <PlusCircle className="h-5 w-5 mr-2" /> Add New Store
                    </Button>
                }
            />

            <Card>
                <CardBody noPadding>
                    <TableContainer>
                        <Thead>
                            <Tr isHoverable={false}>
                                <Th className="pl-6">Store Name</Th>
                                <Th>GST No.</Th>
                                <Th>Manager(s)</Th>
                                <Th>Address</Th>
                                <Th>Status</Th>
                                <Th isAction>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {error && (
                                <Tr>
                                    <Td colSpan="6">
                                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                            {error}
                                        </div>
                                    </Td>
                                </Tr>
                            )}
                            {stores.length > 0 ? (
                                stores.map(item => {
                                    const managers = (item.Users || [])
                                        .filter(u => u.Role?.role_name === 'Manager')
                                        .map(u => u.full_name);

                                    return (
                                        <Tr key={item.store_id}>
                                            <Td className="pl-6">
                                                <div className="font-bold text-[#212529]">{item.store_name}</div>
                                                <div className="text-xs text-[#6c757d]">ID: {item.store_id}</div>
                                            </Td>
                                            <Td>
                                                {item.gst_number ? (
                                                    <Badge variant="light" className="font-mono">{item.gst_number}</Badge>
                                                ) : (
                                                    <span className="text-[#6c757d]">-</span>
                                                )}
                                            </Td>
                                            <Td>
                                                {managers.length > 0 ? (
                                                    <div className="flex flex-col gap-1 text-sm text-[#212529]">
                                                        {managers.map(m => (
                                                            <div key={m} className="flex items-center gap-1">
                                                                <User className="h-3 w-3 text-[#d4af37]" /> {m}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-[#6c757d] italic text-sm">No Manager</span>
                                                )}
                                            </Td>
                                            <Td className="text-sm text-[#212529]">{item.address || '-'}</Td>
                                            <Td>
                                                {item.is_active ? (
                                                    <Badge variant="success">Active</Badge>
                                                ) : (
                                                    <Badge variant="danger">Inactive</Badge>
                                                )}
                                            </Td>
                                            <Td isAction>
                                                <div className="flex justify-end ml-auto bg-white border border-[#0000001a] rounded-lg overflow-hidden w-fit shadow-sm">
                                                    <Button to={`/stores/edit/${item.store_id}`} variant="ghostPrimary" size="icon" className="border-r border-[#0000001a] rounded-none hover:text-white" title="Edit">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghostDanger" size="icon" onClick={() => handleDelete(item.store_id)} className="rounded-none hover:text-white" title="Delete">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    );
                                })
                            ) : (
                                <Tr>
                                    <Td colSpan="6" className="text-center py-8 text-[#6c757d]">No stores found</Td>
                                </Tr>
                            )}
                        </Tbody>
                    </TableContainer>
                </CardBody>
            </Card>
        </div>
    );
};

export default Store;
