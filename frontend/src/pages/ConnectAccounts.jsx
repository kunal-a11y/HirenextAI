import React, { useEffect, useState } from 'react';
import ChatLayout from '../components/layout/ChatLayout';
import { useTranslation } from '../hooks/useTranslation';
import { Link2, CheckCircle2, AlertCircle, Trash2, Mail, ExternalLink } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useUIStore from '../store/useUIStore';
import api from '../lib/api';

// Brand SVGs with their official colors
const LinkedInIcon = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const IndeedIcon = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.79 14.88H8.38V9.12h1.83v7.76zm.92-9.15c-.64 0-1.15-.51-1.15-1.15s.51-1.15 1.15-1.15 1.15.51 1.15 1.15-.51 1.15-1.15 1.15zm5.57 9.15h-1.83v-3.79c0-1.04-.84-1.88-1.88-1.88s-1.88.84-1.88 1.88v3.79H9.71V9.12h1.83v1.07c.45-.69 1.25-1.17 2.15-1.17 1.76 0 3.2 1.44 3.2 3.2v4.66z"/>
  </svg>
);

const NaukriIcon = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 10h-4v3H8V8h6c1.1 0 2 .9 2 2v1c0 1.1-.9 2-2 2zm0-3h-4v1h4v-1z" />
  </svg>
);

const ConnectAccounts = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, fetchMe } = useAuthStore();
  const { showToast } = useUIStore();

  const [indeedEmail, setIndeedEmail] = useState('');
  const [naukriEmail, setNaukriEmail] = useState('');
  const [isSavingIndeed, setIsSavingIndeed] = useState(false);
  const [isSavingNaukri, setIsSavingNaukri] = useState(false);

  useEffect(() => {
    if (user) {
      setIndeedEmail(user.indeedUrl || '');
      setNaukriEmail(user.naukriUrl || '');
    }
  }, [user]);

  useEffect(() => {
    if (new URLSearchParams(location.search).get('linkedin') === 'connected') {
      showToast('LinkedIn connected successfully');
      fetchMe();
    }
  }, [location.search, showToast, fetchMe]);

  const connectLinkedIn = () => {
    const token = localStorage.getItem('token');
    const API = import.meta.env.VITE_API_URL ?? '/api';
    const state = token ? `?state=${encodeURIComponent(token)}` : '';
    window.location.href = `${API}/auth/linkedin${state}`;
  };

  const saveIndeed = async (e) => {
    e.preventDefault();
    if (indeedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(indeedEmail)) {
      showToast('Please enter a valid Indeed email address');
      return;
    }
    setIsSavingIndeed(true);
    try {
      await api.put('/api/user/profile', { indeedUrl: indeedEmail });
      await fetchMe();
      showToast('Indeed email updated successfully');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update Indeed email');
    } finally {
      setIsSavingIndeed(false);
    }
  };

  const saveNaukri = async (e) => {
    e.preventDefault();
    if (naukriEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(naukriEmail)) {
      showToast('Please enter a valid Naukri email address');
      return;
    }
    setIsSavingNaukri(true);
    try {
      await api.put('/api/user/profile', { naukriUrl: naukriEmail });
      await fetchMe();
      showToast('Naukri email updated successfully');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update Naukri email');
    } finally {
      setIsSavingNaukri(false);
    }
  };

  const disconnectPlatform = async (platform) => {
    try {
      const payload = {};
      if (platform === 'linkedin') payload.linkedinUrl = '';
      if (platform === 'indeed') {
        payload.indeedUrl = '';
        setIndeedEmail('');
      }
      if (platform === 'naukri') {
        payload.naukriUrl = '';
        setNaukriEmail('');
      }

      await api.put('/api/user/profile', payload);
      await fetchMe();
      showToast(`${platform.charAt(0).toUpperCase() + platform.slice(1)} integration disconnected`);
    } catch (err) {
      showToast(`Failed to disconnect ${platform}`);
    }
  };

  return (
    <ChatLayout>
      <div className="flex-1 flex flex-col h-full bg-white animate-fade-in overflow-y-auto custom-scrollbar px-6 py-10 md:px-20 max-w-4xl mx-auto text-black">
        
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-2">
          <Link2 className="text-[#888888]" size={28} />
          <h1 className="text-3xl font-extrabold tracking-tight text-black">{t('connectYourAccounts')}</h1>
        </div>
        <p className="text-[#555555] text-sm mb-10 leading-relaxed max-w-2xl">
          Sync your job portal profiles and active application emails. HirenextAI will automatically monitor your messages, verify application status, and track your interview updates in one unified dashboard.
        </p>

        {/* Integration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LinkedIn Card */}
          <div className="p-6 bg-white border border-[#E0E0E0] rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all hover:border-[#C4C4C4]">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-[#0A66C2]">
                  <LinkedInIcon size={28} />
                </div>
                {user?.linkedinUrl ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold uppercase tracking-wider">
                    <CheckCircle2 size={13} />
                    Connected
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Not Connected
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-black mb-1">LinkedIn Profile</h3>
              <p className="text-xs text-[#555555] mb-4">
                Sync professional profile details, education, work history, and network applications.
              </p>

              {user?.linkedinUrl && (
                <div className="mb-6 p-3 bg-[#F7F7F7] border border-[#E0E0E0] rounded-xl flex items-center justify-between text-xs">
                  <div className="truncate text-[#555555] font-medium mr-2">
                    {user.linkedinUrl}
                  </div>
                  <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="text-[#0A66C2] hover:underline flex items-center gap-0.5 font-bold shrink-0">
                    View <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            <div className="mt-4">
              {user?.linkedinUrl ? (
                <button
                  onClick={() => disconnectPlatform('linkedin')}
                  className="w-full py-3 bg-[#FFFFFF] border border-[#E0E0E0] hover:border-[#C4C4C4] hover:bg-[#F2F2F2] text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Disconnect LinkedIn
                </button>
              ) : (
                <button
                  onClick={connectLinkedIn}
                  className="w-full py-3 bg-[#0A66C2] text-white hover:bg-[#004b93] font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <LinkedInIcon size={16} />
                  Connect LinkedIn
                </button>
              )}
            </div>
          </div>

          {/* Indeed Card */}
          <div className="p-6 bg-white border border-[#E0E0E0] rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all hover:border-[#C4C4C4]">
            <form onSubmit={saveIndeed} className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-[#003A9B]">
                    <IndeedIcon size={28} />
                  </div>
                  {user?.indeedUrl ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold uppercase tracking-wider">
                      <CheckCircle2 size={13} />
                      Connected
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Not Connected
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-black mb-1">Indeed Account</h3>
                <p className="text-xs text-[#555555] mb-4">
                  Add the email address associated with your Indeed profile to auto-sync applications.
                </p>

                <div className="mb-4 relative">
                  <Mail className="absolute left-3.5 top-3.5 text-[#888888]" size={16} />
                  <input
                    type="email"
                    value={indeedEmail}
                    onChange={(e) => setIndeedEmail(e.target.value)}
                    placeholder="indeed-email@domain.com"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E0E0E0] hover:border-[#C4C4C4] focus:border-black rounded-xl text-sm text-black placeholder-[#AAAAAA] focus:outline-none transition-all"
                  />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-800 leading-normal mb-6">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Important Note: </span>
                    Applications submitted via Indeed will sync automatically after forwarding your Indeed updates to this email.
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {user?.indeedUrl && (
                  <button
                    type="button"
                    onClick={() => disconnectPlatform('indeed')}
                    className="p-3 bg-[#FFFFFF] border border-[#E0E0E0] hover:border-[#C4C4C4] hover:bg-[#F2F2F2] text-black font-bold rounded-xl transition-all"
                    title="Disconnect Indeed"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSavingIndeed}
                  className="flex-1 py-3 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSavingIndeed ? 'Saving...' : 'Save Email'}
                </button>
              </div>
            </form>
          </div>

          {/* Naukri Card */}
          <div className="p-6 bg-white border border-[#E0E0E0] rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all hover:border-[#C4C4C4]">
            <form onSubmit={saveNaukri} className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 text-[#FF6F00]">
                    <NaukriIcon size={28} />
                  </div>
                  {user?.naukriUrl ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold uppercase tracking-wider">
                      <CheckCircle2 size={13} />
                      Connected
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Not Connected
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-black mb-1">Naukri Account</h3>
                <p className="text-xs text-[#555555] mb-4">
                  Add the email address associated with your Naukri profile to track applications.
                </p>

                <div className="mb-4 relative">
                  <Mail className="absolute left-3.5 top-3.5 text-[#888888]" size={16} />
                  <input
                    type="email"
                    value={naukriEmail}
                    onChange={(e) => setNaukriEmail(e.target.value)}
                    placeholder="naukri-email@domain.com"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E0E0E0] hover:border-[#C4C4C4] focus:border-black rounded-xl text-sm text-black placeholder-[#AAAAAA] focus:outline-none transition-all"
                  />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-800 leading-normal mb-6">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Important Note: </span>
                    Naukri notifications, profile views, and recruiter alerts will be linked to import active responses automatically.
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {user?.naukriUrl && (
                  <button
                    type="button"
                    onClick={() => disconnectPlatform('naukri')}
                    className="p-3 bg-[#FFFFFF] border border-[#E0E0E0] hover:border-[#C4C4C4] hover:bg-[#F2F2F2] text-black font-bold rounded-xl transition-all"
                    title="Disconnect Naukri"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSavingNaukri}
                  className="flex-1 py-3 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSavingNaukri ? 'Saving...' : 'Save Email'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </ChatLayout>
  );
};

export default ConnectAccounts;
