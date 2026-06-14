import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Sparkles, Clock, Shield, Zap, Target, FileText, MessageCircle, Star, ArrowRight, X, AlertTriangle, LogIn, UserPlus
} from "lucide-react";

export function DemoRoleModal({ open, onClose, onSelect }) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    if (!open) return;
    setTimeLeft(120);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, onClose]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const timerColor = timeLeft > 60 ? "text-emerald-400" : timeLeft > 30 ? "text-amber-400" : "text-rose-400";
  const timerBg = timeLeft > 60 ? "bg-emerald-500/10 border-emerald-500/25" : timeLeft > 30 ? "bg-amber-500/10 border-amber-500/25" : "bg-rose-500/10 border-rose-500/25";
  const timerPulse = timeLeft <= 30 ? "animate-pulse" : "";

  const handleStart = () => {
    onClose();
    if (onSelect) {
      onSelect("job_seeker");
    } else {
      navigate("/demo");
    }
  };

  const features = [
    { icon: MessageCircle, bg: "bg-indigo-500/15", color: "text-indigo-400", text: "AI Chat Assistant" },
    { icon: Target, bg: "bg-purple-500/15", color: "text-purple-400", text: "Job Matching" },
    { icon: FileText, bg: "bg-emerald-500/15", color: "text-emerald-400", text: "Resume Optimizer" },
    { icon: Zap, bg: "bg-amber-500/15", color: "text-amber-400", text: "Cover Letter AI" },
    { icon: Star, bg: "bg-pink-500/15", color: "text-pink-400", text: "Interview Prep" },
    { icon: Shield, bg: "bg-blue-500/15", color: "text-blue-400", text: "Application Tracker" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[121] flex items-start pt-20 justify-center p-4 pointer-events-none">
            {/* Close Button Outside Modal */}
            <div className="absolute top-20 right-6 z-30 pointer-events-auto">
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200 active:scale-95">
                <X className="w-4 h-4" />
              </button>
            </div>

            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="pointer-events-auto w-full max-w-[400px] max-h-[85vh] overflow-y-auto overscroll-behavior-contain bg-[#0f0f1a] border border-[#8B5CF6]/30 rounded-[20px] relative shadow-[0_40px_100px_rgba(0,0,0,0.9)] p-0"
            >
              {/* SECTION A — Top colored header strip */}
              <div className="relative px-5 pt-5 pb-3 border-b border-white/5">
                {/* Radial glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.2),transparent_70%)] pointer-events-none" />

                {/* Row 1: Badges */}
                <div className="flex items-center justify-between mb-5">
                  <motion.div
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/15 border border-yellow-500/35 text-yellow-400 text-[11px] font-bold uppercase tracking-wider"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>⚠ DEMO MODE</span>
                  </motion.div>

                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${timerBg} ${timerPulse}`}>
                    <Clock className={`w-3.5 h-3.5 ${timerColor}`} />
                    <span className={`font-mono font-bold text-sm ${timerColor}`}>{formatTime(timeLeft)}</span>
                  </div>
                </div>

                {/* Row 2: Header Info */}
                <div className="flex items-center justify-center gap-3 mb-3 mt-1">
                  <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <h2 className="text-lg font-display font-extrabold text-white">
                    See HirenextAI in Action
                  </h2>
                </div>
              </div>

              {/* SECTION B — Warning notice */}
              <div className="mx-5 my-2 flex items-start gap-3 px-4 py-2 rounded-xl bg-yellow-500/8 border border-yellow-500/20">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                <div className="text-left">
                  <p className="text-yellow-400 font-semibold text-xs mb-0.5">Demo Mode — No Personal Info</p>
                  <p className="text-white/40 text-[11px] leading-snug font-light">
                    This is a preview only. Do not enter real personal information, passwords, or payment details in demo mode.
                  </p>
                </div>
              </div>

              {/* SECTION C — Features grid */}
              <div className="px-5 mb-2">
                <div className="grid grid-cols-2 gap-1.5">
                  {features.map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.03, y: -1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-white/3 border border-white/6 hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5 transition-all duration-200"
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${item.bg}`}>
                          <IconComponent className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <span className="text-white/75 text-[11px] font-medium">{item.text}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>


              {/* SECTION E — Action buttons */}
              <div className="px-5 pb-5 space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStart}
                  className="w-full h-10 bg-gradient-to-r from-[#8B5CF6] to-[#7c3aed] hover:from-[#7c4dff] hover:to-[#6d28d9] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] text-sm cursor-pointer"
                >
                  <Zap className="w-4 h-4" /> Start Demo
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
