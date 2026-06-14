import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Users, 
  Megaphone, 
  Activity, 
  MessageSquare, 
  Mail, 
  Copy, 
  ExternalLink, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Trash2, 
  UserCheck, 
  LogOut, 
  Eye, 
  Shield,
  Lock
} from 'lucide-react';
import useUserStore from '../store/useUserStore';
import useUIStore from '../store/useUIStore';
import api from '../lib/api';

const envEmails = ('')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

const ADMIN_EMAILS = ['demo@hirenextai.com', 'your-real-email@gmail.com', ...envEmails];

const AdminPanel = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const { showToast } = useUIStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = (user?.email || '').toLowerCase();
    const isAdmin = user?.role === 'admin' || ADMIN_EMAILS.includes(email);
    if (!token || !isAdmin) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);
  
  // Admin PIN Gate states
  const [pinArray, setPinArray] = useState(Array(4).fill(""));
  const pinRefs = useRef([]);
  const [isPinVerified, setIsPinVerified] = useState(() => {
    return sessionStorage.getItem('admin_pin_verified') === 'true';
  });
  const [pinError, setPinError] = useState("");
  const [shake, setShake] = useState(false);
  const [pinAttempts, setPinAttempts] = useState(0);
  const [pinLocked, setPinLocked] = useState(
    () => sessionStorage.getItem('admin_pin_locked') === 'true'
  );

  const verifyPin = (pinCode) => {
    if (pinLocked) {
      setPinError('Too many failed attempts. Refresh the page to try again.');
      return;
    }

    setPinError("");
    const correctPin = import.meta.env.VITE_ADMIN_PIN || process.env.ADMIN_PIN || '0001';
    if (pinCode === correctPin) {
      sessionStorage.setItem('admin_pin_verified', 'true');
      sessionStorage.removeItem('admin_pin_locked');
      setPinAttempts(0);
      setIsPinVerified(true);
      showToast('Admin panel unlocked');
    } else {
      const nextAttempts = pinAttempts + 1;
      setPinAttempts(nextAttempts);
      setPinError(
        nextAttempts >= 3
          ? 'Too many failed attempts. Access locked for this session.'
          : `Invalid Admin PIN (${nextAttempts}/3)`
      );
      setPinArray(Array(4).fill(""));
      setShake(true);
      setTimeout(() => setShake(false), 400);
      pinRefs.current[0]?.focus();
      if (nextAttempts >= 3) {
        sessionStorage.setItem('admin_pin_locked', 'true');
        setPinLocked(true);
      }
    }
  };

  const handlePinChange = (value, index) => {
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue) {
      const newPinArray = [...pinArray];
      newPinArray[index] = "";
      setPinArray(newPinArray);
      return;
    }

    const newPinArray = [...pinArray];
    if (cleanValue.length > 1) {
      const pastedDigits = cleanValue.slice(0, 4).split("");
      for (let i = 0; i < 4; i++) {
        if (pastedDigits[i]) {
          newPinArray[i] = pastedDigits[i];
        }
      }
      setPinArray(newPinArray);
      const combined = newPinArray.join("");
      if (combined.length === 4) {
        verifyPin(combined);
      }
      const targetIndex = Math.min(pastedDigits.length - 1, 3);
      pinRefs.current[targetIndex]?.focus();
      return;
    }

    newPinArray[index] = cleanValue;
    setPinArray(newPinArray);
    setPinError("");

    const combined = newPinArray.join("");
    if (combined.length === 4) {
      verifyPin(combined);
    } else if (index < 3) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newPinArray = [...pinArray];
      if (newPinArray[index]) {
        newPinArray[index] = "";
        setPinArray(newPinArray);
      } else if (index > 0) {
        pinRefs.current[index - 1]?.focus();
        newPinArray[index - 1] = "";
        setPinArray(newPinArray);
      }
    }
  };


  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard & Users Tab Stats / Data
  const [stats, setStats] = useState({ totalUsers: 0, activeToday: 0, totalChats: 0, emailsSent: 0 });
  const [users, setUsers] = useState([]);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [announcementTarget, setAnnouncementTarget] = useState('all');
  const [selectedSpecificPlan, setSelectedSpecificPlan] = useState('pro');

  // User Drawer details
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // Confirm delete modal
  const [deleteUserId, setDeleteUserId] = useState(null);

  // Announcement Form states
  const [announcement, setAnnouncement] = useState({
    subject: '',
    message: '',
    ctaText: '',
    ctaUrl: ''
  });
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);
  const [sendingProgress, setSendingProgress] = useState({ sent: 0, total: 0 });

  // Export emails states
  const [exportedEmails, setExportedEmails] = useState('');
  const [exportedCount, setExportedCount] = useState(0);
  const [showEmailsArea, setShowEmailsArea] = useState(false);

  // Messages Tab states
  const [messages, setMessages] = useState([]);
  const [messagesTotalCount, setMessagesTotalCount] = useState(0);
  const [messagesTotalPages, setMessagesTotalPages] = useState(1);
  const [messagesCurrentPage, setMessagesCurrentPage] = useState(1);
  const [messagesStatusFilter, setMessagesStatusFilter] = useState('all');
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showReplyDrawer, setShowReplyDrawer] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [customEmail, setCustomEmail] = useState({ toEmail: '', subject: '', message: '' });
  const [isSendingCustomEmail, setIsSendingCustomEmail] = useState(false);

  // Load Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Load Users List
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/admin/users', {
        params: {
          page: currentPage,
          limit: 10,
          plan: planFilter,
          search: searchQuery
        }
      });
      
      const mappedUsers = res.data.users.map(u => {
        const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
        const displayName = fullName || u.name || (u.email ? u.email.split('@')[0] : 'User');
        
        // Active in last 7 days calculation
        const lastActive = u.updatedAt ? new Date(u.updatedAt) : new Date(u.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const status = lastActive >= sevenDaysAgo ? 'Active' : 'Inactive';
        
        return {
          ...u,
          displayName,
          status
        };
      });

      let fetchedUsers = mappedUsers;
      if (statusFilter !== '') {
        fetchedUsers = fetchedUsers.filter(u => u.status === statusFilter);
      }
      
      setUsers(fetchedUsers);
      setTotalUsersCount(res.data.total);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, planFilter, statusFilter]);

  // Make Admin Action
  const handleMakeAdmin = async (userId) => {
    try {
      await api.put(`/api/admin/users/${userId}/make-admin`);
      showToast('User role updated to Admin');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update user role');
    }
  };

  // Delete User Action
  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      await api.delete(`/api/admin/users/${deleteUserId}`);
      showToast('User and all related data deleted successfully');
      setDeleteUserId(null);
      fetchUsers();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete user');
    }
  };

  // Export Emails Action
  const handleExportEmails = async () => {
    try {
      const res = await api.get('/api/admin/users/emails');
      setExportedEmails(res.data.emails);
      setExportedCount(res.data.count);
      setShowEmailsArea(true);
      showToast('Emails loaded successfully');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to fetch emails');
    }
  };

  // Copy Emails to Clipboard
  const handleCopyEmails = () => {
    navigator.clipboard.writeText(exportedEmails);
    showToast('All emails copied to clipboard!');
  };

  // Send Announcement Action
  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcement.subject.trim() || !announcement.message.trim()) {
      showToast('Subject and message are required.');
      return;
    }
    
    const target = announcementTarget === 'specific' ? selectedSpecificPlan : announcementTarget;
    const count = 
      target === 'all' ? (stats.counts?.all ?? stats.totalUsers ?? 0) :
      target === 'free' ? (stats.counts?.free ?? 0) :
      target === 'paid' ? (stats.counts?.paid ?? 0) :
      target === 'pro' ? (stats.counts?.pro ?? 0) :
      target === 'max' ? (stats.counts?.max ?? 0) :
      (stats.counts?.ultimate ?? 0);

    setIsSendingAnnouncement(true);
    setSendingProgress({ sent: 0, total: count });
    
    let interval = setInterval(() => {
      setSendingProgress(prev => {
        const nextSent = Math.min(prev.sent + Math.ceil(count / 10), count);
        return { ...prev, sent: nextSent };
      });
    }, 150);

    try {
      const res = await api.post('/api/admin/announcement/send', {
        ...announcement,
        target
      });
      clearInterval(interval);
      setSendingProgress({ sent: res.data.count, total: res.data.count });
      showToast(`Announcement sent to ${res.data.count} users successfully!`);
      setAnnouncement({ subject: '', message: '', ctaText: '', ctaUrl: '' });
    } catch (err) {
      clearInterval(interval);
      showToast(err.response?.data?.error || 'Failed to send announcement');
    } finally {
      setIsSendingAnnouncement(false);
    }
  };

  // Fetch Messages Action
  const fetchMessages = async () => {
    setIsMessagesLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = `/api/admin/messages?page=${messagesCurrentPage}&limit=10&status=${messagesStatusFilter}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages || []);
        setMessagesTotalCount(data.total || 0);
        setMessagesTotalPages(Math.ceil((data.total || 0) / 10));
      }
    } catch(err) {
      console.error('Fetch messages error:', err);
      showToast('Failed to fetch messages');
    } finally {
      setIsMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchMessages();
    }
  }, [activeTab, messagesCurrentPage, messagesStatusFilter]);

  // Update Status Action
  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      await api.put(`/api/admin/messages/${ticketId}/status`, { status: newStatus });
      showToast(`Status updated to ${newStatus}`);
      fetchMessages();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update status');
    }
  };

  // Send Reply Action
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      showToast('Reply message is required.');
      return;
    }
    setIsSendingReply(true);
    try {
      await api.post(`/api/admin/messages/${selectedTicket.id}/reply`, {
        replyMessage: replyText
      });
      showToast('Reply email sent successfully');
      setReplyText('');
      setShowReplyDrawer(false);
      fetchMessages();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to send reply');
    } finally {
      setIsSendingReply(false);
    }
  };

  // Send Custom Email Action
  const handleSendCustomEmail = async (e) => {
    e.preventDefault();
    if (!customEmail.toEmail.trim() || !customEmail.subject.trim() || !customEmail.message.trim()) {
      showToast('All fields are required.');
      return;
    }
    setIsSendingCustomEmail(true);
    try {
      await api.post('/api/admin/send-custom-email', customEmail);
      showToast(`Email sent to ${customEmail.toEmail} successfully!`);
      setCustomEmail({ toEmail: '', subject: '', message: '' });
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to send email');
    } finally {
      setIsSendingCustomEmail(false);
    }
  };

  const getAnnouncementButtonText = () => {
    const target = announcementTarget === 'specific' ? selectedSpecificPlan : announcementTarget;
    const count = 
      target === 'all' ? (stats.counts?.all ?? stats.totalUsers ?? 0) :
      target === 'free' ? (stats.counts?.free ?? 0) :
      target === 'paid' ? (stats.counts?.paid ?? 0) :
      target === 'pro' ? (stats.counts?.pro ?? 0) :
      target === 'max' ? (stats.counts?.max ?? 0) :
      (stats.counts?.ultimate ?? 0);
      
    if (isSendingAnnouncement) {
      return `Sending... ${sendingProgress.sent}/${sendingProgress.total} sent`;
    }
    
    switch (target) {
      case 'all': return `Send to All Users (${count} users)`;
      case 'free': return `Send to Free Users (${count} users)`;
      case 'paid': return `Send to Paid Users (${count} users)`;
      case 'pro': return `Send to Pro Users (${count} users)`;
      case 'max': return `Send to Max Users (${count} users)`;
      case 'ultimate': return `Send to Ultimate Users (${count} users)`;
      default: return `Send Announcement (${count} users)`;
    }
  };

  // Badge Style Generators
  const getPlanBadgeClass = (planName) => {
    if (!planName) return 'bg-white/10 text-white/50';
    switch (planName.toLowerCase()) {
      case 'pro':
        return 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30';
      case 'max':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'ultimate':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-white/10 text-white/50';
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === 'Active' 
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
      : 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  if (!isPinVerified) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#06060a] p-4 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[30%] top-[30%] h-[400px] w-[400px] rounded-full bg-purple-600/[0.08] blur-[120px]" />
          <div className="absolute right-[30%] bottom-[30%] h-[400px] w-[400px] rounded-full bg-indigo-600/[0.08] blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 w-full max-w-[360px] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)] backdrop-blur-2xl text-center space-y-6"
        >
          <div className="flex flex-col items-center">
            <div className="w-1.5 h-6 bg-purple-500 rounded-full mb-4 animate-pulse" />
            <h2 className="text-xl font-bold text-white tracking-tight">Admin Authorization</h2>
            <p className="mt-2 text-xs text-white/40 leading-relaxed max-w-[260px] mx-auto">
              Please enter the 4-digit Admin PIN to access the control panel.
            </p>
            {pinError && (
              <div className="mt-3 px-3 py-1.5 rounded border border-red-500/20 bg-red-500/10 text-xs text-red-300">
                {pinError}
              </div>
            )}
          </div>

          <motion.div
            animate={shake ? { x: [-8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className={`flex justify-center gap-3 py-2 ${shake ? 'animate-shake' : ''}`}
          >
            {pinArray.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (pinRefs.current[idx] = el)}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                disabled={pinLocked}
                onChange={(e) => handlePinChange(e.target.value, idx)}
                onKeyDown={(e) => handlePinKeyDown(e, idx)}
                className={`w-12 h-14 rounded-xl border-2 text-center text-xl font-bold text-white outline-none transition-all duration-200 ${
                  digit 
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' 
                    : pinError 
                      ? 'border-rose-500/60 bg-rose-500/5'
                      : 'border-white/15 bg-white/5 focus:border-[#8B5CF6]/60 focus:bg-[#8B5CF6]/5'
                }`}
              />
            ))}
          </motion.div>

          <button
            onClick={() => navigate('/')}
            className="text-xs text-white/30 hover:text-white/50 transition-colors block w-full py-1"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06060a] text-white flex">
      {/* Sidebar Navigation */}
      <aside className="w-56 bg-[#0a0a0f] border-r border-white/8 h-screen fixed left-0 flex flex-col justify-between z-40">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-white/5">
            <span className="font-display font-extrabold text-lg tracking-tight">
              Hirenext<span className="text-[#8B5CF6]">AI</span> <span className="text-[10px] text-purple-400 font-normal uppercase ml-1 px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/20">Admin</span>
            </span>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/10 text-white border border-[#8B5CF6]/30'
                  : 'text-white/45 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Home size={18} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/10 text-white border border-[#8B5CF6]/30'
                  : 'text-white/45 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Users size={18} />
              Users
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'announcements'
                  ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/10 text-white border border-[#8B5CF6]/30'
                  : 'text-white/45 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Megaphone size={18} />
              Announcements
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'messages'
                  ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/10 text-white border border-[#8B5CF6]/30'
                  : 'text-white/45 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <MessageSquare size={18} />
              Messages
            </button>
          </nav>
        </div>

        {/* User Info Bottom */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-white/90 truncate">{user?.firstName || 'Admin'}</span>
            <span className="text-[10px] text-white/40 truncate">{user?.email}</span>
          </div>
          <button 
            onClick={logout}
            title="Log Out"
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-56 flex-1 p-8 min-w-0 overflow-y-auto h-screen">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/8">
          <div>
            <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/60 font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
              <Shield size={12} className="text-[#8B5CF6]" />
              {user?.email}
            </span>
            <button 
              onClick={() => { sessionStorage.removeItem('admin_pin_verified'); navigate('/'); }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-white/50 text-xs hover:bg-white/10 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              Lock Panel
            </button>
          </div>
        </header>

        {/* Tab content conditional switches */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="glass-card p-6 text-center">
                <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
                <div className="text-xs text-white/40 mt-1">Total Users</div>
              </div>
              
              <div className="glass-card p-6 text-center">
                <Activity className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{stats.activeToday}</div>
                <div className="text-xs text-white/40 mt-1">Active Today</div>
              </div>
              
              <div className="glass-card p-6 text-center">
                <MessageSquare className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{stats.totalChats}</div>
                <div className="text-xs text-white/40 mt-1">Total Chats</div>
              </div>

              <div className="glass-card p-6 text-center">
                <Mail className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{stats.emailsSent}</div>
                <div className="text-xs text-white/40 mt-1">Emails Sent</div>
              </div>
            </div>

            {/* Users Overview Table Section */}
            <div className="bg-[#0f0f15] border border-white/5 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-lg text-white">Recent Registrations</h3>
                  <p className="text-xs text-white/40">Latest candidates registered on the platform.</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-72">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/40 placeholder:text-white/20 transition-all"
                  />
                </div>
              </div>

              {/* Users Table */}
              <div className="border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5 text-xs text-white/45 uppercase font-semibold">
                      <th className="px-5 py-3.5">Name</th>
                      <th className="px-5 py-3.5">Email</th>
                      <th className="px-5 py-3.5">Plan</th>
                      <th className="px-5 py-3.5">Joined</th>
                      <th className="px-5 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {isLoading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-white/30 text-sm">Loading users list...</td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-white/30 text-sm">No users found.</td>
                      </tr>
                    ) : (
                      users.map(u => (
                        <tr key={u.id} className="hover:bg-white/[0.01] transition-colors text-sm text-white/80">
                          <td className="px-5 py-3.5 font-medium text-white">{u.displayName}</td>
                          <td className="px-5 py-3.5 text-white/60">{u.email}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPlanBadgeClass(u.plan)}`}>
                              {u.plan}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-white/50">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(u.status)}`}>
                              {u.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <span className="text-xs text-white/30">
                    Showing Page {currentPage} of {totalPages} ({totalUsersCount} total users)
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filter controls row */}
            <div className="bg-[#0f0f15] border border-white/5 rounded-2xl p-6 shadow-xl">
              <div className="grid grid-cols-4 gap-4 items-center">
                {/* Search query */}
                <div className="relative col-span-2">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/40 placeholder:text-white/20 transition-all"
                  />
                </div>

                {/* Plan Dropdown */}
                <div className="flex flex-col">
                  <select
                    value={planFilter}
                    onChange={(e) => {
                      setPlanFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-[#13121a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/40 cursor-pointer"
                  >
                    <option value="">All Plans</option>
                    <option value="Free">Free</option>
                    <option value="Pro">Pro</option>
                    <option value="Max">Max</option>
                    <option value="Ultimate">Ultimate</option>
                  </select>
                </div>

                {/* Status Dropdown */}
                <div className="flex flex-col">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-[#13121a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/40 cursor-pointer"
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Complete Users Table */}
            <div className="bg-[#0f0f15] border border-white/5 rounded-2xl p-6 shadow-xl">
              <div className="border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5 text-xs text-white/45 uppercase font-semibold">
                      <th className="px-5 py-3.5">Name</th>
                      <th className="px-5 py-3.5">Email</th>
                      <th className="px-5 py-3.5">Plan</th>
                      <th className="px-5 py-3.5">Joined</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {isLoading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-white/30 text-sm">Loading users list...</td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-white/30 text-sm">No users found matching query.</td>
                      </tr>
                    ) : (
                      users.map(u => (
                        <tr key={u.id} className="hover:bg-white/[0.01] transition-colors text-sm text-white/80">
                          <td className="px-5 py-3.5 font-medium text-white">{u.displayName}</td>
                          <td className="px-5 py-3.5 text-white/60">{u.email}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPlanBadgeClass(u.plan)}`}>
                              {u.plan}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-white/50 font-mono text-xs">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(u.status)}`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="inline-flex gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedUser(u);
                                  setShowDrawer(true);
                                }}
                                title="View Details"
                                className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 hover:border-white/10 transition-all cursor-pointer hover:scale-105 active:scale-95"
                              >
                                <Eye size={14} />
                              </button>
                              
                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => handleMakeAdmin(u.id)}
                                  title="Make Admin"
                                  className="p-1.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/15 hover:border-purple-500/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
                                >
                                  <UserCheck size={14} />
                                </button>
                              )}

                              <button
                                onClick={() => setDeleteUserId(u.id)}
                                title="Delete User"
                                className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/15 hover:border-rose-500/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <span className="text-xs text-white/30">
                    Showing Page {currentPage} of {totalPages} ({totalUsersCount} total users)
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-6 items-start">
              {/* Send Announcement Form & Live Preview wrapper */}
              <div className="col-span-2 space-y-6">
                <form onSubmit={handleSendAnnouncement} className="glass-card p-6 mb-6">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-purple-400" />
                    Send Announcement to All Users
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Send To Targeting Selector */}
                    <div className="mb-5">
                      <label className="text-sm text-white/60 mb-2 block font-semibold">Send To</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {/* Button 1: All Users */}
                        <button
                          type="button"
                          onClick={() => setAnnouncementTarget('all')}
                          className={`px-4 py-2.5 rounded-xl border font-medium text-sm transition-all cursor-pointer hover:bg-white/10 ${
                            announcementTarget === 'all'
                              ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                              : 'bg-white/5 border-white/15 text-white/60'
                          }`}
                        >
                          All Users ({stats.counts?.all ?? stats.totalUsers ?? 0})
                        </button>
                        
                        {/* Button 2: Free Plan Only */}
                        <button
                          type="button"
                          onClick={() => setAnnouncementTarget('free')}
                          className={`px-4 py-2.5 rounded-xl border font-medium text-sm transition-all cursor-pointer hover:bg-white/10 ${
                            announcementTarget === 'free'
                              ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                              : 'bg-white/5 border-white/15 text-white/60'
                          }`}
                        >
                          Free Plan Only ({stats.counts?.free ?? 0})
                        </button>
                        
                        {/* Button 3: Paid Users Only */}
                        <button
                          type="button"
                          onClick={() => setAnnouncementTarget('paid')}
                          className={`px-4 py-2.5 rounded-xl border font-medium text-sm transition-all cursor-pointer hover:bg-white/10 ${
                            announcementTarget === 'paid'
                              ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                              : 'bg-white/5 border-white/15 text-white/60'
                          }`}
                        >
                          Paid Users ({stats.counts?.paid ?? 0})
                        </button>
                        
                        {/* Button 4: Select Specific Plan */}
                        <button
                          type="button"
                          onClick={() => setAnnouncementTarget('specific')}
                          className={`px-4 py-2.5 rounded-xl border font-medium text-sm transition-all cursor-pointer hover:bg-white/10 ${
                            announcementTarget === 'specific'
                              ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                              : 'bg-white/5 border-white/15 text-white/60'
                          }`}
                        >
                          Specific Plan ({
                            selectedSpecificPlan === 'pro' ? (stats.counts?.pro ?? 0) :
                            selectedSpecificPlan === 'max' ? (stats.counts?.max ?? 0) :
                            (stats.counts?.ultimate ?? 0)
                          })
                        </button>
                      </div>
                      
                      {/* Specific Plan Dropdown */}
                      {announcementTarget === 'specific' && (
                        <div className="mt-3 animate-fade-in">
                          <label className="text-xs text-white/55 mb-1 block">Pick Plan</label>
                          <select
                            value={selectedSpecificPlan}
                            onChange={(e) => setSelectedSpecificPlan(e.target.value)}
                            className="bg-[#13121a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/40 cursor-pointer"
                          >
                            <option value="pro">Pro</option>
                            <option value="max">Max</option>
                            <option value="ultimate">Ultimate</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Subject line input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/55 font-semibold">Subject Line</label>
                      <input
                        type="text"
                        required
                        value={announcement.subject}
                        onChange={(e) => setAnnouncement(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Enter email subject..."
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/40 transition-all"
                      />
                    </div>

                    {/* Message content textarea */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/55 font-semibold">Message (Supports standard paragraphs)</label>
                      <textarea
                        required
                        rows={6}
                        value={announcement.message}
                        onChange={(e) => setAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Enter your announcement text here..."
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/40 resize-none transition-all"
                      />
                    </div>

                    {/* CTA inputs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white/55 font-semibold">CTA Button Text (Optional)</label>
                        <input
                          type="text"
                          value={announcement.ctaText}
                          onChange={(e) => setAnnouncement(prev => ({ ...prev, ctaText: e.target.value }))}
                          placeholder="e.g. Try Premium"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/40 transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white/55 font-semibold">CTA Button URL (Optional)</label>
                        <input
                          type="url"
                          value={announcement.ctaUrl}
                          onChange={(e) => setAnnouncement(prev => ({ ...prev, ctaUrl: e.target.value }))}
                          placeholder="e.g. https://hirenextai.com/pricing"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/40 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingAnnouncement}
                      className="w-full h-11 bg-gradient-to-r from-[#8B5CF6] to-[#7c3aed] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.25)] hover:shadow-[0_0_30px_rgba(139,92,246,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Megaphone size={16} />
                      {getAnnouncementButtonText()}
                    </button>
                  </div>
                </form>

                {/* Email Live Preview */}
                <div className="mt-6 border border-white/10 rounded-xl overflow-hidden">
                  <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-xs text-white/40 ml-2">Email Preview</span>
                  </div>
                  
                  <div className="bg-[#0f0f1a] p-6 select-none pointer-events-none">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        HirenextAI
                      </span>
                    </div>
                    
                    {/* Body */}
                    <div className="bg-[#1a1a2e] rounded-xl p-6">
                      <p className="text-white font-semibold mb-3">Hey [User],</p>
                      
                      <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                        {announcement.message || "Your message will appear here..."}
                      </div>
                      
                      {announcement.ctaText && announcement.ctaUrl && (
                        <div className="text-center mt-5">
                          <span className="bg-[#8B5CF6] text-white px-6 py-2.5 rounded-lg text-sm font-semibold inline-block">
                            {announcement.ctaText}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Footer */}
                    <div className="text-center mt-5 pt-4 border-t border-white/6">
                      <p className="text-[#555] text-xs mb-1">
                        Questions? Contact our support team:{' '}
                        <a href="mailto:support@hirenextai.com" className="text-[#8B5CF6] no-underline hover:underline">
                          support@hirenextai.com
                        </a>
                        {' '}|{' '}
                        <a href="https://hirenextai.com" className="text-[#8B5CF6] no-underline hover:underline">
                          hirenextai.com
                        </a>
                      </p>
                      <p className="text-[#444] text-[11px] mb-1">© 2026 HirenextAI · All rights reserved</p>
                      <a href="#" className="text-[#444] text-[11px] underline">Unsubscribe</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Get All Emails / Export Panel */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-purple-400" />
                  Export User Emails
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Generate and export a comma-separated list of all candidate email addresses for bulk newsletters or operations in external email tools.
                </p>

                <button
                  onClick={handleExportEmails}
                  className="w-full py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Mail size={16} />
                  Get All Emails
                </button>

                {showEmailsArea && (
                  <div className="space-y-3.5 pt-4 border-t border-white/5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {exportedCount} Emails Loaded
                      </span>
                    </div>

                    <textarea
                      readOnly
                      rows={5}
                      value={exportedEmails}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white/70 font-mono focus:outline-none resize-none"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleCopyEmails}
                        className="py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-bold rounded-lg border border-purple-500/15 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Copy size={12} />
                        Copy All
                      </button>
                      
                      <a
                        href={`mailto:?bcc=${encodeURIComponent(exportedEmails)}`}
                        className="py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold rounded-lg border border-white/10 transition-all flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink size={12} />
                        Open in Gmail
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-8">
            <div className="bg-[#0f0f15] border border-white/5 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-lg text-white">Contact Messages</h3>
                  <p className="text-xs text-white/40">Manage contact form queries and support tickets.</p>
                </div>
                
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/55">Status:</span>
                  <select
                    value={messagesStatusFilter}
                    onChange={(e) => {
                      setMessagesStatusFilter(e.target.value);
                      setMessagesCurrentPage(1);
                    }}
                    className="bg-[#13121a] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/40 cursor-pointer"
                  >
                    <option value="all">All Messages</option>
                    <option value="new">New</option>
                    <option value="open">Open</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Messages Table */}
              <div className="border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5 text-xs text-white/45 uppercase font-semibold">
                      <th className="px-5 py-3.5">Name</th>
                      <th className="px-5 py-3.5">Email</th>
                      <th className="px-5 py-3.5">Subject</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {isMessagesLoading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-white/30 text-sm">Loading messages...</td>
                      </tr>
                    ) : messages.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-white/30 text-sm">No messages found.</td>
                      </tr>
                    ) : (
                      messages.map(msg => (
                        <tr key={msg.id} className="hover:bg-white/[0.01] transition-colors text-sm text-white/80">
                          <td className="px-5 py-3.5 font-medium text-white">{msg.name}</td>
                          <td className="px-5 py-3.5 text-white/60">{msg.email}</td>
                          <td className="px-5 py-3.5 text-white/60 truncate max-w-[200px]">{msg.subject}</td>
                          <td className="px-5 py-3.5 text-white/50">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5">
                            {msg.status === 'new' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">New</span>
                            )}
                            {msg.status === 'open' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">Open</span>
                            )}
                            {msg.status === 'resolved' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Resolved</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedTicket(msg);
                                setReplyText('');
                                setShowReplyDrawer(true);
                                if (msg.status === 'new') {
                                  handleUpdateStatus(msg.id, 'open');
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 border border-purple-500/15 hover:border-purple-500/30 text-xs font-semibold transition-all cursor-pointer hover:scale-105 active:scale-95"
                            >
                              View & Reply
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {messagesTotalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <span className="text-xs text-white/30">
                    Showing Page {messagesCurrentPage} of {messagesTotalPages} ({messagesTotalCount} total messages)
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setMessagesCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={messagesCurrentPage === 1}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setMessagesCurrentPage(prev => Math.min(prev + 1, messagesTotalPages))}
                      disabled={messagesCurrentPage === messagesTotalPages}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Send Custom Email Form */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-400" />
                Send Custom Email
              </h3>
              
              <div className="grid grid-cols-2 gap-6 items-start">
                <form onSubmit={handleSendCustomEmail} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/55 font-semibold">To Email</label>
                    <input
                      type="email"
                      required
                      value={customEmail.toEmail}
                      onChange={(e) => setCustomEmail(prev => ({ ...prev, toEmail: e.target.value }))}
                      placeholder="e.g. candidate@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/40 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/55 font-semibold">Subject</label>
                    <input
                      type="text"
                      required
                      value={customEmail.subject}
                      onChange={(e) => setCustomEmail(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter subject..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/40 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/55 font-semibold">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={customEmail.message}
                      onChange={(e) => setCustomEmail(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Type your message here..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/40 resize-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingCustomEmail}
                    className="w-full h-11 bg-gradient-to-r from-[#8B5CF6] to-[#7c3aed] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.25)] hover:shadow-[0_0_30px_rgba(139,92,246,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail size={16} />
                    {isSendingCustomEmail ? 'Sending...' : 'Send Email'}
                  </button>
                </form>

                {/* Custom Email Live Preview */}
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-xs text-white/40 ml-2">Email Live Preview</span>
                  </div>
                  
                  <div className="bg-[#0f0f1a] p-6 select-none pointer-events-none">
                    <div className="text-center mb-6">
                      <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        HirenextAI
                      </span>
                    </div>

                    <div className="bg-[#1a1a2e] rounded-xl p-6 border border-purple-500/10">
                      <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap min-h-[120px]">
                        {customEmail.message || "Your custom message text will show here in real-time..."}
                      </div>
                    </div>

                    <div className="text-center mt-5 pt-4 border-t border-white/6">
                      <p className="text-[#555] text-xs mb-1">
                        Questions? Contact our support team:{' '}
                        <a href="mailto:support@hirenextai.com" className="text-[#8B5CF6] no-underline hover:underline">
                          support@hirenextai.com
                        </a>
                        {' '}|{' '}
                        <a href="https://hirenextai.com" className="text-[#8B5CF6] no-underline hover:underline">
                          hirenextai.com
                        </a>
                      </p>
                      <p className="text-[#444] text-[11px] mb-1">© 2026 HirenextAI · All rights reserved</p>
                      <a href="#" className="text-[#444] text-[11px] underline">Unsubscribe</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Slide-out right side drawer for User Details */}
      {showDrawer && selectedUser && (
        <>
          <div 
            onClick={() => setShowDrawer(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" 
          />
          <div className="fixed right-0 top-0 h-screen w-[380px] bg-[#0c0c12] border-l border-white/5 shadow-2xl p-6 z-[100] animate-slide-left flex flex-col justify-between">
            <div>
              {/* Drawer header */}
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-lg text-white">User Account Details</h3>
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="p-1 rounded bg-white/5 border border-white/5 text-white/40 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer User info rows */}
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Full Name</label>
                  <span className="text-md font-semibold text-white block">{selectedUser.displayName}</span>
                </div>

                <div>
                  <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Email Address</label>
                  <span className="text-md text-white/80 font-mono block">{selectedUser.email}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Selected Plan</label>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border mt-0.5 ${getPlanBadgeClass(selectedUser.plan)}`}>
                      {selectedUser.plan}
                    </span>
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Platform Status</label>
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${getStatusBadgeClass(selectedUser.status)}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Joined Date</label>
                    <span className="text-sm font-medium text-white/70 block">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">User Role</label>
                    <span className="text-sm font-medium text-white/70 uppercase block">{selectedUser.role}</span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6 space-y-4">
                  <h4 className="font-bold text-xs text-white/50 uppercase tracking-wider">Quick Metadata Stats</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#121118] border border-white/5 rounded-xl p-3.5 text-center">
                      <div className="text-xl font-bold text-white">~ {selectedUser.plan === 'free' ? '20' : '200'}</div>
                      <div className="text-[9px] text-white/35 uppercase tracking-wider mt-0.5">Remaining Credits</div>
                    </div>
                    <div className="bg-[#121118] border border-white/5 rounded-xl p-3.5 text-center">
                      <div className="text-xl font-bold text-white">Active</div>
                      <div className="text-[9px] text-white/35 uppercase tracking-wider mt-0.5">Session Status</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Drawer bottom */}
            {selectedUser.role !== 'admin' && (
              <button
                onClick={() => {
                  handleMakeAdmin(selectedUser.id);
                  setShowDrawer(false);
                }}
                className="w-full h-10 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/15 hover:border-purple-500/35 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:opacity-90 active:scale-95"
              >
                <UserCheck size={14} />
                Make This User Admin
              </button>
            )}
          </div>
        </>
      )}

      {/* Slide-out Drawer for Contact Message Details & Reply */}
      {showReplyDrawer && selectedTicket && (
        <>
          <div 
            onClick={() => setShowReplyDrawer(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" 
          />
          <div className="fixed right-0 top-0 h-screen w-[480px] bg-[#0c0c12] border-l border-white/5 shadow-2xl p-6 z-[100] animate-slide-left flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer header */}
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-white">Ticket Details</h3>
                <button 
                  onClick={() => setShowReplyDrawer(false)}
                  className="p-1 rounded bg-white/5 border border-white/5 text-white/40 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Message Details */}
              <div className="space-y-4 bg-[#121118] border border-white/5 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-0.5">Name</label>
                    <span className="text-sm font-semibold text-white block">{selectedTicket.name}</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-0.5">Email</label>
                    <span className="text-sm font-semibold text-white/80 font-mono block truncate">{selectedTicket.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-0.5">Subject</label>
                    <span className="text-sm font-semibold text-white block">{selectedTicket.subject}</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-0.5">Date</label>
                    <span className="text-sm font-semibold text-white/70 block">
                      {new Date(selectedTicket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3">
                  <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Message Text</label>
                  <div className="bg-[#0c0c12] border border-white/5 rounded-lg p-3 text-sm text-white/80 leading-relaxed whitespace-pre-wrap max-h-[150px] overflow-y-auto custom-scrollbar">
                    {selectedTicket.message}
                  </div>
                </div>
              </div>

              {/* Reply Section */}
              <form onSubmit={handleSendReply} className="space-y-4">
                <h4 className="text-sm font-semibold text-white">Send Reply to {selectedTicket.name}</h4>
                <textarea
                  required
                  rows={5}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/40 resize-none transition-all"
                />

                {/* Reply live preview */}
                <div className="border border-white/10 rounded-xl overflow-hidden text-left scale-95 origin-top">
                  <div className="bg-white/5 px-3 py-1.5 border-b border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-white/40">Email Reply Live Preview</span>
                  </div>
                  <div className="bg-[#0f0f1a] p-4 select-none pointer-events-none text-xs">
                    <h3 className="text-[#8B5CF6] font-bold text-sm mb-1">HirenextAI Support</h3>
                    <p className="text-white/40 text-[10px] mb-3">Reply to your support request</p>
                    <p className="text-white mb-2">Hey {selectedTicket.name},</p>
                    
                    <div className="bg-[#1a1a2e] rounded-lg p-2.5 border-l-2 border-purple-500 mb-3 opacity-60">
                      <p className="text-white/40 text-[9px] mb-1">Your original message:</p>
                      <p className="text-white/70 truncate">{selectedTicket.message}</p>
                    </div>

                    <div className="text-white/80 min-h-[50px] whitespace-pre-wrap leading-relaxed">
                      {replyText || "Reply text will show here in real-time as you type..."}
                    </div>

                    <div className="text-center mt-5 pt-4 border-t border-white/6">
                      <p className="text-[#555] text-xs mb-1">
                        Questions? Contact our support team:{' '}
                        <a href="mailto:support@hirenextai.com" className="text-[#8B5CF6] no-underline hover:underline">
                          support@hirenextai.com
                        </a>
                        {' '}|{' '}
                        <a href="https://hirenextai.com" className="text-[#8B5CF6] no-underline hover:underline">
                          hirenextai.com
                        </a>
                      </p>
                      <p className="text-[#444] text-[11px] mb-1">© 2026 HirenextAI · All rights reserved</p>
                      <a href="#" className="text-[#444] text-[11px] underline">Unsubscribe</a>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSendingReply}
                    className="flex-1 h-10 bg-purple-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 hover:bg-purple-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail size={14} />
                    {isSendingReply ? 'Sending...' : 'Send Reply'}
                  </button>
                  
                  {selectedTicket.status !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateStatus(selectedTicket.id, 'resolved');
                        setShowReplyDrawer(false);
                      }}
                      className="px-4 h-10 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold rounded-xl border border-white/10 transition-all cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Deletion confirmation modal popup */}
      {deleteUserId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteUserId(null)} />
          <div className="relative bg-[#111111] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <Trash2 size={24} />
              <h3 className="text-lg font-bold text-white">Delete User Account?</h3>
            </div>
            <p className="text-white/60 text-sm mb-6">
              This action cannot be undone. The user's credentials, chat histories, resume uploads, and tickets will be permanently removed from our databases.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteUserId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
