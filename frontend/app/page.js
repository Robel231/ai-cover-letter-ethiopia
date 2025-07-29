'use client';

import { useState, useRef } from 'react';
import { translations } from './translations.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Home() {
  // State variables
  const [jobDescription, setJobDescription] = useState('');
  const [userInfo, setUserInfo] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const letterRef = useRef(null);

  // Language state
  const [language, setLanguage] = useState('en');
  const t = translations[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobDescription || !userInfo) {
      setError(t.errorFields);
      return;
    }
    setIsLoading(true);
    setError('');
    setGeneratedLetter('');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_description: jobDescription,
          user_info: `${userInfo}\n\n**Note:** ${t.promptNote}`,
        }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data && data.cover_letter) {
        setGeneratedLetter(data.cover_letter);
      } else {
        console.error("Backend response is missing 'cover_letter' key:", data);
        setError("Received an invalid response from the server.");
      }
    } catch (err) {
      setError(t.error);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const elementToCapture = letterRef.current;

    if (!elementToCapture) {
      console.error("Download failed: letter element ref not found.");
      return;
    }

    console.log("Starting PDF generation for element:", elementToCapture);

    html2canvas(elementToCapture, {
      allowTaint: true,
      useCORS: true,
      scale: 2,
      backgroundColor: '#1f2937',
    }).then((canvas) => {
        console.log("Canvas created successfully.");
        try {
          const imgData = canvas.toDataURL('image/png');
          
          const a4_width = 595.28;
          const a4_height = 841.89;
          
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4'
          });

          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const canvasAspectRatio = canvasWidth / canvasHeight;

          const margin = 40;
          const pdfImgWidth = a4_width - margin;
          const pdfImgHeight = pdfImgWidth / canvasAspectRatio;

          if (pdfImgHeight > a4_height - margin) {
            console.warn("Content might be too long for a single page.");
          }

          pdf.addImage(imgData, 'PNG', margin / 2, margin / 2, pdfImgWidth, pdfImgHeight);
          pdf.save('AI-Cover-Letter.pdf');
          console.log("PDF save function executed.");

        } catch (error) {
          console.error("Error during PDF generation (jsPDF part):", error);
        }
    }).catch((error) => {
      console.error("Error during html2canvas operation:", error);
    });
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
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="job-desc" className="block text-sm font-medium leading-6 text-gray-300">{t.jobLabel}</label>
            <div className="mt-2"><textarea id="job-desc" name="job-desc" rows={8} className="block w-full rounded-md border-0 bg-white/5 p-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500" placeholder={t.jobPlaceholder} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} /></div>
          </div>
          <div>
            <label htmlFor="user-info" className="block text-sm font-medium leading-6 text-gray-300">{t.userLabel}</label>
            <div className="mt-2"><textarea id="user-info" name="user-info" rows={8} className="block w-full rounded-md border-0 bg-white/5 p-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500" placeholder={t.userPlaceholder} value={userInfo} onChange={(e) => setUserInfo(e.target.value)} /></div>
          </div>
          <button type="submit" disabled={isLoading} className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:bg-gray-600 disabled:cursor-not-allowed">
            {isLoading ? t.buttonLoading : t.buttonText}
          </button>
        </form>

        {/* Error Message */}
        {error && <div className="mt-4 rounded-md bg-red-900/50 p-3 text-sm text-red-300">{error}</div>}

        {/* --- Result Section --- */}
        {generatedLetter && (
          <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t.resultTitle}</h2>
              <div className="flex items-center gap-2">
                <button onClick={handleDownloadPDF} className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-gray-700 hover:bg-gray-600" title="Download as PDF">{t.download}</button>
                <button onClick={() => { navigator.clipboard.writeText(generatedLetter); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }} className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-gray-700 hover:bg-gray-600">
                  {isCopied ? t.copied : t.copy}
                </button>
              </div>
            </div>
            {/* The ref is attached here */}
            <pre ref={letterRef} className="whitespace-pre-wrap rounded-md bg-gray-800 p-4 text-gray-300 font-sans text-sm">
              {generatedLetter}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}