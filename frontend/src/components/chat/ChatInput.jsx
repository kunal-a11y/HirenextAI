import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Send, Mic, MicOff, AudioLines, X, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import useChatStore from '../../store/useChatStore';
import useUIStore from '../../store/useUIStore';
import FileUploadMenu from './FileUploadMenu';
import ModelSelector from './ModelSelector';
import api from '../../lib/api';



const ChatInput = ({ embedded = false, className = '', demo = false }) => {
  const { t } = useTranslation();
  const { sendMessage, selectedModel, setSelectedModel, messages, isTyping, startNewChat, currentChatId } = useChatStore();
  const { plusPopupOpen, setPlusPopupOpen, showToast } = useUIStore();

  const [input, setInput] = useState('');
  const [modelOpen, setModelOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [credits, setCredits] = useState(null);

  const fetchCredits = async () => {
    if (demo) return;
    try {
      const res = await api.get('/api/user/credits');
      setCredits(res.data);
    } catch (err) {
      console.error('Failed to fetch credits:', err);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [messages, demo]);
  
  // Voice to Voice and Voice to Text states
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [lastSpokenMessageId, setLastSpokenMessageId] = useState('');
  
  const textareaRef = useRef(null);
  const dictationBaseRef = useRef('');
  const dictationFinalRef = useRef('');

  // Refs for tracking values inside SpeechRecognition async event handlers
  const isVoiceModeRef = useRef(false);
  const voiceTranscriptRef = useRef('');
  const inputRef = useRef('');
  const isMutedRef = useRef(false);
  const lastSpokenMessageIdRef = useRef('');

  // Timers and Recognition Refs
  const recognitionRef = useRef(null);
  const voiceTimerRef = useRef(null);
  const voiceTimeoutRef = useRef(null);
  const autoSendTimeoutRef = useRef(null);

  useEffect(() => {
    isVoiceModeRef.current = isVoiceMode;
  }, [isVoiceMode]);

  useEffect(() => {
    voiceTranscriptRef.current = voiceTranscript;
  }, [voiceTranscript]);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    lastSpokenMessageIdRef.current = lastSpokenMessageId;
  }, [lastSpokenMessageId]);

  // Synchronize sessionSeconds to sessionStorage so that cleanup hook always gets latest value
  useEffect(() => {
    sessionStorage.setItem('hn_v2v_seconds', String(sessionSeconds));
  }, [sessionSeconds]);

  // Restore Voice session if transitioning from greeting screen to chat messages view
  // Also check if GEMINI_API_KEY is configured on the backend
  useEffect(() => {
    window.chatInputMounted = true;
    
    if (window.activeVoiceSession) {
      const session = window.activeVoiceSession;
      
      setIsVoiceMode(true);
      setIsMuted(session.isMuted);
      setVoiceTranscript(session.voiceTranscript);
      setSessionSeconds(session.sessionSeconds);
      setLastSpokenMessageId(session.lastSpokenMessageId);
      
      recognitionRef.current = session.recognition;
      voiceTimerRef.current = session.voiceTimer;
      voiceTimeoutRef.current = session.voiceTimeout;
      autoSendTimeoutRef.current = session.autoSendTimeout;
      
      // Clear global reference
      delete window.activeVoiceSession;
    }

    const checkConfig = async () => {
      try {
        const res = await api.get('/api/ai/config-check');
        if (res.data && res.data.hasGeminiKey === false) {
          showToast('AI service not configured. Please add GEMINI_API_KEY to backend .env');
        }
      } catch (err) {
        console.error('Failed to check AI config:', err);
      }
    };
    checkConfig();
  }, [showToast]);

  // Monitor 2-minute demo timer on /demo
  useEffect(() => {
    if (window.location.pathname === '/demo') {
      let demoStartTime = window.demoStartTime;
      if (!demoStartTime) {
        demoStartTime = Date.now();
        window.demoStartTime = demoStartTime;
      }
      
      const elapsed = Date.now() - demoStartTime;
      const remaining = 120 * 1000 - elapsed;
      
      if (remaining <= 0) {
        setIsVoiceMode(false);
        try {
          recognitionRef.current?.stop();
        } catch(e) {}
        window.speechSynthesis?.cancel();
      } else {
        const timer = setTimeout(() => {
          setIsVoiceMode(false);
          try {
            recognitionRef.current?.stop();
          } catch(e) {}
          window.speechSynthesis?.cancel();
        }, remaining);
        return () => clearTimeout(timer);
      }
    } else {
      delete window.demoStartTime;
    }
  }, []);

  // Listen for global clicks on "Exit Demo" to stop session immediately
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const exitBtn = e.target.closest('button');
      if (exitBtn && (exitBtn.textContent?.includes('Exit Demo') || exitBtn.innerText?.includes('Exit Demo'))) {
        setIsVoiceMode(false);
        try {
          recognitionRef.current?.stop();
        } catch(e) {}
        window.speechSynthesis?.cancel();
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // Request Microphone Permission
  const requestMicPermission = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice input is not supported in this browser. Please use Chrome.');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      console.error('Mic permission denied:', err);
      showToast('Microphone access denied. Please allow microphone in browser settings.');
      return false;
    }
  };

  const setTranscript = (text) => {
    if (isVoiceModeRef.current) {
      setVoiceTranscript(text);
    } else {
      setInput(text);
    }
  };

  const autoSendVoiceMessage = async (text) => {
    if (!text.trim()) return;
    
    if (demo) {
      window.dispatchEvent(new CustomEvent('hn-demo-signup'));
      return;
    }
    await sendMessage(text);
    setVoiceTranscript('');
  };

  const speakResponse = (text) => {
    if (!text || isMutedRef.current) {
      // If muted, restart listening immediately
      setTimeout(() => {
        if (isVoiceModeRef.current) {
          try {
            window.isMicStarting = true;
            recognitionRef.current?.start();
          } catch(e) {}
        }
      }, 300);
      return;
    }
    
    window.speechSynthesis.cancel(); // cancel any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = isMutedRef.current ? 0 : 1;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';
    
    utterance.onend = () => {
      // After AI finishes speaking → restart listening
      if (isVoiceModeRef.current) {
        setTimeout(() => {
          try {
            window.isMicStarting = true;
            recognitionRef.current?.start();
          } catch(e) {}
        }, 300);
      }
    };
    
    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      if (isVoiceModeRef.current) {
        setTimeout(() => {
          try {
            window.isMicStarting = true;
            recognitionRef.current?.start();
          } catch(e) {}
        }, 300);
      }
    };
    
    window.speechSynthesis.speak(utterance);
  };

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      let recognition = recognitionRef.current;
      if (!recognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;
      }

      recognition.onstart = () => {
        setIsListening(true);
        if (!isVoiceModeRef.current) {
          dictationBaseRef.current = inputRef.current;
          dictationFinalRef.current = '';
        }

        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          try {
            recognition.start();
          } catch(e) {}
        }
      };

      recognition.onspeechstart = () => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          try {
            recognition.start();
          } catch(e) {}
        }
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (!isVoiceModeRef.current && finalTranscript) {
          dictationFinalRef.current += finalTranscript;
        }

        const combined = isVoiceModeRef.current
          ? `${voiceTranscriptRef.current || ''}${finalTranscript}${interimTranscript}`.trim()
          : `${dictationBaseRef.current}${dictationFinalRef.current}${interimTranscript}`.trim();

        if (combined) {
          setTranscript(combined);
        }

        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          try {
            recognition.start();
          } catch(e) {}
        }
      };

      recognition.onerror = (event) => {
        console.error('Recognition error:', event.error);
        if (event.error === 'not-allowed') {
          showToast('Microphone blocked. Click the mic icon in your browser address bar to allow access.');
        } else if (event.error === 'no-speech') {
          // no-op
        } else {
          showToast('Voice error: ' + event.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);

        const transcript = isVoiceModeRef.current
          ? voiceTranscriptRef.current
          : `${dictationBaseRef.current}${dictationFinalRef.current}`.trim() || inputRef.current;

        if (!isVoiceModeRef.current && transcript?.trim()) {
          setInput(transcript.trim());
        }

        if (isVoiceModeRef.current) {
          if (transcript && transcript.trim().length > 0) {
            autoSendTimeoutRef.current = setTimeout(() => {
              autoSendVoiceMessage(transcript);
            }, 800);
          } else {
            autoSendTimeoutRef.current = setTimeout(() => {
              if (isVoiceModeRef.current) {
                try {
                  window.isMicStarting = true;
                  recognitionRef.current?.start();
                } catch(e) {}
              }
            }, 500);
          }
        }
      };
    }

    return () => {
      // Check if we are still on chat or demo pages to verify if this is a transition
      const isStillInChatOrDemo = window.location.pathname.startsWith('/chat') || window.location.pathname.startsWith('/demo');
      
      if (isVoiceModeRef.current && isStillInChatOrDemo) {
        window.activeVoiceSession = {
          isVoiceMode: true,
          isMuted: isMutedRef.current,
          voiceTranscript: voiceTranscriptRef.current,
          sessionSeconds: parseInt(sessionStorage.getItem('hn_v2v_seconds') || '0', 10),
          lastSpokenMessageId: lastSpokenMessageIdRef.current,
          recognition: recognitionRef.current,
          voiceTimer: voiceTimerRef.current,
          voiceTimeout: voiceTimeoutRef.current,
          autoSendTimeout: autoSendTimeoutRef.current
        };
        
        // Schedule cleanup in case transition doesn't complete
        setTimeout(() => {
          if (!window.chatInputMounted) {
            try {
              window.activeVoiceSession?.recognition?.stop();
            } catch(e) {}
            window.speechSynthesis?.cancel();
            if (window.activeVoiceSession?.voiceTimer) clearInterval(window.activeVoiceSession.voiceTimer);
            if (window.activeVoiceSession?.voiceTimeout) clearTimeout(window.activeVoiceSession.voiceTimeout);
            if (window.activeVoiceSession?.autoSendTimeout) clearTimeout(window.activeVoiceSession.autoSendTimeout);
            delete window.activeVoiceSession;
          }
        }, 100);
      } else {
        recognitionRef.current?.stop();
        window.speechSynthesis?.cancel();
      }
      
      window.chatInputMounted = false;
    };
  }, []);



  // Watch for new assistant messages to speak them in voice mode
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    
    if (!isVoiceMode) return;
    
    if (lastMessage.role === 'assistant' && lastMessage.id !== lastSpokenMessageId) {
      setLastSpokenMessageId(lastMessage.id);
      speakResponse(lastMessage.content);
    }
  }, [messages, isVoiceMode, lastSpokenMessageId]);

  const startVoiceToText = async () => {
    if (demo) {
      window.dispatchEvent(new CustomEvent('hn-demo-signup'));
      return;
    }
    const hasPermission = await requestMicPermission();
    if (!hasPermission) return;
    
    try {
      window.isMicStarting = true;
      recognitionRef.current?.start();
    } catch (err) {
      // If already started, stop first then restart
      recognitionRef.current?.stop();
      setTimeout(() => {
        try {
          window.isMicStarting = true;
          recognitionRef.current?.start();
        } catch(e) {}
      }, 100);
    }
  };

  const startVoiceToVoice = async () => {
    if (demo) {
      window.dispatchEvent(new CustomEvent('hn-demo-signup'));
      return;
    }
    const hasPermission = await requestMicPermission();
    if (!hasPermission) return;
    
    setIsVoiceMode(true);
    setVoiceTranscript('');
    setSessionSeconds(0);
    
    try {
      window.isMicStarting = true;
      recognitionRef.current?.start();
    } catch (err) {
      recognitionRef.current?.stop();
      setTimeout(() => {
        try {
          window.isMicStarting = true;
          recognitionRef.current?.start();
        } catch(e) {}
      }, 100);
    }

    // Setup 10-minute timeout
    if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
    voiceTimeoutRef.current = setTimeout(() => {
      exitVoiceMode();
      showToast('Voice session ended after 10 minutes');
    }, 10 * 60 * 1000);

    // Setup session timer counting up and auto-ending at 10:00 (600s)
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    voiceTimerRef.current = setInterval(() => {
      setSessionSeconds((prev) => {
        const next = prev + 1;
        if (next >= 600) {
          clearInterval(voiceTimerRef.current);
          exitVoiceMode();
          showToast('Voice session ended after 10 minutes');
          return 600;
        }
        return next;
      });
    }, 1000);
  };

  const exitVoiceMode = useCallback(() => {
    setIsVoiceMode(false);
    setVoiceTranscript('');
    setSessionSeconds(0);
    setIsMuted(false); // Reset mute state
    sessionStorage.removeItem('hn_v2v_seconds');

    // Stop recognition + synthesis
    try {
      recognitionRef.current?.stop();
    } catch(e) {}
    window.speechSynthesis?.cancel();

    // Clear timers
    if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    if (autoSendTimeoutRef.current) clearTimeout(autoSendTimeoutRef.current);
  }, []);

  // Manage timer interval when isVoiceMode changes (recovers timer correctly on remount transition)
  useEffect(() => {
    if (isVoiceMode) {
      if (!voiceTimerRef.current) {
        voiceTimerRef.current = setInterval(() => {
          setSessionSeconds((prev) => {
            const next = prev + 1;
            if (next >= 600) {
              clearInterval(voiceTimerRef.current);
              exitVoiceMode();
              showToast('Voice session ended after 10 minutes');
              return 600;
            }
            return next;
          });
        }, 1000);
      }
    } else {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
      voiceTimerRef.current = null;
      voiceTimeoutRef.current = null;
    }
  }, [isVoiceMode, exitVoiceMode, showToast]);

  const handleMicToggle = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      startVoiceToText();
    }
  };

  const toggleVoiceToText = handleMicToggle;

  const handleSend = () => {
    if (!input.trim()) return;
    if (demo) {
      window.dispatchEvent(new CustomEvent('hn-demo-signup'));
      return;
    }
    try {
      recognitionRef.current?.stop();
    } catch(e) {}
    sendMessage(input.trim());
    setInput('');
    dictationBaseRef.current = '';
    dictationFinalRef.current = '';
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (file) => {
    showToast(`Attached: ${file.name}`);
    setInput((prev) => {
      const note = prev ? `${prev}\n` : '';
      return `${note}[Attached file: ${file.name}]`;
    });
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  const formatVoiceTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const canSend = input.trim().length > 0;
  const hasActiveGlow = isFocused || isListening || input.length > 0;

  const inputGlowClass = isListening
    ? 'border-[#8B5CF6]/40 shadow-[0_0_20px_rgba(139,92,246,0.15)] bg-white/[0.03]'
    : hasActiveGlow
      ? 'border-[rgba(139,92,246,0.8)] shadow-[0_0_25px_rgba(139,92,246,0.25),0_0_50px_rgba(139,92,246,0.1)] bg-white/[0.03]'
      : isHovered
        ? 'border-[rgba(139,92,246,0.6)] shadow-[0_0_20px_rgba(139,92,246,0.15),0_0_40px_rgba(139,92,246,0.08)] bg-white/[0.03]'
        : 'border-white/10 shadow-lg shadow-black/20 bg-white/[0.02]';

  return (
    <div
      className={
        embedded
          ? `relative w-full ${className}`
          : `relative px-4 pb-4 pt-2 bg-gradient-to-t from-background via-background/95 to-transparent`
      }
    >
      <style>{`
        @keyframes micPulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5); }
          70% { box-shadow: 0 0 0 12px rgba(255, 255, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
        @keyframes micRedPulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes voiceBounce {
          0%, 100% { height: 4px; }
          50% { height: 24px; }
        }
        .mic-listening {
          animation: micPulse 1.2s ease-out infinite;
        }
        .mic-muted {
          animation: micRedPulse 1.5s ease-out infinite;
        }
        .animate-voice-bounce {
          animation: voiceBounce 0.8s ease-in-out infinite;
        }
      `}</style>
      <div className={embedded ? 'w-full' : 'max-w-3xl mx-auto'}>
        <div
          className={`chat-input-bar rounded-2xl border transition-all duration-300 ease-in-out !overflow-visible 
            ${isVoiceMode 
              ? 'bg-[#1a0a2e] border-[#8B5CF6]/60 shadow-[0_0_30px_rgba(139,92,246,0.3)]' 
              : inputGlowClass}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isVoiceMode ? (
            /* Voice to voice active content */
            <div className="px-4 py-3.5 flex items-center justify-between gap-4 relative z-10">
              {/* Left side: animated waveform bars (5 bars, purple, bouncing animation) */}
              <div className="flex items-center gap-2 h-8 shrink-0">
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-colors duration-300 ${isListening ? 'bg-[#8B5CF6]' : 'bg-[#3B82F6]'} animate-voice-bounce`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                {isMuted && (
                  <span className="text-[11px] text-rose-400 font-medium px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                    🔇 Muted
                  </span>
                )}
              </div>

              {/* Center: live transcript text */}
              <div className="flex-1 min-w-0">
                {voiceTranscript ? (
                  <span className="text-white/80 text-sm italic block truncate">
                    {voiceTranscript}
                  </span>
                ) : (
                  <span className="text-white/30 text-sm block">
                    Listening...
                  </span>
                )}
              </div>

              {/* Right side: X button to cancel voice mode */}
              <button
                type="button"
                onClick={exitVoiceMode}
                className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors shrink-0"
                aria-label="Cancel voice mode"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            /* Normal input content */
            <>
              <div className="px-4 pt-3 pb-1 relative z-0 isolate">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={isListening ? "Listening... speak now" : "How can I help you find your dream job today?"}
                  rows={1}
                  className={`
                    w-full bg-transparent border-none outline-none resize-none
                    text-[15px] text-white placeholder:text-white/25
                    max-h-[200px] custom-scrollbar leading-relaxed
                    ${isListening ? 'placeholder:text-purple-400/50' : ''}
                  `}
                />
              </div>

              <div className="relative z-10 flex items-center justify-between gap-2 px-2 pb-2 pt-1 border-t border-white/[0.05] overflow-visible">
                <div className="flex items-center gap-1">
                  <div className="relative shrink-0">
                    <FileUploadMenu onFileSelect={handleFileSelect} positionedByParent />
                    <button
                      type="button"
                      data-plus-trigger
                      onClick={() => setPlusPopupOpen(!plusPopupOpen)}
                      className={`
                        p-2 rounded-xl transition-all relative z-[1]
                        ${plusPopupOpen
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'text-white/45 hover:text-white hover:bg-white/[0.06]'}
                      `}
                      aria-label="Attach file"
                      aria-expanded={plusPopupOpen}
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <ModelSelector
                    selectedModel={selectedModel}
                    onSelect={setSelectedModel}
                    open={modelOpen}
                    onOpenChange={setModelOpen}
                  />
                </div>

                <div className="flex items-center gap-0.5">
                  <div className="relative flex items-center justify-center">
                    {isListening && (
                      <span className="absolute inset-0 rounded-full animate-ping bg-white/50" aria-hidden />
                    )}
                    <button
                      type="button"
                      onClick={toggleVoiceToText}
                      title={isListening ? 'Stop listening' : 'Voice to text'}
                      aria-label={isListening ? 'Stop listening' : 'Voice to text'}
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isListening
                          ? 'bg-white/15 border border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.35)]'
                          : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      {isListening
                        ? <Mic className="w-4 h-4 text-white" />
                        : <Mic className="w-4 h-4" />
                      }
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isVoiceMode) {
                        exitVoiceMode();
                      } else {
                        startVoiceToVoice();
                      }
                    }}
                    title="Voice to Voice"
                    className={`p-2 rounded-xl transition-all ${isVoiceMode ? 'bg-[#8B5CF6]/20 text-purple-300' : 'text-white/45 hover:text-purple-300 hover:bg-purple-500/10'}`}
                    aria-label="Start voice conversation"
                  >
                    <AudioLines size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!canSend}
                    className={`
                      p-2.5 rounded-xl transition-all duration-300 ml-0.5
                      ${canSend
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:shadow-[0_0_22px_rgba(139,92,246,0.65)] hover:scale-[1.03] active:scale-[0.98] animate-pulse-glow'
                        : 'bg-white/[0.06] text-white/20 cursor-not-allowed'}
                    `}
                    aria-label="Send message"
                  >
                    <Send size={18} className={canSend ? 'translate-x-[-1px]' : ''} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Voice mode controls */}
        {isVoiceMode && (
          <div className="flex items-center gap-3 px-4 py-2">
            {!isMuted ? (
              <button
                type="button"
                onClick={() => setIsMuted(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 transition-all"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Mute AI
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsMuted(false)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs"
              >
                <VolumeX className="w-3.5 h-3.5" />
                Unmute AI
              </button>
            )}

            <button
              type="button"
              onClick={exitVoiceMode}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs hover:bg-white/10 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              End session
            </button>

            <span className={`text-xs font-mono ml-auto ${
              sessionSeconds >= 570
                ? 'text-red-500 font-semibold'
                : sessionSeconds >= 480
                  ? 'text-amber-500 font-semibold'
                  : 'text-white/30'
            }`}>
              {formatVoiceTime(sessionSeconds)}
            </span>
          </div>
        )}

        {!embedded && !isVoiceMode && (
          <div className="flex flex-col items-center">
            {credits && (() => {
              const { plan, credits: userCredits } = credits;
              const dailyUsed = userCredits?.daily?.used ?? 0;
              const dailyLimit = userCredits?.daily?.limit ?? 5;
              const isFree = !plan || plan.toLowerCase() === 'free';
              const limitReached = dailyLimit !== -1 && dailyUsed >= dailyLimit;

              if (limitReached) {
                return (
                  <div className="text-xs text-red-500 text-center mt-1 font-semibold">
                    Daily limit reached — Upgrade for more
                  </div>
                );
              }

              if (isFree) {
                return (
                  <div className="text-xs text-white/30 text-center mt-1">
                    {dailyUsed}/5 AI messages today
                  </div>
                );
              } else {
                return (
                  <div className="text-xs text-white/30 text-center mt-1">
                    {dailyUsed} messages today
                  </div>
                );
              }
            })()}
            <p className="text-center text-[11px] text-white/20 mt-2">
              HirenextAI can make mistakes. Verify important information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
