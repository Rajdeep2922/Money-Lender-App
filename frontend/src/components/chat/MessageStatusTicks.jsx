import { Check, CheckCheck } from 'lucide-react';

/**
 * MessageStatusTicks — WhatsApp-style delivery & seen indicators
 *
 * Ticks hierarchy (per-message):
 *   - Seen: Double Blue Tick (matches existing read: true)
 *   - Delivered: Double Grey Tick (recipient socket received message)
 *   - Sent: Single Grey Tick (saved to DB, recipient offline or not delivered yet)
 *
 * Only rendered on messages sent by current user (`isSelf === true`).
 */
const MessageStatusTicks = ({ message, isSelf }) => {
    if (!isSelf || !message) return null;

    const isSeen = Boolean(message.read || message.readAt);
    const isDelivered = Boolean(isSeen || message.delivered || message.deliveredAt);

    if (isSeen) {
        return (
            <span className="inline-flex items-center ml-1 text-sky-400" title="Seen">
                <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
            </span>
        );
    }

    if (isDelivered) {
        return (
            <span className="inline-flex items-center ml-1 text-white/70" title="Delivered">
                <CheckCheck className="w-3.5 h-3.5 stroke-[2]" />
            </span>
        );
    }

    return (
        <span className="inline-flex items-center ml-1 text-white/60" title="Sent">
            <Check className="w-3.5 h-3.5 stroke-[2]" />
        </span>
    );
};

export default MessageStatusTicks;
