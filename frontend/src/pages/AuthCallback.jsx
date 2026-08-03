import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import Spinner from '../components/ui/Spinner';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('access_token');
      if (token) {
        setLoading(true);
        try {
          useAuthStore.setState({ accessToken: token });
          const data = await authService.getMe();
          setAuth(data.user, token);
          navigate('/dashboard', { replace: true });
        } catch (error) {
          console.error('Failed to fetch user data', error);
          navigate('/login', { replace: true });
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuth, setLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spinner size="xl" className="mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Completing sign in...</h2>
      </div>
    </div>
  );
};

export default AuthCallback;
