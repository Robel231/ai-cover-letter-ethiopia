'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { translations } from './translations.js';

// --- Reusable Form Components (with full content) ---

const CoverLetterForm = ({ t, jobDescription, setJobDescription, userInfo, setUserInfo, handleSubmit, isLoading }) => (
  <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
    <div>
      <label htmlFor="job-desc" className="block text-sm font-medium leading-6 text-gray-300">{t.jobLabel || '1. Paste the Job Description'}</label>
      <div className="mt-2">
        <textarea id="job-desc" rows={8} className="block w-full rounded-md border-0 bg-white/5 p-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500" placeholder={t.jobPlaceholder || 'e.g., from EthioJobs...'} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
      </div>
    </div>
    <div>
      <label htmlFor="user-info" className="block text-sm font-medium leading-6 text-gray-300">{t.userLabel || '2. Paste Your Resume or Key Skills'}</label>
      <div className="mt-2">
        <textarea id="user-info" rows={8} className="block w-full rounded-md border-0 bg-white/5 p-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500" placeholder={t.userPlaceholder || 'Your skills...'} value={userInfo} onChange={(e) => setUserInfo(e.target.value)} />
      </div>
    </div>
    <button type="submit" disabled={isLoading} className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:bg-gray-600 disabled:cursor-not-allowed">
      {isLoading ? (t.buttonLoading || 'Generating...') : (t.buttonText || 'Generate Cover Letter')}
    </button>
  </form>
);

const BioForm = ({ t, userInfo, setUserInfo, tone, setTone, handleSubmit, isLoading }) => (
  <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
    <div>
      <label htmlFor="bio-user-info" className="block text-sm font-medium leading-6 text-gray-300">{t.bioUserLabel || '1. Enter your skills, experience, or keywords'}</label>
      <div className="mt-2">
        <textarea id="bio-user-info" rows={8} className="block w-full rounded-md border-0 bg-white/5 p-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500" placeholder={t.bioUserPlaceholder || 'e.g., Senior Python Developer...'} value={userInfo} onChange={(e) => setUserInfo(e.target.value)} />
      </div>
    </div>
    <div>
      <label htmlFor="tone" className="block text-sm font-medium leading-6 text-gray-300">{t.toneLabel || '2. Select a Tone'}</label>
      <select id="tone" value={tone} onChange={(e) => setTone(e.target.value)} className="mt-2 block w-full rounded-md border-0 bg-white/5 py-2.5 pl-3 pr-10 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500">
        <option>Professional</option>
        <option>Casual</option>
        <option>Enthusiastic</option>
        <option>Formal</option>
      </select>
    </div>
    <button type="submit" disabled={isLoading} className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:bg-gray-600 disabled:cursor-not-allowed">
      {isLoading ? (t.buttonLoading || 'Generating...') : (t.generateBioButton || 'Generate Bio')}
    </button>
  </form>
);


// --- Main Page Component ---
export default function Home() {
    const { isLoggedIn, token } = useAuth();
    const [mode, setMode] = useState('coverLetter');
    const [jobDescription, setJobDescription] = useState('');
    const [userInfo, setUserInfo] = useState('');
    const [tone, setTone] = useState('Professional');
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [generatedBio, setGeneratedBio] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');

    // For simplicity, we get the translations object but also provide fallbacks in the JSX
    // This is to prevent errors if translations.js is ever out of sync
    const [language, setLanguage] = useState('en');
    const t = translations[language] || {};

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    const resetState = () => {
        setError('');
        setGeneratedLetter('');
        setGeneratedBio('');
        setSaveSuccess('');
    };
    
    const makeAuthenticatedRequest = async (endpoint, body) => {
        if (!token) {
            setError("You must be logged in to do that.");
            throw new Error("User not authenticated");
        }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "An API error occurred.");
        }
        return data;
    };
    
    const handleCoverLetterSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        resetState();
        try {
            const data = await makeAuthenticatedRequest('/api/generate', {
                job_description: jobDescription,
                user_info: userInfo,
            });
            if (data) setGeneratedLetter(data.cover_letter);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBioSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        resetState();
        try {
            const data = await makeAuthenticatedRequest('/api/generate-bio', {
                user_info: userInfo,
                tone: tone,
            });
            if (data) setGeneratedBio(data.bio);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveContent = async () => {
        const contentToSave = mode === 'coverLetter' ? generatedLetter : generatedBio;
        const title = mode === 'coverLetter' ? `Cover Letter for ${jobDescription.substring(0, 30)}...` : `LinkedIn Bio (${new Date().toLocaleDateString()})`;
        
        setSaveSuccess('');
        setError('');
        try {
            await makeAuthenticatedRequest('/api/content', {
                content_type: mode,
                title: title,
                content: contentToSave,
            });
            setSaveSuccess("Saved successfully!");
        } catch (err) {
            setError("Failed to save content. " + err.message);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="flex-grow pt-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                {!isLoggedIn ? (
                    <div className="text-center bg-gray-800 p-8 rounded-lg shadow-lg mt-10">
                        <h1 className="text-3xl font-bold mb-4">Welcome to AI Job Tools</h1>
                        <p className="text-lg text-gray-300 mb-6">Please log in or sign up to use the generators and save your work.</p>
                        <div className="space-x-4">
                            <Link href="/login" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md">Login</Link>
                            <Link href="/signup" className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-md">Sign Up</Link>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-5xl">
                        {/* Tab Navigation */}
                        <div className="mb-6 flex border-b border-gray-700">
                            <button onClick={() => { setMode('coverLetter'); resetState(); }} className={`py-2 px-4 text-sm font-medium transition-colors ${mode === 'coverLetter' ? 'border-b-2 border-indigo-400 text-white' : 'text-gray-400 hover:text-white'}`}>
                                {t.coverLetterTitle || 'Cover Letter Generator'}
                            </button>
                            <button onClick={() => { setMode('bio'); resetState(); }} className={`py-2 px-4 text-sm font-medium transition-colors ${mode === 'bio' ? 'border-b-2 border-indigo-400 text-white' : 'text-gray-400 hover:text-white'}`}>
                                {t.bioTitle || 'LinkedIn Bio Generator'}
                            </button>
                        </div>

                        {/* Conditional Form Rendering */}
                        {mode === 'coverLetter' ? (
                            <CoverLetterForm t={t} jobDescription={jobDescription} setJobDescription={setJobDescription} userInfo={userInfo} setUserInfo={setUserInfo} handleSubmit={handleCoverLetterSubmit} isLoading={isLoading} />
                        ) : (
                            <BioForm t={t} userInfo={userInfo} setUserInfo={setUserInfo} tone={tone} setTone={setTone} handleSubmit={handleBioSubmit} isLoading={isLoading} />
                        )}

                        {/* Error/Success Messages */}
                        {error && <div className="mt-4 rounded-md bg-red-900/50 p-3 text-sm text-red-300">{error}</div>}
                        {saveSuccess && <div className="mt-4 rounded-md bg-green-900/50 p-3 text-sm text-green-300">{saveSuccess}</div>}

                        {/* Conditional Result Display */}
                        {(generatedLetter || generatedBio) && (
                            <div className="mt-10 animate-fade-in">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">
                                        {mode === 'coverLetter' ? (t.resultTitle || 'Generated Cover Letter') : (t.bioTitle || 'Generated Bio')}
                                    </h2>
                                    <button onClick={handleSaveContent} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm font-medium">
                                        💾 Save
                                    </button>
                                </div>
                                <pre className="whitespace-pre-wrap rounded-md bg-gray-800 p-4 font-sans text-sm">
                                    {mode === 'coverLetter' ? generatedLetter : generatedBio}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}