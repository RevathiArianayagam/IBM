import api from './api';

export const transactionService = {
  issueBook: async (data) => {
    const response = await api.post('/transactions/issue', data);
    return response.data;
  },

  returnBook: async (id, data) => {
    const response = await api.post(`/transactions/return/${id}`, data);
    return response.data;
  },

  renewBook: async (id) => {
    const response = await api.post(`/transactions/renew/${id}`);
    return response.data;
  },

  getTransactions: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  getUserTransactions: async (userId) => {
    const response = await api.get(`/transactions/user/${userId}`);
    return response.data;
  },

  getOverdueBooks: async () => {
    const response = await api.get('/transactions/overdue');
    return response.data;
  },
};

