// src/pages/OrdersPage.tsx
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import type { OrderDoc } from '../lib/types';
import { ImageWithLoader } from '../components/shared/ImageWithLoader';

export const OrdersPage = () => {
    const [orders, setOrders] = useState<OrderDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const { formatPrice } = useApp();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders');
                if (!res.ok) throw new Error("Failed to fetch orders");
                const data = await res.json();
                setOrders(data.orders || []);
            } catch (error) {
                toast.error("Could not load your orders.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">My Orders</h2>
            {orders.length === 0 ? (
                <p className="text-gray-500">You haven't placed any orders yet.</p>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order._id} className="border dark:border-gray-800 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3 pb-3 border-b dark:border-gray-800">
                                <div>
                                    <p className="font-semibold">Order Date: <span className="font-normal">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                                    <p className="text-xs text-gray-500">Order ID: {order._id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">Total: <span className="font-bold text-lg">{formatPrice(order.total)}</span></p>
                                    <span className={`text-xs font-bold capitalize px-2 py-0.5 rounded-full ${order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {order.items.map(item => (
                                    <div key={item.product_id} className="flex items-center gap-4">
                                        <ImageWithLoader src={item.thumbnail || ''} alt={item.title || ''} className="w-16 h-16 rounded-md shrink-0" />
                                        <div className="flex-1">
                                            <p className="font-semibold">{item.title}</p>
                                            <p className="text-sm text-gray-500">{item.quantity} x {formatPrice(item.price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};