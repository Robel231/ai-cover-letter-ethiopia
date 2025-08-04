'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import LandingPage from '@/components/LandingPage';
import Skeleton from '@/components/Skeleton';
import { translations } from './translations.js';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

import ValuationResult from '@/components/ValuationResult';

// --- Reusable Loading Spinner ---
const LoadingSpinner = () => (
    <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
        <path d="M12 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 18V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.93 4.93L7.76 7.76" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.24 16.24L19.07 19.07" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12H6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 12H22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.93 19.07L7.76 16.24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.24 7.76L19.07 4.93" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </motion.svg>
);

// --- Result Skeleton Loader ---
const ResultSkeleton = () => (
    <div className="mt-10 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
    </div>
);


// --- Reusable Form Components ---
const CoverLetterForm = ({ t, jobDescription, setJobDescription, userInfo, setUserInfo, template, setTemplate, handleSubmit, isLoading, isUploading, handleResumeUpload, activeTextArea, setActiveTextArea, isListening, startListening, stopListening, hasRecognitionSupport }) => {
  const fileInputRef = useRef(null);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div>
        <label htmlFor="job-desc" className="block text-sm font-medium leading-6 text-gray-300">{t.jobLabel || '1. Paste the Job Description'}</label>
        <div className="mt-2 relative">
          <textarea id="job-desc" rows={8} className="block w-full rounded-md border-0 bg-white/5 p-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500" placeholder={t.jobPlaceholder || 'e.g., from EthioJobs...'} value={jobDescription} onFocus={() => setActiveTextArea('jobDescription')} onChange={(e) => setJobDescription(e.target.value)} />
          {hasRecognitionSupport && (
              <button type="button" onClick={isListening && activeTextArea === 'jobDescription' ? stopListening : startListening} className={`absolute top-2 right-2 p-1 rounded-full ${isListening && activeTextArea === 'jobDescription' ? 'bg-red-500' : 'bg-gray-600'} hover:bg-gray-500`}>
                  🎤
              </button>
          )}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center">
          <label htmlFor="user-info" className="block text-sm font-medium leading-6 text-gray-300">{t.userLabel || '2. Paste Your Resume or Key Skills'}</label>
          <input type="file" ref={fileInputRef} onChange={handleResumeUpload} accept=".pdf" className="hidden" />
          <button type="button" onClick={() => fileInputRef.current.click()} disabled={isUploading} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50">
            {isUploading ? 'Uploading...' : '📤 Upload Resume & Autofill'}
          </button>
        </div>
        <div className="mt-2 relative">
          <textarea id="user-info" rows={8} className="block w-full rounded-md border-0 bg-white/5 p-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500" placeholder={t.userPlaceholder || 'Your skills...'} value={userInfo} onFocus={() => setActiveTextArea('userInfo')} onChange={(e) => setUserInfo(e.target.value)} />
          {hasRecognitionSupport && (
              <button type="button" onClick={isListening && activeTextArea === 'userInfo' ? stopListening : startListening} className={`absolute top-2 right-2 p-1 rounded-full ${isListening && activeTextArea === 'userInfo' ? 'bg-red-500' : 'bg-gray-600'} hover:bg-gray-500`}>
                  🎤
              </button>
          )}
        </div>
      </div>
      <div>
        <label htmlFor="template" className="block text-sm font-medium leading-6 text-gray-300">{t.templateLabel || '3. Select a Writing Style'}</label>
        <select id="template" value={template} onChange={(e) => setTemplate(e.target.value)} className="mt-2 block w-full rounded-md border-0 bg-white/5 py-2.5 pl-3 pr-10 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500">
          <option>Professional</option>
          <option>Formal</option>
          <option>Creative</option>
        </select>
      </div>
      <button type="submit" disabled={isLoading || isUploading} className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:bg-gray-600 disabled:cursor-not-allowed">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner />
            <span>{t.buttonLoading || 'Generating...'}</span>
          </div>
        ) : (t.buttonText || 'Generate Cover Letter')}
      </button>
    </form>
  );
};

const BioForm = ({ t, userInfo, setUserInfo, template, setTemplate, handleSubmit, isLoading, isUploading, handleResumeUpload, activeTextArea, setActiveTextArea, isListening, startListening, stopListening, hasRecognitionSupport }) => {
  const fileInputRef = useRef(null);
  return (
  <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
    <div>
        <div className="flex justify-between items-center">
            <label htmlFor="bio-user-info" className="block text-sm font-medium leading-6 text-gray-300">{t.bioUserLabel || '1. Enter your skills, experience, or keywords'}</label>
            <input type="file" ref={fileInputRef} onChange={handleResumeUpload} accept=".pdf" className="hidden" />
            <button type="button" onClick={() => fileInputRef.current.click()} disabled={isUploading} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50">
                {isUploading ? 'Uploading...' : '📤 Upload Resume & Autofill'}
            </button>
        </div>
      <div className="mt-2 relative">
        <textarea id="bio-user-info" rows={8} className="block w-full rounded-md border-0 bg-white/5 p-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500" placeholder={t.bioUserPlaceholder || 'e.g., Senior Python Developer...'} value={userInfo} onFocus={() => setActiveTextArea('bioUserInfo')} onChange={(e) => setUserInfo(e.target.value)} />
        {hasRecognitionSupport && (
            <button type="button" onClick={isListening && activeTextArea === 'bioUserInfo' ? stopListening : startListening} className={`absolute top-2 right-2 p-1 rounded-full ${isListening && activeTextArea === 'bioUserInfo' ? 'bg-red-500' : 'bg-gray-600'} hover:bg-gray-500`}>
                🎤
            </button>
        )}
      </div>
    </div>
    <div>
      <label htmlFor="template" className="block text-sm font-medium leading-6 text-gray-300">{t.toneLabel || '2. Select a Tone'}</label>
      <select id="template" value={template} onChange={(e) => setTemplate(e.target.value)} className="mt-2 block w-full rounded-md border-0 bg-white/5 py-2.5 pl-3 pr-10 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500">
        <option>Professional</option>
        <option>Casual</option>
        <option>Enthusiastic</option>
        <option>Formal</option>
      </select>
    </div>
    <button type="submit" disabled={isLoading || isUploading} className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:bg-gray-600 disabled:cursor-not-allowed">
      {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner />
            <span>{t.buttonLoading || 'Generating...'}</span>
          </div>
        ) : (t.generateBioButton || 'Generate Bio')}
    </button>
  </form>
)};

const CvValuatorForm = ({ t, jobDescription, setJobDescription, handleSubmit, isLoading, isUploading, handleCvUpload, cvFile }) => {
    const fileInputRef = useRef(null);

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div>
                <label className="block text-sm font-medium leading-6 text-gray-300">{t.cvLabel || '1. Upload Your CV (PDF)'}</label>
                <div className="mt-2">
                    <input type="file" ref={fileInputRef} onChange={handleCvUpload} accept=".pdf" className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current.click()} disabled={isUploading} className="w-full justify-center rounded-md bg-white/10 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20 disabled:opacity-50">
                        {isUploading ? 'Uploading...' : '📤 Upload CV (PDF)'}
                    </button>
                    {cvFile && <p className="text-sm text-gray-400 mt-2">Uploaded: {cvFile.name}</p>}
                </div>
            </div>
            <div>
                <label htmlFor="jd-text" className="block text-sm font-medium leading-6 text-gray-300">{t.jdLabel || '2. Paste the Job Description'}</label>
                <div className="mt-2">
                    <textarea id="jd-text" rows={10} className="block w-full rounded-md border-0 bg-white/5 p-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500" placeholder={t.jdPlaceholder || 'Paste the job description here...'} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                </div>
            </div>
            <button type="submit" disabled={isLoading || isUploading || !cvFile} className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:bg-gray-600 disabled:cursor-not-allowed">
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                        <LoadingSpinner />
                        <span>{t.valuatingButton || 'Analyzing...'}</span>
                    </div>
                ) : (t.valuateButton || 'Analyze My CV')}
            </button>
        </form>
    );
};


// --- Main Page Component ---
export default function Home() {
    const { isLoggedIn, token } = useAuth();
    const [mode, setMode] = useState('coverLetter');
    const [jobDescription, setJobDescription] = useState('');
    const [userInfo, setUserInfo] = useState('');
    const [template, setTemplate] = useState('Professional');
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [generatedBio, setGeneratedBio] = useState('');
    const [valuationResult, setValuationResult] = useState(null);
    const [cvFile, setCvFile] = useState(null);
    const [extractedCvText, setExtractedCvText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');
    const [activeTextArea, setActiveTextArea] = useState(null);

    const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            if (activeTextArea === 'jobDescription') {
                setJobDescription(prev => prev + transcript);
            } else if (activeTextArea === 'userInfo') {
                setUserInfo(prev => prev + transcript);
            } else if (activeTextArea === 'bioUserInfo') {
                setUserInfo(prev => prev + transcript);
            }
        }
    }, [transcript, activeTextArea]);

    const t = translations['en'] || {};
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-cover-letter-backend.onrender.com';

    const resetState = () => {
        setError('');
        setGeneratedLetter('');
        setGeneratedBio('');
        setValuationResult(null);
        setSaveSuccess('');
    };

    const makeAuthenticatedRequest = async (endpoint, body) => {
        if (!token) {
            setError("You must be logged in to do that.");
            throw new Error("User not authenticated");
        }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "An API error occurred.");
        return data;
    };

    const handleResumeUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await fetch(`${API_BASE_URL}/api/parse-resume`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to parse resume.');
            }

            setUserInfo(data.summary);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCoverLetterSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        resetState();
        try {
            const data = await makeAuthenticatedRequest('/api/generate', {
                job_description: jobDescription,
                user_info: userInfo,
                template: template,
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
                template: template,
            });
            if (data) setGeneratedBio(data.bio);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleValuateCvSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        resetState();
        try {
            const data = await makeAuthenticatedRequest('/api/valuate-cv', {
                cv_text: extractedCvText,
                job_description: jobDescription,
            });
            if (data) setValuationResult(JSON.parse(data));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCvUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setCvFile(file);
        setIsUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await fetch(`${API_BASE_URL}/api/parse-resume`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to parse resume.');
            }

            setExtractedCvText(data.summary);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsUploading(false);
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
            <main className="flex-grow pt-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                {isLoggedIn ? (
                    // --- LOGGED-IN VIEW ---
                    <div className="w-full max-w-5xl mt-8">
                        <div className="mb-6 flex border-b border-gray-700">
                            <button onClick={() => { setMode('coverLetter'); resetState(); }} className={`py-2 px-4 text-sm font-medium transition-colors ${mode === 'coverLetter' ? 'border-b-2 border-indigo-400 text-white' : 'text-gray-400 hover:text-white'}`}>
                                {t.coverLetterTitle || 'Cover Letter Generator'}
                            </button>
                            <button onClick={() => { setMode('bio'); resetState(); }} className={`py-2 px-4 text-sm font-medium transition-colors ${mode === 'bio' ? 'border-b-2 border-indigo-400 text-white' : 'text-gray-400 hover:text-white'}`}>
                                {t.bioTitle || 'LinkedIn Bio Generator'}
                            </button>
                            <button onClick={() => { setMode('cvValuator'); resetState(); }} className={`py-2 px-4 text-sm font-medium transition-colors ${mode === 'cvValuator' ? 'border-b-2 border-indigo-400 text-white' : 'text-gray-400 hover:text-white'}`}>
                                {t.cvValuatorTitle || 'CV Valuator'}
                            </button>
                        </div>
                        {mode === 'coverLetter' ? <CoverLetterForm t={t} jobDescription={jobDescription} setJobDescription={setJobDescription} userInfo={userInfo} setUserInfo={setUserInfo} template={template} setTemplate={setTemplate} handleSubmit={handleCoverLetterSubmit} isLoading={isLoading} isUploading={isUploading} handleResumeUpload={handleResumeUpload} activeTextArea={activeTextArea} setActiveTextArea={setActiveTextArea} isListening={isListening} startListening={startListening} stopListening={stopListening} hasRecognitionSupport={hasRecognitionSupport} /> : mode === 'bio' ? <BioForm t={t} userInfo={userInfo} setUserInfo={setUserInfo} template={template} setTemplate={setTemplate} handleSubmit={handleBioSubmit} isLoading={isLoading} isUploading={isUploading} handleResumeUpload={handleResumeUpload} activeTextArea={activeTextArea} setActiveTextArea={setActiveTextArea} isListening={isListening} startListening={startListening} stopListening={stopListening} hasRecognitionSupport={hasRecognitionSupport} /> : <CvValuatorForm t={t} jobDescription={jobDescription} setJobDescription={setJobDescription} handleSubmit={handleValuateCvSubmit} isLoading={isLoading} isUploading={isUploading} handleCvUpload={handleCvUpload} cvFile={cvFile} />}
                        {error && <div className="mt-4 rounded-md bg-red-900/50 p-3 text-sm text-red-300">{error}</div>}
                        {saveSuccess && <div className="mt-4 rounded-md bg-green-900/50 p-3 text-sm text-green-300">{saveSuccess}</div>}
                        
                        {isLoading && <ResultSkeleton />}

                        <AnimatePresence>
                            {!isLoading && valuationResult && (
                                <motion.div
                                    className="mt-10"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <ValuationResult result={valuationResult} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {!isLoading && (generatedLetter || generatedBio) && (
                                <motion.div 
                                    className="mt-10"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold">{mode === 'coverLetter' ? 'Generated Cover Letter' : 'Generated Bio'}</h2>
                                        <button onClick={handleSaveContent} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm font-medium">💾 Save</button>
                                    </div>
                                    <pre className="whitespace-pre-wrap rounded-md bg-gray-800 p-4 font-sans text-sm">{mode === 'coverLetter' ? generatedLetter : generatedBio}</pre>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    // --- LOGGED-OUT VIEW ---
                    <LandingPage />
                )}
            </main>
        </div>
    );
}