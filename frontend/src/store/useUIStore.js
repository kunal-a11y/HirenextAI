import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  searchPopupOpen: false,
  setSearchPopupOpen: (open) => set({ searchPopupOpen: open }),
  
  settingsModalOpen: false,
  setSettingsModalOpen: (open) => set({ settingsModalOpen: open }),
  
  pricingModalOpen: false,
  setPricingModalOpen: (open) => set({ pricingModalOpen: open }),
  
  plusPopupOpen: false,
  setPlusPopupOpen: (open) => set({ plusPopupOpen: open }),

  voiceToVoiceOpen: false,
  setVoiceToVoiceOpen: (open) => set({ voiceToVoiceOpen: open }),

  connectModalOpen: false,
  setConnectModalOpen: (open) => set({ connectModalOpen: open }),
  
  isMobile: window.innerWidth < 768,
  setIsMobile: (isMobile) => set({ isMobile }),
  
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  toast: null,
  showToast: (message) => {
    set({ toast: message });
    setTimeout(() => set({ toast: null }), 3000);
  },
}));

export default useUIStore;
