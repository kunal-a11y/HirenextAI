import { create } from 'zustand';
import { normalizePlan } from '../lib/planUtils';

const useUserStore = create((set) => ({
  user: {
    firstName: 'Demo',
    lastName: 'User',
    initials: 'DU',
    email: 'demo@hirenext.ai',
    plan: 'free', // 'free' | 'pro'
    demoMode: false,
  },
  
  settings: {
    aiResponseLanguage: localStorage.getItem('aiResponseLanguage') || 'English',
    interfaceLanguage: localStorage.getItem('interfaceLanguage') || 'English',
  },
  
  setPlan: (plan) => set((state) => {
    return { user: { ...state.user, plan: normalizePlan(plan) } };
  }),
  setUser: (newUser) => set((state) => {
    const name = newUser.name || `${newUser.firstName || ''} ${newUser.lastName || ''}`.trim();
    const [firstName = state.user.firstName, ...lastParts] = name.split(' ').filter(Boolean);
    const lastName = newUser.lastName || lastParts.join(' ') || state.user.lastName;
    const initials = newUser.initials || `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || state.user.initials;

    return {
      user: {
        ...state.user,
        ...newUser,
        firstName: newUser.firstName || firstName,
        lastName,
        initials,
        plan: normalizePlan(newUser.plan),
        demoMode: Boolean(newUser.demoMode)
      }
    };
  }),
  
  updateSettings: (newSettings) => set((state) => {
    const updatedSettings = { ...state.settings, ...newSettings };
    if (newSettings.aiResponseLanguage) localStorage.setItem('aiResponseLanguage', newSettings.aiResponseLanguage);
    if (newSettings.interfaceLanguage) localStorage.setItem('interfaceLanguage', newSettings.interfaceLanguage);
    return { settings: updatedSettings };
  }),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}));

export default useUserStore;
