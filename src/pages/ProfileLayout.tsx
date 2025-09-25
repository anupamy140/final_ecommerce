// src/pages/ProfileLayout.tsx
import { useEffect } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { Loader2, User, Package, Settings, MapPin, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export const ProfileLayout = () => {
    const { user } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate('/');
    }, [user, navigate]);

    if (!user) return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="w-12 h-12 animate-spin" /></div>;

    const navItems = [
        { path: "/profile", icon: User, label: "My Profile" },
        { path: "/profile/orders", icon: Package, label: "My Orders" },
        { path: "/profile/addresses", icon: MapPin, label: "My Addresses" },
        { path: "/profile/settings", icon: Settings, label: "Settings" },
    ];

    const activeLinkClass = "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50";
    const inactiveLinkClass = "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50";

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <h1 className="text-4xl font-bold mb-8 dark:text-white">Account</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <aside className="md:col-span-1">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-4 pb-4 border-b dark:border-gray-700">
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 font-bold rounded-full text-xl">
                                {user?.trim().charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="font-bold text-lg dark:text-white truncate">{user}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Welcome</p>
                            </div>
                        </div>
                        <nav className="mt-4 space-y-1">
                            {navItems.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === "/profile"}
                                    className={({ isActive }) => cn("flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-colors", isActive ? activeLinkClass : inactiveLinkClass)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                            <button onClick={api.logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-red-500 hover:bg-red-500/10 transition-colors">
                                <LogOut className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        </nav>
                    </div>
                </aside>
                <main className="md:col-span-3">
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 min-h-[50vh]">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}