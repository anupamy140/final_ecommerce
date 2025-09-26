import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Button from './ui/Button';
import { Building, ArrowLeft } from 'lucide-react';

const VendorLayout = () => {
    const { vendor, vendorLogout } = useApp();
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <header className="bg-white dark:bg-gray-900 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <div className="flex items-center gap-3">
                        <Building className="h-6 w-6 text-gray-800 dark:text-white"/>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">{vendor?.companyName || 'Vendor Dashboard'}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-sm font-medium hover:underline">
                            <ArrowLeft size={16} className="inline-block mr-1"/>Back to Store
                        </Link>
                        <Button variant="outline" size="sm" onClick={vendorLogout}>Logout</Button>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
};

export default VendorLayout;