import { useEffect, useState } from 'react';
import {
  X,
  User,
  Sparkles,
  Palette,
  Bell,
  Shield,
  CreditCard,
  Keyboard,
  LogOut,
  Lock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useUIStore from '../../store/useUIStore';
import useUserStore from '../../store/useUserStore';
import useAuthStore from '../../store/useAuthStore';
import useChatStore from '../../store/useChatStore';
import useSettingsStore from '../../store/useSettingsStore';
import { AI_MODELS } from '../chat/ModelSelector';
import { getPlanDisplay, normalizePlan } from '../../lib/planUtils';
import api from '../../lib/api';

const LS = {
  displayName: 'hirenext_displayName',
  responseStyle: 'hirenext_responseStyle',
  autoSave: 'hirenext_autoSaveConversations',
  fontSize: 'hirenext_fontSize',
  sidebarCollapsed: 'hirenext_sidebarCollapsedDefault',
  showTimestamps: 'hirenext_showTimestamps',
  emailNotif: 'hirenext_emailNotifications',
  jobAlerts: 'hirenext_jobMatchAlerts',
  appUpdates: 'hirenext_applicationUpdates',
  weeklyDigest: 'hirenext_weeklyDigest',
  creditsUsed: 'hirenext_creditsUsed',
};

const NAV = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'ai', label: 'AI Preferences', icon: Sparkles },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Data', icon: Shield },
  { id: 'billing', label: 'Subscription', icon: CreditCard },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
];

const readBool = (key, def = true) => {
  const v = localStorage.getItem(key);
  if (v === null) return def;
  return v === 'true';
};

const SettingsModal = () => {
  const navigate = useNavigate();
  const { settingsModalOpen, setSettingsModalOpen, setPricingModalOpen, showToast } = useUIStore();
  const { user, setUser } = useUserStore();
  const { logout } = useAuthStore();
  const { chats, deleteChat, clearMessages } = useChatStore();
  const { aiLanguage, setAiLanguage } = useSettingsStore();
  const { setSidebarCollapsed } = useUIStore();

  const [section, setSection] = useState('profile');
  const [displayName, setDisplayName] = useState('');
  const [defaultModel, setDefaultModel] = useState(localStorage.getItem('selectedModel') || 'hirenext-flash');
  const [responseStyle, setResponseStyle] = useState('balanced');
  const [autoSave, setAutoSave] = useState(true);
  const [fontSize, setFontSize] = useState('medium');
  const [sidebarCollapsedDefault, setSidebarCollapsedDefault] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [appUpdates, setAppUpdates] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [confirmDeleteChats, setConfirmDeleteChats] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const creditsUsed = Number(localStorage.getItem(LS.creditsUsed) || '5');
  const creditsMax = 20;

  useEffect(() => {
    if (!settingsModalOpen) return;
    setDisplayName(
      localStorage.getItem(LS.displayName) || `${user.firstName} ${user.lastName}`.trim()
    );
    setResponseStyle(localStorage.getItem(LS.responseStyle) || 'balanced');
    setAutoSave(readBool(LS.autoSave, true));
    setFontSize(localStorage.getItem(LS.fontSize) || 'medium');
    setSidebarCollapsedDefault(readBool(LS.sidebarCollapsed, false));
    setShowTimestamps(readBool(LS.showTimestamps, false));
    setEmailNotif(readBool(LS.emailNotif, true));
    setJobAlerts(readBool(LS.jobAlerts, true));
    setAppUpdates(readBool(LS.appUpdates, true));
    setWeeklyDigest(readBool(LS.weeklyDigest, false));
    setDefaultModel(localStorage.getItem('selectedModel') || 'hirenext-flash');
  }, [settingsModalOpen, user.firstName, user.lastName]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSettingsModalOpen(false);
    };
    if (settingsModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [settingsModalOpen, setSettingsModalOpen]);

  if (!settingsModalOpen) return null;

  if (user?.demoMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="glass-card p-8 text-center max-w-sm border border-white/10 rounded-2xl bg-[#0f0f1a] shadow-2xl relative">
          <Lock className="w-10 h-10 text-[#8B5CF6] mb-4 mx-auto" />
          <h3 className="text-white font-bold mb-2 text-lg">Sign up to access settings</h3>
          <p className="text-white/50 text-sm mb-5">Create a free account to personalise your experience</p>
          <button
            onClick={() => {
              setSettingsModalOpen(false);
              navigate('/register');
            }}
            className="btn-primary w-full py-2.5 rounded-xl bg-[#8B5CF6] text-white text-sm font-semibold hover:bg-[#7c3aed] transition-all"
          >
            Sign Up Free
          </button>
          <button
            onClick={() => {
              setSettingsModalOpen(false);
              navigate('/login');
            }}
            className="btn-secondary mt-2 w-full py-2.5 rounded-xl border border-white/10 bg-transparent text-white text-sm font-semibold hover:bg-white/5 transition-all"
          >
            Log In
          </button>
          <button
            onClick={() => setSettingsModalOpen(false)}
            className="text-white/30 text-xs mt-4 block mx-auto hover:text-white/60 transition-colors"
          >
            Continue exploring
          </button>
        </div>
      </div>
    );
  }

  const saveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const res = await api.put('/api/user/profile', { displayName });
      const updatedUser = res.data.user;
      useAuthStore.getState().updateUser({
        name: updatedUser.name
      });
      showToast('Profile saved successfully');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('Passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    try {
      await api.put('/api/auth/change-password', { currentPassword, newPassword });
      showToast('Password changed successfully');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await api.get('/api/user/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `hirenextai-data-export.json`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Data exported successfully');
    } catch (err) {
      showToast('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await api.delete('/api/user/account');
      showToast('Account deleted successfully');
      setSettingsModalOpen(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const persistPref = (key, value) => localStorage.setItem(key, String(value));

  const handleDeleteAllChats = () => {
    chats.forEach((c) => deleteChat(c.id));
    clearMessages();
    setConfirmDeleteChats(false);
    showToast('All conversations deleted');
  };

  const Toggle = ({ checked, onChange, label }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-2"
    >
      <span className="text-[14px] text-white/80">{label}</span>
      <div
        className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-purple-500' : 'bg-white/15'}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'left-6' : 'left-1'}`}
        />
      </div>
    </button>
  );

  const StyleToggle = ({ value, options, onChange }) => (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
            value === opt.id
              ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40'
              : 'bg-white/[0.04] text-white/50 border border-white/10 hover:text-white/70'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (section) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-500/30 border-2 border-purple-500/50 flex items-center justify-center text-xl font-bold text-white">
                {(displayName || user.firstName || 'U')[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">{displayName || user.firstName}</p>
                <p className="text-[13px] text-white/40">{user.email || 'demo@hirenext.ai'}</p>
              </div>
            </div>
            <div>
              <label className="text-[13px] text-white/50 block mb-1.5">Display name</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/40"
              />
            </div>
            <div>
              <label className="text-[13px] text-white/50 block mb-1.5">Email</label>
              <input
                value={user.email || 'demo@hirenext.ai'}
                readOnly
                className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-white/40 text-sm cursor-not-allowed"
              />
            </div>
            {!showChangePassword ? (
              <button
                type="button"
                onClick={() => setShowChangePassword(true)}
                className="text-[13px] text-purple-400 hover:text-purple-300 block text-left"
              >
                Change password →
              </button>
            ) : (
              <form onSubmit={handleChangePasswordSubmit} className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-3.5">
                <h4 className="text-[13px] font-bold text-white">Change Password</h4>
                <div>
                  <label className="text-[11px] text-white/50 block mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500/40"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/50 block mb-1">New Password (min 8 chars)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500/40"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/50 block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500/40"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs font-semibold hover:bg-purple-500/30 transition-all"
                  >
                    {isChangingPassword ? 'Changing...' : 'Change password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                    }}
                    className="px-4 py-2 rounded-lg text-white/50 text-xs hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            <button
              type="button"
              disabled={isSavingProfile}
              onClick={saveProfile}
              className="px-5 py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-sm font-semibold hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingProfile ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">AI Preferences</h3>
            <div>
              <label className="text-[13px] text-white/50 block mb-1.5">Default AI model</label>
              <select
                value={defaultModel}
                onChange={(e) => {
                  setDefaultModel(e.target.value);
                  localStorage.setItem('selectedModel', e.target.value);
                }}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
              >
                {AI_MODELS.filter((m) => !m.disabled).map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#0f0f1a]">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[13px] text-white/50 block mb-1.5">Default language</label>
              <select
                value={aiLanguage}
                onChange={(e) => setAiLanguage(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
              >
                {['English', 'Hindi', 'Arabic', 'German', 'French', 'Spanish', 'Japanese'].map((l) => (
                  <option key={l} value={l} className="bg-[#0f0f1a]">
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[13px] text-white/50 block mb-2">Response style</label>
              <StyleToggle
                value={responseStyle}
                onChange={(v) => {
                  setResponseStyle(v);
                  persistPref(LS.responseStyle, v);
                }}
                options={[
                  { id: 'concise', label: 'Concise' },
                  { id: 'balanced', label: 'Balanced' },
                  { id: 'detailed', label: 'Detailed' },
                ]}
              />
            </div>
            <div className="border-t border-white/[0.06] pt-4">
              <Toggle
                label="Auto-save conversations"
                checked={autoSave}
                onChange={(v) => {
                  setAutoSave(v);
                  persistPref(LS.autoSave, v);
                }}
              />
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Appearance</h3>
            <div>
              <label className="text-[13px] text-white/50 block mb-2">Theme</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-[13px] font-medium bg-purple-500/20 text-purple-200 border border-purple-500/40"
                >
                  Dark
                </button>
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 rounded-lg text-[13px] text-white/25 border border-white/[0.06] cursor-not-allowed"
                >
                  Light — Coming Soon
                </button>
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 rounded-lg text-[13px] text-white/25 border border-white/[0.06] cursor-not-allowed"
                >
                  System — Coming Soon
                </button>
              </div>
            </div>
            <div>
              <label className="text-[13px] text-white/50 block mb-2">Font size</label>
              <StyleToggle
                value={fontSize}
                onChange={(v) => {
                  setFontSize(v);
                  persistPref(LS.fontSize, v);
                }}
                options={[
                  { id: 'small', label: 'Small' },
                  { id: 'medium', label: 'Medium' },
                  { id: 'large', label: 'Large' },
                ]}
              />
            </div>
            <div className="border-t border-white/[0.06] pt-2 space-y-1">
              <Toggle
                label="Sidebar collapsed by default"
                checked={sidebarCollapsedDefault}
                onChange={(v) => {
                  setSidebarCollapsedDefault(v);
                  persistPref(LS.sidebarCollapsed, v);
                  if (v) setSidebarCollapsed(true);
                }}
              />
              <Toggle
                label="Show timestamps on messages"
                checked={showTimestamps}
                onChange={(v) => {
                  setShowTimestamps(v);
                  persistPref(LS.showTimestamps, v);
                }}
              />
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-2">Notifications</h3>
            <Toggle
              label="Email notifications"
              checked={emailNotif}
              onChange={(v) => {
                setEmailNotif(v);
                persistPref(LS.emailNotif, v);
              }}
            />
            <Toggle
              label="Job match alerts"
              checked={jobAlerts}
              onChange={(v) => {
                setJobAlerts(v);
                persistPref(LS.jobAlerts, v);
              }}
            />
            <Toggle
              label="Application status updates"
              checked={appUpdates}
              onChange={(v) => {
                setAppUpdates(v);
                persistPref(LS.appUpdates, v);
              }}
            />
            <Toggle
              label="Weekly digest"
              checked={weeklyDigest}
              onChange={(v) => {
                setWeeklyDigest(v);
                persistPref(LS.weeklyDigest, v);
              }}
            />
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Privacy & Data</h3>
            <p className="text-[13px] text-white/50 leading-relaxed">
              We store your profile, chat history, job applications, and AI-generated files to provide
              HirenextAI services. Data is encrypted in transit and never sold to third parties.
            </p>
             <button
              type="button"
              onClick={handleExportData}
              className="w-full py-2.5 rounded-xl border border-white/15 text-white/80 text-sm hover:bg-white/[0.04]"
            >
              Export all my data
            </button>
            {!confirmDeleteChats ? (
              <button
                type="button"
                onClick={() => setConfirmDeleteChats(true)}
                className="w-full py-2.5 rounded-xl border border-amber-500/30 text-amber-400/90 text-sm hover:bg-amber-500/10"
              >
                Delete all conversations
              </button>
            ) : (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
                <p className="text-sm text-white/70 mb-3">Delete all chats permanently?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteAllChats}
                    className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 text-sm font-medium"
                  >
                    Yes, delete all
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteChats(false)}
                    className="px-4 py-2 rounded-lg text-white/50 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {!confirmDeleteAccount ? (
              <button
                type="button"
                onClick={() => setConfirmDeleteAccount(true)}
                className="w-full py-2.5 rounded-xl border border-red-500/40 text-red-400 text-sm hover:bg-red-500/10"
              >
                Delete account
              </button>
            ) : (
              <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 space-y-3">
                <p className="text-sm text-white/70">
                  This permanently deletes your account and all data. Cannot be undone.
                </p>
                <p className="text-xs text-white/50">
                  Please type <span className="text-red-400 font-bold">DELETE</span> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full bg-[#0a0a0f] border border-red-500/30 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-red-500/50"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 rounded-lg bg-red-600 disabled:bg-red-950/40 disabled:text-red-400/40 text-white text-sm font-medium transition-all"
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDeleteAccount(false);
                      setDeleteConfirmText('');
                    }}
                    className="px-4 py-2 rounded-lg text-white/50 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Subscription & Billing</h3>
            <div className="inline-flex px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
              {getPlanDisplay(user.plan)} — Current Plan
            </div>
            <div>
              <div className="flex justify-between text-[13px] text-white/60 mb-2">
                <span>AI credits this month</span>
                <span>
                  {creditsUsed}/{creditsMax} used
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  style={{ width: `${Math.min(100, (creditsUsed / creditsMax) * 100)}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSettingsModalOpen(false);
                setPricingModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold"
            >
              Upgrade plan
            </button>
            <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <p className="text-[13px] text-white/40">Billing history</p>
              <p className="text-[14px] text-white/60 mt-2">
                {normalizePlan(user.plan) === 'free' ? 'No billing history' : 'Invoices available on request.'}
              </p>
            </div>
          </div>
        );

      case 'shortcuts':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Keyboard Shortcuts</h3>
            {[
              ['New Chat', 'Ctrl+N'],
              ['Search', 'Ctrl+K'],
              ['Send message', 'Enter'],
              ['New line', 'Shift+Enter'],
              ['Close modal', 'Escape'],
            ].map(([label, keys]) => (
              <div
                key={label}
                className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
              >
                <span className="text-[14px] text-white/70">{label}</span>
                <kbd className="px-2 py-1 rounded-md bg-white/[0.06] border border-white/10 text-[12px] text-white/50 font-mono">
                  {keys}
                </kbd>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={() => setSettingsModalOpen(false)}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative w-full max-w-[800px] max-h-[85vh] flex rounded-2xl bg-[#0f0f1a] border border-white/10 shadow-2xl overflow-hidden"
      >
        <aside className="w-48 shrink-0 border-r border-white/[0.08] bg-[#0a0a0f] p-3 flex flex-col">
          <p className="text-[11px] uppercase tracking-wider text-white/30 px-3 py-2 mb-1">Settings</p>
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-all mb-0.5 ${
                section === item.id
                  ? 'bg-purple-500/15 text-purple-200'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={logout}
            className="mt-auto flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] text-red-400/80 hover:bg-red-500/10"
          >
            <LogOut size={16} />
            Log out
          </button>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-end px-4 py-3 border-b border-white/[0.06]">
            <button
              type="button"
              onClick={() => setSettingsModalOpen(false)}
              className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.06]"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={section}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;
