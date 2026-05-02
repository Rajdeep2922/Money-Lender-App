import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
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
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={() => navigate('/loan-requests')}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
                    title="Back to Requests"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex-1">
                    {isLoading ? (
                        <div className="h-5 bg-slate-700 rounded w-48 animate-pulse" />
                    ) : (
                        <>
                            <h1 className="text-white font-semibold text-lg leading-tight">
                                Chat — {isAccepted ? (loanRequest.guestName || customer?.firstName || 'Customer') : 'Awaiting acceptance'}
                            </h1>
                            <p className="text-slate-400 text-xs">
                                ₹{loanRequest?.amount?.toLocaleString('en-IN')} · {loanRequest?.purpose}
                            </p>
                        </>
                    )}
                </div>
                <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                        isAccepted
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                    }`}
                >
                    {isAccepted ? '✅ Accepted' : '⏳ Pending'}
                </span>
            </div>

            {/* Post-acceptance: show customer full details */}
            {isAccepted && (customer || loanRequest?.guestName) && (
                <div className="mb-3 bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(loanRequest.guestName || customer?.firstName || '?').charAt(0)}
                    </div>
                    <div>
                        <p className="text-white text-sm font-medium">
                            {customer ? `${customer.firstName} ${customer.lastName}` : loanRequest.guestName}
                        </p>
                        {(customer?.email || loanRequest?.guestEmail) && (
                            <p className="text-slate-400 text-xs">{customer?.email || loanRequest.guestEmail}</p>
                        )}
                        {(customer?.phone || loanRequest?.guestPhone) && (
                            <p className="text-slate-400 text-xs">{customer?.phone || loanRequest.guestPhone}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Chat */}
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
