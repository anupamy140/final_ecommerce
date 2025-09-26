
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Sheet from './ui/Sheet';
import Button from './ui/Button';
import {ImageWithLoader} from './shared/ImageWithLoader';
import {  Heart } from 'lucide-react';
import { X as CloseIcon } from 'lucide-react';
import type { Product } from '../types';

const WishlistSheet = () => {
    const { wishlistOpen, setWishlistOpen, wishlist, addToCart, toggleWishlist, formatPrice } = useApp();
    const navigate = useNavigate();

    const handleMoveToCart = (product: Product) => {
        addToCart(product);
        toggleWishlist(product);
    };

    const handleDiscover = () => {
        setWishlistOpen(false);
        navigate('/');
    }

    return (
        <Sheet isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)}>
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
                <h3 className="text-xl font-bold dark:text-white">Your Wishlist</h3>
                <Button variant="ghost" className="h-auto p-2 rounded-full" onClick={() => setWishlistOpen(false)}><CloseIcon size={20}/></Button>
            </div>
            {wishlist.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <Heart size={48} className="text-gray-300 dark:text-gray-600 mb-4"/>
                    <h4 className="font-semibold text-lg dark:text-white">Your wishlist is empty</h4>
                    <p className="text-gray-500 dark:text-gray-400">Add your favorite items to see them here.</p>
                    <Button onClick={handleDiscover} variant="outline" className="mt-4">Discover Products</Button>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {wishlist.map((product: Product) => (
                        <div key={product.id} className="flex items-start gap-4">
                            <ImageWithLoader src={product.thumbnail} alt={product.title} className="w-20 h-20 rounded-lg shrink-0"/>
                            <div className="flex-1">
                                <h4 className="font-semibold dark:text-white">{product.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{formatPrice(product.price)}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <button onClick={() => handleMoveToCart(product)} className="text-sm text-blue-500 hover:underline">Move to Cart</button>
                                    <button onClick={() => toggleWishlist(product)} className="text-sm text-red-500 hover:underline">Remove</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Sheet>
    );
};

export default WishlistSheet;