import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, CheckCircle, Clock, XCircle, MessageSquare, Send, Paperclip, ArrowLeft, X } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { formatDistanceToNow } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const STATUS_CONFIG = {
    pending:  { icon: Clock,         color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', label: 'Pending Review' },
    accepted: { icon: CheckCircle,   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'Accepted' },
    rejected: { icon: XCircle,       color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',    label: 'Rejected' },
};

const STORAGE_KEY = 'ml_last_tracked_phone';

/**
 * TrackLoanRequest — public page, no login required.
 * Customer enters phone number → sees all requests → if accepted, chat opens.
 * Remembers the last phone number used so results auto-load next time.
 */
const TrackLoanRequest = ({ onClose, initialPhone }) => {
    const savedPhone = localStorage.getItem(STORAGE_KEY) || '';
    const [phone, setPhone] = useState(initialPhone || savedPhone);
    const [requests, setRequests] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeChat, setActiveChat] = useState(null);

    const doTrack = async (phoneNumber) => {
        const cleaned = phoneNumber.trim();
        if (!cleaned) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/public/loan-request/track?phone=${cleaned}`);
            setRequests(res.data.data);
            localStorage.setItem(STORAGE_KEY, cleaned); // remember for next time
        } catch (err) {
            setError(err.response?.data?.message || 'No requests found for this number.');
            setRequests(null);
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = () => doTrack(phone);

    // Auto-load if we already have a saved/initial phone
    useEffect(() => {
        const autoPhone = initialPhone || savedPhone;
        if (autoPhone) doTrack(autoPhone);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Listen for open-track-request event (fired from PublicLoanFlow success screen)
    useEffect(() => {
        const handler = (e) => {
            if (e.detail?.phone) {
                setPhone(e.detail.phone);
                doTrack(e.detail.phone);
            }
        };
        window.addEventListener('open-track-request', handler);
        return () => window.removeEventListener('open-track-request', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {activeChat && (
                            <button
                                onClick={() => setActiveChat(null)}
                                className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-colors"
                                title="Back"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-white font-bold text-base">{activeChat ? `Chat — ${activeChat.request.lender?.businessName}` : 'Check My Loan Request'}</h2>
                            {!activeChat && <p className="text-gray-500 text-xs">Enter your phone number to check status</p>}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-colors"
                        title="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                    <AnimatePresence mode="wait">
                        {/* ── Chat View ── */}
                        {activeChat ? (
                            <GuestChatWindow
                                key="chat"
                                request={activeChat.request}
                                trackingToken={activeChat.trackingToken}
                            />
                        ) : (
                            <motion.div key="track" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-5">
                                {/* Phone input */}
                                <div className="flex gap-2">
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleTrack()}
                                        placeholder="Enter your registered phone number"
                                        className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                                    />
                                    <button
                                        onClick={handleTrack}
                                        disabled={loading}
                                        className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                        {loading ? '' : 'Track'}
                                    </button>
                                </div>

                                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                                {/* Results */}
                                {requests && (
                                    <div className="space-y-3">
                                        {requests.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">No requests found.</p>
                                        ) : requests.map(req => {
                                            const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                                            const StatusIcon = cfg.icon;
                                            return (
                                                <div key={req._id} className={`rounded-xl border p-4 ${cfg.bg}`}>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <StatusIcon className={`w-4 h-4 flex-shrink-0 ${cfg.color}`} />
                                                                <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                                                                <span className="text-gray-500 text-xs ml-auto">{formatDistanceToNow(req.createdAt)}</span>
                                                            </div>
                                                            <p className="text-white font-semibold text-sm">₹{req.amount?.toLocaleString('en-IN')} — {req.purpose}</p>
                                                            <p className="text-gray-400 text-xs mt-0.5">🏦 {req.lender?.businessName}</p>
                                                        </div>
                                                    </div>

                                                    {req.status === 'pending' && (
                                                        <p className="text-yellow-300/70 text-xs mt-3 text-center">
                                                            ⏳ Waiting for lender to respond…
                                                        </p>
                                                    )}

                                                    {req.status === 'rejected' && (
                                                        <p className="text-red-300/70 text-xs mt-3 text-center">
                                                            Your request was not accepted by this lender.
                                                        </p>
                                                    )}

                                                    {req.status === 'accepted' && req.trackingToken && (
                                                        <button
                                                            onClick={() => setActiveChat({ request: req, trackingToken: req.trackingToken })}
                                                            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                                                        >
                                                            <MessageSquare className="w-4 h-4" />
                                                            Open Chat with Lender
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {!requests && !loading && !error && (
                                    <div className="text-center py-10 text-gray-500 text-sm">
                                        <p className="text-4xl mb-3">📋</p>
                                        <p>Enter the phone number you used when submitting the loan request.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

/* ── Embedded guest chat window ─────────────────────────────────────────── */
const GuestChatWindow = ({ request, trackingToken }) => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [joined, setJoined] = useState(false);
    const [connected, setConnected] = useState(false);
    const [uploading, setUploading] = useState(false);
    const socketRef = useRef(null);
    const endRef = useRef(null);
    const fileInputRef = useRef(null);
    const loanRequestId = request._id;

    useEffect(() => {
        const socket = io(SOCKET_URL, {
            auth: { trackingToken },
            transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;

        socket.on('authenticated', () => {
            setConnected(true);
            socket.emit('join_room', { loanRequestId }, (ack) => {
                if (ack?.success) setJoined(true);
                else toast.error(ack?.message || 'Could not join chat');
            });
        });

        socket.on('auth_error', ({ message }) => toast.error(message));

        // Load message history — send trackingToken in header so backend can auth without JWT
        api.get(`/chat/${loanRequestId}/messages`, {
            headers: { 'X-Tracking-Token': trackingToken },
        })
            .then(r => setMessages(r.data.data || []))
            .catch(err => console.warn('History load failed:', err.response?.data?.message || err.message));

        socket.on('new_message', (msg) => {
            setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
        });

        return () => socket.disconnect();
    }, [loanRequestId, trackingToken]);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const send = () => {
        const trimmed = text.trim();
        if (!trimmed || !joined) return;
        socketRef.current?.emit('send_message', { loanRequestId, text: trimmed }, (ack) => {
            if (!ack?.success) toast.error(ack?.message || 'Failed to send');
        });
        setText('');
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !joined) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post(`/upload?loanRequestId=${loanRequestId}`, formData, {
                headers: {
                    'X-Tracking-Token': trackingToken,
                    'Content-Type': 'multipart/form-data',
                },
            });
            const { fileUrl, fileType } = res.data.data;
            socketRef.current?.emit('send_message', { loanRequestId, fileUrl, fileType }, (ack) => {
                if (!ack?.success) toast.error(ack?.message || 'Failed to send file');
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'File upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col h-[480px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
                {!connected && (
                    <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-teal-400 animate-spin" /></div>
                )}
                {messages.length === 0 && connected && (
                    <div className="text-center py-10 text-gray-500 text-sm">
                        <p className="text-3xl mb-2">💬</p>
                        <p>Chat is open! Start the conversation.</p>
                    </div>
                )}
                {messages.map(msg => {
                    // customer = me (guest), lender = them
                    const isSelf = msg.senderType === 'customer';
                    return (
                        <div key={msg._id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isSelf ? 'bg-gradient-to-br from-teal-600 to-cyan-600 text-white rounded-br-sm' : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-sm'}`}>
                                {!isSelf && <p className="text-teal-400 text-xs font-semibold mb-1">Lender</p>}
                                {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                                {msg.fileUrl && (
                                    msg.fileType === 'image'
                                        ? <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                                            <img src={msg.fileUrl} alt="attachment" className="max-w-full rounded-lg max-h-40 object-cover mt-1" />
                                          </a>
                                        : <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="underline text-xs opacity-80 flex items-center gap-1 mt-1">
                                            <Paperclip className="w-3 h-3" /> View attachment
                                          </a>
                                )}
                                <p className="text-[10px] opacity-60 mt-1 text-right">{formatDistanceToNow(msg.createdAt)}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={endRef} />
            </div>

            {/* Input bar */}
            <div className="border-t border-gray-700 p-3 flex gap-2 items-end">
                {/* File upload */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || !joined}
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-teal-400 hover:border-teal-500 transition-all disabled:opacity-40 flex items-center justify-center"
                    title="Attach file"
                >
                    {uploading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Paperclip className="w-4 h-4" />}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                />

                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder={joined ? 'Type a message…' : 'Connecting…'}
                    disabled={!joined}
                    rows={1}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-teal-500 transition-colors disabled:opacity-50"
                />
                <button
                    onClick={send}
                    disabled={!text.trim() || !joined}
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default TrackLoanRequest;
