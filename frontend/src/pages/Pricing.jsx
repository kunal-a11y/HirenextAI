import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import anime from "animejs/lib/anime.es.js";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { CheckCircle2, X, Loader2, ChevronDown, Sparkles, Shield, Zap, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import useUIStore from "../store/useUIStore";

const API = import.meta.env.VITE_API_URL ?? "/api";

function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [paying, setPaying] = useState(null);
  const { isAuthenticated, user, token, updateUser } = useAuthStore();
  const { showToast } = useUIStore();
  const navigate = useNavigate();
  const cardsRef = useRef(null);
  const headerRef = useRef(null);

  const handlePay = async (planName, planId) => {
    if (!isAuthenticated) {
      navigate('/register', { state: { redirectAfter: '/pricing' } });
      return;
    }
    setPaying(planName);
    const authHeaders = {
      "Content-Type": "application/json",
      ...((token || localStorage.getItem('token')) ? { Authorization: `Bearer ${token || localStorage.getItem('token')}` } : {}),
    };
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { showToast("Failed to load payment gateway."); setPaying(null); return; }
      const res = await fetch(`${API}/payment/create-order`, {
        method: "POST", headers: authHeaders,
        body: JSON.stringify({ planId, plan: planName, type: "job_seeker", billing: annual ? "annual" : "monthly", currency: "INR" }),
      });
      if (!res.ok) {
        let errorMsg = "Failed to create order";
        try { const errData = await res.json(); if (errData?.error) errorMsg = errData.error; else if (errData?.message) errorMsg = errData.message; } catch {}
        throw new Error(errorMsg);
      }
      const order = await res.json();
      const options = {
        key: order.keyId, amount: order.amount, currency: order.currency ?? "INR",
        name: "HirenextAI",
        description: `${planName.toUpperCase()} Plan — ${annual ? "Annual" : "Monthly"}`,
        order_id: order.orderId ?? order.id,
        prefill: { name: user?.name ?? "", email: user?.email ?? "" },
        theme: { color: "#000000" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API}/payment/verify`, {
              method: "POST", headers: authHeaders,
              body: JSON.stringify({ ...response, planId, plan: planName, type: "job_seeker", billing: annual ? "annual" : "monthly" }),
            });
            if (!verifyRes.ok) throw new Error("Verification failed");
            const verified = await verifyRes.json();
            if (verified?.plan) updateUser({ plan: verified.plan });
            showToast(`Your ${planName.toUpperCase()} plan is now active.`);
          } catch { showToast("Payment received. Your plan will activate shortly."); }
          setPaying(null); navigate("/chat");
        },
        modal: {
          ondismiss: () => {
            fetch(`${API}/payment/failed`, {
              method: "POST", headers: authHeaders,
              body: JSON.stringify({ orderId: order.orderId ?? order.id, plan: planName, planId, reason: "Checkout closed before completion." }),
            }).catch(() => {});
            setPaying(null);
          },
        },
      };
      new window.Razorpay(options).open();
    } catch (err) { showToast(err.message || "Something went wrong."); setPaying(null); }
  };

  const plans = [
    {
      id: 1, name: "Free", badge: "FREE", tagline: "Perfect to try HirenextAI", highlight: false,
      priceMonthly: "0", priceYearly: "0",
      badgeGradient: "from-zinc-150 to-neutral-200 text-neutral-800 border-neutral-300",
      features: [
        { text: "HirenextAI 0.1 model access", included: true },
        { text: "5,000 Daily Credits", included: true },
        { text: "ATS Resume Builder", included: true },
        { text: "Basic ATS Resume Analysis", included: true },
        { text: "Job Search & Tracking", included: true },
        { text: "AI Career Assistant", included: true },
        { text: "Interview Practice (HR)", included: true },
        { text: "Basic AI Responses", included: true },
        { text: "AI Cover Letters & Templates", included: false },
        { text: "Priority Support queue", included: false },
      ],
      action: () => navigate("/register"),
    },
    {
      id: 2, name: "Plus", badge: "POPULAR", tagline: "For active job seekers", highlight: true,
      priceMonthly: "149", priceYearly: "119", yearlyBilledText: "billed ₹1,428/yr", savings: "Save ₹360/year",
      badgeGradient: "from-blue-500 to-indigo-600 text-white border-transparent",
      features: [
        { text: "HirenextAI Flash model access", included: true },
        { text: "Faster response speeds", included: true },
        { text: "20,000 Monthly Credits", included: true },
        { text: "Better ATS Resume Analysis", included: true },
        { text: "Unlimited Job Search", included: true },
        { text: "AI Cover Letters", included: true },
        { text: "AI Recruiter Messages", included: true },
        { text: "AI Career Roadmaps", included: true },
        { text: "Priority Support", included: true },
        { text: "Recruiter Dashboard access", included: false },
      ],
      action: () => handlePay("plus", 2),
    },
    {
      id: 3, name: "Pro", badge: "PRO", tagline: "For serious professionals", highlight: false,
      priceMonthly: "299", priceYearly: "239", yearlyBilledText: "billed ₹2,868/yr", savings: "Save ₹720/year",
      badgeGradient: "from-purple-500 to-indigo-600 text-white border-transparent",
      features: [
        { text: "HirenextAI Pro model access", included: true },
        { text: "Unlimited Credits (Fair Usage)", included: true },
        { text: "Fastest AI Responses", included: true },
        { text: "Premium Resume Intelligence", included: true },
        { text: "Advanced Interview AI", included: true },
        { text: "Career Analytics Dashboard", included: true },
        { text: "Recruiter Dashboard Access", included: true },
        { text: "Future Premium Features", included: true },
        { text: "Priority Support Queue", included: true },
        { text: "Personal Career Coaching", included: true },
      ],
      action: () => handlePay("pro", 3),
    }
  ];

  const faqs = [
    { q: "Can I cancel anytime?", a: "Yes. Cancel your subscription anytime from your account settings. Your access continues until the end of your billing period." },
    { q: "What are HirenextAI Credits?", a: "HirenextAI Credits power all AI features. Generative resume drafts, keyword density optimization checks, and messages with the AI career assistant consume credits. Credits reset automatically every day." },
    { q: "How does the free plan work?", a: "The Free plan gives you access to the HirenextAI 0.1 model with 5,000 daily credits at no cost. Perfect for occasional job seekers. Upgrade as your search intensifies." },
    { q: "Is there a refund policy?", a: "We offer a 7-day refund for new paid subscribers. Contact us at support@hirenextai.com within 7 days of your first payment." },
    { q: "What is Apply with AI?", a: "Our Google Chrome extension that automatically maps and autofills job application portal forms with your details. Available on Plus and Pro plans." },
    { q: "Do prices include GST?", a: "Displayed prices exclude GST. 18% GST will be added at checkout as per Indian tax regulations." }
  ];

  useEffect(() => {
    anime({
      targets: '.pricing-animate',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 600,
      easing: 'easeOutExpo',
      delay: anime.stagger(85, { start: 100 })
    });
    anime({
      targets: '.pricing-card-animate',
      opacity: [0, 1],
      translateY: [40, 0],
      scale: [0.97, 1],
      duration: 500,
      easing: 'easeOutBack',
      delay: anime.stagger(100, { start: 300 })
    });
  }, []);

  useEffect(() => {
    if (openFaq !== null) {
      anime({
        targets: `.faq-answer-${openFaq}`,
        opacity: [0, 1],
        height: [0, 'auto'],
        duration: 300,
        easing: 'easeOutExpo'
      });
    }
  }, [openFaq]);

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", overflowX: "hidden", width: "100%", position: "relative" }}>
      {/* Subtle grid background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: 'linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)', backgroundSize: "40px 40px", maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 40%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 40%, transparent 100%)" }} />
      </div>

      {/* Background ambient glow shapes */}
      <div className="absolute top-[-10%] left-[-100px] w-96 h-96 bg-purple-50 rounded-full blur-[130px] opacity-40 pointer-events-none" />
      <div className="absolute top-[40%] right-[-100px] w-96 h-96 bg-blue-50 rounded-full blur-[130px] opacity-45 pointer-events-none" />

      <div className="relative z-10">
        <Navbar />

        {/* Header */}
        <section ref={headerRef} className="pt-36 pb-16 px-6 text-center">
          {/* Accent tag badge */}
          <div className="pricing-animate inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 text-blue-750 mb-6 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-blue-650" />
            Simple, Transparent Pricing
          </div>
          
          <h1 className="pricing-animate font-display font-extrabold text-black tracking-tight mb-3" style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.1 }}>
            Invest in Your Future
          </h1>
          <p className="pricing-animate text-neutral-500 text-sm max-w-xl mx-auto mb-8 font-medium">
            Start free with HirenextAI 0.1 model access. Upgrade to Flash or Pro when you are ready to accelerate.
          </p>

          {/* Toggle */}
          <div className="pricing-animate inline-flex items-center rounded-full border border-neutral-150 bg-neutral-50/80 backdrop-blur-xl p-1">
            <button onClick={() => setAnnual(false)} className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-200 ${!annual ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'}`}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)} className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${annual ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'}`}>
              Yearly
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-50 border border-emerald-250/50 text-emerald-700">Save 20%</span>
            </button>
          </div>
        </section>

        {/* Cards Grid */}
        <section ref={cardsRef} className="pb-16 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1050px] mx-auto items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="pricing-card-animate flex flex-col relative rounded-2xl p-7 transition-all duration-300 bg-white border hover:shadow-[0_12px_48px_rgba(0,0,0,0.04)]"
                style={{
                  borderColor: plan.highlight ? '#000000' : '#E5E7EB',
                  boxShadow: plan.highlight ? '0 10px 30px rgba(0,0,0,0.03)' : '0 4px 12px rgba(0,0,0,0.01)',
                }}
                onMouseEnter={(e) => {
                  anime({ targets: e.currentTarget, translateY: -6, duration: 250, easing: 'easeOutQuad' });
                }}
                onMouseLeave={(e) => {
                  anime({ targets: e.currentTarget, translateY: 0, duration: 250, easing: 'easeOutQuad' });
                }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`whitespace-nowrap text-[9px] font-extrabold px-3 py-1 rounded-full border bg-gradient-to-r shadow-sm uppercase tracking-wider ${plan.badgeGradient}`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mt-5 mb-4">
                  <h3 className="font-display text-xl font-bold text-black flex items-center gap-1.5">
                    {plan.name}
                    {plan.highlight && <span className="text-[9px] px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 text-blue-700 uppercase tracking-widest font-extrabold">Most Popular</span>}
                  </h3>
                  <p className="text-xs text-neutral-450 font-medium mt-1">{plan.tagline}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-semibold text-neutral-400">₹</span>
                    <span className="font-display text-5xl font-extrabold text-black tracking-tight leading-none">{annual ? plan.priceYearly : plan.priceMonthly}</span>
                    <span className="text-xs text-neutral-400 font-bold uppercase ml-0.5">/ month</span>
                  </div>
                  {annual && plan.yearlyBilledText && <p className="text-[10px] font-bold text-neutral-400 mt-1.5 uppercase tracking-wider">{plan.yearlyBilledText}</p>}
                  {annual && plan.savings && (
                    <div className="mt-2">
                      <span className="inline-flex text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-250/50 text-emerald-700 uppercase tracking-wider">{plan.savings}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-neutral-100 mb-5" />

                {/* Features */}
                <div className="flex-1">
                  <ul className="space-y-3.5">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs font-medium">
                        {f.included ? (
                          <CheckCircle2 size={16} className="text-emerald-550 shrink-0 mt-0.5" />
                        ) : (
                          <X size={14} className="text-neutral-300 shrink-0 mt-0.5" />
                        )}
                        <span className={f.included ? 'text-neutral-700' : 'text-neutral-400 line-through'}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button */}
                <div className="mt-8 pt-4">
                  {plan.note && <p className="text-center text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-3">{plan.note}</p>}
                  <button
                    onClick={plan.action}
                    disabled={paying === plan.name.toLowerCase()}
                    className="w-full py-3.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm hover:shadow"
                    style={{
                      background: plan.highlight ? '#000000' : '#FFFFFF',
                      color: plan.highlight ? '#FFFFFF' : '#000000',
                      border: '1px solid #000000',
                    }}
                  >
                    {paying === plan.name.toLowerCase() ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : plan.name === "Free" ? (
                      "Get Started Free"
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 max-w-[700px] mx-auto px-6 relative">
          <h2 className="pricing-animate text-2xl font-display font-bold text-black text-center mb-2">Frequently Asked Questions</h2>
          <p className="pricing-animate text-neutral-450 text-xs text-center mb-10 font-medium">Everything you need to know before signing up.</p>

          <div className="space-y-3 relative z-10">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="pricing-card-animate rounded-2xl border overflow-hidden transition-colors duration-200"
                  style={{ background: '#FFFFFF', borderColor: isOpen ? '#A3A3A3' : '#E5E7EB' }}>
                  <button onClick={() => setOpenFaq(isOpen ? null : i)} className="w-full flex justify-between items-center px-6 py-5 text-left active:bg-neutral-50/50">
                    <span className="text-xs font-bold text-neutral-800">{faq.q}</span>
                    <ChevronDown size={16} className={`text-neutral-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className={`faq-answer-${i} px-6 pb-5`}>
                      <p className="text-xs text-neutral-500 leading-relaxed font-medium">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Upgraded Premium Bottom CTA */}
        <section className="py-24 bg-white border-t border-neutral-100 relative overflow-hidden text-center z-10">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:24px_24px]" />
          </div>

          <div className="max-w-4xl mx-auto px-6 relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-100 to-red-50 border border-orange-250/50 text-orange-700 mb-6 shadow-sm"
            >
              <Target className="w-3.5 h-3.5 text-orange-650" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Start Optimization</span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black text-black tracking-tight leading-[1.1] mb-6"
            >
              Ready To Accelerate<br />
              <span className="bg-gradient-to-r from-neutral-400 via-neutral-600 to-black bg-clip-text text-transparent">Your Career?</span>
            </motion.h2>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-neutral-500 text-xs max-w-xl mx-auto mb-10 leading-relaxed font-semibold"
            >
              Choose the plan that fits your goals and unlock HirenextAI models designed to help you build resumes, optimize keyword profiles, and prepare for interviews.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3.5 justify-center mb-10"
            >
              <button
                onClick={() => navigate("/register")}
                className="h-11 px-7 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl text-xs flex items-center justify-center transition-all shadow-md active:scale-[0.98]"
              >
                Get Started Free
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (cardsRef.current) {
                    cardsRef.current.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="h-11 px-7 bg-white hover:bg-neutral-50 border border-neutral-200 text-black font-bold rounded-xl text-xs flex items-center justify-center transition-all shadow-sm active:scale-[0.98]"
              >
                Compare Plans
              </button>
            </motion.div>

            {/* Trust Row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-2 mb-16"
            >
              {["No Credit Card Required", "Cancel Anytime", "Secure Payments", "Instant Access"].map((item) => (
                <span key={item} className="px-3 py-1 rounded-full bg-neutral-50 border border-neutral-100 text-[9px] font-bold text-neutral-600 flex items-center gap-1.5 uppercase tracking-wider shadow-sm">
                  <span className="text-emerald-500 font-bold text-[8.5px]">✓</span> {item}
                </span>
              ))}
            </motion.div>

            {/* Floating Visual Cards */}
            <div className="hidden lg:block relative h-8 max-w-4xl mx-auto overflow-visible pointer-events-none">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-[-40px] top-[-150px] bg-white border border-neutral-150 rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-2 pointer-events-auto hover:scale-105 transition-all font-sans"
              >
                <span className="text-emerald-500 font-bold text-[10px]">✓</span>
                <span className="text-[10px] font-bold text-black uppercase tracking-wider font-sans">HirenextAI 0.1</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="absolute left-[-90px] top-[-80px] bg-white border border-neutral-150 rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-2 pointer-events-auto hover:scale-105 transition-all font-sans"
              >
                <span className="text-emerald-500 font-bold text-[10px]">✓</span>
                <span className="text-[10px] font-bold text-black uppercase tracking-wider font-sans">HirenextAI Flash ⚡</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                className="absolute left-[-20px] top-[-20px] bg-white border border-neutral-150 rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-2 pointer-events-auto hover:scale-105 transition-all font-sans"
              >
                <span className="text-emerald-500 font-bold text-[10px]">✓</span>
                <span className="text-[10px] font-bold text-black uppercase tracking-wider font-sans">HirenextAI Pro 🚀</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                className="absolute right-[-40px] top-[-150px] bg-white border border-neutral-150 rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-2 pointer-events-auto hover:scale-105 transition-all font-sans"
              >
                <span className="text-emerald-500 font-bold text-[10px]">✓</span>
                <span className="text-[10px] font-bold text-black uppercase tracking-wider font-sans">Daily Credits</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.0, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                className="absolute right-[-90px] top-[-80px] bg-white border border-neutral-150 rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-2 pointer-events-auto hover:scale-105 transition-all font-sans"
              >
                <span className="text-emerald-500 font-bold text-[10px]">✓</span>
                <span className="text-[10px] font-bold text-black uppercase tracking-wider font-sans">ATS Matching</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, -9, 0] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 1.0 }}
                className="absolute right-[-20px] top-[-20px] bg-white border border-neutral-150 rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-2 pointer-events-auto hover:scale-105 transition-all font-sans"
              >
                <span className="text-emerald-500 font-bold text-[10px]">✓</span>
                <span className="text-[10px] font-bold text-black uppercase tracking-wider font-sans">SecurityVault</span>
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
