import api from './api';

export const ticketsApi = {
  list: (params) => api.get('/tickets', { params }),
  get: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.patch(`/tickets/${id}`, data),
  addComment: (id, text) => api.post(`/tickets/${id}/comments`, { text }),
  delete: (id) => api.delete(`/tickets/${id}`),
};
