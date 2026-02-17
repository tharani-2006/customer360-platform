import api from './api';

export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
};
