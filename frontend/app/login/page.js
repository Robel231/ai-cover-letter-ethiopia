'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

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

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) {
            setError(error.message);
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

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-700"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                    <div className="flex-grow border-t border-gray-700"></div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-2.5 px-4 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors disabled:bg-gray-500"
                >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                        <path fill="#4285F4" d="M24 9.5c3.9 0 6.9 1.6 9.1 3.7l6.9-6.9C35.4 2.1 30.1 0 24 0 14.9 0 7.3 5.4 4.1 12.9l7.6 5.9C13.2 13.3 18.1 9.5 24 9.5z"></path>
                        <path fill="#34A853" d="M46.2 25.5c0-1.7-.2-3.4-.5-5H24v9.4h12.5c-.5 3-2.1 5.6-4.6 7.4l7.6 5.9c4.4-4.1 7-10.1 7-17.7z"></path>
                        <path fill="#FBBC05" d="M11.7 28.8c-.4-1.2-.6-2.5-.6-3.8s.2-2.6.6-3.8l-7.6-5.9C1.6 19.4 0 23.5 0 28s1.6 8.6 4.1 12.1l7.6-5.9z"></path>
                        <path fill="#EA4335" d="M24 48c6.1 0 11.4-2 15.4-5.4l-7.6-5.9c-2.5 1.7-5.6 2.6-9.8 2.6-5.9 0-10.8-3.8-12.5-9.1L4.1 35.9C7.3 43.4 14.9 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                    Sign in with Google
                </button>

                {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                <p className="text-center text-sm pt-2">
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