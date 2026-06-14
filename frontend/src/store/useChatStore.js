import { create } from 'zustand';
import { autoSaveFromAIResponse } from '../lib/aiFileSaver';
import api from '../lib/api';
import useUserStore from './useUserStore';
import useUIStore from './useUIStore';

const isDemoPath = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  return path === '/demo' || path === '/preview';
};

const getStorage = () => (isDemoPath() ? sessionStorage : localStorage);
const getChatKey = () => (isDemoPath() ? 'demoChatHistory' : 'chatHistory');
const loadChats = () => {
  try {
    return JSON.parse(getStorage().getItem(getChatKey()) || '[]');
  } catch {
    return [];
  }
};
const saveChats = (chats) => {
  getStorage().setItem(getChatKey(), JSON.stringify(chats));
};

const useChatStore = create((set, get) => {
  const savedChats = loadChats();
  const savedModel = localStorage.getItem('selectedModel') || 'hirenext-flash';

  return {
    chats: savedChats,
    currentChatId: null,
    messages: [],
    isTyping: false,
    selectedModel: savedModel,

    setSelectedModel: (model) => {
      set({ selectedModel: model });
      localStorage.setItem('selectedModel', model);
    },

    setCurrentChat: (id) => {
      const chats = loadChats();
      const chat = chats.find((c) => c.id === id);
      set({
        chats,
        currentChatId: id,
        messages: chat ? chat.messages : [],
      });
    },

    startNewChat: () => {
      set({ currentChatId: null, messages: [] });
      if (localStorage.getItem('token')) {
        api.post('/api/ai/clear').catch(() => {});
      }
    },

    sendMessage: async (content) => {
      if (isDemoPath()) {
        const { currentChatId, messages } = get();
        const newMessage = {
          id: Date.now().toString(),
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
        };
        const demoReply = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'This demo preview keeps chats only on this device. Sign up or log in to save conversations and use live HirenextAI responses.',
          timestamp: new Date().toISOString(),
        };
        const nextMessages = [...messages, newMessage, demoReply];
        const demoChatId = currentChatId || `demo-${Date.now()}`;
        const otherChats = loadChats().filter((c) => c.id !== demoChatId);
        const nextChat = {
          id: demoChatId,
          title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
          messages: nextMessages,
          createdAt: new Date().toISOString(),
          pinned: false,
          archived: false,
        };
        const nextChats = [nextChat, ...otherChats];
        set({ currentChatId: demoChatId, chats: nextChats, messages: nextMessages, isTyping: false });
        saveChats(nextChats);
        return;
      }

      const { currentChatId, chats, messages } = get();
      const newMessage = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      let newMessages = [...messages, newMessage];
      let newChatId = currentChatId;
      let newChats = [...chats];

      if (!currentChatId) {
        newChatId = Date.now().toString();
        const newChat = {
          id: newChatId,
          title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
          messages: newMessages,
          createdAt: new Date().toISOString(),
          pinned: false,
          archived: false,
        };
        newChats = [newChat, ...chats];
        set({ currentChatId: newChatId, chats: newChats, messages: newMessages });
      } else {
        newChats = chats.map((c) =>
          c.id === currentChatId ? { ...c, messages: newMessages } : c
        );
        set({ messages: newMessages, chats: newChats });
      }

      saveChats(newChats);
      set({ isTyping: true });

      const token = localStorage.getItem('token');
      if (!token) {
        set({ isTyping: false });
        useUIStore.getState().showToast('Please sign in to chat with HirenextAI');
        return;
      }

      try {
        const user = useUserStore.getState().user || {};
        const userContext = {
          jobTitle: user.jobTitle || user.role || '',
          skills: user.skills || '',
          experience: user.experience || '',
        };

        const response = await api.post('/api/ai/chat', {
          message: content,
          model: get().selectedModel,
          userContext,
        });

        let aiText = response.data?.response || '';
        if (!aiText.trim()) {
          throw new Error('Empty AI response');
        }

        let parsedJob = null;
        // Search for a JSON block representing a job card
        const jobJsonRegex = /```json\s*(\{\s*"type"\s*:\s*"job_card"[\s\S]*?\})\s*```/;
        const match = aiText.match(jobJsonRegex);
        if (match) {
          try {
            const jobData = JSON.parse(match[1]);
            parsedJob = {
              id: jobData.id || Date.now().toString(),
              title: jobData.title || '',
              company: jobData.company || '',
              location: jobData.location || '',
              salary: jobData.salary || '',
              match: jobData.match || 90,
              url: jobData.url || '#'
            };
            // Clean up the text by removing the JSON code block
            aiText = aiText.replace(jobJsonRegex, '').trim();
          } catch (e) {
            console.error('Failed to parse job JSON from AI response:', e);
          }
        }

        const aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiText,
          timestamp: new Date().toISOString(),
          job: parsedJob,
        };

        const updatedMessages = [...get().messages, aiResponse];
        const updatedChats = get().chats.map((c) =>
          c.id === get().currentChatId ? { ...c, messages: updatedMessages } : c
        );

        set({
          messages: updatedMessages,
          chats: updatedChats,
          isTyping: false,
        });
        saveChats(updatedChats);
        autoSaveFromAIResponse(aiResponse.content, {
          jobTitle: aiResponse.job?.title,
          jobCompany: aiResponse.job?.company,
        });
      } catch (err) {
        console.error('Gemini chat error:', err);
        const isLimitError = err.response?.status === 429;
        const errorMsg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'AI is temporarily unavailable. Please try again.';

        const errorResponse = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: isLimitError
            ? errorMsg
            : `Sorry, I could not reach HirenextAI right now. ${errorMsg}`,
          timestamp: new Date().toISOString(),
          job: null,
          isError: true,
        };

        const updatedMessages = [...get().messages, errorResponse];
        const updatedChats = get().chats.map((c) =>
          c.id === get().currentChatId ? { ...c, messages: updatedMessages } : c
        );

        set({
          messages: updatedMessages,
          chats: updatedChats,
          isTyping: false,
        });
        saveChats(updatedChats);
        useUIStore.getState().showToast(errorMsg);
      }
    },

    deleteChat: (id) => {
      const newChats = get().chats.filter((c) => c.id !== id);
      set({
        chats: newChats,
        currentChatId: get().currentChatId === id ? null : get().currentChatId,
        messages: get().currentChatId === id ? [] : get().messages,
      });
      saveChats(newChats);
    },

    pinChat: (id) => {
      const newChats = get().chats.map((c) =>
        c.id === id ? { ...c, pinned: !c.pinned } : c
      );
      set({ chats: newChats });
      saveChats(newChats);
      return !get().chats.find((c) => c.id === id).pinned;
    },

    archiveChat: (id) => {
      const newChats = get().chats.map((c) =>
        c.id === id ? { ...c, archived: true } : c
      );
      set({
        chats: newChats,
        currentChatId: get().currentChatId === id ? null : get().currentChatId,
        messages: get().currentChatId === id ? [] : get().messages,
      });
      saveChats(newChats);
    },

    clearMessages: () => set({ messages: [] }),
  };
});

export default useChatStore;
