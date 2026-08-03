import api from './api';

export const gmailService = {
  getGmailStatus: async () => {
    const { data } = await api.get('/gmail/status');
    return data;
  },
  getConnectUrl: async () => {
    const { data } = await api.get('/gmail/connect');
    return data;
  },
  disconnectGmail: async () => {
    await api.post('/gmail/disconnect');
  }
};
