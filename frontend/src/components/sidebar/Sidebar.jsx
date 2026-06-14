import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Plus, 
  Search, 
  MessageSquare, 
  Briefcase, 
  Mic, 
  FileText, 
  Settings,
  X,
  Pin,
  Shield
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useUIStore from '../../store/useUIStore';
import useUserStore from '../../store/useUserStore';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import { useTranslation } from '../../hooks/useTranslation';
import { getPlanDisplay, normalizePlan } from '../../lib/planUtils';
import { Logo } from '../Logo';

const ADMIN_EMAILS = ['demo@hirenextai.com', 'your-real-email@gmail.com'];

const Sidebar = ({ isDemoMode: propDemoMode }) => {
  const isDemoMode = window.location.pathname === '/demo' || 
                     window.location.pathname === '/preview';
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    setSearchPopupOpen, 
    setSettingsModalOpen,
    setPricingModalOpen,
  } = useUIStore();
  
  const { user } = useUserStore();
  const { isDemoMode: isDemoModeStore } = useAuthStore();
  const { chats, deleteChat, setCurrentChat, startNewChat, currentChatId } = useChatStore();

  const isDemo = propDemoMode || isDemoModeStore;
  const showDemoBadge = location.pathname === '/preview' || location.pathname === '/demo' || isDemo;

  const visibleChats = chats.filter(c => !c.archived);
  const pinnedChats = visibleChats.filter(c => c.pinned);
  const regularChats = visibleChats.filter(c => !c.pinned);
  const sortedChats = [...pinnedChats, ...regularChats];

  const navItems = [
    { icon: Search, label: t('search'), onClick: () => setSearchPopupOpen(true) },
    { icon: MessageSquare, label: t('chats'), path: '/chats' },
    { icon: Briefcase, label: t('applications'), path: '/applications' },
    { icon: Mic, label: t('interview'), path: '/interview' },
    { icon: FileText, label: t('files'), path: '/files' },
  ];

  const handleNavClick = (item) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleNewChat = () => {
    startNewChat();
    navigate('/chat');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`h-full flex flex-col overflow-hidden bg-sidebar border-r border-border transition-all duration-300 ${sidebarCollapsed ? 'w-[60px]' : 'w-[260px]'}`}>
      {/* Top Section */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        {/* Top Bar */}
        <div className={`py-4 flex ${sidebarCollapsed ? 'px-1.5 justify-center items-center' : 'px-4'}`}>
          {sidebarCollapsed ? (
            <button 
              onClick={() => setSidebarCollapsed(false)}
              className="hover:scale-105 transition-transform duration-200"
              title="Open Sidebar"
            >
              <img
                src="/hirenext-logo-v2.png"
                alt="HirenextAI"
                className="w-12 h-12 block flex-shrink-0 object-contain"
                style={{
                  filter: "drop-shadow(0 0 14px rgba(168,85,247,0.65)) drop-shadow(0 0 5px rgba(99,102,241,0.4))",
                }}
              />
            </button>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/hirenext-logo-v2.png"
                    alt="HirenextAI"
                    className="w-10 h-10 block flex-shrink-0 object-contain"
                    style={{
                      filter: "drop-shadow(0 0 10px rgba(168,85,247,0.5))",
                    }}
                  />
                  <span className="text-[15px] font-semibold text-white leading-none">HirenextAI</span>
                </div>
                <button 
                  onClick={() => setSidebarCollapsed(true)}
                  className="text-text-secondary hover:text-white transition-colors"
                  title="Close Sidebar"
                >
                  <PanelLeftClose size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-2 space-y-1">
          {!sidebarCollapsed ? (
            <button 
              onClick={handleNewChat}
              className="w-full mb-2 flex items-center justify-center gap-2 bg-white text-black text-sm font-medium py-2 px-4 rounded-lg hover:bg-[#e8e8e8] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300"
            >
              <Plus size={16} />
              <span>{t('newChat')}</span>
            </button>
          ) : (
            <button 
              onClick={handleNewChat}
              className="w-full mb-2 flex items-center justify-center text-white bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors"
              title={t('newChat')}
            >
              <Plus size={16} />
            </button>
          )}

          {navItems.map((item, index) => {
            const isLockedItem = item.path === '/applications' || item.path === '/interview' || item.path === '/files';
            return (
              <button
                key={index}
                onClick={() => handleNavClick(item)}
                data-demo-lock={isLockedItem ? "true" : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                  ${sidebarCollapsed ? 'justify-center' : ''}
                  ${isActive(item.path)
                    ? 'bg-purple-500/10 border-l-2 border-purple-500 text-white'
                    : 'hover:bg-active border-l-2 border-transparent'}
                `}
                title={sidebarCollapsed ? item.label : ''}
              >
                <item.icon size={16} className={isActive(item.path) ? 'text-white' : 'text-text-secondary'} />
                {!sidebarCollapsed && <span className={`text-sm ${isActive(item.path) ? 'text-white/80' : 'text-text-secondary'}`}>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Recents */}
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto mt-6 custom-scrollbar">
            <div className="px-4 mb-2 text-[11px] font-medium text-white/30 tracking-widest uppercase">
              {t('recents')}
            </div>
            <div className="px-2 space-y-0.5">
              {sortedChats.map((chat) => (
                <div 
                  key={chat.id}
                  className={`
                    group flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition-colors
                    ${currentChatId === chat.id ? 'bg-white/10' : 'hover:bg-active'}
                  `}
                  onClick={() => { navigate('/chat'); setCurrentChat(chat.id); }}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                    <span className={`text-[13px] truncate ${currentChatId === chat.id ? 'text-white font-medium' : 'text-text-secondary'}`}>
                      {chat.title}
                    </span>
                    {chat.pinned && <Pin size={12} className="text-white/40 fill-white/40 shrink-0" />}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                    className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-white transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Profile — always pinned to bottom */}
      <div className="flex-shrink-0 border-t border-white/6 p-3 mt-auto bg-sidebar">
        {!sidebarCollapsed && !isDemo && user && (user?.role === 'admin' || ADMIN_EMAILS.includes((user?.email || '').toLowerCase())) && (
          <div className="px-2 mb-2">
            <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-xs text-purple-400 hover:text-purple-300">
              <Shield className="w-3 h-3" />
              <span>Admin Panel</span>
            </Link>
          </div>
        )}
        <div 
          onClick={() => setSettingsModalOpen(true)}
          className={`flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 cursor-pointer ${sidebarCollapsed ? 'justify-center' : ''}`}
        >
          {/* Avatar circle */}
          <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] text-sm font-bold flex-shrink-0">
            {String(user?.name || user?.firstName || 'G').charAt(0).toUpperCase()}
          </div>
          
          {!sidebarCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Guest'}
                </p>
                <p className="text-xs text-white/40 truncate">
                  {user?.email || 'guest@hirenextai.com'}
                </p>
              </div>
              
              <Settings 
                onClick={(e) => {
                  e.stopPropagation();
                  setSettingsModalOpen(true);
                }}
                data-demo-lock="true"
                className="w-4 h-4 text-white/30 hover:text-white shrink-0 cursor-pointer transition-colors"
              />
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

