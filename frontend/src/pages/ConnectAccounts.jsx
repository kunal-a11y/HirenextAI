import React, { useEffect } from 'react';
import ChatLayout from '../components/layout/ChatLayout';
import { useTranslation } from '../hooks/useTranslation';
import { Link2, Globe } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useUIStore from '../store/useUIStore';

// Custom LinkedIn SVG icon (lucide-react v1.x does not include it)
const LinkedInIcon = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const ConnectAccounts = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, fetchMe } = useAuthStore();
  const { showToast } = useUIStore();

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
  
  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: LinkedInIcon, color: '#0077b5', connected: !!user?.linkedinUrl, action: connectLinkedIn },
    { id: 'indeed', name: 'Indeed', icon: Globe, color: '#2164f3', connected: !!user?.indeedUrl }
  ];

  return (
    <ChatLayout>
      <div className="flex-1 flex flex-col h-full bg-background animate-fade-in overflow-y-auto custom-scrollbar px-6 py-10 md:px-20 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Link2 className="text-white/40" size={24} />
          <h1 className="text-2xl font-bold text-white">{t('connectYourAccounts')}</h1>
        </div>
        <p className="text-text-secondary mb-10">Sync your profiles to automatically apply for jobs and track your applications.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platforms.map((platform) => (
            <div key={platform.id} className="p-6 bg-[#1a1a1a] border border-white/10 rounded-2xl flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-white/5 border border-white/6" style={{ color: platform.color }}>
                  <platform.icon size={24} />
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/6 text-[11px] text-white/40 font-medium uppercase tracking-wider">
                  {platform.connected ? 'Connected' : 'Not Connected'}
                </div>
              </div>
              
              <div>
                <h3 className="text-[17px] font-bold text-white mb-1">{platform.name}</h3>
                <p className="text-[13px] text-text-secondary">Sync your {platform.name} profile and job history.</p>
              </div>

              <button
                onClick={platform.action}
                disabled={!platform.action}
                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-[#e8e8e8] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {platform.action ? `Connect ${platform.name}` : 'Use Connect modal'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </ChatLayout>
  );
};

export default ConnectAccounts;
