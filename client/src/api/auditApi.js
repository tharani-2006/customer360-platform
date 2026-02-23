import api from './api';

export const auditApi = {
    list: () => api.get('/audit'),
};
