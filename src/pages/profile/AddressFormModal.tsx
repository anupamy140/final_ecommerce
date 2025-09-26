import React, { useState, useEffect } from 'react';
import Dialog from '../../components/ui/Dialog';
import Button from '../../components/ui/Button';
import {  Loader2 } from 'lucide-react';
import type { Address } from '../../types';
import { X as CloseIcon } from 'lucide-react';

interface AddressFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    address: Address | null;
}

const AddressFormModal: React.FC<AddressFormModalProps> = ({ isOpen, onClose, onSave, address }) => {
    const [formData, setFormData] = useState({ street: '', city: '', state: '', postalCode: '', country: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (address) {
            setFormData({ street: address.street, city: address.city, state: address.state, postalCode: address.postalCode, country: address.country });
        } else {
            setFormData({ street: '', city: '', state: '', postalCode: '', country: '' });
        }
    }, [address, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onSave(formData);
        setLoading(false);
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-md relative shadow-lg">
                <Button variant="ghost" className="absolute top-4 right-4 h-auto p-2 rounded-full" onClick={onClose}><CloseIcon size={20}/></Button>
                <h2 className="text-2xl font-bold mb-6">{address ? 'Edit Address' : 'Add New Address'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="street" value={formData.street} onChange={handleChange} placeholder="Street" className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                    <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                    <input name="state" value={formData.state} onChange={handleChange} placeholder="State / Province" className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                    <input name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal Code" className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                    <input name="country" value={formData.country} onChange={handleChange} placeholder="Country" className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Save Address'}</Button>
                    </div>
                </form>
            </div>
        </Dialog>
    );
};

export default AddressFormModal;
