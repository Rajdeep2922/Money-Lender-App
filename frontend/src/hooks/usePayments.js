import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { paymentAPI } from '../services/api';
import { loanKeys } from './useLoans';
import { invoiceKeys } from './useInvoices';

// Query keys
export const paymentKeys = {
    all: ['payments'],
    lists: () => [...paymentKeys.all, 'list'],
    list: (params) => [...paymentKeys.lists(), params],
    details: () => [...paymentKeys.all, 'detail'],
    detail: (id) => [...paymentKeys.details(), id],
    forLoan: (loanId) => [...paymentKeys.all, 'loan', loanId],
    forCustomer: (customerId) => [...paymentKeys.all, 'customer', customerId],
};

/**
 * Fetch all payments
 */
export const usePayments = (params = {}) => {
    return useQuery({
        queryKey: paymentKeys.list(params),
        queryFn: async () => {
            const { data } = await paymentAPI.list(params);
            return data;
        },
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5,
    });
};

/**
 * Fetch payments for a loan
 */
export const usePaymentsForLoan = (loanId) => {
    return useQuery({
        queryKey: paymentKeys.forLoan(loanId),
        queryFn: async () => {
            const { data } = await paymentAPI.getForLoan(loanId);
            return data;
        },
        enabled: !!loanId,
    });
};

/**
 * Record payment mutation
 */
export const useRecordPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: paymentAPI.record,
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
            queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all }); // Refresh invoices/receipts list
            // Invalidate specific loan data
            if (response.data?.payment?.loanId) {
                queryClient.invalidateQueries({
                    queryKey: loanKeys.detail(response.data.payment.loanId)
                });
                queryClient.invalidateQueries({
                    queryKey: paymentKeys.forLoan(response.data.payment.loanId)
                });
            }
        },
    });
};

/**
 * Delete payment mutation
 */
export const useDeletePayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: paymentAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
            queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
        },
    });
};
/**
 * Download payment receipt mutation
 */
export const useDownloadReceipt = () => {
    return useMutation({
        mutationFn: async (id) => {
            const response = await paymentAPI.downloadReceipt(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Receipt-${id.toString().slice(-6)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        },
    });
};
