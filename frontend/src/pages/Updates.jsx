import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { 
  Search, Calendar, ChevronDown, ChevronUp, Zap, Sparkles, 
  ArrowUpRight, Tag, HelpCircle, Check, ArrowRight
} from "lucide-react";
import { ScrollTimelineTrack, TimelineNode } from "../components/ui/timeline";

const categories = ["All", "Features", "Improvements", "Security", "Bug Fixes", "AI", "UI"];

const changelogs = [
  {
    version: "v2.5.0",
    title: "AI Career Coach & Model Dashboard",
    date: "June 28, 2026",
    category: "AI",
    badge: "Latest",
    desc: "Get personalized career roadmap guidelines, missing technical skill recommendations, and customized learning recommendations.",
    newFeatures: ["Checkpoint milestones on interactive roadmaps", "Missing skill metrics indicators"],
    performanceImprovements: ["Vite dev server page load speeds optimized by 40%"],
    securityImprovements: [],
    uiEnhancements: ["Modern custom scrollbar sidebar design", "AI Models settings panel tab page"],
    aiImprovements: ["HirenextAI 0.1, Flash, and Pro model routing configurations"],
    bugFixes: ["Safari navbar layout overlapping fixed"]
  },
  {
    version: "v2.4.0",
    title: "Mock Interview Practice Audio Feedback",
    date: "May 20, 2026",
    category: "Features",
    badge: "Beta",
    desc: "Practice target role questions with real-time speech translation and receive diagnostic feedback on your tone and clarity.",
    newFeatures: ["Simulated audio recording waveform visualizer", "Confidence scoring evaluation cards"],
    performanceImprovements: ["Speech-to-text response latency reduced to 300ms"],
    securityImprovements: [],
    uiEnhancements: [],
    aiImprovements: ["Audio conversational prompts context mapping"],
    bugFixes: ["Microphone activation loops patched"]
  },
  {
    version: "v2.3.0",
    title: "ATS Resume Builder Engine & Templates",
    date: "April 12, 2026",
    category: "Improvements",
    badge: "Preview",
    desc: "Draft bot-friendly resumes with high-density industry keywords and standard PDF export formatting.",
    newFeatures: ["ATS keyword matching parser circular gauges"],
    performanceImprovements: [],
    securityImprovements: [],
    uiEnhancements: ["Standardized clean resume template options"],
    aiImprovements: ["Automated resume description generator prompts"],
    bugFixes: ["PDF page-break text clipping fixed"]
  },
  {
    version: "v2.2.0",
    title: "Encrypted Document Vault Pipelines",
    date: "March 18, 2026",
    category: "Security",
    badge: "v2.2",
    desc: "Protect profile documents, resumes, and active application transcripts with secure encryption protocols.",
    newFeatures: [],
    performanceImprovements: [],
    securityImprovements: ["Cryptographically protected storage lockers", "Multi-layered user validation checks"],
    uiEnhancements: [],
    aiImprovements: [],
    bugFixes: ["Session redirect timeouts fixed"]
  },
  {
    version: "v1.1.0",
    title: "Chrome Extension Autofill Engine",
    date: "Feb 05, 2026",
    category: "UI",
    badge: "v1.1",
    desc: "Autofill application portals on LinkedIn and Indeed in a single click directly from your web browser.",
    newFeatures: ["Extension background script form-inputs parser"],
    performanceImprovements: ["Autofill loading speeds reduced by 25%"],
    securityImprovements: [],
    uiEnhancements: ["Extension settings popup dashboard"],
    aiImprovements: [],
    bugFixes: ["Cross-origin frame upload blocks fixed"]
  },
  {
    version: "v1.0.0",
    title: "Platform Launch: Smart Job Matcher",
    date: "Jan 03, 2026",
    category: "Features",
    badge: "v1.0",
    desc: "Upload credentials, parse skills, and match relevant career listings sorted by percentage compatibility.",
    newFeatures: ["Salary predictor insights cards", "LinkedIn & Glassdoor list scanners"],
    performanceImprovements: [],
    securityImprovements: [],
    uiEnhancements: [],
    aiImprovements: ["Initial HirenextAI model integration module"],
    bugFixes: ["Pipeline dashboard charts rendering failure fixed"]
  }
];



export default function Updates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedCard, setExpandedCard] = useState(null);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const filteredLogs = useMemo(() => {
    return changelogs.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();
      
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.version.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleExpand = (version) => {
    if (expandedCard === version) {
      setExpandedCard(null);
    } else {
      setExpandedCard(version);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans overflow-x-hidden selection:bg-black selection:text-white">
      <Navbar />

      {/* ── HERO HEADER ─────────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 md:pt-48 md:pb-28 flex flex-col items-center justify-center text-center px-4 overflow-hidden border-b border-neutral-100 bg-[#F9F9F9]">
        {/* Soft background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#EAEAEA_1px,transparent_1px),linear-gradient(to_bottom,#EAEAEA_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.3] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#F9F9F9_100%)] pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-black text-white mb-6 border border-neutral-800">
            <Zap className="w-3.5 h-3.5 text-white" />
            Product Updates
          </div>
          
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] text-black"
          >
            Latest Improvements & <br />
            <span className="bg-gradient-to-r from-neutral-400 via-neutral-600 to-black bg-clip-text text-transparent">Platform Updates</span>
          </h1>
          
          <p className="mt-6 text-sm sm:text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
            Follow the latest engineering releases, security updates, feature additions, and user interface improvements on the HirenextAI platform.
          </p>
        </div>
      </section>

      {/* ── FILTER & SEARCH PANEL ────────────────────────────────── */}
      <section className="sticky top-[69px] z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-100 py-4">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Categories Tab List */}
          <div className="flex flex-wrap gap-1.5 justify-start w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedCategory === cat
                    ? "bg-black text-white border-black shadow-sm"
                    : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input bar */}
          <div className="relative w-full md:w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search changelog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-xs text-black placeholder:text-neutral-450 focus:outline-none focus:border-black transition-all"
            />
          </div>

        </div>
      </section>

      {/* ── TIMELINE FEED ───────────────────────────────────────── */}
      {filteredLogs.length > 0 ? (
        <section ref={containerRef} className="py-20 max-w-3xl mx-auto px-4 relative flex-grow">
          {/* Continuous background track line connecting start to end node center */}
          <ScrollTimelineTrack containerRef={containerRef} lineXClass="left-6 md:left-8" topOffset={22} bottomOffset={22} />

          <div className="space-y-10">
            <AnimatePresence mode="popLayout">
              {filteredLogs.map((log, index) => {
                const isExpanded = expandedCard === log.version;
                return (
                  <motion.div
                    key={log.version}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    className="relative pl-12 md:pl-16 flex flex-col text-left"
                  >
                    {/* Custom interactive animated circle node */}
                    <TimelineNode 
                      scrollYProgress={scrollYProgress} 
                      index={index} 
                      total={filteredLogs.length} 
                    />

                    {/* Changelog Card */}
                    <div className="bg-white border border-neutral-150 p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:border-neutral-300 transition-all duration-300">
                      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-neutral-50 border border-neutral-100 px-2 py-0.5 rounded text-neutral-800">
                            {log.version}
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-black text-white uppercase tracking-wider">
                            {log.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-400 font-medium flex items-center gap-1.5">
                          <Calendar size={12} />
                          {log.date}
                        </div>
                      </div>

                      <h3 className="text-base font-extrabold text-black mb-2">{log.title}</h3>
                      <p className="text-xs text-neutral-500 leading-relaxed mb-5">{log.desc}</p>

                      {/* Collapsible Details trigger button */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(log.version)}
                        className="inline-flex items-center gap-1 text-[11px] text-neutral-700 hover:text-black font-bold border-b border-transparent hover:border-black transition-colors"
                      >
                        {isExpanded ? (
                          <>Hide Release Details <ChevronUp size={12} /></>
                        ) : (
                          <>View Release Details <ChevronDown size={12} /></>
                        )}
                      </button>

                      {/* Expandable Content Block */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                            className="overflow-hidden mt-6 pt-5 border-t border-neutral-100 space-y-4"
                          >
                            {/* New Features section */}
                            {log.newFeatures.length > 0 && (
                              <div>
                                <h5 className="text-[10px] font-bold text-black uppercase tracking-wider mb-2 flex items-center gap-1">
                                  <Sparkles size={11} className="text-black" /> New Features
                                </h5>
                                <ul className="space-y-1 pl-1">
                                  {log.newFeatures.map((f, i) => (
                                    <li key={i} className="text-xs text-neutral-600 flex items-start gap-2">
                                      <span className="text-black font-bold select-none mt-0.5">•</span>
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* AI Improvements section */}
                            {log.aiImprovements.length > 0 && (
                              <div>
                                <h5 className="text-[10px] font-bold text-black uppercase tracking-wider mb-2 flex items-center gap-1">
                                  <Zap size={11} className="text-black" /> AI Improvements
                                </h5>
                                <ul className="space-y-1 pl-1">
                                  {log.aiImprovements.map((f, i) => (
                                    <li key={i} className="text-xs text-neutral-600 flex items-start gap-2">
                                      <span className="text-black font-bold select-none mt-0.5">•</span>
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* UI Enhancements section */}
                            {log.uiEnhancements.length > 0 && (
                              <div>
                                <h5 className="text-[10px] font-bold text-black uppercase tracking-wider mb-2 flex items-center gap-1">
                                  <Tag size={11} className="text-black" /> UI Enhancements
                                </h5>
                                <ul className="space-y-1 pl-1">
                                  {log.uiEnhancements.map((f, i) => (
                                    <li key={i} className="text-xs text-neutral-600 flex items-start gap-2">
                                      <span className="text-black font-bold select-none mt-0.5">•</span>
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Performance Improvements section */}
                            {log.performanceImprovements.length > 0 && (
                              <div>
                                <h5 className="text-[10px] font-bold text-black uppercase tracking-wider mb-2 flex items-center gap-1">
                                  <ArrowUpRight size={11} className="text-black" /> Performance Improvements
                                </h5>
                                <ul className="space-y-1 pl-1">
                                  {log.performanceImprovements.map((f, i) => (
                                    <li key={i} className="text-xs text-neutral-600 flex items-start gap-2">
                                      <span className="text-black font-bold select-none mt-0.5">•</span>
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Security Improvements section */}
                            {log.securityImprovements.length > 0 && (
                              <div>
                                <h5 className="text-[10px] font-bold text-black uppercase tracking-wider mb-2 flex items-center gap-1">
                                  <Check size={11} className="text-black" /> Security Improvements
                                </h5>
                                <ul className="space-y-1 pl-1">
                                  {log.securityImprovements.map((f, i) => (
                                    <li key={i} className="text-xs text-neutral-600 flex items-start gap-2">
                                      <span className="text-black font-bold select-none mt-0.5">•</span>
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Bug Fixes section */}
                            {log.bugFixes.length > 0 && (
                              <div>
                                <h5 className="text-[10px] font-bold text-red-655 uppercase tracking-wider mb-2 flex items-center gap-1">
                                  <Check size={11} className="text-red-500" /> Bug Fixes
                                </h5>
                                <ul className="space-y-1 pl-1">
                                  {log.bugFixes.map((f, i) => (
                                    <li key={i} className="text-xs text-neutral-600 flex items-start gap-2">
                                      <span className="text-red-500 font-bold select-none mt-0.5">•</span>
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>
      ) : (
        /* Empty State Fallback (perfectly centered, no timeline elements) */
        <div className="flex-grow flex flex-col items-center justify-center py-24 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="w-12 h-12 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-5 h-5 text-neutral-450" />
            </div>
            <h4 className="text-sm font-bold text-black">No updates found</h4>
            <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
              Try another search term or choose a different category.
            </p>
          </motion.div>
        </div>
      )}

      {/* ── EMAIL NEWSLETTER CTA ─────────────────────────────────── */}
      <section className="py-24 text-center bg-white border-t border-neutral-100">
        <div className="max-w-xl mx-auto px-4 flex flex-col items-center">
          <Sparkles className="w-8 h-8 text-neutral-650 mb-6" />
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">
            Subscribe to Changelog Alerts
          </h2>
          <p className="text-xs text-neutral-500 mt-2 max-w-xs mx-auto leading-relaxed">
            Get instant alerts when we release new platform features and improvements. No spam, unsubscribe anytime.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); alert("Successfully subscribed!"); }} className="w-full flex gap-3 mt-8">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 bg-[#F9F9F9] border border-neutral-150 rounded-xl text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:border-black transition-all"
            />
            <button
              type="submit"
              className="bg-black text-white hover:bg-neutral-800 text-xs font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-md"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
