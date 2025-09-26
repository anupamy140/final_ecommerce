import React from 'react';

const ProductCardSkeleton = () => (
    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-4 animate-pulse">
        <div className="aspect-[4/5] mb-4 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3"></div>
        </div>
    </div>
);

export default ProductCardSkeleton;