import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, X, Clock } from 'lucide-react';
import useUIStore from '../../store/useUIStore';
import useChatStore from '../../store/useChatStore';
import { useNavigate } from 'react-router-dom';

const SearchPopup = () => {
  const { searchPopupOpen, setSearchPopupOpen } = useUIStore();
  const { chats, setCurrentChat } = useChatStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Filter chats based on query (title and message content)
  const results = query.trim() ? chats.filter(chat => {
    const titleMatch = chat.title.toLowerCase().includes(query.toLowerCase());
    const messageMatch = chat.messages.some(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase())
    );
    return titleMatch || messageMatch;
  }) : chats;

  useEffect(() => {
    if (searchPopupOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSelectedIndex(0);
    }
  }, [searchPopupOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!searchPopupOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        setSearchPopupOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchPopupOpen, results, selectedIndex]);

  const handleSelect = (chat) => {
    setCurrentChat(chat.id);
    setSearchPopupOpen(false);
    navigate('/chat');
    setQuery('');
  };

  const getMessagePreview = (chat) => {
    if (!query.trim()) return chat.messages[chat.messages.length - 1]?.content || '';
    
    const matchingMsg = chat.messages.find(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase())
    );
    
    return matchingMsg ? matchingMsg.content : chat.messages[chat.messages.length - 1]?.content || '';
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60); // minutes
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!searchPopupOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh]">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] animate-fade-in"
        onClick={() => setSearchPopupOpen(false)}
      />
      
      <div className="relative w-full max-w-[600px] mx-4 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center px-4 py-4 border-b border-white/8 gap-3">
          <Search size={18} className="text-text-secondary" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search chats and messages..."
            className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder:text-white/20"
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 border border-white/10 font-mono">ESC</span>
            <button 
              onClick={() => setSearchPopupOpen(false)}
              className="p-1 text-text-secondary hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto custom-scrollbar py-2">
          {results.length > 0 ? (
            <>
              {!query && (
                <div className="px-4 py-2 text-[11px] font-medium text-white/30 tracking-widest uppercase">
                  Recent Conversations
                </div>
              )}
              {results.map((chat, index) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelect(chat)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    w-full flex flex-col gap-1 px-4 py-3 transition-colors text-left
                    ${index === selectedIndex ? 'bg-white/8' : 'hover:bg-white/4'}
                  `}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-white/90 font-medium text-[14px]">
                      <MessageSquare size={14} className="text-text-secondary" />
                      <span className="truncate">{chat.title}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-white/30 whitespace-nowrap">
                      <Clock size={10} />
                      {formatTime(chat.createdAt)}
                    </div>
                  </div>
                  <div className="text-[12px] text-white/40 truncate pl-6">
                    {getMessagePreview(chat)}
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="px-6 py-12 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                <Search size={24} />
              </div>
              <div className="text-text-secondary text-sm">
                No chats found for "<span className="text-white/60">{query}</span>"
              </div>
            </div>
          )}
        </div>
        
        {results.length > 0 && (
          <div className="px-4 py-2 bg-white/[0.02] border-t border-white/5 flex items-center gap-4 text-[11px] text-white/30">
            <div className="flex items-center gap-1.5">
              <span className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono">↑↓</span>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono">ENTER</span>
              <span>Open</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPopup;
