import { X as CloseIcon, ShoppingCart, PlusCircle } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import type {CartItem, Address} from "../types/index";
import Sheet from "../components/ui/Sheet";
import Button from "../components/ui/Button";
import { ImageWithLoader } from "../components/shared/ImageWithLoader";
import { optimizeImage } from "../lib/image";
import { useNavigate } from "react-router-dom";
import { Plus, Minus, Trash2 } from "lucide-react";

export const CartSheet = () => {
    const { 
        cartOpen, setCartOpen, cart, changeQty, removeFromCart, 
        checkout, formatPrice, addresses, selectedAddressId, 
        setSelectedAddressId
    } = useApp();
    
    const navigate = useNavigate();

    const handleCheckout = () => {
        checkout();
    }
    
    const handleDiscover = () => {
        setCartOpen(false);
        navigate('/');
        // Add a small delay to ensure the page has navigated before scrolling
        setTimeout(() => {
            document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleAddNewAddress = () => {
        setCartOpen(false);
        navigate('/profile/addresses');
    };

    const subtotal = cart.reduce((s: number, i: CartItem) => s + i.price * i.quantity, 0);

    return (
        <Sheet isOpen={cartOpen} onClose={() => setCartOpen(false)}>
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-800"><h3 className="text-xl font-bold dark:text-white">Shopping Cart</h3><Button variant="ghost" className="h-auto p-2 rounded-full" onClick={() => setCartOpen(false)}><CloseIcon size={20} /></Button></div>
            {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 dark:bg-gray-900/50">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                        <ShoppingCart size={48} className="text-gray-400 dark:text-gray-600"/>
                    </div>
                    <h4 className="font-semibold text-xl dark:text-white">Your Cart is Empty</h4>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs">Looks like you haven't added anything yet. Let's find something for you!</p>
                    <Button onClick={handleDiscover} className="mt-6" size="lg">Discover Products</Button>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {cart.map((it: CartItem) => (
                            <div key={it.product_id} className="flex items-start gap-4">
                                <ImageWithLoader
                                    src={optimizeImage(it.image, 100, 100)}
                                    alt={it.title}
                                    className="w-24 h-24 rounded-lg shrink-0"
                                    loading="lazy"
                                />
                                <div className="flex-1 flex flex-col h-24 justify-between">
                                    <div>
                                        <h4 className="font-semibold dark:text-white leading-tight">{it.title}</h4>
                                        <p className="text-md font-bold text-gray-800 dark:text-gray-200">{formatPrice(it.price)}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center border dark:border-gray-700 rounded-md">
                                            <button onClick={() => changeQty(it.product_id, it.quantity - 1)} className="px-2 py-1 text-gray-600 dark:text-gray-300 disabled:opacity-50" disabled={it.quantity <= 1}><Minus size={16} /></button>
                                            <span className="px-3 py-1 font-semibold text-sm">{it.quantity}</span>
                                            <button onClick={() => changeQty(it.product_id, it.quantity + 1)} className="px-2 py-1 text-gray-600 dark:text-gray-300"><Plus size={16} /></button>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-500 hover:bg-red-500/10" onClick={() => removeFromCart(it.product_id)}>
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
            
                    <div className="p-6 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 space-y-4">
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
                </>
            )}
        </Sheet>
    );
}