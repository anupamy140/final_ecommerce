import React, { Suspense, lazy } from 'react';
import { createHashRouter } from 'react-router-dom';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Eagerly load layouts
import Layout from './components/Layout';
import CustomerLayout from './components/CustomerLayout';
import ProfileLayout from './pages/profile/ProfileLayout';
import VendorProtectedRoute from './pages/vendor/VendorProtectedRoute';

// --- LAZY-LOADED PAGE COMPONENTS ---
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const SuccessPage = lazy(() => import('./pages/SuccessPage'));
const CancelPage = lazy(() => import('./pages/CancelPage'));
const VendorAuthPage = lazy(() => import('./pages/vendor/VendorAuthPage'));
const VendorDashboardPage = lazy(() => import('./pages/vendor/VendorDashboardPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/profile/OrdersPage'));
const AddressManagementPage = lazy(() => import('./pages/profile/AddressManagementPage'));
const SettingsPage = lazy(() => import('./pages/profile/SettingsPage'));

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
);

const router = createHashRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                element: <CustomerLayout />,
                children: [
                    { index: true, element: withSuspense(HomePage) },
                    { path: "product/:productId", element: withSuspense(ProductDetailPage) },
                    {
                        path: "profile",
                        element: <ProfileLayout />,
                        children: [
                            { index: true, element: withSuspense(ProfilePage) },
                            { path: "orders", element: withSuspense(OrdersPage) },
                            { path: "addresses", element: withSuspense(AddressManagementPage) },
                            { path: "settings", element: withSuspense(SettingsPage) },
                        ]
                    },
                    { path: "success", element: withSuspense(SuccessPage) },
                    { path: "cancel", element: withSuspense(CancelPage) }
                ]
            },
            {
                path: "vendor/auth",
                element: withSuspense(VendorAuthPage)
            },
            {
                path: "vendor/dashboard",
                element: <VendorProtectedRoute />,
                children: [
                    { index: true, element: withSuspense(VendorDashboardPage) }
                ]
            }
        ]
    }
]);

export default router;