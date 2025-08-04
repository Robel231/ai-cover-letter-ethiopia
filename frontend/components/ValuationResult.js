'use client';

import { motion } from 'framer-motion';

const ValuationResult = ({ result }) => {
    if (!result) return null;

    const { matchScore, matchedKeywords, missingKeywords, suggestions } = result;

    const getScoreColor = (score) => {
        if (score >= 75) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <motion.div
            className="bg-gray-800/50 rounded-lg p-6 space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-2xl font-bold text-center text-white mb-4">CV Valuation Report</h2>

            <div className="text-center">
                <p className="text-lg text-gray-300">Match Score</p>
                <p className={`text-7xl font-bold ${getScoreColor(matchScore)}`}>{matchScore}%</p>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Matched Keywords</h3>
                <div className="flex flex-wrap gap-2">
                    {matchedKeywords.map((keyword, index) => (
                        <span key={index} className="bg-green-500/20 text-green-300 text-xs font-medium px-2.5 py-1 rounded-full">
                            {keyword}
                        </span>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                    {missingKeywords.map((keyword, index) => (
                        <span key={index} className="bg-yellow-500/20 text-yellow-300 text-xs font-medium px-2.5 py-1 rounded-full">
                            {keyword}
                        </span>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Suggestions for Improvement</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                    {suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
};

export default ValuationResult;
