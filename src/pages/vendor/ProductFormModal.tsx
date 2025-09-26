import React, { useState, useEffect } from 'react';
import Dialog from '../../components/ui/Dialog';
import Button from '../../components/ui/Button';
import { Loader2, Trash2 } from 'lucide-react';
import type { Product } from '../../types';
import { X as CloseIcon } from 'lucide-react';

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Product>) => void;
    product: Product | null;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSave, product }) => {
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFormData(product ? { ...product } : {
            title: '', description: '', category: '', price: 0, stock: 0, sku: '', brand: '',
            images: [''], thumbnail: ''
        });
    }, [product, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumericField = ['price', 'stock'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumericField ? Number(value) : value }));
    };

    const handleImageChange = (index: number, value: string) => {
        const images = [...(formData.images || [])];
        images[index] = value;
        setFormData(prev => ({ ...prev, images }));
    };

    const addImageField = () => {
        setFormData(prev => ({...prev, images: [...(prev.images || []), '']}));
    };

    const removeImageField = (index: number) => {
        const images = [...(formData.images || [])];
        if (images.length > 1) {
            images.splice(index, 1);
            setFormData(prev => ({...prev, images}));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const submissionData = { ...formData, thumbnail: formData.images?.[0] || '' };
        await onSave(submissionData);
        setLoading(false);
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} className="w-full max-w-3xl">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full">
                <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <Button variant="ghost" className="h-auto p-2 rounded-full" onClick={onClose}><CloseIcon size={20}/></Button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        {!product && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input name="title" value={formData.title || ''} onChange={handleChange} placeholder="Product Title" required className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" />
                                    <input name="brand" value={formData.brand || ''} onChange={handleChange} placeholder="Brand" required className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" />
                                </div>
                                <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="Description" required className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2 min-h-[100px]" />
                            </>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <input name="price" type="number" step="0.01" value={formData.price || 0} onChange={handleChange} placeholder="Price" required className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" />
                            <input name="stock" type="number" value={formData.stock || 0} onChange={handleChange} placeholder="Stock" required className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" />
                            {!product && (
                                <>
                                <input name="category" value={formData.category || ''} onChange={handleChange} placeholder="Category" required className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" />
                                <input name="sku" value={formData.sku || ''} onChange={handleChange} placeholder="SKU" required className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" />
                                </>
                            )}
                        </div>
                        {!product && (
                             <div>
                                <h4 className="text-sm font-semibold mb-2">Image URLs</h4>
                                {(formData.images || []).map((img, i) => (
                                    <div key={i} className="flex items-center gap-2 mb-2">
                                        <input value={img} onChange={(e) => handleImageChange(i, e.target.value)} placeholder={`Image URL ${i+1}`} required className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" />
                                        {(formData.images?.length || 0) > 1 && <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => removeImageField(i)}><Trash2 size={16}/></Button>}
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={addImageField}>Add another image</Button>
                            </div>
                        )}
                    </div>
                    <div className="p-6 border-t dark:border-gray-800 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : 'Save Product'}</Button>
                    </div>
                </form>
            </div>
        </Dialog>
    );
}

export default ProductFormModal;