import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import Button from '../components/ui/Button';
import Ballpit from '../components/shared/Ballpit';

const SuccessPage = () => {
    const { fetchCart } = useApp();
    useEffect(() => {
        // Clear the cart after a successful checkout
        fetchCart(); 
    }, [fetchCart]);

    return (
        <div className="relative flex flex-col items-center justify-center text-center py-16 md:py-20 min-h-[70vh] overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Ballpit className="opacity-50" count={200} gravity={0.1} friction={0.99}/>
            </div>
            <div className="relative z-10 bg-white/50 dark:bg-gray-950/50 backdrop-blur-md p-8 rounded-2xl shadow-xl">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}>
                    <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">Payment Successful!</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-3 max-w-md mx-auto">Thank you for your order. We've received your payment and are getting your items ready for shipment.</p>
                <Link to="/"><Button className="mt-8" size="lg">Continue Shopping</Button></Link>
            </div>
        </div>
    );
};

export default SuccessPage;