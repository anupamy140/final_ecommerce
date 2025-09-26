import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const CancelPage = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20 min-h-[60vh]">
            <XCircle className="w-24 h-24 text-red-500 mb-6" />
            <h1 className="text-4xl font-bold">Order Canceled</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Your order was canceled. You have not been charged.</p>
            <Link to="/"><Button className="mt-8" size="lg">Back to Store</Button></Link>
        </div>
    );
};

export default CancelPage;