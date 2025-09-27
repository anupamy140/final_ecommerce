import React, { useState, useCallback, useEffect, createContext, useContext } from "react";
import { toast } from 'sonner';
import api from '../api/userApi';
import vendorApi from '../api/vendorApi';
import { useTheme } from '../hooks/useTheme';
import type { Product, CartItem, Address, Vendor } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE;
const AppContext = createContext<any>(null);

// Add this global declaration once in your project, for example at the top of this file
declare global {
  interface Window {
    finalizedToasts: Set<number | string>;
  }
}

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useTheme();
    const [user, setUser] = useState<string | null>(null);
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [userAuthModalOpen, setUserAuthModalOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [wishlistOpen, setWishlistOpen] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(true); // Fixes the refresh issue

    const formatPrice = useCallback((p: number = 0) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(p);
    }, []);

    const fetchAddresses = useCallback(async () => {
        if (!localStorage.getItem("accessToken")) {
            setAddresses([]);
            setSelectedAddressId(null);
            return;
        }
        try {
            const res = await api.get('/users/addresses');
            if (!res.ok) throw new Error("Failed to fetch addresses");
            const data = await res.json();
            setAddresses(data);
            const defaultAddress = data.find((addr: Address) => addr.isDefault) || data[0];
            setSelectedAddressId(defaultAddress ? defaultAddress._id : null);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const fetchCart = useCallback(async () => {
        if (!localStorage.getItem("accessToken")) {
            setCart([]);
            return;
        }
        try {
            const res = await api.get('/cart');
            if (!res.ok) throw new Error("Failed to sync cart");
            const data = await res.json();
            if (!data.items || data.items.length === 0) {
                setCart([]);
                return;
            }
            const productDetails = await Promise.all(data.items.map(async (item: any) => {
                try {
                    const productRes = await fetch(`${API_BASE}/products/${item.product_id}`);
                    if (!productRes.ok) return null;
                    const productData = await productRes.json();
                    return { ...item, title: productData.title, price: productData.price, image: productData.thumbnail };
                } catch { return null; }
            }));
            setCart(productDetails.filter(Boolean));
        } catch (e) {
            console.error(e);
        }
    }, []);

    const fetchWishlist = useCallback(async () => {
        if (!localStorage.getItem("accessToken")) {
            setWishlist([]);
            return;
        }
        try {
            const res = await api.get('/wishlist');
            if (!res.ok) throw new Error("Failed to sync wishlist");
            const data = await res.json();
            setWishlist(data.items || []);
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            setAuthLoading(true);
            setUser(localStorage.getItem("user"));
            const storedVendor = localStorage.getItem("vendor");
            setVendor(storedVendor ? JSON.parse(storedVendor) : null);
            await Promise.all([fetchCart(), fetchWishlist(), fetchAddresses()]);
            setAuthLoading(false);
        };
        
        initAuth();

        const handleAuthChange = () => {
            setUser(localStorage.getItem("user"));
            fetchCart();
            fetchWishlist();
            fetchAddresses();
        };
        const handleVendorAuthChange = () => {
            const storedVendor = localStorage.getItem("vendor");
            setVendor(storedVendor ? JSON.parse(storedVendor) : null);
        };

        window.addEventListener("authChange", handleAuthChange);
        window.addEventListener("vendorAuthChange", handleVendorAuthChange);

        return () => {
            window.removeEventListener("authChange", handleAuthChange);
            window.removeEventListener("vendorAuthChange", handleVendorAuthChange);
        };
    }, [fetchCart, fetchWishlist, fetchAddresses]);

    const handleAuth = async (mode: 'login' | 'register', email: string, username: string, password: string, extraData?: any) => {
        try {
            const url = `/users/${mode}`;
            const body = mode === "login"
                ? { email, password }
                : { email, username, password, DOB: extraData.dob, address: { street: extraData.street, city: extraData.city, state: extraData.state, postalCode: extraData.postalCode, country: extraData.country } };
            const res = await fetch(`${API_BASE}${url}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const text = await res.text();
            const data = text ? JSON.parse(text) : {};
            if (!res.ok) throw new Error(data.detail || "Authentication failed");
            if (mode === "login") {
                localStorage.setItem("accessToken", data.access_token);
                localStorage.setItem("refreshToken", data.refresh_token);
                localStorage.setItem("user", data.username || email);
                window.dispatchEvent(new Event("authChange"));
                toast.success("Login successful!");
                setUserAuthModalOpen(false);
            } else {
                toast.info("Registered successfully! Please login to continue.");
            }
        } catch (e: any) {
            toast.error(e.message);
        }
    };
    
    const handleVendorAuth = async (mode: 'login' | 'register', { companyName, email, password }: any) => {
        try {
            const endpoint = `/vendors/${mode}`;
            const body = mode === 'login' ? { email, password } : { companyName, email, password };
            const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const text = await res.text();
            const data = text ? JSON.parse(text) : {};
            if (!res.ok) throw new Error(data.detail || 'Vendor authentication failed');
            if (mode === 'login') {
                if (!data.access_token) throw new Error("Login response from server did not include an access token.");
                localStorage.setItem("vendorAccessToken", data.access_token);
                if (data.refresh_token) localStorage.setItem("vendorRefreshToken", data.refresh_token);
                const vendorDetails = { companyName: data.companyName || companyName || 'Vendor', email, vendor_id: data.vendor_id || data.vendorId };
                localStorage.setItem("vendor", JSON.stringify(vendorDetails));
                window.dispatchEvent(new Event("vendorAuthChange"));
                toast.success("Vendor login successful!");
                return true;
            } else {
                toast.success("Vendor registered successfully! Please log in.");
                return true;
            }
        } catch (e: any) {
            toast.error(e.message);
            return false;
        }
    };

    const vendorLogout = () => {
        vendorApi.logout();
        window.location.hash = '/vendor/auth';
    };

    const addToCart = async (product: Product, quantity = 1) => {
        if (product.stock <= 0) { toast.error("Out of stock"); return; }
        if (!localStorage.getItem("accessToken")) { setUserAuthModalOpen(true); return; }
        
        const originalCart = [...cart];
        
        const existingItem = cart.find(item => item.product_id === product.id);
        if (existingItem) {
            setCart(cart.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + quantity } : item));
        } else {
            setCart([...cart, { product_id: product.id, title: product.title, price: product.price, image: product.thumbnail, quantity }]);
        }

        toast.success(`${product.title} added to cart!`, {
            action: {
                label: 'Undo',
                onClick: () => {
                    setCart(originalCart); 
                },
            },
            onAutoClose: (t) => finalizeAddToCart(t.id, product.id, quantity, originalCart),
            onDismiss: (t) => finalizeAddToCart(t.id, product.id, quantity, originalCart),
        });
    };

    const finalizeAddToCart = async (toastId: number | string, productId: number, quantity: number, originalCart: CartItem[]) => {
        if (window.finalizedToasts?.has(toastId)) return;
        window.finalizedToasts = window.finalizedToasts || new Set();
        window.finalizedToasts.add(toastId);

        try {
            const res = await api.post('/cart/add', { product_id: productId, quantity });
            if (!res.ok) {
                setCart(originalCart);
                throw new Error((await res.json()).detail || "Failed to add item");
            }
            await fetchCart();
            setCartOpen(true);
        } catch (error: any) {
            toast.error(error.message);
            setCart(originalCart);
        }
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
        if (!cart.length) {
            toast.warning("Cart is empty");
            return;
        }
        if (!selectedAddressId) {
            toast.error("Please select a shipping address.");
            return;
        }
        try {
            const res = await api.post('/cart/checkout', {
                addressId: selectedAddressId,
                currency: 'inr',
                success_url: 'https://brocode140.netlify.app/#/success',
                cancel_url: 'https://brocode140.netlify.app/#/cancel'
            });
            if (!res.ok) throw new Error((await res.json()).detail || "Checkout failed");
            const body = await res.json();
            if (body.url) {
                window.location.href = body.url;
            } else {
                toast.success(`Order placed! Total: ${formatPrice(body.total)}`);
                fetchCart();
                setCartOpen(false);
            }
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const toggleWishlist = async (product: Product) => {
        if(!localStorage.getItem("accessToken")) { setUserAuthModalOpen(true); return; }
        const isInWishlist = wishlist.some((item: Product) => item.id === product.id);
        try {
            const res = await api.post(isInWishlist ? '/wishlist/remove' : '/wishlist/add', { product_id: product.id });
            if (!res.ok) throw new Error((await res.json()).detail || "Failed to update wishlist");
            await fetchWishlist();
            toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist!");
        } catch (error: any) { toast.error(error.message); }
    };

    const contextValue = {
        theme, setTheme,
        user, vendor, cart, wishlist, userAuthModalOpen,
        setUserAuthModalOpen, cartOpen, setCartOpen, wishlistOpen, setWishlistOpen,
        formatPrice, fetchCart, fetchWishlist, addToCart, changeQty,
        removeFromCart, checkout, toggleWishlist, handleAuth, handleVendorAuth,
        vendorLogout, addresses, fetchAddresses, selectedAddressId, setSelectedAddressId,
        authLoading
    };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};