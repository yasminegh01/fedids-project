import React from 'react';
export default function StatCard({ label, value, onClick }) {
    return (
        <div className={`bg-white p-6 rounded-lg shadow-md text-center ${onClick ? 'cursor-pointer hover:bg-gray-50 transition' : ''}`}
            onClick={onClick}
        >
            <p className="text-sm text-gray-500 font-semibold uppercase">{label}</p>
            <p className="text-4xl font-bold mt-2 text-gray-800">{value}</p>
        </div>
    );
}