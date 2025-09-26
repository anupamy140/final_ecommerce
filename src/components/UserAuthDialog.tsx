import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import Dialog from './ui/Dialog';
import Button from './ui/Button';
import {  Loader2 } from 'lucide-react';
import { X as CloseIcon } from 'lucide-react';

const UserAuthDialog = () => {
    const { userAuthModalOpen, setUserAuthModalOpen, handleAuth } = useApp();
    const [mode, setMode] = useState<'login' | 'register'>("login");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [dob, setDob] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [country, setCountry] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await handleAuth(mode, email, username, password, { dob, street, city, state, postalCode, country });
        setLoading(false);
    };

    if (!userAuthModalOpen) return null;

    return (
        <Dialog isOpen={userAuthModalOpen} onClose={() => setUserAuthModalOpen(false)}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-md relative shadow-lg">
                <Button variant="ghost" className="absolute top-4 right-4 h-auto p-2 rounded-full" onClick={() => setUserAuthModalOpen(false)}><CloseIcon size={20}/></Button>
                <h2 className="text-2xl font-bold mb-2 text-center dark:text-white">{mode === 'login' ? 'Welcome Back!' : 'Create an Account'}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">{mode === 'login' ? 'Login to continue shopping' : 'Sign up to get started'}</p>
                
                <form onSubmit={submit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {mode === 'register' && (
                        <>
                            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                            <label className="text-sm text-gray-500 dark:text-gray-400 block pt-2">Date of Birth</label>
                            <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                            <h4 className="text-md font-semibold pt-4 text-gray-700 dark:text-gray-200">Default Address</h4>
                            <input type="text" placeholder="Street" value={street} onChange={e => setStreet(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                            <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                            <input type="text" placeholder="State / Province" value={state} onChange={e => setState(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                            <input type="text" placeholder="Postal Code" value={postalCode} onChange={e => setPostalCode(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                            <input type="text" placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                        </>
                    )}
                    {mode === 'login' && (
                        <>
                            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                        </>
                    )}
                    <Button type="submit" disabled={loading} className="w-full sticky bottom-0">{loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? 'Login' : 'Register')}</Button>
                </form>
                
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <button className="font-semibold text-gray-900 dark:text-white hover:underline" onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}>
                        {mode === 'login' ? 'Register' : 'Login'}
                    </button>
                </div>
            </div>
        </Dialog>
    );
};

export default UserAuthDialog;