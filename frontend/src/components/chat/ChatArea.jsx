import { useState, useEffect } from 'react';
import { MoreHorizontal, Share2, Pin, Archive, Trash2, AlertCircle } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import useUserStore from '../../store/useUserStore';
import useUIStore from '../../store/useUIStore';
import { useTranslation } from '../../hooks/useTranslation';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useNavigate } from 'react-router-dom';
import { getPlanDisplay } from '../../lib/planUtils';

const DeleteConfirmModal = ({ onConfirm, onCancel, t }) => (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-[#111111] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up">
      <div className="flex items-center gap-3 mb-4 text-red-400">
        <AlertCircle size={24} />
        <h3 className="text-lg font-bold text-white">{t('deleteChat')}?</h3>
      </div>
      <p className="text-white/60 text-sm mb-6">This action cannot be undone. All messages in this conversation will be permanently removed.</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
        >
          {t('deleteChat')}
        </button>
      </div>
    </div>
  </div>
);

const ChatArea = ({ demo }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { messages, currentChatId, sendMessage, deleteChat, pinChat, archiveChat, chats } = useChatStore();
  const { user } = useUserStore();
  const { setPricingModalOpen, showToast } = useUIStore();

  const [greetingKey, setGreetingKey] = useState('goodMorning');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.chat-menu-container')) {
        setMenuOpen(false);
        setArchiveConfirm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setShowDeleteModal(false);
        setArchiveConfirm(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreetingKey('goodMorning');
    else if (hour >= 12 && hour < 17) setGreetingKey('goodAfternoon');
    else if (hour >= 17 && hour < 21) setGreetingKey('goodEvening');
    else setGreetingKey('goodNight');
  }, []);

  const handleShare = () => {
    const shareLink = `https://hirenextai.com/chat/share/${currentChatId}`;
    navigator.clipboard.writeText(shareLink);
    showToast(t('linkCopied'));
    setMenuOpen(false);
  };

  const handlePin = () => {
    const isPinned = pinChat(currentChatId);
    showToast(isPinned ? t('chatPinned') : t('chatUnpinned'));
    setMenuOpen(false);
  };

  const handleArchive = () => {
    if (!archiveConfirm) {
      setArchiveConfirm(true);
      return;
    }
    archiveChat(currentChatId);
    showToast(t('chatArchived'));
    setMenuOpen(false);
    setArchiveConfirm(false);
    navigate('/chat');
  };

  const handleConfirmDelete = () => {
    deleteChat(currentChatId);
    setShowDeleteModal(false);
    setMenuOpen(false);
    showToast(t('chatDeleted'));
    navigate('/chat');
  };

  const quickActions = [
    { key: 'findJobs', text: t('findJobs') },
    { key: 'reviewResume', text: t('reviewResume') },
    { key: 'mockInterview', text: t('mockInterview') },
    { key: 'careerAdvice', text: t('careerAdvice') },
  ];

  const currentChat = chats.find((c) => c.id === currentChatId);
  const hasConversation = messages.length > 0;

  if (hasConversation) {
    return (
      <div className="flex flex-col h-full bg-background animate-fade-in relative">
        {showDeleteModal && (
          <DeleteConfirmModal
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteModal(false)}
            t={t}
          />
        )}

        <header className="h-14 border-bottom border-border flex items-center justify-between px-6">
          <div className="flex-1" />
          <h1 className="text-sm font-medium text-white/80">
            HirenextAI
            {demo && (
              <span className="text-[#8B5CF6] text-sm font-normal">/ {user.firstName}</span>
            )}
          </h1>
          <div className="flex-1 flex justify-end items-center gap-3">
            <button
              onClick={() => setPricingModalOpen(true)}
              data-demo-lock="true"
              className="px-3 py-1 bg-white/6 border border-white/10 rounded-full text-[12px] text-white hover:bg-white/10 transition-colors"
            >
              {getPlanDisplay(user.plan)}
            </button>
            <div className="relative chat-menu-container">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`p-1 transition-colors ${menuOpen ? 'text-white' : 'text-text-secondary hover:text-white'}`}
              >
                <MoreHorizontal size={18} />
              </button>

              {menuOpen && (
                <div className="absolute top-full right-0 mt-2 w-[200px] bg-[#1e1e1e] border border-white/10 rounded-[10px] p-1.5 shadow-2xl z-50 animate-fade-in">
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center gap-[10px] px-3 py-2.5 rounded-md text-[13px] text-white/80 hover:bg-white/6 transition-colors"
                  >
                    <Share2 size={16} className="text-text-secondary" />
                    <span>{t('shareChat')}</span>
                  </button>
                  <button
                    onClick={handlePin}
                    className="w-full flex items-center gap-[10px] px-3 py-2.5 rounded-md text-[13px] text-white/80 hover:bg-white/6 transition-colors"
                  >
                    <Pin
                      size={16}
                      className={currentChat?.pinned ? 'text-blue-400 fill-blue-400' : 'text-text-secondary'}
                    />
                    <span>{currentChat?.pinned ? t('chatUnpinned') : t('pinChat')}</span>
                  </button>

                  {archiveConfirm ? (
                    <div className="px-3 py-2 bg-white/4 rounded-md mt-1 animate-fade-in">
                      <p className="text-[12px] text-white/60 mb-2">{t('archive')}?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleArchive}
                          className="text-[11px] font-bold text-white bg-white/10 px-2 py-1 rounded hover:bg-white/20"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setArchiveConfirm(false)}
                          className="text-[11px] text-white/40 px-2 py-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setArchiveConfirm(true)}
                      className="w-full flex items-center gap-[10px] px-3 py-2.5 rounded-md text-[13px] text-white/80 hover:bg-white/6 transition-colors"
                    >
                      <Archive size={16} className="text-text-secondary" />
                      <span>{t('archive')}</span>
                    </button>
                  )}

                  <div className="h-[1px] bg-white/10 my-1 mx-1" />
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center gap-[10px] px-3 py-2.5 rounded-md text-[13px] text-[#ff6b6b] hover:bg-white/6 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>{t('deleteChat')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <MessageList />
        </div>

        <ChatInput demo={demo} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-[680px] text-center mb-8">
          <h2 className="text-[2.2rem] font-semibold text-white mb-2 leading-tight">
            {t(greetingKey)}, <span className="text-[#8B5CF6]">{demo ? 'Guest' : user.firstName}</span>
          </h2>
          <p className="text-text-secondary text-base">{t('chatSubtitle')}</p>
          {demo && (
            <span className="inline-block mt-3 text-[10px] px-2 py-0.5 bg-yellow-400/15 border border-yellow-400/30 text-yellow-400/90 rounded-full uppercase tracking-wider">
              {t('demoMode')}
            </span>
          )}
        </div>

        <div className="w-full max-w-[680px]">
          <ChatInput embedded demo={demo} />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-[680px]">
          {quickActions.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={() => sendMessage(action.text)}
              className="px-4 py-2 rounded-full bg-white/6 border border-white/10 text-[13px] text-text-secondary hover:bg-white/10 hover:text-white hover:border-purple-500/30 transition-all"
            >
              {action.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
