import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Puzzle, Zap, Shield, Globe, ArrowRight, Download, Search, FileText, Database, Star, Chrome, AlertTriangle, X, CheckCircle } from 'lucide-react';
import anime from 'animejs/lib/anime.es.js';
import { cardHover, cardLeave, btnPress, staggerIn, modalOpen } from '../lib/animations';

// Extension detection
const EXTENSION_ID = 'YOUR_EXTENSION_ID_HERE'; // Replace with actual extension ID

const checkExtensionInstalled = () => {
  // Method 1: Check for DOM element injected by extension
  const extElement = document.getElementById('hirenextai-extension-installed');
  if (extElement) return true;

  // Method 2: Try to communicate with extension via chrome.runtime
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    try {
      chrome.runtime.sendMessage(
        EXTENSION_ID,
        { type: 'ping' },
        (response) => {
          if (chrome.runtime.lastError) return false;
          return response?.status === 'ok';
        }
      );
    } catch (e) {
      return false;
    }
  }
  return false;
};

export default function Extension() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGateModal, setShowGateModal] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(true); // Set false when extension is published
  const pageRef = useRef(null);

  useEffect(() => {
    setIsInstalled(checkExtensionInstalled());
    // Entrance animations
    anime({
      targets: '.ext-animate',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 600,
      easing: 'easeOutExpo',
      delay: anime.stagger(80),
    });
    staggerIn('.ext-feature-card', 100);
  }, []);

  const handleDownloadClick = (e) => {
    btnPress(e.currentTarget);
    if (showComingSoon) {
      e.preventDefault();
      return;
    }
    // If published, link to Chrome Web Store
    window.open(`https://chrome.google.com/webstore/detail/${EXTENSION_ID}`, '_blank');
  };

  const handleFeatureAction = (action) => {
    if (!isInstalled) {
      setShowGateModal(true);
      setTimeout(() => modalOpen('.ext-gate-modal'), 50);
    }
  };

  const handleScrollToDemo = (e) => {
    e.preventDefault();
    btnPress(e.currentTarget);
    const element = document.getElementById('how-it-works');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    { icon: <FileText size={22} />, title: 'Smart Form Filling', desc: 'AI reads your profile and fills every application field accurately' },
    { icon: <Shield size={22} />, title: 'You Stay in Control', desc: 'Always shows preview before submitting. Never auto-submits.' },
    { icon: <Globe size={22} />, title: 'Works Everywhere', desc: 'LinkedIn, Indeed, Naukri, Glassdoor, AngelList and 100+ more' },
    { icon: <Zap size={22} />, title: 'Lightning Fast', desc: 'What takes 30 minutes takes 30 seconds with AI' },
    { icon: <Database size={22} />, title: 'Saves to Tracker', desc: 'Every application auto-saved to your HirenextAI dashboard' },
    { icon: <Star size={22} />, title: 'Personalized', desc: 'AI tailors each application to the specific job description' },
  ];

  const steps = [
    { icon: <Download size={22} />, step: 'Step 1', title: 'Install in 30 Seconds', desc: 'Add HirenextAI to Chrome from the Web Store. One click, no signup needed.' },
    { icon: <Search size={22} />, step: 'Step 2', title: 'Find a Job You Like', desc: 'Browse LinkedIn, Indeed, Naukri, or any job board. Find a role that excites you.' },
    { icon: <Zap size={22} />, step: 'Step 3', title: 'Click Apply with AI', desc: 'Hit the HirenextAI button. AI fills every field using your profile. You review and submit.' },
  ];

  const stats = [
    { stat: '100+', label: 'Job sites supported' },
    { stat: '30 sec', label: 'Average apply time' },
    { stat: '10x', label: 'Faster than manual' },
    { stat: 'Free', label: 'Always free to install' },
  ];

  return (
    <div ref={pageRef} className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[15%] h-[500px] w-[500px] rounded-full bg-white/[0.02] blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-white/[0.015] blur-[100px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 max-w-5xl mx-auto text-center relative z-10">
        <div className="ext-animate inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#1F1F1F] bg-[#111111] text-white/60 text-xs font-semibold uppercase tracking-wider mb-8">
          <Puzzle size={14} className="text-white" />
          Chrome Extension
          {isInstalled && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] ml-2">
              <CheckCircle size={10} /> Installed
            </span>
          )}
        </div>

        <h1 className="ext-animate text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6 text-white">
          Apply to Any Job in{' '}
          <span className="text-white/60">One Click</span>
        </h1>

        <p className="ext-animate text-[#999999] text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
          HirenextAI extension auto-fills job applications on LinkedIn, Indeed, Naukri, Glassdoor and 100+ job sites. Install once, apply smarter everywhere.
        </p>

        <div className="ext-animate flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <button
            onClick={handleDownloadClick}
            onMouseDown={(e) => btnPress(e.currentTarget)}
            disabled={showComingSoon}
            className={`w-full sm:w-auto px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              showComingSoon
                ? 'bg-[#1F1F1F] text-[#555555] cursor-default border border-[#2A2A2A]'
                : 'bg-white text-black hover:bg-white/90 shadow-[0_0_24px_rgba(255,255,255,0.1)]'
            }`}
          >
            {showComingSoon ? (
              <>
                <Chrome size={16} />
                Coming Soon
              </>
            ) : (
              <>
                Add to Chrome — Free
                <ArrowRight size={16} />
              </>
            )}
          </button>
          <button
            onClick={handleScrollToDemo}
            onMouseDown={(e) => btnPress(e.currentTarget)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-[#1F1F1F] bg-transparent text-[#999999] hover:text-white hover:bg-[#111111] font-semibold transition-all"
          >
            See How It Works
          </button>
        </div>

        <p className="ext-animate text-[#555555] text-xs mt-3">
          Works on Chrome, Brave, Edge • Free forever
        </p>
      </section>

      {/* Stats Row */}
      <section className="py-12 px-6 max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="ext-feature-card p-6 rounded-2xl border border-[#1F1F1F] bg-[#111111] text-center cursor-default"
              onMouseEnter={(e) => cardHover(e.currentTarget)}
              onMouseLeave={(e) => cardLeave(e.currentTarget)}
            >
              <div className="text-2xl md:text-3xl font-extrabold text-white mb-1">{item.stat}</div>
              <div className="text-[#555555] text-xs md:text-sm font-medium">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Browser Mockup */}
      <section className="py-12 px-6 max-w-4xl mx-auto relative z-10">
        <div
          className="ext-animate rounded-2xl border border-[#1F1F1F] bg-[#111111] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1F1F1F] bg-[#0A0A0A]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#1F1F1F]" />
              <div className="w-3 h-3 rounded-full bg-[#1F1F1F]" />
              <div className="w-3 h-3 rounded-full bg-[#1F1F1F]" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-lg px-4 py-1.5 text-xs text-[#555555] font-mono">
                linkedin.com/jobs/view/...
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold">
              <Puzzle size={12} />
              Apply with AI
            </div>
          </div>
          {/* Browser content */}
          <div className="p-8 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#1F1F1F] flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-2/3 rounded bg-[#1F1F1F]" />
                <div className="h-4 w-1/3 rounded bg-[#1F1F1F]/60" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-3 w-full rounded bg-[#1F1F1F]/40" />
              <div className="h-3 w-5/6 rounded bg-[#1F1F1F]/40" />
              <div className="h-3 w-4/6 rounded bg-[#1F1F1F]/40" />
            </div>
            <div className="pt-4 grid grid-cols-2 gap-3">
              <div className="h-10 rounded-lg bg-[#0D0D0D] border border-[#1F1F1F]" />
              <div className="h-10 rounded-lg bg-[#0D0D0D] border border-[#1F1F1F]" />
              <div className="h-10 rounded-lg bg-[#0D0D0D] border border-[#1F1F1F]" />
              <div className="h-10 rounded-lg bg-white/5 border border-white/20 flex items-center justify-center text-xs text-white font-semibold">
                AI Filling... ✨
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 max-w-5xl mx-auto relative z-10 border-t border-[#1F1F1F]">
        <div className="text-center mb-16">
          <h2 className="ext-animate text-3xl md:text-4xl font-bold tracking-tight mb-4">How It Works</h2>
          <p className="text-[#999999] max-w-lg mx-auto">Get set up and start applying automatically in three simple steps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="ext-feature-card flex flex-col items-center text-center p-6 rounded-2xl border border-[#1F1F1F] bg-[#111111]"
              onMouseEnter={(e) => cardHover(e.currentTarget)}
              onMouseLeave={(e) => cardLeave(e.currentTarget)}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-[#1F1F1F] bg-[#0D0D0D] text-white/60">
                {item.icon}
              </div>
              <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">{item.step}</div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-[#555555] text-sm leading-relaxed max-w-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 max-w-5xl mx-auto relative z-10 border-t border-[#1F1F1F]">
        <div className="text-center mb-16">
          <h2 className="ext-animate text-3xl md:text-4xl font-bold tracking-tight mb-4">Supercharge Your Job Search</h2>
          <p className="text-[#999999] max-w-lg mx-auto">Everything you need to automate your applications and keep track of your progress.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="ext-feature-card p-8 rounded-2xl border border-[#1F1F1F] bg-[#111111] cursor-default"
              onMouseEnter={(e) => cardHover(e.currentTarget)}
              onMouseLeave={(e) => cardLeave(e.currentTarget)}
            >
              <div className="w-12 h-12 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F] flex items-center justify-center mb-6 text-white/50">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
              <p className="text-[#999999] text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How to Install Guide */}
      {showComingSoon && (
        <section className="py-24 px-6 max-w-3xl mx-auto relative z-10 border-t border-[#1F1F1F]">
          <div className="text-center mb-12">
            <h2 className="ext-animate text-2xl md:text-3xl font-bold tracking-tight mb-4">How to Install (When Available)</h2>
            <p className="text-[#999999]">Follow these steps once the extension is published on the Chrome Web Store.</p>
          </div>
          <div className="space-y-4">
            {[
              'Visit the Chrome Web Store link (will be available soon)',
              'Click "Add to Chrome" on the extension page',
              'Confirm by clicking "Add extension" in the popup',
              'Pin the HirenextAI icon from your extensions menu',
              'Sign in with your HirenextAI account and start applying!',
            ].map((step, idx) => (
              <div
                key={idx}
                className="ext-feature-card flex items-center gap-4 p-4 rounded-xl border border-[#1F1F1F] bg-[#111111]"
              >
                <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <p className="text-white/70 text-sm">{step}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-28 px-6 relative z-10 border-t border-[#1F1F1F] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="ext-animate text-3xl md:text-5xl font-extrabold mb-4">Ready to Apply Smarter?</h2>
          <p className="text-[#999999] text-base md:text-lg mb-8 max-w-lg mx-auto">
            Join thousands of job seekers already using the extension
          </p>
          <button
            onClick={handleDownloadClick}
            onMouseDown={(e) => btnPress(e.currentTarget)}
            disabled={showComingSoon}
            className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all mb-4 ${
              showComingSoon
                ? 'bg-[#1F1F1F] text-[#555555] cursor-default border border-[#2A2A2A]'
                : 'bg-white text-black hover:bg-white/90 shadow-[0_0_24px_rgba(255,255,255,0.1)]'
            }`}
          >
            {showComingSoon ? 'Coming Soon' : (
              <>Download Extension <ArrowRight size={18} /></>
            )}
          </button>
          <p className="text-[#555555] text-xs">
            Free • No credit card • Works in 30 seconds
          </p>
        </div>
      </section>

      <Footer />

      {/* Extension Not Installed Gate Modal */}
      {showGateModal && (
        <>
          <div
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md"
            onClick={() => setShowGateModal(false)}
          />
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="ext-gate-modal w-full max-w-[400px] bg-[#111111] border border-[#1F1F1F] rounded-2xl p-8 text-center relative overflow-hidden">
              <button
                onClick={() => setShowGateModal(false)}
                className="absolute top-4 right-4 text-[#555555] hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center mb-5">
                  <AlertTriangle className="w-7 h-7 text-[#F59E0B]" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Extension Not Installed</h3>
                <p className="text-[#999999] text-sm mb-6 leading-relaxed max-w-xs">
                  You need to install the HirenextAI browser extension to use this feature.
                </p>
                <button
                  onClick={() => {
                    setShowGateModal(false);
                    handleDownloadClick({ currentTarget: document.body });
                  }}
                  onMouseDown={(e) => btnPress(e.currentTarget)}
                  className="w-full h-12 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-all mb-3"
                >
                  <Download size={16} />
                  {showComingSoon ? 'Coming Soon' : 'Download Extension'}
                </button>
                <button
                  onClick={() => setShowGateModal(false)}
                  className="w-full h-12 border border-[#1F1F1F] bg-transparent text-[#999999] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#111111] transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
