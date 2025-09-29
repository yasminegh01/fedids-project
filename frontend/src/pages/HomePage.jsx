// frontend/src/pages/HomePage.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Variante pour les animations "fade in"
const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.6, ease: "easeOut" } 
    }
};

export default function HomePage() {
    return (
        <div className="bg-gray-800 text-white">
            <Header />

            {/* --- Section Héros avec Vidéo --- */}
            <section className="min-h-screen flex flex-col justify-center items-center text-center p-5 relative overflow-hidden">
                <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="absolute top-0 left-0 w-full h-full object-cover z-0"
                >
                    <source src="/hero-background.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                
                <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
                
                <div className="relative z-20">
                    <motion.h1 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-extrabold"
                    >
                        Intelligent IIoT Security, <br /> Powered by the Collective.
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mt-6 max-w-2xl text-lg text-gray-200"
                    >
                        FedIds utilizes Federated Learning to create a smarter, decentralized Intrusion Detection System that learns from threats without compromising your data.
                    </motion.p>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="mt-8"
                    >
                        <Link to="/signup" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-blue-700 transition">
                            Get Started
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* --- Section Fonctionnalités --- */}
            <section className="py-20 px-5 bg-gray-900">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeIn}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-bold">Why FedIds?</h2>
                    <p className="text-gray-400 mt-2">A new paradigm in industrial cybersecurity.</p>
                </motion.div>
                
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ staggerChildren: 0.2 }}
                    className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8"
                >
                    <motion.div variants={fadeIn} className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="font-bold text-xl mb-2">Privacy-Preserving AI</h3>
                        <p className="text-gray-400">Models are trained locally on your devices. Your sensitive industrial data never leaves your network.</p>
                    </motion.div>
                    <motion.div variants={fadeIn} className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="font-bold text-xl mb-2">Collective Intelligence</h3>
                        <p className="text-gray-400">Benefit from threat intelligence learned across the entire network of devices, creating a stronger, constantly evolving defense.</p>
                    </motion.div>
                    <motion.div variants={fadeIn} className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="font-bold text-xl mb-2">Real-time Monitoring</h3>
                        <p className="text-gray-400">Visualize global threats on an interactive map and receive instant alerts and actionable advice from our specialized AI assistant.</p>
                    </motion.div>
                </motion.div>
            </section>

            {/* === NOUVELLE SECTION "HOW IT WORKS" === */}
            <section className="py-20 px-5">
                <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
                    variants={fadeIn} className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold">A Simple, Powerful Process</h2>
                    <p className="text-gray-400 mt-2">Decentralized security in four steps.</p>
                </motion.div>
                
                <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
                    transition={{ staggerChildren: 0.2 }}
                    className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-center"
                >
                    <motion.div variants={fadeIn}>
                        <div className="bg-blue-500/10 text-blue-400 p-4 rounded-full inline-block">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-xl mt-4 mb-2">1. Deploy</h3>
                        <p className="text-gray-400">Install our lightweight client on your edge devices with a single command line.</p>
                    </motion.div>
                    <motion.div variants={fadeIn}>
                        <div className="bg-blue-500/10 text-blue-400 p-4 rounded-full inline-block">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-xl mt-4 mb-2">2. Learn</h3>
                        <p className="text-gray-400">The model improves locally on your private data, which never leaves your network.</p>
                    </motion.div>
                    <motion.div variants={fadeIn}>
                        <div className="bg-blue-500/10 text-blue-400 p-4 rounded-full inline-block">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-xl mt-4 mb-2">3. Share</h3>
                        <p className="text-gray-400">Only anonymous model improvements are shared to strengthen the global model.</p>
                    </motion.div>
                    <motion.div variants={fadeIn}>
                        <div className="bg-blue-500/10 text-blue-400 p-4 rounded-full inline-block">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-xl mt-4 mb-2">4. Protect</h3>
                        <p className="text-gray-400">Benefit from real-time protection, enhanced by the collective intelligence of the entire network.</p>
                    </motion.div>
                </motion.div>
            </section>
            
            <Footer />
        </div>
    );
}