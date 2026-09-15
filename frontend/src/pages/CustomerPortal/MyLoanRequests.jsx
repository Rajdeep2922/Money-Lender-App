import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loanRequestAPI } from '../../services/api';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { MessageSquare, Plus, Inbox } from 'lucide-react';

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

/**
 * MyLoanRequests — Customer views their submitted loan requests
 */
const MyLoanRequests = () => {
    const navigate = useNavigate();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['my-loan-requests'],
        queryFn: () => loanRequestAPI.list().then((r) => r.data.data),
        staleTime: 30_000,
    });

    const requests = data || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">My Loan Requests</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Track your submitted applications, acceptance decisions, and live lender messages.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/portal/lenders')}
                    className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-full transition-all active:scale-95 shadow-xs cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" />
                    New Request
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl h-28 animate-pulse shadow-xs" />
                    ))}
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl">
                    <span className="text-3xl">⚠️</span>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Failed to load your loan requests.</p>
                    <button
                        onClick={refetch}
                        className="text-primary hover:text-primary-hover text-sm font-medium underline underline-offset-4"
                    >
                        Retry
                    </button>
                </div>
            ) : requests.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-20 text-center bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-surface-border flex items-center justify-center text-gray-400 mb-1">
                        <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium text-base">No loan requests yet</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs max-w-sm">
                        Browse verified lenders and submit your initial financing application.
                    </p>
                    <button
                        onClick={() => navigate('/portal/lenders')}
                        className="mt-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-5 py-2 rounded-full transition-colors shadow-xs"
                    >
                        Browse Lenders
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {requests.map((req) => {
                        const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                        const lender = req.lenderId;
                        return (
                            <div
                                key={req._id}
                                className="bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl p-5 hover:border-gray-300 dark:hover:border-hairline-dark-hover transition-colors shadow-xs"
                            >
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span
                                                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${status.className}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                                                {status.label}
                                            </span>
                                            <span className="text-gray-400 dark:text-gray-500 text-xs">
                                                {formatDistanceToNow(req.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-gray-900 dark:text-white font-semibold text-base">
                                            <span className="font-mono tabular-nums">
                                                ₹{req.amount?.toLocaleString('en-IN')}
                                            </span>
                                            <span className="text-gray-400 dark:text-gray-500 mx-1.5">·</span>
                                            <span>{req.purpose}</span>
                                        </p>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 truncate">
                                            Lender: <span className="font-medium text-gray-700 dark:text-gray-300">{lender?.businessName || 'Verified Lender'}</span>
                                        </p>
                                        {req.message && (
                                            <p className="text-gray-600 dark:text-gray-400 text-xs mt-2 bg-gray-50 dark:bg-canvas-dark/40 border border-hairline-light dark:border-hairline-dark rounded-lg px-3 py-1.5 italic line-clamp-2">
                                                "{req.message}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Action */}
                                    {req.status === 'accepted' && (
                                        <button
                                            onClick={() =>
                                                navigate(`/portal/loan-requests/${req._id}/chat`)
                                            }
                                            className="flex-shrink-0 inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-full transition-all active:scale-95 shadow-xs cursor-pointer"
                                        >
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            Open Chat
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyLoanRequests;
