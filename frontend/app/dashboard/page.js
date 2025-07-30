'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

// --- Reusable Icon Component ---
const Icon = ({ type }) => {
    if (type === 'coverLetter') return <span title="Cover Letter">📄</span>;
    if (type === 'bio') return <span title="LinkedIn Bio">👤</span>;
    return null;
};

// --- Modal Component for Viewing/Editing ---
const ContentModal = ({ item, onClose, onSave, onDelete, onDownloadPdf }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(item.title);
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState('');

    const handleSave = () => {
        onSave(item.id, editedTitle);
        setIsEditing(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(item.content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        setDownloadError('');
        try {
            await onDownloadPdf(item.id, item.title);
        } catch (error) {
            setDownloadError('Download failed.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className="bg-gray-700 text-white font-bold text-lg p-1 rounded w-full"
                        />
                    ) : (
                        <h2 className="font-bold text-lg text-indigo-400 flex items-center gap-2">
                            <Icon type={item.content_type} /> {item.title}
                        </h2>
                    )}
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <pre className="text-gray-300 whitespace-pre-wrap text-sm">{item.content}</pre>
                </div>
                <div className="p-4 border-t border-gray-700 flex justify-between items-center">
                    <div>
                        <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-400 text-sm">Delete</button>
                    </div>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-md text-sm">Save Title</button>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-md text-sm">Edit Title</button>
                        )}
                        <button onClick={handleCopy} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-md text-sm">{isCopied ? 'Copied!' : 'Copy Text'}</button>
                        <button onClick={handleDownload} disabled={isDownloading} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-md text-sm disabled:bg-gray-500">
                            {isDownloading ? 'Downloading...' : 'Download PDF'}
                        </button>
                    </div>
                </div>
                {downloadError && <p className="text-red-400 text-center pb-4">{downloadError}</p>}
            </div>
        </div>
    );
};


// --- Main Dashboard Page Component ---
export default function DashboardPage() {
    const { isLoggedIn, token, logout } = useAuth();
    const router = useRouter();
    
    // State
    const [allContent, setAllContent] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedItem, setSelectedItem] = useState(null); // For the modal
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-cover-letter-backend.onrender.com';

    // Fetching Data
    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }

        const fetchContent = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/content`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    if (response.status === 401) logout();
                    throw new Error("Failed to fetch content.");
                }
                const data = await response.json();
                setAllContent(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchContent();
    }, [isLoggedIn, token, router, logout, API_BASE_URL]);

    // --- CRUD Handlers ---
    const handleDelete = async (contentId) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/content/${contentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to delete.");
            setAllContent(allContent.filter(item => item.id !== contentId));
            setSelectedItem(null); // Close modal on delete
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSaveTitle = async (contentId, newTitle) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/content/${contentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title: newTitle })
            });
            if (!response.ok) throw new Error("Failed to save title.");
            const updatedItem = await response.json();
            setAllContent(allContent.map(item => item.id === contentId ? updatedItem : item));
            setSelectedItem(updatedItem); // Update modal content
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDownloadPdf = async (contentId, title) => {
        console.log('Attempting PDF download...');
        console.log('API Base URL:', API_BASE_URL);
        console.log('Auth Token present:', !!token); // Check if token exists
        try {
            const response = await fetch(`${API_BASE_URL}/api/content/${contentId}/download-pdf`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error("Failed to download PDF.");
            }
            const blob = await response.blob();
            if (response.headers.get('content-type') === 'application/json') {
                // If the response is JSON, it means an error occurred on the backend
                const errorData = JSON.parse(await blob.text());
                throw new Error(errorData.detail || 'Failed to download PDF due to a server error.');
            }
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url); // Clean up the URL object
        } catch (err) {
            console.error("Download PDF error:", err);
            // Set the error state in the modal component
            throw err; // Re-throw to be caught by the modal's handleDownload
        }
    };

    // --- Filtering and Sorting Logic ---
    const filteredAndSortedContent = useMemo(() => {
        let content = [...allContent];

        // Filter by search term
        if (searchTerm) {
            content = content.filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort
        content.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
            if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            return 0;
        });

        return content;
    }, [allContent, searchTerm, sortBy]);


    // --- Render Logic ---
    if (isLoading) {
        return <div className="flex flex-col min-h-screen bg-gray-900 text-white"><Navbar /><div className="flex-grow flex items-center justify-center"><p>Loading Dashboard...</p></div></div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="flex-grow pt-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                        <h1 className="text-3xl font-bold">Your Dashboard</h1>
                        <Link href="/" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium">
                            + Generate New Content
                        </Link>
                    </div>

                    {/* Controls: Search and Sort */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="Search by title or content..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-grow bg-gray-700 text-white px-4 py-2 rounded-md min-w-[200px]"
                        />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-gray-700 text-white px-4 py-2 rounded-md"
                        >
                            <option value="newest">Sort by Newest</option>
                            <option value="oldest">Sort by Oldest</option>
                            <option value="title">Sort by Title (A-Z)</option>
                        </select>
                    </div>

                    {error && <p className="text-red-400">{error}</p>}
                    
                    {/* Content List */}
                    {filteredAndSortedContent.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-400">{searchTerm ? 'No items match your search.' : 'You haven\'t saved any content yet.'}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredAndSortedContent.map((item) => (
                                <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 cursor-pointer transition-colors">
                                    <h2 className="font-bold text-lg text-indigo-400 truncate flex items-center gap-2">
                                        <Icon type={item.content_type} /> {item.title}
                                    </h2>
                                    <p className="text-xs text-gray-400 mb-2">Saved on {new Date(item.created_at).toLocaleDateString()}</p>
                                    <p className="text-gray-300 text-sm line-clamp-3">{item.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            {selectedItem && (
                <ContentModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onSave={handleSaveTitle}
                    onDelete={handleDelete}
                    onDownloadPdf={handleDownloadPdf}
                />
            )}
        </div>
    );
}