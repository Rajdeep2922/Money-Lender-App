const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Lender = require('../src/models/Lender');
const Customer = require('../src/models/Customer');
const Loan = require('../src/models/Loan');
const Payment = require('../src/models/Payment');
const { LOAN_STATUS, CUSTOMER_STATUS, PAYMENT_METHODS } = require('../src/config/constants');

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB at:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        console.log('Clearing existing data...');
        await Customer.deleteMany({});
        await Loan.deleteMany({});
        await Payment.deleteMany({});

        console.log('Updating/Creating Lender...');
        let lender = await Lender.findOne();
        if (lender) {
            lender.email = 'dk708362@gmail.com';
            await lender.save();
        } else {
            lender = await Lender.create({
                businessName: 'Deep Money Lenders',
                ownerName: 'Deep Kumar',
                email: 'dk708362@gmail.com',
                phone: '+91 98765 43210',
                address: {
                    street: '123 Test Lane',
                    city: 'Test City',
                    state: 'Test State',
                    country: 'India'
                }
            });
        }
        console.log('Lender updated:', lender.email);

        console.log('Creating Customers...');
        const customers = await Customer.create([
            {
                firstName: 'Rahul',
                lastName: 'Sharma',
                email: 'rahul.s@example.com',
                phone: '+919998887771',
                address: { city: 'Mumbai', state: 'Maharashtra' },
                aadhaarNumber: '111122223333',
                panNumber: 'ABCDE1234F',
                status: CUSTOMER_STATUS.ACTIVE
            },
            {
                firstName: 'Priya',
                lastName: 'Singh',
                email: 'priya.s@example.com',
                phone: '+919998887772',
                address: { city: 'Delhi', state: 'Delhi' },
                aadhaarNumber: '444455556666',
                panNumber: 'FGHIJ5678K',
                status: CUSTOMER_STATUS.ACTIVE
            },
            {
                firstName: 'Amit',
                lastName: 'Patel',
                email: 'amit.p@example.com',
                phone: '+919998887773',
                address: { city: 'Ahmedabad', state: 'Gujarat' },
                aadhaarNumber: '777788889999',
                panNumber: 'LMNOP9012Q',
                status: CUSTOMER_STATUS.ACTIVE
            },
            {
                firstName: 'Sneha',
                lastName: 'Gupta',
                email: 'sneha.g@example.com',
                phone: '+919998887774',
                address: { city: 'Bangalore', state: 'Karnataka' },
                aadhaarNumber: '121234345656',
                panNumber: 'RSTUV3456W',
                status: CUSTOMER_STATUS.ACTIVE
            },
            {
                firstName: 'Vikram',
                lastName: 'Malhotra',
                email: 'vikram.m@example.com',
                phone: '+919998887775',
                address: { city: 'Pune', state: 'Maharashtra' },
                aadhaarNumber: '909080807070',
                panNumber: 'XYZAB7890C',
                status: CUSTOMER_STATUS.ACTIVE
            }
        ]);

        console.log(`Created ${customers.length} customers`);

        console.log('Creating Loans...');
        const createAmortization = (principal, rate, months) => {
            const r = rate / 12 / 100;
            const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
            const schedule = [];
            let balance = principal;
            const startDate = new Date();

            for (let i = 1; i <= months; i++) {
                const interest = balance * r;
                const principalComponent = emi - interest;
                balance -= principalComponent;
                const dueDate = new Date(startDate);
                dueDate.setMonth(startDate.getMonth() + i);

                schedule.push({
                    month: i,
                    emi: Math.round(emi),
                    principal: Math.round(principalComponent),
                    interest: Math.round(interest),
                    balance: Math.max(0, Math.round(balance)),
                    dueDate
                });
            }
            return { schedule, emi: Math.round(emi) };
        };

        const loansData = [];
        customers.forEach((customer, index) => {
            const principal = 50000 + (index * 10000);
            const rate = 12 + index;
            const duration = 12;
            const { schedule, emi } = createAmortization(principal, rate, duration);
            const totalRepayment = emi * duration;

            loansData.push({
                customerId: customer._id,
                loanNumber: `LN-${2024001 + index}`,
                principal,
                monthlyInterestRate: rate / 12,
                loanDurationMonths: duration,
                startDate: new Date(),
                monthlyEMI: emi,
                totalAmountPayable: totalRepayment,
                totalInterestAmount: totalRepayment - principal,
                remainingBalance: totalRepayment,
                status: index % 2 === 0 ? LOAN_STATUS.ACTIVE : LOAN_STATUS.APPROVED,
                amortizationSchedule: schedule,
                paymentsReceived: 0
            });
        });

        const loans = await Loan.create(loansData);
        console.log(`Created ${loans.length} loans`);

        console.log('Creating Payments...');
        const paymentsData = [];

        for (const loan of loans) {
            if (loan.status === LOAN_STATUS.ACTIVE) {
                let balance = loan.totalAmountPayable;
                for (let i = 0; i < 2; i++) {
                    const sched = loan.amortizationSchedule[i];
                    const amountPaid = sched.emi;
                    const paymentDate = new Date();
                    paymentDate.setMonth(paymentDate.getMonth() - (2 - i));

                    balance -= amountPaid;

                    paymentsData.push({
                        loanId: loan._id,
                        customerId: loan.customerId,
                        paymentNumber: i + 1,
                        amountPaid: amountPaid,
                        principalPortion: sched.principal,
                        interestPortion: sched.interest,
                        paymentMethod: PAYMENT_METHODS.BANK_TRANSFER,
                        paymentDate: paymentDate,
                        balanceAfterPayment: balance,
                        referenceId: `REF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
                    });

                    loan.remainingBalance = balance;
                    loan.paymentsReceived = i + 1;
                }
                await loan.save();
            }
        }

        const payments = await Payment.create(paymentsData);
        console.log(`Created ${payments.length} payments`);

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
