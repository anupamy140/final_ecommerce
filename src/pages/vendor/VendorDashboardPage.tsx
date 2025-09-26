import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import vendorApi from '../../api/vendorApi';
import type { Product } from '../../types';
import Button from '../../components/ui/Button';
import ProductFormModal from '../../components/ProductFormModal';
import { ImageWithLoader } from '../../components/shared/ImageWithLoader';
import { Edit, Trash2, Loader2, PlusCircle, Package, DollarSign, Star } from 'lucide-react';

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

    const totalProducts = products.length;
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
    const averagePrice = totalProducts > 0 ? products.reduce((acc, p) => acc + p.price, 0) / totalProducts : 0;


    if (loading) {
        return <div className="p-10 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-500" /></div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <Button onClick={openAddModal}><PlusCircle size={20} className="mr-2"/>Add Product</Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full"><Package className="h-6 w-6 text-blue-600 dark:text-blue-300"/></div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProducts}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full"><DollarSign className="h-6 w-6 text-green-600 dark:text-green-300"/></div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Average Price</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(averagePrice)}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                     <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-full"><Star className="h-6 w-6 text-yellow-600 dark:text-yellow-300"/></div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Stock</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalStock}</p>
                    </div>
                </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Products</h2>
            
            {products.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-lg mt-8 border dark:border-gray-800">
                    <h3 className="text-xl font-semibold">No Products Found</h3>
                    <p className="text-gray-500 mt-2">Click "Add Product" to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(p => (
                        <div key={p.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                            <div className="relative aspect-[4/5] mb-4 overflow-hidden rounded-xl">
                                <ImageWithLoader
                                    src={p.thumbnail}
                                    alt={p.title}
                                    className="w-full h-full rounded-xl"
                                />
                            </div>
                            <div className="flex-1 mb-4">
                                <h3 className="font-semibold text-base truncate" title={p.title}>{p.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{p.category}</p>
                            </div>
                            <div className="flex items-center justify-between text-sm mb-4">
                                <span className="text-gray-500 dark:text-gray-400">Price: <span className="font-bold text-gray-800 dark:text-gray-200">{formatPrice(p.price)}</span></span>
                                <span className="text-gray-500 dark:text-gray-400">Stock: <span className="font-bold text-gray-800 dark:text-gray-200">{p.stock}</span></span>
                            </div>
                             <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => openEditModal(p)}><Edit size={16} className="mr-2"/>Edit</Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(p.id)}><Trash2 size={16} className="mr-2"/>Delete</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <ProductFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveProduct} product={editingProduct} />
        </div>
    );
};

export default VendorDashboardPage;