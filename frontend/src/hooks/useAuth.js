import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

// Login mutation - handles unified login for both lenders and customers
export const useLogin = () => {
    const { login } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (credentials) => {
            const { data } = await api.post('/auth/login', credentials);
            return data;
        },
        onSuccess: (data) => {
            // Pass role to auth store
            const role = data.data.role || 'lender';
            login(data.data.user, data.data.token, role);
            queryClient.invalidateQueries();
            toast.success('Login successful!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Login failed');
        },
    });
};

// Register mutation
export const useRegister = () => {
    return useMutation({
        mutationFn: async (userData) => {
            const { data } = await api.post('/auth/register', userData);
            return data;
        },
        onSuccess: () => {
            toast.success('Registration successful! Please login.');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Registration failed');
        },
    });
};

// Logout mutation
export const useLogout = () => {
    const { logout, token } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (token) {
                await api.post('/auth/logout');
            }
        },
        onSuccess: () => {
            logout();
            queryClient.clear();
            toast.success('Logged out successfully');
        },
        onError: () => {
            // Still logout on error
            logout();
            queryClient.clear();
        },
    });
};

// Get current user
export const useCurrentUser = () => {
    const { token, isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const { data } = await api.get('/auth/me');
            return data.data.user;
        },
        enabled: isAuthenticated && !!token,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false,
    });
};
