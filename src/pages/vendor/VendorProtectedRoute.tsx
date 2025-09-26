
import { Navigate } from 'react-router-dom';
import VendorLayout from '../../components/VendorLayout';

const VendorProtectedRoute = () => {
    const isVendorLoggedIn = !!localStorage.getItem("vendorAccessToken");

    if (!isVendorLoggedIn) {
        // Redirect them to the /vendor/auth page, but save the current location they were
        // trying to go to. This allows us to send them along to that page after they login.
        return <Navigate to="/vendor/auth" replace />;
    }

    return <VendorLayout />;
};

export default VendorProtectedRoute;