const express = require('express');
const cors = require('cors');
const request = require('supertest');
const mongoose = require('mongoose');

const Lender = require('../src/models/Lender');
const User = require('../src/models/User');
const Customer = require('../src/models/Customer');
const LoanRequest = require('../src/models/LoanRequest');
const { protect, generateToken, generateCustomerToken } = require('../src/middleware/auth');
const { notFound, errorHandler } = require('../src/middleware/errorHandler');
const { detectMagicMime, uploadFile } = require('../src/controllers/uploadController');
const { isAllowedAttachmentUrl } = require('../src/utils/urlValidator');
const { handleSendMessage } = require('../src/socket/socketManager');

function createAuthTestApp() {
  const app = express();
  const allowedOrigins = ['http://localhost:5173'];
  app.use(cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/auth', require('../src/routes/auth'));
  app.use('/api/customers', protect, require('../src/routes/customers'));
  app.use('/api/loans', protect, require('../src/routes/loans'));
  app.post('/api/upload', ...uploadFile);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

describe('Phase 2 — Auth, Uploads, Sockets & Platform Hardening', () => {
  let app;
  let lender, otherLender, user, token, customer, customerToken;

  beforeAll(() => {
    app = createAuthTestApp();
  });

  beforeEach(async () => {
    lender = await Lender.create({
      businessName: 'Alpha Capital',
      ownerName: 'Alice',
      email: 'alpha@capital.com',
      phone: '9111111111',
    });
    otherLender = await Lender.create({
      businessName: 'Beta Capital',
      ownerName: 'Bob',
      email: 'beta@capital.com',
      phone: '9222222222',
    });

    user = await User.create({
      username: 'alice_auth',
      email: 'alice@capital.com',
      password: 'Password123!',
      lenderId: lender._id,
    });
    token = generateToken(user._id, user.tokenVersion);

    customer = await Customer.create({
      firstName: 'Cust',
      lastName: 'Portal',
      email: 'cust@portal.com',
      phone: '9000000001',
      lenderId: lender._id,
      isPortalActive: true,
      password: 'Password123!',
    });
    customerToken = generateCustomerToken(customer._id, customer.tokenVersion);
  });

  it('rejects a customer token on a lender route with 401', async () => {
    const res = await request(app)
      .get('/api/loans')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(401);
    expect(res.body.message).toMatch(/Invalid token type/i);
  });

  it('revokes existing JWT after logout (tokenVersion increment)', async () => {
    await request(app)
      .get('/api/loans')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app)
      .get('/api/loans')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });

  it('fails startup when JWT_SECRET is absent or < 32 chars', () => {
    jest.isolateModules(() => {
      const orig = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'too-short';
      expect(() => require('../src/middleware/auth')).toThrow(/JWT_SECRET must be set/);
      process.env.JWT_SECRET = orig;
    });
  });

  it('rejects disallowed CORS origin https://evil.example', async () => {
    const res = await request(app)
      .get('/api/loans')
      .set('Origin', 'https://evil.example');
    expect(res.status).toBe(500);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('returns 429 on 11th failed login attempt within 15 minutes', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@capital.com', password: 'WrongPassword!' })
        .expect(401);
    }
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@capital.com', password: 'WrongPassword!' });
    expect(res.status).toBe(429);
  });

  it('blocks mass assignment of lenderId and isDeleted on customer update', async () => {
    await request(app)
      .put(`/api/customers/${customer._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'UpdatedName',
        lenderId: otherLender._id.toString(),
        isDeleted: true,
      })
      .expect(200);

    const reloaded = await Customer.findById(customer._id);
    expect(reloaded.firstName).toBe('UpdatedName');
    expect(reloaded.lenderId.toString()).toBe(lender._id.toString());
    expect(reloaded.isDeleted).toBe(false);
  });

  it('rejects an .exe renamed to .png via magic-byte inspection', async () => {
    const lr = await LoanRequest.create({
      lenderId: lender._id,
      customerId: customer._id,
      amount: 5000,
      purpose: 'Business',
      status: 'accepted',
    });

    // MZ header = Windows PE executable
    const fakePng = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
    expect(detectMagicMime(fakePng)).toBeNull();

    const res = await request(app)
      .post(`/api/upload?loanRequestId=${lr._id}`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', fakePng, { filename: 'trojan.png', contentType: 'image/png' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Unsupported or invalid file content/i);
  });

  it('rejects javascript:alert(1) in chat fileUrl', async () => {
    expect(isAllowedAttachmentUrl('javascript:alert(1)')).toBe(false);
    expect(isAllowedAttachmentUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isAllowedAttachmentUrl('https://res.cloudinary.com/demo/image/upload/v1/sample.jpg')).toBe(true);

    const lr = await LoanRequest.create({
      lenderId: lender._id,
      customerId: customer._id,
      amount: 5000,
      purpose: 'Business',
      status: 'accepted',
    });

    const cb = jest.fn();
    await expect(handleSendMessage({
      io: { to: () => ({ emit: () => {} }) },
      currentUser: { userId: user._id.toString(), role: 'lender', entity: user, isGuest: false },
      data: { loanRequestId: lr._id.toString(), fileUrl: 'javascript:alert(1)', fileType: 'image' },
      callback: cb,
    })).rejects.toThrow('Attachment URL is not allowed');

    expect(cb).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Attachment URL is not allowed',
    }));
  });
});
