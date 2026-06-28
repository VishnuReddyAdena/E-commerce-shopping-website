import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { storageService } from '../services/storage';
import { User, Camera, Save, MapPin, Award, Wallet, Shield } from 'lucide-react';
import axios from 'axios';

export default function Profile() {
  const { user, token, setUser, addNotification, backendUrl } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [country, setCountry] = useState(user?.country || 'India');
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <p className="text-sm font-semibold">Please sign in to view your profile.</p>
      </div>
    );
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const response = await axios.put(`${backendUrl}/api/auth/profile`, {
        name,
        country
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setUser(response.data);
        addNotification('Profile updated successfully!', 'success');
      }
    } catch (err) {
      addNotification(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addNotification('Please select a valid image file', 'warning');
      return;
    }

    setUploadingAvatar(true);
    try {
      // 1. Upload to Supabase users storage bucket
      const { url } = await storageService.uploadToSupabase(file, 'users', `avatars/${user._id}`);
      
      // 2. Save public URL in MongoDB user profile
      const response = await axios.put(`${backendUrl}/api/auth/profile`, {
        avatarUrl: url
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setUser(response.data);
        addNotification('Profile picture updated!', 'success');
      }
    } catch (err) {
      addNotification('Avatar upload failed. Check bucket permissions.', 'error');
      console.error(err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="glass-card p-6 sm:p-8 border border-slate-200 shadow-xl rounded-[28px] bg-white">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          
          {/* Avatar Area */}
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
            </div>
            
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera className="w-6 h-6 text-white" />
            </div>

            {uploadingAvatar && (
              <div className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          {/* User Meta */}
          <div className="flex-1 text-center sm:text-left space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900">{user.name}</h3>
            <p className="text-slate-500 text-xs font-semibold">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Shield className="w-3.5 h-3.5 text-blue-650" />
                Role: <span className="capitalize">{user.role}</span>
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {user.country || 'India'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleUpdateProfile} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-800 text-sm font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-800 text-sm font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {updating ? 'Saving...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Wallet Balance</p>
            <p className="text-lg font-black text-slate-900">${user.walletBalance?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Loyalty Points</p>
            <p className="text-lg font-black text-slate-900">{user.loyaltyPoints || 0} pts</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Referral Code</p>
            <p className="text-sm font-black text-slate-800 tracking-wider uppercase">{user.referralCode || 'None'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
