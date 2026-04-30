import { formatDistanceToNow } from '../../utils/dateUtils';


/**
 * MessageBubble — single chat message with file preview support
 */
const MessageBubble = ({ message, isSelf }) => {
    const { text, fileUrl, fileType, createdAt } = message;
    const timeAgo = formatDistanceToNow(new Date(createdAt));

    return (
        <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-3`}>
            <div
                className={`max-w-[75%] ${
                    isSelf
                        ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl rounded-br-sm'
                        : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-2xl rounded-bl-sm'
                } px-4 py-3 shadow-md`}
            >
                {/* File attachment */}
                {fileUrl && (
                    <div className="mb-2">
                        {fileType === 'image' ? (
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={fileUrl}
                                    alt="attachment"
                                    className="max-w-full rounded-lg max-h-48 object-cover hover:opacity-90 transition-opacity cursor-pointer"
                                />
                            </a>
                        ) : (
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 text-sm underline underline-offset-2 ${
                                    isSelf ? 'text-violet-200' : 'text-violet-400'
                                } hover:opacity-80 transition-opacity`}
                            >
                                <span>{fileType === 'pdf' ? '📄' : '📎'}</span>
                                <span className="truncate max-w-[200px]">
                                    {fileUrl.split('/').pop() || 'Document'}
                                </span>
                            </a>
                        )}
                    </div>
                )}

                {/* Text */}
                {text && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{text}</p>
                )}

                {/* Timestamp */}
                <p
                    className={`text-[10px] mt-1.5 ${
                        isSelf ? 'text-violet-200/70' : 'text-slate-500'
                    } text-right`}
                >
                    {timeAgo}
                </p>
            </div>
        </div>
    );
};

export default MessageBubble;
