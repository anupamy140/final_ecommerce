// src/pages/AddressManagementPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { Loader2, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { Address } from '../lib/types';
import { Button } from '../components/ui/Button';
import { AddressFormModal } from '../components/profile/AddressFormModal';

export const AddressManagementPage = () => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const fetchAddresses = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/users/addresses');
            if (!res.ok) throw new Error("Failed to fetch addresses");
            const data = await res.json();
            setAddresses(data);
        } catch (error) {
            toast.error("Could not load your addresses.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const handleAdd = () => {
        setEditingAddress(null);
        setIsModalOpen(true);
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setIsModalOpen(true);
    };

    const handleDelete = async (addressId: string) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        try {
            const res = await api.delete(`/users/addresses/${addressId}`);
            if (!res.ok) throw new Error("Failed to delete address");
            toast.success("Address deleted successfully.");
            fetchAddresses();
        } catch (error) {
            toast.error("Could not delete address.");
        }
    };

    const handleSave = async (addressData: Omit<Address, '_id' | 'isDefault'>) => {
        try {
            let res;
            if (editingAddress) {
                res = await api.put(`/users/addresses/${editingAddress._id}`, addressData);
            } else {
                res = await api.post('/users/addresses', addressData);
            }
            if (!res.ok) throw new Error((await res.json()).detail || 'Failed to save address');
            toast.success(`Address ${editingAddress ? 'updated' : 'added'} successfully.`);
            setIsModalOpen(false);
            fetchAddresses();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Addresses</h2>
                <Button onClick={handleAdd}>Add New Address</Button>
            </div>
            {addresses.length === 0 ? (
                <p className="text-gray-500">You haven't added any addresses yet.</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                        <div key={addr._id} className="border dark:border-gray-800 rounded-lg p-4 flex justify-between items-start">
                            <div>
                                <p className="font-semibold">{addr.street}</p>
                                <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.postalCode}</p>
                                <p className="text-sm text-gray-500">{addr.country}</p>
                                {addr.isDefault && <span className="mt-2 inline-block text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Default</span>}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(addr)}><Edit size={16} /></Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-500" onClick={() => handleDelete(addr._id)}><Trash2 size={16} /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <AddressFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                address={editingAddress}
            />
        </div>
    );
};