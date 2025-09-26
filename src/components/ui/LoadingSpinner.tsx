import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => {
    return (
        <div className="flex justify-center items-center h-screen w-full">
            <Loader2 className="w-12 h-12 animate-spin text-gray-500 dark:text-gray-400" />
        </div>
    );
};

export default LoadingSpinner;

