const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');

const Lender = require('../src/models/Lender');
const User = require('../src/models/User');
const Customer = require('../src/models/Customer');
const Loan = require('../src/models/Loan');
const LoanRequest = require('../src/models/LoanRequest');
const { protect, generateToken } = require('../src/middleware/auth');
const { notFound, errorHandler } = require('../src/middleware/errorHandler');
const { generateMonthlyInvoicesForLender } = require('../src/controllers/invoiceController');

function countQueries() {
  let count = 0;
  let loanRequestCount = 0;
  const original = mongoose.Query.prototype.exec;
  mongoose.Query.prototype.exec = function (...args) {
    count += 1;
    if (this.model?.modelName === 'LoanRequest') {
      loanRequestCount += 1;
    }
    return original.apply(this, args);
  };
  return {
    get count() { return count; },
    get loanRequestCount() { return loanRequestCount; },
    restore() { mongoose.Query.prototype.exec = original; },
  };
}

function createPerfApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/stats', protect, require('../src/routes/stats'));
  app.use('/api/export', protect, require('../src/routes/export'));
  app.use('/api/chat', require('../src/routes/chat'));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

describe('Phase 4 — N+1 & Query Performance', () => {
  let app, lender, user, token, customer;

  beforeAll(() => {
    app = createPerfApp();
  });

  beforeEach(async () => {
    lender = await Lender.create({
      businessName: 'Perf Finance',
      ownerName: 'Alice',
      email: 'alice@perf.com',
      phone: '9111111111',
    });
    user = await User.create({
      username: 'alice_perf',
      email: 'alice@perf.com',
      password: 'Password123!',
      lenderId: lender._id,
    });
    token = generateToken(user._id, user.tokenVersion);
    customer = await Customer.create({
      firstName: '=SUM(1,2)',
      lastName: 'User',
      email: 'user@perf.com',
      phone: '9000000001',
      lenderId: lender._id,
    });
  });

  async function seedLoans(n) {
    const docs = Array.from({ length: n }, (_, i) => ({
      customerId: customer._id,
      lenderId: lender._id,
      loanNumber: `LN-PERF-${Date.now()}-${i}`,
      principal: 10000,
      monthlyInterestRate: 2,
      loanDurationMonths: 12,
      startDate: new Date('2026-01-01'),
      monthlyEMI: 1000,
      totalAmountPayable: 12000,
      totalInterestAmount: 2000,
      remainingBalance: 12000,
      nextDueDate: new Date('2026-02-01'),
      status: 'active',
      amortizationSchedule: Array.from({ length: 12 }, (__, m) => ({
        month: m + 1,
        dueDate: new Date(2026, m + 1, 1),
        emi: 1000,
        principal: 800,
        interest: 200,
        balance: 12000 - (m + 1) * 1000,
      })),
    }));
    await Loan.insertMany(docs);
  }

  it('invoice generation uses constant <= 5 queries for 50 loans', async () => {
    await seedLoans(50);

    const counter = countQueries();
    try {
      const inserted = await generateMonthlyInvoicesForLender(lender._id);
      expect(inserted).toBe(50);
      expect(counter.count).toBeLessThanOrEqual(5);
    } finally {
      counter.restore();
    }
  });

  it('dashboard stats uses constant <= 6 queries for 50 loans', async () => {
    await seedLoans(50);

    const counter = countQueries();
    try {
      const res = await request(app)
        .get('/api/stats?refresh=true')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.stats.activeLoans).toBe(50);
      // Auth middleware runs 1 User.findById + controller runs 1 countDocuments (aggregates don't use Query.exec)
      expect(counter.count).toBeLessThanOrEqual(6);
    } finally {
      counter.restore();
    }
  });

  it('exports stream via cursor and escape CSV formula injection', async () => {
    const res = await request(app)
      .get('/api/export/customers')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.text).toContain("'=SUM(1,2)");
  });

  it('guest chat performs only 1 LoanRequest lookup', async () => {
    const lr = await LoanRequest.create({
      lenderId: lender._id,
      guestName: 'Guest',
      guestPhone: '9888888888',
      amount: 5000,
      purpose: 'Business',
      status: 'accepted',
    });

    const counter = countQueries();
    try {
      await request(app)
        .get(`/api/chat/${lr._id}/messages`)
        .set('X-Tracking-Token', lr.trackingToken)
        .expect(200);

      expect(counter.loanRequestCount).toBe(1);
    } finally {
      counter.restore();
    }
  });
});
