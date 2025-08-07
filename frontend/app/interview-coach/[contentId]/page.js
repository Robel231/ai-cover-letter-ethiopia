'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Skeleton from '@/components/Skeleton';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';

const InterviewCoachPage = () => {
    const { isLoggedIn, token } = useAuth();
    const router = useRouter();
    const { contentId } = useParams();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [feedback, setFeedback] = useState({});
    const [isAnalyzing, setIsAnalyzing] = useState({});

    const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition();

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-cover-letter-backend.onrender.com';

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }

        const fetchContentAndGenerateQuestions = async () => {
            try {
                const contentRes = await fetch(`${API_BASE_URL}/api/content/${contentId}`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                if (!contentRes.ok) throw new Error('Failed to fetch content.');
                const contentData = await contentRes.json();

                const { original_cv_text, original_job_description } = contentData;

                if (!original_cv_text || !original_job_description) {
                    throw new Error("Could not find the required information in this saved item.");
                }

                const questionsRes = await fetch(`${API_BASE_URL}/api/generate-interview-questions`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ cv_text: original_cv_text, job_description: original_job_description })
                    });
                if (!questionsRes.ok) throw new Error('Failed to generate questions.');
                const questionsData = await questionsRes.json();
                setQuestions(questionsData.questions || []);

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (contentId) {
            fetchContentAndGenerateQuestions();
        }

    }, [contentId, isLoggedIn, router, token, API_BASE_URL]);

    useEffect(() => {
        if (transcript && activeQuestionIndex !== null) {
            setUserAnswers(prev => ({ ...prev, [activeQuestionIndex]: transcript }));
        }
    }, [transcript, activeQuestionIndex]);

    const handleToggleRecording = (index) => {
        if (isListening && activeQuestionIndex === index) {
            stopListening();
            getFeedbackForAnswer(index, userAnswers[index]);
        } else {
            setActiveQuestionIndex(index);
            startListening();
        }
    };

    const getFeedbackForAnswer = async (index, answer) => {
        if (!answer) return;
        setIsAnalyzing(prev => ({ ...prev, [index]: true }));
        try {
            const res = await fetch(`${API_BASE_URL}/api/analyze-interview-answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ question: questions[index], answer })
            });
            if (!res.ok) throw new Error('Failed to get feedback.');
            const data = await res.json();
            setFeedback(prev => ({ ...prev, [index]: data }));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsAnalyzing(prev => ({ ...prev, [index]: false }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="pt-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-indigo-600 text-transparent bg-clip-text">AI Interview Coach</h1>
                    
                    {isLoading ? (
                        <div>
                            <Skeleton className="h-8 w-3/4 mx-auto mb-6" />
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="bg-gray-800 p-4 rounded-lg">
                                        <Skeleton className="h-6 w-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-lg">
                            <p className="font-bold">An error occurred:</p>
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {questions.map((q, index) => (
                                <div key={index} className="bg-gray-800 p-5 rounded-lg shadow-lg">
                                    <p className="text-lg font-semibold">
                                        <span className="text-indigo-400">Question {index + 1}:</span> {q}
                                    </p>
                                    <div className="mt-4">
                                        <button 
                                            onClick={() => handleToggleRecording(index)}
                                            disabled={!hasRecognitionSupport}
                                            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${isListening && activeQuestionIndex === index ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'} disabled:bg-gray-500`}
                                        >
                                            {isListening && activeQuestionIndex === index ? '🛑 Stop Recording' : '🎤 Record Answer'}
                                        </button>
                                        {!hasRecognitionSupport && <p className="text-xs text-gray-400 mt-1">Speech recognition not supported in your browser.</p>}
                                    </div>
                                    {userAnswers[index] && (
                                        <div className="mt-4 p-3 bg-gray-700/50 rounded-md">
                                            <p className="text-gray-300">{userAnswers[index]}</p>
                                        </div>
                                    )}
                                    {isAnalyzing[index] && <p className="text-sm text-indigo-300 mt-2">Analyzing...</p>}
                                    {feedback[index] && (
                                        <div className="mt-4 space-y-3 text-sm">
                                            <div className="p-3 bg-green-900/30 rounded-md border border-green-700">
                                                <p><span className="font-bold text-green-400">👍 Positive Feedback:</span> {feedback[index].positive_feedback}</p>
                                            </div>
                                            <div className="p-3 bg-yellow-900/30 rounded-md border border-yellow-700">
                                                <p><span className="font-bold text-yellow-400">🤔 Constructive Feedback:</span> {feedback[index].constructive_feedback}</p>
                                            </div>
                                            <div className="p-3 bg-blue-900/30 rounded-md border border-blue-700">
                                                <p><span className="font-bold text-blue-400">💡 Example Improvement:</span> {feedback[index].example_improvement}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default InterviewCoachPage;
