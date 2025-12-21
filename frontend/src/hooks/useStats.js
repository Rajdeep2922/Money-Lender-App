import { useQuery } from '@tanstack/react-query';
import { statsAPI } from '../services/api';

export const statsKeys = {
    all: ['stats'],
};

/**
 * Fetch dashboard statistics
 */
export const useStats = () => {
    return useQuery({
        queryKey: statsKeys.all,
        queryFn: async () => {
            const { data } = await statsAPI.get();
            return data.stats;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
