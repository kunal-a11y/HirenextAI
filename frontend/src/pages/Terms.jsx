import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import {
  FileText, Scale, Users, CreditCard, Brain, AlertTriangle, Info, RefreshCw, XCircle, CheckCircle, Globe, Shield, Lock, Sparkles, ChevronDown, Mail, Clock, ArrowRight
} from "lucide-react";

function FadeUp({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const sections = [
  {
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    tag: "Required",
    title: "Acceptance of Terms",
    content: [
      "By accessing or using HirenextAI, you agree to be bound by these Terms and Conditions in full.",
      "If you do not agree to these terms, please do not access or use our services.",
      "These terms apply to all users worldwide regardless of location or device used to access the platform.",
      "Use of the platform constitutes acceptance of the most current version of these terms.",
    ],
  },
  {
    icon: Globe,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    tag: "Global",
    title: "Use of Service",
    content: [
      "HirenextAI is an AI-powered job search and career assistance platform intended for individual job seekers worldwide.",
      "You must be at least 18 years old to create an account and use our services.",
      "You agree to provide accurate, complete, and up-to-date information when creating your account and profile.",
      "You may not use our platform for commercial scraping, bulk data extraction, or any form of automated misuse.",
      "Each account is strictly for a single individual user. Sharing, selling, or transferring accounts is not permitted.",
      "We reserve the right to restrict access from regions where providing our service would violate local laws.",
    ],
  },
  {
    icon: Brain,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    tag: "AI Tools",
    title: "AI-Generated Content",
    content: [
      "HirenextAI uses AI to generate cover letters, resume suggestions, interview guides, and career advice.",
      "AI-generated content is provided as a starting point and creative aid — we do not guarantee any specific outcomes.",
      "You are fully responsible for reviewing, personalising, and verifying all AI-generated content before submitting to employers.",
      "Do not submit AI-generated content verbatim without review — it may not accurately reflect your personal voice, experience, or the specific job requirements.",
      "HirenextAI is not liable for any decisions made by employers based on AI-generated content you submit.",
    ],
  },
  {
    icon: CreditCard,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    tag: "Billing",
    title: "Subscription & Billing",
    content: [
      "Free plan users have access to limited AI generations per month as specified on our pricing page.",
      "Paid subscriptions are billed monthly or annually in USD. Local currency display is for reference only.",
      "We offer a 48-hour money-back guarantee for new paid subscribers. Contact support within 48 hours of payment for a full refund.",
      "After the 48-hour window, subscription fees are non-refundable except where required by applicable consumer protection law.",
      "We reserve the right to modify pricing with 30 days advance notice via email.",
      "You may cancel your subscription at any time. Access continues until the end of the current billing period.",
    ],
  },
  {
    icon: FileText,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    tag: "Ownership",
    title: "Intellectual Property",
    content: [
      "All platform code, design, AI models, branding, and original content are the intellectual property of HirenextAI.",
      "Content you create using our AI tools (cover letters, resumes, etc.) belongs entirely to you.",
      "You grant us a limited, non-exclusive license to process your profile data solely to provide and improve the service.",
      "You may not copy, reproduce, or distribute any part of our platform without explicit written permission.",
    ],
  },
  {
    icon: AlertTriangle,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    tag: "Prohibited",
    title: "Prohibited Conduct",
    content: [
      "Attempting to hack, reverse-engineer, or circumvent any security measures on the platform.",
      "Uploading malicious code, viruses, or any content designed to disrupt or harm the platform or its users.",
      "Creating fake profiles, misrepresenting your identity, or attempting to deceive employers.",
      "Using our platform to harass, defame, stalk, or cause harm to any individual or organisation.",
      "Violating any applicable local, national, or international laws or regulations.",
      "Reselling, sublicensing, or commercialising any part of the HirenextAI platform without written consent.",
    ],
  },
  {
    icon: Info,
    color: "text-teal-400",
    bg: "bg-teal-500/10 border-teal-500/20",
    tag: "Limitations",
    title: "Disclaimers",
    content: [
      "HirenextAI does not guarantee job placement, interview callbacks, salary outcomes, or employment of any kind.",
      "Job listings are aggregated from third-party sources. We are not responsible for the accuracy, availability, or legitimacy of external job postings.",
      "Our AI tools are designed to assist and enhance your job search — not to replace professional judgment or career counselling.",
      "The platform is provided 'as is' without warranties of any kind, express or implied, to the fullest extent permitted by law.",
    ],
  },
  {
    icon: XCircle,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    tag: "Accounts",
    title: "Termination",
    content: [
      "We reserve the right to suspend or permanently terminate accounts that violate these terms without prior notice.",
      "You may delete your account at any time from Dashboard → Settings → Account → Delete Account.",
      "Upon termination, your right to access the platform and all associated data ceases immediately.",
      "We will retain anonymised usage data after termination as described in our Privacy Policy.",
    ],
  },
  {
    icon: RefreshCw,
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
    tag: "Updates",
    title: "Changes to Terms",
    content: [
      "We may update these Terms periodically to reflect changes in our service, legal requirements, or business practices.",
      "Material changes will be notified via email to your registered address at least 14 days before they take effect.",
      "Continued use of the platform after changes take effect constitutes your acceptance of the updated terms.",
      "If you disagree with any updated terms, you must stop using the platform and may delete your account.",
    ],
  },
];

export default function Terms() {
  const [openSection, setOpenSection] = useState(0);

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', width: '100%' }} className="bg-background relative">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-60px] left-[15%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[160px]" />
        <div className="absolute bottom-[10%] right-[-60px] w-[400px] h-[400px] rounded-full bg-purple-600/8 blur-[130px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[400px] rounded-full bg-purple-500/4 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px,rgba(255,255,255,0.5) 1px,transparent 0)", backgroundSize: "40px 40px" }} />
      </div>

      <Navbar />

      <section className="relative z-10 pt-40 pb-16 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4"
          >
            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            <span className="text-white/80 text-sm font-medium">Terms & Legal</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
          >
            <FileText className="w-8 h-8 text-purple-400" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-3 text-white">Terms & Conditions</h1>
          <p className="text-white/35 text-sm mb-4">Last updated: May 2026</p>
          <p className="text-white/55 max-w-2xl mx-auto text-sm leading-relaxed font-light">
            Please read these terms carefully. By using HirenextAI, you agree to these terms. We've written them in plain language so they're easy to understand.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <motion.div whileHover={{ scale: 1.05, y: -2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>Plain Language</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>48hr Refund Policy</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Global Platform</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>GDPR Compliant</span>
            </motion.div>
          </div>
        </div>

        {/* Desktop Quick Nav */}
        <div className="hidden md:flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
          {sections.map((section, i) => (
            <div
              key={i}
              onClick={() => document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs hover:text-white/70 hover:bg-white/8 transition-all cursor-pointer whitespace-nowrap"
            >
              {section.title}
            </div>
          ))}
        </div>

        {/* Sections List (Accordion) */}
        <div className="space-y-4">
          {sections.map((section, i) => {
            const IconComponent = section.icon;
            return (
              <FadeUp key={i} delay={i * 0.05}>
                <motion.div
                  id={`section-${i}`}
                  whileHover={{ y: -2 }}
                  className="glass-card overflow-hidden cursor-pointer group"
                >
                  <div
                    onClick={() => setOpenSection(openSection === i ? null : i)}
                    className="flex items-center justify-between p-6 select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${section.bg}`}>
                        <IconComponent className={`w-5 h-5 ${section.color}`} />
                      </div>
                      <div className="flex items-center">
                        <span className="text-base font-bold text-white">{section.title}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/30 text-[10px] ml-3">
                          {section.tag}
                        </span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: openSection === i ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="shrink-0"
                    >
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    </motion.div>
                  </div>

                  <AnimatePresence initial={false}>
                    {openSection === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/5 px-6 pb-6 pt-5">
                          <ul className="space-y-3">
                            {section.content.map((item, j) => (
                              <li key={j} className="flex items-start gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-current ${section.color}`} />
                                <p className="text-white/60 text-sm leading-relaxed font-light">{item}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </FadeUp>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16">
          <FadeUp>
            <div className="glass-card p-10 text-center relative overflow-hidden max-w-3xl mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 to-[#8B5CF6]/8 pointer-events-none" />
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="inline-flex mb-4"
              >
                <Scale className="w-8 h-8 text-purple-400" />
              </motion.div>

              <h2 className="text-2xl font-display font-bold text-white mb-3 relative z-10">Questions About These Terms?</h2>
              <p className="text-white/55 text-sm mb-6 max-w-lg mx-auto relative z-10 font-light">
                We've tried to keep our terms clear and fair. If anything is unclear or you have a question, our team is happy to help.
              </p>

              <div className="flex gap-3 justify-center mb-6 relative z-10">
                <Link to="/contact" className="btn-primary py-3 px-8 inline-flex items-center gap-2 text-white">
                  <Mail className="w-4 h-4" /> Contact Us
                </Link>
                <Link to="/privacy-policy" className="btn-secondary py-3 px-8 inline-flex items-center gap-2 text-white">
                  <Shield className="w-4 h-4" /> Privacy Policy
                </Link>
              </div>

              <div className="flex flex-wrap gap-4 justify-center mt-5 relative z-10">
                <div className="flex items-center gap-1.5 text-white/35 text-xs">
                  <Mail className="w-3.5 h-3.5" />
                  <span>support@hirenextai.com</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/35 text-xs">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>48hr refund window</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/35 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                  <span>Plain language terms</span>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </div>
  );
}
