import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Minus, Plus, ShoppingCart, X as CloseIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import type { Product } from '../../types/index';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import { ImageWithLoader } from './ImageWithLoader';
import { optimizeImage } from '../../lib/image';

const API_BASE = import.meta.env.VITE_API_BASE;

interface QuickViewModalProps {
    productId: number;
    isOpen: boolean;
    onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ productId, isOpen, onClose }) => {
    const { formatPrice, addToCart } = useApp();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen) return;
        
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/products/${productId}`);
                if (!res.ok) throw new Error("Product not found");
                setProduct(await res.json());
            } catch (error) {
                toast.error("Could not load product details.");
                onClose();
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId, isOpen, onClose]);

    const handleViewFullDetails = () => {
        onClose();
        navigate(`/product/${product!.id}`);
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 w-full max-w-4xl relative shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8">
                <Button variant="ghost" className="absolute top-4 right-4 h-auto p-2 rounded-full z-10" onClick={onClose}><CloseIcon size={20}/></Button>
                
                {loading || !product ? (
                    <div className="col-span-full h-96 flex items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="aspect-square">
                           <ImageWithLoader src={optimizeImage(product.images?.[0] || product.thumbnail, 800, 800)} alt={product.title} className="rounded-xl"/>
                        </div>
                        <div className="py-4 flex flex-col">
                            <h2 className="text-3xl font-bold dark:text-white">{product.title}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-md mt-1">{product.brand}</p>
                            
                            <p className="text-md text-gray-700 dark:text-gray-300 my-4 flex-1">{product.description.substring(0, 150)}...</p>

                            <div className="text-4xl font-bold my-4 dark:text-white">{formatPrice(product.price)}</div>
                            
                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex items-center border dark:border-gray-700 rounded-lg"><button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2"><Minus size={16} /></button><span className="px-4 py-2 font-semibold">{quantity}</span><button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2"><Plus size={16} /></button></div>
                                <Button onClick={() => addToCart(product, quantity)} className="flex-1 h-12" size="lg" disabled={product.stock === 0}>
                                    <ShoppingCart size={20} className="mr-2"/>
                                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </Button>
                            </div>
                             <Button variant="outline" onClick={handleViewFullDetails} className="w-full mt-4">View Full Details</Button>
                        </div>
                    </>
                )}
            </div>
        </Dialog>
    );
};

export default QuickViewModal;