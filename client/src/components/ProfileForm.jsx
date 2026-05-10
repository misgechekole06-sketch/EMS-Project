import { Loader2, Save, User } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const ProfileForm = ({ initialData, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        setError("");
        setMessage("");
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        const formData = new FormData(e.currentTarget);
        const data = {
            bio: formData.get("bio")
        };

        try {
            const res = await api.post("/profile", data);

            if (res.status >= 200 && res.status < 300) {
                setMessage("Profile updated successfully");

                setTimeout(() => {
                    onSuccess?.();
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update profile");
            console.error("Update Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='card p-5 sm:p-6 mb-6 bg-white shadow-sm rounded-xl border border-slate-100'>
            <h2 className='text-base font-medium text-slate-900 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2'>
                <User className='w-5 h-5 text-slate-400' /> Public Profile
            </h2>

            {error && (
                <div className='bg-rose-50 text-rose-700 p-4 rounded-xl text-sm border border-rose-200 mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-1'>
                    <div className='w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0' />
                    {error}
                </div>
            )}
            {message && (
                <div className='bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm border border-emerald-200 mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-1'>
                    <div className='w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0' />
                    {message}
                </div>
            )}

            <div className='space-y-5'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                        <input 
                            disabled 
                            value={`${initialData?.firstName || ""} ${initialData?.lastName || ""}`} 
                            className='w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed outline-none' 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                        <input 
                            disabled 
                            value={initialData?.email || ""} 
                            className='w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed outline-none' 
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                    <textarea 
                        name="bio"
                        defaultValue={initialData?.bio || ""}
                        placeholder='Write a brief bio...'
                        disabled={initialData?.isDeleted || loading}
                        className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px] transition-all resize-none ${
                            initialData?.isDeleted ? "bg-slate-50 cursor-not-allowed" : "bg-white"
                        }`}
                    />
                </div>

                {!initialData?.isDeleted && (
                    <div className='flex justify-end pt-2'>
                        <button 
                            className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-all shadow-sm'
                            type='submit' 
                            disabled={loading}
                        >
                            {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
                            Save Changes
                        </button>
                    </div>
                )}
            </div>
        </form>
    );
};

export default ProfileForm;