import { X as CloseIcon, ShoppingCart, PlusCircle } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import type {CartItem, Address} from "../types/index";
import Sheet from "../components/ui/Sheet";
import Button from "../components/ui/Button";
import { ImageWithLoader } from "../components/shared/ImageWithLoader";
import { optimizeCloudinaryImage } from "../lib/image";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate

export const CartSheet = () => {
    const { 
        cartOpen, setCartOpen, cart, changeQty, removeFromCart, 
        checkout, formatPrice, addresses, selectedAddressId, 
        setSelectedAddressId
    } = useApp();
    
    const navigate = useNavigate(); // 2. Initialize navigate

    const handleCheckout = () => {
        checkout();
    }
    
    // 3. Update this function to redirect
    const handleAddNewAddress = () => {
        setCartOpen(false); // Close the cart so the user can see the page
        navigate('/profile/addresses'); // Redirect to the address management page
    };

    const subtotal = cart.reduce((s: number, i: CartItem) => s + i.price * i.quantity, 0);

    return (
        <Sheet isOpen={cartOpen} onClose={() => setCartOpen(false)}>
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-800"><h3 className="text-xl font-bold dark:text-white">Shopping Cart</h3><Button variant="ghost" className="h-auto p-2 rounded-full" onClick={() => setCartOpen(false)}><CloseIcon size={20} /></Button></div>
            {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6"><ShoppingCart size={48} className="text-gray-300 dark:text-gray-600 mb-4" /><h4 className="font-semibold text-lg dark:text-white">Your cart is empty</h4><p className="text-gray-500 dark:text-gray-400">Looks like you haven't added anything yet.</p><Button onClick={() => setCartOpen(false)} variant="outline" className="mt-4">Start Shopping</Button></div>
            ) : (
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cart.map((it: CartItem) => (<div key={it.product_id} className="flex items-start gap-4">
                        <ImageWithLoader
                            src={optimizeCloudinaryImage(it.image, 100, 100)}
                            alt={it.title}
                            className="w-20 h-20 rounded-lg shrink-0"
                            loading="lazy"
                        />
                        <div className="flex-1"><h4 className="font-semibold dark:text-white">{it.title}</h4><p className="text-sm text-gray-500 dark:text-gray-400">{formatPrice(it.price)}</p><div className="flex items-center gap-2 mt-2"><input type="number" min="1" value={it.quantity} onChange={e => changeQty(it.product_id, Number(e.target.value || 1))} className="w-16 border dark:border-gray-700 bg-transparent rounded-md px-2 py-1 text-center" /><button onClick={() => removeFromCart(it.product_id)} className="text-sm text-red-500 hover:underline">Remove</button></div></div></div>))}
                </div>
            )}
            
            {cart.length > 0 && (
                <div className="p-6 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 space-y-4">
                    {/* Address Selector */}
                    <div>
                        <label className="text-sm font-medium dark:text-gray-300">Shipping Address</label>
                         {addresses.length > 0 ? (
                            <select 
                                value={selectedAddressId || ''} 
                                onChange={(e) => setSelectedAddressId(e.target.value)}
                                className="mt-1 w-full border dark:border-gray-700 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-900 cursor-pointer"
                            >
                                {addresses.map((addr: Address) => (
                                    <option key={addr._id} value={addr._id}>
                                        {addr.street}, {addr.city}, {addr.state}
                                    </option>
                                ))}
                            </select>
                         ) : <p className="text-xs text-gray-500 mt-1">Please add an address to proceed.</p>}
                        <Button variant="outline" size="sm" className="mt-2 w-full" onClick={handleAddNewAddress}>
                            <PlusCircle size={16} className="mr-2" /> Add / Manage Addresses
                        </Button>
                    </div>

                    <div className="flex justify-between font-bold text-lg dark:text-white">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <Button onClick={handleCheckout} disabled={cart.length === 0 || !selectedAddressId} className="w-full">Proceed to Checkout</Button>
                </div>
            )}
        </Sheet>
    );
}