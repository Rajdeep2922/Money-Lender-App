import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { loanRequestAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import ChatWindow from '../../components/chat/ChatWindow';

/**
 * ChatRoom — Customer-side chat with lender (after acceptance)
 */
const ChatRoom = () => {
    const { id: loanRequestId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const { data: reqData, isLoading } = useQuery({
        queryKey: ['loan-request', loanRequestId],
        queryFn: () => loanRequestAPI.getById(loanRequestId).then((r) => r.data.data),
    });

    const loanRequest = reqData;
    const isAccepted = loanRequest?.status === 'accepted';

    return (
        <div className="flex flex-col h-[calc(100vh-7.5rem)]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <button
                    onClick={() => navigate('/portal/loan-requests')}
                    className="w-9 h-9 rounded-full bg-white dark:bg-surface-elevated hover:bg-gray-100 dark:hover:bg-surface-border text-gray-700 dark:text-gray-200 border border-hairline-light dark:border-hairline-dark transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                    title="Back to My Requests"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                    {isLoading ? (
                        <div className="h-5 bg-gray-200 dark:bg-surface-border rounded w-48 animate-pulse" />
                    ) : (
                        <>
                            <h1 className="text-gray-900 dark:text-white font-semibold text-base leading-tight truncate">
                                Chat with {loanRequest?.lenderId?.businessName || 'Lender'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-mono tabular-nums">
                                ₹{loanRequest?.amount?.toLocaleString('en-IN')} · {loanRequest?.purpose}
                            </p>
                        </>
                    )}
                </div>
                <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                        isAccepted
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40'
                    }`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${isAccepted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {isAccepted ? 'Accepted' : 'Pending'}
                </span>
            </div>

            {/* Chat */}
            <div className="flex-1 min-h-0">
                <ChatWindow
                    loanRequestId={loanRequestId}
                    currentUserId={user?._id || loanRequest?.customerId?._id}
                    currentRole="customer"
                    disabled={!isAccepted}
                />
            </div>
        </div>
    );
};

export default ChatRoom;
