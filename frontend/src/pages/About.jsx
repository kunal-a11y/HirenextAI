import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import anime from "animejs/lib/anime.es.js";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import {
  ArrowRight, Award, BrainCircuit, CheckCircle, Clock, FileText, Globe,
  Heart, MapPin, Rocket, Shield, Sparkles, Star, Target, TrendingUp, Users, Zap,
} from "lucide-react";

function useCountUp(target, shouldRun, { duration = 2000, decimals = 0 } = {}) {
  const [count, setCount] = React.useState(0);
  useEffect(() => {
    if (!shouldRun) return;
    const obj = { value: 0 };
    anime({
      targets: obj, value: target, duration, easing: 'easeOutExpo',
      update: () => setCount(Number(obj.value.toFixed(decimals))),
    });
  }, [decimals, duration, shouldRun, target]);
  return count;
}

function StatCard({ stat }) {
  const ref = useRef(null);
  const [inView, setInView] = React.useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setInView(true); }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const count = useCountUp(stat.countTarget || 0, Boolean(stat.countTarget) && inView, { decimals: stat.decimals || 0 });
  const Icon = stat.icon;
  return (
    <div ref={ref} className="about-stagger glass-card hover-glow p-6 text-center"
      onMouseEnter={(e) => anime({ targets: e.currentTarget, translateY: -4, duration: 250, easing: 'easeOutQuad' })}
      onMouseLeave={(e) => anime({ targets: e.currentTarget, translateY: 0, duration: 250, easing: 'easeOutQuad' })}>
      <div className="mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-[#E0E0E0] bg-[#F7F7F7]">
        <Icon className="h-4 w-4 text-[#444444]" />
      </div>
      <p className="mb-2 text-3xl font-extrabold text-black">
        {stat.countTarget ? stat.format(count) : stat.value}
      </p>
      <p className="text-xs font-medium uppercase tracking-wide text-black">{stat.label}</p>
    </div>
  );
}

const featureTags = [
  { label: "AI Resume Optimizer", icon: FileText }, { label: "Cover Letter Generator", icon: Zap },
  { label: "Job Application Tracker", icon: Target }, { label: "Interview Prep Tools", icon: Clock },
  { label: "Salary Insights", icon: TrendingUp }, { label: "ATS Score Checker", icon: CheckCircle },
];

const stats = [
  { value: "50K+", label: "Job Seekers Helped", icon: Users, countTarget: 50, format: (v) => `${Math.round(v)}K+` },
  { value: "4.9★", label: "Average Rating", icon: Star, countTarget: 4.9, decimals: 1, format: (v) => `${Number(v).toFixed(1)}★` },
  { value: "2024", label: "Founded", icon: Rocket },
  { value: "Global", label: "Worldwide Access", icon: Globe },
];

const missionTags = ["No Career Coach Needed", "Works in 40+ Countries", "Free to Start", "AI-Powered"];

const values = [
  { icon: BrainCircuit, title: "AI-First Approach", desc: "Every feature starts with: how does this help a real job seeker? AI amplifies human potential — it never replaces it.", tag: "Core" },
  { icon: Globe, title: "Built for Everyone", desc: "From fresh graduates to senior professionals, across every country and industry — HirenextAI works for any job seeker, anywhere.", tag: "Global" },
  { icon: Users, title: "Community Driven", desc: "Over 50,000 job seekers give us feedback daily. Features are shipped weekly based on real user needs.", tag: "50K+" },
  { icon: Shield, title: "Privacy First", desc: "We never sell your data. All information is encrypted at rest and in transit. Your career data belongs to you.", tag: "Secure" },
  { icon: Zap, title: "Speed & Simplicity", desc: "Apply smarter in seconds. Generate a cover letter, optimize your resume, and track applications — all in one place.", tag: "Fast" },
  { icon: Heart, title: "Built with Love", desc: "HirenextAI was built by someone who faced the same job search struggles. Every line of code has empathy behind it.", tag: "Human" },
];

const timeline = [
  { year: "Early 2024", title: "The Idea", desc: "Kunal noticed talented people failing job hunts not from lack of skill — but lack of tools. The idea for HirenextAI was born.", icon: Sparkles },
  { year: "Mid 2024", title: "First Build", desc: "First version shipped: AI resume optimizer + cover letter generator. First 1,000 users in 30 days.", icon: Rocket },
  { year: "Late 2024", title: "Growing Fast", desc: "10,000 users. Added job tracking, interview prep, and salary insights.", icon: TrendingUp },
  { year: "2025", title: "Going Global", desc: "Expanded beyond India. Job seekers from 40+ countries joined.", icon: Globe },
  { year: "Today", title: "50K+ Strong", desc: "50,000+ job seekers helped worldwide. New features shipping every week.", icon: Award },
];

const founderSkills = ["React", "Node.js", "AI/ML", "Full Stack"];
const ctaTrustTags = ["Free to start", "No credit card", "Cancel anytime"];

export default function About() {
  useEffect(() => {
    anime({
      targets: '.about-animate',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 600,
      easing: 'easeOutExpo',
      delay: anime.stagger(80, { start: 100 })
    });
    anime({
      targets: '.about-stagger',
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.97, 1],
      duration: 500,
      easing: 'easeOutBack',
      delay: anime.stagger(80, { start: 300 })
    });
    // Heading word-by-word animation
    anime({
      targets: '.about-word',
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 500,
      easing: 'easeOutExpo',
      delay: anime.stagger(60, { start: 200 })
    });
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-black">
      <Navbar />

      <main className="relative">
        {/* Subtle background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[12%] top-24 h-[420px] w-[420px] rounded-full bg-[#F7F7F7] blur-[120px]" />
        </div>

        {/* Hero */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 pb-16 pt-40 text-center">
          <div className="about-animate mb-6 inline-flex items-center gap-2 rounded-full border border-[#E0E0E0] bg-[#F7F7F7] px-4 py-2 text-sm font-semibold text-black">
            <Sparkles className="h-4 w-4 text-[#666666]" /> Our Story
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight md:text-6xl">
            <span className="about-word inline-block">Built</span>{' '}
            <span className="about-word inline-block">for</span>{' '}
            <span className="about-word inline-block">Indian</span>{' '}
            <span className="about-word inline-block">students</span>{' '}
            <br />
            <span className="about-word inline-block">and</span>{' '}
            <span className="about-word inline-block text-gradient">freshers</span>
          </h1>

          <p className="about-animate mx-auto max-w-3xl text-base leading-relaxed text-black md:text-lg">
            Founded in 2024 by Kunal Purohit — a developer who was tired of watching talented people fail at job hunting not because they lacked skill, but because they lacked the right tools.
          </p>

          <div className="about-animate mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-3">
            {featureTags.map((tag) => {
              const Icon = tag.icon;
              return (
                <div key={tag.label} className="inline-flex items-center gap-2 rounded-full border border-[#E0E0E0] bg-[#F7F7F7] px-4 py-2 text-xs font-medium text-black transition-all hover:border-[#E0E0E0]"
                  onMouseEnter={(e) => anime({ targets: e.currentTarget, scale: 1.05, duration: 200, easing: 'easeOutQuad' })}
                  onMouseLeave={(e) => anime({ targets: e.currentTarget, scale: 1, duration: 200, easing: 'easeOutQuad' })}>
                  <Icon className="h-3.5 w-3.5 text-[#666666]" />
                  {tag.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 py-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => <StatCard key={stat.label} stat={stat} />)}
          </div>
        </div>

        {/* Mission */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 py-16">
          <div className="about-stagger glass-card relative overflow-hidden p-8 md:p-12">
            <div className="relative z-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E0E0E0] bg-[#F7F7F7] px-3 py-1 text-xs font-bold text-[#555555]">
                <Target className="h-3.5 w-3.5" /> Our Mission
              </div>
              <h2 className="mb-5 max-w-3xl text-3xl font-bold leading-tight md:text-4xl">
                Democratise Career Success for<br />
                <span className="text-gradient">Every Job Seeker</span>
              </h2>
              <p className="max-w-3xl text-base leading-relaxed text-black">
                Whether you're a fresh graduate in Mumbai, a career switcher in London, or an experienced developer in New York — you deserve the same shot at landing your dream job.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {missionTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-2 rounded-full border border-[#E0E0E0] bg-[#F7F7F7] px-3 py-1.5 text-xs text-black">
                    <CheckCircle className="h-3.5 w-3.5 text-black" /> {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <section className="relative z-10 mx-auto max-w-6xl px-6 py-12">
          <div className="about-animate mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E0E0E0] bg-[#F7F7F7] px-3 py-1 text-xs text-black">
              <Sparkles className="h-3.5 w-3.5 text-[#666666]" /> Our Values
            </div>
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">What We Stand For</h2>
            <p className="text-black">The principles that guide everything we build.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="about-stagger glass-card hover-glow h-full p-7 relative"
                  onMouseEnter={(e) => {
                    anime({ targets: e.currentTarget, translateY: -4, duration: 250, easing: 'easeOutQuad' });
                    anime({ targets: e.currentTarget.querySelector('.value-icon'), scale: [1, 1.2, 1], duration: 400, easing: 'easeOutElastic(1, .5)' });
                  }}
                  onMouseLeave={(e) => anime({ targets: e.currentTarget, translateY: 0, duration: 250, easing: 'easeOutQuad' })}>
                  <span className="absolute right-5 top-5 rounded-full border border-[#E0E0E0] bg-[#F7F7F7] px-2.5 py-1 text-[10px] text-black">{value.tag}</span>
                  <div className="value-icon mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#E0E0E0] bg-[#F7F7F7]">
                    <Icon className="h-6 w-6 text-[#444444]" />
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-black">{value.title}</h3>
                  <p className="text-sm leading-relaxed text-black">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Timeline */}
        <section className="relative z-10 mx-auto max-w-5xl px-6 py-16">
          <div className="about-animate mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E0E0E0] bg-[#F7F7F7] px-3 py-1 text-xs text-black">
              <Clock className="h-3.5 w-3.5 text-[#666666]" /> Our Journey
            </div>
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">How We Got Here</h2>
            <p className="text-black">From a single idea to 50,000+ job seekers worldwide.</p>
          </div>

          <div className="relative ml-4 space-y-6 border-l border-[#E0E0E0] pl-8">
            {timeline.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="about-stagger relative">
                  <div className="absolute -left-[51px] top-6 flex h-9 w-9 items-center justify-center rounded-full border border-[#E0E0E0] bg-white">
                    <Icon className="h-4 w-4 text-[#555555]" />
                  </div>
                  <div className="glass-card hover-glow p-6 transition-all"
                    onMouseEnter={(e) => anime({ targets: e.currentTarget, translateX: 4, duration: 200, easing: 'easeOutQuad' })}
                    onMouseLeave={(e) => anime({ targets: e.currentTarget, translateX: 0, duration: 200, easing: 'easeOutQuad' })}>
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-[#E0E0E0] bg-[#F7F7F7] px-3 py-1 text-xs font-bold text-[#555555]">{item.year}</span>
                      <h3 className="text-lg font-bold text-black">{item.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-black">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Founder */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 py-16">
          <div className="about-stagger glass-card hover-glow overflow-hidden p-8 md:p-12">
            <div className="grid items-center gap-10 md:grid-cols-[220px_1fr]">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="rounded-full bg-gradient-to-br from-white/20 via-white/10 to-transparent p-[3px] shadow-[0_0_42px_rgba(255,255,255,0.05)]">
                    <div className="h-32 w-32 overflow-hidden rounded-full border border-[#E0E0E0] bg-[#F7F7F7]">
                      <img src="/founder.jpg" alt="Kunal Purohit" className="h-full w-full object-cover object-top" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 h-5 w-5 rounded-full border-[3px] border-black bg-[#F7F7F7] shadow-[0_0_18px_rgba(255,255,255,0.5)]" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E0E0E0] bg-[#F7F7F7] px-3 py-1 text-xs font-bold text-[#555555]">
                  <Sparkles className="h-3.5 w-3.5" /> Founder & Developer
                </div>
                <h2 className="mb-2 text-3xl font-extrabold text-black">Kunal Purohit</h2>
                <p className="mb-5 flex items-center justify-center gap-2 text-sm text-black md:justify-start">
                  <MapPin className="h-4 w-4 text-[#777777]" /> Greater Noida, India
                </p>
                <div className="mb-5 flex flex-wrap justify-center gap-2 md:justify-start">
                  {founderSkills.map((skill) => (
                    <span key={skill} className="rounded-full border border-[#E0E0E0] bg-[#F7F7F7] px-2.5 py-0.5 text-[10px] text-black">{skill}</span>
                  ))}
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-black md:text-base">
                  Built HirenextAI with the vision to make job searching smarter and faster for job seekers worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 text-center">
          <div className="about-stagger glass-card overflow-hidden p-8 md:p-12">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#E0E0E0] bg-[#F7F7F7]">
              <Rocket className="h-6 w-6 text-[#444444]" />
            </div>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Land Your Dream Job?</h2>
            <p className="mb-8 text-black">Join 50,000+ job seekers worldwide already using HirenextAI.</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/register" className="btn-primary px-8 py-3">Get Started Free <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/features" className="btn-secondary px-8 py-3">See Features</Link>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {ctaTrustTags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 text-xs text-black">
                  <CheckCircle className="h-3.5 w-3.5 text-[#555555]" /> {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
