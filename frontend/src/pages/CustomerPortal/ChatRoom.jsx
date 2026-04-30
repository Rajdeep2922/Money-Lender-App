import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={() => navigate('/portal/loan-requests')}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
                >
                    ←
                </button>
                <div className="flex-1">
                    {isLoading ? (
                        <div className="h-5 bg-slate-700 rounded w-48 animate-pulse" />
                    ) : (
                        <>
                            <h1 className="text-white font-semibold text-lg leading-tight">
                                Chat — {loanRequest?.lenderId?.businessName || 'Lender'}
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
