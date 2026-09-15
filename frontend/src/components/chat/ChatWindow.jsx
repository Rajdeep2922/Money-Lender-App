import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatAPI } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import useNotificationStore from '../../store/notificationStore';
import MessageBubble from './MessageBubble';
import { Paperclip, SendHorizonal, Lock, MessageSquare } from 'lucide-react';
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
    const { clearUnreadChat } = useNotificationStore();
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [peerTyping, setPeerTyping] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [joined, setJoined] = useState(false);
    const typingTimeoutRef = useRef(null);

    // ── Fetch message history ──────────────────────────────────────────
    const { data: historyData, isLoading } = useQuery({
        queryKey: ['chat-messages', loanRequestId],
        queryFn: () => chatAPI.getMessages(loanRequestId).then((r) => r.data.data),
        enabled: !!loanRequestId && !disabled,
        staleTime: 0,          // always fetch fresh on mount
        refetchOnMount: true,
    });

    const [messages, setMessages] = useState([]);

    // Sync history into local state once loaded
    useEffect(() => {
        if (historyData) setMessages(historyData);
    }, [historyData]);

    // ── Socket.IO: join room + listen for events ───────────────────────
    useEffect(() => {
        if (disabled || !loanRequestId) return;

        // HTTP fallback to mark messages read on mount (in case socket connects later)
        chatAPI.markAsRead(loanRequestId).catch(() => {});
        clearUnreadChat(loanRequestId);

        const socket = getSocket();
        if (!socket) return;

        // Join the room (backend also marks messages as read on join_room)
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

            // If message is from peer while we are actively viewing this chat,
            // mark it as read via socket event (no redundant HTTP call)
            if (msg.senderId !== currentUserId) {
                socket.emit('mark_read', { loanRequestId });
                clearUnreadChat(loanRequestId);
            }
        };

        // Listen for typing
        const handleTyping = ({ userId, isTyping: typing }) => {
            if (userId !== currentUserId) {
                setPeerTyping(typing);
            }
        };

        // Listen for delivery updates (when recipient comes online)
        const handleMessagesDelivered = ({ loanRequestId: targetId, messageIds, deliveredAt }) => {
            if (targetId !== loanRequestId) return;
            setMessages((prev) =>
                prev.map((msg) =>
                    (!messageIds || messageIds.includes(msg._id)) && !msg.read
                        ? { ...msg, delivered: true, deliveredAt: deliveredAt || msg.deliveredAt }
                        : msg
                )
            );
        };

        // Listen for seen updates (when recipient opens/reads messages)
        const handleMessagesSeen = ({ loanRequestId: targetId, readAt }) => {
            if (targetId !== loanRequestId) return;
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.senderId === currentUserId
                        ? { ...msg, read: true, readAt: readAt || new Date(), delivered: true }
                        : msg
                )
            );
        };

        socket.on('new_message', handleNewMessage);
        socket.on('user_typing', handleTyping);
        socket.on('messages_delivered', handleMessagesDelivered);
        socket.on('messages_seen', handleMessagesSeen);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('user_typing', handleTyping);
            socket.off('messages_delivered', handleMessagesDelivered);
            socket.off('messages_seen', handleMessagesSeen);
            socket.emit('leave_room', { loanRequestId });
            setJoined(false);
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
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 text-center bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl p-6 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-surface-border flex items-center justify-center text-gray-400 mb-1">
                    <Lock className="w-5 h-5" />
                </div>
                <p className="text-gray-900 dark:text-white font-medium text-base">Chat is locked</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs max-w-xs">
                    Messaging becomes active immediately once this loan request has been accepted.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-surface-elevated rounded-2xl border border-hairline-light dark:border-hairline-dark shadow-xs overflow-hidden">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full py-12">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 gap-2.5 text-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light flex items-center justify-center">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium text-sm">No messages yet</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Start the conversation with an initial note.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg._id}
                            message={msg}
                            isSelf={msg.senderType === currentRole}
                        />
                    ))
                )}

                {/* Typing indicator */}
                {peerTyping && (
                    <div className="flex justify-start mb-2">
                        <div className="bg-gray-100 dark:bg-surface-border border border-hairline-light dark:border-hairline-dark rounded-2xl rounded-bl-xs px-4 py-2.5 shadow-xs">
                            <div className="flex gap-1.5 items-center">
                                <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
                                <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
                                <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="border-t border-hairline-light dark:border-hairline-dark bg-gray-50 dark:bg-canvas-dark/40 p-3 flex items-end gap-2">
                {/* File upload button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || !joined}
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-white dark:bg-surface-border border border-hairline-light dark:border-hairline-dark text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors disabled:opacity-40 flex items-center justify-center shadow-xs cursor-pointer"
                    title="Attach file"
                >
                    {uploading ? (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Paperclip className="w-4 h-4" />
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
                    placeholder={joined ? 'Type a message… (Enter to send)' : 'Connecting to chat…'}
                    disabled={!joined}
                    rows={1}
                    className="flex-1 bg-white dark:bg-surface-border/60 border border-hairline-light dark:border-hairline-dark rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:border-primary transition-colors disabled:opacity-50 max-h-32"
                    style={{ overflowY: text.split('\n').length > 3 ? 'auto' : 'hidden' }}
                />

                {/* Send button */}
                <button
                    onClick={sendMessage}
                    disabled={!text.trim() || !joined}
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary hover:bg-primary-hover text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center active:scale-95 shadow-xs cursor-pointer"
                    title="Send message"
                >
                    <SendHorizonal className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
