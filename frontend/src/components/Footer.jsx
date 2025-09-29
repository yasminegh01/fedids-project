// frontend/src/components/Footer.jsx
import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white p-8 text-center">
            <p>&copy; {new Date().getFullYear()} FedIds Platform. All rights reserved.</p>
            <p className="text-sm text-gray-400 mt-2">A Project by Yasmine Gheribi</p>
        </footer>
    );
}