import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import Button from './ui/Button';
import { ShoppingCart, Heart, Sun, Moon, User, Package, LogOut, Menu } from 'lucide-react';
import api from '../api/userApi';

const Header = () => {
    const { user, cart, wishlist, setUserAuthModalOpen, setCartOpen, setWishlistOpen, theme, setTheme } = useApp();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const navLinks = ["Catalogue", "Fashion", "Favourite", "Lifestyle"];

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link to="/" className="text-2xl font-bold tracking-wider text-gray-900 dark:text-white">😎BROMART😎 </Link>
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map(link => (<a key={link} href="#" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">{link}</a>))}
                        <Link to="/vendor/auth" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                            Vendor Portal
                        </Link>
                    </nav>
                    <div className="flex items-center space-x-1">
                        <Button onClick={toggleTheme} variant="ghost" className="relative p-2 h-auto rounded-full" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                            {theme === 'dark' ? <Sun/> : <Moon/>}
                        </Button>
                        <Button onClick={() => setWishlistOpen(true)} variant="ghost" className="relative p-2 h-auto rounded-full" aria-label="Open wishlist">
                            <Heart />
                            {wishlist.length > 0 && <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-yellow-400 text-black text-xs font-bold text-center leading-5">{wishlist.length}</span>}
                        </Button>
                        <Button onClick={() => setCartOpen(true)} variant="ghost" className="relative p-2 h-auto rounded-full" aria-label="Open cart">
                            <ShoppingCart />
                            {cart.length > 0 && <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-yellow-400 text-black text-xs font-bold text-center leading-5">{cart.length}</span>}
                        </Button>
                        {user ? (
                            <div className="relative">
                                <button onClick={() => setProfileDropdownOpen(o => !o)} className="w-10 h-10 ml-2 flex items-center justify-center bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 font-bold rounded-full text-lg" aria-label="Open user menu">
                                    {user.trim().charAt(0).toUpperCase()}
                                </button>
                                <AnimatePresence>
                                {profileDropdownOpen && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-lg p-1.5">
                                        <p className="px-3 py-2 font-semibold text-gray-900 dark:text-white truncate text-sm">{user}</p>
                                        <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                                        <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"><User size={16} /> My Profile</Link>
                                        <Link to="/profile/orders" onClick={() => setProfileDropdownOpen(false)} className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"><Package size={16} /> My Orders</Link>
                                        <button onClick={() => { api.logout(); setProfileDropdownOpen(false); }} className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"><LogOut size={16} /> Logout</button>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                        ) : (<Button onClick={() => setUserAuthModalOpen(true)} className="hidden md:block ml-2">Login / Sign Up</Button>)}
                        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open main menu"><Menu /></button>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {menuOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden bg-white dark:bg-gray-950 overflow-hidden">
                        <div className="py-4 px-4 space-y-2 border-t dark:border-gray-800">
                            {navLinks.map(link => (<a key={link} href="#" className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white rounded-md px-3 py-2">{link}</a>))}
                            <Link to="/vendor/auth" className="block text-blue-600 dark:text-blue-400 hover:underline rounded-md px-3 py-2">Vendor Portal</Link>
                            {!user && <Button onClick={() => { setUserAuthModalOpen(true); setMenuOpen(false); }} className="w-full mt-2">Login / Sign Up</Button>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
};

export default Header;