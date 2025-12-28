import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lenderAPI } from '../services/api';

export const lenderKeys = {
    all: ['lender'],
};

/**
 * Fetch lender profile
 * Lender data rarely changes, so we use aggressive caching
 */
export const useLender = () => {
    return useQuery({
        queryKey: lenderKeys.all,
        queryFn: async () => {
            const { data } = await lenderAPI.get();
            return data.lender;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes - lender data rarely changes
        gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
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
