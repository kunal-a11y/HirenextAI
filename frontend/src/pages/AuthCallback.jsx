import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');
    const linkedin = params.get('linkedin');

    const finish = async () => {
      if (linkedin === 'connected') {
        await useAuthStore.getState().fetchMe();
        navigate('/connect-accounts?linkedin=connected', { replace: true });
        return;
      }

      if (!token) {
        navigate('/login?error=' + (error || 'auth_failed'), { replace: true });
        return;
      }

      localStorage.setItem('token', token);
      
      // Update state in Zustand store
      useAuthStore.setState({
        token: token,
        isAuthenticated: true,
        isDemoMode: false
      });

      // Hydrate user profile info
      await useAuthStore.getState().fetchMe();

      navigate('/chat', { replace: true });
    };

    finish();
  }, [params, navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <p className="text-white/50">Completing sign in...</p>
    </div>
  );
}
