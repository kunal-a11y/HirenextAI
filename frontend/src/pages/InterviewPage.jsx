import { useState, useEffect, useCallback, useRef } from 'react';
import ChatLayout from '../components/layout/ChatLayout';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Loader2,
  Mic,
  MicOff,
  ChevronRight,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAIApplications } from '../lib/applicationsStorage';
import {
  generateQuestions,
  evaluateAnswers,
  rateSingleAnswer,
  buildMindMapText,
} from '../lib/interviewService';
import { saveInterviewToFiles } from '../lib/aiFileSaver';
import useInterviewStore from '../store/useInterviewStore';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import useUIStore from '../store/useUIStore';

const TOTAL_QUESTIONS = 10;

const speak = (text, onEnd) => {
  if (!window.speechSynthesis) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.92;
  if (onEnd) u.onend = onEnd;
  window.speechSynthesis.speak(u);
};

const InterviewPage = () => {
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const { saveSession } = useInterviewStore();

  const [phase, setPhase] = useState('select');
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [phaseVoice, setPhaseVoice] = useState('speaking');
  const [lastRating, setLastRating] = useState(null);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const interimRef = useRef('');
  const answersRef = useRef([]);
  const spokenIndexRef = useRef(-1);

  useEffect(() => {
    setApplications(getAIApplications());
  }, []);

  const handleSpeechResult = useCallback((text, isFinal) => {
    if (isFinal) {
      setTranscript((prev) => `${prev}${text} `.trim() + ' ');
      interimRef.current = '';
    } else {
      interimRef.current = text;
      setTranscript((prev) => {
        const base = prev.replace(new RegExp(interimRef.current + '$'), '').trim();
        return `${base} ${text}`.trim() + ' ';
      });
    }
  }, []);

  const { isListening, supported, start, stop } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: (msg) => showToast(msg),
  });

  const startInterview = async () => {
    if (!selectedJob) return;
    setErrorMsg('');
    setPhase('generating');
    try {
      const role = selectedJob.job_title || 'Software Engineer';
      const generated = await generateQuestions(role, 'medium', 'mixed', TOTAL_QUESTIONS);
      setQuestions(generated.slice(0, TOTAL_QUESTIONS));
      setAnswers(new Array(TOTAL_QUESTIONS).fill(''));
      answersRef.current = new Array(TOTAL_QUESTIONS).fill('');
      setCurrentIndex(0);
      setTranscript('');
      setLastRating(null);
      setPhase('voice');
      setPhaseVoice('speaking');
    } catch {
      setErrorMsg('Could not generate questions. Try again.');
      setPhase('select');
    }
  };

  const currentQuestion = questions[currentIndex]?.question;

  useEffect(() => {
    if (phase !== 'voice' || !currentQuestion || phaseVoice !== 'speaking') return;
    if (spokenIndexRef.current === currentIndex) return;
    spokenIndexRef.current = currentIndex;

    speak(currentQuestion, () => {
      setPhaseVoice('listening');
      setTranscript('');
      interimRef.current = '';
      start();
    });

    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [phase, currentIndex, phaseVoice, currentQuestion, start]);

  const finishAnswer = () => {
    stop();
    const answer = transcript.trim();
    const rated = rateSingleAnswer(questions[currentIndex], answer);
    const nextAnswers = [...answersRef.current];
    nextAnswers[currentIndex] = answer;
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
    setLastRating(rated);
    setPhaseVoice('feedback');
  };

  const goNextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      finishInterview(nextAnswersFromRef());
      return;
    }
    setCurrentIndex((i) => i + 1);
    setTranscript('');
    setLastRating(null);
    setPhaseVoice('speaking');
  };

  const nextAnswersFromRef = () => answersRef.current;

  const finishInterview = async (finalAnswers) => {
    setPhase('evaluating');
    stop();
    window.speechSynthesis?.cancel();
    const role = selectedJob?.job_title || 'Candidate';
    try {
      const evalResults = await evaluateAnswers(role, questions, finalAnswers);
      const mindMap = buildMindMapText(selectedJob, questions, finalAnswers, evalResults);
      const summaryText = [
        `Overall Score: ${evalResults.overall_score}/100`,
        '',
        'Strengths:',
        evalResults.strengths,
        '',
        'Areas to improve:',
        evalResults.improvements,
        '',
        'Study topics:',
        ...(evalResults.study_topics || []).map((t) => `• ${t}`),
      ].join('\n');

      const payload = {
        job: selectedJob,
        questions,
        answers: finalAnswers,
        results: { ...evalResults, summaryText, mindMap },
      };

      saveSession(payload);
      saveInterviewToFiles({
        job: selectedJob,
        results: { summaryText },
        mindMapContent: mindMap,
      });
      setResults({ ...evalResults, summaryText, mindMap });
      setPhase('results');
    } catch {
      setErrorMsg('Evaluation failed.');
      setPhase('results');
    }
  };

  const resetAll = () => {
    stop();
    window.speechSynthesis?.cancel();
    spokenIndexRef.current = -1;
    setPhase('select');
    setSelectedJob(null);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers([]);
    setTranscript('');
    setLastRating(null);
    setResults(null);
    setErrorMsg('');
  };

  const progress = questions.length ? ((currentIndex + (phaseVoice === 'feedback' ? 1 : 0)) / questions.length) * 100 : 0;

  return (
    <ChatLayout>
      <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
        {phase === 'select' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-purple-400" size={22} />
              <h1 className="text-2xl font-bold text-white">Mock Interview</h1>
            </div>
            <p className="text-white/50 mb-8">Which job do you want to prepare for?</p>

            {errorMsg && (
              <p className="text-red-400 text-sm mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                {errorMsg}
              </p>
            )}

            {applications.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
                <Briefcase className="mx-auto text-white/20 mb-4" size={40} />
                <p className="text-white/50 mb-4">No Apply with AI applications yet.</p>
                <button
                  type="button"
                  onClick={() => navigate('/chat')}
                  className="text-purple-400 text-sm hover:underline"
                >
                  Find jobs in chat first
                </button>
              </div>
            ) : (
              <div className="space-y-3 mb-8">
                {applications.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedJob(app)}
                    className={`
                      w-full text-left p-4 rounded-xl border transition-all
                      ${selectedJob?.id === app.id
                        ? 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'}
                    `}
                  >
                    <p className="font-semibold text-white">{app.job_title}</p>
                    <p className="text-sm text-white/50">{app.company}</p>
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              disabled={!selectedJob}
              onClick={startInterview}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 transition-opacity"
            >
              Start Interview
            </button>
          </div>
        )}

        {phase === 'generating' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-purple-400" size={40} />
            <p className="text-white/60">Preparing {TOTAL_QUESTIONS} questions…</p>
          </div>
        )}

        {phase === 'evaluating' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-purple-400" size={40} />
            <p className="text-white/60">Evaluating your answers…</p>
          </div>
        )}

        {phase === 'results' && results && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 max-w-2xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-white mb-2">Interview complete</h2>
            <p className="text-white/50 mb-8">
              {selectedJob?.job_title} at {selectedJob?.company}
            </p>

            <div className="p-6 rounded-2xl border border-purple-500/30 bg-purple-500/10 text-center mb-8">
              <p className="text-[11px] uppercase tracking-wider text-purple-300/80 mb-1">Overall score</p>
              <p className="text-5xl font-bold text-white">{results.overall_score}</p>
              <p className="text-white/40 text-sm">out of 100</p>
            </div>

            <div className="grid gap-4 mb-8">
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <p className="text-[11px] uppercase text-emerald-400/80 mb-2 font-semibold">Strengths</p>
                <p className="text-[14px] text-white/75 leading-relaxed">{results.strengths}</p>
              </div>
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <p className="text-[11px] uppercase text-amber-400/80 mb-2 font-semibold">Weaknesses</p>
                <p className="text-[14px] text-white/75 leading-relaxed">{results.improvements}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] mb-8">
              <p className="text-[11px] uppercase text-white/35 mb-3 font-semibold">Mind map preview</p>
              <pre className="text-[12px] text-white/60 whitespace-pre-wrap font-sans max-h-48 overflow-y-auto custom-scrollbar">
                {results.mindMap?.slice(0, 800)}
                {(results.mindMap?.length || 0) > 800 ? '…' : ''}
              </pre>
              <p className="text-[11px] text-purple-400/70 mt-2">Saved to Files → Interview Notes & Mind Maps</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={resetAll}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/15 text-white/80 hover:bg-white/[0.05]"
              >
                <RotateCcw size={16} /> Try Again
              </button>
              <button
                type="button"
                onClick={() => navigate('/applications')}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold"
              >
                Back to Applications
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {phase === 'voice' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2500] flex flex-col bg-[#050508]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(88,28,135,0.35),transparent_60%)] pointer-events-none" />

              <header className="relative flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <div>
                  <p className="text-[11px] text-purple-400/80 uppercase tracking-wider">Voice Interview</p>
                  <p className="text-sm text-white/70">
                    Question {currentIndex + 1} of {questions.length}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetAll}
                  className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06]"
                >
                  <X size={20} />
                </button>
              </header>

              <div className="relative px-6 pt-2">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              <div className="relative flex-1 flex flex-col items-center justify-center px-6 max-w-2xl mx-auto w-full gap-6 overflow-y-auto custom-scrollbar py-8">
                <div className="w-full p-5 rounded-2xl bg-purple-500/10 border border-purple-500/25">
                  <p className="text-[10px] uppercase text-purple-400/70 mb-2">Question</p>
                  <p className="text-lg text-white/95 leading-relaxed">{currentQuestion}</p>
                  {phaseVoice === 'speaking' && (
                    <p className="text-[11px] text-purple-300/50 mt-2 animate-pulse">AI speaking…</p>
                  )}
                </div>

                <div className="w-full min-h-[100px] p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <p className="text-[10px] uppercase text-white/35 mb-2">Your answer</p>
                  <p className="text-base text-white/80 leading-relaxed">
                    {transcript || (
                      <span className="text-white/25 italic">
                        {phaseVoice === 'listening' && isListening
                          ? 'Listening…'
                          : supported
                            ? 'Waiting for your voice…'
                            : 'Speech not supported — type not available in this mode'}
                      </span>
                    )}
                  </p>
                </div>

                {phaseVoice === 'feedback' && lastRating && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full p-5 rounded-2xl border border-white/10 bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl font-bold text-purple-400">{lastRating.score}</span>
                      <span className="text-white/40 text-sm">/ 10</span>
                    </div>
                    <p className="text-[13px] text-white/70 leading-relaxed whitespace-pre-wrap">
                      {lastRating.feedback}
                    </p>
                  </motion.div>
                )}
              </div>

              <footer className="relative p-6 flex flex-col items-center gap-3 border-t border-white/[0.06]">
                {phaseVoice === 'listening' && (
                  <>
                    <button
                      type="button"
                      onClick={finishAnswer}
                      className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                        isListening
                          ? 'border-red-400/60 text-red-400 bg-red-500/10 animate-pulse-glow'
                          : 'border-purple-400/50 text-purple-300'
                      }`}
                    >
                      {isListening ? <MicOff size={28} /> : <Mic size={28} />}
                    </button>
                    <p className="text-xs text-white/40">Tap when finished answering</p>
                  </>
                )}
                {phaseVoice === 'feedback' && (
                  <button
                    type="button"
                    onClick={goNextQuestion}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold"
                  >
                    {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
                    <ChevronRight size={18} />
                  </button>
                )}
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ChatLayout>
  );
};

export default InterviewPage;
