import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { loanAPI } from '../services/api';

// Query keys
export const loanKeys = {
    all: ['loans'],
    lists: () => [...loanKeys.all, 'list'],
    list: (params) => [...loanKeys.lists(), params],
    details: () => [...loanKeys.all, 'detail'],
    detail: (id) => [...loanKeys.details(), id],
    amortization: (id) => [...loanKeys.detail(id), 'amortization'],
    balance: (id) => [...loanKeys.detail(id), 'balance'],
};

/**
 * Fetch all loans with pagination
 */
export const useLoans = (params = {}) => {
    return useQuery({
        queryKey: loanKeys.list(params),
        queryFn: async () => {
            const { data } = await loanAPI.list(params);
            return data;
        },
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5,
    });
};

/**
 * Fetch single loan
 */
export const useLoan = (id) => {
    return useQuery({
        queryKey: loanKeys.detail(id),
        queryFn: async () => {
            const { data } = await loanAPI.get(id);
            return data.loan;
        },
        enabled: !!id,
    });
};

/**
 * Fetch loan amortization schedule
 */
export const useLoanAmortization = (id) => {
    return useQuery({
        queryKey: loanKeys.amortization(id),
        queryFn: async () => {
            const { data } = await loanAPI.getAmortization(id);
            return data;
        },
        enabled: !!id,
    });
};

/**
 * Fetch loan current balance
 */
export const useLoanBalance = (id) => {
    return useQuery({
        queryKey: loanKeys.balance(id),
        queryFn: async () => {
            const { data } = await loanAPI.getBalance(id);
            return data;
        },
        enabled: !!id,
    });
};

/**
 * Create loan mutation
 */
export const useCreateLoan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: loanAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
        },
    });
};

/**
 * Approve loan mutation
 */
export const useApproveLoan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: loanAPI.approve,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
            queryClient.invalidateQueries({ queryKey: loanKeys.detail(id) });
        },
    });
};

/**
 * Foreclose loan mutation
 */
export const useForecloseLoan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => loanAPI.foreclose(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
            queryClient.invalidateQueries({ queryKey: loanKeys.detail(id) });
        },
    });
};

/**
 * Download agreement mutation
 */
export const useDownloadAgreement = () => {
    return useMutation({
        mutationFn: async (id) => {
            const response = await loanAPI.downloadAgreement(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Agreement-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        },
    });
};

/**
 * Download statement mutation
 */
export const useDownloadStatement = () => {
    return useMutation({
        mutationFn: async (id) => {
            const response = await loanAPI.downloadStatement(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Statement-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        },
    });
};

/**
 * Download NOC mutation
 */
export const useDownloadNOC = () => {
    return useMutation({
        mutationFn: async (id) => {
            const response = await loanAPI.downloadNOC(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `NOC-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        },
    });
};
