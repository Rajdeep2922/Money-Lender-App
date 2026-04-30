import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loanRequestAPI } from '../../services/api';
import { formatDistanceToNow } from '../../utils/dateUtils';

const STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
        icon: '⏳',
    },
    accepted: {
        label: 'Accepted',
        className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        icon: '✅',
    },
    rejected: {
        label: 'Rejected',
        className: 'bg-red-500/15 text-red-400 border-red-500/30',
        icon: '❌',
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
                    <h1 className="text-2xl font-bold text-white">My Loan Requests</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Track your submitted requests and open chats.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/portal/lenders')}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-95"
                >
                    + New Request
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-slate-800/40 rounded-2xl h-28 animate-pulse" />
                    ))}
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <span className="text-4xl">⚠️</span>
                    <p className="text-slate-400">Failed to load requests.</p>
                    <button onClick={refetch} className="text-violet-400 hover:text-violet-300 text-sm underline">
                        Retry
                    </button>
                </div>
            ) : requests.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-20 text-center">
                    <span className="text-5xl">📋</span>
                    <p className="text-slate-300 font-medium">No loan requests yet</p>
                    <p className="text-slate-500 text-sm">Browse lenders and submit your first request.</p>
                    <button
                        onClick={() => navigate('/portal/lenders')}
                        className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
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
                                className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-all"
                            >
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    {/* Left: lender + details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${status.className}`}
                                            >
                                                {status.icon} {status.label}
                                            </span>
                                            <span className="text-slate-500 text-xs">
                                                {formatDistanceToNow(req.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-white font-semibold text-base truncate">
                                            ₹{req.amount?.toLocaleString('en-IN')} — {req.purpose}
                                        </p>
                                        <p className="text-slate-400 text-sm mt-0.5 truncate">
                                            🏦 {lender?.businessName || 'Lender'}
                                        </p>
                                        {req.message && (
                                            <p className="text-slate-500 text-xs mt-1 line-clamp-1 italic">
                                                "{req.message}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Right: action */}
                                    {req.status === 'accepted' && (
                                        <button
                                            onClick={() =>
                                                navigate(`/portal/loan-requests/${req._id}/chat`)
                                            }
                                            className="flex-shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-95"
                                        >
                                            💬 Open Chat
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
