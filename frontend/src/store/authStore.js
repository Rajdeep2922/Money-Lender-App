import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            // Set user and token after login
            login: (user, token) => {
                set({
                    user,
                    token,
                    isAuthenticated: true
                });
            },

            // Clear user and token on logout
            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false
                });
            },

            // Update user info
            setUser: (user) => {
                set({ user });
            },

            // Get current token
            getToken: () => get().token,
        }),
        {
            name: 'auth-storage', // localStorage key
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);

export default useAuthStore;
