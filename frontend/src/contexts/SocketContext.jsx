import { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const { token, isAuthenticated, role } = useAuthStore();
    const { incrementUnreadRequests, incrementUnreadChat } = useNotificationStore();

    const getSocket = useCallback(() => socketRef.current, []);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            // Disconnect if logged out
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        // Already connected
        if (socketRef.current?.connected) return;

        const socket = io(SOCKET_URL, {
            auth: { token },
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[Socket] Connected:', socket.id);
        });

        socket.on('auth_error', ({ message }) => {
            console.warn('[Socket] Auth error:', message);
            socket.disconnect();
        });

        // ── Global Notification Events ──────────────────────────────────

        // Lender receives new loan request
        socket.on('new_loan_request', (data) => {
            incrementUnreadRequests();
            toast.custom(
                (t) => (
                    <div
                        className={`flex items-start gap-3 bg-slate-800 border border-violet-500/50 rounded-xl p-4 shadow-2xl max-w-sm ${t.visible ? 'animate-enter' : 'animate-leave'}`}
                    >
                        <span className="text-2xl">💰</span>
                        <div>
                            <p className="font-semibold text-white text-sm">New Loan Request</p>
                            <p className="text-slate-300 text-xs mt-0.5">
                                {data.customerFirstName} requested ₹{data.amount?.toLocaleString('en-IN')} for "{data.purpose}"
                            </p>
                        </div>
                    </div>
                ),
                { duration: 6000, position: 'top-right' }
            );
        });

        // Customer: request accepted
        socket.on('loan_request_accepted', (data) => {
            toast.custom(
                (t) => (
                    <div
                        className={`flex items-start gap-3 bg-slate-800 border border-emerald-500/50 rounded-xl p-4 shadow-2xl max-w-sm ${t.visible ? 'animate-enter' : 'animate-leave'}`}
                    >
                        <span className="text-2xl">✅</span>
                        <div>
                            <p className="font-semibold text-white text-sm">Loan Request Accepted!</p>
                            <p className="text-slate-300 text-xs mt-0.5">
                                {data.lenderBusinessName} accepted your ₹{data.amount?.toLocaleString('en-IN')} request. Chat is now open!
                            </p>
                        </div>
                    </div>
                ),
                { duration: 8000, position: 'top-right' }
            );
        });

        // Customer: request rejected
        socket.on('loan_request_rejected', (data) => {
            toast.custom(
                (t) => (
                    <div
                        className={`flex items-start gap-3 bg-slate-800 border border-red-500/50 rounded-xl p-4 shadow-2xl max-w-sm ${t.visible ? 'animate-enter' : 'animate-leave'}`}
                    >
                        <span className="text-2xl">❌</span>
                        <div>
                            <p className="font-semibold text-white text-sm">Loan Request Declined</p>
                            <p className="text-slate-300 text-xs mt-0.5">
                                {data.lenderBusinessName} declined your request for ₹{data.amount?.toLocaleString('en-IN')}.
                            </p>
                        </div>
                    </div>
                ),
                { duration: 8000, position: 'top-right' }
            );
        });

        // Chat message — used by ChatWindow to append in real-time.
        // Badge increment is handled by message_notification (only fires when user is NOT in the room).
        socket.on('new_message', () => {
            // intentionally empty — ChatWindow handles appending; badge handled below
        });

        // Fired by backend ONLY when receiver is outside the chat room
        socket.on('message_notification', (data) => {
            incrementUnreadChat(data.loanRequestId);
            toast.custom(
                (t) => (
                    <div
                        className={`flex items-start gap-3 bg-slate-800 border border-violet-500/50 rounded-xl p-4 shadow-2xl max-w-sm ${t.visible ? 'animate-enter' : 'animate-leave'}`}
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {data.senderName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm">{data.senderName}</p>
                            <p className="text-slate-300 text-xs mt-0.5 truncate">{data.preview}</p>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-1" />
                    </div>
                ),
                { duration: 5000, position: 'top-right' }
            );
        });

        socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
        });

        socket.on('connect_error', (err) => {
            console.warn('[Socket] Connection error:', err.message);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [isAuthenticated, token]);

    return (
        <SocketContext.Provider value={{ getSocket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);

export default SocketContext;
