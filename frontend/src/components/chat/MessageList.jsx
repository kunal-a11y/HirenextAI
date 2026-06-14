import React, { useEffect, useRef, useState } from 'react';
import useChatStore from '../../store/useChatStore';
import useUIStore from '../../store/useUIStore';
import useUserStore from '../../store/useUserStore';
import useAuthStore from '../../store/useAuthStore';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { Puzzle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getDisplayName = () => {
  const stored = localStorage.getItem('hirenext_displayName');
  if (stored?.trim()) return stored.trim();
  const { user } = useUserStore.getState();
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'You';
};

const JobCard = ({ job, applyingJobId, onApplyWithAI }) => {
  const { user, token } = useAuthStore();
  const handleApplyNormal = () => {
    window.open(job.url || '#', '_blank');
  };

  const getButtonText = () => {
    const plan = (user?.plan || 'free').toLowerCase();
    if (plan === 'pro') return 'Apply with AI (10/week)';
    if (plan === 'max' || plan === 'ultimate') return 'Apply with AI (Unlimited)';
    return 'Apply with AI (1/week)';
  };

  return (
    <div className="mt-2 p-4 bg-white/4 border border-white/10 rounded-xl max-w-[400px] animate-slide-up">
      <h4 className="text-[15px] font-semibold text-white mb-1">{job.title}</h4>
      <p className="text-[13px] text-text-secondary mb-3">
        {job.company} • {job.location} • {job.salary}
      </p>
      
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] text-white/60">Match: {job.match}%</span>
      </div>
      <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-white transition-all duration-1000" 
          style={{ width: `${job.match}%` }}
        />
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => onApplyWithAI(job)}
          disabled={applyingJobId === job.id}
          className="flex-1 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white text-[13px] font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          {applyingJobId === job.id ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Checking...
            </>
          ) : (
            getButtonText()
          )}
        </button>
        <button 
          onClick={handleApplyNormal}
          className="px-4 py-2 border border-white/20 text-white/80 text-[13px] rounded-lg hover:bg-white/5 transition-colors"
        >
          Apply normally
        </button>
      </div>
    </div>
  );
};

const AgentReportCard = ({ data }) => {
  const navigate = useNavigate();
  const [showFullImage, setShowFullImage] = useState(false);
  const savedRef = useRef(false);

  useEffect(() => {
    if (savedRef.current || !data?.jobData) return;
    savedRef.current = true;
    
    // Save to DB tracker automatically
    api.post('/api/applications', {
      jobTitle: data.jobData.title,
      company: data.jobData.company,
      location: data.jobData.location || '',
      salary: data.jobData.salary || '',
      status: 'applied',
      matchScore: data.jobData.match ?? null,
      appliedAt: new Date()
    }).catch(err => console.error('Failed to save agent report application tracker:', err));
  }, [data]);

  return (
    <div className="mt-2 p-5 bg-[#111111] border border-white/10 rounded-2xl max-w-[450px] shadow-2xl animate-slide-up relative">
      <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
        <span className="text-xl">🤖</span>
        <h4 className="text-[15px] font-bold text-white">AI Agent Report</h4>
      </div>

      <div className="mb-4">
        <div className="flex items-start gap-2 mb-1">
          <span className="text-green-400 mt-0.5">✅</span>
          <p className="text-[14px] text-white/90 leading-relaxed font-medium">
            Form filled for:<br/>
            <span className="text-white font-bold">{data.jobData?.title}</span> at <span className="text-white/80">{data.jobData?.company}</span>
          </p>
        </div>
      </div>

      {data.screenshot && (
        <div className="mb-4 cursor-pointer group" onClick={() => setShowFullImage(true)}>
          <div className="relative rounded-lg overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors">
            <img 
              src={data.screenshot} 
              alt="Form filled screenshot" 
              className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-semibold px-3 py-1.5 bg-black/50 rounded-lg backdrop-blur-sm">Click to view full screenshot</span>
            </div>
          </div>
        </div>
      )}

      <p className="text-[13px] text-white/60 mb-5">
        Please review the details and submit your application manually.
      </p>

      <div className="flex gap-3">
        <button 
          onClick={() => navigate('/applications')}
          className="flex-1 px-4 py-2.5 bg-white text-black text-[13px] font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/5"
        >
          View Application
        </button>
      </div>

      {showFullImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer" onClick={() => setShowFullImage(false)}>
          <img 
            src={data.screenshot} 
            alt="Full screenshot" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg border border-white/20"
          />
        </div>
      )}
    </div>
  );
};

const MessageItem = ({ message, applyingJobId, onApplyWithAI }) => {
  // Try to parse message content for Agent Report
  let parsedContent = null;
  let isAgentReport = false;
  let displayContent = message.content;

  try {
    const json = JSON.parse(message.content);
    if (json && json.type === 'ai_agent_report') {
      isAgentReport = true;
      parsedContent = json;
      displayContent = json.text;
    }
  } catch (e) {
    // normal text message
  }

  // The database might store role as 'ai' or 'assistant'. Handle both.
  const isAI = message.role === 'assistant' || message.role === 'ai';

  return (
    <div className={`flex w-full mb-6 ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex gap-3 max-w-[85%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        {isAI && (
          <div className="w-8 h-8 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0 shadow-lg mt-1">
            H
          </div>
        )}
        <div className={`flex flex-col min-w-0 ${!isAI ? 'items-end' : ''}`}>
          {!isAI && !isAgentReport && (
            <span className="text-[12px] text-[#8B5CF6] font-semibold mb-1.5 mr-1">
              {getDisplayName()}
            </span>
          )}
          {!isAgentReport && (
            <div className={`
              px-5 py-3.5 rounded-2xl text-[14px] leading-relaxed break-words shadow-sm
              ${isAI 
                ? 'bg-[#1a1a1a] border border-[rgba(139,92,246,0.1)] text-white/90 rounded-tl-sm' 
                : 'bg-white text-black font-medium rounded-tr-sm'}
            `}>
              {displayContent}
            </div>
          )}
          {isAgentReport && <AgentReportCard data={parsedContent} />}
          {message.job && (
            <JobCard 
              job={message.job} 
              applyingJobId={applyingJobId} 
              onApplyWithAI={onApplyWithAI} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

const MessageList = () => {
  const { messages, isTyping } = useChatStore();
  const { user } = useAuthStore();
  const { showToast } = useUIStore();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);

  const checkExtensionInstalled = () => {
    return new Promise((resolve) => {
      const extId = import.meta.env.VITE_EXTENSION_ID || 'YOUR_EXTENSION_ID_HERE';
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        try {
          chrome.runtime.sendMessage(
            extId,
            { type: 'PING' },
            (response) => {
              if (chrome.runtime.lastError) {
                resolve(false);
              } else {
                resolve(true);
              }
            }
          );
        } catch(e) {
          resolve(false);
        }
      } else {
        resolve(false);
      }
      setTimeout(() => resolve(false), 1000);
    });
  };

  const handleApplyWithAI = async (job) => {
    setApplyingJobId(job.id);
    const isInstalled = await checkExtensionInstalled();
    
    if (!isInstalled) {
      setShowExtensionModal(true);
      setSelectedJob(job);
      setApplyingJobId(null);
      return;
    }
    
    // Save to applications tracker automatically
    try {
      await api.post('/api/applications/apply-with-ai', {
        jobTitle: job.title,
        company: job.company,
        location: job.location || '',
        salary: job.salary || '',
        matchScore: job.match || 90
      });
    } catch (err) {
      console.error('Failed to save application tracker:', err);
    }

    // Trigger extension
    try {
      const extId = import.meta.env.VITE_EXTENSION_ID || 'YOUR_EXTENSION_ID_HERE';
      chrome.runtime.sendMessage(extId, {
        type: 'APPLY_WITH_AI',
        token: token || localStorage.getItem('token'),
        job: {
          title: job.title,
          company: job.company,
          url: job.url,
        },
        userProfile: {
          ...user,
          name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          phone: user?.phone || '',
          linkedin_url: user?.linkedinUrl || '',
          indeed_url: user?.indeedUrl || '',
          naukri_url: user?.naukriUrl || '',
          github_url: user?.githubUrl || '',
          years_experience: user?.experience || '',
          skills: user?.skills || ''
        },
      });
    } catch (e) {
      console.error('Failed to send message to extension:', e);
    }
    
    setApplyingJobId(null);
    showToast('Extension activated! Opening application form...');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div 
      ref={scrollRef}
      className="h-full overflow-y-auto px-6 py-6 custom-scrollbar chat-messages-scrollbar relative"
    >
      <div className="max-w-4xl mx-auto flex flex-col">
        {messages.map((msg) => (
          <MessageItem 
            key={msg.id} 
            message={msg} 
            applyingJobId={applyingJobId}
            onApplyWithAI={handleApplyWithAI}
          />
        ))}
        
        {isTyping && (
          <div className="flex justify-start mb-6 animate-fade-in">
            <div className="flex gap-3 max-w-[75%]">
              <div className="w-8 h-8 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0 shadow-lg mt-1">
                H
              </div>
              <div className="px-5 py-4 bg-[#1a1a1a] border border-[rgba(139,92,246,0.1)] rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Extension Not Installed Modal Overlay */}
      <AnimatePresence>
        {showExtensionModal && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExtensionModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative z-10 w-full max-w-md bg-[#0f0f1a] border border-[#8B5CF6]/30 rounded-2xl p-8 text-center"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] mb-4"
              >
                <Puzzle size={24} />
              </motion.div>
              
              <h2 className="text-xl font-bold text-white mb-2">Install Extension to Apply with AI</h2>
              <p className="text-white/50 text-sm mb-6">
                To apply with AI, you need the HirenextAI Chrome extension. It takes 30 seconds to install.
              </p>
              
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl mb-6 text-left">
                <p className="text-white/60 text-xs mb-2">You were trying to apply for:</p>
                <p className="text-white font-semibold text-sm">
                  {selectedJob.title} <span className="text-white/40 font-normal">at</span> {selectedJob.company}
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/extension');
                    setShowExtensionModal(false);
                    setTimeout(() => {
                      navigate('/chat');
                    }, 3000);
                  }}
                  className="w-full h-11 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 hover:opacity-95 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
                >
                  Download Extension
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowExtensionModal(false)}
                  className="w-full h-11 border border-white/10 bg-white/5 text-white text-sm font-semibold rounded-xl hover:bg-white/10 transition-all"
                >
                  Maybe later
                </button>
              </div>
              
              <p className="text-white/25 text-xs mt-4">
                After installing, come back and click Apply with AI again
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageList;
