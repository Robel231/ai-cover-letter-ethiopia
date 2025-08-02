'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants for the loading dots
const dotVariants = {
    initial: {
        y: 0,
    },
    animate: {
        y: [0, -8, 0],
        transition: {
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();
    
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-cover-letter-backend.onrender.com';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to log in.');
            }
            login(data.access_token);
            router.push('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-center">Log In</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md bg-white/5 p-3" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full rounded-md bg-white/5 p-3" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:bg-gray-600 transition-colors h-10 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div
                                    key="loader"
                                    className="flex justify-center items-center gap-2"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                >
                                    <motion.div variants={dotVariants} animate="animate" style={{...dotStyle, transitionDelay: '0s'}} />
                                    <motion.div variants={dotVariants} animate="animate" style={{...dotStyle, transitionDelay: '0.2s'}} />
                                    <motion.div variants={dotVariants} animate="animate" style={{...dotStyle, transitionDelay: '0.4s'}} />
                                </motion.div>
                            ) : (
                                <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    Log In
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </form>
                {error && <p className="text-red-400 text-center">{error}</p>}
                <p className="text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-medium text-indigo-400 hover:text-indigo-300">Sign up</Link>
                </p>
            </div>
        </div>
    );
}

const dotStyle = {
    display: 'block',
    width: '8px',
    height: '8px',
    backgroundColor: 'white',
    borderRadius: '50%',
};