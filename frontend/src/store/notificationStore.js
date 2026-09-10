import { create } from 'zustand';

/**
 * Notification store
 * Tracks unread counts for loan requests and chat rooms.
 * Does NOT store message content (that's React Query's job).
 *
 * Employs timestamp-based reconciliation (fetchInitiatedAt vs lastActionAt)
 * so late-resolving summary fetches never overwrite live socket increments
 * or legitimate user mark-read actions.
 *
 * Note on memory: lastChatActionAt is an in-memory session object keyed by
 * loanRequestId (<10KB) that resets cleanly on page refresh.
 */
const useNotificationStore = create((set) => ({
    // Unread incoming loan requests (for lenders)
    unreadRequests: 0,

    // Unread chat messages per loan request: { [loanRequestId]: count }
    unreadChats: {},

    // Timestamps for conflict-free reconciliation with HTTP fetches
    lastRequestActionAt: 0,
    lastChatActionAt: {},

    incrementUnreadRequests: () =>
        set((state) => ({
            unreadRequests: state.unreadRequests + 1,
            lastRequestActionAt: Date.now(),
        })),

    clearUnreadRequests: () =>
        set({
            unreadRequests: 0,
            lastRequestActionAt: Date.now(),
        }),

    incrementUnreadChat: (loanRequestId) =>
        set((state) => ({
            unreadChats: {
                ...state.unreadChats,
                [loanRequestId]: (state.unreadChats[loanRequestId] || 0) + 1,
            },
            lastChatActionAt: {
                ...state.lastChatActionAt,
                [loanRequestId]: Date.now(),
            },
        })),

    clearUnreadChat: (loanRequestId) =>
        set((state) => {
            const updated = { ...state.unreadChats };
            delete updated[loanRequestId];
            return {
                unreadChats: updated,
                lastChatActionAt: {
                    ...state.lastChatActionAt,
                    [loanRequestId]: Date.now(),
                },
            };
        }),

    /**
     * Hydrate unread summary from backend DB fetch using timestamp reconciliation
     */
    hydrateUnreadSummary: ({ unreadRequests = 0, unreadChats = {}, fetchInitiatedAt = 0 }) =>
        set((state) => {
            // If a local request action occurred AFTER the fetch was initiated, keep local state
            const finalRequests =
                state.lastRequestActionAt > fetchInitiatedAt
                    ? state.unreadRequests
                    : unreadRequests;

            // Reconcile chat counts per loanRequestId
            const mergedChats = { ...unreadChats };
            for (const [id, localCount] of Object.entries(state.unreadChats)) {
                const localActionAt = state.lastChatActionAt[id] || 0;
                if (localActionAt > fetchInitiatedAt) {
                    if (localCount === 0) {
                        delete mergedChats[id];
                    } else {
                        mergedChats[id] = localCount;
                    }
                }
            }

            return {
                unreadRequests: finalRequests,
                unreadChats: mergedChats,
            };
        }),

    getTotalUnreadChats: (state) =>
        Object.values(state.unreadChats).reduce((sum, n) => sum + n, 0),
}));

export default useNotificationStore;
