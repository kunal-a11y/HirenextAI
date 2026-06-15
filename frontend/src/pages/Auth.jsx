import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import useUserStore from "../store/useUserStore";
import useUIStore from "../store/useUIStore";
import api from "../lib/api";
import anime from "animejs/lib/anime.es.js";
import {
  Loader2, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff,
  Sparkles, Briefcase, Building2, Target, Rocket, Zap, CheckCircle
} from "lucide-react";
import { Logo } from "../components/Logo";
import { DemoRoleModal } from "../components/DemoRoleModal";
import { motion, AnimatePresence } from "framer-motion";
import OTPVerification from "../components/auth/OTPVerification";

function InputRow({ icon: Icon, type, name, placeholder, value, onChange, required, minLength, autoFocus, rightElement }) {
  return (
    <div className="group flex items-center gap-3 rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] px-4 py-3.5 transition-all duration-200 focus-within:border-[#444444] focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]">
      <Icon className="h-4 w-4 shrink-0 text-[#555555] transition-colors duration-200 group-focus-within:text-white/60" />
      <input
        type={type}
        name={name}
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="min-w-0 flex-1 bg-transparent text-sm leading-none text-white placeholder:text-[#333333] focus:outline-none"
      />
      {rightElement}
    </div>
  );
}

export default function Auth() {
  const { login, signup, isLoading, setDemoMode } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const defaultMode = location.pathname.startsWith("/register") ? "signup" : "signin";
  const [mode, setMode] = useState(defaultMode);
  const [emailStep, setEmailStep] = useState("idle");
  const [phoneStep, setPhoneStep] = useState("idle");
  const [role, setRole] = useState("job_seeker");
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpHint, setOtpHint] = useState(null);
  const [otpArray, setOtpArray] = useState(Array(6).fill(""));
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const otpRefs = useRef([]);
  const leftPanelRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => { setOtp(otpArray.join("")); }, [otpArray]);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const { showToast } = useUIStore();
  const emailInputRef = useRef(null);
  const API = import.meta.env.VITE_API_URL ?? "/api";
  const demoEnabled = true;

  // Password strength calculator
  useEffect(() => {
    if (!password) { setPasswordStrength(0); return; }
    let score = 0;
    if (password.length >= 6) score += 25;
    if (password.length >= 10) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[a-z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    setPasswordStrength(Math.min(score, 100));
  }, [password]);

  const strengthLabel = passwordStrength <= 25 ? "Weak" : passwordStrength <= 50 ? "Fair" : passwordStrength <= 75 ? "Good" : "Strong";
  const strengthColor = passwordStrength <= 25 ? "#EF4444" : passwordStrength <= 50 ? "#F59E0B" : passwordStrength <= 75 ? "#EAB308" : "#22C55E";

  // Anime.js stagger animation for left panel features
  useEffect(() => {
    if (leftPanelRef.current) {
      anime({
        targets: '.auth-feature-item',
        opacity: [0, 1],
        translateX: [-20, 0],
        duration: 500,
        easing: 'easeOutExpo',
        delay: anime.stagger(120, { start: 300 })
      });
      anime({
        targets: '.auth-left-heading',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: 'easeOutExpo',
        delay: 100
      });
      anime({
        targets: '.auth-left-stat',
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 500,
        easing: 'easeOutBack',
        delay: 700
      });
    }
  }, [mode]);

  // Anime.js stagger for form elements
  useEffect(() => {
    if (formRef.current) {
      anime({
        targets: '.auth-form-element',
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 400,
        easing: 'easeOutExpo',
        delay: anime.stagger(60, { start: 150 })
      });
    }
  }, [mode, forgotPasswordMode]);

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSendingReset(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      showToast("Reset link sent to your email");
      setForgotPasswordMode(false);
    } catch (err) {
      setError(err.response?.data?.error || "Could not send password reset email.");
    } finally {
      setIsSendingReset(false);
    }
  };

  useEffect(() => {
    setMode(location.pathname.startsWith("/register") ? "signup" : "signin");
  }, [location.pathname]);

  useEffect(() => {
    if (phoneStep !== "idle" || emailStep !== "form") return;
    const frame = window.requestAnimationFrame(() => {
      emailInputRef.current?.focus();
      emailInputRef.current?.select();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [emailStep, phoneStep]);

  const reset = (newMode) => {
    setMode(newMode);
    setEmailStep("idle");
    setPhoneStep("idle");
    setForgotPasswordMode(false);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setOtp("");
    setOtpArray(Array(6).fill(""));
    navigate(newMode === "signup" ? "/register" : "/login");
  };

  const redirectAfterAuth = () => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect");
    const redirectState = location.state?.redirectAfter;
    if (redirectState) navigate(redirectState);
    else if (redirect) navigate(redirect);
    else navigate("/chat");
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "signin") {
        const res = await login(email, password);
        if (res.success) redirectAfterAuth();
        else setError(res.error || "Login failed. Please check your credentials.");
      } else {
        const res = await signup(name, email, password);
        if (res.success) redirectAfterAuth();
        else setError(res.error || "Signup failed. Please check your inputs.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    const roleQuery = mode === "signup" ? `?role=${role}` : "";
    window.location.href = `${API}/auth/google${roleQuery}`;
  };

  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    setError("");
    setOtpHint(null);
    try {
      const res = await fetch(`${API}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to send OTP.");
      setPhoneStep("enter_otp");
      if (data?.otp) setOtpHint(`Dev OTP: ${data.otp}`);
    } catch (err) {
      setError(err.message || "Failed to send OTP.");
    }
  };

  const handlePhoneVerifySuccess = (token, user) => {
    localStorage.setItem("token", token);
    if (user) localStorage.setItem("user", JSON.stringify(user));
    useAuthStore.setState({ user, token, isAuthenticated: true, isDemoMode: false });
    const nameVal = user?.name || '';
    const [firstName = 'User', ...rest] = nameVal.split(' ').filter(Boolean);
    useUserStore.getState().setUser({
      ...user, firstName, lastName: rest.join(' '),
      initials: `${firstName[0] || ''}${rest[0]?.[0] || firstName[0] || 'U'}`.toUpperCase(),
      demoMode: false
    });
    redirectAfterAuth();
  };

  const handleDemoSelect = (demoRole) => {
    setDemoLoading(true);
    setDemoMode();
    setDemoLoading(false);
    setDemoModalOpen(false);
    navigate("/demo");
  };

  if (phoneStep === "enter_otp") {
    return <OTPVerification phone={phone} onVerify={handlePhoneVerifySuccess} onResend={() => handleSendOtp()} />;
  }

  const features = [
    { icon: Target, text: "Track every job application" },
    { icon: Zap, text: "Practice with AI interviews" },
    { icon: Rocket, text: "Get hired 3x faster" },
  ];

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-black">
      {/* Left Decorative Panel - Hidden on mobile */}
      <div ref={leftPanelRef} className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: '#000000', backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        
        {/* Decorative gradient blob */}
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-white/[0.02] blur-[120px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="auth-left-heading">
            <h2 className="text-3xl font-display font-bold text-white mb-3 leading-tight">
              Your AI Career<br />Assistant
            </h2>
            <p className="text-[#555555] text-sm max-w-[300px]">Everything you need to land your dream job, powered by AI.</p>
          </div>

          <div className="mt-12 space-y-5">
            {features.map((feat, i) => {
              const FIcon = feat.icon;
              return (
                <div key={i} className="auth-feature-item flex items-center gap-4 opacity-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1F1F1F] bg-[#111111]">
                    <FIcon className="h-5 w-5 text-white/70" />
                  </div>
                  <span className="text-sm font-medium text-white/80">{feat.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="auth-left-stat opacity-0 relative z-10">
          <div className="flex items-center gap-3 rounded-xl border border-[#1F1F1F] bg-[#111111] px-5 py-4 max-w-[280px]">
            <div className="flex -space-x-2">
              {['bg-blue-500', 'bg-green-500', 'bg-amber-500'].map((bg, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${bg} border-2 border-black flex items-center justify-center text-[9px] font-bold text-white`}>
                  {['K', 'A', 'R'][i]}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-white">10,000+ students</p>
              <p className="text-[10px] text-[#555555]">trust HirenextAI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-[-10%] top-[15%] h-[400px] w-[400px] rounded-full bg-white/[0.015] blur-[120px]" />
        </div>

        <div ref={formRef} className="relative z-10 w-full max-w-[400px]">
          {/* Logo */}
          <div className="auth-form-element mb-8 text-center">
            <a href="/" className="block cursor-pointer transition-opacity hover:opacity-80">
              <Logo size="md" />
            </a>
          </div>

          <div className="auth-form-element mb-6 text-center">
            <h1 className="font-display text-[1.5rem] font-bold text-white">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1.5 text-sm text-[#555555]">
              {mode === "signin" ? "Sign in to your account" : "Start your AI-powered job search"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#1F1F1F] bg-[#111111] p-7">
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {phoneStep === "idle" ? (
                <>
                  {forgotPasswordMode ? (
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                      <div className="auth-form-element group flex items-center gap-3 rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] px-4 py-3.5 transition-all duration-200 focus-within:border-[#444444] focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]">
                        <Mail className="h-4 w-4 shrink-0 text-[#555555]" />
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-[#333333] focus:outline-none" />
                      </div>
                      <button type="submit" disabled={isSendingReset} className="auth-form-element mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
                        {isSendingReset ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send Reset Link <ArrowRight className="h-4 w-4" /></>}
                      </button>
                      <button type="button" onClick={() => { setForgotPasswordMode(false); setError(""); }} className="w-full py-1 text-center text-xs text-[#555555] transition-colors hover:text-white/60">
                        ← Back to login
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleEmailSubmit} className="space-y-3">
                      {mode === "signup" && (
                        <div className="auth-form-element">
                          <InputRow icon={User} type="text" name="name" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                      )}

                      <div className="auth-form-element">
                        <div className="group flex items-center gap-3 rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] px-4 py-3.5 transition-all duration-200 focus-within:border-[#444444] focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]">
                          <Mail className="h-4 w-4 shrink-0 text-[#555555] transition-colors duration-200 group-focus-within:text-white/60" />
                          <input ref={emailInputRef} type="email" name="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" autoFocus={mode === "signin"} className="min-w-0 flex-1 bg-transparent text-sm leading-none text-white placeholder:text-[#333333] focus:outline-none" />
                        </div>
                      </div>

                      <div className="auth-form-element">
                        <InputRow
                          icon={Lock}
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          minLength={6}
                          rightElement={
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#555555] hover:text-white/60 transition-colors">
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          }
                        />
                      </div>

                      {/* Password strength bar for signup */}
                      {mode === "signup" && password.length > 0 && (
                        <div className="auth-form-element">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 rounded-full bg-[#1F1F1F] overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${passwordStrength}%`, background: strengthColor }} />
                            </div>
                            <span className="text-[10px] font-semibold" style={{ color: strengthColor }}>{strengthLabel}</span>
                          </div>
                        </div>
                      )}

                      {mode === "signin" && (
                        <div className="auth-form-element text-left mt-1">
                          <button type="button" onClick={() => { setForgotPasswordMode(true); setError(""); }} className="text-xs text-[#555555] transition-colors hover:text-white/70">
                            Forgot password?
                          </button>
                        </div>
                      )}

                      <button type="submit" disabled={isLoading} className="auth-form-element mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{mode === "signin" ? "Sign In" : "Create Account"} <ArrowRight className="h-4 w-4" /></>}
                      </button>
                    </form>
                  )}

                  {/* Divider */}
                  <div className="auth-form-element flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-[#1F1F1F]" />
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[#333333]">or</span>
                    <div className="h-px flex-1 bg-[#1F1F1F]" />
                  </div>

                  {/* Google Button */}
                  <div className="auth-form-element">
                    <button onClick={handleGoogleLogin} disabled={googleLoading} className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] py-3.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#161616] hover:border-[#2A2A2A]">
                      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                      {googleLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-white/40" />}
                    </button>
                  </div>

                  {/* Phone button (coming soon) */}
                  <div className="auth-form-element w-full flex flex-col items-center">
                    <button disabled={true} className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] py-3.5 text-sm font-medium text-[#555555] cursor-not-allowed">
                      <Phone className="h-4 w-4 shrink-0" />
                      Continue with Phone
                      <Lock className="h-3.5 w-3.5 shrink-0 text-yellow-400 fill-yellow-400/20 ml-1.5" />
                    </button>
                    <span className="text-[10px] text-[#333333] mt-1">Coming soon</span>
                  </div>
                </>
              ) : (
                /* Phone OTP forms - kept intact */
                <AnimatePresence mode="wait">
                  {phoneStep === "enter_phone" && (
                    <motion.form key="phone-input" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} onSubmit={handleSendOtp} className="space-y-2.5">
                      <div className="mb-1 flex items-center gap-2">
                        <button type="button" onClick={() => { setPhoneStep("idle"); setError(""); }} className="shrink-0 px-1 text-xs text-[#555555] hover:text-white/60">×</button>
                        <span className="text-xs font-medium text-[#555555]">Phone OTP</span>
                      </div>
                      <InputRow icon={Phone} type="tel" name="phone" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} required autoFocus />
                      <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black transition-all hover:bg-white/90">
                        Send OTP <ArrowRight className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => { setPhoneStep("idle"); setError(""); }} className="w-full py-1 text-center text-xs text-[#555555] hover:text-white/60">← Back to email sign in</button>
                    </motion.form>
                  )}
                </AnimatePresence>
              )}
            </div>

            {demoEnabled && mode === "signup" && phoneStep === "idle" && (
              <div className="mt-5 text-center">
                <button onClick={() => setDemoModalOpen(true)} className="group inline-flex items-center gap-1.5 text-sm text-[#555555] hover:text-white/60 transition-colors">
                  <Sparkles className="h-3.5 w-3.5 transition-colors group-hover:text-white/50" />
                  Try Demo First
                </button>
              </div>
            )}
          </div>

          <div className="mt-5 px-2 text-center">
            <p className="text-xs leading-relaxed text-[#333333]">
              By continuing, you agree to HirenextAI's{" "}
              <a href="/terms" className="text-[#555555] underline underline-offset-2 hover:text-white/70">Terms</a>
              {" "}and{" "}
              <a href="/privacy-policy" className="text-[#555555] underline underline-offset-2 hover:text-white/70">Privacy Policy</a>
            </p>
          </div>

          <DemoRoleModal open={demoModalOpen} onClose={() => setDemoModalOpen(false)} onSelect={handleDemoSelect} loading={demoLoading} />

          <p className="mt-5 text-center text-sm text-[#555555]">
            {mode === "signin" ? (
              <>Don't have an account?{" "}<button onClick={() => reset("signup")} className="font-semibold text-white hover:underline">Sign up →</button></>
            ) : (
              <>Already have an account?{" "}<button onClick={() => reset("signin")} className="font-semibold text-white hover:underline">Sign in →</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
