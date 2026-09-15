import { formatDistanceToNow } from '../../utils/dateUtils';
import MessageStatusTicks from './MessageStatusTicks';

/**
 * MessageBubble — single chat message with file preview support
 */
const MessageBubble = ({ message, isSelf }) => {
    const { text, fileUrl, fileType, createdAt } = message;
    const timeAgo = formatDistanceToNow(new Date(createdAt));

    return (
        <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-2.5`}>
            <div
                className={`max-w-[80%] sm:max-w-[70%] ${
                    isSelf
                        ? 'bg-primary text-white rounded-2xl rounded-br-xs'
                        : 'bg-gray-100 dark:bg-surface-border text-gray-900 dark:text-gray-100 border border-hairline-light dark:border-hairline-dark rounded-2xl rounded-bl-xs'
                } px-4 py-2.5 shadow-xs`}
            >
                {/* File attachment */}
                {fileUrl && (
                    <div className="mb-2">
                        {fileType === 'image' ? (
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={fileUrl}
                                    alt="attachment"
                                    className="max-w-full rounded-xl max-h-56 object-cover hover:opacity-95 transition-opacity cursor-pointer border border-white/10"
                                />
                            </a>
                        ) : (
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-2 text-xs font-medium py-1.5 px-3 rounded-lg border ${
                                    isSelf
                                        ? 'bg-white/15 border-white/20 text-white hover:bg-white/25'
                                        : 'bg-white dark:bg-surface-elevated border-hairline-light dark:border-hairline-dark text-gray-800 dark:text-gray-200 hover:bg-gray-50'
                                } transition-all`}
                            >
                                <span>{fileType === 'pdf' ? '📄' : '📎'}</span>
                                <span className="truncate max-w-[180px]">
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

                {/* Timestamp & Status Ticks */}
                <div
                    className={`flex items-center justify-end gap-1 text-[10px] font-mono mt-1 ${
                        isSelf ? 'text-white/75' : 'text-gray-500 dark:text-gray-400'
                    }`}
                >
                    <span>{timeAgo}</span>
                    <MessageStatusTicks message={message} isSelf={isSelf} />
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
