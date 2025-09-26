import { Outlet, Link, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Button from './ui/Button';
import { Building, ArrowLeft, LayoutDashboard,LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

const VendorLayout = () => {
    const { vendor, vendorLogout } = useApp();
    const location = useLocation();

    const navItems = [
        { path: "/vendor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        // Add more links here as your vendor section grows
        // { path: "/vendor/orders", icon: Package, label: "Orders" },
        // { path: "/vendor/analytics", icon: BarChart2, label: "Analytics" },
        // { path: "/vendor/settings", icon: Settings, label: "Settings" },
    ];
    
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
                <div className="h-20 flex items-center px-6 gap-3 border-b border-gray-200 dark:border-gray-800">
                    <Building className="h-7 w-7 text-gray-800 dark:text-white"/>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white truncate">{vendor?.companyName || 'Vendor'}</h1>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-colors",
                                location.pathname === item.path 
                                    ? "bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900" 
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                 <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-800 space-y-2">
                    <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50">
                        <ArrowLeft size={18} />
                        Back to Store
                    </Link>
                    <Button variant="outline" className="w-full justify-start" onClick={vendorLogout}>
                        <LogOut size={16} className="mr-3" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                 <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg shadow-sm sticky top-0 z-10 md:hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                         <h1 className="text-xl font-bold text-gray-800 dark:text-white">{vendor?.companyName || 'Vendor Dashboard'}</h1>
                        <Button variant="outline" size="sm" onClick={vendorLogout}>Logout</Button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default VendorLayout;