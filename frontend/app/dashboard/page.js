'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Skeleton from '@/components/Skeleton'; // Assuming Skeleton component exists
import { motion, AnimatePresence } from 'framer-motion';

// --- Helper Components ---
const Icon = ({ type }) => {
    if (type === 'coverLetter') return <span>📄</span>;
    if (type === 'bio') return <span>👤</span>;
    return <span>📝</span>;
};

// --- Modal Component ---
const ContentModal = ({ item, onClose, onSave, onDelete }) => {
    const [title, setTitle] = useState(item.title);
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter(); // For the new button

    const handleSave = () => {
        onSave(item.id, title);
        setIsEditing(false);
    };

    const handlePracticeInterview = () => {
        router.push(`/interview-coach/${item.id}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-4 border-b border-gray-700">
                    {isEditing ? (
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-700 text-white text-xl font-bold p-2 rounded-md"
                        />
                    ) : (
                        <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
                            <Icon type={item.content_type} /> {item.title}
                        </h2>
                    )}
                </div>

                {/* Modal Content */}
                <div className="p-4 overflow-y-auto">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{item.content}</pre>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-700 flex flex-wrap justify-end items-center gap-2">
                    <button onClick={() => onDelete(item.id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm">Delete</button>
                    {isEditing ? (
                        <button onClick={handleSave} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm">Save Changes</button>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-sm">Edit Title</button>
                    )}
                    
                    {/* THIS IS THE NEW BUTTON */}
                    {item.content_type === 'coverLetter' && (
                        <button 
                            onClick={handlePracticeInterview} 
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm font-semibold flex items-center gap-2"
                        >
                            🚀 Practice Interview
                        </button>
                    )}

                    <button onClick={onClose} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-md text-sm">Close</button>
                </div>
            </motion.div>
        </motion.div>
    );
};


// --- Main Dashboard Page ---
export default function DashboardPage() {
    const { token, isLoggedIn } = useAuth();
    const router = useRouter();
    
    // States
    const [allContent, setAllContent] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    // Fetching Data
    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }

        const fetchContent = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/content`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch content.');
                const data = await response.json();
                setAllContent(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContent();
    }, [isLoggedIn, token, router]);

    // Handlers for Edit and Delete
    const handleSaveTitle = async (id, newTitle) => {
        const originalContent = [...allContent];
        setAllContent(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
        setSelectedItem(null);
        try {
            await fetch(`${API_BASE_URL}/api/content/${id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle }),
            });
        } catch (err) {
            setError("Failed to save title. Reverting changes.");
            setAllContent(originalContent);
        }
    };

    const handleDelete = async (id) => {
        const originalContent = [...allContent];
        setAllContent(prev => prev.filter(c => c.id !== id));
        setSelectedItem(null);
        try {
            await fetch(`${API_BASE_URL}/api/content/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
        } catch (err) {
            setError("Failed to delete item. Reverting changes.");
            setAllContent(originalContent);
        }
    };

    // Filtering and Sorting
    const filteredAndSortedContent = useMemo(() => {
        let content = [...allContent];
        if (searchTerm) {
            content = content.filter(item => 
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        content.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
            if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            return 0;
        });
        return content;
    }, [allContent, searchTerm, sortBy]);

    // Render Logic
    if (isLoading && allContent.length === 0) {
        // Your Skeleton Loader can go here
        return (
            <div className="flex flex-col min-h-screen bg-gray-900 text-white">
                <Navbar />
                <main className="flex-grow pt-24 flex items-center justify-center"><p>Loading Dashboard...</p></main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="flex-grow pt-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Your Dashboard</h1>
                        <Link href="/" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md">
                            + Generate New
                        </Link>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4 mb-6">
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-grow bg-gray-700 px-4 py-2 rounded-md" />
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-gray-700 px-4 py-2 rounded-md">
                            <option value="newest">Sort by Newest</option>
                            <option value="oldest">Sort by Oldest</option>
                            <option value="title">Sort by Title</option>
                        </select>
                    </div>

                    {error && <p className="text-red-400 mb-4">{error}</p>}

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAndSortedContent.map(item => (
                            <motion.div key={item.id} onClick={() => setSelectedItem(item)} className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700">
                                <h2 className="font-bold text-lg text-indigo-400 truncate"><Icon type={item.content_type} /> {item.title}</h2>
                                <p className="text-xs text-gray-400 mb-2">Saved on {new Date(item.created_at).toLocaleDateString()}</p>
                                <p className="text-sm line-clamp-3">{item.content}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
            
            <AnimatePresence>
                {selectedItem && (
                    <ContentModal item={selectedItem} onClose={() => setSelectedItem(null)} onSave={handleSaveTitle} onDelete={handleDelete} />
                )}
            </AnimatePresence>
        </div>
    );
}