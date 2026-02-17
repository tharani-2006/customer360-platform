import api from './api';

export const subscriptionsApi = {
  list: (params) => api.get('/subscriptions', { params }),
  get: (id) => api.get(`/subscriptions/${id}`),
  create: (data) => api.post('/subscriptions', data),
  update: (id, data) => api.patch(`/subscriptions/${id}`, data),
  delete: (id) => api.delete(`/subscriptions/${id}`),
};
