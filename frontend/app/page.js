'use client';

import { useState } from 'react';
import { translations } from './translations.js';

export default function Home() {
  // State variables for our form
  const [jobDescription, setJobDescription] = useState('');
  const [userInfo, setUserInfo] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // State for language and translation object
  const [language, setLanguage] = useState('en'); // 'en' or 'am'
  const t = translations[language]; // 't' will be our translation object

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    if (!jobDescription || !userInfo) {
      setError(t.errorFields);
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedLetter('');

    try {
      const response = await fetch('https://ai-cover-letter-backend.onrender.com/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_description: jobDescription,
          // Add a note to the AI if Amharic is selected
          user_info: `${userInfo}\n\n**Note:** ${t.promptNote}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedLetter(data.cover_letter);

    } catch (err) {
      setError(t.error);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-12 md:p-24 bg-gray-900 text-white">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-8">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-600 bg-gradient-to-b from-gray-800 pb-6 pt-8 backdrop-blur-2xl text-white lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-700 lg:p-4">
          {t.title}
        </p>
        <div className="hidden lg:flex lg:items-center">
            <button
                onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
                className="rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-600"
            >
                {language === 'en' ? 'Switch to አማርኛ' : 'Switch to English'}
            </button>
        </div>
      </div>
      
      {/* Mobile language switcher */}
      <div className="lg:hidden w-full max-w-5xl flex justify-end mb-4">
            <button
                onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
                className="rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-600"
            >
                {language === 'en' ? 'አማርኛ' : 'English'}
            </button>
        </div>

      <div className="w-full max-w-5xl">
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="job-desc" className="block text-sm font-medium leading-6 text-gray-300">
              {t.jobLabel}
            </label>
            <div className="mt-2">
              <textarea
                id="job-desc"
                name="job-desc"
                rows={8}
                className="block w-full rounded-md border-0 bg-white/5 p-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                placeholder={t.jobPlaceholder}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="user-info" className="block text-sm font-medium leading-6 text-gray-300">
              {t.userLabel}
            </label>
            <div className="mt-2">
              <textarea
                id="user-info"
                name="user-info"
                rows={8}
                className="block w-full rounded-md border-0 bg-white/5 p-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                placeholder={t.userPlaceholder}
                value={userInfo}
                onChange={(e) => setUserInfo(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? t.buttonLoading : t.buttonText}
          </button>
        </form>

        {/* Error Message */}
        {error && <div className="mt-4 rounded-md bg-red-900/50 p-3 text-sm text-red-300">{error}</div>}

        {/* Result Section */}
        {generatedLetter && (
          <div className="mt-10">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{t.resultTitle}</h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedLetter);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
                }}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-gray-700 hover:bg-gray-600"
              >
                {isCopied ? t.copied : t.copy}
              </button>
            </div>
            <pre className="mt-4 whitespace-pre-wrap rounded-md bg-gray-800 p-4 text-gray-300 font-sans text-sm">
              {generatedLetter}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}