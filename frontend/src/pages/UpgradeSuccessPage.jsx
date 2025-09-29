import React from 'react';
import { Link } from 'react-router-dom';

// Icône de coche
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 text-green-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

export default function UpgradeSuccessPage() {
    return (
        // Le conteneur principal utilise les couleurs du thème
        <div className="min-h-screen flex items-center justify-center bg-bg-secondary p-4">
            <div className="bg-bg-primary p-10 rounded-lg shadow-2xl text-center max-w-lg w-full">
                
                <div className="flex justify-center mb-6">
                    <CheckCircleIcon />
                </div>

                <h1 className="text-3xl font-bold text-green-500">Upgrade Successful!</h1>
                
                <p className="mt-4 text-text-secondary">
                    Welcome to Premium! You now have access to all exclusive features, 
                    including the Intelligent Prevention System and our advanced AI Assistant.
                </p>
                
                <Link 
                    to="/dashboard/overview" 
                    className="inline-block mt-8 px-8 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
                >
                    Go to My Dashboard
                </Link>
            </div>
        </div>
    );
}