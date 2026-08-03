import { useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import { useToast } from './useToast';
import { useNavigate } from 'react-router-dom';

// Map backend error details to user-friendly messages
const friendlyErrorMessage = (backendDetail, fallback) => {
  if (!backendDetail) return fallback;
  
  const msg = backendDetail.toLowerCase();
  
  if (msg.includes('invalid email or password')) return 'Incorrect email or password. Please try again.';
  if (msg.includes('email already registered')) return 'An account with this email already exists. Try logging in instead.';
  if (msg.includes('refresh token')) return fallback; // Hide token-related errors
  if (msg.includes('not found')) return fallback;
  if (msg.includes('invalid') || msg.includes('expired')) return 'Your session has expired. Please log in again.';
  if (msg.includes('current password is incorrect')) return 'The current password you entered is incorrect.';
  if (msg.includes('at least 6 characters')) return 'New password must be at least 6 characters long.';
  if (msg.includes('google accounts')) return 'Google accounts use Google Sign-In and cannot change password here.';
  
  return backendDetail;
};

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setAuth, logout, setLoading } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      const data = await authService.login(email, password);
      setAuth(data.user, data.access_token);
      toast.success('Welcome back!', `You're now signed in.`);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error('Unable to sign in', friendlyErrorMessage(detail, 'Please check your email and password.'));
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (email, password) => {
    try {
      setLoading(true);
      const data = await authService.signup(email, password);
      setAuth(data.user, data.access_token);
      toast.success('Welcome!', 'Your account has been created successfully.');
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error('Unable to create account', friendlyErrorMessage(detail, 'Something went wrong. Please try again.'));
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      logout();
      navigate('/login');
      toast.info('Signed out', 'You have been signed out successfully.');
    }
  };

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await authService.getMe();
      setAuth(data, useAuthStore.getState().accessToken);
    } catch (error) {
      // Silently clear auth state — don't show errors for background auth checks
      useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    checkAuth,
    getGoogleAuthUrl: authService.getGoogleAuthUrl
  };
};
