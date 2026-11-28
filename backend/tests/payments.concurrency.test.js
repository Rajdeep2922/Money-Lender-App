const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');

const Lender = require('../src/models/Lender');
const User = require('../src/models/User');
const Customer = require('../src/models/Customer');
const Loan = require('../src/models/Loan');
const Payment = require('../src/models/Payment');
const Invoice = require('../src/models/Invoice');
const LoanRequest = require('../src/models/LoanRequest');
const { protect, generateToken } = require('../src/middleware/auth');
const { notFound, errorHandler } = require('../src/middleware/errorHandler');

function createConcurrencyApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', require('../src/routes/auth'));
  app.use('/api/loans', protect, require('../src/routes/loans'));
  app.use('/api/payments', protect, require('../src/routes/payments'));
  app.use('/api/invoices', protect, require('../src/routes/invoices'));
  app.use('/api/loan-request', require('../src/routes/loanRequests'));
  app.use('/api/public', require('../src/routes/public'));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

describe('Phase 3 — Money Integrity & Concurrency', () => {
  let app, lender, user, token, customer, loan;

  beforeAll(() => {
    app = createConcurrencyApp();
  });

  beforeEach(async () => {
    lender = await Lender.create({
      businessName: 'Concurrency Finance',
      ownerName: 'Alice',
      email: 'alice@concurrency.com',
      phone: '9111111111',
    });
    user = await User.create({
      username: 'alice_conc',
      email: 'alice@concurrency.com',
      password: 'Password123!',
      lenderId: lender._id,
    });
    token = generateToken(user._id, user.tokenVersion);

    customer = await Customer.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@doe.com',
      phone: '9000000001',
      lenderId: lender._id,
    });

    const startDate = new Date('2026-01-01');
    loan = await Loan.create({
      customerId: customer._id,
      lenderId: lender._id,
      loanNumber: 'LN-FIXTURE-0001',
      principal: 1000,
      monthlyInterestRate: 0,
      loanDurationMonths: 10,
      startDate,
      monthlyEMI: 100,
      totalAmountPayable: 1000,
      totalInterestAmount: 0,
      remainingBalance: 1000,
      status: 'active',
      amortizationSchedule: Array.from({ length: 10 }, (_, i) => ({
        month: i + 1,
        dueDate: new Date(2026, i + 1, 1),
        emi: 100,
        principal: 100,
        interest: 0,
        balance: 1000 - (i + 1) * 100,
      })),
    });
  });

  const asLender = (req) => req.set('Authorization', `Bearer ${token}`);

  it('1. Two distinct payments at once: 100 each on 1000 -> 2 payments (#1,#2), balance 800', async () => {
    const [r1, r2] = await Promise.all([
      asLender(request(app).post('/api/payments'))
        .set('Idempotency-Key', 'key-1')
        .send({ loanId: loan._id, amountPaid: 100, paymentMethod: 'cash' }),
      asLender(request(app).post('/api/payments'))
        .set('Idempotency-Key', 'key-2')
        .send({ loanId: loan._id, amountPaid: 100, paymentMethod: 'cash' }),
    ]);

    expect([r1.status, r2.status].sort()).toEqual([201, 201]);
    const payments = await Payment.find({ loanId: loan._id }).sort('paymentNumber');
    expect(payments).toHaveLength(2);
    expect(payments.map((p) => p.paymentNumber)).toEqual([1, 2]);
    const updatedLoan = await Loan.findById(loan._id);
    expect(updatedLoan.remainingBalance).toBe(800);
    expect(updatedLoan.paymentsReceived).toBe(2);
  });

  it('2. Same idempotency key twice -> 1 payment, balance reduced once, second replayed: true', async () => {
    const r1 = await asLender(request(app).post('/api/payments'))
      .set('Idempotency-Key', 'same-key-1')
      .send({ loanId: loan._id, amountPaid: 100, paymentMethod: 'cash' });
    const r2 = await asLender(request(app).post('/api/payments'))
      .set('Idempotency-Key', 'same-key-1')
      .send({ loanId: loan._id, amountPaid: 100, paymentMethod: 'cash' });

    expect(r1.status).toBe(201);
    expect(r2.status).toBe(200);
    expect(r2.body.replayed).toBe(true);
    const payments = await Payment.find({ loanId: loan._id });
    expect(payments).toHaveLength(1);
    const updatedLoan = await Loan.findById(loan._id);
    expect(updatedLoan.remainingBalance).toBe(900);
  });

  it('3. Overpayment 1200 on 1000 -> 400, no payment, balance unchanged', async () => {
    const res = await asLender(request(app).post('/api/payments'))
      .set('Idempotency-Key', 'overpay-1')
      .send({ loanId: loan._id, amountPaid: 1200, paymentMethod: 'cash' });

    expect(res.status).toBe(400);
    expect(await Payment.countDocuments({ loanId: loan._id })).toBe(0);
    const updatedLoan = await Loan.findById(loan._id);
    expect(updatedLoan.remainingBalance).toBe(1000);
  });

  it('4. Two foreclosures at once -> one 200, one 409, one settlement payment, balance 0', async () => {
    const [r1, r2] = await Promise.all([
      asLender(request(app).post(`/api/loans/${loan._id}/foreclose`)).send({ paymentMethod: 'CASH' }),
      asLender(request(app).post(`/api/loans/${loan._id}/foreclose`)).send({ paymentMethod: 'CASH' }),
    ]);

    expect([r1.status, r2.status].sort()).toEqual([200, 409]);
    expect(await Payment.countDocuments({ loanId: loan._id })).toBe(1);
    const updatedLoan = await Loan.findById(loan._id);
    expect(updatedLoan.remainingBalance).toBe(0);
    expect(updatedLoan.status).toBe('foreclosed');
  });

  it('5. Two deletes of the same payment -> one 200, one 404, balance credited once', async () => {
    const payRes = await asLender(request(app).post('/api/payments'))
      .set('Idempotency-Key', 'del-setup')
      .send({ loanId: loan._id, amountPaid: 100, paymentMethod: 'cash' })
      .expect(201);
    const paymentId = payRes.body.payment._id;

    const [d1, d2] = await Promise.all([
      asLender(request(app).delete(`/api/payments/${paymentId}`)),
      asLender(request(app).delete(`/api/payments/${paymentId}`)),
    ]);

    expect([d1.status, d2.status].sort()).toEqual([200, 404]);
    const updatedLoan = await Loan.findById(loan._id);
    expect(updatedLoan.remainingBalance).toBe(1000);
    expect(updatedLoan.paymentsReceived).toBe(0);
  });

  it('6. Two invoice generations at once -> one invoice per (loanId, period)', async () => {
    await Promise.all([
      asLender(request(app).post('/api/invoices/generate')),
      asLender(request(app).post('/api/invoices/generate')),
    ]);

    const invoices = await Invoice.find({ loanId: loan._id });
    expect(invoices).toHaveLength(1);
  });

  it('7. Two accepts of the same request -> one 200, one 409', async () => {
    const lr = await LoanRequest.create({
      lenderId: lender._id,
      guestName: 'Guest',
      guestPhone: '9888888888',
      amount: 5000,
      purpose: 'Business',
      status: 'pending',
    });

    const [a1, a2] = await Promise.all([
      asLender(request(app).post(`/api/loan-request/${lr._id}/respond`)).send({ status: 'accepted' }),
      asLender(request(app).post(`/api/loan-request/${lr._id}/respond`)).send({ status: 'accepted' }),
    ]);

    expect([a1.status, a2.status].sort()).toEqual([200, 409]);
  });

  it('8. Two registrations, same email -> one 201, one 4xx, one User, one Lender', async () => {
    const [r1, r2] = await Promise.all([
      request(app).post('/api/auth/register').send({
        email: 'newlender@example.com',
        password: 'Password123!',
      }),
      request(app).post('/api/auth/register').send({
        email: 'newlender@example.com',
        password: 'Password123!',
      }),
    ]);

    const statuses = [r1.status, r2.status].sort();
    expect(statuses[0]).toBe(201);
    expect(statuses[1]).toBeGreaterThanOrEqual(400);
    expect(await User.countDocuments({ email: 'newlender@example.com' })).toBe(1);
    expect(await Lender.countDocuments({ email: 'newlender@example.com' })).toBe(1);
  });

  it('9. Two loan creations -> distinct loanNumber, no duplicate-key 500', async () => {
    const body = {
      customerId: customer._id,
      principal: 5000,
      monthlyInterestRate: 2,
      loanDurationMonths: 6,
      startDate: '2026-01-01',
    };

    const [l1, l2] = await Promise.all([
      asLender(request(app).post('/api/loans')).send(body),
      asLender(request(app).post('/api/loans')).send(body),
    ]);

    expect(l1.status).toBe(201);
    expect(l2.status).toBe(201);
    expect(l1.body.loan.loanNumber).not.toBe(l2.body.loan.loanNumber);
  });

  it('10. Two public requests, same phone -> one 201, one 409', async () => {
    const body = {
      lenderId: lender._id,
      guestName: 'Concurrent Guest',
      guestPhone: '9777777777',
      amount: 3000,
      purpose: 'Medical',
    };

    const [p1, p2] = await Promise.all([
      request(app).post('/api/public/loan-request').send(body),
      request(app).post('/api/public/loan-request').send(body),
    ]);

    expect([p1.status, p2.status].sort()).toEqual([201, 409]);
  });
});
