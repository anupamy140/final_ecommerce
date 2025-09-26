
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useApp } from '../contexts/AppContext';
import Sheet from './ui/Sheet';
import Button from './ui/Button';
import ImageWithLoader from './shared/ImageWithLoader';
import { ShoppingCart } from 'lucide-react';
import type { CartItem, Address } from '../types';
import { X as CloseIcon } from 'lucide-react';

const CartSheet = () => {
    const { cartOpen, setCartOpen, cart, changeQty, removeFromCart, checkout, formatPrice, addresses, selectedAddressId, setSelectedAddressId } = useApp();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (!selectedAddressId) {
            toast.error("Please select a shipping address.");
            return;
        }
        checkout(selectedAddressId);
    };

    const handleAddAddress = () => {
        setCartOpen(false);
        navigate('/profile/addresses');
    };

    return (
        <Sheet isOpen={cartOpen} onClose={() => setCartOpen(false)}>
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
                <h3 className="text-xl font-bold dark:text-white">Shopping Cart</h3>
                <Button variant="ghost" className="h-auto p-2 rounded-full" onClick={() => setCartOpen(false)}><CloseIcon size={20}/></Button>
            </div>
            {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <ShoppingCart size={48} className="text-gray-300 dark:text-gray-600 mb-4"/>
                    <h4 className="font-semibold text-lg dark:text-white">Your cart is empty</h4>
                    <p className="text-gray-500 dark:text-gray-400">Looks like you haven't added anything yet.</p>
                    <Button onClick={() => setCartOpen(false)} variant="outline" className="mt-4">Start Shopping</Button>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cart.map((it: CartItem) => (
                        <div key={it.product_id} className="flex items-start gap-4">
                            <ImageWithLoader src={it.image} alt={it.title} className="w-20 h-20 rounded-lg shrink-0"/>
                            <div className="flex-1">
                                <h4 className="font-semibold dark:text-white">{it.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{formatPrice(it.price)}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <input type="number" min="1" value={it.quantity} onChange={e => changeQty(it.product_id, Number(e.target.value || 1))} className="w-16 border dark:border-gray-700 bg-transparent rounded-md px-2 py-1 text-center"/>
                                    <button onClick={() => removeFromCart(it.product_id)} className="text-sm text-red-500 hover:underline">Remove</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="p-6 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50">
                <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Shipping Address</label>
                    {addresses && addresses.length > 0 ? (
                        <select value={selectedAddressId || ''} onChange={e => setSelectedAddressId(e.target.value)} className="w-full border dark:border-gray-700 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-900 cursor-pointer focus:ring-2 focus:ring-yellow-400 outline-none">
                            <option value="" disabled>Select an address</option>
                            {addresses.map((addr: Address) => (
                                <option key={addr._id} value={addr._id}>
                                    {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="text-center p-4 border-2 border-dashed dark:border-gray-700 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No addresses found.</p>
                            <Button variant="outline" size="sm" className="mt-2" onClick={handleAddAddress}>Add Address</Button>
                        </div>
                    )}
                </div>
                <div className="flex justify-between font-bold text-lg mb-4 dark:text-white">
                    <span>Subtotal</span>
                    <span>{formatPrice(cart.reduce((s: number, i: CartItem) => s + i.price * i.quantity, 0))}</span>
                </div>
                <Button onClick={handleCheckout} disabled={cart.length === 0 || !selectedAddressId} className="w-full">Proceed to Checkout</Button>
            </div>
        </Sheet>
    );
};

export default CartSheet;

