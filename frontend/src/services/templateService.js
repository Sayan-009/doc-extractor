import api from './api';

export const templateService = {
  getTemplates: async () => {
    const { data } = await api.get('/templates');
    return data;
  },
  getTemplate: async (id) => {
    const { data } = await api.get(`/templates/${id}`);
    return data;
  },
  createTemplate: async (templateData) => {
    const { data } = await api.post('/templates', templateData);
    return data;
  },
  updateTemplate: async (id, templateData) => {
    const { data } = await api.put(`/templates/${id}`, templateData);
    return data;
  },
  deleteTemplate: async (id) => {
    await api.delete(`/templates/${id}`);
  },
  testExtraction: async (templateId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('template_id', templateId);
    const { data } = await api.post(`/upload/test-extraction`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  }
};
