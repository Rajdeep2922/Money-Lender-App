import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User, Phone, Mail } from 'lucide-react';
import { loanRequestAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import ChatWindow from '../../components/chat/ChatWindow';

/**
 * LenderChatRoom — Lender-side chat with customer (after acceptance)
 */
const LenderChatRoom = () => {
    const { id: loanRequestId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const { data: reqData, isLoading } = useQuery({
        queryKey: ['loan-request', loanRequestId],
        queryFn: () => loanRequestAPI.getById(loanRequestId).then((r) => r.data.data),
    });

    const loanRequest = reqData;
    const customer = loanRequest?.customerId;
    const isAccepted = loanRequest?.status === 'accepted';

    // currentUserId must be user._id (User account ID) — this is what the socket
    // uses as senderId when saving messages, NOT the lenderProfileId
    const currentUserId = user?._id?.toString();

    return (
        <div className="flex flex-col h-[calc(100vh-7.5rem)]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <button
                    onClick={() => navigate('/loan-requests')}
                    className="w-9 h-9 rounded-full bg-white dark:bg-surface-elevated hover:bg-gray-100 dark:hover:bg-surface-border text-gray-700 dark:text-gray-200 border border-hairline-light dark:border-hairline-dark transition-colors flex items-center justify-center shadow-xs"
                    title="Back to Requests"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                    {isLoading ? (
                        <div className="h-5 bg-gray-200 dark:bg-surface-border rounded w-48 animate-pulse" />
                    ) : (
                        <>
                            <h1 className="text-gray-900 dark:text-white font-semibold text-base leading-tight truncate">
                                Chat with {isAccepted ? (loanRequest.guestName || customer?.firstName || 'Borrower') : 'Awaiting Acceptance'}
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

            {/* Post-acceptance customer preview strip */}
            {isAccepted && (customer || loanRequest?.guestName) && (
                <div className="mb-3 bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-xs">
                    <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 text-primary dark:text-primary-light flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {(loanRequest.guestName || customer?.firstName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-3 text-xs flex-wrap min-w-0">
                        <span className="text-gray-900 dark:text-white font-medium flex items-center gap-1">
                            <User className="w-3 h-3 text-gray-400" />
                            {customer ? `${customer.firstName} ${customer.lastName}` : loanRequest.guestName}
                        </span>
                        {(customer?.phone || loanRequest?.guestPhone) && (
                            <span className="text-gray-500 dark:text-gray-400 font-mono flex items-center gap-1">
                                <Phone className="w-3 h-3 text-gray-400" />
                                {customer?.phone || loanRequest.guestPhone}
                            </span>
                        )}
                        {(customer?.email || loanRequest?.guestEmail) && (
                            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Mail className="w-3 h-3 text-gray-400" />
                                {customer?.email || loanRequest.guestEmail}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Chat Window */}
            <div className="flex-1 min-h-0">
                <ChatWindow
                    loanRequestId={loanRequestId}
                    currentUserId={currentUserId}
                    currentRole="lender"
                    disabled={!isAccepted}
                />
            </div>
        </div>
    );
};

export default LenderChatRoom;
