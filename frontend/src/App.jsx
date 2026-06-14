import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, Shield } from 'lucide-react';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import About from './pages/About';
import Contact from './pages/Contact';
import Cookies from './pages/Cookies';
import Features from './pages/Features';
import HelpCenter from './pages/HelpCenter';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import Terms from './pages/Terms';
import Updates from './pages/Updates';
import V1Preview from './pages/V1Preview';
import LoginSuccess from './pages/LoginSuccess';
import NotFound from './pages/NotFound';
import ChatPage from './pages/ChatPage';
import ChatsPage from './pages/ChatsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import InterviewPage from './pages/InterviewPage';
import FilesPage from './pages/FilesPage';
import ConnectAccounts from './pages/ConnectAccounts';
import ResetPassword from './pages/ResetPassword';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AdminPanel from './pages/AdminPanel';
import AuthCallback from './pages/AuthCallback';
import Extension from './pages/Extension';
import PricingModal from './components/modals/PricingModal';
import ScrollToTop from './components/ScrollToTop';
import { CookieConsent } from './components/layout/CookieConsent';
import useUIStore from './store/useUIStore';
import useSettingsStore from './store/useSettingsStore';
import useAuthStore from './store/useAuthStore';
import useUserStore from './store/useUserStore';

const Toast = () => {
  const { toast } = useUIStore();

  const getToastConfig = () => {
    if (!toast) return null;
    const lowerMsg = toast.toLowerCase();
    
    const isError = lowerMsg.includes('fail') || 
                    lowerMsg.includes('err') || 
                    lowerMsg.includes('wrong') || 
                    lowerMsg.includes('incorrect') || 
                    lowerMsg.includes('invalid') || 
                    lowerMsg.includes('not found') || 
                    lowerMsg.includes('denied') || 
                    lowerMsg.includes('expire') || 
                    lowerMsg.includes('unable');

    const isSuccess = lowerMsg.includes('success') || 
                      lowerMsg.includes('sent') || 
                      lowerMsg.includes('save') || 
                      lowerMsg.includes('copi') || 
                      lowerMsg.includes('creat') || 
                      lowerMsg.includes('update') || 
                      lowerMsg.includes('complet') || 
                      lowerMsg.includes('verifi') || 
                      lowerMsg.includes('log') || 
                      lowerMsg.includes('welcome');

    if (isError) {
      return {
        icon: <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />,
        border: 'border-rose-500/30',
        glow: 'shadow-[0_8px_30px_rgba(244,63,94,0.15)]',
        text: 'text-rose-200'
      };
    } else if (isSuccess) {
      return {
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
        border: 'border-emerald-500/30',
        glow: 'shadow-[0_8px_30px_rgba(16,185,129,0.15)]',
        text: 'text-emerald-200'
      };
    } else {
      return {
        icon: <Info className="w-4 h-4 text-purple-300 shrink-0" />,
        border: 'border-[#8B5CF6]/30',
        glow: 'shadow-[0_8px_30px_rgba(139,92,246,0.15)]',
        text: 'text-purple-200'
      };
    }
  };

  const config = getToastConfig();

  return (
    <AnimatePresence>
      {toast && config && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="fixed top-24 right-6 z-[9999] pointer-events-auto"
        >
          <div className={`bg-[#0f0f18]/95 backdrop-blur-md border ${config.border} rounded-2xl px-5 py-3.5 ${config.glow} flex items-center gap-3 max-w-sm whitespace-pre-wrap`}>
            {config.icon}
            <span className={`text-[13px] font-medium leading-tight ${config.text}`}>
              {toast}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function PublicRoute({ children }) {
  const { isAuthenticated, isDemoMode } = useAuthStore();
  const token = localStorage.getItem('token');
  if (token || (isAuthenticated && !isDemoMode)) {
    return <Navigate to="/chat" replace />;
  }
  return children;
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children ? children : <Outlet />;
}

const envEmails = ('')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

const ADMIN_EMAILS = ['mindcraftgamer26@gmail.com', 'demo@hirenextai.com', 'your-real-email@gmail.com', ...envEmails];


function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const email = (storedUser?.email || '').toLowerCase();
  const isAdmin =
    storedUser?.role === 'admin' || ADMIN_EMAILS.includes(email);

  if (!isAdmin) {
    return <Navigate to="/chat" replace />;
  }

  return children;
}

export default function App() {
  const { interfaceLanguage, fetchSettings } = useSettingsStore();
  const { fetchMe, token } = useAuthStore();

  useEffect(() => {
    if (token || localStorage.getItem('token')) {
      fetchMe();
      fetchSettings();
    }
  }, []);

  useEffect(() => {
    if (interfaceLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = interfaceLanguage;
    }
  }, [interfaceLanguage]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Landing & Content Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/features" element={<Features />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/refund" element={<Navigate to="/refund-policy" replace />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/v1-preview" element={<V1Preview />} />
        
        {/* Authentication Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Demo chat — no login required */}
        <Route path="/demo" element={<ChatPage demo />} />
        <Route path="/preview" element={<Navigate to="/demo" replace />} />
        <Route path="/extension" element={<Extension />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

        {/* Authenticated Dashboard Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/mock-interview" element={<Navigate to="/interview" replace />} />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/connect-accounts" element={<ConnectAccounts />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <PricingModal />
      <Toast />
      <CookieConsent />
    </BrowserRouter>
  );
}

