// frontend/src/pages/UpgradeSuccessPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
export default function UpgradeSuccessPage() {
    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-green-600">Upgrade Successful!</h2>
            <p className="mt-4">You now have access to all premium features, including the Intelligent Prevention System.</p>
            <Link to="/dashboard/overview" className="inline-block mt-6 ... bg-green-600 text-white ...">Go to My Dashboard</Link>
        </div>
    );
}