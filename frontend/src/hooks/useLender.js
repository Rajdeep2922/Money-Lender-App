import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lenderAPI } from '../services/api';

export const lenderKeys = {
    all: ['lender'],
    loanPolicy: ['lender', 'loan-policy'],
};

/**
 * Fetch lender profile
 */
export const useLender = () => {
    return useQuery({
        queryKey: lenderKeys.all,
        queryFn: async () => {
            const { data } = await lenderAPI.get();
            return data.lender;
        },
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
    });
};

/**
 * Update lender profile
 */
export const useUpdateLender = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => lenderAPI.update(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: lenderKeys.all });
        },
    });
};

/**
 * Fetch lender's configurable loan policy defaults
 */
export const useLoanPolicy = () => {
    return useQuery({
        queryKey: lenderKeys.loanPolicy,
        queryFn: async () => {
            const { data } = await lenderAPI.getLoanPolicy();
            return data.loanPolicy;
        },
        staleTime: 1000 * 60 * 5,
    });
};

/**
 * Update lender's loan policy defaults
 */
export const useUpdateLoanPolicy = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => lenderAPI.updateLoanPolicy(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: lenderKeys.loanPolicy });
        },
    });
};
