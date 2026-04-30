import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import useNotificationStore from '../../store/notificationStore';
import MessageBubble from './MessageBubble';
import toast from 'react-hot-toast';

/**
 * ChatWindow — reusable real-time chat component
 *
 * Props:
 *   loanRequestId  - The LoanRequest _id (used as Socket.IO room)
 *   currentUserId  - The logged-in user/customer _id
 *   currentRole    - 'customer' | 'lender'
 *   disabled       - Show locked state (e.g., request not yet accepted)
 */
const ChatWindow = ({ loanRequestId, currentUserId, currentRole, disabled = false }) => {
    const { getSocket } = useSocket();
    const queryClient = useQueryClient();
    const { clearUnreadChat } = useNotificationStore();
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [peerTyping, setPeerTyping] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [joined, setJoined] = useState(false);
    const typingTimeoutRef = useRef(null);

    // ── Fetch message history (React Query — NOT Zustand) ──────────────
    const { data: historyData, isLoading } = useQuery({
        queryKey: ['chat-messages', loanRequestId],
        queryFn: () => chatAPI.getMessages(loanRequestId).then((r) => r.data.data),
        enabled: !!loanRequestId && !disabled,
        staleTime: 30_000,
    });

    const [messages, setMessages] = useState([]);

    // Sync history into local state once loaded
    useEffect(() => {
        if (historyData) setMessages(historyData);
    }, [historyData]);

    // ── Socket.IO: join room + listen for events ───────────────────────
    useEffect(() => {
        if (disabled || !loanRequestId) return;
        const socket = getSocket();
        if (!socket) return;

        // Join the room
        socket.emit('join_room', { loanRequestId }, (ack) => {
            if (ack?.success) {
                setJoined(true);
                clearUnreadChat(loanRequestId);
            } else {
                toast.error(ack?.message || 'Could not join chat room');
            }
        });

        // Listen for new messages
        const handleNewMessage = (msg) => {
            setMessages((prev) => {
                // Deduplicate by _id
                if (prev.some((m) => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
        };

        // Listen for typing
        const handleTyping = ({ userId, isTyping: typing }) => {
            if (userId !== currentUserId) {
                setPeerTyping(typing);
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('user_typing', handleTyping);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('user_typing', handleTyping);
        };
    }, [disabled, loanRequestId, getSocket, currentUserId, clearUnreadChat]);

    // ── Auto-scroll to bottom ─────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, peerTyping]);

    // ── Typing indicator ──────────────────────────────────────────────
    const handleTyping = useCallback(
        (value) => {
            setText(value);
            const socket = getSocket();
            if (!socket || !joined) return;

            if (!isTyping) {
                setIsTyping(true);
                socket.emit('typing', { loanRequestId, isTyping: true });
            }
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                socket.emit('typing', { loanRequestId, isTyping: false });
            }, 1500);
        },
        [getSocket, joined, isTyping, loanRequestId]
    );

    // ── Send text message ─────────────────────────────────────────────
    const sendMessage = useCallback(() => {
        const trimmed = text.trim();
        if (!trimmed || !joined) return;

        const socket = getSocket();
        if (!socket) return;

        socket.emit('send_message', { loanRequestId, text: trimmed }, (ack) => {
            if (!ack?.success) toast.error(ack?.message || 'Failed to send message');
        });

        setText('');
        setIsTyping(false);
        clearTimeout(typingTimeoutRef.current);
        socket.emit('typing', { loanRequestId, isTyping: false });
    }, [text, joined, getSocket, loanRequestId]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // ── File upload ───────────────────────────────────────────────────
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !joined) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await chatAPI.upload(loanRequestId, formData);
            const { fileUrl, fileType } = data.data;

            const socket = getSocket();
            if (!socket) return;

            socket.emit(
                'send_message',
                { loanRequestId, fileUrl, fileType, text: undefined },
                (ack) => {
                    if (!ack?.success) toast.error(ack?.message || 'Failed to send file');
                }
            );
        } catch (err) {
            toast.error(err.response?.data?.message || 'File upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // ── Disabled state ────────────────────────────────────────────────
    if (disabled) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <div className="text-5xl">🔒</div>
                <p className="text-slate-400 font-medium">Chat is locked</p>
                <p className="text-slate-500 text-sm">Chat becomes available once the loan request is accepted.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-slate-700/50 overflow-hidden">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-center">
                        <div className="text-4xl">💬</div>
                        <p className="text-slate-400 text-sm">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg._id}
                            message={msg}
                            isSelf={msg.senderId === currentUserId}
                        />
                    ))
                )}

                {/* Typing indicator */}
                {peerTyping && (
                    <div className="flex justify-start mb-2">
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-2.5">
                            <div className="flex gap-1 items-center">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="border-t border-slate-700/50 bg-slate-900/60 p-3 flex items-end gap-2">
                {/* File upload button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || !joined}
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-800 border border-slate-600 text-slate-400 hover:text-violet-400 hover:border-violet-500 transition-all disabled:opacity-40 flex items-center justify-center"
                    title="Attach file"
                >
                    {uploading ? (
                        <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <span className="text-base">📎</span>
                    )}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                />

                {/* Text input */}
                <textarea
                    value={text}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={joined ? 'Type a message… (Enter to send)' : 'Connecting…'}
                    disabled={!joined}
                    rows={1}
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50 max-h-32"
                    style={{ overflowY: text.split('\n').length > 3 ? 'auto' : 'hidden' }}
                />

                {/* Send button */}
                <button
                    onClick={sendMessage}
                    disabled={!text.trim() || !joined}
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center active:scale-95"
                    title="Send message"
                >
                    <span className="text-base">➤</span>
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
