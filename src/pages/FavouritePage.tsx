import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { ProductCard } from '../components/shared/ProductCard';
import type { Product } from '../types';
import { Heart } from 'lucide-react';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import QuickViewModal from '../components/shared/QuickViewModal';

const FavouritePage: React.FC = () => {
    const { wishlist } = useApp();
    const [quickViewProductId, setQuickViewProductId] = useState<number | null>(null);

    return (
        <div className="py-12 max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8 dark:text-white">Favourites</h1>
            {wishlist.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-lg mt-8 border dark:border-gray-800 flex flex-col items-center">
                    <Heart size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold">Your Wishlist is Empty</h3>
                    <p className="text-gray-500 mt-2">Explore our products and add your favorites!</p>
                    <Link to="/">
                        <Button variant="outline" className="mt-6">
                            Discover Products
                        </Button>
                    </Link>
                </div>
            ) : (
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                    {wishlist.map((p: Product) => (
                        <motion.div layout key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            <ProductCard product={p} onQuickView={setQuickViewProductId} />
                        </motion.div>
                    ))}
                </motion.div>
            )}
             {quickViewProductId && (
                <QuickViewModal
                    productId={quickViewProductId}
                    isOpen={!!quickViewProductId}
                    onClose={() => setQuickViewProductId(null)}
                />
            )}
        </div>
    );
};

export default FavouritePage;