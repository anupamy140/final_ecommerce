import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import vendorApi from '../../api/vendorApi';
import type { Product } from '../../types';
import Button from '../../components/ui/Button';
import ProductFormModal from '../../components/ProductFormModal';
import {ImageWithLoader} from '../../components/shared/ImageWithLoader';
import { Edit, Trash2, Loader2 } from 'lucide-react';

const VendorDashboardPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const { formatPrice } = useApp();

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await vendorApi.get('/vendors/products');
            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();
            setProducts(data);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSaveProduct = async (productData: Partial<Product>) => {
        try {
            const isEditing = !!editingProduct;
            const endpoint = isEditing ? `/vendors/products/${editingProduct!.id}` : '/vendors/products';
            const method = isEditing ? 'PUT' : 'POST';
            
            const body = isEditing ? { price: productData.price, stock: productData.stock } : productData;
            
            const res = await vendorApi.request(method, endpoint, body);

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Failed to save product');
            }
            toast.success(`Product ${isEditing ? 'updated' : 'created'} successfully!`);
            setIsModalOpen(false);
            fetchProducts();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDeleteProduct = async (productId: number) => {
        if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            try {
                const res = await vendorApi.delete(`/vendors/products/${productId}`);
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.detail || 'Failed to delete product');
                }
                toast.success('Product deleted successfully.');
                fetchProducts();
            } catch (error: any) {
                toast.error(error.message);
            }
        }
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    if (loading) {
        return <div className="p-10 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-500" /></div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Products</h1>
                <Button onClick={openAddModal}>Add Product</Button>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                {products.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 dark:text-gray-400">You haven't added any products yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Product</th>
                                    <th className="px-6 py-3">Stock</th>
                                    <th className="px-6 py-3">Price</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                                            <ImageWithLoader src={p.thumbnail} alt={p.title} className="w-12 h-12 rounded-md shrink-0" />
                                            <span>{p.title}</span>
                                        </td>
                                        <td className="px-6 py-4">{p.stock}</td>
                                        <td className="px-6 py-4">{formatPrice(p.price)}</td>
                                        <td className="px-6 py-4 capitalize">{p.category}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Button variant="ghost" size="sm" onClick={() => openEditModal(p)}><Edit size={16}/></Button>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteProduct(p.id)}><Trash2 size={16}/></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <ProductFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveProduct} product={editingProduct} />
        </div>
    );
};

export default VendorDashboardPage;