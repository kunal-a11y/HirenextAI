import React, { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { CheckCircle2, X, Loader2 } from "lucide-react";
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
      if (!loaded) {
        showToast("Failed to load payment gateway. Please try again.");
        setPaying(null);
        return;
      }

      const res = await fetch(`${API}/payment/create-order`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          planId,
          plan: planName,
          type: "job_seeker",
          billing: annual ? "annual" : "monthly",
          currency: "INR"
        }),
      });

      if (!res.ok) {
        let errorMsg = "Failed to create order";
        try {
          const errData = await res.json();
          if (errData?.error) errorMsg = errData.error;
          else if (errData?.message) errorMsg = errData.message;
        } catch {}
        throw new Error(errorMsg);
      }
      const order = await res.json();

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency ?? "INR",
        name: "HireNextAI",
        description: `${planName.toUpperCase()} Plan — ${annual ? "Annual" : "Monthly"}`,
        order_id: order.orderId ?? order.id,
        prefill: {
          name: user?.name ?? "",
          email: user?.email ?? "",
        },
        theme: { color: "#8B5CF6" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API}/payment/verify`, {
              method: "POST",
              headers: authHeaders,
              body: JSON.stringify({
                ...response,
                planId,
                plan: planName,
                type: "job_seeker",
                billing: annual ? "annual" : "monthly",
              }),
            });
            if (!verifyRes.ok) throw new Error("Verification failed");
            const verified = await verifyRes.json();
            if (verified?.plan) {
              updateUser({ plan: verified.plan });
            }
            showToast(`Your ${planName.toUpperCase()} plan is now active. Enjoy all features!`);
          } catch {
            showToast("Payment received. Your plan will activate shortly.");
          }
          setPaying(null);
          navigate("/chat");
        },
        modal: {
          ondismiss: () => {
            fetch(`${API}/payment/failed`, {
              method: "POST",
              headers: authHeaders,
              body: JSON.stringify({
                orderId: order.orderId ?? order.id,
                plan: planName,
                planId,
                reason: "Checkout closed before completion."
              }),
            }).catch(() => {});
            setPaying(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      showToast(err.message || "Something went wrong. Please try again.");
      setPaying(null);
    }
  };

  const plans = [
    {
      id: 1,
      name: "Free",
      badge: "Get Started",
      badgeClass: "badge-free",
      tagline: "Perfect to try HirenextAI",
      highlight: false,
      priceMonthly: "0",
      priceYearly: "0",
      features: [
        { text: "20 AI Credits per month", included: true },
        { text: "10 Job Applications tracking", included: true },
        { text: "Basic Job Search", included: true },
        { text: "AI Chat (1 credit/message)", included: true },
        { text: "Cover Letter (2 credits each)", included: true },
        { text: "Resume Review (3 credits each)", included: true },
        { text: "Apply with AI (Extension)", included: false },
        { text: "Mock Interview AI", included: false },
        { text: "Priority Support", included: false },
      ],
      buttonText: "Get Started Free",
      buttonClass: "btn-pricing-free",
      action: () => navigate("/register"),
    },
    {
      id: 2,
      name: "Pro",
      badge: "⭐ Most Popular",
      badgeClass: "badge-pro",
      tagline: "For active job seekers",
      highlight: true,
      priceMonthly: "299",
      priceYearly: "249",
      yearlyBilledText: "billed ₹2,988/yr",
      savings: "Save ₹600/year",
      features: [
        { text: "200 AI Credits per month", included: true },
        { text: "Unlimited Job Tracking", included: true },
        { text: "Advanced Job Search", included: true },
        { text: "Unlimited AI Chat", included: true },
        { text: "Unlimited Cover Letters", included: true },
        { text: "Unlimited Resume Reviews", included: true },
        { text: "Apply with AI (Extension)", included: true },
        { text: "Mock Interview AI (5/day)", included: true },
        { text: "Priority Support", included: false },
        { text: "Career Coaching", included: false },
      ],
      buttonText: "Upgrade to Pro",
      buttonClass: "btn-pricing-pro",
      action: () => handlePay("pro", 2),
    },
    {
      id: 3,
      name: "Max",
      badge: "Power User",
      badgeClass: "badge-max",
      tagline: "For serious professionals",
      highlight: false,
      priceMonthly: "599",
      priceYearly: "499",
      yearlyBilledText: "billed ₹5,988/yr",
      savings: "Save ₹1,200/year",
      features: [
        { text: "Unlimited AI Credits", included: true },
        { text: "Unlimited Everything in Pro", included: true },
        { text: "Mock Interview AI (Unlimited)", included: true },
        { text: "Priority Support (24hr)", included: true },
        { text: "Early Access to New Features", included: true },
        { text: "Advanced Analytics Dashboard", included: true },
        { text: "LinkedIn Profile Optimization", included: true },
        { text: "1 Career Coaching Session/month", included: true },
        { text: "Team Features", included: false },
      ],
      buttonText: "Upgrade to Max",
      buttonClass: "btn-pricing-max",
      action: () => handlePay("max", 3),
    },
    {
      id: 4,
      name: "Ultimate",
      badge: "Family & Friends",
      badgeClass: "badge-ultimate",
      tagline: "Share with family & friends",
      highlight: false,
      priceMonthly: "999",
      priceYearly: "799",
      yearlyBilledText: "billed ₹9,588/yr",
      savings: "Save ₹2,400/year",
      features: [
        { text: "Everything in Max", included: true },
        { text: "Up to 5 Members (share with family/friends)", included: true },
        { text: "Each member gets full Pro access", included: true },
        { text: "Shared Job Tracking Dashboard", included: true },
        { text: "Family Admin Panel", included: true },
        { text: "Priority Support (12hr)", included: true },
        { text: "Unlimited AI Credits for all members", included: true },
        { text: "All AI Features for all members", included: true },
        { text: "Early Access to New Features", included: true },
      ],
      buttonText: "Get Ultimate",
      buttonClass: "btn-pricing-ultimate",
      note: "Perfect for family job seekers",
      action: () => handlePay("ultimate", 4),
    },
  ];

  const faqs = [
    {
      q: "Can I cancel anytime?",
      a: "Yes. Cancel your subscription anytime from your account settings. Your access continues until the end of your billing period."
    },
    {
      q: "What are AI Credits?",
      a: "AI Credits power all AI features. Cover letter generation uses 2 credits, resume review uses 3 credits, and AI chat uses 1 credit per message. Credits reset every month."
    },
    {
      q: "How does the free plan work?",
      a: "The free plan gives you 20 AI credits monthly with no time limit. Perfect for occasional job searching. Upgrade when you need more power."
    },
    {
      q: "Is there a refund policy?",
      a: "We offer a 7-day refund for new paid subscribers. Contact us at support@hirenextai.com within 7 days of your first payment."
    },
    {
      q: "What is Apply with AI?",
      a: "Our Chrome extension that automatically fills job application forms with your details. Available on Pro plan and above."
    },
    {
      q: "Do prices include GST?",
      a: "Displayed prices exclude GST. 18% GST will be added at checkout as per Indian tax regulations."
    }
  ];

  // Framer motion variants for stagger fade-in cards
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        overflowX: "hidden",
        width: "100%",
        position: "relative"
      }}
      className="pricing-container"
    >
      {/* Background glow and grid effects */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden"
        }}
      >
        {/* Top purple glow */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "30%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "rgba(139,92,246,0.06)",
            filter: "blur(120px)"
          }}
        />
        {/* Bottom glow */}
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "20%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(99,102,241,0.04)",
            filter: "blur(100px)"
          }}
        />
        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)"
          }}
        />
      </div>

      {/* Main content sitting above background */}
      <div className="relative z-10">
        <Navbar />

        {/* Page Header */}
        <section className="pricing-header px-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 header-badge mb-6"
          >
            <span>👑</span> Simple, transparent pricing
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display font-extrabold text-white tracking-tight mb-2 main-title"
          >
            Invest in Your Future.<br />
            <span className="gradient-text">Grow Faster.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="header-subtitle max-w-xl mx-auto"
          >
            Start free. Upgrade when ready. Cancel anytime. No hidden fees.
          </motion.p>

          {/* Centered Billing Toggle Pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pill-toggle-container mt-8"
          >
            <button
              onClick={() => setAnnual(false)}
              className={`pill-toggle-btn ${!annual ? "active" : "inactive"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`pill-toggle-btn ${annual ? "active" : "inactive"} flex items-center`}
            >
              Yearly
              <span className="toggle-save-badge">Save 25%</span>
            </button>
          </motion.div>
        </section>

        {/* Cards Grid */}
        <section className="pb-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="pricing-grid"
          >
            {plans.map((plan) => {
              const isFeatured = plan.highlight;

              return (
                <motion.div
                  key={plan.name}
                  variants={cardVariants}
                  className={isFeatured ? "price-card-featured" : "price-card"}
                  style={{ display: "flex", flexDirection: "column", height: "100%" }}
                >
                  {/* Pro card Top glow line */}
                  {isFeatured && <div className="featured-glow-line" />}

                  {/* Plan Badge */}
                  {plan.badge && (
                    <div className={`plan-badge ${plan.badgeClass}`}>
                      {plan.badge}
                    </div>
                  )}

                  {/* Plan Name & Tagline */}
                  <div className="plan-name-tagline">
                    <h3 className="plan-name">{plan.name}</h3>
                    <p className="plan-tagline">{plan.tagline}</p>
                  </div>

                  {/* Price Display */}
                  <div className="price-display">
                    {plan.priceCustom ? (
                      <div className="price-custom">{plan.priceCustom}</div>
                    ) : (
                      <div>
                        <div className="price-row">
                          <span className="price-currency">₹</span>
                          <span className="price-number">
                            {annual ? plan.priceYearly : plan.priceMonthly}
                          </span>
                          <span className="price-mo">/mo</span>
                        </div>
                        {annual && plan.yearlyBilledText && (
                          <p className="yearly-note">{plan.yearlyBilledText}</p>
                        )}
                        {annual && plan.savings && (
                          <div className="savings-badge-container">
                            <span className="savings-badge">{plan.savings}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <hr className="card-divider" />

                  {/* Features List - takes all available space */}
                  <div style={{ flex: 1 }}>
                    <ul className="features-list">
                      {plan.features.map((f, idx) => (
                        <li
                          key={idx}
                          className={`feature-row ${f.included ? "feature-included" : "feature-not-included"}`}
                        >
                          {f.included ? (
                            <CheckCircle2 size={15} color="#A78BFA" className="shrink-0" />
                          ) : (
                            <X size={14} color="rgba(255,255,255,0.15)" className="shrink-0" />
                          )}
                          <span>{f.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button - always at bottom */}
                  <div style={{ marginTop: "auto", paddingTop: "24px" }}>
                    {/* Ultimate/Business response note */}
                    {plan.note && (
                      <p className="business-note">
                        {plan.note}
                      </p>
                    )}

                    <button
                      onClick={plan.action}
                      disabled={paying === plan.name.toLowerCase()}
                      className={`btn-pricing ${plan.buttonClass}`}
                      style={{ width: "100%" }}
                    >
                      {paying === plan.name.toLowerCase() ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin shrink-0" /> Processing...
                        </>
                      ) : (
                        plan.buttonText
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="py-12 pricing-faq-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl font-display font-bold mb-2 text-white">Frequently Asked Questions</h2>
            <p className="text-white/50 text-sm font-light">Everything you need to know before signing up.</p>
          </motion.div>

          <div className="faq-list">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={`faq-item ${isOpen ? "open" : ""}`}
                >
                  <div
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="faq-question-bar"
                  >
                    <span className="faq-question-text">{faq.q}</span>
                    <span className="faq-toggle-icon">
                      +
                    </span>
                  </div>
                  {isOpen && (
                    <div className="faq-answer-block">
                      <p className="leading-relaxed font-light">{faq.a}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bottom-cta-section">
          <p className="cta-lead-text">
            Still deciding? Start for <span className="cta-highlight-purple">free</span> &rarr;
          </p>
          <button
            onClick={() => navigate("/register")}
            className="btn-cta-start-free"
          >
            Start Free
          </button>
          <p className="cta-caption-text">No credit card required</p>
        </section>

        <Footer />
      </div>

      {/* Vanilla CSS Premium Styles Injection */}
      <style>{`
        .pricing-container {
          font-family: 'DM Sans', sans-serif;
        }

        /* HEADER SECTION */
        .pricing-header {
          padding-top: 120px;
          text-align: center;
          margin-bottom: 60px;
          position: relative;
          z-index: 1;
        }
        .header-badge {
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.2);
          color: #A78BFA;
          font-size: 13px;
          padding: 8px 20px;
          border-radius: 99px;
        }
        .main-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 800;
          color: white;
          line-height: 1.1;
        }
        .gradient-text {
          background: linear-gradient(135deg, #A78BFA 0%, #818CF8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .header-subtitle {
          color: rgba(255,255,255,0.45);
          font-size: 16px;
          margin-top: 16px;
        }

        /* BILLING TOGGLE */
        .pill-toggle-container {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 99px;
          padding: 4px;
          display: inline-flex;
          margin-bottom: 48px;
        }
        .pill-toggle-btn {
          padding: 8px 24px;
          border-radius: 99px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .pill-toggle-btn.active {
          background: #7C3AED;
          color: white;
          box-shadow: 0 2px 8px rgba(124,58,237,0.3);
        }
        .pill-toggle-btn.inactive {
          background: transparent;
          color: rgba(255,255,255,0.4);
        }
        .toggle-save-badge {
          background: rgba(34,197,94,0.15);
          border: 1px solid rgba(34,197,94,0.25);
          color: #86efac;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 99px;
          margin-left: 8px;
          font-weight: 600;
        }

        /* CARDS GRID */
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px 60px;
          align-items: stretch;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 1024px) {
          .pricing-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }
        @media (max-width: 640px) {
          .pricing-grid {
            grid-template-columns: 1fr;
            gap: 28px;
            max-width: 380px;
            padding: 0 16px 60px;
          }
        }

        /* CARD DESIGN (all cards base) */
        .price-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 28px 24px;
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 0;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .price-card:hover {
          border-color: rgba(139,92,246,0.3);
          background: rgba(139,92,246,0.04);
          transform: translateY(-4px);
        }

        /* FEATURED CARD */
        .price-card-featured {
          background: rgba(124,58,237,0.1);
          border: 1.5px solid rgba(139,92,246,0.5);
          border-radius: 20px;
          padding: 28px 24px;
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 0;
          box-shadow: 0 0 40px rgba(139,92,246,0.12),
                      inset 0 1px 0 rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .price-card-featured:hover {
          transform: translateY(-4px);
          border-color: rgba(139,92,246,0.7);
          box-shadow: 0 0 40px rgba(139,92,246,0.2),
                      inset 0 1px 0 rgba(255,255,255,0.12);
        }
        .featured-glow-line {
          position: absolute;
          top: 0;
          left: 20%;
          right: 20%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #8B5CF6, transparent);
        }

        /* PLAN BADGE */
        .plan-badge {
          position: absolute;
          top: -13px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 16px;
          border-radius: 99px;
          letter-spacing: 0.04em;
        }
        .badge-free {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .badge-pro {
          background: linear-gradient(135deg, #7C3AED, #6D28D9);
          color: white;
          box-shadow: 0 4px 12px rgba(124,58,237,0.4);
        }
        .badge-max {
          background: rgba(99,102,241,0.2);
          color: #A5B4FC;
          border: 1px solid rgba(99,102,241,0.3);
        }
        .badge-ultimate {
          background: rgba(245,158,11,0.15);
          color: #FCD34D;
          border: 1px solid rgba(245,158,11,0.25);
        }

        /* PLAN NAME & TAGLINE */
        .plan-name-tagline {
          margin-top: 20px;
          margin-bottom: 16px;
          text-align: left;
        }
        .plan-name {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: white;
          margin-bottom: 4px;
        }
        .plan-tagline {
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          font-weight: 400;
        }

        /* PRICE DISPLAY */
        .price-display {
          margin-bottom: 24px;
          text-align: left;
        }
        .price-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .price-currency {
          font-size: 20px;
          font-weight: 600;
          color: rgba(255,255,255,0.6);
          margin-right: 2px;
        }
        .price-number {
          font-family: 'Syne', sans-serif;
          font-size: 48px;
          font-weight: 800;
          color: white;
          letter-spacing: -2px;
          line-height: 1;
        }
        .price-mo {
          font-size: 14px;
          color: rgba(255,255,255,0.3);
          font-weight: 400;
          margin-left: 4px;
        }
        .price-custom {
          font-family: 'Syne', sans-serif;
          font-size: 36px;
          font-weight: 800;
          color: white;
          letter-spacing: -1px;
          line-height: 1;
          margin-bottom: 20px;
        }
        .yearly-note {
          font-size: 12px;
          color: rgba(255,255,255,0.25);
          margin-top: 4px;
        }
        .savings-badge-container {
          margin-top: 8px;
        }
        .savings-badge {
          display: inline-flex;
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.2);
          color: #86efac;
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 99px;
        }

        /* DIVIDER */
        .card-divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin: 20px 0;
        }

        /* FEATURES LIST */
        .features-list {
          display: flex;
          flex-direction: column;
          gap: 11px;
          margin-bottom: 28px;
          flex: 1;
        }
        .feature-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          line-height: 1.4;
          text-align: left;
        }
        .feature-included {
          color: rgba(255,255,255,0.7);
        }
        .feature-not-included {
          color: rgba(255,255,255,0.2);
        }

        /* BUTTONS */
        .btn-pricing {
          margin-top: auto;
          width: 100%;
          padding: 12px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-pricing-free {
          background: transparent;
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .btn-pricing-free:hover {
          background: rgba(255,255,255,0.05);
          color: white;
          border-color: rgba(255,255,255,0.25);
        }
        .btn-pricing-pro {
          background: linear-gradient(135deg, #7C3AED, #6D28D9);
          color: white;
          border: none;
          box-shadow: 0 4px 16px rgba(124,58,237,0.3);
        }
        .btn-pricing-pro:hover {
          box-shadow: 0 8px 24px rgba(124,58,237,0.45);
          transform: translateY(-1px);
        }
        .btn-pricing-max {
          background: rgba(99,102,241,0.15);
          color: #A5B4FC;
          border: 1px solid rgba(99,102,241,0.3);
        }
        .btn-pricing-max:hover {
          background: rgba(99,102,241,0.25);
          border-color: rgba(99,102,241,0.5);
        }
        .btn-pricing-ultimate {
          background: rgba(245,158,11,0.15);
          border: 1px solid rgba(245,158,11,0.3);
          color: #FCD34D;
        }
        .btn-pricing-ultimate:hover {
          background: rgba(245,158,11,0.25);
          border-color: rgba(245,158,11,0.5);
          color: #FCD34D;
        }
        .business-note {
          text-align: center;
          margin-bottom: 12px;
          font-size: 11.5px;
          color: rgba(255,255,255,0.3);
        }

        /* FAQ SECTION BELOW CARDS */
        .pricing-faq-section {
          max-width: 760px;
          margin: 80px auto 0 auto;
          padding: 0 24px;
          width: 100%;
          position: relative;
          z-index: 1;
        }
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }
        .faq-item {
          width: 100%;
          display: block;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .faq-item.open {
          border-color: rgba(139,92,246,0.25);
        }
        .faq-question-bar {
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          width: 100%;
          gap: 16px;
        }
        .faq-question-text {
          font-size: 15px;
          font-weight: 600;
          color: white;
          text-align: left;
          flex: 1;
          line-height: 1.4;
        }
        .faq-toggle-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.4);
          flex-shrink: 0;
          transition: all 0.2s;
          font-size: 14px;
          line-height: 1;
          font-weight: 500;
        }
        .faq-item.open .faq-toggle-icon {
          background: rgba(139,92,246,0.15);
          color: #A78BFA;
          transform: rotate(45deg);
        }
        .faq-answer-block {
          padding: 0 24px 20px;
          font-size: 14px;
          color: rgba(255,255,255,0.45);
          line-height: 1.8;
          text-align: left;
        }

        /* BOTTOM CTA */
        .bottom-cta-section {
          padding: 60px 24px 80px;
          text-align: center;
          background: transparent;
          position: relative;
          z-index: 1;
        }
        .cta-lead-text {
          font-size: 18px;
          color: rgba(255,255,255,0.5);
          margin-bottom: 20px;
        }
        .cta-highlight-purple {
          color: #A78BFA;
          font-weight: 600;
        }
        .btn-cta-start-free {
          background: linear-gradient(135deg,
            rgba(124,58,237,0.2),
            rgba(99,102,241,0.15));
          border: 1px solid rgba(139,92,246,0.35);
          color: #C4B5FD;
          padding: 13px 36px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-cta-start-free:hover {
          background: rgba(139,92,246,0.25);
          border-color: rgba(139,92,246,0.55);
          color: white;
          transform: translateY(-2px);
        }
        .cta-caption-text {
          color: rgba(255,255,255,0.2);
          font-size: 12px;
          margin-top: 12px;
        }
      `}</style>
    </div>
  );
}
