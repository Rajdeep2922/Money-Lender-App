import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
export const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'An error occurred';
        console.error('API Error:', message);
        return Promise.reject(error);
    }
);

// Customer API
export const customerAPI = {
    list: (params = {}) => api.get('/customers', { params }),
    get: (id) => api.get(`/customers/${id}`),
    create: (data) => api.post('/customers', data),
    update: (id, data) => api.put(`/customers/${id}`, data),
    delete: (id) => api.delete(`/customers/${id}`),
};

// Loan API
export const loanAPI = {
    list: (params = {}) => api.get('/loans', { params }),
    get: (id) => api.get(`/loans/${id}`),
    create: (data) => api.post('/loans', data),
    update: (id, data) => api.put(`/loans/${id}`, data),
    approve: (id) => api.post(`/loans/${id}/approve`),
    updateStatus: (id, status) => api.patch(`/loans/${id}/status`, { status }),
    cancel: (id) => api.post(`/loans/${id}/cancel`),
    foreclose: (id, data) => api.post(`/loans/${id}/foreclose`, data),
    getAmortization: (id) => api.get(`/loans/${id}/amortization`),
    getBalance: (id) => api.get(`/loans/${id}/balance`),
    downloadAgreement: (id) => api.get(`/loans/${id}/agreement`, { responseType: 'blob' }),
    downloadStatement: (id) => api.get(`/loans/${id}/statement`, { responseType: 'blob' }),
    downloadNOC: (id) => api.get(`/loans/${id}/noc`, { responseType: 'blob' }),
};

// Payment API
export const paymentAPI = {
    list: (params = {}) => api.get('/payments', { params }),
    get: (id) => api.get(`/payments/${id}`),
    record: (data) => api.post('/payments', data),
    update: (id, data) => api.put(`/payments/${id}`, data),
    delete: (id) => api.delete(`/payments/${id}`),
    getForLoan: (loanId) => api.get(`/payments/loan/${loanId}`),
    getForCustomer: (customerId) => api.get(`/payments/customer/${customerId}`),
    downloadReceipt: (id) => api.get(`/payments/${id}/receipt`, { responseType: 'blob' }),
};

// Lender API
export const lenderAPI = {
    get: () => api.get('/lender'),
    update: (data) => api.put('/lender', data),
};

// stats API
export const statsAPI = {
    get: () => api.get('/stats'),
};

// Export API
export const exportAPI = {
    customers: () => api.get('/export/customers', { responseType: 'blob' }),
    loans: () => api.get('/export/loans', { responseType: 'blob' }),
    payments: () => api.get('/export/payments', { responseType: 'blob' }),
};

export default api;
