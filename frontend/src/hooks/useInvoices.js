import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const invoiceKeys = {
    all: ['invoices'],
    lists: () => [...invoiceKeys.all, 'list'],
    list: (params) => [...invoiceKeys.lists(), params],
};

export const useInvoices = (params = {}) => {
    return useQuery({
        queryKey: invoiceKeys.list(params),
        queryFn: async () => {
            const { data } = await api.get('/invoices', { params });
            return data;
        }
    });
};

export const useGenerateInvoices = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => api.post('/invoices/generate'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
        }
    });
};

export const useDownloadInvoice = () => {
    return useMutation({
        mutationFn: async (id) => {
            const response = await api.get(`/invoices/${id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        }
    });
};

export const useDeleteInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.delete(`/invoices/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
        }
    });
};
