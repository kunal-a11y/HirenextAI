import React from "react";
import { motion } from "framer-motion";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { CheckCircle2, Sparkles, Rocket, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useUIStore from "../store/useUIStore";

export default function Updates() {
  const navigate = useNavigate();
  const { showToast } = useUIStore();

  const updatesData = [
    {
      badge: "V3.0",
      badgeClass: "badge-ultimate",
      statusText: "🔮 Coming Soon",
      statusClass: "status-soon",
      date: "Q4 2026",
      tags: [
        { text: "AI Agent", className: "tag-ai-agent" },
        { text: "Mobile App", className: "tag-mobile-app" },
        { text: "Voice AI", className: "tag-voice-ai" },
        { text: "2026", className: "tag-2026" }
      ],
      accentBarBackground: "linear-gradient(180deg, #8B5CF6, #6D28D9)",
      cardBorderColor: "rgba(139,92,246,0.2)",
      cardClass: "price-card-v3 float-animation",
      watermark: "COMING SOON",
      title: "HirenextAI V3 — AI Agent Era",
      subtitle: "Autonomous AI that works for you 24/7",
      desc: "Next generation platform with a fully autonomous AI agent that searches, applies, and manages your job search without you lifting a finger.",
      features: [
        { tag: "AI", text: "Autonomous AI Job Agent (applies while you sleep)" },
        { tag: "AI", text: "Voice-enabled Mock Interview Practice" },
        { tag: "AI", text: "Salary Negotiation AI Coach" },
        { tag: "AI", text: "Career Path Advisor & Roadmap" },
        { tag: "NEW", text: "Company Deep Research AI" },
        { tag: "NEW", text: "LinkedIn Profile Auto-Optimizer" },
        { tag: "PRO", text: "Custom Fine-tuned AI Model" },
        { tag: "APP", text: "iOS & Android Mobile App" },
        { tag: "APP", text: "Desktop App (Mac & Windows)" },
        { tag: "API", text: "Developer API Access" },
        { tag: "TEAM", text: "Team Collaboration Features" },
        { tag: "AI", text: "Multi-language Voice Support" }
      ],
      featuresOpacity: 0.55,
      icon: Sparkles,
      iconColor: "#C4B5FD"
    },
    {
      badge: "V2.0",
      badgeClass: "badge-pro",
      statusText: "✓ Live Now",
      statusClass: "status-live",
      date: "May 2026",
      tags: [
        { text: "CURRENT", className: "tag-current" },
        { text: "AI CHAT", className: "tag-ai-chat" },
        { text: "EXTENSION", className: "tag-extension" },
        { text: "REDESIGN", className: "tag-redesign" },
        { text: "MAY 2026", className: "tag-may-2026" }
      ],
      accentBarBackground: "linear-gradient(180deg, #22c55e, #16a34a)",
      cardBorderColor: "rgba(34,197,94,0.12)",
      cardClass: "price-card-v2 current-glow-animation",
      watermark: "CURRENT VERSION",
      title: "HirenextAI V2 — Complete Rebuild",
      subtitle: "Smarter, faster, and more powerful than ever",
      desc: "Completely rebuilt from ground up with AI chat assistant, smart job matching, auto-apply Chrome extension, and a beautiful new interface.",
      features: [
        { tag: "AI", text: "AI Chat Assistant (24/7 job help)" },
        { tag: "AI", text: "Smart Job Matching with % score" },
        { tag: "HOT", text: "Apply with AI Chrome Extension" },
        { tag: "AI", text: "Mock Interview AI Practice" },
        { tag: "NEW", text: "Application Tracker Dashboard" },
        { tag: "NEW", text: "7 Language Support (incl. Hindi, Arabic)" },
        { tag: "NEW", text: "LinkedIn & Indeed Account Connect" },
        { tag: "NEW", text: "Pricing & Plans with Razorpay" },
        { tag: "UI", text: "Complete Dark UI Redesign" },
        { tag: "FIX", text: "Mobile Responsive (all devices)" },
        { tag: "NEW", text: "About, Contact, Help Center pages" },
        { tag: "AI", text: "AI Resume & Cover Letter Builder" }
      ],
      featuresOpacity: 1,
      icon: CheckCircle2,
      iconColor: "#86efac"
    },
    {
      badge: "V1.5",
      badgeClass: "badge-max",
      statusText: "✓ Live",
      statusClass: "status-live",
      date: "2025",
      tags: [
        { text: "AI TOOLS", className: "tag-ai-tools" },
        { text: "DASHBOARD", className: "tag-dashboard" },
        { text: "PAYMENTS", className: "tag-payments" },
        { text: "2025", className: "tag-2025" }
      ],
      accentBarBackground: "linear-gradient(180deg, #6366f1, #4338ca)",
      cardBorderColor: "rgba(99,102,241,0.12)",
      cardClass: "price-card-v15",
      title: "AI Tools & Dashboard Update",
      subtitle: "Powerful AI tools for every job seeker",
      desc: "Major update adding AI-powered tools, recruiter dashboard, admin panel, and integrated payment system.",
      features: [
        { tag: "AI", text: "AI Resume Builder & Optimizer" },
        { tag: "AI", text: "Cover Letter Generator" },
        { tag: "AI", text: "Interview Prep AI" },
        { tag: "AI", text: "ATS Score Checker" },
        { tag: "NEW", text: "Recruiter Dashboard" },
        { tag: "NEW", text: "Admin Panel & Analytics" },
        { tag: "NEW", text: "Google OAuth Login" },
        { tag: "NEW", text: "Razorpay Payment Integration" },
        { tag: "NEW", text: "Job Alert System" },
        { tag: "FIX", text: "Performance Improvements" }
      ],
      featuresOpacity: 1,
      icon: CheckCircle2,
      iconColor: "#A5B4FC"
    },
    {
      badge: "V1.0",
      badgeClass: "badge-v1",
      statusText: "✓ Launched",
      statusClass: "status-launched",
      date: "2024",
      tags: [
        { text: "LAUNCH", className: "tag-launch" },
        { text: "INDIA", className: "tag-india" },
        { text: "2024", className: "tag-2024" }
      ],
      accentBarBackground: "rgba(107,114,128,0.4)",
      cardBorderColor: "rgba(255,255,255,0.06)",
      cardClass: "price-card-v1",
      title: "HirenextAI — First Launch 🎉",
      subtitle: "The beginning of smarter job search",
      desc: "First public release focused on AI-assisted job search for freshers and early-career professionals in India.",
      features: [
        { tag: "CORE", text: "Job Search & Smart Filtering" },
        { tag: "CORE", text: "Application Tracking (Basic)" },
        { tag: "CORE", text: "Resume Upload & Storage" },
        { tag: "CORE", text: "Job Alerts & Notifications" },
        { tag: "CORE", text: "User Profiles & Settings" },
        { tag: "CORE", text: "Email Authentication" },
        { tag: "CORE", text: "Mobile Responsive Design" },
        { tag: "CORE", text: "India Job Market Focus" }
      ],
      featuresOpacity: 0.5,
      icon: CheckCircle2,
      iconColor: "rgba(255,255,255,0.3)"
    }
  ];

  const featureTagStyles = {
    AI: "tag-pill-ai",
    NEW: "tag-pill-new",
    PRO: "tag-pill-pro",
    APP: "tag-pill-app",
    API: "tag-pill-api",
    TEAM: "tag-pill-team",
    HOT: "tag-pill-hot",
    UI: "tag-pill-ui",
    FIX: "tag-pill-fix",
    CORE: "tag-pill-core"
  };

  // Framer motion animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.03
      }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
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
      className="updates-container"
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

      <div className="relative z-10">
        <Navbar />

        {/* Page Header */}
        <section className="updates-header">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block updates-badge bounce-badge"
          >
            🚀 PRODUCT ROADMAP & UPDATES
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="updates-title"
          >
            What's New & <span className="updates-title-brand">What's Coming</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="updates-subtitle max-w-xl mx-auto"
          >
            Track every feature we ship and everything we're building next.
          </motion.p>

          {/* Live Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="live-stats-row"
          >
            <span className="stat-pill stat-pill-live">✓ 3 Versions Live</span>
            <span className="stat-pill stat-pill-coming">🔮 1 Version Coming</span>
            <span className="stat-pill stat-pill-active">⚡ Active Development</span>
          </motion.div>
        </section>

        {/* Timeline Container */}
        <section className="timeline-container">
          {updatesData.map((update, index) => {
            const IconComponent = update.icon;
            const isSoon = update.badge === "V3.0";
            const isV1 = update.badge === "V1.0";

            return (
              <div key={update.badge} className="version-block">
                {/* Version Header Row */}
                <div className="version-header">
                  <span className={`version-badge ${update.badgeClass}`}>
                    {update.badge}
                  </span>
                  <span className={`status-badge ${update.statusClass}`}>
                    {update.statusText}
                  </span>
                  {/* Multiple tags row */}
                  <div className="tags-row">
                    {update.tags.map((tag, tIdx) => (
                      <span key={tIdx} className={`tag-badge ${tag.className}`}>
                        {tag.text}
                      </span>
                    ))}
                  </div>
                  <div className="version-divider-line" />
                  <span className="version-date">{update.date}</span>
                </div>

                {/* Version Content Card */}
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className={`version-card ${update.cardClass}`}
                  style={{ 
                    borderColor: update.cardBorderColor,
                    opacity: isV1 ? 0.6 : 1
                  }}
                >
                  {/* Left Accent Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="version-accent-bar"
                    style={{ background: update.accentBarBackground }}
                  />

                  {/* Watermark for V3/V2 */}
                  {update.watermark && (
                    <div className={isSoon ? "soon-watermark" : "current-watermark"}>
                      {update.watermark}
                    </div>
                  )}

                  {/* Sparkle dots for V3 */}
                  {isSoon && (
                    <>
                      <div className="sparkle-dot" style={{ top: "20%", left: "15%", animation: "floatSparkle 3s ease infinite 0.2s" }} />
                      <div className="sparkle-dot" style={{ top: "60%", left: "80%", animation: "floatSparkle 4s ease infinite 0.5s" }} />
                      <div className="sparkle-dot" style={{ top: "80%", left: "30%", animation: "floatSparkle 2.5s ease infinite" }} />
                      <div className="sparkle-dot" style={{ top: "30%", left: "70%", animation: "floatSparkle 3.5s ease infinite 1s" }} />
                    </>
                  )}

                  <h2 className="card-title">{update.title}</h2>
                  <p className="card-subtitle-italic">{update.subtitle}</p>
                  <p className="card-desc">{update.desc}</p>

                  {/* Features Grid inside Card */}
                  <div 
                    className="features-grid" 
                    style={{ opacity: update.featuresOpacity }}
                  >
                    {update.features.map((feature, fIdx) => (
                      <motion.div
                        key={fIdx}
                        variants={featureVariants}
                        className="feature-item"
                      >
                        <IconComponent
                          size={14}
                          color={update.iconColor}
                          className="feature-icon-wrapper"
                        />
                        <span className={`feature-pill-tag ${featureTagStyles[feature.tag] || ""}`}>
                          {feature.tag}
                        </span>
                        <span className="feature-text-content">{feature.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </section>

        {/* Bottom CTA Redesigned Card */}
        <section className="updates-cta-wrapper">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="updates-cta-card"
          >
            {/* Top glow line */}
            <div className="cta-top-glow-line" />

            {/* Background radial glow */}
            <div className="cta-radial-glow" />

            {/* Floating Orbs behind card */}
            <div className="cta-floating-orb orb-1" />
            <div className="cta-floating-orb orb-2" />

            {/* Content Container to raise z-index above glows/orbs */}
            <div className="relative z-10">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="cta-card-badge"
              >
                ✦ JOIN HIRENEXTAI
              </motion.div>

              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="cta-card-title"
              >
                Ready to land your<br />
                <span className="cta-title-gradient">dream job?</span>
              </motion.h2>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="cta-card-subtext"
              >
                Everything you need is already built. Start for free and upgrade when ready.
              </motion.p>

              {/* Buttons Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="cta-card-buttons"
              >
                <button
                  onClick={() => navigate("/register")}
                  className="btn-cta-card-primary"
                >
                  <Rocket size={16} className="shrink-0" />
                  Get Started Free &rarr;
                </button>
                <button
                  onClick={() => navigate("/features")}
                  className="btn-cta-card-secondary"
                >
                  <Sparkles size={16} color="#A78BFA" className="shrink-0" />
                  See All Features &rarr;
                </button>
              </motion.div>

              {/* Bottom Info checklist row */}
              <div className="cta-bottom-info">
                <span className="info-item">
                  <Check size={12} color="rgba(139,92,246,0.5)" className="shrink-0" />
                  Free Forever Plan
                </span>
                <span className="info-item">
                  <Check size={12} color="rgba(139,92,246,0.5)" className="shrink-0" />
                  No Credit Card
                </span>
                <span className="info-item">
                  <Check size={12} color="rgba(139,92,246,0.5)" className="shrink-0" />
                  Cancel Anytime
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        <Footer />
      </div>

      {/* Vanilla CSS Premium Styles Injection */}
      <style>{`
        .updates-container {
          font-family: 'DM Sans', sans-serif;
        }

        /* HEADER SECTION */
        .updates-header {
          padding: 130px 24px 60px;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        .updates-badge {
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.25);
          color: #A78BFA;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 16px;
          border-radius: 99px;
          letter-spacing: 0.06em;
          margin-bottom: 20px;
        }
        .updates-title {
          font-family: 'Syne', sans-serif;
          font-size: 42px;
          font-weight: 700;
          color: white;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }
        .updates-title-brand {
          background: linear-gradient(135deg, #A78BFA, #818CF8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .updates-subtitle {
          font-size: 16px;
          color: rgba(255,255,255,0.4);
          line-height: 1.7;
          font-weight: 400;
        }

        /* LIVE STATS ROW */
        .live-stats-row {
          margin-top: 32px;
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .stat-pill {
          font-size: 12px;
          padding: 6px 16px;
          border-radius: 99px;
          font-weight: 600;
        }
        .stat-pill-live {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.25);
          color: #86efac;
        }
        .stat-pill-coming {
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.25);
          color: #C4B5FD;
        }
        .stat-pill-active {
          background: rgba(251,191,36,0.1);
          border: 1px solid rgba(251,191,36,0.25);
          color: #FCD34D;
        }

        /* TIMELINE CONTAINER */
        .timeline-container {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 24px 80px;
          position: relative;
          z-index: 1;
        }
        .version-block {
          margin-bottom: 40px;
        }
        .version-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .version-badge {
          font-size: 13px;
          font-weight: 800;
          padding: 5px 16px;
          border-radius: 99px;
          letter-spacing: 0.05em;
        }
        .badge-ultimate {
          background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.4);
          color: #C4B5FD;
        }
        .badge-pro {
          background: rgba(34,197,94,0.15);
          border: 1px solid rgba(34,197,94,0.3);
          color: #86efac;
        }
        .badge-max {
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.3);
          color: #A5B4FC;
        }
        .badge-v1 {
          background: rgba(107,114,128,0.2);
          border: 1px solid rgba(107,114,128,0.3);
          color: rgba(255,255,255,0.4);
        }

        .status-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 99px;
        }
        .status-soon {
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.3);
          color: #C4B5FD;
        }
        .status-live {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.25);
          color: #86efac;
        }
        .status-launched {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4);
        }

        .tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .tag-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 99px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .tag-ai-agent {
          background: rgba(139,92,246,0.15);
          color: #C4B5FD;
        }
        .tag-mobile-app {
          background: rgba(99,102,241,0.15);
          color: #A5B4FC;
        }
        .tag-voice-ai {
          background: rgba(168,85,247,0.15);
          color: #D8B4FE;
        }
        .tag-2026 {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.3);
        }
        .tag-current {
          background: rgba(34,197,94,0.1);
          color: #86efac;
        }
        .tag-ai-chat {
          background: rgba(99,102,241,0.1);
          color: #A5B4FC;
        }
        .tag-extension {
          background: rgba(245,158,11,0.1);
          color: #FCD34D;
        }
        .tag-redesign {
          background: rgba(236,72,153,0.1);
          color: #F9A8D4;
        }
        .tag-may-2026 {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.3);
        }
        .tag-ai-tools {
          background: rgba(99,102,241,0.1);
          color: #A5B4FC;
        }
        .tag-dashboard {
          background: rgba(245,158,11,0.1);
          color: #FCD34D;
        }
        .tag-payments {
          background: rgba(236,72,153,0.1);
          color: #F9A8D4;
        }
        .tag-2025 {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.3);
        }
        .tag-launch {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.3);
        }
        .tag-india {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.3);
        }
        .tag-2024 {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.3);
        }

        .version-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 0 12px;
          min-width: 20px;
        }
        .version-date {
          font-size: 13px;
          color: rgba(255,255,255,0.25);
        }

        /* VERSION CARD */
        .version-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 28px 32px;
          position: relative;
          overflow: hidden;
          text-align: left;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .version-accent-bar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
        }
        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin-bottom: 4px;
        }
        .card-subtitle-italic {
          font-size: 14px;
          color: rgba(255,255,255,0.35);
          font-style: italic;
          margin-bottom: 16px;
        }
        .card-desc {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          line-height: 1.8;
          margin-bottom: 24px;
          max-width: 640px;
        }

        /* FEATURES GRID */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px 24px;
        }
        @media (max-width: 640px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          line-height: 1.5;
        }
        .feature-icon-wrapper {
          margin-top: 3px;
          flex-shrink: 0;
        }
        .feature-pill-tag {
          font-size: 9px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 99px;
          letter-spacing: 0.05em;
          flex-shrink: 0;
          margin-top: 2px;
          text-transform: uppercase;
        }

        /* TAG STYLES FOR FEATURES */
        .tag-pill-ai {
          background: rgba(139,92,246,0.2);
          color: #C4B5FD;
          border: 1px solid rgba(139,92,246,0.3);
        }
        .tag-pill-new {
          background: rgba(59,130,246,0.2);
          color: #93C5FD;
          border: 1px solid rgba(59,130,246,0.3);
        }
        .tag-pill-pro {
          background: rgba(245,158,11,0.2);
          color: #FDE68A;
          border: 1px solid rgba(245,158,11,0.3);
        }
        .tag-pill-app {
          background: rgba(236,72,153,0.2);
          color: #FBCFE8;
          border: 1px solid rgba(236,72,153,0.3);
        }
        .tag-pill-api {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .tag-pill-team {
          background: rgba(20,184,166,0.2);
          color: #99F6E4;
          border: 1px solid rgba(20,184,166,0.3);
        }
        .tag-pill-hot {
          background: rgba(239,68,68,0.2);
          color: #FCA5A5;
          border: 1px solid rgba(239,68,68,0.3);
        }
        .tag-pill-ui {
          background: rgba(99,102,241,0.2);
          color: #C7D2FE;
          border: 1px solid rgba(99,102,241,0.3);
        }
        .tag-pill-fix {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .tag-pill-core {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.1);
        }

        /* WATERMARKS */
        .soon-watermark {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 10px;
          letter-spacing: 0.15em;
          color: rgba(139,92,246,0.3);
          font-weight: 700;
          text-transform: uppercase;
          border: 1px solid rgba(139,92,246,0.15);
          padding: 3px 10px;
          border-radius: 99px;
        }
        .current-watermark {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.2);
          color: #86efac;
          font-size: 10px;
          letter-spacing: 0.05em;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 99px;
          text-transform: uppercase;
        }

        /* ANIMATIONS & EFFECTS */
        @keyframes bounceBadge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .bounce-badge {
          animation: bounceBadge 2s ease infinite;
        }

        @keyframes floatCard {
          0%, 100% { transform: translateY(0px) }
          50% { transform: translateY(-6px) }
        }
        .float-animation {
          animation: floatCard 4s ease infinite;
        }

        @keyframes currentGlow {
          0%, 100% { 
            box-shadow: 0 0 0 rgba(34,197,94,0);
          }
          50% { 
            box-shadow: 0 0 20px rgba(34,197,94,0.08);
          }
        }
        .current-glow-animation {
          animation: currentGlow 3s ease infinite;
        }

        @keyframes floatSparkle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.15; }
          50% { transform: translateY(-6px) scale(1.3); opacity: 0.5; }
        }
        .sparkle-dot {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #C4B5FD;
          filter: drop-shadow(0 0 3px #8B5CF6);
          pointer-events: none;
        }

        .coming-soon-features {
          opacity: 0.55;
        }

        /* REDESIGNED BOTTOM CTA SECTION */
        .updates-cta-wrapper {
          padding: 60px 24px 80px;
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        .updates-cta-card {
          max-width: 760px;
          margin: 0 auto;
          background: linear-gradient(135deg,
            rgba(139,92,246,0.12) 0%,
            rgba(99,102,241,0.08) 50%,
            rgba(10,10,20,0.9) 100%);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 28px;
          padding: 56px 48px;
          text-align: center;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .cta-top-glow-line {
          position: absolute;
          top: 0;
          left: 20%;
          right: 20%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #8B5CF6, transparent);
        }
        .cta-radial-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse 70% 50% at 50% 0%,
            rgba(139,92,246,0.1),
            transparent 70%);
          pointer-events: none;
        }
        
        /* FLOATING ORBS */
        .cta-floating-orb {
          border-radius: 50%;
          pointer-events: none;
        }
        .orb-1 {
          position: absolute;
          width: 250px;
          height: 250px;
          background: rgba(139,92,246,0.06);
          filter: blur(60px);
          top: -80px;
          left: -60px;
          animation: orbFloat1 6s ease infinite;
        }
        .orb-2 {
          position: absolute;
          width: 200px;
          height: 200px;
          background: rgba(99,102,241,0.05);
          filter: blur(50px);
          bottom: -60px;
          right: -40px;
          animation: orbFloat2 8s ease infinite;
          animation-delay: 3s;
        }

        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) }
          50% { transform: translate(15px, -15px) }
        }

        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) }
          50% { transform: translate(-10px, 10px) }
        }

        .cta-card-badge {
          background: rgba(139,92,246,0.12);
          border: 1px solid rgba(139,92,246,0.3);
          color: #C4B5FD;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          padding: 6px 16px;
          border-radius: 99px;
          display: inline-block;
          margin-bottom: 20px;
        }
        .cta-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 36px;
          font-weight: 800;
          color: white;
          line-height: 1.15;
          letter-spacing: -0.5px;
          margin-bottom: 14px;
        }
        .cta-title-gradient {
          background: linear-gradient(135deg, #A78BFA, #818CF8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .cta-card-subtext {
          font-size: 15px;
          color: rgba(255,255,255,0.4);
          line-height: 1.7;
          max-width: 420px;
          margin: 0 auto 36px;
        }
        .cta-card-buttons {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .btn-cta-card-primary {
          background: linear-gradient(135deg, #7C3AED, #6D28D9);
          color: white;
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-cta-card-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(124,58,237,0.45);
          background: linear-gradient(135deg, #8B5CF6, #7C3AED);
        }
        .btn-cta-card-secondary {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.12);
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-cta-card-secondary:hover {
          background: rgba(139,92,246,0.1);
          border-color: rgba(139,92,246,0.35);
          color: #C4B5FD;
          transform: translateY(-2px);
        }
        .cta-bottom-info {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 4px;
        }
        .info-item {
          font-size: 12px;
          color: rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          gap: 5px;
        }
      `}</style>
    </div>
  );
}
