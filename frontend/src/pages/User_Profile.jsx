// frontend/src/pages/User_Profile.jsx

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/apiClient";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function UserProfile() {
    const { user, refreshUser } = useAuth();

    // === L'ÉTAT DU FORMULAIRE INCLUT MAINTENANT TOUS LES CHAMPS ===
    const [formData, setFormData] = useState({
        username: "",
        full_name: "",
        company: "",
        country: "",
        job_title: ""
    });

    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", message: "" });
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                full_name: user.full_name || "",
                company: user.company || "",
                country: user.country || "",
                job_title: user.job_title || ""
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFeedback({ type: "", message: "" });
        try {
            const response = await apiClient.put("/api/users/me/profile", formData);
            refreshUser(response.data);
            setFeedback({ type: "success", message: "Profile updated successfully!" });
        } catch (err) {
            setFeedback({ type: "error", message: err.response?.data?.detail || "Failed to update profile." });
        } finally {
            setIsLoading(false);
        }
    };



  const handlePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const response = await apiClient.post(
        "/api/users/me/upload-picture",
        fd
      );
      refreshUser(response.data);
      setFeedback({
        type: "success",
        message: "Picture updated successfully!",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: "Failed to upload picture.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user)
    return <div className="text-center p-8">Loading profile...</div>;

  const profilePicUrl = user.profile_picture_url
    ? `${API_BASE_URL}${user.profile_picture_url}?t=${new Date().getTime()}`
    : `https://ui-avatars.com/api/?name=${user.username || "U"}&background=random&color=fff&bold=true`;

 // --- IL N'Y A MAINTENANT QU'UN SEUL RETURN ---
    return (
        <div className="max-w-4xl mx-auto p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Profile</h2>

            {feedback.message && (
                <div className={`p-3 rounded mb-6 text-center ${feedback.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {feedback.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* --- Colonne Photo --- */}
                <div className="md:col-span-1 text-center flex flex-col items-center bg-white p-6 rounded-lg shadow-md">
                    <img src={profilePicUrl} alt="Profile" className="w-40 h-40 rounded-full object-cover shadow-lg border-4 border-white" />
                    <input type="file" ref={fileInputRef} onChange={handlePictureChange} className="hidden" accept="image/*" />
                    <button onClick={() => fileInputRef.current.click()} disabled={isLoading} className="mt-4 px-5 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-50">
                        {isLoading ? "Processing..." : "Change Picture"}
                    </button>
                </div>

                {/* --- Formulaire d'Informations --- */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div>
                            <label className="text-sm font-semibold text-gray-500">Email (cannot be changed)</label>
                            <p className="text-lg font-medium text-gray-900">{user.email}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="username" className="block font-semibold text-gray-700">Username</label>
                                <input id="username" name="username" type="text" value={formData.username} onChange={handleInputChange} className="w-full p-3 border rounded-lg shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="full_name" className="block font-semibold text-gray-700">Full Name</label>
                                <input id="full_name" name="full_name" type="text" value={formData.full_name} onChange={handleInputChange} className="w-full p-3 border rounded-lg shadow-sm" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="company" className="block font-semibold text-gray-700">Company</label>
                                <input id="company" name="company" type="text" value={formData.company} onChange={handleInputChange} className="w-full p-3 border rounded-lg shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="job_title" className="block font-semibold text-gray-700">Job Title</label>
                                <input id="job_title" name="job_title" type="text" value={formData.job_title} onChange={handleInputChange} className="w-full p-3 border rounded-lg shadow-sm" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="country" className="block font-semibold text-gray-700">Country</label>
                            <input id="country" name="country" type="text" value={formData.country} onChange={handleInputChange} className="w-full p-3 border rounded-lg shadow-sm" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <label className="text-sm font-semibold text-gray-500">Role</label>
                                <p className="text-lg font-medium capitalize">{user.role}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500">Subscription Valid Until</label>
                                <p className="text-lg font-medium">
                                    {user.subscription_valid_until ? new Date(user.subscription_valid_until).toLocaleDateString() : "—"}
                                </p>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white px-5 py-3 rounded-lg shadow-md hover:bg-green-700 transition disabled:opacity-50">
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}