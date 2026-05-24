import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loanRequestAPI } from '../../services/api';
import { formatDistanceToNow } from '../../utils/dateUtils';
import useNotificationStore from '../../store/notificationStore';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    pending: { label: 'Pending', className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', icon: '⏳' },
    accepted: { label: 'Accepted', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: '✅' },
    rejected: { label: 'Rejected', className: 'bg-red-500/15 text-red-400 border-red-500/30', icon: '❌' },
};

/**
 * IncomingRequests — Lender views and responds to loan requests
 */
const IncomingRequests = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { clearUnreadRequests, unreadChats, clearUnreadChat } = useNotificationStore();

    // Clear badge on mount
    useEffect(() => { clearUnreadRequests(); }, [clearUnreadRequests]);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['incoming-loan-requests'],
        queryFn: () => loanRequestAPI.list().then((r) => r.data.data),
        staleTime: 30_000,
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Loan Requests</h1>
                <p className="text-slate-400 text-sm mt-1">Incoming loan requests from customers.</p>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-slate-800/40 rounded-2xl h-32 animate-pulse" />
                    ))}
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <span className="text-4xl">⚠️</span>
                    <p className="text-slate-400">Failed to load requests.</p>
                    <button onClick={refetch} className="text-violet-400 hover:text-violet-300 text-sm underline">Retry</button>
                </div>
            ) : requests.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-20 text-center">
                    <span className="text-5xl">📭</span>
                    <p className="text-slate-300 font-medium">No loan requests yet</p>
                    <p className="text-slate-500 text-sm">Customers will appear here when they send you a request.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {requests.map((req) => {
                        const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                        const customer = req.customerId;
                        const isPending = req.status === 'pending';
                        const isResponding = respondMutation.isPending && respondMutation.variables?.id === req._id;

                        return (
                            <div
                                key={req._id}
                                className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-all"
                            >
                                <div className="flex items-start gap-4 flex-wrap">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                                        {(req.guestName || req.customerId?.firstName || '?').charAt(0)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                            <span className="text-white font-semibold">
                                                {req.guestName || req.customerId?.firstName || 'Customer'}
                                            </span>
                                            {req.guestPhone && (
                                                <span className="text-gray-500 text-xs">📞 {req.guestPhone}</span>
                                            )}
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${status.className}`}>
                                                {status.icon} {status.label}
                                            </span>
                                            <span className="text-slate-500 text-xs ml-auto">
                                                {formatDistanceToNow(req.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-slate-200 text-sm font-medium">
                                            ₹{req.amount?.toLocaleString('en-IN')} — {req.purpose}
                                        </p>
                                        {req.message && (
                                            <p className="text-slate-400 text-xs mt-1 line-clamp-2 italic">
                                                "{req.message}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 flex-shrink-0 mt-1">
                                        {isPending ? (
                                            <>
                                                <button
                                                    disabled={isResponding}
                                                    onClick={() => respondMutation.mutate({ id: req._id, status: 'accepted' })}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {isResponding && respondMutation.variables?.status === 'accepted' ? '…' : '✓ Accept'}
                                                </button>
                                                <button
                                                    disabled={isResponding}
                                                    onClick={() => respondMutation.mutate({ id: req._id, status: 'rejected' })}
                                                    className="bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {isResponding && respondMutation.variables?.status === 'rejected' ? '…' : '✗ Reject'}
                                                </button>
                                            </>
                                        ) : req.status === 'accepted' ? (
                                            <button
                                                onClick={() => {
                                                    clearUnreadChat(req._id);
                                                    navigate(`/loan-requests/${req._id}/chat`);
                                                }}
                                                className="relative bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95"
                                            >
                                                💬 Chat
                                                {(unreadChats[req._id] > 0) && (
                                                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
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
                </div>
            )}
        </div>
    );
};

export default IncomingRequests;
