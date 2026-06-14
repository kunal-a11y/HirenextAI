import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import {
  ArrowRight,
  Award,
  BrainCircuit,
  CheckCircle,
  Clock,
  FileText,
  Globe,
  Heart,
  MapPin,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
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

function useCountUp(target, shouldRun, { duration = 1200, decimals = 0 } = {}) {
  const [count, setCount] = React.useState(0);

  useEffect(() => {
    if (!shouldRun) return undefined;

    let frameId;
    let startTime;

    const tick = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Number((target * eased).toFixed(decimals)));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setCount(target);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [decimals, duration, shouldRun, target]);

  return count;
}

function StatCard({ stat }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useCountUp(stat.countTarget || 0, Boolean(stat.countTarget) && isInView, {
    decimals: stat.decimals || 0,
  });
  const Icon = stat.icon;

  return (
    <motion.div
      ref={ref}
      key={`${stat.value}-${stat.label}`}
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass-card hover-glow p-6 text-center"
    >
      <div className="mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10">
        <Icon className="h-4 w-4 text-[#8B5CF6]" />
      </div>
      <p className="mb-2 text-3xl font-extrabold text-white">
        {stat.countTarget ? stat.format(count) : stat.value}
      </p>
      <p className="text-xs font-medium uppercase tracking-wide text-white/40">{stat.label}</p>
    </motion.div>
  );
}

const featureTags = [
  { label: "AI Resume Optimizer", icon: FileText },
  { label: "Cover Letter Generator", icon: Zap },
  { label: "Job Application Tracker", icon: Target },
  { label: "Interview Prep Tools", icon: Clock },
  { label: "Salary Insights", icon: TrendingUp },
  { label: "ATS Score Checker", icon: CheckCircle },
];

const stats = [
  { value: "50K+", label: "Job Seekers Helped", icon: Users, countTarget: 50, format: (value) => `${Math.round(value)}K+` },
  { value: "4.9★", label: "Average Rating", icon: Star, countTarget: 4.9, decimals: 1, format: (value) => `${Number(value).toFixed(1)}★` },
  { value: "2024", label: "Founded", icon: Rocket },
  { value: "Global", label: "Worldwide Access", icon: Globe },
];

const missionTags = ["No Career Coach Needed", "Works in 40+ Countries", "Free to Start", "AI-Powered"];

const values = [
  {
    icon: BrainCircuit,
    title: "AI-First Approach",
    desc: "Every feature starts with: how does this help a real job seeker? AI amplifies human potential — it never replaces it.",
    color: "text-indigo-400",
    iconWrap: "bg-indigo-500/10 border-indigo-500/20",
    tag: "Core",
  },
  {
    icon: Globe,
    title: "Built for Everyone",
    desc: "From fresh graduates to senior professionals, across every country and industry — HirenextAI works for any job seeker, anywhere.",
    color: "text-purple-400",
    iconWrap: "bg-purple-500/10 border-purple-500/20",
    tag: "Global",
  },
  {
    icon: Users,
    title: "Community Driven",
    desc: "Over 50,000 job seekers give us feedback daily. Features are shipped weekly based on real user needs.",
    color: "text-emerald-400",
    iconWrap: "bg-emerald-500/10 border-emerald-500/20",
    tag: "50K+",
  },
  {
    icon: Shield,
    title: "Privacy First",
    desc: "We never sell your data. All information is encrypted at rest and in transit. Your career data belongs to you.",
    color: "text-blue-400",
    iconWrap: "bg-blue-500/10 border-blue-500/20",
    tag: "Secure",
  },
  {
    icon: Zap,
    title: "Speed & Simplicity",
    desc: "Apply smarter in seconds. Generate a cover letter, optimize your resume, and track applications — all in one place.",
    color: "text-amber-400",
    iconWrap: "bg-amber-500/10 border-amber-500/20",
    tag: "Fast",
  },
  {
    icon: Heart,
    title: "Built with Love",
    desc: "HirenextAI was built by someone who faced the same job search struggles. Every line of code has empathy behind it.",
    color: "text-pink-400",
    iconWrap: "bg-pink-500/10 border-pink-500/20",
    tag: "Human",
  },
];

const timeline = [
  {
    year: "Early 2024",
    title: "The Idea",
    desc: "Kunal noticed talented people failing job hunts not from lack of skill — but lack of tools. The idea for HirenextAI was born.",
    icon: Sparkles,
  },
  {
    year: "Mid 2024",
    title: "First Build",
    desc: "First version shipped: AI resume optimizer + cover letter generator. First 1,000 users in 30 days.",
    icon: Rocket,
  },
  {
    year: "Late 2024",
    title: "Growing Fast",
    desc: "10,000 users. Added job tracking, interview prep, and salary insights. Community feedback shaped every feature.",
    icon: TrendingUp,
  },
  {
    year: "2025",
    title: "Going Global",
    desc: "Expanded beyond India. Job seekers from 40+ countries joined. Platform now supports global job boards.",
    icon: Globe,
  },
  {
    year: "Today",
    title: "50K+ Strong",
    desc: "50,000+ job seekers helped worldwide. New features shipping every week, driven entirely by community needs.",
    icon: Award,
  },
];

const founderSkills = ["React", "Node.js", "AI/ML", "Full Stack"];
const ctaTrustTags = ["Free to start", "No credit card", "Cancel anytime"];

export default function About() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-white">
      <Navbar />

      <main className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[12%] top-24 h-[420px] w-[420px] rounded-full bg-indigo-500/5 blur-[120px]" />
          <div className="absolute right-[-8%] top-[36rem] h-[520px] w-[520px] rounded-full bg-purple-600/5 blur-[140px]" />
        </div>

        <FadeUp className="relative z-10 mx-auto max-w-5xl px-6 pb-16 pt-40 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75"
          >
            <Sparkles className="h-4 w-4 text-[#8B5CF6]" />
            Our Story
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 text-4xl font-extrabold leading-tight md:text-6xl"
          >
            About <span className="text-gradient">HirenextAI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-3xl text-base leading-relaxed text-white/60 md:text-lg"
          >
            Founded in 2024 by Kunal Purohit — a developer who was tired of watching talented people fail at job hunting not because they lacked skill, but because they lacked the right tools. HirenextAI was built to fix that — for everyone, everywhere.
          </motion.p>

          <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-3">
            {featureTags.map((tag) => {
              const Icon = tag.icon;

              return (
                <motion.div
                  key={tag.label}
                  whileHover={{ scale: 1.06, y: -2 }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/60"
                >
                  <Icon className="h-3.5 w-3.5 text-[#8B5CF6]" />
                  {tag.label}
                </motion.div>
              );
            })}
          </div>
        </FadeUp>

        <FadeUp className="relative z-10 mx-auto max-w-5xl px-6 py-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={`${stat.value}-${stat.label}`} stat={stat} />
            ))}
          </div>
        </FadeUp>

        <FadeUp className="relative z-10 mx-auto max-w-5xl px-6 py-16">
          <div className="glass-card relative overflow-hidden p-8 md:p-12">
            <div className="pointer-events-none absolute left-[-4rem] top-[-4rem] h-64 w-64 rounded-full bg-[#8B5CF6]/20 blur-[90px]" />
            <div className="relative z-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3 py-1 text-xs font-bold text-[#C4B5FD]">
                <Target className="h-3.5 w-3.5" />
                Our Mission
              </div>
              <h2 className="mb-5 max-w-3xl text-3xl font-bold leading-tight md:text-4xl">
                Democratise Career Success for
                <br />
                <span className="text-gradient">Every Job Seeker</span>
              </h2>
              <p className="max-w-3xl text-base leading-relaxed text-white/65">
                Whether you're a fresh graduate in Mumbai, a career switcher in London, or an experienced developer in New York — you deserve the same shot at landing your dream job. HirenextAI levels the playing field with AI tools that were previously only available to people who could afford expensive career coaches.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {missionTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50"
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>

        <section className="relative z-10 mx-auto max-w-6xl px-6 py-12">
          <FadeUp className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
              <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" />
              Our Values
            </div>
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">What We Stand For</h2>
            <p className="text-white/50">The principles that guide everything we build.</p>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                <FadeUp key={value.title} delay={index * 0.07}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="glass-card hover-glow h-full p-7"
                  >
                    <span className="absolute right-5 top-5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/30">
                      {value.tag}
                    </span>
                    <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl border ${value.iconWrap}`}>
                      <Icon className={`h-6 w-6 ${value.color}`} />
                    </div>
                    <h3 className="mb-3 text-lg font-bold text-white">{value.title}</h3>
                    <p className="text-sm leading-relaxed text-white/55">{value.desc}</p>
                  </motion.div>
                </FadeUp>
              );
            })}
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-5xl px-6 py-16">
          <FadeUp className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
              <Clock className="h-3.5 w-3.5 text-[#8B5CF6]" />
              Our Journey
            </div>
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">How We Got Here</h2>
            <p className="text-white/50">From a single idea to 50,000+ job seekers worldwide.</p>
          </FadeUp>

          <div className="relative ml-4 space-y-6 border-l border-transparent pl-8">
            <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-[#8B5CF6]/60 via-[#8B5CF6]/20 to-transparent" />
            {timeline.map((item, index) => {
              const Icon = item.icon;

              return (
                <FadeUp key={item.title} delay={index * 0.1}>
                  <div className="relative">
                    <div className="absolute -left-[51px] top-6 flex h-9 w-9 items-center justify-center rounded-full border border-[#8B5CF6]/20 bg-[#0b0b12]">
                      <Icon className="h-4 w-4 text-[#8B5CF6]" />
                    </div>
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      className="glass-card hover-glow p-6"
                    >
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3 py-1 text-xs font-bold text-[#8B5CF6]">
                          {item.year}
                        </span>
                        <h3 className="text-lg font-bold text-white">{item.title}</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-white/55">{item.desc}</p>
                    </motion.div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </section>

        <FadeUp className="relative z-10 mx-auto max-w-5xl px-6 py-16">
          <div className="glass-card hover-glow overflow-hidden p-8 md:p-12">
            <div className="grid items-center gap-10 md:grid-cols-[220px_1fr]">
              <div className="flex justify-center">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[3px] shadow-[0_0_42px_rgba(139,92,246,0.35)]">
                    <div className="h-32 w-32 overflow-hidden rounded-full border border-white/10 bg-[#0b0b12]">
                      <img src="/founder.jpg" alt="Kunal Purohit" className="h-full w-full object-cover object-top" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 h-5 w-5 rounded-full border-[3px] border-[#0b0b12] bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.7)]" />
                </motion.div>
              </div>

              <div className="text-center md:text-left">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3 py-1 text-xs font-bold text-[#C4B5FD]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Founder & Developer
                </div>
                <h2 className="mb-2 text-3xl font-extrabold text-white">Kunal Purohit</h2>
                <p className="mb-5 flex items-center justify-center gap-2 text-sm text-white/45 md:justify-start">
                  <MapPin className="h-4 w-4 text-[#8B5CF6]" />
                  Greater Noida, India
                </p>
                <div className="mb-5 flex flex-wrap justify-center gap-2 md:justify-start">
                  {founderSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] text-white/40"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">
                  Built HirenextAI with the vision to make job searching smarter and faster for job seekers worldwide. By combining real job data with AI-powered career tools, the platform aims to simplify career growth and reduce job search stress — no matter where you are.
                </p>
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp className="relative z-10 mx-auto max-w-4xl px-6 py-16 text-center">
          <div className="glass-card overflow-hidden p-8 md:p-12">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10"
            >
              <Rocket className="h-6 w-6 text-[#8B5CF6]" />
            </motion.div>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Land Your Dream Job?</h2>
            <p className="mb-8 text-white/55">
              Join 50,000+ job seekers worldwide already using HirenextAI.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/register" className="btn-primary px-8 py-3">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/features" className="btn-secondary px-8 py-3">
                See Features
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {ctaTrustTags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 text-xs text-white/35">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400/60" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </FadeUp>
      </main>

      <Footer />
    </div>
  );
}
