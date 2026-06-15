import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, UserPlus, LogIn, X, Sparkles, MessageSquare } from 'lucide-react';
import anime from 'animejs/lib/anime.es.js';
import { modalOpen } from '../lib/animations';
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

const DEMO_MAX_RESPONSES = 3;
const DEMO_DURATION = 600; // 10 minutes in seconds

const ChatPage = ({ demo }) => {
  const navigate = useNavigate();
  const { setDemoMode, user } = useAuthStore();
  const { showToast } = useUIStore();
  const [timeLeft, setTimeLeft] = useState(DEMO_DURATION);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showSparklesModal, setShowSparklesModal] = useState(false);
  const [aiResponseCount, setAiResponseCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return sessionStorage.getItem('hn_verification_banner_dismissed') === 'true';
  });
  const modalRef = useRef(null);

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

  // Track AI response count from sessionStorage
  useEffect(() => {
    if (demo) {
      const stored = sessionStorage.getItem('demo_ai_responses');
      if (stored) setAiResponseCount(parseInt(stored, 10) || 0);
    }
  }, [demo]);

  // Listen for AI responses being sent (increment counter)
  useEffect(() => {
    if (!demo) return;
    const onAiResponse = () => {
      setAiResponseCount(prev => {
        const next = prev + 1;
        sessionStorage.setItem('demo_ai_responses', String(next));
        if (next >= DEMO_MAX_RESPONSES) {
          setTimeout(() => {
            setShowLimitModal(true);
            setTimeout(() => modalOpen('.demo-limit-modal'), 50);
          }, 500);
        }
        return next;
      });
    };
    window.addEventListener('hn-demo-ai-response', onAiResponse);
    return () => window.removeEventListener('hn-demo-ai-response', onAiResponse);
  }, [demo]);

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

  // 10-minute countdown timer
  useEffect(() => {
    if (!demo) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowExpiredModal(true);
          setTimeout(() => modalOpen('.demo-expired-modal'), 50);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [demo]);

  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  const timerColor = timeLeft > 300 ? 'text-emerald-400' : timeLeft > 120 ? 'text-amber-400' : 'text-rose-400';
  const timerBg = timeLeft > 300 ? 'bg-emerald-500/10 border-emerald-500/25' : timeLeft > 120 ? 'bg-amber-500/10 border-amber-500/25' : 'bg-rose-500/10 border-rose-500/25';

  const responsesLeft = Math.max(0, DEMO_MAX_RESPONSES - aiResponseCount);

  const clearDemoSession = () => {
    sessionStorage.removeItem('demoChatHistory');
    sessionStorage.removeItem('demo_ai_responses');
    sessionStorage.removeItem('demo_session');
  };

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col relative">
      {demo && (
        <div className="w-full flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-[#0A0A0A] border-b border-[#1F1F1F] backdrop-blur-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-[#1F1F1F] text-white/60 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-white/40" />
            Demo Mode — Data not saved
          </div>

          <div className="flex items-center gap-3">
            {/* Response counter */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1F1F1F] bg-[#111111]">
              <MessageSquare className={`w-3.5 h-3.5 ${responsesLeft > 0 ? 'text-white/50' : 'text-rose-400'}`} />
              <span className={`font-mono font-bold text-sm ${responsesLeft > 0 ? 'text-white/70' : 'text-rose-400'}`}>
                {responsesLeft}/{DEMO_MAX_RESPONSES}
              </span>
            </div>

            {/* Timer */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${timerBg} ${timeLeft <= 60 ? 'animate-pulse' : ''}`}>
              <Clock className={`w-3.5 h-3.5 ${timerColor}`} />
              <span className={`font-mono font-bold text-sm ${timerColor}`}>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { clearDemoSession(); navigate('/register'); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Sign Up Free
            </button>
            <button
              onClick={() => { clearDemoSession(); navigate('/login'); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1F1F1F] bg-[#111111] text-[#999999] text-xs font-semibold hover:bg-[#161616] transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              Log In
            </button>
            <button
              onClick={() => { clearDemoSession(); navigate('/'); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1F1F1F] bg-[#111111] text-[#555555] text-xs font-semibold hover:bg-[#161616] transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Exit
            </button>
          </div>
        </div>
      )}

      {showUnverifiedBanner && (
        <div className="w-full flex-shrink-0 flex items-center justify-between px-6 py-2 bg-white/[0.02] border-b border-[#1F1F1F] text-white/70 backdrop-blur-md">
          <div className="w-6" />
          <div className="flex items-center gap-2 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
            <span>Please verify your email address to secure your account.</span>
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="ml-2 bg-white text-black rounded-lg px-4 py-1.5 text-xs transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90"
            >
              {isResending ? 'Sending...' : 'Resend Verification Link'}
            </button>
          </div>
          <button
            onClick={handleDismissBanner}
            className="p-1 rounded-lg text-[#555555] hover:text-white hover:bg-white/5 transition-all"
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

      {/* Demo Session Expired Modal */}
      {demo && (
        <AnimatePresence>
          {showExpiredModal && (
            <>
              <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md" />
              <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                <div className="demo-expired-modal w-full max-w-[400px] bg-[#111111] border border-[#1F1F1F] rounded-2xl p-8 text-center relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="inline-flex mb-4">
                      <Clock className="w-10 h-10 text-white/60" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Demo Session Ended</h2>
                    <p className="text-[#999999] text-sm mb-6 leading-relaxed">
                      Your 10-minute demo has ended. Sign up free to get full access to HirenextAI — no credit card required.
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => { clearDemoSession(); navigate('/register'); }}
                        className="w-full h-11 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-all"
                      >
                        <UserPlus className="w-4 h-4" />
                        Sign Up Free — No Credit Card
                      </button>
                      <button
                        onClick={() => { clearDemoSession(); navigate('/login'); }}
                        className="w-full h-11 border border-[#1F1F1F] bg-[#0D0D0D] text-[#999999] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#161616] transition-all"
                      >
                        <LogIn className="w-4 h-4" />
                        Already have an account? Log In
                      </button>
                      <button
                        onClick={() => navigate('/')}
                        className="w-full h-11 border border-[#1F1F1F] bg-transparent text-[#555555] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#111111] transition-all"
                      >
                        <X className="w-4 h-4" />
                        Back to Home
                      </button>
                    </div>
                    <p className="text-[#333333] text-[11px] mt-4">Free forever plan · No credit card · Cancel anytime</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Demo Response Limit Modal */}
      {demo && (
        <AnimatePresence>
          {showLimitModal && (
            <>
              <div
                className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md"
                onClick={() => setShowLimitModal(false)}
              />
              <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                <div className="demo-limit-modal w-full max-w-[400px] bg-[#111111] border border-[#1F1F1F] rounded-2xl p-8 text-center relative overflow-hidden">
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-[#1F1F1F] flex items-center justify-center mb-5">
                      <MessageSquare className="w-7 h-7 text-white/60" />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">Demo Limit Reached</h3>
                    <p className="text-[#999999] text-sm mb-6 leading-relaxed max-w-xs">
                      You've used all {DEMO_MAX_RESPONSES} free AI responses in this demo. Create a free account for unlimited access.
                    </p>
                    <button
                      onClick={() => { clearDemoSession(); navigate('/register'); }}
                      className="w-full h-12 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-all mb-3"
                    >
                      <UserPlus className="w-4 h-4" />
                      Sign Up Free — Unlimited Access
                    </button>
                    <button
                      onClick={() => { clearDemoSession(); navigate('/login'); }}
                      className="w-full h-12 border border-[#1F1F1F] bg-[#0D0D0D] text-[#999999] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#161616] transition-all mb-3"
                    >
                      <LogIn className="w-4 h-4" />
                      Log In
                    </button>
                    <button
                      onClick={() => setShowLimitModal(false)}
                      className="text-[#555555] text-xs mt-2 hover:text-white/60 transition-colors"
                    >
                      Continue browsing demo
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Sparkles Lock Modal overlay */}
      <AnimatePresence>
        {showSparklesModal && (
          <>
            <div
              className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm"
              onClick={() => setShowSparklesModal(false)}
            />
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-[#111111] border border-[#1F1F1F] rounded-2xl p-8 text-center relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                  <Sparkles className="w-10 h-10 text-white/60 mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2">Create a free account to access this</h3>
                  <p className="text-[#999999] text-sm mb-6 leading-relaxed">
                    Sign up free to unlock Applications, Files, Interview prep and more.
                  </p>
                  <button
                    onClick={() => { setShowSparklesModal(false); navigate('/register'); }}
                    className="w-full h-11 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-all mb-3"
                  >
                    Sign Up Free — It's Free
                  </button>
                  <button
                    onClick={() => { setShowSparklesModal(false); navigate('/login'); }}
                    className="w-full h-11 border border-[#1F1F1F] bg-[#0D0D0D] text-[#999999] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#161616] transition-all mb-3"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => setShowSparklesModal(false)}
                    className="text-[#555555] text-xs mt-2 hover:text-[#999999] transition-colors"
                  >
                    Continue browsing demo
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
