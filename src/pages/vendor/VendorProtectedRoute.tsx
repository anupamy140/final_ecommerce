import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import VendorLayout from '../../components/VendorLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const VendorProtectedRoute = () => {
    const [isVendorLoggedIn, setIsVendorLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate a check for the token
        const checkAuth = () => {
            const token = localStorage.getItem("vendorAccessToken");
            setIsVendorLoggedIn(!!token);
            setLoading(false);
        };
        
        checkAuth();
        
        // Listen for changes in auth state
        window.addEventListener('vendorAuthChange', checkAuth);
        return () => window.removeEventListener('vendorAuthChange', checkAuth);

    }, []);
    
    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isVendorLoggedIn) {
        // Redirect them to the /vendor/auth page
        return <Navigate to="/vendor/auth" replace />;
    }

    return <VendorLayout />;
};

export default VendorProtectedRoute;