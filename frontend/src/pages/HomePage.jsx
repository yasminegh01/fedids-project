// frontend/src/pages/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">FedIds Security</h1>
        <div>
          <Link to="/login" className="font-semibold text-gray-600 hover:text-blue-600 mr-4">Login</Link>
          <Link to="/signup" className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">Sign Up</Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="text-center py-20 bg-white">
          <h2 className="text-5xl font-extrabold mb-4">Intelligent, Collaborative Security for your IIoT.</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Leveraging Federated Learning to detect intrusions without compromising your private data.
          </p>
          <Link to="/signup" className="bg-green-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-green-600">
            Get Started for Free
          </Link>
        </section>

        {/* Raspberry Pi Section */}
        <section className="py-16 px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                    <h3 className="text-3xl font-bold mb-4">Easy Deployment on Edge Devices</h3>
                    <p className="text-gray-600">
                        Our lightweight client is designed to run seamlessly on low-power edge devices like the Raspberry Pi.
                        Simply register your device on our platform, download the client script, and start contributing to a safer IIoT ecosystem.
                    </p>
                </div>
                <div>
                    {/* You can replace this with a real image of a Pi */}
                    <div className="bg-gray-200 h-64 w-full rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">Image of Raspberry Pi here</span>
                    </div>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}