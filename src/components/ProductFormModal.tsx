import React, { useState, useEffect } from 'react';
import Dialog from './ui/Dialog';
import Button from './ui/Button';
import { Loader2, Trash2 } from 'lucide-react';
import type { Product } from '../types';
import { X as CloseIcon } from 'lucide-react';
import { Minus, Plus } from 'lucide-react';


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
    
    const handleNumericChange = (field: 'price' | 'stock', amount: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: Math.max(0, (prev[field] || 0) + amount)
        }));
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
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        {!product && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Product Title</label>
                                        <input name="title" value={formData.title || ''} onChange={handleChange} placeholder="e.g. Modern Sofa" required className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2.5" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Brand</label>
                                        <input name="brand" value={formData.brand || ''} onChange={handleChange} placeholder="e.g. Acme Furniture" required className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2.5" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Description</label>
                                    <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="A short description of the product..." required className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2.5 min-h-[120px]" />
                                </div>
                            </>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                               <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Price</label>
                               <div className="flex items-center border dark:border-gray-700 rounded-lg">
                                    <button type="button" onClick={() => handleNumericChange('price', -10)} className="px-3 py-2.5 text-gray-600 dark:text-gray-300"><Minus size={16} /></button>
                                    <input name="price" type="number" step="0.01" value={formData.price || 0} onChange={handleChange} required className="w-full bg-transparent text-center font-semibold outline-none" />
                                    <button type="button" onClick={() => handleNumericChange('price', 10)} className="px-3 py-2.5 text-gray-600 dark:text-gray-300"><Plus size={16} /></button>
                               </div>
                            </div>
                             <div>
                               <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Stock</label>
                               <div className="flex items-center border dark:border-gray-700 rounded-lg">
                                    <button type="button" onClick={() => handleNumericChange('stock', -1)} className="px-3 py-2.5 text-gray-600 dark:text-gray-300"><Minus size={16} /></button>
                                    <input name="stock" type="number" value={formData.stock || 0} onChange={handleChange} required className="w-full bg-transparent text-center font-semibold outline-none" />
                                    <button type="button" onClick={() => handleNumericChange('stock', 1)} className="px-3 py-2.5 text-gray-600 dark:text-gray-300"><Plus size={16} /></button>
                               </div>
                            </div>
                            {!product && (
                                <>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Category</label>
                                    <input name="category" value={formData.category || ''} onChange={handleChange} placeholder="e.g. furniture" required className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2.5" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">SKU</label>
                                    <input name="sku" value={formData.sku || ''} onChange={handleChange} placeholder="e.g. ACME-123" required className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2.5" />
                                </div>
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