import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            role: null, // 'lender' or 'customer'
            isAuthenticated: false,

            // Set user, token, and role after login
            login: (user, token, role = 'lender') => {
                set({
                    user,
                    token,
                    role,
                    isAuthenticated: true
                });
            },

            // Clear user and token on logout
            logout: () => {
                set({
                    user: null,
                    token: null,
                    role: null,
                    isAuthenticated: false
                });
            },

            // Update user info
            setUser: (user) => {
                set({ user });
            },

            // Get current token
            getToken: () => get().token,

            // Check if user is a lender
            isLender: () => get().role === 'lender',

            // Check if user is a customer
            isCustomer: () => get().role === 'customer',
        }),
        {
            name: 'auth-storage', // localStorage key
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                role: state.role,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);

export default useAuthStore;

