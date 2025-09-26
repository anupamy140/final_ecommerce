import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import Button from '../../components/ui/Button';
import { Loader2 } from 'lucide-react';

const VendorAuthPage = () => {
    const { handleVendorAuth } = useApp();
    const navigate = useNavigate();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const success = await handleVendorAuth(mode, { companyName, email, password });
        setLoading(false);
        if (success && mode === 'login') {
            navigate('/vendor/dashboard');
        } else if (success && mode === 'register') {
            setMode('login');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="text-3xl font-bold tracking-wider text-gray-900 dark:text-white">FASHION</Link>
                    <h2 className="mt-2 text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {mode === 'login' ? 'Vendor Portal Login' : 'Vendor Registration'}
                    </h2>
                </div>
                <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {mode === 'register' && (
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="mt-1 w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2.5" />
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2.5" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2.5" />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? 'Login' : 'Register')}
                        </Button>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button onClick={() => setMode(m => m === 'login' ? 'register' : 'login')} className="font-semibold text-gray-900 dark:text-white hover:underline">
                            {mode === 'login' ? 'Register here' : 'Login here'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VendorAuthPage;
