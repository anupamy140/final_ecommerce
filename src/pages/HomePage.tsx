import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useDebounce } from '../hooks/useDebounce';
import { Slider } from '../components/home/Slider';
import { CategoryCarousel } from '../components/home/CategoryCarousel';
import { ProductFilters } from '../components/home/ProductFilters';
import { ProductCard } from '../components/shared/ProductCard';
import ProductCardSkeleton from '../components/shared/ProductCardSkeleton';
import Pagination from '../components/shared/Pagination';
import BrandLogos from '../components/home/BrandLogos';
import type { Product } from '../types';
import { SearchX } from 'lucide-react';
import Button from '../components/ui/Button';
 
const API_BASE = import.meta.env.VITE_API_BASE;
 
const HomePage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [sort, setSort] = useState("id");
    const [search, setSearch] = useState("");
    const [searchSource, setSearchSource] = useState<'text' | 'voice'>('text');
    const debouncedSearch = useDebounce(search, 500);
    const recognitionRef = useRef<any>(null);
    const [micSupported, setMicSupported] = useState(false);
    const [listening, setListening] = useState(false);
 
    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            let url: string;
            if (debouncedSearch) {
                if (searchSource === 'voice') {
                    url = `${API_BASE}/products/search?search_str=${encodeURIComponent(debouncedSearch)}&page=${page}&limit=12`;
                } else {
                    url = `${API_BASE}/products/normal-search?search_str=${encodeURIComponent(debouncedSearch)}&page=${page}&limit=12`;
                }
            } else {
                const q = new URLSearchParams({ page: String(page), limit: String(12), sort });
                if (selectedCategory) q.set("category", selectedCategory);
                url = `${API_BASE}/products?${q.toString()}`;
            }
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
    }, [page, selectedCategory, sort, debouncedSearch, searchSource]);
 
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_BASE}/categories`);
                if (!res.ok) throw new Error("Could not fetch categories.");
                const data = await res.json();
                setCategories(data.categories || []);
            } catch (e: any) {
                console.warn(e.message);
            }
        };
        fetchCategories();
    }, []);
 
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);
 
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, selectedCategory, sort]);
 
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            return;
        }
        const rec = new SpeechRecognition();
        rec.lang = "en-US";
        rec.continuous = false;
        rec.onstart = () => {
            setListening(true);
            setSearchSource('voice'); // <-- setSearchSource IS USED HERE
        }
        rec.onend = () => setListening(false);
        rec.onerror = (e: any) => console.error("Speech recognition error:", e.error);
        rec.onresult = (e: any) => {
            const text = Array.from(e.results).map((r: any) => r[0]?.transcript ?? "").join(" ").trim();
            if (text) setSearch(text);
        };
        recognitionRef.current = rec;
        setMicSupported(true);
 
        return () => {
            try {
                rec.abort();
            } catch (e) {
                console.error("Could not abort speech recognition:", e);
            }
        };
    }, []);
 
    const toggleMic = () => {
        if (!recognitionRef.current) return;
        if (listening) {
            recognitionRef.current.stop();
        } else {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Could not start speech recognition:", e);
            }
        }
    };
 
    const handleCategorySelect = (category: string) => {
        setSelectedCategory(cat => (cat === category ? "" : category));
        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
    };
 
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setSearchSource('text'); // <-- setSearchSource IS USED HERE
    }
   
    const clearFilters = () => {
        setSearch("");
        setSelectedCategory("");
        setSort("id");
    };
 
    return (
        <>
            <Slider />
            <CategoryCarousel categories={categories} onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />
            <div id="products-section" className="py-12 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">Our Products</h2>
                <ProductFilters
                    search={search}
                    setSearch={handleSearchChange}
                    toggleMic={toggleMic}
                    listening={listening}
                    micSupported={micSupported}
                    sort={sort}
                    setSort={setSort}
                />
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                    <AnimatePresence>
                        {loading ? (
                            Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
                        ) : products.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-16 bg-white dark:bg-gray-900 rounded-lg mt-8 border dark:border-gray-800 flex flex-col items-center">
                                <SearchX size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
                                <h3 className="text-xl font-semibold">No Products Found</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                                <Button onClick={clearFilters} variant="outline" className="mt-6">
                                    Clear Filters
                                </Button>
                            </motion.div>
                        ) : (
                            products.map(p => (
                                <motion.div layout key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                    <ProductCard product={p} />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </motion.div>
                {!loading && pages > 1 && <Pagination page={page} pages={pages} onPageChange={setPage} />}
            </div>
            <BrandLogos />
        </>
    );
};
 
export default HomePage;
 