'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
    const { isLoggedIn, token, logout } = useAuth();
    const router = useRouter();
    const [content, setContent] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        // If the user is not logged in, redirect them to the login page
        if (!isLoggedIn) {
            router.push('/login');
            return; // Stop execution of the effect
        }

        // Fetch the user's saved content
        const fetchContent = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/content`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    // If token is expired or invalid, log the user out
                    if (response.status === 401) {
                        logout();
                        router.push('/login');
                    }
                    throw new Error("Failed to fetch content.");
                }

                const data = await response.json();
                setContent(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContent();
    }, [isLoggedIn, token, router, logout]); // Dependencies for the effect

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-900 text-white">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <p>Loading your content...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="flex-grow pt-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Your Saved Content</h1>
                    {error && <p className="text-red-400">{error}</p>}
                    
                    {content.length === 0 && !error ? (
                        <p>You haven't saved any content yet. Go generate some!</p>
                    ) : (
                        <div className="space-y-4">
                            {content.map((item) => (
                                <div key={item.id} className="bg-gray-800 p-4 rounded-lg shadow">
                                    <h2 className="font-bold text-lg text-indigo-400">{item.title}</h2>
                                    <p className="text-xs text-gray-400 mb-2">
                                        {item.content_type === 'coverLetter' ? 'Cover Letter' : 'LinkedIn Bio'} - Saved on {new Date(item.created_at).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-300 whitespace-pre-wrap text-sm">
                                        {item.content.substring(0, 200)}{item.content.length > 200 ? '...' : ''}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}