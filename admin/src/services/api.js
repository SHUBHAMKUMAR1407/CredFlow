import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('credflow_user') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

// Auth
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const verifyOTP = (data) => API.post('/auth/verify-otp', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Transactions
export const getTransactions = (params) => API.get('/transactions', { params });
export const getTransactionSummary = () => API.get('/transactions/summary');
export const addTransaction = (data) => API.post('/transactions', data);
export const updateTransaction = (id, data) => API.put(`/transactions/${id}`, data);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);

// Cash Flow
export const getMonthlyCashFlow = () => API.get('/cashflow/monthly');
export const getCashFlowTrends = () => API.get('/cashflow/trends');

// Credit Score
export const getCreditScore = () => API.get('/credit-score');
export const recalculateCreditScore = () => API.post('/credit-score/recalculate');
export const getCreditScoreHistory = () => API.get('/credit-score/history');

// Budgets
export const getBudgets = (params) => API.get('/budgets', { params });
export const createBudget = (data) => API.post('/budgets', data);
export const deleteBudget = (id) => API.delete(`/budgets/${id}`);

// Savings
export const getSavingsGoals = () => API.get('/savings');
export const createSavingsGoal = (data) => API.post('/savings', data);
export const updateSavingsGoal = (id, data) => API.put(`/savings/${id}`, data);
export const contributeSavings = (id, data) => API.put(`/savings/${id}/contribute`, data);
export const deleteSavingsGoal = (id) => API.delete(`/savings/${id}`);

// Smart
export const getSuggestions = () => API.get('/smart/suggestions');

// Admin
export const getAdminUsers = () => API.get('/admin/users');
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminActivity = () => API.get('/admin/activity');
export const updateUserRole = (id, data) => API.put(`/admin/users/${id}/role`, data);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);

// Seed
export const seedData = () => API.post('/seed');

export default API;
