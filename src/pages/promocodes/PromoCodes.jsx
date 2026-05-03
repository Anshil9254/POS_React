import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardBody } from '../../components/ui/Card';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

const PromoCodes = () => {
    const [promoCodes, setPromoCodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPromoCodes = async () => {
            try {
                const response = await api.get('/promocodes');
                setPromoCodes(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching promo codes:', err);
                setError('Failed to load promo codes');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPromoCodes();
    }, []);

    return (
        <div className="container mx-auto max-w-[1400px]">
            <PageHeader
                title="Promo Codes"
                actionButton={
                    <Button to="/promocodes/create" variant="primary">
                        <Plus className="h-4 w-4 mr-2" /> Create New Code
                    </Button>
                }
            />

            <Card>
                <div className="bg-[#f8f9fc] border-b border-[#e3e6f0] px-5 py-4">
                    <h6 className="m-0 font-bold text-[#d4af37] text-[16px]">All Promo Codes</h6>
                </div>
                <CardBody noPadding>
                    {isLoading ? (
                        <div className="py-20 flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e293b]"></div>
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-red-600 bg-red-50">{error}</div>
                    ) : (
                        <TableContainer>
                            <Thead>
                                <Tr isHoverable={false}>
                                    <Th className="pl-6">Code</Th>
                                    <Th>Type</Th>
                                    <Th>Value</Th>
                                    <Th>Scope</Th>
                                    <Th>Target</Th>
                                    <Th>Usage</Th>
                                    <Th>Valid Until</Th>
                                    <Th>Status</Th>
                                    <Th isAction>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {promoCodes.map((item) => {
                                    const endDate = item.end_date ? new Date(item.end_date).toLocaleDateString() : 'N/A';
                                    const valueFormatted = item.discount_type === 'Percentage' ? `${parseFloat(item.value)}%` : `₹${parseFloat(item.value).toFixed(2)}`;
                                    
                                    const isExpired = item.end_date && new Date(item.end_date) < new Date(new Date().setHours(0, 0, 0, 0));

                                    return (
                                        <Tr key={item.promo_id}>
                                            <Td className="pl-6">
                                                <Badge variant="light" className="font-mono font-bold">{item.code}</Badge>
                                            </Td>
                                            <Td className="text-sm">{item.discount_type}</Td>
                                            <Td className="font-semibold text-[#212529]">
                                                {valueFormatted}
                                            </Td>
                                            <Td className="text-sm">{item.scope}</Td>
                                            <Td className="text-sm">
                                                {item.scope === 'Global' ? <span className="text-[#6c757d] italic">Global</span> : <span className="font-mono">{item.target_id || '-'}</span>}
                                            </Td>
                                            <Td className="text-sm">
                                                {item.usage_count} {item.usage_limit ? ` / ${item.usage_limit}` : ''}
                                            </Td>
                                            <Td className="text-sm text-[#212529]">{endDate}</Td>
                                            <Td>
                                                {isExpired ? (
                                                    <Badge variant="danger">Expired</Badge>
                                                ) : item.is_active ? (
                                                    <Badge variant="success">Active</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                )}
                                            </Td>
                                            <Td isAction>
                                                <div className="flex justify-end ml-auto bg-white border border-[#0000001a] rounded-lg overflow-hidden w-fit shadow-sm">
                                                    <Button to={`/promocodes/edit/${item.promo_id}`} variant="ghostPrimary" size="icon" className="rounded-none hover:text-white" title="Edit">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    );
                                })}
                                {promoCodes.length === 0 && (
                                    <Tr>
                                        <Td colSpan="9" className="text-center py-8 text-[#6c757d]">
                                            No Promo Codes found.
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </TableContainer>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default PromoCodes;
