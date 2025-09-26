import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Star, Minus, Plus } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import type { Product } from '../types';
import Button from '../components/ui/Button';
import ImageZoom from '../components/shared/ImageZoom';
import ImageWithLoader from '../components/shared/ImageWithLoader';

const API_BASE = import.meta.env.VITE_API_BASE;

const ProductDetailPage = () => {
    const { productId } = useParams<{ productId: string }>();
    const { formatPrice, addToCart } = useApp();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [related, setRelated] = useState<Product[]>([]);
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            window.scrollTo(0, 0);
            try {
                const res = await fetch(`${API_BASE}/products/${productId}`);
                if (!res.ok) throw new Error("Product not found");
                const data = await res.json();
                setProduct(data);
            } catch (error) {
                toast.error("Could not load product.");
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    useEffect(() => {
        if (product) {
            const fetchRelated = async () => {
                try {
                    const res = await fetch(`${API_BASE}/products?category=${product.category}&limit=5`);
                    let data = await res.json();
                    setRelated(data.products.filter((p: Product) => p.id !== product.id).slice(0, 4));
                } catch {
                    setRelated([]);
                }
            };
            fetchRelated();
        }
    }, [product]);

    if (loading) return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="w-12 h-12 animate-spin" /></div>;
    if (!product) return <div className="text-center py-20"><h2 className="text-2xl font-bold">Product not found</h2><Button onClick={() => navigate('/')} className="mt-4">Go Home</Button></div>;

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <ImageZoom src={product.images?.[0] || product.thumbnail} alt={product.title} />
                <div>
                    <span className="text-sm bg-yellow-100 text-yellow-800 font-medium px-2 py-1 rounded capitalize">{product.category.replace(/-/g, ' ')}</span>
                    <h1 className="text-4xl font-bold mt-2 dark:text-white">{product.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-md mt-1">{product.brand}</p>
                    <div className="flex items-center gap-2 mt-4">
                        <div className="flex items-center gap-1 text-yellow-500">{[...Array(5)].map((_, i) => <Star key={i} size={20} className={i < Math.round(product.rating) ? "fill-current" : "text-gray-300"} />)}</div>
                        <span className="text-gray-600 dark:text-gray-300 font-semibold">{product.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-md text-gray-700 dark:text-gray-300 my-6">{product.description}</p>
                    <div className="text-4xl font-bold my-8 dark:text-white">{formatPrice(product.price)}</div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border dark:border-gray-700 rounded-lg">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 dark:text-gray-300"><Minus size={16}/></button>
                            <span className="px-4 py-2 font-semibold">{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-gray-600 dark:text-gray-300"><Plus size={16}/></button>
                        </div>
                        <Button onClick={() => addToCart(product, quantity)} className="flex-1 h-12" size="lg">Add to Cart</Button>
                    </div>
                </div>
            </div>
            {related.length > 0 && (
                <div className="p-6 mt-12 border-t dark:border-gray-800">
                    <h3 className="font-bold text-2xl mb-6">You Might Also Like</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {related.map(p => (
                            <Link to={`/product/${p.id}`} key={p.id} className="cursor-pointer group">
                                <ImageWithLoader src={p.thumbnail} alt={p.title} className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-800"/>
                                <h4 className="text-md font-semibold mt-2 truncate group-hover:underline">{p.title}</h4>
                                <p className="text-md font-bold">{formatPrice(p.price)}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;
