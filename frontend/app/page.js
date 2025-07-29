'use client';

import { useState } from 'react';
import { translations } from './translations.js';

// --- Reusable Form Components ---

const CoverLetterForm = ({ t, jobDescription, setJobDescription, userInfo, setUserInfo, handleSubmit, isLoading }) => (
  <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
    <div>
      <label htmlFor="job-desc" className="block text-sm font-medium leading-6 text-gray-300">{t.jobLabel}</label>
      <div className="mt-2">
        <textarea id="job-desc" rows={8} className="block w-full rounded-md border-0 bg-white/5 p-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500" placeholder={t.jobPlaceholder} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
      </div>
    </div>
    <div>
      <label htmlFor="user-info" className="block text-sm font-medium leading-6 text-gray-300">{t.userLabel}</label>
      <div className="mt-2">
        <textarea id="user-info" rows={8} className="block w-full rounded-md border-0 bg-white/5 p-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500" placeholder={t.userPlaceholder} value={userInfo} onChange={(e) => setUserInfo(e.target.value)} />
      </div>
    </div>
    <button type="submit" disabled={isLoading} className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:bg-gray-600 disabled:cursor-not-allowed">
      {isLoading ? t.buttonLoading : t.buttonText}
    </button>
  </form>
);

const BioForm = ({ t, userInfo, setUserInfo, tone, setTone, handleSubmit, isLoading }) => (
  <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
    <div>
      <label htmlFor="bio-user-info" className="block text-sm font-medium leading-6 text-gray-300">{t.bioUserLabel}</label>
      <div className="mt-2">
        <textarea id="bio-user-info" rows={8} className="block w-full rounded-md border-0 bg-white/5 p-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500" placeholder={t.bioUserPlaceholder} value={userInfo} onChange={(e) => setUserInfo(e.target.value)} />
      </div>
    </div>
    <div>
      <label htmlFor="tone" className="block text-sm font-medium leading-6 text-gray-300">{t.toneLabel}</label>
      <select id="tone" value={tone} onChange={(e) => setTone(e.target.value)} className="mt-2 block w-full rounded-md border-0 bg-white/5 py-2.5 pl-3 pr-10 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500">
        <option>Professional</option>
        <option>Casual</option>
        <option>Enthusiastic</option>
        <option>Formal</option>
      </select>
    </div>
    <button type="submit" disabled={isLoading} className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:bg-gray-600 disabled:cursor-not-allowed">
      {isLoading ? t.buttonLoading : t.generateBioButton}
    </button>
  </form>
);

// --- Main Page Component ---
export default function Home() {
  const [mode, setMode] = useState('coverLetter');
  const [jobDescription, setJobDescription] = useState('');
  const [userInfo, setUserInfo] = useState('');
  const [tone, setTone] = useState('Professional');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [generatedBio, setGeneratedBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en');
  const t = translations[language];

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const resetState = () => {
    setError('');
    setGeneratedLetter('');
    setGeneratedBio('');
  };

  const handleCoverLetterSubmit = async (e) => {
    e.preventDefault();
    if (!jobDescription || !userInfo) {
      setError(t.errorFields);
      return;
    }
    setIsLoading(true);
    resetState();
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_description: jobDescription,
          user_info: `${userInfo}\n\n**Note:** ${t.promptNote}`,
        }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setGeneratedLetter(data.cover_letter);
    } catch (err) {
      setError(t.error);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBioSubmit = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      setError(t.errorFields);
      return;
    }
    setIsLoading(true);
    resetState();
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-bio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_info: userInfo, tone: tone }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setGeneratedBio(data.bio);
    } catch (err) {
      setError(t.error);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-12 md:p-24 bg-gray-900 text-white">
      {/* Header and Language Switcher */}
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-8">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-600 bg-gradient-to-b from-gray-800 pb-6 pt-8 backdrop-blur-2xl text-white lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-700 lg:p-4">
          {t.title}
        </p>
        <div className="hidden lg:flex lg:items-center">
          <button onClick={() => setLanguage(language === 'en' ? 'am' : 'en')} className="rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-600">
            {language === 'en' ? 'Switch to አማርኛ' : 'Switch to English'}
          </button>
        </div>
      </div>
      <div className="lg:hidden w-full max-w-5xl flex justify-end mb-4">
        <button onClick={() => setLanguage(language === 'en' ? 'am' : 'en')} className="rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-600">
          {language === 'en' ? 'አማርኛ' : 'English'}
        </button>
      </div>

      <div className="w-full max-w-5xl">
        {/* Tab Navigation */}
        <div className="mb-6 flex border-b border-gray-700">
          <button onClick={() => { setMode('coverLetter'); resetState(); }} className={`py-2 px-4 text-sm font-medium transition-colors ${mode === 'coverLetter' ? 'border-b-2 border-indigo-400 text-white' : 'text-gray-400 hover:text-white'}`}>
            {t.coverLetterTitle}
          </button>
          <button onClick={() => { setMode('bio'); resetState(); }} className={`py-2 px-4 text-sm font-medium transition-colors ${mode === 'bio' ? 'border-b-2 border-indigo-400 text-white' : 'text-gray-400 hover:text-white'}`}>
            {t.bioTitle}
          </button>
        </div>

        {/* Conditional Form Rendering */}
        {mode === 'coverLetter' ? (
          <CoverLetterForm t={t} jobDescription={jobDescription} setJobDescription={setJobDescription} userInfo={userInfo} setUserInfo={setUserInfo} handleSubmit={handleCoverLetterSubmit} isLoading={isLoading} />
        ) : (
          <BioForm t={t} userInfo={userInfo} setUserInfo={setUserInfo} tone={tone} setTone={setTone} handleSubmit={handleBioSubmit} isLoading={isLoading} />
        )}

        {/* Error Message */}
        {error && <div className="mt-4 rounded-md bg-red-900/50 p-3 text-sm text-red-300">{error}</div>}

        {/* Conditional Result Display */}
        {generatedLetter && mode === 'coverLetter' && (
           <div className="mt-10 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">{t.resultTitle}</h2>
              <pre className="whitespace-pre-wrap rounded-md bg-gray-800 p-4 font-sans text-sm">{generatedLetter}</pre>
           </div>
        )}
        {generatedBio && mode === 'bio' && (
           <div className="mt-10 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">{t.bioTitle}</h2>
              <pre className="whitespace-pre-wrap rounded-md bg-gray-800 p-4 font-sans text-sm">{generatedBio}</pre>
           </div>
        )}
      </div>
    </main>
  );
}