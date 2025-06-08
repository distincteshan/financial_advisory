import React from 'react';
import Navbar from './NavBar';
import { motion } from 'framer-motion';
import { fadeIn } from '../utils/motion';

const TeamMember = ({ name, role, description, image }) => (
  <div className="bg-black/30 rounded-xl p-6 border border-gray-800 hover:border-indigo-500/30 transition-all duration-300 group">
    <div className="flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-4 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
          {name[0]}
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors duration-300">{name}</h3>
      <p className="text-indigo-400 mb-3">{role}</p>
    </div>
  </div>
);

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Eshan Deosatwar",
      role: "AI&DS",
    },
    {
      name: "Kaushik Khare",
      role: "AI&DS",
    },
    {
      name: "Sahil Rodge",
      role: "AI&DS",
    },
    {
      name: "Yash Bankar",
      role: "AI&DS",
    }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Complex Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10"></div>
      
      {/* Animated Gradient Orbs */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse -z-10"></div>
      <div className="fixed top-40 right-32 w-80 h-80 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000 -z-10"></div>
      <div className="fixed bottom-32 left-1/3 w-72 h-72 bg-gradient-to-r from-pink-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000 -z-10"></div>
      <div className="fixed bottom-20 right-20 w-64 h-64 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse delay-500 -z-10"></div>
      
      {/* Animated Mesh Gradient */}
      <div className="fixed inset-0 opacity-30 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-purple-500/5 to-transparent animate-pulse delay-1000"></div>
      </div>
      
      {/* Enhanced Dot Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] -z-10"></div>
      <div className="fixed inset-0 bg-[radial-gradient(rgba(139,92,246,0.1)_1px,transparent_1px)] bg-[size:80px_80px] animate-pulse -z-10"></div>
      
      {/* Floating Gradient Lines */}
      <div className="fixed top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent -z-10"></div>
      <div className="fixed top-3/4 right-0 w-full h-px bg-gradient-to-l from-transparent via-purple-500/20 to-transparent -z-10"></div>

      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Hero Section */}
        <motion.div 
          variants={fadeIn("up", 0.3)}
          initial="hidden"
          animate="show"
          className="text-center mb-20 relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>
          <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            About Us
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            We're a team of financial experts, data scientists, and technology innovators working 
            together to democratize advanced portfolio management strategies.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div 
          variants={fadeIn("up", 0.4)}
          initial="hidden"
          animate="show"
          className="bg-black/40 rounded-2xl p-8 mb-20 border border-gray-800"
        >
          <h2 className="text-3xl font-bold text-white mb-8 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Our Mission
          </h2>
          <div className="space-y-6 text-gray-400">
            <p>
              At AI Financial Advisor, we believe that sophisticated investment strategies shouldn't be 
              limited to institutional investors. Our mission is to make advanced portfolio optimization 
              accessible to individual investors through artificial intelligence and modern technology.
            </p>
            <p>
              We combine Nobel Prize-winning financial theories with cutting-edge AI to provide personalized 
              investment strategies that adapt to each investor's unique goals and risk tolerance.
            </p>
          </div>
        </motion.div>

        {/* What Sets Us Apart */}
        <motion.div 
          variants={fadeIn("up", 0.5)}
          initial="hidden"
          animate="show"
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-white mb-8 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            What Sets Us Apart
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/40 rounded-xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Advanced Technology</h3>
              <ul className="text-gray-400 space-y-3">
                <li className="flex items-center space-x-2">
                  <span className="text-indigo-400">•</span>
                  <span>AI-powered portfolio optimization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-indigo-400">•</span>
                  <span>Real-time market analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-indigo-400">•</span>
                  <span>Machine learning risk assessment</span>
                </li>
              </ul>
            </div>
            <div className="bg-black/40 rounded-xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Expert Knowledge</h3>
              <ul className="text-gray-400 space-y-3">
                <li className="flex items-center space-x-2">
                  <span className="text-indigo-400">•</span>
                  <span>Research-backed strategies</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-indigo-400">•</span>
                  <span>Decades of market experience</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-indigo-400">•</span>
                  <span>Continuous innovation</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div 
          variants={fadeIn("up", 0.6)}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-3xl font-bold text-white mb-8 bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent">
            Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <TeamMember key={index} {...member} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs; 