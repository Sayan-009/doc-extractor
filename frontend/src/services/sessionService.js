import api from './api';

export const sessionService = {
  getSessions: async () => {
    const { data } = await api.get('/sessions');
    return data;
  },
  getSession: async (id) => {
    const { data } = await api.get(`/sessions/${id}`);
    return data;
  },
  createSession: async (sessionData) => {
    const { data } = await api.post('/sessions', sessionData);
    return data;
  },
  updateSession: async (id, sessionData) => {
    const { data } = await api.put(`/sessions/${id}`, sessionData);
    return data;
  },
  deleteSession: async (id) => {
    await api.delete(`/sessions/${id}`);
  },
  getSessionData: async (id, page = 1, limit = 50) => {
    const { data } = await api.get(`/export/sessions/${id}/data?page=${page}&per_page=${limit}`);
    return data;
  },
  downloadCsv: async (id) => {
    const response = await api.get(`/export/sessions/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `session-${id}-data.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  processEmails: async (id) => {
    const { data } = await api.post(`/email/process/${id}`);
    return data;
  }
};
