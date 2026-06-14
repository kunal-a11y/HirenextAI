import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, UserPlus, LogIn, X, Sparkles } from 'lucide-react';
import ChatLayout from '../components/layout/ChatLayout';
import ChatArea from '../components/chat/ChatArea';
import VoiceToVoiceOverlay from '../components/chat/VoiceToVoiceOverlay';
import ConnectAccountModal from '../components/modals/ConnectAccountModal';
import SettingsModal from '../components/modals/SettingsModal';
import SearchPopup from '../components/modals/SearchPopup';
import useAuthStore from '../store/useAuthStore';
import useUIStore from '../store/useUIStore';
import useChatStore from '../store/useChatStore';
import api from '../lib/api';

const ChatPage = ({ demo }) => {
  const navigate = useNavigate();
  const { setDemoMode, user } = useAuthStore();
  const { showToast } = useUIStore();
  const [timeLeft, setTimeLeft] = useState(120);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showSparklesModal, setShowSparklesModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return sessionStorage.getItem('hn_verification_banner_dismissed') === 'true';
  });

  const showUnverifiedBanner = !demo && user && !user.emailVerified && !bannerDismissed;

  const handleDismissBanner = () => {
    sessionStorage.setItem('hn_verification_banner_dismissed', 'true');
    setBannerDismissed(true);
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await api.post('/api/auth/resend-verification');
      showToast('Verification email sent successfully');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleDemoInteraction = (e) => {
    if (demo) {
      const interactive = e.target.closest('button, input, textarea, select, a, [role="button"]');
      if (interactive) {
        const isLock = interactive.hasAttribute('data-demo-lock') || 
                       interactive.closest('[data-demo-lock="true"]');
        if (isLock) {
          e.preventDefault();
          e.stopPropagation();
          setShowSparklesModal(true);
        }
      }
    }
  };

  useEffect(() => {
    if (demo) {
      setDemoMode();
      let demoChats = [];
      try {
        demoChats = JSON.parse(sessionStorage.getItem('demoChatHistory') || '[]');
      } catch {
        demoChats = [];
      }
      useChatStore.setState({
        chats: demoChats,
        currentChatId: demoChats[0]?.id || null,
        messages: demoChats[0]?.messages || []
      });
    } else {
      let realChats = [];
      try {
        realChats = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      } catch {
        realChats = [];
      }
      useChatStore.setState({
        chats: realChats,
        currentChatId: realChats[0]?.id || null,
        messages: realChats[0]?.messages || []
      });
    }
  }, [demo, setDemoMode]);

  useEffect(() => {
    if (!demo) return;
    const onDemoSignup = () => setShowSparklesModal(true);
    window.addEventListener('hn-demo-signup', onDemoSignup);
    return () => window.removeEventListener('hn-demo-signup', onDemoSignup);
  }, [demo]);

  useEffect(() => {
    if (!demo) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowExpiredModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [demo]);

  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  const timerColor = timeLeft > 60 ? 'text-emerald-400' : timeLeft > 30 ? 'text-amber-400' : 'text-rose-400';
  const timerBg = timeLeft > 60 ? 'bg-emerald-500/10 border-emerald-500/25' : timeLeft > 30 ? 'bg-amber-500/10 border-amber-500/25' : 'bg-rose-500/10 border-rose-500/25';

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col relative">
      {demo && (
        <div className="w-full flex-shrink-0 flex items-center justify-between px-4 py-2 bg-[#0a0a0f]/95 border-b border-yellow-500/20 backdrop-blur-md">
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/15 border border-yellow-500/35 text-yellow-400 text-[11px] font-bold uppercase tracking-wider"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            ⚠ DEMO MODE — No Personal Info
          </motion.div>

          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${timerBg} ${timeLeft <= 30 ? 'animate-pulse' : ''}`}>
            <Clock className={`w-3.5 h-3.5 ${timerColor}`} />
            <span className={`font-mono font-bold text-sm ${timerColor}`}>{formatTime(timeLeft)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sessionStorage.removeItem('demoChatHistory');
                navigate('/register');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B5CF6] text-white text-xs font-semibold hover:bg-[#7c3aed] transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Sign Up Free
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('demoChatHistory');
                navigate('/login');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-white/70 text-xs font-semibold hover:bg-white/10 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              Log In
            </button>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-white/50 text-xs font-semibold hover:bg-white/10 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Exit Demo
            </button>
          </div>
        </div>
      )}

      {showUnverifiedBanner && (
        <div className="w-full flex-shrink-0 flex items-center justify-between px-6 py-2 bg-[#8B5CF6]/10 border-b border-[#8B5CF6]/20 text-white/70 backdrop-blur-md">
          <div className="w-6" /> {/* Spacer to balance the X button */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-[#8B5CF6] shrink-0" />
            <span>Please verify your email address to secure your account.</span>
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="ml-2 bg-[#8B5CF6] text-white rounded-lg px-4 py-1.5 text-xs transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#7c3aed]"
            >
              {isResending ? 'Sending...' : 'Resend Verification Link'}
            </button>
          </div>
          <button 
            onClick={handleDismissBanner}
            className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 relative" onClickCapture={handleDemoInteraction}>
        <ChatLayout className="h-full">
          <ChatArea demo={demo} />
          <VoiceToVoiceOverlay />
          <ConnectAccountModal />
          <SettingsModal />
          <SearchPopup />
        </ChatLayout>
      </div>

      {demo && (
        <AnimatePresence>
          {showExpiredModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md"
              />
              <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.88, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  className="w-full max-w-[400px] bg-[#0f0f1a] border border-[#8B5CF6]/30 rounded-[24px] p-8 text-center shadow-[0_40px_100px_rgba(0,0,0,0.9)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.15),transparent_70%)] pointer-events-none" />
                  <div className="relative z-10">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="inline-flex mb-4"
                    >
                      <Clock className="w-10 h-10 text-[#8B5CF6]" />
                    </motion.div>
                    <h2 className="text-xl font-display font-extrabold text-white mb-2">Demo Session Ended</h2>
                    <p className="text-white/50 text-sm mb-6 leading-relaxed">
                      Your 2-minute demo has ended. Sign up free to get full access to HirenextAI — no credit card required.
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          sessionStorage.removeItem('demoChatHistory');
                          navigate('/register');
                        }}
                        className="w-full h-11 bg-gradient-to-r from-[#8B5CF6] to-[#7c3aed] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                      >
                        <UserPlus className="w-4 h-4" />
                        Sign Up Free — No Credit Card
                      </button>
                      <button
                        onClick={() => {
                          sessionStorage.removeItem('demoChatHistory');
                          navigate('/login');
                        }}
                        className="w-full h-11 border border-white/15 bg-white/5 text-white/70 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                      >
                        <LogIn className="w-4 h-4" />
                        Already have an account? Log In
                      </button>
                      <button
                        onClick={() => navigate('/')}
                        className="w-full h-11 border border-white/10 bg-transparent text-white/40 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
                      >
                        <X className="w-4 h-4" />
                        Back to Home
                      </button>
                    </div>
                    <p className="text-white/25 text-[11px] mt-4">Free forever plan · No credit card · Cancel anytime</p>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Sparkles Lock Modal overlay */}
      <AnimatePresence>
        {showSparklesModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSparklesModal(false)}
              className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="w-full max-w-sm bg-[#0f0f1a] border border-[#8B5CF6]/30 rounded-2xl p-8 text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.15),transparent_70%)] pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center">
                  <Sparkles className="w-10 h-10 text-[#8B5CF6] mb-4 animate-pulse" />
                  <h3 className="text-white font-bold text-lg mb-2">Create a free account to access this</h3>
                  <p className="text-white/50 text-sm mb-6 leading-relaxed">
                    Sign up free to unlock Applications, Files, Interview prep and more.
                  </p>
                  <button
                    onClick={() => {
                      setShowSparklesModal(false);
                      navigate('/register');
                    }}
                    className="w-full h-11 bg-gradient-to-r from-[#8B5CF6] to-[#7c3aed] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] mb-3"
                  >
                    Sign Up Free — It's Free
                  </button>
                  <button
                    onClick={() => {
                      setShowSparklesModal(false);
                      navigate('/login');
                    }}
                    className="w-full h-11 border border-white/10 bg-white/5 text-white/70 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all mb-3"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => setShowSparklesModal(false)}
                    className="text-white/30 text-xs mt-2 hover:text-white/60 transition-colors"
                  >
                    Continue browsing demo
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
