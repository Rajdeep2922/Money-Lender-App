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
const { generateToken } = require('../src/middleware/auth');
const { protect } = require('../src/middleware/auth');
const { notFound, errorHandler } = require('../src/middleware/errorHandler');

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/loans', protect, require('../src/routes/loans'));
  app.use('/api/payments', protect, require('../src/routes/payments'));
  app.use('/api/invoices', protect, require('../src/routes/invoices'));
  app.use('/api/export', protect, require('../src/routes/export'));
  app.use('/api/stats', protect, require('../src/routes/stats'));
  app.use('/api/public', require('../src/routes/public'));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

describe('Phase 1 — Tenant Isolation (P0 Security)', () => {
  let app;
  let lenderA, lenderB;
  let userA, tokenA;
  let customerA, customerB;
  let loanA, loanB;
  let paymentA, paymentB;
  let invoiceA, invoiceB;
  let requestB;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    lenderA = await Lender.create({
      businessName: 'Lender A Finance',
      ownerName: 'Alice',
      email: 'alice@lendera.com',
      phone: '9111111111',
    });
    lenderB = await Lender.create({
      businessName: 'Lender B Finance',
      ownerName: 'Bob',
      email: 'bob@lenderb.com',
      phone: '9222222222',
    });

    userA = await User.create({
      username: 'alice_lender',
      email: 'alice@lendera.com',
      password: 'Password123!',
      lenderId: lenderA._id,
    });
    tokenA = generateToken(userA._id);

    customerA = await Customer.create({
      firstName: 'CustA',
      lastName: 'One',
      email: 'custa@test.com',
      phone: '9000000001',
      lenderId: lenderA._id,
    });
    customerB = await Customer.create({
      firstName: 'CustB',
      lastName: 'Two',
      email: 'custb@test.com',
      phone: '9000000002',
      lenderId: lenderB._id,
    });

    loanA = await Loan.create({
      customerId: customerA._id,
      lenderId: lenderA._id,
      loanNumber: 'LN-2026-A001',
      principal: 10000,
      monthlyInterestRate: 2,
      loanDurationMonths: 10,
      startDate: new Date(),
      monthlyEMI: 1200,
      totalAmountPayable: 12000,
      totalInterestAmount: 2000,
      remainingBalance: 12000,
      status: 'active',
    });

    loanB = await Loan.create({
      customerId: customerB._id,
      lenderId: lenderB._id,
      loanNumber: 'LN-2026-B001',
      principal: 20000,
      monthlyInterestRate: 2,
      loanDurationMonths: 10,
      startDate: new Date(),
      monthlyEMI: 2400,
      totalAmountPayable: 24000,
      totalInterestAmount: 4000,
      remainingBalance: 24000,
      status: 'active',
    });

    paymentA = await Payment.create({
      loanId: loanA._id,
      customerId: customerA._id,
      lenderId: lenderA._id,
      paymentNumber: 1,
      amountPaid: 1200,
      principalPortion: 1000,
      interestPortion: 200,
      balanceAfterPayment: 10800,
    });

    paymentB = await Payment.create({
      loanId: loanB._id,
      customerId: customerB._id,
      lenderId: lenderB._id,
      paymentNumber: 1,
      amountPaid: 2400,
      principalPortion: 2000,
      interestPortion: 400,
      balanceAfterPayment: 21600,
    });

    invoiceA = await Invoice.create({
      invoiceNumber: 'INV-2026-A001',
      lenderId: lenderA._id,
      loanId: loanA._id,
      customerId: customerA._id,
      paymentId: paymentA._id,
      amountDue: 1200,
      amountPaid: 1200,
      balanceDue: 0,
      status: 'paid',
      period: { month: 1, year: 2026 },
    });

    invoiceB = await Invoice.create({
      invoiceNumber: 'INV-2026-B001',
      lenderId: lenderB._id,
      loanId: loanB._id,
      customerId: customerB._id,
      paymentId: paymentB._id,
      amountDue: 2400,
      amountPaid: 2400,
      balanceDue: 0,
      status: 'paid',
      period: { month: 1, year: 2026 },
    });

    requestB = await LoanRequest.create({
      lenderId: lenderB._id,
      guestName: 'Secret Guest',
      guestPhone: '9876543210',
      guestEmail: 'secret@guest.test',
      amount: 5000,
      purpose: 'Working capital',
      message: 'Private message',
      status: 'accepted',
    });
  });

  const asA = (req) => req.set('Authorization', `Bearer ${tokenA}`);

  it('blocks Lender A from reading/mutating Lender B loans', async () => {
    await asA(request(app).get(`/api/loans/${loanB._id}`)).expect(404);
    await asA(request(app).put(`/api/loans/${loanB._id}`).send({ principal: 5000 })).expect(404);
    await asA(request(app).post(`/api/loans/${loanB._id}/approve`)).expect(404);
    await asA(request(app).post(`/api/loans/${loanB._id}/foreclose`).send({ paymentMethod: 'CASH' })).expect(404);
    await asA(request(app).get(`/api/loans/${loanB._id}/agreement`)).expect(404);
    await asA(request(app).delete(`/api/loans/${loanB._id}`)).expect(404);
  });

  it('blocks Lender A from reading/mutating Lender B payments and receipts', async () => {
    await asA(request(app).get(`/api/payments/${paymentB._id}`)).expect(404);
    await asA(request(app).put(`/api/payments/${paymentB._id}`).send({ notes: 'hacked' })).expect(404);
    await asA(request(app).delete(`/api/payments/${paymentB._id}`)).expect(404);
    await asA(request(app).get(`/api/payments/${paymentB._id}/receipt`)).expect(404);
  });

  it('blocks Lender A from downloading/deleting Lender B invoices', async () => {
    await asA(request(app).get(`/api/invoices/${invoiceB._id}/download`)).expect(404);
    await asA(request(app).delete(`/api/invoices/${invoiceB._id}`)).expect(404);
  });

  it('scopes exports to only Lender A rows', async () => {
    const res = await asA(request(app).get('/api/export/customers')).expect(200);
    expect(res.text).toContain('CustA');
    expect(res.text).not.toContain('CustB');
  });

  it('scopes dashboard stats to only Lender A totals', async () => {
    const res = await asA(request(app).get('/api/stats')).expect(200);
    expect(res.body.stats.totalCustomers).toBe(1);
    expect(res.body.stats.totalLent).toBe(10000);
    expect(res.body.stats.totalReceived).toBe(1200);
  });

  it('public phone tracking does not leak trackingToken or PII', async () => {
    const res = await request(app)
      .get('/api/public/loan-request/track')
      .query({ phone: requestB.guestPhone })
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    const item = res.body.data[0];
    expect(item.status).toBe('accepted');
    expect(item.lenderName).toBe('Lender B Finance');
    expect(item.trackingToken).toBeUndefined();
    expect(item.guestName).toBeUndefined();
    expect(item.guestEmail).toBeUndefined();
    expect(item.guestPhone).toBeUndefined();
    expect(item.message).toBeUndefined();
  });

  it('Lender.getLender throws 404 when lenderId is missing or non-existent', async () => {
    await expect(Lender.getLender(null)).rejects.toMatchObject({ statusCode: 404 });
    await expect(Lender.getLender(new mongoose.Types.ObjectId())).rejects.toMatchObject({ statusCode: 404 });
  });
});
