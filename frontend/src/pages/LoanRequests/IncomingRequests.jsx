import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loanRequestAPI } from '../../services/api';
import { formatDistanceToNow } from '../../utils/dateUtils';
import useNotificationStore from '../../store/notificationStore';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { MessageSquare, Check, X, Phone, Inbox } from 'lucide-react';

const STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        className: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
        dotClass: 'bg-amber-500'
    },
    accepted: {
        label: 'Accepted',
        className: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
        dotClass: 'bg-emerald-500'
    },
    rejected: {
        label: 'Rejected',
        className: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
        dotClass: 'bg-rose-500'
    },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.03,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.22,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

/**
 * IncomingRequests — Lender views and responds to loan requests
 */
const IncomingRequests = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { clearUnreadRequests, unreadChats, clearUnreadChat } = useNotificationStore();

    // Clear badge on mount and persist viewed status in DB
    useEffect(() => {
        clearUnreadRequests();
        loanRequestAPI.markSeen().catch(() => {});
    }, [clearUnreadRequests]);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['incoming-loan-requests'],
        queryFn: () => loanRequestAPI.list().then((r) => r.data.data),
        staleTime: 30_000,
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
    });

    const respondMutation = useMutation({
        mutationFn: ({ id, status }) => loanRequestAPI.respond(id, status),
        onSuccess: (_, { id, status }) => {
            toast.success(`Request ${status}`);
            queryClient.invalidateQueries({ queryKey: ['incoming-loan-requests'] });
            queryClient.invalidateQueries({ queryKey: ['loan-request', id] });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Action failed'),
    });

    const requests = data || [];

    // Skeleton loader
    if (isLoading && !data) {
        return (
            <div className="space-y-6">
                <div>
                    <div className="h-7 bg-gray-200 dark:bg-surface-border rounded-lg w-48 animate-pulse mb-2" />
                    <div className="h-4 bg-gray-100 dark:bg-surface-elevated rounded-lg w-72 animate-pulse" />
                </div>
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl h-32 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
                <span className="text-3xl">⚠️</span>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Failed to load loan requests.</p>
                <button
                    onClick={refetch}
                    className="text-primary hover:text-primary-hover text-sm font-medium underline underline-offset-4"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Loan Requests</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Review incoming financing inquiries from prospective borrowers.</p>
            </motion.div>

            {/* Content */}
            {requests.length === 0 ? (
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl"
                >
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-surface-border flex items-center justify-center text-gray-400 mb-3">
                        <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium text-base">No loan requests yet</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 max-w-sm">
                        Borrower applications will show up here as soon as they submit a financing request through your public lender portal.
                    </p>
                </motion.div>
            ) : (
                <motion.div variants={itemVariants} className="space-y-3">
                    {requests.map((req) => {
                        const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                        const isPending = req.status === 'pending';
                        const isResponding = respondMutation.isPending && respondMutation.variables?.id === req._id;
                        const customerName = req.guestName || req.customerId?.firstName ? `${req.customerId?.firstName || ''} ${req.customerId?.lastName || ''}`.trim() : 'Prospective Customer';
                        const initials = (req.guestName || req.customerId?.firstName || 'C').charAt(0).toUpperCase();

                        return (
                            <div
                                key={req._id}
                                className="bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl p-5 hover:border-gray-300 dark:hover:border-hairline-dark-hover transition-colors shadow-xs"
                            >
                                <div className="flex items-start gap-4 flex-wrap">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 text-primary dark:text-primary-light flex items-center justify-center font-bold text-sm flex-shrink-0">
                                        {initials}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2.5 flex-wrap mb-1">
                                            <span className="text-gray-900 dark:text-white font-semibold text-sm">
                                                {customerName}
                                            </span>
                                            {req.guestPhone && (
                                                <span className="text-gray-500 dark:text-gray-400 text-xs font-mono flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> {req.guestPhone}
                                                </span>
                                            )}
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${status.className}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                                                {status.label}
                                            </span>
                                            <span className="text-gray-400 dark:text-gray-500 text-xs ml-auto">
                                                {formatDistanceToNow(req.createdAt)}
                                            </span>
                                        </div>

                                        <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                                            <span className="font-mono tabular-nums font-semibold text-gray-900 dark:text-white">
                                                ₹{req.amount?.toLocaleString('en-IN')}
                                            </span>
                                            <span className="text-gray-400 dark:text-gray-500 mx-1.5">·</span>
                                            <span>{req.purpose}</span>
                                        </p>

                                        {req.message && (
                                            <p className="text-gray-600 dark:text-gray-400 text-xs mt-1.5 bg-gray-50 dark:bg-canvas-dark/40 border border-hairline-light dark:border-hairline-dark rounded-lg px-3 py-2 italic">
                                                "{req.message}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0 self-start mt-0.5">
                                        {isPending ? (
                                            <>
                                                <button
                                                    disabled={isResponding}
                                                    onClick={() => respondMutation.mutate({ id: req._id, status: 'accepted' })}
                                                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all active:scale-95 disabled:opacity-50 shadow-xs"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    {isResponding && respondMutation.variables?.status === 'accepted' ? 'Accepting…' : 'Accept'}
                                                </button>
                                                <button
                                                    disabled={isResponding}
                                                    onClick={() => respondMutation.mutate({ id: req._id, status: 'rejected' })}
                                                    className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-rose-50 dark:bg-surface-border dark:hover:bg-rose-950/30 text-gray-700 hover:text-rose-600 dark:text-gray-300 dark:hover:text-rose-400 border border-hairline-light dark:border-hairline-dark text-xs font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                    {isResponding && respondMutation.variables?.status === 'rejected' ? 'Rejecting…' : 'Decline'}
                                                </button>
                                            </>
                                        ) : req.status === 'accepted' ? (
                                            <button
                                                onClick={() => {
                                                    clearUnreadChat(req._id);
                                                    navigate(`/loan-requests/${req._id}/chat`);
                                                }}
                                                className="relative inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all active:scale-95 shadow-xs"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                Chat
                                                {unreadChats[req._id] > 0 && (
                                                    <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold flex items-center justify-center leading-none">
                                                        {unreadChats[req._id] > 99 ? '99+' : unreadChats[req._id]}
                                                    </span>
                                                )}
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            )}
        </motion.div>
    );
};

export default IncomingRequests;

