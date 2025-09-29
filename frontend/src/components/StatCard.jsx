import React from 'react';

export default function StatCard({ label, value, onClick, isClickable = false }) {
    // On définit les classes de base
    const baseClasses = "bg-bg-primary p-6 rounded-lg shadow-md text-center";
    
    // On ajoute des classes supplémentaires si la carte est cliquable
    const interactiveClasses = isClickable 
        ? "cursor-pointer hover:bg-bg-secondary hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300" 
        : "";

    return (
        <div 
            className={`${baseClasses} ${interactiveClasses}`}
            onClick={onClick}
        >
            <p className="text-sm text-text-secondary font-semibold uppercase tracking-wider">
                {label}
            </p>
            <p className="text-4xl font-bold mt-2 text-text-primary">
                {value ?? '...'}
            </p>
        </div>
    );
}