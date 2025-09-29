import { Link } from "react-router-dom";
import { Star, Heart, Eye } from "lucide-react"; // Import Eye icon
import type { Product } from "../../types/index";
import { useApp } from "../../contexts/AppContext";
import { ImageWithLoader } from "./ImageWithLoader";
import Button  from "../ui/Button";
import { optimizeImage } from "../../lib/image";

// Add onQuickView prop to the component
export const ProductCard = ({ product, onQuickView }: { product: Product; onQuickView: (id: number) => void; }) => {
    const { formatPrice, addToCart, toggleWishlist, wishlist } = useApp();
    const isInWishlist = wishlist.some((item: Product) => item.id === product.id);

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
            <div className="relative aspect-[4/5] mb-4 overflow-hidden rounded-xl">
                <Link to={`/product/${product.id}`}>
                    <ImageWithLoader
                        src={optimizeImage(product.images[0], 400, 500)}
                        alt={product.title}
                        className="w-full h-full rounded-xl transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                    />
                </Link>
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                     <button 
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }} 
                        className="bg-white/70 dark:bg-gray-950/70 backdrop-blur-sm p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
                        aria-label="Toggle Wishlist"
                    >
                        <Heart className={`h-5 w-5 ${isInWishlist ? 'text-red-500 fill-current' : ''}`} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onQuickView(product.id); }} 
                        className="bg-white/70 dark:bg-gray-950/70 backdrop-blur-sm p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Quick View"
                    >
                        <Eye className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <div className="flex-1 mb-4">
                <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-base truncate hover:underline" title={product.title}>{product.title}</h3>
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{product.category}</p>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <div className="text-lg font-bold">{formatPrice(product.price)}</div>
                    <div className="text-xs text-yellow-600 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {product.rating.toFixed(1)}
                    </div>
                </div>
                <Button onClick={() => addToCart(product)} className="h-10 px-4">Add</Button>
            </div>
        </div>
    );
}

export const ProductCardSkeleton = () => (
    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-4 animate-pulse">
        <div className="aspect-[4/5] mb-4 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3"></div>
        </div>
    </div>
);