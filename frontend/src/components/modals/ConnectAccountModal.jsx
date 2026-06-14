import { useEffect, useState } from 'react';
import { X, Search, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useUIStore from '../../store/useUIStore';
import useAuthStore from '../../store/useAuthStore';
import api from '../../lib/api';

const ConnectAccountModal = () => {
  const { connectModalOpen, setConnectModalOpen, showToast } = useUIStore();
  const { user, updateUser } = useAuthStore();
  
  const [search, setSearch] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [savingField, setSavingField] = useState(null);
  
  const [urls, setUrls] = useState({
    linkedinUrl: '',
    indeedUrl: '',
    naukriUrl: ''
  });
  
  const [tempUrls, setTempUrls] = useState({
    linkedinUrl: '',
    indeedUrl: '',
    naukriUrl: ''
  });

  const integrations = [
    {
      name: 'LinkedIn',
      description: 'AI uses your profile to find perfect job matches',
      placeholder: 'https://linkedin.com/in/your-username',
      instruction: 'Paste your LinkedIn profile URL. Go to LinkedIn → your profile → copy URL from browser bar. Example: https://linkedin.com/in/john-doe',
      field: 'linkedinUrl',
      logo: (
        <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10 rounded-xl shrink-0">
          <rect width="40" height="40" rx="8" fill="#0A66C2"/>
          <path d="M13.5 16.5h-3v9h3v-9zm-1.5-4.5a1.75 1.75 0 100 3.5 1.75 1.75 0 000-3.5zM27 16.5c-1.5 0-2.5.6-3 1.5v-1.5h-3v9h3v-4.5c0-1.5.75-2.25 2-2.25s2 .75 2 2.25V25.5h3v-5c0-2.5-1.5-4-4-4z" fill="white"/>
        </svg>
      )
    },
    {
      name: 'Indeed',
      description: 'Import your resume and sync past applications',
      placeholder: 'https://indeed.com/r/your-profile',
      instruction: 'Log into Indeed → go to your profile page → copy the URL from browser. Example: https://indeed.com/r/john-doe-123',
      field: 'indeedUrl',
      logo: (
        <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10 rounded-xl shrink-0">
          <rect width="40" height="40" rx="8" fill="#003A9B"/>
          <text x="20" y="27" text-anchor="middle" font-size="20" font-weight="bold" fill="white">in</text>
        </svg>
      )
    },
    {
      name: 'Naukri',
      description: 'Best for India jobs — AI optimizes for Indian market',
      placeholder: 'https://naukri.com/mnjuser/profile',
      instruction: 'Log into Naukri.com → click your profile photo → My Naukri → copy the URL from browser bar',
      field: 'naukriUrl',
      logo: (
        <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10 rounded-xl shrink-0">
          <rect width="40" height="40" rx="8" fill="#FF7555"/>
          <text x="20" y="27" text-anchor="middle" font-size="13" font-weight="bold" fill="white">Naukri</text>
        </svg>
      )
    }
  ];

  const validateProfileUrl = (fieldName, value) => {
    const trimmed = String(value || '').trim();
    if (!trimmed) return 'Profile URL is required.';

    let url;
    try {
      url = new URL(trimmed);
    } catch {
      return 'Enter a valid profile URL.';
    }

    const host = url.hostname.toLowerCase();
    const path = url.pathname;
    if (fieldName === 'linkedinUrl' && !(host.endsWith('linkedin.com') && /^\/in\/[^/?#]+\/?$/i.test(path))) {
      return 'Enter a valid LinkedIn profile URL, like https://linkedin.com/in/your-name.';
    }
    if (fieldName === 'indeedUrl' && !(host.endsWith('indeed.com') && path.length > 1)) {
      return 'Enter a valid Indeed profile URL.';
    }
    if (fieldName === 'naukriUrl' && !(host.endsWith('naukri.com') && path.length > 1)) {
      return 'Enter a valid Naukri profile URL.';
    }

    return '';
  };

  const handleLinkedInOAuth = () => {
    const token = localStorage.getItem('token');
    const API = import.meta.env.VITE_API_URL ?? '/api';
    const state = token ? `?state=${encodeURIComponent(token)}` : '';
    window.location.href = `${API}/auth/linkedin${state}`;
  };

  useEffect(() => {
    const loadProfileData = async () => {
      let loadedUrls = {
        linkedinUrl: '',
        indeedUrl: '',
        naukriUrl: ''
      };
      
      try {
        const res = await api.get('/api/user/me');
        const data = res.data;
        loadedUrls = {
          linkedinUrl: data.linkedinUrl || '',
          indeedUrl: data.indeedUrl || '',
          naukriUrl: data.naukriUrl || ''
        };
      } catch (err) {
        console.error('Failed to fetch from backend, checking fallback...', err);
        if (user) {
          loadedUrls = {
            linkedinUrl: user.linkedinUrl || '',
            indeedUrl: user.indeedUrl || '',
            naukriUrl: user.naukriUrl || ''
          };
        }
      }
      
      try {
        const cached = localStorage.getItem('userProfiles');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (!loadedUrls.linkedinUrl && parsed.linkedinUrl) loadedUrls.linkedinUrl = parsed.linkedinUrl;
          if (!loadedUrls.indeedUrl && parsed.indeedUrl) loadedUrls.indeedUrl = parsed.indeedUrl;
          if (!loadedUrls.naukriUrl && parsed.naukriUrl) loadedUrls.naukriUrl = parsed.naukriUrl;
        }
      } catch (e) {
        console.error('LocalStorage parse error:', e);
      }
      
      setUrls(loadedUrls);
      setTempUrls(loadedUrls);
    };
    
    if (connectModalOpen) {
      loadProfileData();
    }
  }, [connectModalOpen, user]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') setConnectModalOpen(false);
    };
    if (connectModalOpen) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [connectModalOpen, setConnectModalOpen]);

  const handleSave = async (fieldName, platformName) => {
    const value = tempUrls[fieldName] || '';
    const validationError = validateProfileUrl(fieldName, value);
    if (validationError) {
      showToast(validationError);
      return;
    }
    setSavingField(fieldName);
    try {
      const res = await api.put('/api/user/profile', {
        [fieldName]: value
      });
      
      const updatedUrls = { ...urls, [fieldName]: value };
      setUrls(updatedUrls);
      
      localStorage.setItem('userProfiles', JSON.stringify(updatedUrls));
      
      if (res.data && res.data.user) {
        updateUser(res.data.user);
      }
      
      setEditingField(null);
      showToast(`${platformName} connected! ✓`);
    } catch (err) {
      console.error(`Error saving ${fieldName}:`, err);
      showToast(err.response?.data?.error || `Failed to connect ${platformName}`);
    } finally {
      setSavingField(null);
    }
  };

  const filtered = integrations.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {connectModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] bg-black/75 backdrop-blur-md"
            onClick={() => setConnectModalOpen(false)}
          />
          <div className="fixed inset-0 z-[3001] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="pointer-events-auto w-full max-w-lg flex flex-col rounded-2xl border border-white/10 bg-[#0d0d16] shadow-2xl overflow-hidden max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex flex-col px-6 pt-6 pb-4 border-b border-white/[0.06] shrink-0 gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Connect Your Profiles</h2>
                    <p className="text-[13px] text-white/40 mt-0.5 leading-relaxed">
                      Power up HirenextAI with your job profiles. The more you connect, the smarter your AI gets.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConnectModalOpen(false)}
                    className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0 ml-4"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search integrations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-[#8B5CF6]/50 focus:outline-none transition-all placeholder:text-white/20"
                  />
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {filtered.length === 0 ? (
                  <div className="text-center py-8 text-white/30 text-sm">
                    No integrations found
                  </div>
                ) : (
                  filtered.map((item) => {
                    const isConnected = !!urls[item.field];
                    const isExpanded = editingField === item.field;
                    
                    return (
                      <div key={item.field} className="glass-card p-5 relative overflow-hidden">
                        {/* Row 1 */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            {item.logo}
                            <div className="min-w-0">
                              <h4 className="font-bold text-white text-base truncate">{item.name}</h4>
                              <p className="text-white/40 text-xs truncate">{item.description}</p>
                            </div>
                          </div>
                          
                          <div className="shrink-0">
                            {!isConnected ? (
                              <button
                                type="button"
                                onClick={() => setEditingField(isExpanded ? null : item.field)}
                                className="bg-[#8B5CF6] hover:bg-[#7c3aed] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                              >
                                Connect
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs">
                                  Connected
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingField(isExpanded ? null : item.field)}
                                  className="text-white/40 text-xs hover:text-white transition-colors"
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Row 2 */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t border-white/8">
                                <p className="text-white/50 text-xs mb-3">{item.instruction}</p>
                                {item.field === 'linkedinUrl' && (
                                  <button
                                    type="button"
                                    onClick={handleLinkedInOAuth}
                                    className="mb-3 w-full bg-[#0A66C2] hover:bg-[#0858a8] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                                  >
                                    Connect with LinkedIn OAuth
                                  </button>
                                )}
                                <div className="flex gap-2">
                                  <input
                                    type="url"
                                    placeholder={item.placeholder}
                                    value={tempUrls[item.field] || ''}
                                    onChange={(e) =>
                                      setTempUrls((prev) => ({
                                        ...prev,
                                        [item.field]: e.target.value
                                      }))
                                    }
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#8B5CF6]/50 outline-none placeholder:text-white/20"
                                  />
                                  <button
                                    type="button"
                                    disabled={savingField === item.field}
                                    onClick={() => handleSave(item.field, item.name)}
                                    className="bg-[#8B5CF6] hover:bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shrink-0 flex items-center justify-center min-w-[70px]"
                                  >
                                    {savingField === item.field ? (
                                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                      'Save'
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTempUrls((prev) => ({ ...prev, [item.field]: urls[item.field] || '' }));
                                      setEditingField(null);
                                    }}
                                    className="border border-white/10 bg-white/5 text-white/60 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}

                {/* Bottom Info Box */}
                <div className="mt-6 p-4 rounded-xl bg-[#8B5CF6]/8 border border-[#8B5CF6]/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-[#8B5CF6] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-white text-sm mb-1">Why connect your profiles?</p>
                      <p className="text-white/50 text-xs leading-relaxed">
                        The more profiles you connect, the better HirenextAI understands 
                        your background. AI will use your LinkedIn experience and job history 
                        to write better cover letters, find more relevant jobs, and auto-fill 
                        applications more accurately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Scrollbar Custom Styling */}
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 99px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConnectAccountModal;
