import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import useUserStore from './useUserStore';

const syncUserToProfile = (user) => {
  if (!user) return;
  const name = user.name || '';
  const [firstName = 'User', ...rest] = name.split(' ').filter(Boolean);
  const lastName = rest.join(' ');
  useUserStore.getState().setUser({
    ...user,
    firstName,
    lastName,
    initials: `${firstName[0] || ''}${lastName[0] || firstName[0] || 'U'}`.toUpperCase(),
    demoMode: false
  });
};

const clearDemoData = () => {
  sessionStorage.removeItem('demoChatHistory');
  sessionStorage.removeItem('hn_verification_banner_dismissed');
  delete window.demoStartTime;
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isDemoMode: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/api/auth/login', { email, password });
          const { token, user } = res.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          clearDemoData();
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            isDemoMode: false
          });
          syncUserToProfile(user);
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return {
            success: false,
            error: err.response?.data?.error || 'Login failed'
          };
        }
      },

      signup: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/api/auth/signup', { name, email, password });
          const { token, user } = res.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          clearDemoData();
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            isDemoMode: false
          });
          syncUserToProfile(user);
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return {
            success: false,
            error: err.response?.data?.error || 'Signup failed'
          };
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        clearDemoData();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isDemoMode: false
        });
        useUserStore.setState({
          user: {
            firstName: 'Guest',
            lastName: '',
            initials: 'G',
            email: '',
            plan: 'free',
            demoMode: true
          }
        });
        window.location.href = '/login';
      },

      fetchMe: async () => {
        const token = localStorage.getItem('token') || get().token;
        if (!token) return;

        try {
          const res = await api.get('/api/auth/me');
          const user = res.data;
          localStorage.setItem('user', JSON.stringify(user));
          set({
            user,
            token,
            isAuthenticated: true,
            isDemoMode: false
          });
          syncUserToProfile(user);
        } catch (err) {
          if (err.response?.status === 401 || err.response?.status === 404) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({
              user: null,
              token: null,
              isAuthenticated: false
            });
          }
        }
      },

      setDemoMode: () => {
        const demoUser = {
          name: 'Demo User',
          email: 'demo@hirenextai.com',
          plan: 'free',
          initials: 'DU'
        };
        set({
          user: demoUser,
          isAuthenticated: true,
          isDemoMode: true,
          token: null
        });
        useUserStore.getState().setUser({
          firstName: 'Demo',
          lastName: 'User',
          initials: 'DU',
          email: 'demo@hirenextai.com',
          plan: 'free',
          demoMode: true
        });
      },

      updateUser: (userData) => {
        const nextUser = { ...get().user, ...userData };
        set({ user: nextUser });
        if (nextUser) {
          localStorage.setItem('user', JSON.stringify(nextUser));
          syncUserToProfile(nextUser);
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isDemoMode: state.isDemoMode
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          localStorage.setItem('token', state.token);
        }
        if (state?.user) {
          syncUserToProfile(state.user);
        }
      }
    }
  )
);

export default useAuthStore;
