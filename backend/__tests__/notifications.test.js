/**
 * Notifications and Unread Summary Tests
 *
 * Verifies:
 * 1. GET /api/notifications/unread-summary computes pending requests and unread chats
 * 2. POST /api/loan-request/mark-seen updates viewedByLender
 * 3. POST /api/chat/:loanRequestId/mark-read updates read status with explicit role check
 */

const mongoose = require('mongoose');
const Message = require('../src/models/Message');
const LoanRequest = require('../src/models/LoanRequest');
const { getUnreadSummary } = require('../src/controllers/notificationController');
const { markLoanRequestsSeen } = require('../src/controllers/loanRequestController');
const { markMessagesAsRead } = require('../src/controllers/chatController');

describe('Notification Summary & Read Acknowledgement', () => {
    test('computes unreadRequests and unreadChats accurately for a lender', async () => {
        const lenderProfileId = new mongoose.Types.ObjectId();
        const lenderUserId = new mongoose.Types.ObjectId();

        const mockLenderUser = {
            _id: lenderUserId,
            lenderId: lenderProfileId,
            role: 'lender',
        };

        // Create 2 pending requests (one unviewed, one already viewed)
        await LoanRequest.create({
            lenderId: lenderProfileId,
            amount: 50000,
            purpose: 'Business expansion',
            status: 'pending',
            viewedByLender: false,
        });

        await LoanRequest.create({
            lenderId: lenderProfileId,
            amount: 20000,
            purpose: 'Equipment',
            status: 'pending',
            viewedByLender: true,
        });

        // Create 1 accepted request with unread messages from customer
        const acceptedReq = await LoanRequest.create({
            lenderId: lenderProfileId,
            amount: 100000,
            purpose: 'Working capital',
            status: 'accepted',
            viewedByLender: true,
        });

        // 2 unread customer messages, 1 read customer message, 1 lender message
        const customerId = new mongoose.Types.ObjectId();
        await Message.create({
            loanRequestId: acceptedReq._id,
            senderId: customerId,
            senderType: 'customer',
            text: 'Hello lender',
            read: false,
        });
        await Message.create({
            loanRequestId: acceptedReq._id,
            senderId: customerId,
            senderType: 'customer',
            text: 'Are terms negotiable?',
            read: false,
        });
        await Message.create({
            loanRequestId: acceptedReq._id,
            senderId: customerId,
            senderType: 'customer',
            text: 'Previous message',
            read: true,
        });
        await Message.create({
            loanRequestId: acceptedReq._id,
            senderId: lenderUserId,
            senderType: 'lender',
            text: 'I will check',
            read: false, // Sent by lender, so should not count toward lender's unread
        });

        const req = { user: mockLenderUser };
        const res = {
            json: jest.fn(),
        };

        await getUnreadSummary(req, res, jest.fn());

        expect(res.json).toHaveBeenCalled();
        const responseData = res.json.mock.calls[0][0].data;

        expect(responseData.unreadRequests).toBe(1); // Only viewedByLender: false
        expect(responseData.unreadChats[acceptedReq._id.toString()]).toBe(2);
        expect(responseData.totalUnreadChats).toBe(2);
    });

    test('markLoanRequestsSeen marks all pending requests as viewedByLender: true', async () => {
        const lenderProfileId = new mongoose.Types.ObjectId();
        const mockLenderUser = {
            _id: new mongoose.Types.ObjectId(),
            lenderId: lenderProfileId,
            role: 'lender',
        };

        await LoanRequest.create({
            lenderId: lenderProfileId,
            amount: 50000,
            purpose: 'Test',
            status: 'pending',
            viewedByLender: false,
        });
        await LoanRequest.create({
            lenderId: lenderProfileId,
            amount: 30000,
            purpose: 'Test 2',
            status: 'pending',
            viewedByLender: false,
        });

        const req = { user: mockLenderUser, body: {} };
        const res = { json: jest.fn() };

        await markLoanRequestsSeen(req, res, jest.fn());

        expect(res.json).toHaveBeenCalled();
        expect(res.json.mock.calls[0][0].modifiedCount).toBe(2);

        const remainingUnseen = await LoanRequest.countDocuments({
            lenderId: lenderProfileId,
            viewedByLender: false,
        });
        expect(remainingUnseen).toBe(0);
    });

    test('markMessagesAsRead marks peer messages as read using explicit role mapping', async () => {
        const lenderProfileId = new mongoose.Types.ObjectId();
        const lenderUserId = new mongoose.Types.ObjectId();
        const customerId = new mongoose.Types.ObjectId();

        const loanReq = await LoanRequest.create({
            lenderId: lenderProfileId,
            customerId: customerId,
            amount: 50000,
            purpose: 'Shop',
            status: 'accepted',
        });

        await Message.create({
            loanRequestId: loanReq._id,
            senderId: customerId,
            senderType: 'customer',
            text: 'Need update',
            read: false,
        });

        const req = {
            params: { loanRequestId: loanReq._id.toString() },
            user: {
                _id: lenderUserId,
                lenderId: lenderProfileId,
            },
            app: {
                get: jest.fn().mockReturnValue(null),
            },
        };
        const res = { json: jest.fn() };

        await markMessagesAsRead(req, res, jest.fn());

        expect(res.json).toHaveBeenCalled();
        expect(res.json.mock.calls[0][0].modifiedCount).toBe(1);

        const unreadCount = await Message.countDocuments({
            loanRequestId: loanReq._id,
            read: false,
        });
        expect(unreadCount).toBe(0);
    });
});
