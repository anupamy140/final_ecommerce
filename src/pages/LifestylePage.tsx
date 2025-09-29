import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ProductCard } from '../components/shared/ProductCard';
import ProductCardSkeleton from '../components/shared/ProductCardSkeleton';
import Pagination from '../components/shared/Pagination';
import type { Product } from '../types';
import { SearchX } from 'lucide-react';
import QuickViewModal from '../components/shared/QuickViewModal';

const API_BASE = import.meta.env.VITE_API_BASE;
const LIFESTYLE_CATEGORIES = ["furniture", "home-decoration", "lighting", "laptops"];

const LifestylePage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [quickViewProductId, setQuickViewProductId] = useState<number | null>(null);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const promises = LIFESTYLE_CATEGORIES.map(category => {
                const q = new URLSearchParams({ page: String(page), limit: String(4), category });
                return fetch(`${API_BASE}/products?${q.toString()}`).then(res => res.json());
            });
            const results = await Promise.all(promises);
            const allProducts = results.flatMap(result => result.products || []);
            setProducts(allProducts);
            setPages(1); 
        } catch (e: any) {
            toast.error(e.message || "Could not load lifestyle products.");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    return (
        <div className="py-12 max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8 dark:text-white">Lifestyle</h1>
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                <AnimatePresence>
                    {loading ? (
                        Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
                    ) : products.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-16 bg-white dark:bg-gray-900 rounded-lg mt-8 border dark:border-gray-800 flex flex-col items-center">
                            <SearchX size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
                            <h3 className="text-xl font-semibold">No Products Found</h3>
                        </motion.div>
                    ) : (
                        products.map(p => (
                            <motion.div layout key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                <ProductCard product={p} onQuickView={setQuickViewProductId} />
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </motion.div>
            {!loading && pages > 1 && <Pagination page={page} pages={pages} onPageChange={setPage} />}

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

export default LifestylePage;