'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaMagic, FaFileAlt, FaUserTie, FaCloudUploadAlt, FaWpforms, FaSignInAlt } from 'react-icons/fa';
import { FiUserPlus } from 'react-icons/fi';

// Animation Variants
const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { type: 'spring', stiffness: 100 }
    },
};

const featureIconVariants = {
    hover: {
        scale: 1.2,
        rotate: 15,
        transition: { type: 'spring', stiffness: 300 },
    },
};

const FeatureCard = ({ icon, title, description }) => (
    <motion.div 
        className="bg-gray-800 p-6 rounded-lg text-center flex flex-col items-center shadow-lg" 
        variants={itemVariants}
    >
        <motion.div className="text-indigo-400 text-4xl mb-4" variants={featureIconVariants} whileHover="hover">
            {icon}
        </motion.div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </motion.div>
);

const HowItWorksStep = ({ icon, title, description }) => (
    <motion.div className="flex flex-col items-center text-center" variants={itemVariants}>
        <motion.div className="bg-gray-700 p-4 rounded-full text-indigo-400 text-3xl mb-4" whileHover={{ scale: 1.1, y: -5 }}>
            {icon}
        </motion.div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
    </motion.div>
);

export default function LandingPage() {
    return (
        <div className="w-full overflow-x-hidden">
            {/* Hero Section */}
            <motion.section 
                className="text-center py-20"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1 
                    className="text-5xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 text-transparent bg-clip-text animate-gradient-x"
                    variants={itemVariants}
                >
                    The Ultimate AI Assistant for Ethiopian Job Seekers
                </motion.h1>
                <motion.p 
                    className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
                    variants={itemVariants}
                >
                    Instantly craft tailored Cover Letters, generate professional LinkedIn Bios, and autofill forms with our AI Resume Parser.
                </motion.p>
                <motion.div variants={itemVariants}>
                    <Link href="/signup" passHref>
                        <motion.button 
                            className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 rounded-lg text-lg font-semibold transition-colors"
                            whileHover={{ scale: 1.05, backgroundColor: '#5a67d8' }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiUserPlus /> Get Started for Free
                        </motion.button>
                    </Link>
                </motion.div>
            </motion.section>

            {/* Features Section */}
            <motion.section 
                className="py-20 bg-gray-900/50 rounded-lg"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={containerVariants}
            >
                <h2 className="text-3xl font-bold text-center mb-12">A Suite of AI-Powered Tools to Elevate Your Job Hunt</h2>
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4"
                    variants={containerVariants}
                >
                    <FeatureCard 
                        icon={<FaFileAlt />} 
                        title="AI Cover Letter Generator" 
                        description="Tailor your application to any job by generating a unique cover letter that highlights your matching skills." 
                    />
                    <FeatureCard 
                        icon={<FaCloudUploadAlt />} 
                        title="AI Resume Parser" 
                        description="Save time and effort. Upload your PDF resume and let our AI instantly summarize and autofill your information." 
                    />
                    <FeatureCard 
                        icon={<FaUserTie />} 
                        title="LinkedIn Bio Generator" 
                        description="Craft a compelling and professional 'About' section for your LinkedIn profile in seconds." 
                    />
                    <FeatureCard 
                        icon={<FaWpforms />} 
                        title="Personal Dashboard" 
                        description="All your generated content is automatically saved to a secure, personal dashboard where you can view, edit, and delete it anytime." 
                    />
                </motion.div>
            </motion.section>

            {/* How It Works Section */}
            <motion.section 
                className="py-20"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={containerVariants}
            >
                 <h2 className="text-3xl font-bold text-center mb-12">Get Started in 3 Simple Steps</h2>
                 <motion.div 
                    className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto"
                    variants={containerVariants}
                >
                    <HowItWorksStep 
                        icon={<FaSignInAlt />} 
                        title="1. Sign Up" 
                        description="Create your free account in seconds." 
                    />
                    <HowItWorksStep 
                        icon={<FaCloudUploadAlt />} 
                        title="2. Upload or Input" 
                        description="Upload your resume or paste a job description." 
                    />
                    <HowItWorksStep 
                        icon={<FaMagic />} 
                        title="3. Generate" 
                        description="Instantly receive high-quality, AI-powered content." 
                    />
                 </motion.div>
            </motion.section>
            
            {/* Footer */}
            <footer className="text-center py-10 mt-20 border-t border-gray-800">
                <p className="text-gray-500">
                    © {new Date().getFullYear()} AI Cover Letter Ethiopia. All rights reserved.
                </p>
            </footer>
        </div>
    );
}