'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaMagic, FaFileAlt, FaUserCircle, FaCloudUploadAlt, FaPaperPlane, FaBriefcase, FaBullseye } from 'react-icons/fa';
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
                    Stop Searching for Jobs. Let Them Find You.
                </motion.h1>
                <motion.p 
                    className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
                    variants={itemVariants}
                >
                    Our AI scrapes job channels like Afriwork, matches openings to your CV, and generates everything you need to apply in seconds.
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
                <h2 className="text-3xl font-bold text-center mb-12">The Future of Your Job Search is Here</h2>
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto px-4"
                    variants={containerVariants}
                >
                    <FeatureCard 
                        icon={<FaBriefcase />} 
                        title="AI Job Matcher" 
                        description="Get a personalized feed of jobs scraped directly from popular Ethiopian channels like Afriwork, automatically scored and ranked against your uploaded CV." 
                    />
                    <FeatureCard 
                        icon={<FaFileAlt />} 
                        title="In-Depth CV Analysis" 
                        description="Go beyond a simple match. Upload your CV and a job description to get a detailed report with keyword alignment and actionable suggestions." 
                    />
                    <FeatureCard 
                        icon={<FaMagic />} 
                        title="One-Click Applications" 
                        description="Found a good match? Instantly generate a tailored cover letter or a professional LinkedIn bio with a single click." 
                    />
                    <FeatureCard 
                        icon={<FaUserCircle />} 
                        title="Personal Content Hub" 
                        description="All your analyses and generated content are saved to a secure dashboard where you can view, edit, and delete them anytime." 
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
                 <h2 className="text-3xl font-bold text-center mb-12">Your Journey to the Perfect Job</h2>
                 <motion.div 
                    className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto"
                    variants={containerVariants}
                >
                    <HowItWorksStep 
                        icon={<FaCloudUploadAlt />} 
                        title="Step 1: Upload Your CV" 
                        description="Create your free account and upload your PDF resume. Our AI assistant will parse and understand your skills and experience." 
                    />
                    <HowItWorksStep 
                        icon={<FaBullseye />} 
                        title="Step 2: Get Your Matches" 
                        description="Browse a real-time feed of jobs automatically scored for you. See your best opportunities at a glance without any searching." 
                    />
                    <HowItWorksStep 
                        icon={<FaPaperPlane />} 
                        title="Step 3: Apply with AI" 
                        description="Select a high-match job and let our AI generate the perfect, tailored cover letter to complete your application." 
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