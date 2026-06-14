import re

file_path = r"C:\Users\mindc\Downloads\hirenextai new thing with antigravaty\frontend\src\pages\Features.jsx"

with open(file_path, "r", encoding="utf-8", errors="replace") as f:
    content = f.read()

# Replace any garbled characters with proper unicode symbols
content = content.replace("?", "•")
content = content.replace("o Generating", "✦ Generating")
content = content.replace("o. Resume ready", "✅ Resume ready")
content = content.replace("o", "✦")
content = content.replace("o", "✦")

# Clean up all DEMO headers
content = re.sub(r'/\*\s*[^\n]*DEMO 1[^\n]*\*/', '/* ── DEMO 1: AI Resume Builder ───────────────────────────────────────────── */', content)
content = re.sub(r'/\*\s*[^\n]*DEMO 2[^\n]*\*/', '/* ── DEMO 2: Smart Job Matching ──────────────────────────────────────────── */', content)
content = re.sub(r'/\*\s*[^\n]*DEMO 3[^\n]*\*/', '/* ── DEMO 3: Apply with AI ───────────────────────────────────────────────── */', content)
content = re.sub(r'/\*\s*[^\n]*DEMO 4[^\n]*\*/', '/* ── DEMO 4: Mock Interview ──────────────────────────────────────────────── */', content)
content = re.sub(r'/\*\s*[^\n]*DEMO 5[^\n]*\*/', '/* ── DEMO 5: Application Tracker ─────────────────────────────────────────── */', content)
content = re.sub(r'/\*\s*[^\n]*DEMO 6[^\n]*\*/', '/* ── DEMO 6: AI Chat Assistant ───────────────────────────────────────────── */', content)

# Now let's define the clean ResumeBuilderDemo component code
resume_builder_code = """function ResumeBuilderDemo() {
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
}"""

# Replace ResumeBuilderDemo function
start_idx = content.find("function ResumeBuilderDemo")
# Find start of DEMO 1 comment (either original or cleaned re.sub)
demo1_start = content.find("DEMO 1: AI Resume Builder")
if demo1_start != -1:
    comment_start = content.rfind("/*", 0, demo1_start)
    if comment_start != -1:
        start_idx = comment_start
else:
    start_idx = content.find("function ResumeBuilderDemo")

demo2_start = content.find("DEMO 2: Smart Job Matching")
if demo2_start != -1:
    comment2_start = content.rfind("/*", 0, demo2_start)
    end_idx = comment2_start
else:
    end_idx = content.find("function SmartMatchingDemo")

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + "/* ── DEMO 1: AI Resume Builder ───────────────────────────────────────────── */\n" + resume_builder_code + "\n\n" + content[end_idx:]
else:
    print("Error: Could not locate ResumeBuilderDemo bounds!")

# Now replace AIChatDemo
ai_chat_code = """function AIChatDemo() {
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
            <div className="text-[7px] text-white/40">Google • Bangalore</div>
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
}"""

demo6_start = content.find("DEMO 6: AI Chat Assistant")
if demo6_start != -1:
    comment6_start = content.rfind("/*", 0, demo6_start)
    start_chat_idx = comment6_start
else:
    start_chat_idx = content.find("function AIChatDemo")

animated_demo_start = content.find("ANIMATED DEMO CONTAINER WRAPPER")
if animated_demo_start != -1:
    comment_animated_start = content.rfind("/*", 0, animated_demo_start)
    end_chat_idx = comment_animated_start
else:
    end_chat_idx = content.find("function AnimatedDemo")

if start_chat_idx != -1 and end_chat_idx != -1:
    content = content[:start_chat_idx] + "/* ── DEMO 6: AI Chat Assistant ───────────────────────────────────────────── */\n" + ai_chat_code + "\n\n" + content[end_chat_idx:]
else:
    print("Error: Could not locate AIChatDemo bounds!")

# Now replace AnimatedDemo
animated_demo_code = """function AnimatedDemo({ featureIndex }) {
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
        <div className="h-4 w-44 rounded bg-white/5 border border-white/[0.02] flex items-center justify-center gap-1 text-[8px] text-white/40 truncate px-2 font-mono">
          <span className="text-[7px]">🔒</span>
          {featureIndex === 0 
            ? "hirenextai.com/resume" 
            : featureIndex === 2 
              ? "linkedin.com/jobs/apply" 
              : "hirenextai.com/dashboard"}
        </div>
        <div className="w-6" />
      </div>
      
      {/* Content Area */}
      <div className="flex-1 p-5 relative overflow-hidden flex flex-col justify-center bg-[#08080c]">
        {renderDemoContent(featureIndex)}
      </div>
    </div>
  );
}"""

animated_demo_find = content.find("function AnimatedDemo")
if animated_demo_find != -1:
    # Find matching end: replace up to const listVariants
    list_variants_find = content.find("const listVariants")
    if list_variants_find != -1:
        content = content[:animated_demo_find] + animated_demo_code + "\n\n" + content[list_variants_find:]
    else:
        print("Error: Could not locate listVariants!")
else:
    print("Error: Could not locate AnimatedDemo!")

# Replace styles at the bottom
style_start = content.find("<style>{`")
if style_start != -1:
    style_end = content.find("`}</style>", style_start)
    if style_end != -1:
        new_style = """<style>{`
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
      `}</style>"""
        content = content[:style_start] + new_style + content[style_end + len("`}</style>"):]

# Final cleanups of any remaining junk characters in headings or anywhere else in comments
content = content.replace("Google India • Bangalore", "Google India • Bangalore")
content = content.replace("Microsoft • Noida", "Microsoft • Noida")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Features.jsx updated successfully!")
