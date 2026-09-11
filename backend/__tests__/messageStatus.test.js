/**
 * Message Status Ticks Tests
 *
 * Verifies WhatsApp-style status tracking (Sent -> Delivered -> Seen):
 * 1. handleSendMessage creates messages with correct delivered/read state:
 *    - Case A: Offline -> delivered: false, read: false
 *    - Case B: Online-elsewhere -> delivered: true, read: false
 *    - Case C: Actively-in-room -> delivered: true, read: true
 * 2. deliverPendingMessages correctly backfills delivered: true on reconnect:
 *    - for guest borrowers (trackingToken auth where userId is loanRequest._id)
 *    - for portal lenders/customers
 * 3. markMessagesAsRead (chatController):
 *    - sets BOTH read: true AND delivered: true together
 */

const mongoose = require('mongoose');
const Message = require('../src/models/Message');
const LoanRequest = require('../src/models/LoanRequest');
const User = require('../src/models/User');
const Customer = require('../src/models/Customer');
const { markMessagesAsRead } = require('../src/controllers/chatController');
const {
    handleSendMessage,
    deliverPendingMessages,
    userSocketMap,
} = require('../src/socket/socketManager');

describe('Message Status Ticks (Sent → Delivered → Seen)', () => {
    let mockIo;
    let lenderUserId;
    let lenderProfileId;
    let customerUserId;
    let loanReqGuest;
    let loanReqPortal;

    beforeEach(async () => {
        userSocketMap.clear();

        lenderUserId = new mongoose.Types.ObjectId();
        lenderProfileId = new mongoose.Types.ObjectId();
        customerUserId = new mongoose.Types.ObjectId();

        // Create mock lender User
        await User.create({
            _id: lenderUserId,
            username: `lender_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            email: `lender_${Date.now()}@example.com`,
            password: 'hashedpassword',
            lenderId: lenderProfileId,
            isActive: true,
        });

        // Create accepted guest loan request
        loanReqGuest = await LoanRequest.create({
            lenderId: lenderProfileId,
            amount: 50000,
            purpose: 'Guest Loan',
            status: 'accepted',
            trackingToken: `track_${Date.now()}`,
            guestPhone: '9876543210',
            guestName: 'Guest Borrower',
            viewedByLender: true,
        });

        // Create accepted portal customer loan request
        loanReqPortal = await LoanRequest.create({
            lenderId: lenderProfileId,
            customerId: customerUserId,
            amount: 75000,
            purpose: 'Portal Loan',
            status: 'accepted',
            viewedByLender: true,
        });

        // Mock Socket.IO instance
        const roomsMap = new Map();
        mockIo = {
            sockets: {
                adapter: {
                    rooms: roomsMap,
                },
            },
            to: jest.fn().mockImplementation((room) => ({
                emit: jest.fn(),
            })),
        };
    });

    afterEach(() => {
        userSocketMap.clear();
    });

    describe('send_message delivered/read states (offline, online-elsewhere, actively-in-room)', () => {
        test('Case 1 (Offline): receiver is not connected → saved with delivered: false, read: false', async () => {
            // Lender sends message to guest borrower while guest is offline
            const currentUser = {
                userId: lenderUserId.toString(),
                role: 'lender',
                entity: {
                    _id: lenderUserId,
                    lenderId: { _id: lenderProfileId, businessName: 'Quick Money Ltd' },
                },
                isGuest: false,
            };

            const payload = await handleSendMessage({
                io: mockIo,
                currentUser,
                data: {
                    loanRequestId: loanReqGuest._id.toString(),
                    text: 'Hello guest borrower, your loan is approved!',
                },
            });

            expect(payload.delivered).toBe(false);
            expect(payload.deliveredAt).toBeNull();
            expect(payload.read).toBe(false);
            expect(payload.readAt).toBeNull();

            // Verify in MongoDB
            const saved = await Message.findById(payload._id);
            expect(saved.delivered).toBe(false);
            expect(saved.deliveredAt).toBeNull();
            expect(saved.read).toBe(false);
            expect(saved.readAt).toBeNull();
        });

        test('Case 2 (Online-elsewhere): receiver is connected to socket but NOT in chat room → saved with delivered: true, read: false', async () => {
            // Guest is connected (userId in userSocketMap = loanReqGuest._id)
            const guestSocketId = 'socket_guest_123';
            userSocketMap.set(loanReqGuest._id.toString(), guestSocketId);

            // But guest is NOT in the room for this loanRequest
            // (mockIo.sockets.adapter.rooms does NOT contain loanReqGuest._id with guestSocketId)

            const currentUser = {
                userId: lenderUserId.toString(),
                role: 'lender',
                entity: {
                    _id: lenderUserId,
                    lenderId: { _id: lenderProfileId, businessName: 'Quick Money Ltd' },
                },
                isGuest: false,
            };

            const payload = await handleSendMessage({
                io: mockIo,
                currentUser,
                data: {
                    loanRequestId: loanReqGuest._id.toString(),
                    text: 'Are you ready to sign the agreement?',
                },
            });

            expect(payload.delivered).toBe(true);
            expect(payload.deliveredAt).not.toBeNull();
            expect(payload.read).toBe(false);
            expect(payload.readAt).toBeNull();

            // Verify in MongoDB
            const saved = await Message.findById(payload._id);
            expect(saved.delivered).toBe(true);
            expect(saved.deliveredAt).toBeInstanceOf(Date);
            expect(saved.read).toBe(false);
            expect(saved.readAt).toBeNull();
        });

        test('Case 3 (Actively-in-room): receiver is in the chat room → saved with delivered: true, read: true and emits messages_seen', async () => {
            const guestSocketId = 'socket_guest_456';
            userSocketMap.set(loanReqGuest._id.toString(), guestSocketId);

            // Guest socket is actively joined in the room
            const roomSet = new Set([guestSocketId]);
            mockIo.sockets.adapter.rooms.set(loanReqGuest._id.toString(), roomSet);

            const roomEmit = jest.fn();
            mockIo.to.mockImplementation((r) => ({ emit: roomEmit }));

            const currentUser = {
                userId: lenderUserId.toString(),
                role: 'lender',
                entity: {
                    _id: lenderUserId,
                    lenderId: { _id: lenderProfileId, businessName: 'Quick Money Ltd' },
                },
                isGuest: false,
            };

            const payload = await handleSendMessage({
                io: mockIo,
                currentUser,
                data: {
                    loanRequestId: loanReqGuest._id.toString(),
                    text: 'Live chat message while you are looking at the screen',
                },
            });

            expect(payload.delivered).toBe(true);
            expect(payload.deliveredAt).not.toBeNull();
            expect(payload.read).toBe(true);
            expect(payload.readAt).not.toBeNull();

            // Verify in MongoDB
            const saved = await Message.findById(payload._id);
            expect(saved.delivered).toBe(true);
            expect(saved.read).toBe(true);
            expect(saved.deliveredAt).toBeInstanceOf(Date);
            expect(saved.readAt).toBeInstanceOf(Date);

            // Verify messages_seen was broadcast to the room
            expect(mockIo.to).toHaveBeenCalledWith(loanReqGuest._id.toString());
            expect(roomEmit).toHaveBeenCalledWith('messages_seen', expect.objectContaining({
                loanRequestId: loanReqGuest._id.toString(),
            }));
        });
    });

    describe('deliverPendingMessages (offline reconnect backfill)', () => {
        test('backfills delivered: true when guest borrower reconnects with trackingToken auth', async () => {
            // Lender sends 2 messages to guest while guest is offline
            const m1 = await Message.create({
                loanRequestId: loanReqGuest._id,
                senderId: lenderUserId.toString(),
                senderType: 'lender',
                text: 'Offline message 1',
                delivered: false,
                read: false,
            });

            const m2 = await Message.create({
                loanRequestId: loanReqGuest._id,
                senderId: lenderUserId.toString(),
                senderType: 'lender',
                text: 'Offline message 2',
                delivered: false,
                read: false,
            });

            const roomEmit = jest.fn();
            mockIo.to.mockImplementation(() => ({ emit: roomEmit }));

            // Guest reconnects: their userId IS loanReqGuest._id.toString()
            const guestUser = {
                userId: loanReqGuest._id.toString(),
                role: 'customer',
                entity: loanReqGuest,
                isGuest: true,
                guestRequestId: loanReqGuest._id.toString(),
            };

            await deliverPendingMessages(mockIo, guestUser);

            // Confirm messages in MongoDB are now delivered: true
            const updatedM1 = await Message.findById(m1._id);
            const updatedM2 = await Message.findById(m2._id);
            expect(updatedM1.delivered).toBe(true);
            expect(updatedM1.deliveredAt).toBeInstanceOf(Date);
            expect(updatedM1.read).toBe(false); // Still not seen until room is opened!

            expect(updatedM2.delivered).toBe(true);
            expect(updatedM2.deliveredAt).toBeInstanceOf(Date);
            expect(updatedM2.read).toBe(false);

            // Confirm messages_delivered was broadcast to room loanRequestId
            expect(mockIo.to).toHaveBeenCalledWith(loanReqGuest._id.toString());
            expect(roomEmit).toHaveBeenCalledWith('messages_delivered', expect.objectContaining({
                loanRequestId: loanReqGuest._id.toString(),
                messageIds: expect.arrayContaining([m1._id, m2._id]),
            }));
        });

        test('backfills delivered: true when lender reconnects', async () => {
            // Guest sent a message while lender was offline
            const m = await Message.create({
                loanRequestId: loanReqGuest._id,
                senderId: loanReqGuest._id.toString(),
                senderType: 'customer',
                text: 'Guest sent an inquiry while lender offline',
                delivered: false,
                read: false,
            });

            const roomEmit = jest.fn();
            mockIo.to.mockImplementation(() => ({ emit: roomEmit }));

            const lenderUser = {
                userId: lenderUserId.toString(),
                role: 'lender',
                entity: {
                    _id: lenderUserId,
                    lenderId: lenderProfileId,
                },
                isGuest: false,
            };

            await deliverPendingMessages(mockIo, lenderUser);

            const updated = await Message.findById(m._id);
            expect(updated.delivered).toBe(true);
            expect(updated.deliveredAt).toBeInstanceOf(Date);
            expect(updated.read).toBe(false);

            expect(mockIo.to).toHaveBeenCalledWith(loanReqGuest._id.toString());
            expect(roomEmit).toHaveBeenCalledWith('messages_delivered', expect.objectContaining({
                loanRequestId: loanReqGuest._id.toString(),
                messageIds: [m._id],
            }));
        });
    });

    describe('markMessagesAsRead (controller sets read: true AND delivered: true together)', () => {
        test('sets both read: true AND delivered: true for unread peer messages', async () => {
            const customerId = new mongoose.Types.ObjectId();

            const unreadMsg = await Message.create({
                loanRequestId: loanReqPortal._id,
                senderId: customerId,
                senderType: 'customer',
                text: 'Waiting for response',
                delivered: false,
                read: false,
            });

            const roomEmit = jest.fn();
            const mockApp = {
                get: jest.fn().mockReturnValue({
                    to: jest.fn().mockReturnValue({ emit: roomEmit }),
                }),
            };

            const req = {
                params: { loanRequestId: loanReqPortal._id.toString() },
                user: {
                    _id: lenderUserId,
                    lenderId: lenderProfileId,
                },
                app: mockApp,
            };
            const res = { json: jest.fn() };

            await markMessagesAsRead(req, res, jest.fn());

            expect(res.json).toHaveBeenCalled();
            expect(res.json.mock.calls[0][0].modifiedCount).toBe(1);

            const updatedMsg = await Message.findById(unreadMsg._id);
            expect(updatedMsg.read).toBe(true);
            expect(updatedMsg.readAt).toBeInstanceOf(Date);
            expect(updatedMsg.delivered).toBe(true);
            expect(updatedMsg.deliveredAt).toBeInstanceOf(Date);
        });
    });
});
