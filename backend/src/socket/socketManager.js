/**
 * Socket.IO Manager
 *
 * Handles real-time events for the Loan Request & Chat system.
 * Supports two auth modes:
 *   1. JWT token  — authenticated lender or portal customer
 *   2. trackingToken — guest customer (no account, used phone to request loan)
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');
const LoanRequest = require('../models/LoanRequest');
const Message = require('../models/Message');
const { JWT_SECRET } = require('../middleware/auth');

// In-memory map: userId (string) → socketId
const userSocketMap = new Map();

const emitToUser = (io, userId, event, data) => {
    const socketId = userSocketMap.get(userId.toString());
    if (socketId) io.to(socketId).emit(event, data);
};

/**
 * Authenticate socket — returns currentUser object.
 * Tries JWT first; falls back to trackingToken for guests.
 */
const authenticateSocket = async (socket) => {
    const { token, trackingToken } = socket.handshake.auth || {};

    // ── Mode 1: JWT (lender or portal customer) ────────────────────────
    if (token) {
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch {
            throw new Error('Invalid or expired token');
        }

        if (decoded.role === 'lender') {
            const user = await User.findById(decoded.id).populate('lenderId');
            if (!user || !user.isActive) throw new Error('Lender account not found or inactive');
            return { userId: user._id.toString(), role: 'lender', entity: user, isGuest: false };
        } else if (decoded.role === 'customer') {
            const customer = await Customer.findById(decoded.id);
            if (!customer || customer.isDeleted) throw new Error('Customer account not found');
            if (!customer.isPortalActive) throw new Error('Customer portal not activated');
            return { userId: customer._id.toString(), role: 'customer', entity: customer, isGuest: false };
        }
        throw new Error('Unknown role in token');
    }

    // ── Mode 2: trackingToken (guest customer, no account) ─────────────
    if (trackingToken) {
        const loanRequest = await LoanRequest.findOne({ trackingToken });
        if (!loanRequest) throw new Error('Invalid tracking token');
        if (loanRequest.status !== 'accepted') {
            throw new Error('Chat not available: request not yet accepted');
        }
        // Use requestId as the guest's "userId" for message alignment
        return {
            userId: loanRequest._id.toString(),
            role: 'customer',
            entity: loanRequest,
            isGuest: true,
            guestRequestId: loanRequest._id.toString(),
        };
    }

    throw new Error('No authentication provided');
};

/**
 * Verify room access — works for both JWT users and guests.
 */
const verifyRoomAccess = async (loanRequestId, currentUser) => {
    const loanRequest = await LoanRequest.findById(loanRequestId);
    if (!loanRequest) throw new Error('Loan request not found');

    let isParticipant = false;

    if (currentUser.isGuest) {
        // Guest: their userId IS the requestId
        isParticipant = currentUser.guestRequestId === loanRequestId;
    } else if (currentUser.role === 'lender') {
        const user = currentUser.entity;
        const lenderProfileId = user.lenderId?._id?.toString() || user.lenderId?.toString();
        isParticipant = loanRequest.lenderId.toString() === lenderProfileId;
    } else {
        // Portal customer
        isParticipant = loanRequest.customerId?.toString() === currentUser.userId;
    }

    if (!isParticipant) throw new Error('Access denied: not a participant in this loan request');
    return loanRequest;
};

/**
 * Deliver pending messages sent to a user while they were offline
 */
const deliverPendingMessages = async (io, currentUser) => {
    try {
        let requestQuery = { status: 'accepted' };
        let peerSenderType = null;

        if (currentUser.role === 'lender') {
            const lenderProfileId = currentUser.entity.lenderId?._id?.toString() || currentUser.entity.lenderId?.toString();
            requestQuery.lenderId = lenderProfileId;
            peerSenderType = 'customer';
        } else if (currentUser.isGuest) {
            requestQuery._id = currentUser.guestRequestId;
            peerSenderType = 'lender';
        } else {
            // Portal customer
            requestQuery.customerId = currentUser.userId;
            peerSenderType = 'lender';
        }

        const acceptedRequests = await LoanRequest.find(requestQuery).select('_id');
        if (!acceptedRequests.length) return;

        const requestIds = acceptedRequests.map((r) => r._id);
        const undeliveredMessages = await Message.find({
            loanRequestId: { $in: requestIds },
            senderType: peerSenderType,
            delivered: false,
        }).select('_id loanRequestId');

        if (!undeliveredMessages.length) return;

        const messageIds = undeliveredMessages.map((m) => m._id);
        const now = new Date();

        await Message.updateMany(
            { _id: { $in: messageIds } },
            { $set: { delivered: true, deliveredAt: now } }
        );

        // Group by loanRequestId to notify active chat rooms
        const roomMap = {};
        undeliveredMessages.forEach((m) => {
            const rId = m.loanRequestId.toString();
            if (!roomMap[rId]) roomMap[rId] = [];
            roomMap[rId].push(m._id);
        });

        Object.entries(roomMap).forEach(([roomId, ids]) => {
            io.to(roomId).emit('messages_delivered', {
                loanRequestId: roomId,
                messageIds: ids,
                deliveredAt: now,
            });
        });
    } catch (err) {
        console.warn('[Socket] deliverPendingMessages error:', err.message);
    }
};

const handleSendMessage = async ({ io, currentUser, data, callback }) => {
    try {
        const { loanRequestId, text, fileUrl, fileType } = data || {};
        if (!loanRequestId) throw new Error('loanRequestId is required');
        if (!text && !fileUrl) throw new Error('Message must have text or a file');

        const loanRequest = await verifyRoomAccess(loanRequestId, currentUser);
        if (loanRequest.status !== 'accepted') {
            throw new Error('Chat is not available: loan request not accepted');
        }

        // Resolve receiver ID
        let receiverId = null;
        let senderName = 'Someone';

        if (currentUser.role === 'lender') {
            // Sender = lender → receiver = customer or guest
            if (loanRequest.customerId) {
                receiverId = loanRequest.customerId.toString();
            } else {
                // Guest: their socket userId = loanRequest._id
                receiverId = loanRequest._id.toString();
            }
            senderName = currentUser.entity.lenderId?.businessName
                || currentUser.entity.name
                || 'Lender';
        } else {
            // Sender = customer or guest → receiver = lender (User account)
            const lenderUser = await User.findOne({ lenderId: loanRequest.lenderId }).select('_id');
            receiverId = lenderUser?._id?.toString();

            if (currentUser.isGuest) {
                senderName = loanRequest.guestName || 'Guest Customer';
            } else {
                const c = currentUser.entity;
                senderName = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Customer';
            }
        }

        // Explicit active room check:
        // Cross-reference userSocketMap with io.sockets.adapter.rooms for this room
        const receiverSocketId = receiverId ? userSocketMap.get(receiverId) : null;
        const isReceiverInRoom = Boolean(
            receiverSocketId && io.sockets?.adapter?.rooms?.get(loanRequestId)?.has(receiverSocketId)
        );

        const now = new Date();
        let delivered = false;
        let deliveredAt = null;
        let read = false;
        let readAt = null;

        if (isReceiverInRoom) {
            // Receiver is actively in this room: immediately delivered and seen!
            delivered = true;
            deliveredAt = now;
            read = true;
            readAt = now;
        } else if (receiverSocketId) {
            // Receiver is online (connected to socket), but in another room/page: delivered!
            delivered = true;
            deliveredAt = now;
        }

        const message = await Message.create({
            loanRequestId,
            senderId: currentUser.userId,
            senderType: currentUser.role,
            text: text || undefined,
            fileUrl: fileUrl || undefined,
            fileType: fileType || undefined,
            delivered,
            deliveredAt,
            read,
            readAt,
        });

        const payload = {
            _id: message._id,
            loanRequestId,
            senderId: currentUser.userId,
            senderType: currentUser.role,
            text: message.text,
            fileUrl: message.fileUrl,
            fileType: message.fileType,
            delivered: message.delivered,
            deliveredAt: message.deliveredAt,
            read: message.read,
            readAt: message.readAt,
            createdAt: message.createdAt,
        };

        // Broadcast to everyone in the chat room (both users get real-time update)
        io.to(loanRequestId).emit('new_message', payload);
        if (callback) callback({ success: true, message: payload });

        // If receiver was actively viewing, broadcast seen update to update sender's ticks to blue
        if (isReceiverInRoom) {
            io.to(loanRequestId).emit('messages_seen', { loanRequestId, readAt: now });
        }

        // ── Push notification to receiver (suppressed by client if viewing chat) ──
        if (receiverId && !isReceiverInRoom) {
            try {
                const preview = text
                    ? (text.length > 50 ? `${text.slice(0, 50)}…` : text)
                    : fileType === 'image'
                        ? '📷 Sent an image'
                        : '📎 Sent an attachment';

                emitToUser(io, receiverId, 'message_notification', {
                    loanRequestId,
                    senderName,
                    preview,
                    timestamp: message.createdAt,
                });
            } catch (notifErr) {
                console.warn('[Socket] Notification error:', notifErr.message);
            }
        }

        return payload;
    } catch (err) {
        console.warn(`[Socket] send_message error: ${err.message}`);
        if (callback) callback({ success: false, message: err.message });
        throw err;
    }
};

/**
 * Initialize Socket.IO event handlers
 */
const initSocketManager = (io) => {
    io.on('connection', async (socket) => {
        let currentUser = null;

        // ── Authentication ────────────────────────────────────────────────
        try {
            currentUser = await authenticateSocket(socket);
            userSocketMap.set(currentUser.userId, socket.id);
            socket.data.user = currentUser;

            console.log(`[Socket] Connected: ${currentUser.role}${currentUser.isGuest ? ' (guest)' : ''} ${currentUser.userId} (${socket.id})`);
            socket.emit('authenticated', { userId: currentUser.userId, role: currentUser.role, isGuest: currentUser.isGuest });

            // Backfill delivery status for messages received while this user was offline
            deliverPendingMessages(io, currentUser);
        } catch (err) {
            console.warn(`[Socket] Auth failed: ${err.message}`);
            socket.emit('auth_error', { message: err.message });
            socket.disconnect(true);
            return;
        }

        // ── Join Chat Room ────────────────────────────────────────────────
        socket.on('join_room', async ({ loanRequestId }, callback) => {
            try {
                if (!loanRequestId) throw new Error('loanRequestId is required');

                const loanRequest = await verifyRoomAccess(loanRequestId, currentUser);

                if (loanRequest.status !== 'accepted') {
                    throw new Error('Chat is only available for accepted loan requests');
                }

                socket.join(loanRequestId);
                console.log(`[Socket] ${currentUser.role} joined room ${loanRequestId}`);

                // Mark any pending unread messages from the peer as read and delivered
                const targetSenderType = currentUser.role === 'lender'
                    ? 'customer'
                    : (currentUser.role === 'customer' ? 'lender' : null);

                if (targetSenderType) {
                    const now = new Date();
                    await Message.updateMany(
                        { loanRequestId, senderType: targetSenderType, read: false },
                        { $set: { read: true, readAt: now, delivered: true, deliveredAt: now } }
                    );
                    // Intentional dual-event design:
                    // messages_read: targeted emit to user for clearing aggregate unread badges across tabs
                    // messages_seen: room-level broadcast to live-update per-message visual ticks in chat window
                    emitToUser(io, currentUser.userId, 'messages_read', { loanRequestId });
                    io.to(loanRequestId).emit('messages_seen', { loanRequestId, readAt: now });
                }

                if (callback) callback({ success: true });
            } catch (err) {
                console.warn(`[Socket] join_room error: ${err.message}`);
                if (callback) callback({ success: false, message: err.message });
            }
        });

        // ── Mark Messages Read (Socket event) ─────────────────────────────
        socket.on('mark_read', async ({ loanRequestId }, callback) => {
            try {
                if (!loanRequestId) return;
                await verifyRoomAccess(loanRequestId, currentUser);
                const targetSenderType = currentUser.role === 'lender'
                    ? 'customer'
                    : (currentUser.role === 'customer' ? 'lender' : null);

                if (targetSenderType) {
                    const now = new Date();
                    await Message.updateMany(
                        { loanRequestId, senderType: targetSenderType, read: false },
                        { $set: { read: true, readAt: now, delivered: true, deliveredAt: now } }
                    );
                    // Intentional dual-event design:
                    // messages_read: targeted emit to user for clearing aggregate unread badges across tabs
                    // messages_seen: room-level broadcast to live-update per-message visual ticks in chat window
                    emitToUser(io, currentUser.userId, 'messages_read', { loanRequestId });
                    io.to(loanRequestId).emit('messages_seen', { loanRequestId, readAt: now });
                    if (callback) callback({ success: true });
                }
            } catch (err) {
                console.warn(`[Socket] mark_read error: ${err.message}`);
                if (callback) callback({ success: false, message: err.message });
            }
        });

        // ── Leave Chat Room ───────────────────────────────────────────────
        // IMPORTANT: must be called on ChatWindow unmount so future messages
        // correctly trigger notifications when the user is no longer viewing the chat.
        socket.on('leave_room', ({ loanRequestId }) => {
            if (!loanRequestId) return;
            socket.leave(loanRequestId);
            console.log(`[Socket] ${currentUser.role} left room ${loanRequestId}`);
        });

        // ── Send Message ──────────────────────────────────────────────────
        socket.on('send_message', (data, callback) => {
            handleSendMessage({ io, currentUser, data, callback }).catch(() => {});
        });


        // ── Typing ────────────────────────────────────────────────────────
        socket.on('typing', ({ loanRequestId, isTyping }) => {
            if (!loanRequestId || !currentUser) return;
            socket.to(loanRequestId).emit('user_typing', {
                userId: currentUser.userId,
                role: currentUser.role,
                isTyping: Boolean(isTyping),
            });
        });

        // ── Disconnect ────────────────────────────────────────────────────
        socket.on('disconnect', () => {
            if (currentUser) {
                userSocketMap.delete(currentUser.userId);
                console.log(`[Socket] Disconnected: ${currentUser.role} ${currentUser.userId}`);
                socket.rooms.forEach((room) => {
                    if (room !== socket.id) {
                        socket.to(room).emit('user_offline', { userId: currentUser.userId, role: currentUser.role });
                    }
                });
            }
        });
    });
};

module.exports = {
    initSocketManager,
    emitToUser,
    userSocketMap,
    deliverPendingMessages,
    handleSendMessage,
    verifyRoomAccess,
    authenticateSocket,
};
