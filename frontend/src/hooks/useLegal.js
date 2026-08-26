import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { legalAPI } from '../services/api';

export const legalKeys = {
    all: ['legal'],
    policies: () => [...legalKeys.all, 'policies'],
    policy: (type) => [...legalKeys.all, 'policy', type],
    history: (type) => [...legalKeys.all, 'history', type],
};

/**
 * Fetch all current active policies (all 8 types in one request)
 */
export const useLegalPolicies = () => {
    return useQuery({
        queryKey: legalKeys.policies(),
        queryFn: async () => {
            const { data } = await legalAPI.getAllPolicies();
            return data.policies; // map of policyType -> policy doc
        },
        staleTime: 1000 * 60 * 5,
    });
};

/**
 * Fetch single active policy by type
 */
export const useLegalPolicy = (type) => {
    return useQuery({
        queryKey: legalKeys.policy(type),
        queryFn: async () => {
            const { data } = await legalAPI.getActivePolicy(type);
            return data.policy;
        },
        enabled: !!type,
        staleTime: 1000 * 60 * 5,
    });
};

/**
 * Fetch full version history for a policy type
 */
export const usePolicyHistory = (type) => {
    return useQuery({
        queryKey: legalKeys.history(type),
        queryFn: async () => {
            const { data } = await legalAPI.getPolicyHistory(type);
            return data.history;
        },
        enabled: !!type,
        staleTime: 0, // always fresh
    });
};

/**
 * Publish a new version of a policy
 */
export const usePublishPolicy = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ type, content }) => legalAPI.publishPolicy(type, content),
        onSuccess: (_, { type }) => {
            queryClient.invalidateQueries({ queryKey: legalKeys.policies() });
            queryClient.invalidateQueries({ queryKey: legalKeys.policy(type) });
            queryClient.invalidateQueries({ queryKey: legalKeys.history(type) });
        },
    });
};
