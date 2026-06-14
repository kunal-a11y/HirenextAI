import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import {
  FileText, Target, Zap, Mic, LayoutDashboard, MessageSquare,
  CheckCircle2, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: FileText,
    title: "AI Resume Builder",
    subtitle: "Build ATS-optimized resumes",
    desc: "Create a professional, ATS-friendly resume in minutes. Our AI optimizes your bullet points, highlights critical skills, and formats your document to grab the attention of both recruiters and hiring bots.",
    benefits: [
      "Real-time ATS score and feedback",
      "Tailor to any job with one click",
      "ATS-compliant modern templates",
      "Rewrite bullet points with AI"
    ],
    color: "from-blue-500/20 to-indigo-500/20",
    border: "border-blue-500/20",
    iconColor: "text-blue-400"
  },
  {
    icon: Target,
    title: "Smart Job Matching",
    subtitle: "AI-powered precision",
    desc: "Our AI reads job requirements and matches them against your profile. See exactly how well you fit each role before you apply. Stop wasting time on wrong jobs.",
    benefits: [
      "Match percentage score for every job",
      "Skills gap analysis",
      "Salary range estimation",
      "Best fit jobs highlighted first"
    ],
    color: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/20",
    iconColor: "text-purple-400"
  },
  {
    icon: Zap,
    title: "Apply with AI",
    subtitle: "Chrome extension auto-fills forms",
    desc: "Install our Chrome extension and let AI apply for jobs automatically. It opens the job page, fills every form field, uploads your resume, and waits for your final review before submitting.",
    benefits: [
      "Auto-fills name, email, phone, experience",
      "Uploads your resume automatically",
      "Generates cover letter for each job",
      "You review everything before submitting"
    ],
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400"
  },
  {
    icon: Mic,
    title: "Mock Interview AI",
    subtitle: "Practice until you're perfect",
    desc: "Practice with AI-powered mock interviews tailored to your target role. Get instant feedback, scores, and tips after each session. Walk into interviews fully prepared.",
    benefits: [
      "Role-specific interview questions",
      "Technical and HR question mix",
      "Instant answer scoring and feedback",
      "2 free interviews per day"
    ],
    color: "from-orange-500/20 to-red-500/20",
    border: "border-orange-500/20",
    iconColor: "text-orange-400"
  },
  {
    icon: LayoutDashboard,
    title: "Application Tracker",
    subtitle: "Never lose track again",
    desc: "Track every job application in one clean dashboard. See status updates, screenshots from AI applications, and manage your entire job search pipeline in one place.",
    benefits: [
      "Track Pending, Interview, Rejected, Selected",
      "Screenshots from AI applications",
      "Add manual applications too",
      "Filter by status anytime"
    ],
    color: "from-cyan-500/20 to-blue-500/20",
    border: "border-cyan-500/20",
    iconColor: "text-cyan-400"
  },
  {
    icon: MessageSquare,
    title: "AI Chat Assistant",
    subtitle: "Your 24/7 job search companion",
    desc: "Chat with our AI to find jobs, get career advice, review your resume, or prepare for interviews. Just type what you need and AI handles the rest.",
    benefits: [
      "Find jobs just by chatting",
      "Get career advice anytime",
      "Resume review in seconds",
      "Supports 7 languages"
    ],
    color: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-500/20",
    iconColor: "text-violet-400"
  }
];

const stats = [
  { value: "3×", label: "More Interview Callbacks" },
  { value: "87%", label: "ATS Pass Rate" },
  { value: "2min", label: "Cover Letter Generation" },
  { value: "50K+", label: "Jobs Analyzed Daily" }
];

/* ── DEMO 1: AI Resume Builder ───────────────────────────────────────────── */
function ResumeBuilderDemo() {
  const [step, setStep] = useState(0);
  const [inputText, setInputText] = useState("");
  const [atsScore, setAtsScore] = useState(0);
  const [resumePhase, setResumePhase] = useState(0);
  const [loopVal, setLoopVal] = useState(0);
  
  const containerRef = React.useRef(null);

  // Auto-scroll as content is added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [step, resumePhase]);

  useEffect(() => {
    // Step 0: User starts typing (0s to 1.5s)
    const textToType = "Make me a resume for React Developer role";
    let index = 0;
    setInputText("");
    const typeInterval = setInterval(() => {
      if (index < textToType.length) {
        setInputText(prev => prev + textToType.charAt(index));
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 35);

    let scoreInterval;

    // Step 2: 2.0s - User message sent
    const t2 = setTimeout(() => setStep(1), 2000);

    // Step 3: 2.5s - AI thinking
    const t3 = setTimeout(() => setStep(2), 2500);

    // Step 4: 3.0s - Resume builds
    const t4 = setTimeout(() => setStep(3), 3000);

    // Step 5: 5.0s - AI message below resume + Score bar animates
    const t5 = setTimeout(() => {
      setStep(4);
      let sc = 0;
      scoreInterval = setInterval(() => {
        sc += 4;
        if (sc >= 94) {
          sc = 94;
          clearInterval(scoreInterval);
        }
        setAtsScore(sc);
      }, 15);
    }, 5000);

    // Step 6: 6.0s - Buttons appear
    const t6 = setTimeout(() => setStep(5), 6000);

    // Step 7: 8.0s - Reset and loop
    const t7 = setTimeout(() => {
      setStep(0);
      setAtsScore(0);
      setResumePhase(0);
      setInputText("");
      setLoopVal(prev => prev + 1);
    }, 8000);

    return () => {
      clearInterval(typeInterval);
      if (scoreInterval) clearInterval(scoreInterval);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
    };
  }, [loopVal]);

  // Handle progressive resume building sub-phases (revealing section-by-section)
  useEffect(() => {
    let t4_1, t4_2;
    if (step === 3) {
      setResumePhase(1);
      t4_1 = setTimeout(() => setResumePhase(2), 600);
      t4_2 = setTimeout(() => setResumePhase(3), 1200);
    } else if (step < 3) {
      setResumePhase(0);
    }
    return () => {
      clearTimeout(t4_1);
      clearTimeout(t4_2);
    };
  }, [step]);

  return (
    <div className="flex flex-col h-full justify-between p-1 select-none text-[10px]">
      <div 
        ref={containerRef}
        className="flex flex-col gap-2 overflow-y-auto scrollbar-none flex-1 pb-2 scroll-smooth"
      >
        {step >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-end bg-[#8B5CF6] text-white px-2.5 py-1.5 rounded-xl rounded-tr-none max-w-[85%] font-medium"
          >
            Make me a resume for React Developer role
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-start flex items-center gap-1.5 text-white/50 bg-white/5 px-2.5 py-1.5 rounded-xl rounded-tl-none"
          >
            <div className="w-2.5 h-2.5 border border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
            <span className="text-[9px]">✦ Generating your resume...</span>
          </motion.div>
        )}

        {step >= 3 && (
          <div className="bg-[#151515] border border-white/10 rounded-xl p-2.5 text-white text-[8px] font-sans flex flex-col gap-1.5 shadow-lg w-full max-w-[240px] self-start">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-1">
              <div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="w-5 h-1.5 bg-[#8B5CF6] rounded" />
                  <span className="text-[9px]">KUNAL P.</span>
                </div>
                <div className="text-[7px] text-[#8B5CF6] font-semibold mt-0.5">React Developer</div>
              </div>
            </div>

            {/* Experience (appears first) */}
            {resumePhase >= 1 && (
              <motion.div initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                <div className="text-[6px] text-white/30 font-bold uppercase tracking-wider">Experience</div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "85%" }}
                  transition={{ duration: 0.6 }}
                  className="h-1.5 bg-white/15 rounded animate-shimmer"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "60%" }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="h-1 bg-white/10 rounded animate-shimmer"
                />
              </motion.div>
            )}

            {/* Skills (appears second) */}
            {resumePhase >= 2 && (
              <motion.div initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} className="space-y-0.5">
                <div className="text-[6px] text-white/30 font-bold uppercase tracking-wider">Skills</div>
                <div className="flex gap-1">
                  {["React", "Node", "TypeScript"].map((skill, sIdx) => (
                    <motion.span
                      key={skill}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: sIdx * 0.15, duration: 0.3 }}
                      className="px-1 py-0.5 bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] rounded text-[5px]"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Education (appears third) */}
            {resumePhase >= 3 && (
              <motion.div initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                <div className="text-[6px] text-white/30 font-bold uppercase tracking-wider">Education</div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "70%" }}
                  transition={{ duration: 0.6 }}
                  className="h-1 bg-white/10 rounded animate-shimmer"
                />
              </motion.div>
            )}
          </div>
        )}

        {step >= 4 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5 w-full max-w-[240px] self-start mt-1">
            <div className="text-emerald-400 font-bold text-[9px]">✅ Resume ready! ATS Score: 94%</div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#8B5CF6] transition-all duration-100" style={{ width: `${atsScore}%` }} />
            </div>
          </motion.div>
        )}

        {step >= 5 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-1.5 w-full max-w-[240px] self-start mt-1">
            <button className="flex-1 h-5.5 bg-[#8B5CF6] text-white font-bold rounded text-[8px] hover:bg-[#8B5CF6]/90 transition-colors">
              Download PDF
            </button>
            <button className="flex-1 h-5.5 bg-white/5 border border-white/10 text-white font-bold rounded text-[8px] hover:bg-white/10 transition-colors">
              Edit Resume
            </button>
          </motion.div>
        )}
      </div>

      {/* Input box */}
      <div className="mt-auto pt-2 border-t border-white/5 flex gap-1 items-center shrink-0">
        <div className="flex-1 h-7 bg-white/5 border border-white/10 rounded px-2 text-white flex items-center text-[8px] relative overflow-hidden">
          {step === 0 ? (
            <>
              <span className="truncate">{inputText}</span>
              <span className="w-0.5 h-2.5 bg-[#8B5CF6] ml-0.5 animate-blink shrink-0" />
            </>
          ) : (
            <span className="text-white/20">Ask AI to build or edit...</span>
          )}
        </div>
        <button className="h-7 px-2.5 bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#8B5CF6] rounded text-[8px] font-bold">
          Send
        </button>
      </div>
    </div>
  );
}

/* ── DEMO 2: Smart Job Matching ──────────────────────────────────────────── */
function SmartMatchingDemo() {
  const [step, setStep] = useState(0);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(0);
      setPercentage(0);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => setStep(1), 300);
      return () => clearTimeout(t);
    } else if (step === 1) {
      let current = 0;
      const countInterval = setInterval(() => {
        current += 3;
        if (current >= 89) {
          current = 89;
          clearInterval(countInterval);
          setStep(2);
        }
        setPercentage(current);
      }, 30);
      return () => clearInterval(countInterval);
    }
  }, [step]);

  return (
    <div className="flex flex-col gap-4 text-xs h-full justify-center items-center">
      <div className="text-center">
        <h4 className="font-bold text-sm text-white">Senior Frontend Developer</h4>
        <p className="text-white/40 text-[10px]">Amazon India</p>
      </div>

      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r="40" className="stroke-white/5 fill-transparent" strokeWidth="5" />
          <motion.circle 
            cx="48" 
            cy="48" 
            r="40" 
            className="stroke-[#8B5CF6] fill-transparent" 
            strokeWidth="5"
            strokeDasharray={2 * Math.PI * 40}
            strokeDashoffset={2 * Math.PI * 40 * (1 - percentage / 100)}
            transition={{ ease: "easeOut", duration: 0.1 }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-xl font-black text-white">{percentage}%</span>
          <span className="text-[7px] text-[#8B5CF6] font-bold uppercase tracking-wider">Match</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 w-full max-w-[240px]">
        {step >= 2 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 text-emerald-400">
            <span>✓</span> <span className="text-white/70 text-[10px]">React.js</span>
          </motion.div>
        )}
        {step >= 2 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex items-center gap-1.5 text-emerald-400">
            <span>✓</span> <span className="text-white/70 text-[10px]">Node.js</span>
          </motion.div>
        )}
        {step >= 2 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-1.5 text-emerald-400">
            <span>✓</span> <span className="text-white/70 text-[10px]">TypeScript</span>
          </motion.div>
        )}
        {step >= 2 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="flex items-center gap-1.5 text-red-400">
            <span>✗</span> <span className="text-white/40 text-[10px]">AWS</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ── DEMO 3: Apply with AI ───────────────────────────────────────────────── */
function ApplyWithAIDemo() {
  const [step, setStep] = useState(0);
  const [fields, setFields] = useState({ name: "", email: "", phone: "" });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(0);
      setFields({ name: "", email: "", phone: "" });
      setProgress(0);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => setStep(1), 500);
      return () => clearTimeout(t);
    }
    if (step === 1) {
      let nameText = "Kunal Pathak";
      let current = "";
      let i = 0;
      const type = setInterval(() => {
        current += nameText[i];
        setFields(prev => ({ ...prev, name: current }));
        i++;
        if (i >= nameText.length) {
          clearInterval(type);
          setStep(2);
        }
      }, 60);
      return () => clearInterval(type);
    }
    if (step === 2) {
      let emailText = "kunal@hirenextai.com";
      let current = "";
      let i = 0;
      const type = setInterval(() => {
        current += emailText[i];
        setFields(prev => ({ ...prev, email: current }));
        i++;
        if (i >= emailText.length) {
          clearInterval(type);
          setStep(3);
        }
      }, 40);
      return () => clearInterval(type);
    }
    if (step === 3) {
      let phoneText = "+91 82877 42269";
      let current = "";
      let i = 0;
      const type = setInterval(() => {
        current += phoneText[i];
        setFields(prev => ({ ...prev, phone: current }));
        i++;
        if (i >= phoneText.length) {
          clearInterval(type);
          setStep(4);
        }
      }, 50);
      return () => clearInterval(type);
    }
    if (step === 4) {
      let currentProgress = 0;
      const p = setInterval(() => {
        currentProgress += 5;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(p);
          setStep(5);
        }
        setProgress(currentProgress);
      }, 50);
      return () => clearInterval(p);
    }
  }, [step]);

  return (
    <div className="relative w-full h-full p-4 flex flex-col justify-between border border-[#8B5CF6]/40 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.15)] bg-[#0d0d0d] text-[10px] select-none">
      <div className="space-y-2.5">
        <div className="font-bold text-white/50 text-[9px] uppercase tracking-wider mb-1">Job Application Form</div>
        
        <div className="space-y-1.5">
          <div>
            <label className="text-white/40 block text-[9px] mb-0.5">Full Name</label>
            <div className="h-6 px-2 bg-white/5 border border-white/10 rounded flex items-center text-white font-medium">
              {fields.name}
              {step === 1 && <span className="w-1 h-3 bg-[#8B5CF6] ml-0.5 animate-blink" />}
            </div>
          </div>

          <div>
            <label className="text-white/40 block text-[9px] mb-0.5">Email Address</label>
            <div className="h-6 px-2 bg-white/5 border border-white/10 rounded flex items-center text-white font-medium">
              {fields.email}
              {step === 2 && <span className="w-1 h-3 bg-[#8B5CF6] ml-0.5 animate-blink" />}
            </div>
          </div>

          <div>
            <label className="text-white/40 block text-[9px] mb-0.5">Phone Number</label>
            <div className="h-6 px-2 bg-white/5 border border-white/10 rounded flex items-center text-white font-medium">
              {fields.phone}
              {step === 3 && <span className="w-1 h-3 bg-[#8B5CF6] ml-0.5 animate-blink" />}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {step >= 4 && (
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] text-white/50 font-mono">
              <span>Filling form...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-[#8B5CF6] transition-all duration-100" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {step === 5 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
            <div className="text-[#8B5CF6] font-bold text-[9px] text-center">✅ Form filled! Please review</div>
            <button className="w-full h-7 rounded bg-white text-[#0d0d0d] font-bold text-[9px] hover:bg-white/90 transition-colors uppercase tracking-wider">
              Submit Application
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ── DEMO 4: Mock Interview ──────────────────────────────────────────────── */
function MockInterviewDemo() {
  const [step, setStep] = useState(0);
  const [timerText, setTimerText] = useState("00:00");
  const [answerText, setAnswerText] = useState("");
  const [score, setScore] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(0);
      setTimerText("00:00");
      setAnswerText("");
      setScore(0);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => setStep(1), 300);
      return () => clearTimeout(t);
    }
    if (step === 1) {
      let counter = 0;
      const count = setInterval(() => {
        counter += 3;
        const formatted = `00:${counter < 10 ? "0" + counter : counter}`;
        setTimerText(formatted);
        if (counter >= 45) {
          clearInterval(count);
          setStep(2);
        }
      }, 50);
      return () => clearInterval(count);
    }
    if (step === 2) {
      let answer = "A closure is the combination of a function bundled together with references to its surrounding state...";
      let current = "";
      let i = 0;
      const type = setInterval(() => {
        current += answer[i];
        setAnswerText(current);
        i++;
        if (i >= answer.length) {
          clearInterval(type);
          setStep(3);
        }
      }, 15);
      return () => clearInterval(type);
    }
    if (step === 3) {
      let currentScore = 0;
      const sc = setInterval(() => {
        currentScore += 5;
        if (currentScore >= 80) {
          currentScore = 80;
          clearInterval(sc);
          setStep(4);
        }
        setScore(currentScore);
      }, 25);
      return () => clearInterval(sc);
    }
  }, [step]);

  return (
    <div className="flex flex-col gap-2 text-[10px] h-full justify-between p-3 select-none">
      <div className="bg-[#151515] border border-white/10 rounded-xl p-2.5 relative">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-[#8B5CF6] text-[8px] font-bold uppercase tracking-widest">Q3 of 8</span>
          <span className="text-white/40 font-mono text-[8px]">{timerText}</span>
        </div>
        <p className="font-bold text-white leading-relaxed text-[10px]">Explain the concept of closures in JavaScript.</p>
      </div>

      <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-[9px] text-white/50 leading-relaxed overflow-hidden min-h-[80px]">
        {answerText}
        {step === 2 && <span className="w-1.5 h-3 bg-[#8B5CF6] inline-block ml-0.5 animate-blink" />}
      </div>

      {step >= 3 && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <div className="flex justify-between items-center text-[9px]">
            <span className="text-emerald-400 font-bold">8/10 ✓ Good answer!</span>
            <span className="text-white/40 font-mono">{score}%</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-100" style={{ width: `${score}%` }} />
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ── DEMO 5: Application Tracker ─────────────────────────────────────────── */
function ApplicationTrackerDemo() {
  const [step, setStep] = useState(0);
  const [statsData, setStatsData] = useState({ total: 0, pending: 0, interview: 0, selected: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(0);
      setStatsData({ total: 0, pending: 0, interview: 0, selected: 0 });
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (step === 0) {
      let currentTotal = 0;
      const count = setInterval(() => {
        currentTotal++;
        setStatsData({
          total: currentTotal,
          pending: Math.min(Math.floor(currentTotal * 0.42), 5),
          interview: Math.min(Math.floor(currentTotal * 0.25), 3),
          selected: Math.min(Math.floor(currentTotal * 0.17), 2)
        });
        if (currentTotal >= 12) {
          clearInterval(count);
          setStep(1);
        }
      }, 50);
      return () => clearInterval(count);
    }
    if (step === 1) {
      const t = setTimeout(() => setStep(2), 1500);
      return () => clearTimeout(t);
    }
  }, [step]);

  return (
    <div className="flex flex-col gap-3 text-[10px] h-full justify-center p-3 select-none">
      <div className="grid grid-cols-4 gap-1.5 bg-[#151515] p-2 border border-white/5 rounded-xl text-center">
        <div>
          <div className="font-bold text-white text-[12px]">{statsData.total}</div>
          <div className="text-[7px] text-white/30 uppercase">Total</div>
        </div>
        <div>
          <div className="font-bold text-[#EAB308] text-[12px]">{statsData.pending}</div>
          <div className="text-[7px] text-white/30 uppercase">Pending</div>
        </div>
        <div>
          <div className="font-bold text-[#8B5CF6] text-[12px]">{statsData.interview}</div>
          <div className="text-[7px] text-white/30 uppercase">Interview</div>
        </div>
        <div>
          <div className="font-bold text-[#10B981] text-[12px]">{statsData.selected}</div>
          <div className="text-[7px] text-white/30 uppercase">Selected</div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-[8px] text-white/40 font-bold uppercase tracking-wider">Recent Applications</div>
        
        <div className="bg-[#151515] border border-white/10 rounded-xl p-2.5 flex justify-between items-center transition-all duration-300">
          <div>
            <div className="font-bold text-white text-[10px]">Senior Dev at Google</div>
            <div className="text-[8px] text-white/30">Google India ? Bangalore</div>
          </div>
          <span 
            className={`text-[8px] font-bold px-2 py-0.5 rounded-full border transition-all duration-500 uppercase tracking-wider ${
              step < 2 
                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" 
                : "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20"
            }`}
          >
            {step < 2 ? "Pending" : "Interview"}
          </span>
        </div>

        <div className="bg-[#151515]/60 border border-white/5 rounded-xl p-2.5 flex justify-between items-center opacity-60">
          <div>
            <div className="font-bold text-white/80 text-[10px]">Software Engineer</div>
            <div className="text-[8px] text-white/30">Microsoft ? Noida</div>
          </div>
          <span className="text-[8px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase tracking-wider">
            Selected
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── DEMO 6: AI Chat Assistant ───────────────────────────────────────────── */
function AIChatDemo() {
  const [step, setStep] = useState(0);
  const [loopVal, setLoopVal] = useState(0);
  const containerRef = React.useRef(null);

  // Auto-scroll as messages appear
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [step]);

  useEffect(() => {
    // Step 1 (0s): User bubble appears (right side): "Review my resume" (starts immediately at step 0)
    // Step 2 (1s): AI typing indicator
    const t2 = setTimeout(() => setStep(1), 1000);

    // Step 3 (2s): AI response appears
    const t3 = setTimeout(() => setStep(2), 2000);

    // Step 4 (2.5s): Suggestion 1 appears
    const t4 = setTimeout(() => setStep(3), 2500);

    // Step 5 (3s): Suggestion 2 appears
    const t5 = setTimeout(() => setStep(4), 3000);

    // Step 6 (3.5s): Suggestion 3 appears
    const t6 = setTimeout(() => setStep(5), 3500);

    // Step 7 (5s): New user message appears: "Find me frontend jobs in Bangalore"
    const t7 = setTimeout(() => setStep(6), 5000);

    // Step 8 (6s): AI typing indicator again
    const t8 = setTimeout(() => setStep(7), 6000);

    // Step 9 (7s): Job card appears
    const t9 = setTimeout(() => setStep(8), 7000);

    // Step 10 (9s): Reset and loop
    const t10 = setTimeout(() => {
      setStep(0);
      setLoopVal(prev => prev + 1);
    }, 9000);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(t8);
      clearTimeout(t9);
      clearTimeout(t10);
    };
  }, [loopVal]);

  return (
    <div 
      ref={containerRef}
      className="flex flex-col gap-2 text-[9px] h-full justify-start overflow-y-auto p-1 scrollbar-none select-none scroll-smooth"
    >
      {/* User message 1 */}
      {step >= 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="self-end bg-[#8B5CF6] text-white px-2.5 py-1.5 rounded-xl rounded-tr-none max-w-[80%] font-medium"
        >
          Review my resume
        </motion.div>
      )}

      {/* AI typing indicator 1 */}
      {step === 1 && (
        <div className="self-start bg-[#1e1e1e] border border-white/5 text-white/50 px-2.5 py-1.5 rounded-xl rounded-tl-none flex gap-1 items-center">
          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-dot-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-dot-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-dot-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      )}

      {/* AI response 1 & suggestions */}
      {step >= 2 && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="self-start bg-[#151515] border border-white/10 text-white/80 px-2.5 py-1.5 rounded-xl rounded-tl-none max-w-[85%] space-y-1"
        >
          <div>I found 3 improvements for your resume:</div>
          <div className="space-y-0.5 font-light text-white/50 text-[8px] pl-1">
            {step >= 3 && <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>✦ Add more technical keywords</motion.div>}
            {step >= 4 && <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>✦ Quantify your achievements</motion.div>}
            {step >= 5 && <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>✦ Update your summary section</motion.div>}
          </div>
        </motion.div>
      )}

      {/* User message 2 */}
      {step >= 6 && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="self-end bg-[#8B5CF6] text-white px-2.5 py-1.5 rounded-xl rounded-tr-none max-w-[80%] font-medium"
        >
          Find me frontend jobs in Bangalore
        </motion.div>
      )}

      {/* AI typing indicator 2 */}
      {step === 7 && (
        <div className="self-start bg-[#1e1e1e] border border-white/5 text-white/50 px-2.5 py-1.5 rounded-xl rounded-tl-none flex gap-1 items-center">
          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-dot-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-dot-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-dot-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      )}

      {/* Job card */}
      {step >= 8 && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="self-start bg-[#151515] border border-white/10 rounded-xl p-2.5 flex flex-col gap-2 w-[85%] shadow-lg"
        >
          <div>
            <div className="font-bold text-white text-[9px]">Senior Frontend Developer</div>
            <div className="text-[7px] text-white/40">Google ? Bangalore</div>
          </div>
          <div className="flex items-center gap-1.5 text-[8px] text-white/50">
            <div className="flex gap-0.5 font-mono">
              <span className="text-[#8B5CF6]">████████</span>
              <span className="text-white/10">░░</span>
            </div>
            <span className="text-emerald-400 font-bold">92% Match</span>
          </div>
          <button className="w-full h-5.5 rounded bg-[#8B5CF6] text-white font-bold text-[8px] hover:bg-[#8B5CF6]/90 transition-colors uppercase tracking-wider">
            Apply with AI
          </button>
        </motion.div>
      )}
    </div>
  );
}

/* ── ANIMATED DEMO CONTAINER WRAPPER ─────────────────────────────────────── */
function AnimatedDemo({ featureIndex }) {
  const renderDemoContent = (index) => {
    switch (index) {
      case 0:
        return <ResumeBuilderDemo />;
      case 1:
        return <SmartMatchingDemo />;
      case 2:
        return <ApplyWithAIDemo />;
      case 3:
        return <MockInterviewDemo />;
      case 4:
        return <ApplicationTrackerDemo />;
      case 5:
        return <AIChatDemo />;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full bg-[#0d0d0d] border border-white/[0.08] flex flex-col overflow-hidden text-white font-sans rounded-[20px]">
      {/* Mobile Browser Bar Frame */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#151515] border-b border-white/[0.05] shrink-0 select-none">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <div className="h-5 w-44 rounded bg-white/5 border border-white/[0.02] flex items-center justify-center gap-1.5 text-[8px] text-white/40 truncate px-2 font-mono">
          <span className="text-[7px]">🔒</span>
          <span>
            {featureIndex === 0 
              ? "hirenextai.com/resume" 
              : featureIndex === 2 
                ? "linkedin.com/jobs/apply" 
                : "hirenextai.com/dashboard"}
          </span>
        </div>
        <div className="w-6" />
      </div>
      
      {/* Content Area */}
      <div className="flex-1 p-5 relative overflow-hidden flex flex-col justify-center bg-[#08080c]">
        {renderDemoContent(featureIndex)}
      </div>
    </div>
  );
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4 } 
  }
};

export default function Features() {
  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden", width: "100%" }} className="bg-background relative flex flex-col">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-[#8B5CF6]/5 blur-[150px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <Navbar />

      {/* Hero */}
      <section className="relative z-10 pt-40 pb-20 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
        >
          <Zap className="w-4 h-4 text-[#8B5CF6]" />
          <span className="text-sm font-medium text-white/80">Built for serious job seekers</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-display font-extrabold tracking-tight mb-6 leading-tight text-white"
        >
          Every Tool You Need<br />
          <span className="text-gradient">to Land the Job</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-white/60 max-w-2xl mx-auto mb-12 font-light"
        >
          HirenextAI gives you an unfair advantage at every stage of your job search — from finding the right role to acing the interview.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {stats.map((s, i) => (
            <div key={i} className="glass-card p-4 text-center">
              <p className="text-3xl font-display font-bold text-gradient mb-1">{s.value}</p>
              <p className="text-xs text-white/50">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Feature Sections */}
      <section className="relative z-10 py-12 px-6 max-w-7xl mx-auto space-y-32">
        {features.map((feature, i) => {
          const isEven = i % 2 === 1; // 0: Odd feature (1st), 1: Even feature (2nd), etc.
          
          return (
            <div
              key={i}
              className="grid md:grid-cols-2 gap-12 items-center py-20 max-w-[1200px] mx-auto overflow-hidden animate-container"
            >
              {/* Text Side */}
              <motion.div
                initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`max-w-[500px] w-full ${isEven ? "md:order-2" : "md:order-1"}`}
              >
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${feature.color} border ${feature.border} mb-4`}>
                  <feature.icon className={`w-4 h-4 ${feature.iconColor}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${feature.iconColor}`}>{feature.subtitle}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">{feature.title}</h2>
                <p className="text-white/60 text-lg leading-relaxed mb-8 font-light">{feature.desc}</p>
                
                <motion.ul 
                  variants={listVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="space-y-3"
                >
                  {feature.benefits.map((b, j) => (
                    <motion.li key={j} variants={itemVariants} className="flex items-center gap-3">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${feature.iconColor}`} />
                      <span className="text-white/80 font-light">{b}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>

              {/* Demo Side */}
              <motion.div
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`max-w-[560px] w-full h-[400px] rounded-[20px] overflow-hidden ${isEven ? "md:order-1" : "md:order-2"}`}
              >
                <AnimatedDemo featureIndex={i} />
              </motion.div>
            </div>
          );
        })}
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass-card p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/10 to-purple-500/10 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">Ready to Accelerate Your Search?</h2>
            <p className="text-white/60 mb-8 font-light">Start for free — no credit card required. Upgrade anytime.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary py-4 px-8 flex items-center justify-center gap-2 text-white">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/pricing" className="btn-secondary py-4 px-8 text-white">
                View Pricing
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
      
      <style>{`
        .animate-blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        
        .animate-dot-bounce {
          animation: dotBounce 1.2s infinite ease-in-out;
        }
        @keyframes dotBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        .animate-shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.03) 75%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite linear;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
