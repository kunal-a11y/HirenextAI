import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import {
  Sparkles, Zap, BrainCircuit, Target, Briefcase, ArrowRight,
  Star, Users, TrendingUp, Cpu, Rocket, FileText, Bot, UserPlus,
  UserCircle, ChevronDown, Quote, Check, Play, LogIn, Link as LinkIcon, MessageSquare, Mic
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { DemoRoleModal } from "../components/DemoRoleModal";
import { animateFloatingParticles, animateMorphingBlobs, animateWordStagger, animateCardStaggerOnScroll, animateCountUp } from "../lib/animeAnimations";

const phrases = [
  "Smarter — Not Harder",
  "Find Jobs with AI", 
  "Apply in One Click",
  "Land Your Dream Job",
  "50+ Countries. One AI."
]

function useTypingCycle() {
  const [text, setText] = useState('')
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const currentPhrase = phrases[phraseIdx]

    const tick = () => {
      if (!isDeleting) {
        if (text.length < currentPhrase.length) {
          setText(currentPhrase.slice(0, text.length + 1))
          timeoutRef.current = setTimeout(tick, 35)
        } else {
          // Done typing, wait then delete
          timeoutRef.current = setTimeout(() => {
            setIsDeleting(true)
          }, 1200)
        }
      } else {
        if (text.length > 0) {
          setText(currentPhrase.slice(0, text.length - 1))
          timeoutRef.current = setTimeout(tick, 20)
        } else {
          // Done deleting, next phrase
          setIsDeleting(false)
          setPhraseIdx(i => (i + 1) % phrases.length)
        }
      }
    }

    timeoutRef.current = setTimeout(tick, 
      isDeleting ? 20 : 35)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [text, phraseIdx, isDeleting])

  return text
}

/* ── Section fade-up wrapper ─────────────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Animated Counter ────────────────────────────────────────────────────── */
function Counter({ value, suffix = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  const targetValue = value.replace(/[^0-9]/g, "");
  const target = targetValue ? parseInt(targetValue) : 0;

  useEffect(() => {
    if (isInView && target > 0) {
      let start = 0;
      const duration = 2000;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix || (value.includes("+") ? "+" : value.includes("%") ? "%" : "")}
    </span>
  );
}

function StatCounter({ target, suffix }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView && target > 0) {
      let startTime = null;
      const duration = 1400;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);
        
        // Easing function (easeOutQuad)
        const easePercentage = percentage * (2 - percentage);
        
        setCount(easePercentage * target);

        if (percentage < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(target);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, target]);

  const formatStat = (val) => {
    if (suffix === 'M+') 
      return Math.max(1, Math.round(val/1000000)) + 'M+'
    if (suffix === 'k+') 
      return Math.max(1, Math.round(val/1000)) + 'k+'
    if (suffix === '%') 
      return Math.round(val) + '%'
    return Math.floor(val)
  };

  return <span ref={ref}>{formatStat(count)}</span>;
}

const statsData = [
  {
    icon: Zap,
    number: 2000000,
    display: "2M+",
    suffix: "M+",
    label: "AI APPLICATIONS",
    tag: "Auto Apply",
    glow: "rgba(139,92,246,0.32)"
  },
  {
    icon: TrendingUp,
    number: 94,
    display: "94%",
    suffix: "%",
    label: "SUCCESS RATE",
    tag: "Smart Match",
    glow: "rgba(34,197,94,0.26)"
  },
  {
    icon: Users,
    number: 50000,
    display: "50k+",
    suffix: "k+",
    label: "ACTIVE USERS",
    tag: "Trusted",
    glow: "rgba(251,191,36,0.24)"
  },
  {
    icon: Target,
    number: 15000,
    display: "15k+",
    suffix: "k+",
    label: "DAILY MATCHES",
    tag: "Live Jobs",
    glow: "rgba(236,72,153,0.26)"
  }
];

const statsTags = ["ATS-ready", "AI matched", "One-click apply", "Live insights"];

export default function Landing() {
  const { setDemoMode } = useAuthStore();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoRoleModalOpen, setDemoRoleModalOpen] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('hnai_visitors');
    const current = stored ? parseInt(stored) : 
      Math.floor(Math.random() * 500) + 1200;
    const newCount = current + 1;
    localStorage.setItem('hnai_visitors', newCount);
    setVisitorCount(newCount);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveStep(prev => (prev % 4) + 1);
    }, 1500);
    return () => clearInterval(interval);
  }, [isHovered]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const typedText = useTypingCycle();
  const heroParticlesRef = useRef(null);

  // Initialize particles animation
  useEffect(() => {
    if (heroParticlesRef.current) {
      // Simulate particles animation
      const particles = heroParticlesRef.current.querySelectorAll('.particle');
      anime({
        targets: particles,
        y: [anime.random(0, 30), anime.random(-30, 0)],
        x: [anime.random(-20, 20), anime.random(-30, 30)],
        opacity: [0.3, 0.8, 0.3],
        duration: () => anime.random(3000, 5000),
        delay: anime.stagger(50),
        easing: 'easeInOutQuad',
        loop: true,
      });
    }
  }, []);

  const handleDemoRole = () => {
    setDemoRoleModalOpen(false);
    navigate("/demo");
  };

  const featureHighlights = [
    {
      icon: FileText,
      title: "AI Resume Builder",
      desc: "Craft a professional, ATS-friendly resume in minutes with our intelligent editor.",
      hoverClass: "hover:border-[rgba(99,102,241,0.5)] hover:bg-[rgba(99,102,241,0.06)] hover:shadow-[0_20px_60px_rgba(99,102,241,0.15)]",
      glowBg: "radial-gradient(circle, rgba(99,102,241,0.15), transparent)",
      iconBgHover: "group-hover:bg-[rgba(99,102,241,0.15)] group-hover:border-[rgba(99,102,241,0.3)]",
      iconColorHover: "group-hover:text-[#818CF8]",
      iconTransform: "group-hover:scale-110 group-hover:rotate-[5deg]",
      linkHoverColor: "group-hover:text-[#818CF8]"
    },
    {
      icon: Mic,
      title: "Interview Prep AI",
      desc: "Practice with realistic AI mock interviews and get instant feedback on your performance.",
      hoverClass: "hover:border-[rgba(139,92,246,0.5)] hover:bg-[rgba(139,92,246,0.06)] hover:shadow-[0_20px_60px_rgba(139,92,246,0.15)]",
      glowBg: "radial-gradient(circle, rgba(139,92,246,0.15), transparent)",
      iconBgHover: "group-hover:bg-[rgba(139,92,246,0.15)] group-hover:border-[rgba(139,92,246,0.3)]",
      iconColorHover: "group-hover:text-[#A78BFA]",
      iconTransform: "group-hover:scale-110 group-hover:rotate-[-5deg]",
      linkHoverColor: "group-hover:text-[#A78BFA]"
    },
    {
      icon: Target,
      title: "Job Match AI",
      desc: "Our neural matching engine finds roles that perfectly align with your skills and goals.",
      hoverClass: "hover:border-[rgba(16,185,129,0.5)] hover:bg-[rgba(16,185,129,0.06)] hover:shadow-[0_20px_60px_rgba(16,185,129,0.15)]",
      glowBg: "radial-gradient(circle, rgba(16,185,129,0.15), transparent)",
      iconBgHover: "group-hover:bg-[rgba(16,185,129,0.15)] group-hover:border-[rgba(16,185,129,0.3)]",
      iconColorHover: "group-hover:text-[#34D399]",
      iconTransform: "group-hover:scale-110 group-hover:rotate-[5deg]",
      linkHoverColor: "group-hover:text-[#34D399]"
    }
  ];

  const steps = [
    { icon: LogIn, title: "Sign In", desc: "Create your free account in seconds" },
    { icon: LinkIcon, title: "Connect Accounts", desc: "Link your LinkedIn and Indeed accounts" },
    { icon: MessageSquare, title: "Chat with AI", desc: "Tell AI what job you want to find" },
    { icon: Zap, title: "Apply with AI", desc: "AI fills forms and applies for you" }
  ];

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "BCA Graduate, Noida",
      content: "Got my first job offer within 2 weeks! The AI matched me perfectly.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
      tag: "Got Hired ✓",
      stars: 5
    },
    {
      name: "Priya Verma",
      role: "MBA Fresher, Delhi",
      content: "Just typed 'find marketing jobs in Delhi' and got perfect matches!",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      tag: "5 Apps in 1 Day ✓",
      stars: 5
    },
    {
      name: "Arjun Patel",
      role: "CS Engineer, Bangalore",
      content: "The Apply with AI extension fills every form automatically!",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
      tag: "Saves 5hrs/week ✓",
      stars: 5
    },
    {
      name: "Sneha Gupta",
      role: "Data Analyst, Pune",
      content: "Had 3 job offers in a month. The mock interview AI prepared me better than any coaching class.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
      tag: "3 Offers ✓",
      stars: 5
    },
    {
      name: "Vikram Singh",
      role: "Full Stack Dev, Hyderabad",
      content: "The match percentage feature is brilliant. Stopped wasting time on wrong applications. Got my dream job!",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
      tag: "Dream Job ✓",
      stars: 5
    },
    {
      name: "Ananya Roy",
      role: "HR Professional, Mumbai",
      content: "Applied to 20 jobs in one day with AI. The cover letters were so good, recruiters thought I wrote them!",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
      tag: "10x Faster ✓",
      stars: 5
    }
  ];

  const faqs = [
    {
      q: "What is HirenextAI?",
      a: "HirenextAI is an AI-powered job assistant that helps you find jobs, match your skills to roles, auto-fill applications, and prepare for interviews — all in one platform."
    },
    {
      q: "How does AI job matching work?",
      a: "Connect your LinkedIn or Indeed account. Our AI searches jobs and compares each role's requirements with your profile, giving you a match percentage so you apply to the right jobs."
    },
    {
      q: "What is the Apply with AI feature?",
      a: "Install our free Chrome extension. When you click 'Apply with AI', it opens the job page, fills every form field automatically with your details and resume, and shows you a preview before you submit."
    },
    {
      q: "Is my data safe?",
      a: "Yes. All your data is encrypted and stored securely. We never share your personal information or resume with third parties without your permission."
    },
    {
      q: "What is the free plan?",
      a: "The free plan gives you 20 AI credits/month, 10 application tracking slots, and basic job search access. Upgrade to Pro for unlimited everything."
    },
    {
      q: "Do you support jobs outside India?",
      a: "Yes! HirenextAI supports job search in 50+ countries. AI automatically searches jobs based on your location and preferred country."
    }
  ];

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', width: '100%' }} className="bg-[#050505] text-white relative flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section 
        id="home" 
        style={{ paddingTop: '100px', minHeight: '100vh', overflow: 'visible' }}
        className="relative pb-20 px-6 flex flex-col justify-center items-center z-10"
      >
        {/* Background Effects with Particles */}
        <div className="absolute inset-0 z-0" ref={heroParticlesRef}>
          <div className="absolute inset-0 graph-grid opacity-20" />
          <div className="absolute inset-0 graph-grid-dots opacity-40" />
          <motion.div style={{ y: y1 }} className="absolute top-[-10%] left-[10%] w-[800px] h-[800px] rounded-full bg-indigo-500/10 blur-[150px] animate-pulse" />
          <motion.div style={{ y: y2 }} className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[130px] animate-pulse" />
          
          {/* Floating Particles */}
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="particle absolute w-1 h-1 rounded-full bg-purple-500/40 pointer-events-none"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
          
          {/* Animated Graph Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            <motion.path
              d="M 0 500 Q 250 400 500 500 T 1000 500"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div style={{ overflow: 'visible' }} className="max-w-7xl mx-auto text-center relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-10 backdrop-blur-md"
          >
            <div className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
            <span className="text-[12px] font-bold text-white/70 tracking-widest uppercase">Next-Gen Career AI is Here</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ overflow: 'visible', clip: 'unset', maxHeight: 'none' }}
            className="text-5xl md:text-7xl premium-heading mb-8"
          >
            <span>Hire Better.</span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #A78BFA, #818CF8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline'
            }}>
              {typedText}
            </span>
            <span style={{
              display: 'inline-block',
              width: '3px',
              height: '0.85em',
              background: '#8B5CF6',
              marginLeft: '4px',
              verticalAlign: 'middle',
              borderRadius: '2px',
              animation: 'cursorBlink 0.8s step-end infinite'
            }} />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-base md:text-lg text-white/50 max-w-2xl mx-auto mb-10 font-light leading-relaxed"
          >
            The AI-powered platform designed to craft perfect applications, optimize resumes for ATS, and streamline recruiting for the modern workforce.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register" className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#8B5CF6] text-white font-bold flex items-center justify-center hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 transition-all duration-300 text-sm">
              Get Started for Free
            </Link>
            <button
              onClick={() => setDemoRoleModalOpen(true)}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-bold flex items-center justify-center gap-3 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 text-sm"
            >
              <Play className="w-4 h-4 text-[#8B5CF6] fill-[#8B5CF6]" /> Try Live Demo
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.95, ease: "easeOut" }}
            className="mt-9 flex flex-col items-center justify-center gap-2 text-white/35"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Marquee Strip 1 */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '16px 0',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          fontSize: '11px',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.25)',
          padding: '0 24px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          fontWeight: '700',
          borderRight: '1px solid rgba(255,255,255,0.08)'
        }}>
          SUPPORTED BY:
        </div>
        <div className="marquee-container" style={{ overflow: 'hidden', display: 'flex', flexGrow: 1, width: '100%' }}>
          <div className="marquee-track" style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'marqueeScroll 20s linear infinite' }}>
            {['LinkedIn', 'Indeed', 'Naukri', 'Glassdoor', 'Internshala', 'Monster'].map((item, idx) => (
              <span key={idx} className="marquee-item" style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.25)', padding: '0 32px', whiteSpace: 'nowrap', letterSpacing: '0.05em', transition: 'color 0.2s', cursor: 'default' }}>
                {item}
              </span>
            ))}
            {['LinkedIn', 'Indeed', 'Naukri', 'Glassdoor', 'Internshala', 'Monster'].map((item, idx) => (
              <span key={`dup-${idx}`} className="marquee-item" style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.25)', padding: '0 32px', whiteSpace: 'nowrap', letterSpacing: '0.05em', transition: 'color 0.2s', cursor: 'default' }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Section A: Feature Highlights */}
      <section id="features" className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="flex items-center gap-2 mb-4 justify-center">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
                  Built for Excellence
                </h2>
              </div>
              <p className="text-white/40 text-base max-w-2xl mx-auto">
                Everything you need to master the modern job market, powered by state-of-the-art AI.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featureHighlights.map((feature, i) => {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.15, ease: "easeOut" }}
                  className={`group relative bg-white/[0.02] border border-white/[0.06] rounded-[20px] p-8 transition-all duration-400 ease-in-out overflow-hidden hover:-translate-y-2 ${feature.hoverClass}`}
                >
                  {/* Glow Blob */}
                  <div 
                    className="glow-blob absolute -top-[50px] -right-[50px] w-[200px] h-[200px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" 
                    style={{ background: feature.glowBg }}
                  />
                  
                  <div className="relative z-10 flex flex-col justify-between h-full w-full">
                    <div>
                      {/* Icon Container */}
                      <div className={`w-14 h-14 rounded-[14px] bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-6 transition-all duration-400 ${feature.iconBgHover} ${feature.iconTransform}`}>
                        <feature.icon className={`w-6 h-6 text-white/40 transition-colors duration-400 ${feature.iconColorHover}`} />
                      </div>
                      
                      <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                      <p className="text-white/40 text-sm leading-relaxed font-light">{feature.desc}</p>
                    </div>
                    
                    <div>
                      <Link 
                        to="/features" 
                        className={`mt-8 inline-flex items-center gap-1 text-white/30 text-sm font-semibold transition-all duration-300 ${feature.linkHoverColor}`}
                      >
                        Learn More 
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Marquee Strip 2 */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '16px 0',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          fontSize: '11px',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.25)',
          padding: '0 24px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          fontWeight: '700',
          borderRight: '1px solid rgba(255,255,255,0.08)'
        }}>
          SUPPORTED BY:
        </div>
        <div className="marquee-container" style={{ overflow: 'hidden', display: 'flex', flexGrow: 1, width: '100%' }}>
          <div className="marquee-track" style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'marqueeScroll 20s linear infinite' }}>
            {['LinkedIn', 'Indeed', 'Naukri', 'Glassdoor', 'Internshala', 'Monster'].map((item, idx) => (
              <span key={idx} className="marquee-item" style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.25)', padding: '0 32px', whiteSpace: 'nowrap', letterSpacing: '0.05em', transition: 'color 0.2s', cursor: 'default' }}>
                {item}
              </span>
            ))}
            {['LinkedIn', 'Indeed', 'Naukri', 'Glassdoor', 'Internshala', 'Monster'].map((item, idx) => (
              <span key={`dup-${idx}`} className="marquee-item" style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.25)', padding: '0 32px', whiteSpace: 'nowrap', letterSpacing: '0.05em', transition: 'color 0.2s', cursor: 'default' }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Section B: How It Works */}
      <section className="relative z-10 py-20 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <FadeUp>
              <h2 className="text-2xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-white/40 text-base max-w-2xl mx-auto">
                Four simple steps to transform your career path.
              </p>
            </FadeUp>
          </div>

          {/* Mobile view: Stacked vertical grid */}
          <div className="relative w-full block md:hidden">
            <div className="grid grid-cols-1 gap-12 relative z-10">
              {steps.map((step, i) => {
                const stepNum = i + 1;
                const isActive = stepNum <= activeStep;
                
                return (
                  <FadeUp key={i} delay={i * 0.1}>
                    <div 
                      className="text-center cursor-pointer select-none"
                      onMouseEnter={() => {
                        setActiveStep(stepNum);
                        setIsHovered(true);
                      }}
                      onMouseLeave={() => {
                        setIsHovered(false);
                      }}
                    >
                      {/* Circle wrapper */}
                      <div 
                        className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 relative transition-all duration-300 ease-in-out ${
                          isActive 
                            ? "bg-[#8B5CF6]/20 border border-[#8B5CF6] shadow-[0_0_20px_rgba(139,92,246,0.4)] scale-110 animate-circle-pulse" 
                            : "bg-white/[0.05] border border-white/10"
                        }`}
                      >
                        {/* Step Number badge */}
                        <div 
                          className={`absolute -top-1 -right-1 w-[22px] h-[22px] rounded-full text-[11px] font-bold flex items-center justify-center transition-all duration-300 ${
                            isActive 
                              ? "bg-[#8B5CF6] text-white" 
                              : "bg-white/10 text-white/70"
                          }`}
                        >
                          {stepNum}
                        </div>
                        
                        {/* Icon */}
                        <step.icon 
                          className={`w-8 h-8 transition-colors duration-300 ${
                            isActive ? "text-[#8B5CF6]" : "text-white/40"
                          }`} 
                        />
                      </div>
                      
                      {/* Title */}
                      <h3 
                        className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                          isActive ? "text-white" : "text-white/40"
                        }`}
                      >
                        {step.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-white/35 text-sm font-light leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </FadeUp>
                );
              })}
            </div>
          </div>

          {/* Desktop view: Redesigned horizontal timeline with lines sitting behind opaque circles */}
          <div className="relative w-full hidden md:block">
            <FadeUp>
              <div style={{ position: 'relative' }}>
                
                {/* CIRCLES ROW */}
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative',
                  marginBottom: '24px',
                  paddingLeft: '10%',
                  paddingRight: '10%'
                }}>
                  
                  {/* Gray base line - sits at vertical center of circles */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '10%',
                    right: '10%',
                    height: '2px',
                    background: 'rgba(255,255,255,0.08)',
                    transform: 'translateY(-50%)',
                    zIndex: 0
                  }} />
                  
                  {/* Purple active line */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '10%',
                    height: '2px',
                    background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)',
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                    transition: 'width 0.5s ease',
                    width: activeStep === 1 ? '0%' :
                           activeStep === 2 ? '30%' :
                           activeStep === 3 ? '63%' : '80%'
                  }} />
                  
                  {/* Each circle - above the line */}
                  {steps.map((step, i) => {
                    const stepNum = i + 1;
                    const isActive = stepNum <= activeStep;
                    
                    return (
                      <div 
                        key={i}
                        onMouseEnter={() => {
                          setActiveStep(stepNum);
                          setIsHovered(true);
                        }}
                        onMouseLeave={() => {
                          setIsHovered(false);
                        }}
                        style={{ 
                          position: 'relative', 
                          zIndex: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        {/* Circle */}
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#050505',
                          backgroundImage: isActive 
                            ? 'linear-gradient(rgba(139,92,246,0.2), rgba(139,92,246,0.2))' 
                            : 'linear-gradient(rgba(255,255,255,0.05), rgba(255,255,255,0.05))',
                          border: isActive 
                            ? '1px solid #8B5CF6' 
                            : '1px solid rgba(255,255,255,0.1)',
                          boxShadow: isActive 
                            ? '0 0 20px rgba(139,92,246,0.4)' 
                            : 'none',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}>
                          <step.icon size={28} color={
                            isActive ? '#8B5CF6' : 'rgba(255,255,255,0.3)'
                          } />
                        </div>
                        
                        {/* Number badge */}
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: isActive 
                            ? '#8B5CF6' 
                            : 'rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'white',
                          zIndex: 3
                        }}>
                          {i + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* TEXT ROW - below circles */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingLeft: '10%',
                  paddingRight: '10%'
                }}>
                  {steps.map((step, i) => {
                    const stepNum = i + 1;
                    const isActive = stepNum <= activeStep;
                    
                    return (
                      <div 
                        key={i}
                        onMouseEnter={() => {
                          setActiveStep(stepNum);
                          setIsHovered(true);
                        }}
                        onMouseLeave={() => {
                          setIsHovered(false);
                        }}
                        style={{ 
                          textAlign: 'center',
                          width: '22%'
                        }}
                      >
                        <div style={{
                          fontWeight: '700',
                          fontSize: '16px',
                          color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                          marginBottom: '6px',
                          transition: 'color 0.3s'
                        }}>
                          {step.title}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: 'rgba(255,255,255,0.35)',
                          lineHeight: '1.5'
                        }}>
                          {step.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Section C: Demo Preview */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-14 items-center">
            <div className="flex-1">
              <FadeUp>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-[#8B5CF6]/20 text-[#8B5CF6] text-[11px] font-bold uppercase tracking-widest mb-6">
                  Interactive Demo
                </div>
                <h2 className="text-2xl md:text-4xl font-bold mb-5 leading-tight">Experience the <br />AI Advantage</h2>
                <p className="text-white/40 text-base font-light leading-relaxed mb-8">
                  Take a tour of our powerful dashboards. We&apos;ve built tailored experiences for both job seekers and recruiters.
                </p>
                <div className="space-y-6">
                  {[
                    { title: "Real-time AI Analysis", icon: Zap },
                    { title: "Smart Candidate Ranking", icon: Target },
                    { title: "Automated Workflow", icon: Cpu }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-[#8B5CF6]" />
                      </div>
                      <span className="text-white/80 font-medium">{item.title}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setDemoRoleModalOpen(true)}
                  className="mt-8 h-11 px-8 rounded-xl bg-[#8B5CF6] text-white font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all text-sm"
                >
                  Launch Interactive Demo <Rocket className="w-4 h-4" />
                </button>
              </FadeUp>
            </div>

            <div className="flex-1 w-full lg:w-auto">
              <FadeUp delay={0.2}>
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#8B5CF6]/20 to-indigo-500/20 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-80 transition duration-1000"></div>
                  <div className="relative bg-[#0d0d15] rounded-3xl border border-white/10 p-4 shadow-2xl overflow-hidden aspect-[4/3]">
                    <div className="h-full w-full bg-white/[0.02] rounded-2xl border border-white/[0.05] p-6">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500/20" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                          <div className="w-3 h-3 rounded-full bg-green-500/20" />
                        </div>
                        <div className="h-2 w-32 rounded-full bg-white/5" />
                      </div>
                      <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="h-20 rounded-xl bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 animate-pulse" />
                          <div className="h-20 rounded-xl bg-white/[0.02] border border-white/[0.05]" />
                          <div className="h-20 rounded-xl bg-white/[0.02] border border-white/[0.05]" />
                        </div>
                        <div className="h-40 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/10 to-transparent border border-white/[0.05] p-6 relative overflow-hidden">
                          <div className="h-4 w-1/3 bg-white/10 rounded-full mb-4" />
                          <div className="h-2 w-full bg-white/5 rounded-full mb-2" />
                          <div className="h-2 w-4/5 bg-white/5 rounded-full mb-2" />
                          <div className="h-2 w-2/3 bg-white/5 rounded-full" />
                          <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-[#8B5CF6]" />
                          </div>
                        </div>
                        <div className="h-24 rounded-xl bg-white/[0.01] border border-white/[0.05] border-dashed" />
                      </div>
                    </div>
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* Section D: Stats / Trust */}
      <section 
        style={{ 
          padding: '76px 0 78px', 
          background: 'transparent',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden'
        }} 
        className="stats-trust-section relative z-10"
      >
        <motion.div
          aria-hidden="true"
          animate={{ x: ["-8%", "8%", "-8%"], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            left: '10%',
            top: '22%',
            width: '42%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.45), transparent)',
            filter: 'blur(0.2px)'
          }}
        />
        <motion.div
          aria-hidden="true"
          animate={{ x: ["9%", "-9%", "9%"], opacity: [0.15, 0.42, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            right: '8%',
            bottom: '22%',
            width: '34%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.38), transparent)'
          }}
        />

        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 48px', position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="stats-tags-row"
          >
            {statsTags.map((tag, index) => (
              <motion.span
                key={tag}
                className="stats-trust-tag"
                animate={{ y: [0, index % 2 === 0 ? -4 : 4, 0] }}
                transition={{ duration: 3.2 + index * 0.35, repeat: Infinity, ease: "easeInOut" }}
              >
                <Check size={12} />
                {tag}
              </motion.span>
            ))}
          </motion.div>

          <motion.div 
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.12
                }
              }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="stats-grid-clean"
          >
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
                    }
                  }}
                  className="stat-clean-item"
                >
                  <motion.div
                    className="stat-icon-clean"
                    whileHover={{ scale: 1.08, y: -4 }}
                    animate={{
                      boxShadow: [
                        `0 0 0 0 ${stat.glow}`,
                        `0 0 34px 0 ${stat.glow}`,
                        `0 0 0 0 ${stat.glow}`
                      ]
                    }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.25 }}
                  >
                    <Icon size={18} />
                  </motion.div>

                  <div className="stat-number-clean">
                    <StatCounter target={stat.number} suffix={stat.suffix} />
                  </div>

                  <span className="stat-label-clean">
                    {stat.label}
                  </span>

                  <motion.span
                    className="stat-mini-tag"
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.35 + index * 0.08 }}
                  >
                    {stat.tag}
                  </motion.span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Section E: Testimonials */}
      <section id="about" className="relative z-10 py-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto mb-12">
          <div className="text-center">
            <FadeUp>
              <h2 className="text-2xl md:text-4xl font-bold mb-4">User Stories</h2>
              <p className="text-white/40 text-base max-w-2xl mx-auto">
                See what the community is saying about HireNextAI.
              </p>
            </FadeUp>
          </div>
        </div>

        {/* Testimonials Marquee */}
        <div style={{ display: 'flex', width: '100%', overflow: 'hidden', position: 'relative' }}>
          <div className="reviews-track" style={{
            display: 'flex',
            animation: 'reviewScroll 40s linear infinite',
            width: 'max-content'
          }}>
            {[...testimonials, ...testimonials].map((t, i) => (
              <div 
                key={i} 
                className="review-card-custom"
                style={{
                  flexShrink: 0,
                  width: '340px',
                  marginRight: '24px'
                }}
              >
                {/* Top row with stars and tag */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {[...Array(t.stars || 5)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <div className="review-badge-custom">
                    {t.tag}
                  </div>
                </div>

                {/* Quote content */}
                <p className="review-quote-custom">
                  &quot;{t.content}&quot;
                </p>

                {/* Avatar + name row */}
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-[44px] h-[44px] rounded-full border border-white/10" />
                  <div>
                    <div className="text-white text-[14px] font-semibold">{t.name}</div>
                    <div className="text-white/35 text-[12px]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section F: FAQ */}
      <section className="relative z-10 py-20 px-6 bg-white/[0.01]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <FadeUp>
              <h2 className="text-2xl md:text-4xl font-bold mb-3">FAQ</h2>
              <p className="text-white/40 text-base">
                Common questions about HireNextAI.
              </p>
            </FadeUp>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <FadeUp key={i} delay={i * 0.05}>
                  <div className="border border-white/[0.06] rounded-[14px] bg-white/[0.02] overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full text-left flex items-center justify-between transition-colors duration-300"
                      style={{
                        padding: "20px 24px",
                        fontWeight: "600",
                        fontSize: "15px",
                        color: isOpen ? "#A78BFA" : "#FFFFFF",
                        borderBottom: isOpen ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className="w-5 h-5 transition-transform duration-300"
                        style={{
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          color: isOpen ? "#A78BFA" : "rgba(255,255,255,0.4)"
                        }}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div
                            style={{
                              padding: "20px 24px",
                              color: "rgba(255,255,255,0.55)",
                              lineHeight: "1.8",
                              fontSize: "14px"
                            }}
                          >
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section G: Final CTA */}
      <section style={{ padding: '80px 24px', background: 'transparent' }} className="relative z-10">
        <div className="max-w-7xl mx-auto">
          <FadeUp delay={0.4}>
            <div className="cta-card-custom">
              {/* TOP GLOW */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.8) 50%, transparent 100%)'
              }} />

              {/* BACKGROUND RADIAL GLOW */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(139,92,246,0.12), transparent 70%)',
                pointerEvents: 'none'
              }} />
              
              <div className="relative z-10 flex flex-col items-center">
                {/* Badge */}
                <div className="cta-badge-custom">
                  ✦ START FOR FREE
                </div>
                
                {/* Heading */}
                <h2 className="cta-heading-custom">
                  Land your dream job<br />with AI today.
                </h2>
                
                {/* Subtext */}
                <p style={{
                  fontSize: '15px',
                  color: 'rgba(255,255,255,0.45)',
                  maxWidth: '460px',
                  margin: '0 auto 28px',
                  lineHeight: '1.7'
                }}>
                  Join thousands of job seekers who found their dream jobs faster with HirenextAI&apos;s powerful AI tools.
                </p>

                {/* Feature Pills */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '8px',
                  maxWidth: '560px',
                  margin: '20px auto 32px'
                }}>
                  <div className="cta-pill-custom"><span>🔍</span> <span>AI Job Search</span></div>
                  <div className="cta-pill-custom"><span>📊</span> <span>Smart Matching</span></div>
                  <div className="cta-pill-custom"><span>⚡</span> <span>Auto Apply</span></div>
                  <div className="cta-pill-custom"><span>🎤</span> <span>Mock Interview</span></div>
                  <div className="cta-pill-custom"><span>📋</span> <span>Job Tracker</span></div>
                  <div className="cta-pill-custom"><span>💬</span> <span>AI Chat</span></div>
                </div>
                
                {/* Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <Link to="/register" className="cta-btn-primary-custom">
                    Create Free Account <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => setDemoRoleModalOpen(true)} 
                    className="cta-btn-secondary-custom"
                  >
                    Try Demo First
                  </button>
                </div>
                
                {/* Bottom checkmarks */}
                <div style={{
                  marginTop: '20px',
                  display: 'flex',
                  gap: '24px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                    <span style={{ color: 'rgba(139,92,246,0.6)' }}>✓</span> <span>No Credit Card</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                    <span style={{ color: 'rgba(139,92,246,0.6)' }}>✓</span> <span>Setup in 2 min</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                    <span style={{ color: 'rgba(139,92,246,0.6)' }}>✓</span> <span>AI-Powered</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                    <span style={{ color: 'rgba(139,92,246,0.6)' }}>✓</span> <span>Cancel Anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <Footer />

      <DemoRoleModal
        open={demoRoleModalOpen}
        onClose={() => setDemoRoleModalOpen(false)}
        onSelect={handleDemoRole}
        loading={demoLoading}
      />

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: '#8B5CF6',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
          cursor: 'pointer',
          opacity: showScrollTop ? 1 : 0,
          transform: showScrollTop ? 'scale(1)' : 'scale(0.8)',
          pointerEvents: showScrollTop ? 'auto' : 'none',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
        className="hover:bg-[#7c4dff] hover:scale-110 active:scale-95"
        aria-label="Scroll to top"
      >
        <ChevronDown size={24} style={{ transform: 'rotate(180deg)' }} />
      </button>

      <style>{`
        .animate-blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
        .animate-gradient-x { animation: gradientShift 6s ease infinite; }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes circlePulse {
          0% { box-shadow: 0 0 0 0 rgba(139,92,246,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(139,92,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); }
        }
        .animate-circle-pulse {
          animation: circlePulse 2s infinite;
        }

        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        
        @keyframes cursorBlink {
          0%, 100% { opacity: 1 }
          50% { opacity: 0 }
        }
        
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        .marquee-item:hover {
          color: #ffffff !important;
        }

        .stat-card-custom {
          position: relative;
          background: rgba(10,10,25,0.9);
          border: 1px solid rgba(139,92,246,0.15);
          border-radius: 20px;
          padding: 28px 20px;
          text-align: center;
          width: 100%;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .stat-card-custom:hover {
          border-color: rgba(139,92,246,0.35);
          background: rgba(139,92,246,0.06);
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(139,92,246,0.1);
        }
        .stat-accent-line-custom {
          position: absolute;
          top: 0;
          left: 25%;
          right: 25%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent);
          transition: all 0.3s ease;
        }
        .stat-card-custom:hover .stat-accent-line-custom {
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.8), transparent);
        }
        .stat-number-custom {
          font-family: 'Syne', sans-serif;
          font-size: 38px;
          font-weight: 800;
          color: white;
          line-height: 1.1;
          letter-spacing: -1px;
        }
        .stat-label-custom {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-top: 8px;
          line-height: 1.4;
        }

        .stats-trust-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 50% 0%, rgba(139,92,246,0.08), transparent 42%),
            linear-gradient(180deg, rgba(255,255,255,0.015), transparent 45%, rgba(255,255,255,0.012));
          pointer-events: none;
        }

        .stats-tags-row {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 34px;
        }

        .stats-trust-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 30px;
          padding: 0 13px;
          border-radius: 999px;
          border: 1px solid rgba(139,92,246,0.22);
          background: rgba(139,92,246,0.07);
          color: rgba(255,255,255,0.68);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0;
          white-space: nowrap;
          box-shadow: 0 10px 36px rgba(0,0,0,0.24);
          backdrop-filter: blur(12px);
        }

        .stats-trust-tag svg {
          color: #a78bfa;
        }

        .stats-grid-clean {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0;
        }

        .stat-clean-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 170px;
          padding: 4px 28px 0;
          text-align: center;
        }

        .stat-clean-item:not(:last-child)::after {
          content: "";
          position: absolute;
          right: 0;
          top: 22px;
          bottom: 14px;
          width: 1px;
          background: linear-gradient(180deg, transparent, rgba(255,255,255,0.075), transparent);
        }

        .stat-icon-clean {
          width: 46px;
          height: 46px;
          border-radius: 999px;
          border: 1px solid rgba(139,92,246,0.32);
          background:
            radial-gradient(circle at 50% 35%, rgba(139,92,246,0.22), rgba(139,92,246,0.08) 58%, rgba(139,92,246,0.04));
          color: #8b5cf6;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 34px;
          cursor: pointer;
        }

        .stat-number-clean {
          font-family: 'Syne', 'Outfit', sans-serif;
          font-size: 50px;
          font-weight: 800;
          line-height: 0.95;
          letter-spacing: 0;
          color: #fff;
          margin-bottom: 13px;
          text-shadow: 0 16px 40px rgba(255,255,255,0.06);
        }

        .stat-label-clean {
          color: rgba(255,255,255,0.34);
          font-size: 11px;
          font-weight: 600;
          line-height: 1.35;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .stat-mini-tag {
          margin-top: 14px;
          color: rgba(167,139,250,0.72);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0;
        }

        @media (max-width: 900px) {
          .stats-grid-clean {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            row-gap: 42px;
          }

          .stat-clean-item:nth-child(2)::after,
          .stat-clean-item:nth-child(4)::after {
            display: none;
          }

          .stat-number-clean {
            font-size: 46px;
          }
        }

        @media (max-width: 560px) {
          .stats-trust-section {
            padding-top: 58px !important;
            padding-bottom: 60px !important;
          }

          .stats-grid-clean {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            row-gap: 36px;
          }

          .stat-clean-item {
            min-height: 148px;
            padding: 0 12px;
          }

          .stat-clean-item::after {
            display: none;
          }

          .stat-icon-clean {
            margin-bottom: 24px;
          }

          .stat-number-clean {
            font-size: 40px;
          }
        }

        @media (max-width: 340px) {
          .stats-grid-clean {
            grid-template-columns: 1fr;
          }
        }

        @keyframes reviewScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .reviews-track {
          display: flex;
          width: max-content;
        }
        .reviews-track:hover {
          animation-play-state: paused;
        }
        
        .review-card-custom {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 28px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .review-card-custom:hover {
          border-color: rgba(139,92,246,0.3);
          background: rgba(139,92,246,0.04);
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.3);
        }
        .review-badge-custom {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.2);
          color: #86efac;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 99px;
        }
        .review-quote-custom {
          font-size: 14px;
          line-height: 1.8;
          color: rgba(255,255,255,0.65);
          font-style: italic;
          margin: 16px 0;
        }
        
        .cta-card-custom {
          max-width: 860px;
          margin: 0 auto;
          background: linear-gradient(135deg,
            rgba(139,92,246,0.15) 0%,
            rgba(99,102,241,0.1) 40%,
            rgba(15,15,30,0.95) 100%);
          border: 1px solid rgba(139,92,246,0.25);
          border-radius: 28px;
          padding: 48px 60px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cta-badge-custom {
          background: rgba(139,92,246,0.12);
          border: 1px solid rgba(139,92,246,0.3);
          color: #C4B5FD;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          padding: 6px 16px;
          border-radius: 99px;
          display: inline-block;
          margin-bottom: 24px;
        }
        .cta-heading-custom {
          font-family: Syne, sans-serif;
          font-size: clamp(32px, 4vw, 44px);
          font-weight: 800;
          color: white;
          line-height: 1.15;
          letter-spacing: -1px;
          margin-bottom: 16px;
        }
        
        .cta-pill-custom {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 99px;
          padding: 8px 16px;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .cta-pill-custom:hover {
          background: rgba(139,92,246,0.15);
          border-color: rgba(139,92,246,0.4);
          color: #C4B5FD;
        }

        .cta-btn-primary-custom {
          background: #7C3AED;
          color: white;
          padding: 13px 32px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .cta-btn-primary-custom:hover {
          background: #6D28D9;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(124,58,237,0.4);
        }
        .cta-btn-secondary-custom {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 13px 32px;
          border-radius: 12px;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .cta-btn-secondary-custom:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  );
}
