import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../hooks/useTheme";
import { api } from "../lib/api";
import type { CartItem, Product } from "../lib/types";
import { Header } from "../components/shared/Header";
import { Footer } from "../components/shared/Footer";
import { AuthDialog } from "../components/auth/AuthDialog";
import { CartSheet } from "../components/cart/CartSheet";
import { WishlistSheet } from "../components/wishlist/WishlistSheet";

// Define a type for the context value for better TypeScript support
interface AppContextType {
    theme: string;
    setTheme: (theme: string) => void;
    user: string | null;
    cart: CartItem[];
    wishlist: Product[];
    authModalOpen: boolean;
    setAuthModalOpen: (isOpen: boolean) => void;
    cartOpen: boolean;
    setCartOpen: (isOpen: boolean) => void;
    wishlistOpen: boolean;
    setWishlistOpen: (isOpen: boolean) => void;
    isLoggedIn: boolean;
    formatPrice: (price?: number) => string;
    fetchCart: () => Promise<void>;
    fetchWishlist: () => Promise<void>;
    addToCart: (product: Product, quantity?: number) => Promise<void>;
    changeQty: (product_id: number, qty: number) => Promise<void>;
    removeFromCart: (product_id: number) => Promise<void>;
    checkout: () => Promise<void>;
    toggleWishlist: (product: Product) => Promise<void>;
    handleAuth: (mode: 'login' | 'register', email: string, username: string, password: string, extraData?: any) => Promise<void>;
}

// 1. Create the context
const AppContext = createContext<AppContextType | null>(null);

// 2. Create a custom hook for easy consumption
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
};

// 3. Create the Provider component (which is also your main Layout)
export const Layout = () => {
    const [theme, setTheme] = useTheme();
    const [user, setUser] = useState<string | null>(localStorage.getItem("user"));
    const [cart, setCart] = useState<CartItem[]>([]);
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [wishlistOpen, setWishlistOpen] = useState(false);
    
    const API_BASE = import.meta.env.VITE_API_BASE;
    const isLoggedIn = !!localStorage.getItem("accessToken");
    const formatPrice = useCallback((p?: number) => `$${(p || 0).toFixed(2)}`, []);

    const fetchCart = useCallback(async () => {
        if (!isLoggedIn) { setCart([]); return; }
        try {
            const res = await api.get('/cart');
            if (!res.ok) throw new Error("Could not get cart");
            const data = await res.json();
            if (!data.items || data.items.length === 0) {
                setCart([]);
                return;
            }
            // Fetch full product details for cart items
            const productDetails = await Promise.all(
                data.items.map(async (item: { product_id: number }) => {
                    try {
                        const productRes = await fetch(`${API_BASE}/products/${item.product_id}`);
                        if(!productRes.ok) return null;
                        const productData = await productRes.json();
                        return { ...item, title: productData.title, price: productData.price, image: productData.thumbnail };
                    } catch { return null; }
                })
            );
            setCart(productDetails.filter(Boolean));
        } catch (e) { toast.error("Could not sync your cart."); }
    }, [isLoggedIn, API_BASE]);

    const fetchWishlist = useCallback(async () => {
        if (!isLoggedIn) { setWishlist([]); return; }
        try {
            const res = await api.get('/wishlist');
            if (!res.ok) throw new Error("Could not get wishlist");
            const data = await res.json();
            setWishlist(data.items || []);
        } catch (e) { toast.error("Could not sync your wishlist."); }
    }, [isLoggedIn]);

    useEffect(() => {
        const handleAuthChange = () => { 
            setUser(localStorage.getItem("user")); 
            fetchCart(); 
            fetchWishlist(); 
        };
        window.addEventListener("authChange", handleAuthChange);
        // Initial fetch on load
        if (isLoggedIn) {
            handleAuthChange();
        }
        return () => window.removeEventListener("authChange", handleAuthChange);
    }, [isLoggedIn, fetchCart, fetchWishlist]);

    const addToCart = async (product: Product, quantity = 1) => {
        if (product.stock <= 0) { toast.error("Out of stock"); return; }
        if (!isLoggedIn) { setAuthModalOpen(true); return; }
        try {
            const res = await api.post('/cart/add', { product_id: product.id, quantity });
            if(!res.ok) throw new Error((await res.json()).detail || "Failed to add item");
            await fetchCart();
            toast.success(`${product.title} added to cart!`);
            setCartOpen(true);
        } catch (error: any) { toast.error(error.message); }
    };

    const changeQty = async (product_id: number, qty: number) => {
        if (qty < 1) return;
        try {
            const res = await api.post('/cart/update_quantity', { product_id, quantity: qty });
            if (!res.ok) throw new Error((await res.json()).detail || "Failed to update quantity");
            await fetchCart();
        } catch (error: any) { toast.error(error.message); }
    };

    const removeFromCart = async (product_id: number) => {
        try {
            const res = await api.post('/cart/remove', { product_id });
            if (!res.ok) throw new Error((await res.json()).detail || "Failed to remove item");
            await fetchCart();
            toast.info("Item removed from cart.");
        } catch (error: any) { toast.error(error.message); }
    };

    const checkout = async () => {
        if (!cart.length) { toast.warning("Cart is empty"); return; }
        try {
            const checkoutData = {
                success_url: `${window.location.origin}/#/success`,
                cancel_url: `${window.location.origin}/#/cancel`,
            };
            const res = await api.post('/cart/checkout', checkoutData);
            if (!res.ok) throw new Error((await res.json()).detail || "Checkout failed");
            const body = await res.json();
            if (body.url) { window.location.href = body.url; }
            else { toast.success(`Order placed! Total: ${formatPrice(body.total)}`); fetchCart(); setCartOpen(false); }
        } catch (e: any) { toast.error(e.message); }
    };

    const toggleWishlist = async (product: Product) => {
        if(!isLoggedIn) { setAuthModalOpen(true); return; }
        const isInWishlist = wishlist.some(item => item.id === product.id);
        try {
            const res = await api.post(isInWishlist ? '/wishlist/remove' : '/wishlist/add', { product_id: product.id });
            if (!res.ok) throw new Error((await res.json()).detail || "Failed to update wishlist");
            await fetchWishlist();
            toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist!");
        } catch(error: any) { toast.error(error.message); }
    };

    const handleAuth = async (mode: 'login' | 'register', email: string, username: string, password: string, extraData?: any) => {
        try {
            const url = `${API_BASE}/users/${mode}`;
            let body;
            if (mode === "login") {
                body = { email, password };
            } else {
                body = {
                    email, username, password,
                    DOB: extraData.dob,
                    address: {
                        street: extraData.street,
                        city: extraData.city,
                        state: extraData.state,
                        postalCode: extraData.postalCode,
                        country: extraData.country,
                    }
                };
            }

            const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error((await res.json()).detail || "Authentication failed");
            
            const data = await res.json();
            if (mode === "login") {
                localStorage.setItem("accessToken", data.access_token);
                localStorage.setItem("refreshToken", data.refresh_token);
                localStorage.setItem("user", data.username || email);
                window.dispatchEvent(new Event("authChange")); // Triggers useEffect to refetch data
                toast.success("Login successful!");
                setAuthModalOpen(false);
            } else {
                toast.info("Registered successfully! Please login to continue.");
            }
        } catch (e: any) { toast.error(e.message); }
    };

    // The value provided to all consuming components
    const contextValue: AppContextType = {
        theme, setTheme, user, cart, wishlist,
        authModalOpen, setAuthModalOpen,
        cartOpen, setCartOpen,
        wishlistOpen, setWishlistOpen,
        isLoggedIn, formatPrice,
        fetchCart, fetchWishlist, addToCart, changeQty, removeFromCart,
        checkout, toggleWishlist, handleAuth
    };

    return (
        <AppContext.Provider value={contextValue}>
            <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-950 dark:text-gray-200 font-sans transition-colors duration-300">
                <Header />
                <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Outlet />
                </main>
                <Footer />
                <AuthDialog />
                <CartSheet />
                <WishlistSheet />
            </div>
        </AppContext.Provider>
    );
};