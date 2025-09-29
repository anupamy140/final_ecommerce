import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ProductCard } from '../components/shared/ProductCard';
import ProductCardSkeleton from '../components/shared/ProductCardSkeleton';
import Pagination from '../components/shared/Pagination';
import type { Product } from '../types';
import { SearchX } from 'lucide-react';
import QuickViewModal from '../components/shared/QuickViewModal'; // --- 1. IMPORT the modal ---

const API_BASE = import.meta.env.VITE_API_BASE;

const CataloguePage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    // --- 2. ADD STATE for the modal ---
    const [quickViewProductId, setQuickViewProductId] = useState<number | null>(null);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const q = new URLSearchParams({ page: String(page), limit: String(12) });
            const url = `${API_BASE}/products?${q.toString()}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();
            setProducts(data.products || []);
            setPages(data.pages || 1);
        } catch (e: any) {
            toast.error(e.message || "Could not load products.");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    return (
        <div className="py-12 max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8 dark:text-white">Catalogue</h1>
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
                                {/* --- 3. PASS THE PROP to ProductCard --- */}
                                <ProductCard product={p} onQuickView={setQuickViewProductId} />
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </motion.div>
            {!loading && pages > 1 && <Pagination page={page} pages={pages} onPageChange={setPage} />}

            {/* --- 4. RENDER THE MODAL conditionally --- */}
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

export default CataloguePage;