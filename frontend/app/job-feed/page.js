'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Skeleton from '@/components/Skeleton';

const getScoreColor = (score) => {
    if (score >= 75) return 'bg-green-500 text-green-100';
    if (score >= 50) return 'bg-yellow-500 text-yellow-100';
    return 'bg-red-500 text-red-100';
};

const JobCard = ({ job }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200 relative">
        {job.match_score !== undefined && (
            <div className={`absolute top-4 right-4 px-3 py-1 text-sm font-bold rounded-full ${getScoreColor(job.match_score)}`}>
                {job.match_score}%
            </div>
        )}
        <p className="text-gray-300 text-sm whitespace-pre-wrap pr-20">{job.message_text}</p>
        {job.match_summary && (
            <p className='mt-3 text-sm text-indigo-300 italic border-l-2 border-indigo-400 pl-3'>
                <strong>AI Summary:</strong> {job.match_summary}
            </p>
        )}
        <p className="text-xs text-gray-400 mt-2 text-right">{new Date(job.posted_at).toLocaleString()}</p>
    </div>
);

const JobFeedSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-800 p-4 rounded-lg">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/4 mt-2 ml-auto" />
            </div>
        ))}
    </div>
);

export default function JobFeedPage() {
    const { isLoggedIn, token, logout } = useAuth();
    const router = useRouter();
    
    const [jobs, setJobs] = useState([]);
    const [extractedCvText, setExtractedCvText] = useState('');
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isParsing, setIsParsing] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [error, setError] = useState('');

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-cover-letter-backend.onrender.com';

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }

        const fetchJobs = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/jobs`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    if (response.status === 401) logout();
                    throw new Error("Failed to fetch jobs.");
                }
                const data = await response.json();
                setJobs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, [isLoggedIn, token, router, logout, API_BASE_URL]);

    const handleCvUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadedFileName(file.name);
        setIsParsing(true);
        setError('');

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await fetch(`${API_BASE_URL}/api/parse-resume`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to parse CV.");
            }

            const data = await response.json();
            setExtractedCvText(data.summary);
        } catch (err) {
            setError(err.message);
            setUploadedFileName(''); // Clear file name on error
        } finally {
            setIsParsing(false);
        }
    };

    const handleFindMatches = async () => {
        if (!extractedCvText) {
            setError("Please upload and parse your CV first.");
            return;
        }
        setIsMatching(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/match-jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ cv_text: extractedCvText })
            });
            if (!response.ok) {
                throw new Error("Failed to get matches from the server.");
            }
            const matchedJobs = await response.json();
            setJobs(matchedJobs);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsMatching(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="flex-grow pt-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-4">AI Job Matcher</h1>
                    
                    <div className="mb-6 bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center gap-4">
                            <label htmlFor="cv-upload" className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200">
                                Upload CV (PDF)
                            </label>
                            <input id="cv-upload" type="file" className="hidden" accept=".pdf" onChange={handleCvUpload} disabled={isParsing || isMatching} />
                            {isParsing && <p>Parsing CV...</p>}
                            {uploadedFileName && !isParsing && <p className="text-green-400">Ready: {uploadedFileName}</p>}
                        </div>

                        {extractedCvText && !isParsing && (
                             <div className="mt-4 p-3 bg-gray-700 rounded-md">
                                <h3 className="font-bold text-md mb-2">CV Summary (for matching):</h3>
                                <p className="text-sm text-gray-300 whitespace-pre-wrap">{extractedCvText}</p>
                             </div>
                        )}

                        <button
                            onClick={handleFindMatches}
                            disabled={!extractedCvText || isMatching || isParsing}
                            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {isMatching ? 'Analyzing Matches...' : 'Find Best Matches for this CV'}
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold mb-6">Job Feed</h2>
                    {isLoading ? (
                        <JobFeedSkeleton />
                    ) : error ? (
                        <p className="text-red-400 text-center py-4">{error}</p>
                    ) : jobs.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No jobs found. Check back later!</p>
                    ) : (
                        <div className="space-y-4">
                            {jobs.map(job => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
