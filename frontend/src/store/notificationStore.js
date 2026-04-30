import { create } from 'zustand';

/**
 * Notification store
 * Tracks unread counts for loan requests and chat rooms.
 * Does NOT store message content (that's React Query's job).
 */
const useNotificationStore = create((set) => ({
    // Unread incoming loan requests (for lenders)
    unreadRequests: 0,

    // Unread chat messages per loan request: { [loanRequestId]: count }
    unreadChats: {},

    incrementUnreadRequests: () =>
        set((state) => ({ unreadRequests: state.unreadRequests + 1 })),

    clearUnreadRequests: () => set({ unreadRequests: 0 }),

    incrementUnreadChat: (loanRequestId) =>
        set((state) => ({
            unreadChats: {
                ...state.unreadChats,
                [loanRequestId]: (state.unreadChats[loanRequestId] || 0) + 1,
            },
        })),

    clearUnreadChat: (loanRequestId) =>
        set((state) => {
            const updated = { ...state.unreadChats };
            delete updated[loanRequestId];
            return { unreadChats: updated };
        }),

    getTotalUnreadChats: (state) =>
        Object.values(state.unreadChats).reduce((sum, n) => sum + n, 0),
}));

export default useNotificationStore;
