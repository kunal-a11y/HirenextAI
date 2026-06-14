import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import useUIStore from "../store/useUIStore";
import {
  Mail, Phone, MapPin, Clock, ChevronDown, Send,
  Loader2, CheckCircle2, Zap, Star, Globe, Shield,
  MessageCircle, ExternalLink, CheckCircle
} from "lucide-react";
import { Instagram, Youtube, Linkedin, Github } from "../components/layout/socialIcons";

const API = import.meta.env.VITE_API_URL ?? "/api";
const MAX_MSG = 1000;

const faqs = [
  { q: "How do I reset my password?", a: "Go to the login page and click 'Forgot password'. We'll email you a reset link within a few minutes." },
  { q: "Can I downgrade from Pro to Free?", a: "Yes. Cancel anytime from the Subscription page inside your dashboard. Your Pro access continues until the billing period ends." },
  { q: "How do AI generations work?", a: "Each cover letter, resume optimization, or interview prep session counts as one generation. Your limit resets at the start of each billing month." },
  { q: "Is my resume data safe?", a: "Yes. All data is encrypted at rest and in transit. We never share your personal information with employers or third parties without your explicit consent." },
  { q: "How quickly do you respond?", a: "Our support team is available 24/7. We aim to reply within 24 hours. Pro and Premium subscribers get priority responses." },
  { q: "Do you offer refunds?", a: "We offer a 48-hour money-back guarantee for new subscribers. Contact us within 48 hours of your first payment to request a full refund, no questions asked." },
  { q: "What countries are supported?", a: "HirenextAI works for job seekers in 40+ countries worldwide including the US, UK, Canada, Australia, India, UAE, Germany, Singapore, and more." },
  { q: "Is HirenextAI free to use?", a: "Yes — HirenextAI has a free plan that includes 5 AI generations per month, job search, and basic application tracking. No credit card required to start." },
];

const stats = [
  { label: "24/7",   sub: "Support Available" },
  { label: "50K+",   sub: "Users Helped Worldwide" },
  { label: "4.9★",   sub: "Support Rating" },
  { label: "Global", sub: "Worldwide Platform" },
  { label: "<24hr",  sub: "Avg Email Response" },
];

const features = [
  { icon: Zap,     title: "Under 24 Hours",   desc: "Average email response time", tag: "< 24hr" },
  { icon: Phone,   title: "Instant Connect",  desc: "Phone & WhatsApp available",  tag: "WhatsApp" },
  { icon: Star,    title: "4.9 / 5.0 Stars",  desc: "Global support rating",       tag: "★ 4.9" },
  { icon: Globe,   title: "40+ Countries",    desc: "Users worldwide",             tag: "40+ Countries" },
  { icon: Shield,  title: "Secure & Private", desc: "Your data safe & encrypted",  tag: "AES-256" },
  { icon: Clock,   title: "24/7 Available",   desc: "Round the clock support",     tag: "24/7" },
];

const socials = [
  { name: "Instagram", handle: "@hirenextai",  href: "https://instagram.com", icon: Instagram, color: "from-pink-500 to-orange-400",  border: "border-pink-500/30",  bg: "bg-pink-500/10",  hover: "hover:border-pink-500/60 hover:bg-pink-500/20",  tag: "Follow Us" },
  { name: "YouTube",   handle: "@HirenextAI",  href: "https://youtube.com",   icon: Youtube,   color: "from-red-500 to-red-600",    border: "border-red-500/30",   bg: "bg-red-500/10",   hover: "hover:border-red-500/60 hover:bg-red-500/20",   tag: "Subscribe" },
  { name: "LinkedIn",  handle: "HirenextAI",   href: "https://linkedin.com",  icon: Linkedin,  color: "from-blue-500 to-blue-600",   border: "border-blue-500/30",  bg: "bg-blue-500/10",  hover: "hover:border-blue-500/60 hover:bg-blue-500/20",  tag: "Connect" },
  { name: "GitHub",    handle: "hirenextai",   href: "https://github.com",    icon: Github,    color: "from-white/80 to-white/60",   border: "border-white/20",     bg: "bg-white/5",      hover: "hover:border-white/40 hover:bg-white/10",        tag: "Star Us" },
];

function FadeUp({ children, delay = 0, className = "" }) {
  return (
    <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function StatsTicker() {
  const items = [...stats, ...stats, ...stats];
  return (
    <section className="relative z-10 border-y border-white/[0.06] bg-white/[0.015] py-4 overflow-hidden">
      <motion.div
        className="flex items-center gap-0 w-max"
        animate={{ x: ["0%", "-33.33%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        {items.map((stat, i) => (
          <div key={i} className="flex items-center gap-4 shrink-0 px-10 border-r border-white/[0.06]">
            <span className="text-xl font-display font-extrabold text-white whitespace-nowrap">{stat.label}</span>
            <span className="text-sm text-white/40 whitespace-nowrap">{stat.sub}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

export default function Contact() {
  const { showToast } = useUIStore();
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const categoryMap = {
        billing: "payment", technical: "bug", account: "account",
        feature: "general", other: "general"
      };
      const category = categoryMap[form.subject] ?? "general";
      const res = await fetch(`${API}/support/ticket`, {
        method: "POST", headers,
        body: JSON.stringify({ name: form.name, email: form.email, subject: form.subject, message: form.message.slice(0, MAX_MSG), category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to submit ticket");
      setSent(true);
      showToast("Message sent! Our team will get back to you within 24 hours.");
    } catch (err) {
      showToast(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', width: '100%' }} className="bg-background relative">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[150px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <Navbar />

      {/* HERO */}
      <section className="relative z-10 pt-40 pb-16 px-6 max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-medium text-white/70">24/7 GLOBAL SUPPORT</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-6 leading-none text-white">
          <span className="text-white">CONTACT</span><br />
          <span className="text-gradient">US</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-lg text-white/55 max-w-2xl mx-auto mb-8 leading-relaxed font-light">
          Whether you have a question about features, need help with your account, or just want to say hello — our global support team is available 24/7 and ready to help.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Available 24/7 · Worldwide Support
        </motion.div>

        {/* Tags Row */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2 mt-4"
        >
          <motion.div whileHover={{ scale: 1.05, y: -2 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-medium">
            <Clock className="w-3.5 h-3.5" /> 24/7 Support
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -2 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-medium">
            <Globe className="w-3.5 h-3.5" /> Global Coverage
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -2 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5" /> 48hr Refund Policy
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -2 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-medium">
            <MessageCircle className="w-3.5 h-3.5" /> Real Human Support
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -2 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-medium">
            <Shield className="w-3.5 h-3.5" /> Encrypted & Secure
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -2 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-medium">
            <Zap className="w-3.5 h-3.5" /> Free to Start
          </motion.div>
        </motion.div>
      </section>

      <StatsTicker />

      {/* FEATURE GRID */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <FadeUp className="glass-card p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeUp key={i} delay={i * 0.06}>
                <motion.div 
                  whileHover={{ y: -3 }} 
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex items-start gap-4 relative pb-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-[#8B5CF6]" />
                  </div>
                  <div className="pr-12">
                    <p className="text-sm font-bold text-white">{f.title}</p>
                    <p className="text-xs text-white/40 mt-0.5">{f.desc}</p>
                  </div>
                  <div className="absolute top-0 right-0 text-[10px] bg-white/5 border border-white/10 text-white/30 rounded-full px-2 py-0.5">
                    {f.tag}
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* WHATSAPP CARD */}
      <section className="relative z-10 py-4 px-6 max-w-5xl mx-auto">
        <FadeUp>
          <motion.div
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-8 md:p-10 group cursor-default"
          >
            <div className="absolute inset-0 rounded-3xl bg-emerald-500/0 group-hover:bg-emerald-500/8 transition-all duration-500" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] group-hover:bg-emerald-500/25 transition-all duration-500 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-400/0 group-hover:bg-emerald-400/15 blur-[60px] transition-all duration-500 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-16 h-16 rounded-2xl bg-[#25D366] flex items-center justify-center shadow-[0_0_30px_rgba(37,211,102,0.4)] group-hover:shadow-[0_0_50px_rgba(37,211,102,0.7)] transition-all duration-300 shrink-0">
                <MessageCircle className="w-8 h-8 text-white" />
              </motion.div>
              <div className="flex-1">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">WHATSAPP</p>
                <h3 className="text-2xl font-display font-extrabold text-white mb-2">Chat on WhatsApp</h3>
                <p className="text-white/55 text-sm leading-relaxed max-w-lg font-light">
                  The fastest way to reach us. Message us anytime — our team typically replies within minutes during support hours.
                </p>
                <div className="flex items-center gap-2 mt-4 mb-1">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-bold">+91 82877 42269</span>
                </div>
                <p className="text-xs text-white/35">Available 24/7 · Worldwide support</p>
                <div className="flex gap-3 mt-5">
                  <a href="https://wa.me/918287742269" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:bg-[#20bd5a] transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_35px_rgba(37,211,102,0.6)]">
                    <MessageCircle className="w-4 h-4" /> Open WhatsApp
                  </a>
                  <a href="mailto:support@hirenextai.com?subject=Subscription Query"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white/80 font-semibold text-sm hover:bg-white/10 hover:text-white transition-all">
                    Subscription Query
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </FadeUp>
      </section>

      {/* CALL + EMAIL */}
      <section className="relative z-10 py-8 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Call Us */}
          <FadeUp>
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="glass-card p-8 h-full relative overflow-hidden group cursor-default"
            >
              <div className="absolute inset-0 rounded-2xl bg-purple-500/0 group-hover:bg-purple-500/8 transition-all duration-500" />
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-purple-500/0 group-hover:bg-purple-500/20 blur-[60px] transition-all duration-500 pointer-events-none" />
              <div className="relative z-10">
                <motion.div whileHover={{ scale: 1.1, rotate: -5 }} className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(139,92,246,0.4)] group-hover:shadow-[0_0_45px_rgba(139,92,246,0.7)] transition-all duration-300">
                  <Phone className="w-7 h-7 text-white" />
                </motion.div>
                <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">DIRECT CALL</p>
                <h3 className="text-2xl font-display font-extrabold text-white mb-3">Call Us</h3>
                <p className="text-white/55 text-sm leading-relaxed mb-5 font-light">
                  Talk directly with our support team. Available Monday to Saturday. No bots — just real people.
                </p>
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-bold">+91 82877 42269</span>
                </div>
                <p className="text-xs text-white/35 mb-5">Available 24/7 · Global Support</p>
                <a href="tel:+918287742269" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:opacity-90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)]">
                  <Phone className="w-4 h-4" /> Call Now
                </a>
              </div>
            </motion.div>
          </FadeUp>

          {/* Email Us */}
          <FadeUp delay={0.1}>
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="glass-card p-8 h-full relative overflow-hidden group cursor-default"
            >
              <div className="absolute inset-0 rounded-2xl bg-blue-500/0 group-hover:bg-blue-500/8 transition-all duration-500" />
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/0 group-hover:bg-blue-500/20 blur-[60px] transition-all duration-500 pointer-events-none" />
              <div className="relative z-10">
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_45px_rgba(59,130,246,0.7)] transition-all duration-300">
                  <Mail className="w-7 h-7 text-white" />
                </motion.div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">EMAIL SUPPORT</p>
                <h3 className="text-2xl font-display font-extrabold text-white mb-3">Email Us</h3>
                <p className="text-white/55 text-sm leading-relaxed mb-5 font-light">
                  Send us a detailed message and we'll get back to you within 24 hours. Great for billing, technical, and account queries.
                </p>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-bold">support@hirenextai.com</span>
                </div>
                <p className="text-xs text-white/35 mb-5">Expected reply: under 24 hours on business days</p>
                <a href="mailto:support@hirenextai.com" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-sm hover:opacity-90 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_35px_rgba(59,130,246,0.6)]">
                  <Mail className="w-4 h-4" /> Send Email
                </a>
              </div>
            </motion.div>
          </FadeUp>
        </div>
      </section>

      {/* CONTACT FORM + FAQ */}
      <section className="relative z-10 py-12 px-6 max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* FORM */}
          <FadeUp>
            <h2 className="text-3xl font-display font-bold mb-2 text-white">Send Us a Message</h2>
            <p className="text-white/50 text-sm mb-7">Fill out the form and we'll save your message in our dashboard and respond within one business day.</p>

            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="glass-card p-10 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 18 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Message Sent! 🎉</h3>
                <p className="text-white/60 text-sm mb-1">We'll reply to <strong className="text-white">{form.email}</strong> soon.</p>
                <p className="text-xs text-white/30 mb-6">Average response time: 24 hours</p>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="text-sm text-indigo-400 hover:text-white transition-colors underline underline-offset-4">
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Your Name</label>
                    <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Email Address</label>
                    <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Subject</label>
                  <select required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors appearance-none">
                    <option value="" className="bg-gray-900">Select a topic…</option>
                    <option value="billing" className="bg-gray-900">Billing & Subscription</option>
                    <option value="technical" className="bg-gray-900">Technical Issue</option>
                    <option value="feature" className="bg-gray-900">Feature Request</option>
                    <option value="account" className="bg-gray-900">Account Help</option>
                    <option value="other" className="bg-gray-900">Other</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs text-white/50 uppercase tracking-wider">Message</label>
                    <span className={`text-xs tabular-nums ${form.message.length >= MAX_MSG ? "text-red-400" : "text-white/30"}`}>{form.message.length}/{MAX_MSG}</span>
                  </div>
                  <textarea required rows={5} maxLength={MAX_MSG} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Describe your issue or question in detail…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors resize-none" />
                </div>
                <button type="submit" disabled={sending} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 text-white">
                  {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send Message</>}
                </button>
                <p className="text-center text-xs text-white/30">Your message is saved in our admin dashboard · Response within 24 hours</p>
              </form>
            )}
          </FadeUp>

          {/* FAQ */}
          <FadeUp delay={0.1}>
            <h2 className="text-3xl font-display font-bold mb-2 text-white">Frequently Asked</h2>
            <p className="text-white/50 text-sm mb-7">Quick answers to common support questions.</p>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="glass-card overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left gap-3">
                    <span className="text-sm font-medium text-white/90 leading-snug">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-white/40 shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                        className="px-4 pb-4 overflow-hidden">
                        <p className="text-white/60 text-sm leading-relaxed font-light">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* SOCIAL MEDIA */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <FadeUp className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">FOLLOW US</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">Find Us on Social Media</h2>
          <p className="text-white/55 max-w-xl mx-auto text-sm leading-relaxed">
            Stay updated with AI job search tips, career success stories, and platform news across our channels. We're active worldwide.
          </p>
        </FadeUp>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {socials.map((s, i) => (
            <FadeUp key={i} delay={i * 0.08}>
              <a href={s.href} target="_blank" rel="noopener noreferrer"
                className={`group flex flex-col items-center gap-4 p-6 rounded-2xl border ${s.border} ${s.bg} ${s.hover} transition-all duration-300 hover:-translate-y-1`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <s.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-sm">{s.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{s.handle}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-white/60 group-hover:text-white transition-colors">
                  {s.tag} <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* OFFICE ADDRESS */}
      <section className="relative z-10 py-8 px-6 max-w-5xl mx-auto mb-8">
        <FadeUp>
          <div className="glass-card p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-[#8B5CF6]" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">OFFICE ADDRESS</p>
              <p className="text-white font-semibold">Greater Noida, Uttar Pradesh 201310, India</p>
              <p className="text-white/40 text-sm mt-1">Global HQ · Online support worldwide · Available 24/7</p>
            </div>
            <a href="https://maps.google.com/?q=Greater+Noida+Uttar+Pradesh" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-all whitespace-nowrap">
              <MapPin className="w-4 h-4" /> View on Map
            </a>
          </div>
        </FadeUp>
      </section>

      {/* TRUST BAR */}
      <section className="relative z-10 border-t border-white/[0.06] bg-white/[0.015] py-6">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8 px-6">
          <div className="inline-flex items-center gap-2 text-sm text-white/40">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>48-hour refund guarantee</span>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-white/40">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>End-to-end encrypted</span>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-white/40">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>Available in 40+ countries</span>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-white/40">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>24/7 support</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
