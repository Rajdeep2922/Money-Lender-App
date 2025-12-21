import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lenderAPI } from '../services/api';

export const lenderKeys = {
    all: ['lender'],
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
