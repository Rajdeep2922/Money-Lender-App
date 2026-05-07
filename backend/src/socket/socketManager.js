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
                if (callback) callback({ success: true });
            } catch (err) {
                console.warn(`[Socket] join_room error: ${err.message}`);
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
        socket.on('send_message', async ({ loanRequestId, text, fileUrl, fileType }, callback) => {
            try {
                if (!loanRequestId) throw new Error('loanRequestId is required');
                if (!text && !fileUrl) throw new Error('Message must have text or a file');

                const loanRequest = await verifyRoomAccess(loanRequestId, currentUser);
                if (loanRequest.status !== 'accepted') {
                    throw new Error('Chat is not available: loan request not accepted');
                }

                const message = await Message.create({
                    loanRequestId,
                    senderId: currentUser.userId,
                    senderType: currentUser.role,
                    text: text || undefined,
                    fileUrl: fileUrl || undefined,
                    fileType: fileType || undefined,
                });

                const payload = {
                    _id: message._id,
                    loanRequestId,
                    senderId: currentUser.userId,
                    senderType: currentUser.role,
                    text: message.text,
                    fileUrl: message.fileUrl,
                    fileType: message.fileType,
                    createdAt: message.createdAt,
                };

                // Broadcast to everyone in the chat room (both users get real-time update)
                io.to(loanRequestId).emit('new_message', payload);
                if (callback) callback({ success: true, message: payload });

                // ── Push notification to receiver if they are NOT in the room ──
                try {
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

                    if (receiverId) {
                        // Check if receiver's socket is currently inside this chat room
                        const roomSockets = io.sockets.adapter.rooms.get(loanRequestId);
                        const receiverSocketId = userSocketMap.get(receiverId);
                        const receiverIsInRoom = !!(receiverSocketId && roomSockets?.has(receiverSocketId));

                        if (!receiverIsInRoom) {
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
                                unread: true,
                            });

                            console.log(`[Socket] Notification → ${receiverId} (not in room)`);
                        } else {
                            console.log(`[Socket] Receiver ${receiverId} is in room — no toast needed`);
                        }
                    }
                } catch (notifErr) {
                    // Notification failure must never break the message delivery
                    console.warn('[Socket] Notification error:', notifErr.message);
                }

            } catch (err) {
                console.warn(`[Socket] send_message error: ${err.message}`);
                if (callback) callback({ success: false, message: err.message });
            }
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

module.exports = { initSocketManager, emitToUser, userSocketMap };
