'use client';

import Link from 'next/link';
import { FaMagic, FaFileAlt, FaUserTie } from 'react-icons/fa';
import { FiLogIn, FiUserPlus } from 'react-icons/fi';

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-gray-800 p-6 rounded-lg text-center transform hover:scale-105 transition-transform duration-300">
        <div className="text-indigo-400 text-4xl mb-4 inline-block">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

const HowItWorksStep = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center">
        <div className="bg-gray-700 p-4 rounded-full text-indigo-400 text-3xl mb-4">{icon}</div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
    </div>
);

export default function LandingPage() {
    return (
        <div className="w-full animate-fade-in">
            {/* Hero Section */}
            <section className="text-center py-20">
                <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 text-transparent bg-clip-text animate-gradient-x">
                    Craft Your Career Story
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                    Instantly generate professional cover letters and LinkedIn bios tailored for the Ethiopian job market. Stop writing, start applying.
                </p>
                <div className="space-x-4">
                    <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-lg font-semibold transition-colors">
                        <FiUserPlus /> Get Started For Free
                    </Link>
                    <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-lg font-semibold transition-colors">
                        <FiLogIn /> Login
                    </Link>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20">
                 <h2 className="text-3xl font-bold text-center mb-12">How It Works in 3 Simple Steps</h2>
                 <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
                    <HowItWorksStep icon={<FaFileAlt />} title="1. Provide Context" description="Paste the job description and your skills or resume details." />
                    <HowItWorksStep icon={<FaMagic />} title="2. Click Generate" description="Our AI analyzes your input and crafts tailored, professional content." />
                    <HowItWorksStep icon={<FaUserTie />} title="3. Apply with Confidence" description="Save, edit, and use your new content to land your dream job." />
                 </div>
            </section>
            
            {/* Features Section */}
            <section className="py-20 bg-gray-900/50 rounded-lg">
                <h2 className="text-3xl font-bold text-center mb-12">Powerful Tools for Your Job Search</h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <FeatureCard icon={<FaFileAlt />} title="AI Cover Letters" description="Generate unique cover letters that match your skills to the job requirements." />
                    <FeatureCard icon={<FaUserTie />} title="LinkedIn Bios" description="Create a compelling 'About' section that highlights your expertise and passion." />
                    <FeatureCard icon={<FaMagic />} title="Save & Manage" description="Keep all your generated content in a personal dashboard to access anytime." />
                </div>
            </section>

            {/* Footer */}
            <footer className="text-center py-10 mt-20 border-t border-gray-800">
                <p className="text-gray-500">
                    © {new Date().getFullYear()} AI Job Tools. Made with ❤️ in Ethiopia 🇪🇹
                </p>
            </footer>
        </div>
    );
}