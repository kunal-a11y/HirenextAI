import React, { useState, useEffect, useRef } from "react";
import anime from "animejs/lib/anime.es.js";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { CheckCircle2, X, Loader2, ChevronDown } from "lucide-react";
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
        name: "HireNextAI",
        description: `${planName.toUpperCase()} Plan — ${annual ? "Annual" : "Monthly"}`,
        order_id: order.orderId ?? order.id,
        prefill: { name: user?.name ?? "", email: user?.email ?? "" },
        theme: { color: "#FFFFFF" },
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
      id: 1, name: "Free", badge: "Get Started", tagline: "Perfect to try HirenextAI", highlight: false,
      priceMonthly: "0", priceYearly: "0",
      features: [
        { text: "20 AI Credits per month", included: true }, { text: "10 Job Applications tracking", included: true },
        { text: "Basic Job Search", included: true }, { text: "AI Chat (1 credit/message)", included: true },
        { text: "Cover Letter (2 credits each)", included: true }, { text: "Resume Review (3 credits each)", included: true },
        { text: "Apply with AI (Extension)", included: false }, { text: "Mock Interview AI", included: false }, { text: "Priority Support", included: false },
      ],
      action: () => navigate("/register"),
    },
    {
      id: 2, name: "Pro", badge: "Most Popular", tagline: "For active job seekers", highlight: true,
      priceMonthly: "299", priceYearly: "249", yearlyBilledText: "billed ₹2,988/yr", savings: "Save ₹600/year",
      features: [
        { text: "200 AI Credits per month", included: true }, { text: "Unlimited Job Tracking", included: true },
        { text: "Advanced Job Search", included: true }, { text: "Unlimited AI Chat", included: true },
        { text: "Unlimited Cover Letters", included: true }, { text: "Unlimited Resume Reviews", included: true },
        { text: "Apply with AI (Extension)", included: true }, { text: "Mock Interview AI (5/day)", included: true },
        { text: "Priority Support", included: false }, { text: "Career Coaching", included: false },
      ],
      action: () => handlePay("pro", 2),
    },
    {
      id: 3, name: "Max", badge: "Power User", tagline: "For serious professionals", highlight: false,
      priceMonthly: "599", priceYearly: "499", yearlyBilledText: "billed ₹5,988/yr", savings: "Save ₹1,200/year",
      features: [
        { text: "Unlimited AI Credits", included: true }, { text: "Unlimited Everything in Pro", included: true },
        { text: "Mock Interview AI (Unlimited)", included: true }, { text: "Priority Support (24hr)", included: true },
        { text: "Early Access to New Features", included: true }, { text: "Advanced Analytics Dashboard", included: true },
        { text: "LinkedIn Profile Optimization", included: true }, { text: "1 Career Coaching Session/month", included: true },
        { text: "Team Features", included: false },
      ],
      action: () => handlePay("max", 3),
    },
    {
      id: 4, name: "Ultimate", badge: "Family & Friends", tagline: "Share with family & friends", highlight: false,
      priceMonthly: "999", priceYearly: "799", yearlyBilledText: "billed ₹9,588/yr", savings: "Save ₹2,400/year",
      note: "Perfect for family job seekers",
      features: [
        { text: "Everything in Max", included: true }, { text: "Up to 5 Members", included: true },
        { text: "Each member gets full Pro access", included: true }, { text: "Shared Job Tracking Dashboard", included: true },
        { text: "Family Admin Panel", included: true }, { text: "Priority Support (12hr)", included: true },
        { text: "Unlimited AI Credits for all", included: true }, { text: "All AI Features for all", included: true },
        { text: "Early Access to New Features", included: true },
      ],
      action: () => handlePay("ultimate", 4),
    },
  ];

  const faqs = [
    { q: "Can I cancel anytime?", a: "Yes. Cancel your subscription anytime from your account settings. Your access continues until the end of your billing period." },
    { q: "What are AI Credits?", a: "AI Credits power all AI features. Cover letter generation uses 2 credits, resume review uses 3 credits, and AI chat uses 1 credit per message. Credits reset every month." },
    { q: "How does the free plan work?", a: "The free plan gives you 20 AI credits monthly with no time limit. Perfect for occasional job searching. Upgrade when you need more power." },
    { q: "Is there a refund policy?", a: "We offer a 7-day refund for new paid subscribers. Contact us at support@hirenextai.com within 7 days of your first payment." },
    { q: "What is Apply with AI?", a: "Our Chrome extension that automatically fills job application forms with your details. Available on Pro plan and above." },
    { q: "Do prices include GST?", a: "Displayed prices exclude GST. 18% GST will be added at checkout as per Indian tax regulations." }
  ];

  // Anime.js page entrance animation
  useEffect(() => {
    anime({
      targets: '.pricing-animate',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 600,
      easing: 'easeOutExpo',
      delay: anime.stagger(80, { start: 100 })
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

  // Animate FAQ items when opened
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
    <div style={{ minHeight: "100vh", background: "#000000", overflowX: "hidden", width: "100%", position: "relative" }}>
      {/* Subtle grid background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: "40px 40px", maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 40%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 40%, transparent 100%)" }} />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Header */}
        <section ref={headerRef} className="pt-36 pb-16 px-6 text-center">
          <div className="pricing-animate inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#1F1F1F] bg-[#111111] text-sm text-[#999999] mb-6">
            Simple, transparent pricing
          </div>
          <h1 className="pricing-animate font-display font-extrabold text-white tracking-tight mb-3" style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.1 }}>
            Invest in Your Future
          </h1>
          <p className="pricing-animate text-[#555555] text-base max-w-xl mx-auto mb-8">
            Start free. Upgrade when ready. Cancel anytime. No hidden fees.
          </p>

          {/* Toggle */}
          <div className="pricing-animate inline-flex items-center rounded-full border border-[#1F1F1F] bg-[#111111] p-1">
            <button onClick={() => setAnnual(false)} className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${!annual ? 'bg-white text-black' : 'text-[#555555] hover:text-white'}`}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)} className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${annual ? 'bg-white text-black' : 'text-[#555555] hover:text-white'}`}>
              Yearly
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/25">Save 20%</span>
            </button>
          </div>
        </section>

        {/* Cards Grid */}
        <section ref={cardsRef} className="pb-16 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-[1200px] mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="pricing-card-animate flex flex-col relative rounded-[14px] p-7 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: plan.highlight ? '#111111' : '#111111',
                  border: plan.highlight ? '1.5px solid #FFFFFF' : '1px solid #1F1F1F',
                  transform: plan.highlight ? 'scale(1.02)' : undefined,
                  boxShadow: plan.highlight ? '0 0 40px rgba(255,255,255,0.05)' : undefined,
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
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold px-4 py-1 rounded-full"
                    style={{
                      background: plan.highlight ? '#FFFFFF' : '#111111',
                      color: plan.highlight ? '#000000' : '#999999',
                      border: plan.highlight ? 'none' : '1px solid #1F1F1F',
                    }}>
                    {plan.badge}
                  </div>
                )}

                <div className="mt-5 mb-4">
                  <h3 className="font-display text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-[#555555] mt-1">{plan.tagline}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-semibold text-white/60">₹</span>
                    <span className="font-display text-5xl font-extrabold text-white tracking-tight leading-none">{annual ? plan.priceYearly : plan.priceMonthly}</span>
                    <span className="text-sm text-[#555555]">/mo</span>
                  </div>
                  {annual && plan.yearlyBilledText && <p className="text-xs text-[#333333] mt-1">{plan.yearlyBilledText}</p>}
                  {annual && plan.savings && (
                    <div className="mt-2">
                      <span className="inline-flex text-[10px] px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">{plan.savings}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#1F1F1F] mb-5" />

                {/* Features */}
                <div className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className={`flex items-center gap-2.5 text-[13px] ${f.included ? 'text-white/70' : 'text-[#333333]'}`}>
                        {f.included ? <CheckCircle2 size={15} className="text-white/50 shrink-0" /> : <X size={14} className="text-[#333333] shrink-0" />}
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button */}
                <div className="mt-6 pt-4">
                  {plan.note && <p className="text-center text-[11px] text-[#333333] mb-3">{plan.note}</p>}
                  <button
                    onClick={plan.action}
                    disabled={paying === plan.name.toLowerCase()}
                    className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                    style={{
                      background: plan.highlight ? '#FFFFFF' : 'transparent',
                      color: plan.highlight ? '#000000' : '#FFFFFF',
                      border: plan.highlight ? 'none' : '1px solid #2A2A2A',
                    }}
                    onMouseDown={(e) => anime({ targets: e.currentTarget, scale: 0.96, duration: 100, easing: 'easeOutQuad' })}
                    onMouseUp={(e) => anime({ targets: e.currentTarget, scale: 1, duration: 100, easing: 'easeOutQuad' })}
                  >
                    {paying === plan.name.toLowerCase() ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : plan.highlight ? `Upgrade to ${plan.name}` : plan.name === "Free" ? "Get Started Free" : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 max-w-[700px] mx-auto px-6">
          <h2 className="pricing-animate text-2xl font-display font-bold text-white text-center mb-2">Frequently Asked Questions</h2>
          <p className="pricing-animate text-[#555555] text-sm text-center mb-10">Everything you need to know before signing up.</p>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="pricing-card-animate rounded-[14px] border overflow-hidden transition-colors duration-200"
                  style={{ background: '#111111', borderColor: isOpen ? '#2A2A2A' : '#1F1F1F' }}>
                  <button onClick={() => setOpenFaq(isOpen ? null : i)} className="w-full flex justify-between items-center px-6 py-5 text-left">
                    <span className="text-sm font-semibold text-white">{faq.q}</span>
                    <ChevronDown size={16} className={`text-[#555555] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className={`faq-answer-${i} px-6 pb-5`}>
                      <p className="text-sm text-[#999999] leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 text-center">
          <p className="text-lg text-[#555555] mb-5">Still deciding? Start for <span className="text-white font-semibold">free</span> →</p>
          <button onClick={() => navigate("/register")} className="px-8 py-3.5 rounded-xl bg-white text-black font-semibold text-sm transition-all hover:bg-white/90 active:scale-[0.98]"
            onMouseDown={(e) => anime({ targets: e.currentTarget, scale: 0.96, duration: 100, easing: 'easeOutQuad' })}
            onMouseUp={(e) => anime({ targets: e.currentTarget, scale: 1, duration: 100, easing: 'easeOutQuad' })}>
            Start Free
          </button>
          <p className="text-xs text-[#333333] mt-3">No credit card required</p>
        </section>

        <Footer />
      </div>
    </div>
  );
}
