import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { customerAPI } from '../services/api';

// Query keys
export const customerKeys = {
    all: ['customers'],
    lists: () => [...customerKeys.all, 'list'],
    list: (params) => [...customerKeys.lists(), params],
    details: () => [...customerKeys.all, 'detail'],
    detail: (id) => [...customerKeys.details(), id],
};

/**
 * Fetch all customers with pagination
 */
export const useCustomers = (params = {}) => {
    return useQuery({
        queryKey: customerKeys.list(params),
        queryFn: async () => {
            const { data } = await customerAPI.list(params);
            return data;
        },
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Fetch single customer
 */
export const useCustomer = (id) => {
    return useQuery({
        queryKey: customerKeys.detail(id),
        queryFn: async () => {
            const { data } = await customerAPI.get(id);
            return data.customer;
        },
        enabled: !!id,
    });
};

/**
 * Create customer mutation
 */
export const useCreateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: customerAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
        },
    });
};

/**
 * Update customer mutation
 */
export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => customerAPI.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
        },
    });
};

/**
 * Delete customer mutation
 */
export const useDeleteCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: customerAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
        },
    });
};
