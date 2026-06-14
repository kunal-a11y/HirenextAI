import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Puzzle, Zap, Shield, Globe, ArrowRight, Download, Search, FileText, Database, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Extension() {
  const handleScrollToDemo = (e) => {
    e.preventDefault();
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative">
      {/* Background Glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[15%] h-[500px] w-[500px] rounded-full bg-purple-600/[0.08] blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-indigo-600/[0.06] blur-[100px]" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#A78BFA] text-xs font-semibold uppercase tracking-wider mb-8"
        >
          <Puzzle size={14} className="animate-pulse text-[#8B5CF6]" />
          Chrome Extension
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6 bg-gradient-to-r from-white via-white to-purple-400 bg-clip-text text-transparent"
        >
          Apply to Any Job in <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">One Click</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/60 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10"
        >
          HirenextAI extension auto-fills job applications on LinkedIn, Indeed, Naukri, Glassdoor and 100+ job sites. Install once, apply smarter everywhere.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4"
        >
          <a
            href="#"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-95 shadow-[0_0_24px_rgba(139,92,246,0.4)] transition-all"
          >
            Add to Chrome — Free
            <ArrowRight size={16} />
          </a>
          <button
            onClick={handleScrollToDemo}
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 font-semibold transition-all"
          >
            See How It Works
          </button>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/40 text-xs mt-3"
        >
          Works on Chrome, Brave, Edge • Free forever
        </motion.p>
      </section>

      {/* Stats Row Section */}
      <section className="py-12 px-6 max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { stat: "100+", label: "Job sites supported" },
            { stat: "30 sec", label: "Average apply time" },
            { stat: "10x", label: "Faster than manual" },
            { stat: "Free", label: "Always free to install" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="p-6 rounded-2xl border border-white/5 bg-[#12111a]/40 backdrop-blur-xl text-center"
            >
              <div className="text-2xl md:text-3xl font-extrabold text-[#A78BFA] mb-1">{item.stat}</div>
              <div className="text-white/40 text-xs md:text-sm font-medium">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-6 max-w-5xl mx-auto relative z-10 border-t border-white/[0.06]">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How It Works</h2>
          <p className="text-white/50 max-w-lg mx-auto">Get set up and start applying automatically in three simple steps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Download size={22} className="text-indigo-400" />,
              step: "Step 1",
              title: "Install in 30 Seconds",
              desc: "Add HirenextAI to Chrome from the Web Store. One click, no signup needed.",
              bg: "bg-indigo-500/10 border-indigo-500/20"
            },
            {
              icon: <Search size={22} className="text-purple-400" />,
              step: "Step 2",
              title: "Find a Job You Like",
              desc: "Browse LinkedIn, Indeed, Naukri, or any job board. Find a role that excites you.",
              bg: "bg-purple-500/10 border-purple-500/20"
            },
            {
              icon: <Zap size={22} className="text-amber-400" />,
              step: "Step 3",
              title: "Click Apply with AI",
              desc: "Hit the HirenextAI button. AI fills every field using your profile. You review and submit.",
              bg: "bg-amber-500/10 border-amber-500/20"
            }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl border border-white/5 bg-[#12111a]/20">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${item.bg}`}>
                {item.icon}
              </div>
              <div className="text-[#A78BFA] text-xs font-bold uppercase tracking-wider mb-2">{item.step}</div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 max-w-5xl mx-auto relative z-10 border-t border-white/[0.06]">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Supercharge Your Job Search</h2>
          <p className="text-white/50 max-w-lg mx-auto">Everything you need to automate your applications and keep track of your progress.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <FileText size={22} className="text-indigo-400" />,
              title: "Smart Form Filling",
              desc: "AI reads your profile and fills every application field accurately"
            },
            {
              icon: <Shield size={22} className="text-purple-400" />,
              title: "You Stay in Control",
              desc: "Always shows preview before submitting. Never auto-submits."
            },
            {
              icon: <Globe size={22} className="text-[#A78BFA]" />,
              title: "Works Everywhere",
              desc: "LinkedIn, Indeed, Naukri, Glassdoor, AngelList and 100+ more"
            },
            {
              icon: <Zap size={22} className="text-amber-400" />,
              title: "Lightning Fast",
              desc: "What takes 30 minutes takes 30 seconds with AI"
            },
            {
              icon: <Database size={22} className="text-emerald-400" />,
              title: "Saves to Tracker",
              desc: "Every application auto-saved to your HirenextAI dashboard"
            },
            {
              icon: <Star size={22} className="text-rose-400" />,
              title: "Personalized",
              desc: "AI tailors each application to the specific job description"
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="p-8 rounded-2xl border border-white/5 bg-[#12111a]/40 backdrop-blur-xl"
            >
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 px-6 relative z-10 border-t border-white/[0.06] bg-gradient-to-b from-transparent to-purple-950/10 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Ready to Apply Smarter?</h2>
          <p className="text-white/50 text-base md:text-lg mb-8 max-w-lg mx-auto">
            Join thousands of job seekers already using the extension
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:opacity-95 transition-all shadow-[0_0_24px_rgba(139,92,246,0.3)] mb-4"
          >
            Download Extension
            <ArrowRight size={18} />
          </a>
          <p className="text-white/30 text-xs">
            Free • No credit card • Works in 30 seconds
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
