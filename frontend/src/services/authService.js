import api from './api';

export const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  signup: async (email, password) => {
    const { data } = await api.post('/auth/signup', { email, password });
    return data;
  },
  logout: async () => {
    await api.post('/auth/logout');
  },
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
  getGoogleAuthUrl: async () => {
    const { data } = await api.get('/auth/google');
    return data;
  }
};
