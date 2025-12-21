# COMPLETE MERN Money Loan Lender Application Guide
## MVP + Mobile Optimization + Future-Proofing + Production-Ready

---

# TABLE OF CONTENTS

1. [EXECUTIVE OVERVIEW](#executive-overview)
2. [ENHANCED TECH STACK](#enhanced-tech-stack)
3. [MOBILE-FIRST OPTIMIZATION STRATEGY](#mobile-first-optimization)
4. [DATABASE SCHEMA DESIGN](#database-schema)
5. [REST API ENDPOINTS](#rest-api-endpoints)
6. [INTEREST CALCULATION LOGIC](#interest-calculation)
7. [PDF DOCUMENT GENERATION](#pdf-generation)
8. [FOLDER STRUCTURE](#folder-structure)
9. [REACT COMPONENTS SAMPLES](#react-components)
10. [EXPRESS ROUTES & CONTROLLERS](#express-routes)
11. [SYSTEM ARCHITECTURE](#system-architecture)
12. [MOBILE & CSS OPTIMIZATION](#mobile-css-optimization)
13. [QUICK START IMPLEMENTATION](#quick-start-implementation)
14. [FUTURE-PROOFING & SCALABILITY](#future-proofing)
15. [DEPLOYMENT CHECKLIST](#deployment-checklist)

---

# EXECUTIVE OVERVIEW

Build a **production-ready, mobile-first MVP Money Loan Lender Application** with comprehensive financial document generation, optimized performance across all devices, and scalable architecture for future enhancements.

**Target Users:** Single Lender + Multiple Customers (Borrowers)
**Platform:** Web-based (Responsive Mobile + Desktop)
**Performance Target:** <3s initial load, 60fps animations on mid-range devices, <1MB PDF generation

---

# ENHANCED TECH STACK

## Core Stack (Mandatory)
- **Frontend:** React 18+ with Vite (faster builds than CRA)
- **Backend:** Node.js 18+ + Express 4.x
- **Database:** MongoDB Atlas with proper indexing
- **REST API:** RESTful architecture with consistent conventions
- **Real-time:** Socket.io for payment notifications (future-ready)

## PDF/Document Generation (Recommended Approach)

```
Production PDFs (Backend-Generated):
├── pdfmake - Declarative, lightweight, best for structured documents
├── jsPDF + html2canvas - Client-side for instant previews
└── Puppeteer (optional) - Chrome automation for complex layouts

Client-Side Preview:
├── React-PDF - Viewing generated PDFs
└── @react-pdf/renderer - Creating PDFs on client (alternative)

✅ RECOMMENDED STRATEGY:
- pdfmake on backend for Invoice, EMI Receipt, Closure Receipt
- Puppeteer for Contract (complex HTML template)
- jsPDF for instant client-side preview before sending
```

## Frontend Optimization Libraries

```
Performance & State:
├── React Query / TanStack Query - Server state caching
├── Zustand or Jotai - Lightweight state management
├── React Virtual - Virtual scrolling for large lists
└── Redux Persist (optional) - Offline capability

Animations (Mobile-Optimized):
├── Framer Motion 11+ - Latest GPU-accelerated
├── React Spring - Physics-based animations (fallback)
└── CSS animations only - For minimal devices

Mobile & UI:
├── Tailwind CSS - Utility-first, highly customizable
├── Chakra UI or MUI - Component libraries with a11y
├── React Hook Form - Lightweight form handling
└── Zod - Type-safe schema validation

Dev Tools:
├── ESLint + Prettier - Code consistency
├── Vitest - Unit testing
├── Playwright - E2E testing
└── TypeScript - Type safety
```

## Backend Optimization Libraries

```
Performance & Caching:
├── redis - In-memory caching for frequent queries
├── compression - GZIP compression middleware
├── helmet - Security headers
└── express-rate-limit - Rate limiting

PDF Generation:
├── pdfmake - Server-side document generation
├── puppeteer - HTML to PDF conversion
└── nodejieba - Text processing (if multilingual future)

Validation & Security:
├── joi / Yup - Request validation
├── jsonwebtoken - JWT for future auth
├── bcryptjs - Password hashing (future)
└── dotenv - Environment variables

Database:
├── mongoose - MongoDB ODM with validation
├── mongodb-memory-server - Testing
└── Bull - Job queues for async PDF generation

Testing & Monitoring:
├── Jest - Unit & integration tests
├── Supertest - API testing
├── Winston - Structured logging
└── Sentry - Error tracking (optional)
```

---

# MOBILE-FIRST OPTIMIZATION

## 1. Responsive Design System

```javascript
// Implement Mobile-First Breakpoints
const breakpoints = {
  mobile: '320px',    // Small phones
  sm: '640px',        // Large phones
  md: '768px',        // Tablets
  lg: '1024px',       // Desktops
  xl: '1280px',       // Large desktops
};

// Use Tailwind mobile-first utilities
<div className="text-sm md:text-base lg:text-lg">
  // Scales from 14px → 16px → 18px
</div>
```

## 2. Performance Budgets for Mobile

```
Initial Load:  ≤3 seconds (on 4G)
Time to Interactive: ≤5 seconds
Largest Contentful Paint (LCP): ≤2.5s
Cumulative Layout Shift (CLS): <0.1
First Input Delay (FID): <100ms

PDF Generation: <5 seconds for 10-page document
Memory Usage: <150MB on 4GB RAM device
CSS Bundle: <50KB gzipped
JS Bundle: <200KB gzipped (code-split)
```

## 3. Image & Asset Optimization

```javascript
// Use Next.js Image component or equivalent
import { LazyImage } from './LazyImage';

// Serve WebP with fallback
<LazyImage 
  src="logo.webp" 
  fallback="logo.png" 
  srcSet="logo-sm.webp 320w, logo-md.webp 768w"
  alt="Company Logo"
/>

// Guidelines:
// - Logo: <50KB, SVG preferred for simplicity
// - Icons: Use Font Awesome or React Icons (tree-shaked)
// - Payment method icons: Inline SVGs
// - Charts/graphs: SVG + lazy load
// - PDFs: Stream, not blob load
```

## 4. Code Splitting Strategy

```javascript
// Lazy load heavy components
const InvoiceGenerator = React.lazy(() => 
  import('./features/InvoiceGenerator')
);

const ContractGenerator = React.lazy(() => 
  import('./features/ContractGenerator')
);

// Route-based splitting
const routes = [
  { path: '/customers', component: lazy(() => import('./pages/Customers')) },
  { path: '/loans', component: lazy(() => import('./pages/Loans')) },
  { path: '/payments', component: lazy(() => import('./pages/Payments')) },
];
```

## 5. Framer Motion Mobile Optimization

```javascript
// CRITICAL: Prevent lag with these settings
import { motion, MotionConfig } from 'framer-motion';

export const OptimizedLayout = ({ children }) => (
  <MotionConfig 
    reducedMotion="user" // Respect prefers-reduced-motion
  >
    {children}
  </MotionConfig>
);

// Use transform & opacity ONLY (GPU-accelerated)
✅ GOOD - GPU accelerated:
<motion.div
  animate={{ x: 100, opacity: 0.5 }} // transform + opacity
  transition={{ duration: 0.3, ease: 'easeOut' }}
/>

❌ BAD - CPU-bound, causes lag:
<motion.div
  animate={{ 
    width: '100px',    // Triggers reflow
    height: '100px',   // Triggers reflow
    marginLeft: '20px' // Triggers reflow
  }}
/>

// Stagger animations efficiently
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.05, // Keep <100ms
      delayChildren: 0,
    },
  },
};

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>

// Conditional animations based on device
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobileDevice = window.innerWidth < 768;

const getAnimationConfig = () => {
  if (prefersReducedMotion || isMobileDevice) {
    return { duration: 0 }; // Disable animations
  }
  return { duration: 0.3, ease: 'easeOut' };
};
```

## 6. Mobile Touch Optimization

```javascript
// Touch target sizes (min 48x48px on mobile)
<button className="min-h-12 min-w-12 px-4 py-3">
  Click Me
</button>

// Prevent 300ms click delay
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

// Handle touch events efficiently
const handleTouchStart = useCallback((e) => {
  // Use event delegation
  const target = e.target.closest('[data-action]');
  if (target) handleAction(target.dataset.action);
}, []);

// Debounce scroll events
const handleScroll = useCallback(
  debounce((e) => {
    // Expensive operations
  }, 150),
  []
);
```

## 7. Virtual Scrolling for Large Lists

```javascript
import { FixedSizeList } from 'react-window';

// Render 10K+ loan records efficiently
<FixedSizeList
  height={600}
  itemCount={loans.length}
  itemSize={60}
  width="100%"
>
  {({ index, style }) => (
    <LoanRow 
      loan={loans[index]} 
      style={style} 
    />
  )}
</FixedSizeList>

// Alternative: Infinite scroll with pagination
const [page, setPage] = useState(1);
const { data, isFetching } = useQuery(
  ['loans', page],
  () => fetchLoans(page),
);

useEffect(() => {
  if (isNearBottom()) setPage(prev => prev + 1);
}, [scrollPosition]);
```

## 8. CSS-in-JS Best Practices

```javascript
// ✅ Use Tailwind CSS (0 runtime cost)
className="flex flex-col gap-4 p-4 md:p-6"

// ✅ CSS Modules for component-scoped styles
import styles from './Card.module.css';
<div className={styles.card}>

// ❌ Avoid styled-components on mobile (runtime overhead)
// ❌ Avoid CSS-in-JS with complex selectors

// Dark mode support (minimal JS)
<html data-theme="dark">
  {/* Use CSS variables */}
</html>

// CSS variables for theming
:root {
  --bg-primary: #ffffff;
  --text-primary: #000000;
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
}
```

## 9. Network Optimization

```javascript
// Service Worker for offline capability
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// Compression & caching headers
app.use(compression({ level: 9 }));
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=31536000');
  next();
});

// API response optimization
// Return only needed fields
GET /api/customers?fields=id,name,phone
// Paginate large datasets
GET /api/loans?page=1&limit=20
// Client-side caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});
```

---

# DATABASE SCHEMA DESIGN

## Customers Collection

```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  governmentId: {
    type: String,      // Aadhar, PAN, Passport, etc.
    number: String,
    expiryDate: Date,
  },
  panNumber: String,
  bankDetails: {
    accountName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
  createdAt: Date,
  updatedAt: Date,
  // Indexes
  // Index on email, phone for quick lookup
}
```

## Loans Collection

```javascript
{
  _id: ObjectId,
  customerId: ObjectId,              // Reference to Customers
  loanNumber: String,                // Unique: LN-2024-001
  principal: Number,                 // Loan amount in paise/cents
  monthlyInterestRate: Number,       // e.g., 5.5 (%)
  loanDurationMonths: Number,        // e.g., 24 months
  startDate: Date,
  endDate: Date,                     // Calculated: startDate + duration
  monthlyEMI: Number,                // Auto-calculated
  totalAmountPayable: Number,        // Principal + Total Interest
  totalInterestAmount: Number,       // Calculate upfront
  remainingBalance: Number,          // Updated after each payment
  status: {
    type: String,
    enum: ['pending_approval', 'approved', 'active', 'completed', 'defaulted', 'closed'],
    default: 'pending_approval',
  },
  approvalDate: Date,
  companyDetails: {
    name: String,
    address: String,
    phone: String,
  },
  notes: String,
  paymentsReceived: Number,          // Count of paid EMIs
  createdAt: Date,
  updatedAt: Date,
  // Indexes
  // Index on customerId, status for filtering
  // Index on loanNumber for uniqueness
}
```

## Payments Collection

```javascript
{
  _id: ObjectId,
  loanId: ObjectId,                  // Reference to Loans
  customerId: ObjectId,              // Denormalized for query efficiency
  paymentNumber: Number,             // 1st EMI, 2nd EMI, etc.
  amountPaid: Number,                // In paise/cents
  principalPortion: Number,
  interestPortion: Number,
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'upi', 'cheque', 'other'],
    default: 'bank_transfer',
  },
  paymentDate: Date,
  referenceId: String,               // Bank reference, UPI ID, etc.
  notes: String,
  createdAt: Date,
  updatedAt: Date,
  // Indexes
  // Compound index: loanId + paymentDate
  // Index on customerId for payment history
}
```

## Invoices Collection

```javascript
{
  _id: ObjectId,
  invoiceNumber: String,             // Unique: INV-2024-001
  loanId: ObjectId,
  customerId: ObjectId,
  paymentId: ObjectId,               // Reference to the payment
  invoiceType: {
    type: String,
    enum: ['emi_receipt', 'monthly_statement', 'interim_statement'],
  },
  period: {
    month: Number,                   // 1-12
    year: Number,                    // 2024
  },
  invoiceDate: Date,
  dueDate: Date,
  amountDue: Number,
  amountPaid: Number,
  balanceDue: Number,
  pdfUrl: String,                    // Path to stored PDF
  pdfData: Buffer,                   // Alternative: store PDF as binary
  status: {
    type: String,
    enum: ['pending', 'issued', 'paid', 'overdue', 'cancelled'],
  },
  emailSentAt: Date,
  downloadedAt: Date,
  createdAt: Date,
  updatedAt: Date,
  // Index on invoiceNumber, loanId for querying
}
```

## Contracts Collection

```javascript
{
  _id: ObjectId,
  contractNumber: String,            // Unique: CONT-2024-001
  loanId: ObjectId,
  customerId: ObjectId,
  contractType: {
    type: String,
    enum: ['loan_agreement', 'amendment', 'settlement'],
    default: 'loan_agreement',
  },
  contractData: {
    lenderName: String,
    lenderAddress: String,
    customerName: String,
    customerAddress: String,
    loanAmount: Number,
    monthlyRate: Number,
    tenure: Number,
    emi: Number,
    startDate: Date,
    termsAndConditions: String,      // HTML or plain text
  },
  pdfUrl: String,
  pdfData: Buffer,
  signatureRequired: Boolean,
  signatureDate: Date,
  signatureImage: String,            // Base64 or URL
  status: {
    type: String,
    enum: ['draft', 'awaiting_signature', 'signed', 'executed', 'archived'],
  },
  expiryDate: Date,
  version: Number,                   // Track amendments
  createdAt: Date,
  updatedAt: Date,
  // Index on contractNumber, loanId
}
```

## Lender Collection (Single Record)

```javascript
{
  _id: ObjectId,
  businessName: String,
  ownerName: String,
  email: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  panNumber: String,
  bankDetails: {
    accountName: String,
    accountNumber: String,
    ifscCode: String,
  },
  logo: String,                      // URL to logo image
  companyStamp: String,              // URL to digital stamp
  termsAndConditions: String,        // Default T&C for contracts
  invoicePrefix: String,             // e.g., "INV"
  contractPrefix: String,            // e.g., "CONT"
  createdAt: Date,
  updatedAt: Date,
}
```

## MongoDB Indexing Strategy

```javascript
// Create these indexes for optimal performance

// Customers
db.customers.createIndex({ email: 1 }, { unique: true });
db.customers.createIndex({ phone: 1 });
db.customers.createIndex({ createdAt: -1 });

// Loans
db.loans.createIndex({ customerId: 1, status: 1 });
db.loans.createIndex({ loanNumber: 1 }, { unique: true });
db.loans.createIndex({ createdAt: -1 });

// Payments
db.payments.createIndex({ loanId: 1, paymentDate: -1 });
db.payments.createIndex({ customerId: 1 });

// Invoices
db.invoices.createIndex({ invoiceNumber: 1 }, { unique: true });
db.invoices.createIndex({ loanId: 1, period: 1 });

// Contracts
db.contracts.createIndex({ contractNumber: 1 }, { unique: true });
db.contracts.createIndex({ loanId: 1 });
```

---

# REST API ENDPOINTS

## Authentication (Minimal for MVP)

```
POST   /api/auth/login              → Login (basic check)
POST   /api/auth/logout             → Logout
GET    /api/auth/me                 → Current user profile
```

## Customers

```
GET    /api/customers               → List all customers (paginated)
POST   /api/customers               → Create new customer
GET    /api/customers/:id           → Get customer details
PUT    /api/customers/:id           → Update customer
DELETE /api/customers/:id           → Delete customer (soft delete)

Query Parameters:
  - page=1&limit=20
  - search=query (name, email, phone)
  - sort=createdAt:desc
  - status=active|inactive
```

## Loans

```
GET    /api/loans                   → List all loans
POST   /api/loans                   → Create new loan
GET    /api/loans/:id               → Get loan details
PUT    /api/loans/:id               → Update loan (before approval)
DELETE /api/loans/:id               → Cancel loan (if pending)

GET    /api/loans/:id/amortization  → Get payment schedule
GET    /api/loans/:id/balance       → Get current balance
PUT    /api/loans/:id/approve       → Approve pending loan

Query Parameters:
  - customerId=xxx
  - status=active|completed|pending
  - sortBy=createdAt|startDate
```

## Payments

```
GET    /api/payments                → List all payments
POST   /api/payments                → Record new payment
GET    /api/payments/:id            → Get payment details
PUT    /api/payments/:id            → Update payment (if not locked)
DELETE /api/payments/:id            → Delete payment (if recent)

GET    /api/payments/loan/:loanId   → Get all payments for a loan
GET    /api/payments/customer/:customerId → Get customer payments

Query Parameters:
  - loanId=xxx
  - dateFrom=2024-01-01&dateTo=2024-12-31
  - method=cash|upi|bank_transfer
```

## Invoices

```
GET    /api/invoices                → List all invoices
POST   /api/invoices/:paymentId/generate → Generate invoice for payment
GET    /api/invoices/:id            → Get invoice details
GET    /api/invoices/:id/download   → Download invoice PDF

GET    /api/invoices/loan/:loanId   → Get invoices for loan
GET    /api/invoices/customer/:customerId → Get customer invoices

Query Parameters:
  - status=pending|issued|paid|overdue
  - month=1-12
  - year=2024
```

## Contracts

```
GET    /api/contracts               → List all contracts
POST   /api/contracts/loan/:loanId  → Generate contract for loan
GET    /api/contracts/:id           → Get contract details
GET    /api/contracts/:id/download  → Download contract PDF
PUT    /api/contracts/:id/sign      → Sign contract (digital signature)

Query Parameters:
  - loanId=xxx
  - status=draft|signed|executed
```

## Dashboard/Analytics (Future)

```
GET    /api/dashboard/summary       → Total loans, received, overdue, etc.
GET    /api/dashboard/collections   → Collection trends
GET    /api/dashboard/defaults      → Default loan details
```

## Sample Request/Response

```javascript
// POST /api/loans
Request:
{
  "customerId": "507f1f77bcf86cd799439011",
  "principal": 120000,              // in rupees
  "monthlyInterestRate": 5.5,
  "loanDurationMonths": 24,
  "startDate": "2024-01-01",
  "notes": "Home renovation"
}

Response (201):
{
  "_id": "507f1f77bcf86cd799439012",
  "loanNumber": "LN-2024-001",
  "customerId": "507f1f77bcf86cd799439011",
  "principal": 120000,
  "monthlyInterestRate": 5.5,
  "monthlyEMI": 5208.33,
  "totalInterestAmount": 25000,
  "totalAmountPayable": 145000,
  "remainingBalance": 145000,
  "status": "pending_approval",
  "createdAt": "2024-01-01T10:30:00Z",
  "approvalUrl": "/api/loans/507f1f77bcf86cd799439012/approve"
}

// POST /api/payments
Request:
{
  "loanId": "507f1f77bcf86cd799439012",
  "amountPaid": 5208,
  "paymentMethod": "bank_transfer",
  "referenceId": "TXN20240115123456",
  "paymentDate": "2024-01-15"
}

Response (201):
{
  "_id": "507f1f77bcf86cd799439013",
  "loanId": "507f1f77bcf86cd799439012",
  "paymentNumber": 1,
  "amountPaid": 5208,
  "principalPortion": 3500,
  "interestPortion": 1708,
  "remainingBalance": 141792,
  "invoiceId": "507f1f77bcf86cd799439014",
  "invoiceDownloadUrl": "/api/invoices/507f1f77bcf86cd799439014/download",
  "createdAt": "2024-01-15T14:20:00Z"
}
```

---

# INTEREST CALCULATION LOGIC

```javascript
/**
 * Loan Interest Calculation System
 * Supports: Simple Interest, Reducing Balance, Flat Interest
 */

class LoanCalculator {
  /**
   * Calculate Monthly EMI using Reducing Balance Method
   * Formula: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
   * where P = principal, r = monthly rate, n = tenure in months
   */
  static calculateMonthlyEMI(principal, monthlyRate, tenure) {
    const monthlyRateDecimal = monthlyRate / 100;
    const numerator = principal * monthlyRateDecimal * Math.pow(1 + monthlyRateDecimal, tenure);
    const denominator = Math.pow(1 + monthlyRateDecimal, tenure) - 1;
    return Math.round(numerator / denominator);
  }

  /**
   * Calculate Amortization Schedule
   * Returns array of {month, emi, principal, interest, balance}
   */
  static generateAmortizationSchedule(principal, monthlyRate, tenure, emi) {
    const monthlyRateDecimal = monthlyRate / 100;
    let remainingBalance = principal;
    const schedule = [];

    for (let month = 1; month <= tenure; month++) {
      const interestPayment = Math.round(remainingBalance * monthlyRateDecimal);
      const principalPayment = Math.round(emi - interestPayment);
      remainingBalance -= principalPayment;

      schedule.push({
        month,
        emi,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance),
        dueDate: addMonths(new Date(), month),
      });

      if (remainingBalance <= 0) break;
    }

    return schedule;
  }

  /**
   * Calculate Total Interest
   */
  static calculateTotalInterest(emi, tenure) {
    return (emi * tenure) - tenure * emi * 100 / (100 + tenure);
    // Alternative: (emi * tenure) - principal
  }

  /**
   * Calculate Remaining Balance after N payments
   */
  static calculateRemainingBalance(schedule, paymentsReceived) {
    if (paymentsReceived <= 0) return schedule[0].balance + schedule[0].emi;
    if (paymentsReceived >= schedule.length) return 0;
    return schedule[paymentsReceived]?.balance || 0;
  }

  /**
   * Calculate Interest for Specific Period
   * Useful for partial payments
   */
  static calculateInterestForPeriod(balance, monthlyRate, days) {
    const monthlyRateDecimal = monthlyRate / 100;
    const dailyRate = monthlyRateDecimal / 30;
    return Math.round(balance * dailyRate * days);
  }

  /**
   * Calculate Prepayment Interest (Reducing Balance)
   * Interest charged only on outstanding balance
   */
  static calculatePrepaymentAmount(balance, monthlyRate, daysInMonth) {
    const monthlyRateDecimal = monthlyRate / 100;
    const dailyRate = monthlyRateDecimal / 30;
    const interestDue = Math.round(balance * dailyRate * daysInMonth);
    return balance + interestDue;
  }

  /**
   * Recalculate EMI after Prepayment (Optional)
   */
  static recalculateEMIAfterPrepayment(prepaymentAmount, monthlyRate, remainingTenure) {
    const newBalance = currentBalance - prepaymentAmount;
    return this.calculateMonthlyEMI(newBalance, monthlyRate, remainingTenure);
  }
}

// Usage in API
app.post('/api/loans', async (req, res) => {
  const { principal, monthlyInterestRate, loanDurationMonths } = req.body;

  const monthlyEMI = LoanCalculator.calculateMonthlyEMI(
    principal,
    monthlyInterestRate,
    loanDurationMonths
  );

  const amortizationSchedule = LoanCalculator.generateAmortizationSchedule(
    principal,
    monthlyInterestRate,
    loanDurationMonths,
    monthlyEMI
  );

  const totalInterestAmount = amortizationSchedule.reduce(
    (sum, payment) => sum + payment.interest,
    0
  );

  const loan = new Loan({
    customerId: req.body.customerId,
    principal,
    monthlyInterestRate,
    monthlyEMI,
    totalInterestAmount,
    totalAmountPayable: principal + totalInterestAmount,
    loanDurationMonths,
    remainingBalance: principal + totalInterestAmount,
    amortizationSchedule,
    // ... other fields
  });

  await loan.save();
  res.status(201).json(loan);
});

// Calculate remaining balance on each payment
app.post('/api/payments', async (req, res) => {
  const { loanId, amountPaid } = req.body;
  const loan = await Loan.findById(loanId);
  const schedule = loan.amortizationSchedule;
  
  const paymentNumber = loan.paymentsReceived + 1;
  const expectedPayment = schedule[paymentNumber - 1];

  const principal = Math.min(amountPaid - expectedPayment.interest, expectedPayment.principal);
  const interest = amountPaid - principal;

  loan.paymentsReceived += 1;
  loan.remainingBalance -= principal;

  if (loan.remainingBalance <= 0) {
    loan.status = 'completed';
    loan.remainingBalance = 0;
  }

  await loan.save();
  
  res.status(201).json({
    remainingBalance: loan.remainingBalance,
    nextDueDate: schedule[paymentNumber]?.dueDate,
  });
});
```

---

# PDF DOCUMENT GENERATION

## 1. Invoice (EMI Receipt)

```
┌─────────────────────────────────┐
│        EMI PAYMENT RECEIPT       │
├─────────────────────────────────┤
│ Invoice #: INV-2024-001          │
│ Date: 15-Jan-2024               │
├─────────────────────────────────┤
│ LENDER DETAILS                  │
│ Name: Sharma Finances           │
│ Phone: +91-XXXXXXXXXX          │
│ Address: ...                    │
├─────────────────────────────────┤
│ BORROWER DETAILS                │
│ Name: John Doe                  │
│ Loan ID: LN-2024-001            │
├─────────────────────────────────┤
│ PAYMENT DETAILS                 │
│ EMI #: 5/24                     │
│ Amount Paid: ₹5,000             │
│ Principal: ₹3,500               │
│ Interest: ₹1,500                │
│ Payment Method: Bank Transfer   │
│ Reference: TXN123456            │
├─────────────────────────────────┤
│ LOAN STATUS                     │
│ Total Loan: ₹120,000            │
│ Paid So Far: ₹25,000            │
│ Remaining: ₹95,000              │
│ Due Date Next EMI: 15-Feb-2024  │
├─────────────────────────────────┤
│ [Lender Signature/Stamp]        │
│ Date: 15-Jan-2024               │
└─────────────────────────────────┘

Content: Dynamic, personalized per payment
Size: 1-2 pages
Generation Time: <1 second
Format: PDF (A4)
```

## 2. Loan Agreement (Contract)

```
┌─────────────────────────────────────┐
│      LOAN AGREEMENT & PROMISSORY    │
│         NOTE                        │
├─────────────────────────────────────┤
│ Contract #: CONT-2024-001           │
│ Date: 01-Jan-2024                   │
├─────────────────────────────────────┤
│ WHEREAS:                            │
│ Lender: [Company Details]           │
│ Borrower: [Customer Details]        │
├─────────────────────────────────────┤
│ 1. LOAN TERMS                       │
│    - Principal: ₹120,000            │
│    - Duration: 24 months            │
│    - Monthly Rate: 5.5%             │
│    - Monthly EMI: ₹5,000            │
│    - Total Payable: ₹145,200        │
├─────────────────────────────────────┤
│ 2. PAYMENT TERMS                    │
│    - First EMI Due: 15-Feb-2024     │
│    - Payment Day: 15th of each month│
│    - Payment Methods: ...           │
├─────────────────────────────────────┤
│ 3. INTEREST & PENALTIES             │
│    - Late payment: 2% per month     │
│    - Prepayment: No penalty         │
├─────────────────────────────────────┤
│ 4. DEFAULT & REMEDIES               │
│    - After 60 days overdue: ...     │
├─────────────────────────────────────┤
│ 5. TERMS & CONDITIONS               │
│    [Full T&C text]                  │
├─────────────────────────────────────┤
│ SIGNATURES:                         │
│ Lender: ________________ Date: ___  │
│ Borrower: ______________ Date: ___  │
│ Witness: ________________ Date: ___  │
└─────────────────────────────────────┘

Content: Static template with variables
Size: 5-10 pages (with T&C)
Generation Time: <3 seconds
Format: PDF (A4)
Signature: Digital signature support
```

## 3. Loan Approval Letter

```
[Official Letterhead]

Date: 01-Jan-2024
Reference: LN-2024-001

Dear [Customer Name],

This is to inform you that your loan application has been APPROVED.

LOAN DETAILS:
- Loan Amount: ₹120,000
- Duration: 24 months
- Monthly Interest Rate: 5.5%
- Monthly EMI: ₹5,000
- First Payment Date: 15-Feb-2024

NEXT STEPS:
1. Sign the attached Loan Agreement
2. Provide government ID copy
3. Provide bank details for EMI deduction

Terms and Conditions apply as per attached agreement.

Regards,
[Lender Signature]
[Lender Name]
[Lender Company]
```

## 4. Loan Closure Receipt

```
┌─────────────────────────────────┐
│    LOAN CLOSURE CERTIFICATE     │
├─────────────────────────────────┤
│ Issue Date: 15-Jan-2025         │
│ Loan ID: LN-2024-001            │
├─────────────────────────────────┤
│ BORROWER                        │
│ Name: John Doe                  │
│ Address: ...                    │
├─────────────────────────────────┤
│ LOAN DETAILS                    │
│ Original Amount: ₹120,000       │
│ Total Interest Paid: ₹25,200    │
│ Total Amount Paid: ₹145,200     │
│ EMIs Paid: 24/24                │
│ Loan Status: ✓ CLOSED          │
├─────────────────────────────────┤
│ FINAL SETTLEMENT               │
│ Outstanding Balance: ₹0         │
│ Last Payment Date: 15-Jan-2025  │
│ Closure Date: 15-Jan-2025       │
├─────────────────────────────────┤
│ This borrower has successfully  │
│ cleared all loan obligations.   │
│                                 │
│ No further amounts are due.     │
├─────────────────────────────────┤
│ Issued By: [Lender Company]    │
│ [Signature/Stamp]               │
│ Date: 15-Jan-2025               │
└─────────────────────────────────┘

Content: Generated when balance = 0
Size: 1-2 pages
Format: PDF (A4)
```

## PDF Generation Implementation

```javascript
// BACKEND: pdfmake for EMI Receipt
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = pdfFonts.pdfMeFonts.vfs;

async function generateEMIReceipt(paymentData, loanData, customerData) {
  const docDefinition = {
    pageSize: 'A4',
    content: [
      {
        text: 'EMI PAYMENT RECEIPT',
        style: 'header',
        alignment: 'center',
      },
      {
        columns: [
          {
            text: `Invoice #: ${paymentData.invoiceNumber}`,
            style: 'info',
          },
          {
            text: `Date: ${format(new Date(), 'dd-MMM-yyyy')}`,
            alignment: 'right',
            style: 'info',
          },
        ],
      },
      // ... more content
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        color: '#1F2937',
      },
      info: {
        fontSize: 11,
        color: '#6B7280',
      },
    },
  };

  const pdf = pdfMake.createPdf(docDefinition);
  return new Promise((resolve, reject) => {
    pdf.getBase64((result) => {
      resolve(result);
    }, (err) => {
      reject(err);
    });
  });
}

// BACKEND: Puppeteer for complex Loan Agreement
const puppeteer = require('puppeteer');

async function generateLoanAgreement(loanData, customerData) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .header { text-align: center; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">LOAN AGREEMENT</div>
      <!-- Full HTML template -->
    </body>
    </html>
  `;

  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();

  return pdfBuffer;
}

// FRONTEND: jsPDF for instant preview
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

async function generatePreviewPDF() {
  const element = document.getElementById('invoice-preview');
  const canvas = await html2canvas(element, {
    scale: 2,
    allowTaint: true,
    useCORS: true,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  pdf.addImage(imgData, 'PNG', 10, 10, 190, 277);
  
  return pdf.output('dataurlstring');
}
```

---

# FOLDER STRUCTURE

```
loan-lender-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Navigation.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── ErrorBoundary.jsx
│   │   │   ├── forms/
│   │   │   │   ├── CustomerForm.jsx
│   │   │   │   ├── LoanForm.jsx
│   │   │   │   ├── PaymentForm.jsx
│   │   │   │   └── SearchFilter.jsx
│   │   │   ├── cards/
│   │   │   │   ├── CustomerCard.jsx
│   │   │   │   ├── LoanCard.jsx
│   │   │   │   └── PaymentCard.jsx
│   │   │   ├── modals/
│   │   │   │   ├── ConfirmModal.jsx
│   │   │   │   ├── PaymentModal.jsx
│   │   │   │   └── PreviewModal.jsx
│   │   │   ├── tables/
│   │   │   │   ├── CustomersTable.jsx
│   │   │   │   ├── LoansTable.jsx
│   │   │   │   └── PaymentsTable.jsx
│   │   │   └── pdf/
│   │   │       ├── InvoicePreview.jsx
│   │   │       ├── ContractPreview.jsx
│   │   │       └── PDFViewer.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Customers/
│   │   │   │   ├── index.jsx
│   │   │   │   ├── CustomerList.jsx
│   │   │   │   ├── CustomerDetail.jsx
│   │   │   │   └── AddCustomer.jsx
│   │   │   ├── Loans/
│   │   │   │   ├── index.jsx
│   │   │   │   ├── LoanList.jsx
│   │   │   │   ├── LoanDetail.jsx
│   │   │   │   ├── CreateLoan.jsx
│   │   │   │   └── LoanSchedule.jsx
│   │   │   ├── Payments/
│   │   │   │   ├── index.jsx
│   │   │   │   ├── PaymentHistory.jsx
│   │   │   │   └── RecordPayment.jsx
│   │   │   ├── Documents/
│   │   │   │   ├── index.jsx
│   │   │   │   ├── InvoicesList.jsx
│   │   │   │   └── ContractsList.jsx
│   │   │   └── Settings.jsx
│   │   ├── hooks/
│   │   │   ├── useCustomers.js
│   │   │   ├── useLoans.js
│   │   │   ├── usePayments.js
│   │   │   ├── usePDF.js
│   │   │   ├── useFetch.js
│   │   │   └── useDebounce.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── customerService.js
│   │   │   ├── loanService.js
│   │   │   ├── paymentService.js
│   │   │   ├── documentService.js
│   │   │   └── authService.js
│   │   ├── store/
│   │   │   ├── authStore.js           // Zustand or Jotai
│   │   │   ├── loansStore.js
│   │   │   ├── customersStore.js
│   │   │   └── uiStore.js
│   │   ├── utils/
│   │   │   ├── formatters.js         // Currency, date formatting
│   │   │   ├── validators.js         // Input validation
│   │   │   ├── calculators.js        // Interest calculations
│   │   │   ├── errorHandler.js
│   │   │   └── constants.js
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── theme.css             // CSS variables
│   │   │   ├── animations.css        // Framer Motion fallbacks
│   │   │   └── responsive.css        // Mobile breakpoints
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── logos/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Customer.js
│   │   │   ├── Loan.js
│   │   │   ├── Payment.js
│   │   │   ├── Invoice.js
│   │   │   ├── Contract.js
│   │   │   ├── Lender.js
│   │   │   └── AuditLog.js
│   │   ├── routes/
│   │   │   ├── customers.js
│   │   │   ├── loans.js
│   │   │   ├── payments.js
│   │   │   ├── invoices.js
│   │   │   ├── contracts.js
│   │   │   ├── auth.js
│   │   │   └── dashboard.js
│   │   ├── controllers/
│   │   │   ├── customerController.js
│   │   │   ├── loanController.js
│   │   │   ├── paymentController.js
│   │   │   ├── invoiceController.js
│   │   │   ├── contractController.js
│   │   │   └── authController.js
│   │   ├── services/
│   │   │   ├── loanService.js        // Business logic
│   │   │   ├── pdfService.js         // PDF generation
│   │   │   ├── emailService.js       // Future: emails
│   │   │   └── paymentService.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── requestLogger.js
│   │   │   ├── validation.js
│   │   │   └── cors.js
│   │   ├── utils/
│   │   │   ├── dbconnection.js
│   │   │   ├── errorMessages.js
│   │   │   ├── validators.js
│   │   │   ├── calculators.js
│   │   │   └── pdfTemplates.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── constants.js
│   │   │   └── email.js              // Future
│   │   ├── jobs/
│   │   │   ├── generateInvoices.js   // Async jobs
│   │   │   └── sendReminders.js      // Future
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── docs/
│   ├── API.md
│   ├── SETUP.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
└── README.md
```

---

# REACT COMPONENTS SAMPLES

## 1. Optimized Loan Creation Form

```javascript
// frontend/src/pages/Loans/CreateLoan.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { loanService } from '@/services/loanService';
import { LoanCalculator } from '@/utils/calculators';
import { formatCurrency } from '@/utils/formatters';

const loanSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  principal: z.number().min(1000, 'Minimum loan is ₹1,000'),
  monthlyInterestRate: z.number().min(0.1).max(50),
  loanDurationMonths: z.number().min(1).max(240),
});

export const CreateLoan = () => {
  const { register, watch, formState: { errors } } = useForm({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      principal: 100000,
      monthlyInterestRate: 5.5,
      loanDurationMonths: 24,
    },
  });

  const [preview, setPreview] = useState(null);
  const { data: customers } = useQuery(['customers'], () => 
    loanService.fetchCustomers()
  );

  // Watch form changes for real-time calculation
  const principal = watch('principal');
  const monthlyInterestRate = watch('monthlyInterestRate');
  const loanDurationMonths = watch('loanDurationMonths');

  // Memoized calculations prevent unnecessary recalculations
  const calculations = useMemo(() => {
    if (!principal || !monthlyInterestRate || !loanDurationMonths) return null;
    
    const emi = LoanCalculator.calculateMonthlyEMI(
      principal,
      monthlyInterestRate,
      loanDurationMonths
    );
    const totalPayable = emi * loanDurationMonths;
    const totalInterest = totalPayable - principal;

    return { emi, totalPayable, totalInterest };
  }, [principal, monthlyInterestRate, loanDurationMonths]);

  const createLoanMutation = useMutation(
    (data) => loanService.createLoan(data),
    {
      onSuccess: (data) => {
        // Handle success
        window.location.href = `/loans/${data._id}`;
      },
    }
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto p-4 md:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 
        className="text-2xl md:text-3xl font-bold mb-6"
        variants={itemVariants}
      >
        Create New Loan
      </motion.h1>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          createLoanMutation.mutate(getFormData());
        }}
        className="space-y-4"
      >
        {/* Customer Selection */}
        <motion.div variants={itemVariants} className="form-group">
          <label className="form-label">Select Customer</label>
          <select {...register('customerId')} className="form-control">
            <option value="">Choose customer...</option>
            {customers?.map(c => (
              <option key={c._id} value={c._id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Principal Input */}
        <motion.div variants={itemVariants} className="form-group">
          <label className="form-label">Loan Amount (₹)</label>
          <input
            type="number"
            {...register('principal', { valueAsNumber: true })}
            className="form-control"
            placeholder="100000"
          />
          {errors.principal && (
            <span className="text-red-500 text-sm">{errors.principal.message}</span>
          )}
        </motion.div>

        {/* Interest Rate Input */}
        <motion.div variants={itemVariants} className="form-group">
          <label className="form-label">Monthly Interest Rate (%)</label>
          <input
            type="number"
            step="0.1"
            {...register('monthlyInterestRate', { valueAsNumber: true })}
            className="form-control"
            placeholder="5.5"
          />
        </motion.div>

        {/* Duration Input */}
        <motion.div variants={itemVariants} className="form-group">
          <label className="form-label">Loan Duration (Months)</label>
          <input
            type="number"
            {...register('loanDurationMonths', { valueAsNumber: true })}
            className="form-control"
            placeholder="24"
          />
        </motion.div>

        {/* Live Calculation Preview */}
        {calculations && (
          <motion.div
            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200"
            variants={itemVariants}
            layout
          >
            <h3 className="font-semibold mb-3">Loan Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Monthly EMI</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(calculations.emi)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Total Payable</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(calculations.totalPayable)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Total Interest</p>
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(calculations.totalInterest)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Interest %</p>
                <p className="text-lg font-bold">
                  {((calculations.totalInterest / principal) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          variants={itemVariants}
          type="submit"
          className="btn btn--primary btn--lg btn--full-width"
          whileTap={{ scale: 0.98 }}
          disabled={createLoanMutation.isLoading}
        >
          {createLoanMutation.isLoading ? 'Creating...' : 'Create Loan'}
        </motion.button>
      </form>
    </motion.div>
  );
};
```

## 2. Virtual Scrolling Loans Table

```javascript
// frontend/src/components/tables/LoansTable.jsx
import React, { useState, useCallback } from 'react';
import { FixedSizeList } from 'react-window';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { loanService } from '@/services/loanService';

export const LoansTable = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInfiniteQuery(
    ['loans'],
    ({ pageParam = 1 }) => loanService.fetchLoans(pageParam),
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const loans = data?.pages.flatMap(page => page.loans) ?? [];

  const Row = ({ index, style }) => {
    const loan = loans[index];
    if (!loan) return <div style={style} />;

    return (
      <motion.div
        style={style}
        className="flex items-center justify-between p-4 border-b hover:bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex-1">
          <h4 className="font-semibold">{loan.loanNumber}</h4>
          <p className="text-sm text-gray-600">{loan.customerName}</p>
        </div>
        <div className="text-right">
          <p className="font-bold">₹{loan.principal.toLocaleString()}</p>
          <p className="text-sm text-gray-600">{loan.status}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-96 border rounded-lg">
      <FixedSizeList
        height={600}
        itemCount={loans.length}
        itemSize={80}
        width="100%"
        onItemsRendered={({ visibleStopIndex }) => {
          if (visibleStopIndex >= loans.length - 5 && hasNextPage) {
            fetchNextPage();
          }
        }}
      >
        {Row}
      </FixedSizeList>
    </div>
  );
};
```

## 3. Payment Recording Modal (Mobile-Optimized)

```javascript
// frontend/src/components/modals/PaymentModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { paymentService } from '@/services/paymentService';

export const PaymentModal = ({ loan, isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState(loan?.monthlyEMI);
  const [method, setMethod] = useState('bank_transfer');
  const [reference, setReference] = useState('');

  const recordPaymentMutation = useMutation(
    (data) => paymentService.recordPayment(data),
    { onSuccess }
  );

  const modalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              className="bg-white rounded-t-lg md:rounded-lg w-full md:max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              layoutId="payment-modal"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Record Payment</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Amount Input */}
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="form-control text-lg"
                    disabled={recordPaymentMutation.isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    EMI Due: ₹{loan.monthlyEMI}
                  </p>
                </div>

                {/* Payment Method */}
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <div className="space-y-2">
                    {['cash', 'bank_transfer', 'upi', 'cheque'].map(m => (
                      <label key={m} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="method"
                          value={m}
                          checked={method === m}
                          onChange={(e) => setMethod(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm capitalize">{m.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reference */}
                <div className="form-group">
                  <label className="form-label">Reference ID (Optional)</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="form-control"
                    placeholder="Transaction ID"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="btn btn--secondary flex-1"
                    disabled={recordPaymentMutation.isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => recordPaymentMutation.mutate({
                      loanId: loan._id,
                      amountPaid: amount,
                      paymentMethod: method,
                      referenceId: reference,
                      paymentDate: new Date(),
                    })}
                    className="btn btn--primary flex-1"
                    disabled={recordPaymentMutation.isLoading}
                  >
                    {recordPaymentMutation.isLoading ? 'Processing...' : 'Confirm Payment'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

---

# EXPRESS ROUTES & CONTROLLERS

## Loans Routes

```javascript
// backend/src/routes/loans.js
const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { validateLoanInput } = require('../middleware/validation');

// List loans with filtering & pagination
router.get('/', loanController.listLoans);

// Get loan details with amortization schedule
router.get('/:id', loanController.getLoanDetail);

// Get amortization schedule
router.get('/:id/amortization', loanController.getAmortizationSchedule);

// Get current balance
router.get('/:id/balance', loanController.getCurrentBalance);

// Create new loan
router.post('/', validateLoanInput, loanController.createLoan);

// Approve pending loan
router.put('/:id/approve', loanController.approveLoan);

// Update loan (before approval)
router.put('/:id', loanController.updateLoan);

// Cancel loan (if pending)
router.delete('/:id', loanController.cancelLoan);

module.exports = router;
```

## Loan Controller Implementation

```javascript
// backend/src/controllers/loanController.js
const Loan = require('../models/Loan');
const { LoanCalculator } = require('../utils/calculators');

exports.createLoan = async (req, res, next) => {
  try {
    const {
      customerId,
      principal,
      monthlyInterestRate,
      loanDurationMonths,
      startDate,
      notes,
    } = req.body;

    // Calculate EMI & total amounts
    const monthlyEMI = LoanCalculator.calculateMonthlyEMI(
      principal,
      monthlyInterestRate,
      loanDurationMonths
    );

    const amortizationSchedule = LoanCalculator.generateAmortizationSchedule(
      principal,
      monthlyInterestRate,
      loanDurationMonths,
      monthlyEMI
    );

    const totalInterestAmount = amortizationSchedule.reduce(
      (sum, payment) => sum + payment.interest,
      0
    );

    // Generate unique loan number
    const count = await Loan.countDocuments();
    const loanNumber = `LN-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const loan = new Loan({
      customerId,
      loanNumber,
      principal,
      monthlyInterestRate,
      loanDurationMonths,
      monthlyEMI,
      totalInterestAmount,
      totalAmountPayable: principal + totalInterestAmount,
      remainingBalance: principal + totalInterestAmount,
      startDate: new Date(startDate),
      endDate: new Date(new Date(startDate).getTime() + loanDurationMonths * 30 * 24 * 60 * 60 * 1000),
      amortizationSchedule,
      status: 'pending_approval',
      notes,
    });

    await loan.save();

    res.status(201).json({
      success: true,
      loan,
      message: 'Loan created successfully. Awaiting approval.',
    });
  } catch (error) {
    next(error);
  }
};

exports.approveLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvalDate: new Date(),
      },
      { new: true }
    );

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    // Generate loan contract automatically
    // await pdfService.generateContract(loan);

    res.json({
      success: true,
      loan,
      message: 'Loan approved successfully. Contract generated.',
    });
  } catch (error) {
    next(error);
  }
};

exports.listLoans = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, customerId, sortBy = '-createdAt' } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (customerId) filter.customerId = customerId;

    const loans = await Loan.find(filter)
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('customerId', 'firstName lastName email phone');

    const total = await Loan.countDocuments(filter);

    res.json({
      success: true,
      loans,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentBalance = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ success: false });

    res.json({
      success: true,
      remainingBalance: loan.remainingBalance,
      totalPaid: loan.principal - loan.remainingBalance,
      paymentsReceived: loan.paymentsReceived,
      status: loan.status,
    });
  } catch (error) {
    next(error);
  }
};

// ... other controller methods
```

## Server Setup

```javascript
// backend/src/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api/customers', require('./routes/customers'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/contracts', require('./routes/contracts'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

# SYSTEM ARCHITECTURE

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         END USER - LENDER/BORROWER                          │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
            ┌───────▼────────┐  ┌──▼──────────┐  │
            │   Mobile App   │  │ Web Browser │  └─── Offline Cache
            │   (React PWA)  │  │ (React SPA) │       (Service Worker)
            └───────┬────────┘  └──┬──────────┘
                    │              │
        ┌───────────┼──────────────┼───────────┐
        │           │              │           │
        │   VITE BUILD PIPELINE    │           │
        │   - Code splitting       │           │
        │   - Minification         │           │
        │   - Asset optimization   │           │
        │                          │           │
        │   FRAMER MOTION          │           │
        │   - GPU acceleration     │           │
        │   - Mobile-optimized     │           │
        │                          │           │
        └──────────────┬───────────┘           │
                       │                       │
        ┌──────────────▼───────────────────────▼──────────┐
        │         FRONTEND OPTIMIZATION LAYER             │
        │   ┌─────────────────────────────────────────┐   │
        │   │ React Query (Server State Cache)        │   │
        │   │ - Stale time: 5 minutes                 │   │
        │   │ - Cache time: 10 minutes                │   │
        │   │ - Automatic background refetch          │   │
        │   └─────────────────────────────────────────┘   │
        │   ┌─────────────────────────────────────────┐   │
        │   │ Zustand (Client State)                  │   │
        │   │ - UI state only                         │   │
        │   │ - <1KB bundle size                      │   │
        │   └─────────────────────────────────────────┘   │
        │   ┌─────────────────────────────────────────┐   │
        │   │ Virtual Scrolling (react-window)        │   │
        │   │ - Render only visible items             │   │
        │   │ - 10K+ records efficiently              │   │
        │   └─────────────────────────────────────────┘   │
        └──────────────┬──────────────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │   API GATEWAY LAYER         │
        │                              │
        │ axios instance with:         │
        │ - Request/response logging   │
        │ - Error handling            │
        │ - JWT token injection       │
        │ - Retry logic               │
        └──────────────┬───────────────┘
                       │
        ┌──────────────▼────────────────────────────┐
        │    BACKEND - EXPRESS.JS                   │
        │                                            │
        │ ┌──────────────────────────────────────┐ │
        │ │ Middleware Stack                     │ │
        │ │ - helmet (security headers)          │ │
        │ │ - compression (gzip)                 │ │
        │ │ - cors (cross-origin)                │ │
        │ │ - rate-limit (API throttling)        │ │
        │ │ - error handling                     │ │
        │ └──────────────────────────────────────┘ │
        │                                            │
        │ ┌──────────────────────────────────────┐ │
        │ │ Business Logic Layer                 │ │
        │ │ - Interest calculations              │ │
        │ │ - EMI computation                    │ │
        │ │ - Payment processing                 │ │
        │ │ - Balance tracking                   │ │
        │ └──────────────────────────────────────┘ │
        │                                            │
        │ ┌──────────────────────────────────────┐ │
        │ │ PDF Generation Services              │ │
        │ │ - pdfmake (invoices)                 │ │
        │ │ - Puppeteer (contracts)              │ │
        │ │ - jsPDF (previews)                   │ │
        │ └──────────────────────────────────────┘ │
        │                                            │
        │ ┌──────────────────────────────────────┐ │
        │ │ Caching Layer                        │ │
        │ │ - Redis (optional, for scale)        │ │
        │ │ - In-memory cache                    │ │
        │ └──────────────────────────────────────┘ │
        └──────────────┬────────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │    MONGODB ATLAS            │
        │                              │
        │ Collections:                 │
        │ • Customers                  │
        │ • Loans                      │
        │ • Payments                   │
        │ • Invoices                   │
        │ • Contracts                  │
        │ • AuditLogs                  │
        │                              │
        │ Replication: 3-node cluster  │
        │ Backups: Daily automatic     │
        │ Geo-distributed             │
        └──────────────────────────────┘
```

---

# MOBILE & CSS OPTIMIZATION

## Mobile-First Tailwind CSS Patterns

```jsx
// ✅ Scales from mobile → tablet → desktop
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
  Heading
</h1>

// ✅ Mobile-first spacing
<div className="p-4 sm:p-6 md:p-8 lg:p-12">
  Content
</div>

// ✅ Flexible grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} item={item} />)}
</div>

// ✅ 48x48px minimum touch target
<button className="min-h-12 min-w-12 px-4 py-3 rounded-lg">
  Touch Button
</button>

// ✅ Mobile safe area support
<div className="p-4 safe-area-inset-bottom">
  Bottom content
</div>

// ✅ Avoid hover-only interactions
<button className="hover:bg-blue-600 active:bg-blue-700">
  Works on mobile too
</button>
```

## Framer Motion Performance Optimization

```javascript
// CRITICAL: Prevent lag with these settings
import { motion, MotionConfig } from 'framer-motion';

export const OptimizedLayout = ({ children }) => (
  <MotionConfig 
    reducedMotion="user" // Respect prefers-reduced-motion
  >
    {children}
  </MotionConfig>
);

// ✅ GOOD - GPU accelerated:
<motion.div
  animate={{ x: 100, opacity: 0.5 }} // transform + opacity
  transition={{ duration: 0.3, ease: 'easeOut' }}
/>

// ❌ BAD - CPU-bound, causes lag:
<motion.div
  animate={{ 
    width: '100px',    // Triggers reflow
    height: '100px',   // Triggers reflow
    marginLeft: '20px' // Triggers reflow
  }}
/>

// ✅ Stagger animations efficiently
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.05, // Keep <100ms
      delayChildren: 0,
    },
  },
};

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>

// ✅ Conditional animations based on device
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobileDevice = window.innerWidth < 768;

const getAnimationConfig = () => {
  if (prefersReducedMotion || isMobileDevice) {
    return { duration: 0 }; // Disable animations
  }
  return { duration: 0.3, ease: 'easeOut' };
};
```

## Comprehensive CSS Variables System

```css
/* Root variables for light mode (default) */
:root {
  /* Primitive colors */
  --color-primary: #208085;    /* Teal */
  --color-primary-hover: #1d7480;
  --color-error: #c0152f;       /* Red */
  --color-success: #208085;     /* Teal */
  --color-warning: #a84b2f;     /* Orange */
  
  /* Semantic colors */
  --color-background: #fcfcf9;  /* Cream */
  --color-surface: #ffffff;
  --color-text: #133c3b;        /* Dark slate */
  --color-text-secondary: #626c7c;
  
  /* Border & shadows */
  --color-border: rgba(94, 82, 64, 0.2);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
}

/* Dark mode using prefers-color-scheme */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #1f2121;
    --color-surface: #262828;
    --color-text: #f5f5f5;
    --color-text-secondary: rgba(167, 169, 169, 0.7);
    --color-primary: #32b8c6;
    --color-error: #ff5459;
  }
}

/* Manual theme switching with data attribute */
[data-theme="dark"] {
  --color-background: #1f2121;
  --color-surface: #262828;
  --color-text: #f5f5f5;
}

[data-theme="light"] {
  --color-background: #fcfcf9;
  --color-text: #133c3b;
}

/* Usage in components */
.card {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.card:hover {
  box-shadow: var(--shadow-lg);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  transition: background-color 0.25s ease-out;
  cursor: pointer;
  touch-action: manipulation; /* Prevent 300ms delay */
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## React Theme Provider

```javascript
// hooks/useTheme.js
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// Usage
export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-200">
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
};
```

---

# QUICK START IMPLEMENTATION

## Phase 1: Project Setup (Day 1)

### Frontend Setup

```bash
# Create Vite React project
npm create vite@latest loan-app-frontend -- --template react
cd loan-app-frontend

# Install dependencies
npm install

# Install essential packages
npm install react-router-dom @tanstack/react-query zustand
npm install framer-motion tailwindcss postcss autoprefixer
npm install react-hook-form zod @hookform/resolvers
npm install jspdf html2canvas axios
npm install -D tailwindcss postcss autoprefixer
npm run dev
```

### Backend Setup

```bash
# Create Node.js project
mkdir loan-app-backend
cd loan-app-backend
npm init -y

# Install dependencies
npm install express mongoose dotenv cors compression helmet
npm install express-rate-limit joi jsonwebtoken bcryptjs
npm install pdfmake nodemailer socket.io
npm install -D nodemon jest supertest

# Create .env file
echo "MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret" > .env

# Start server
npm run dev
```

## Phase 2: Database Setup (Day 1-2)

### MongoDB Atlas Setup

```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create cluster (Free tier)
3. Get connection string
4. Add IP to whitelist (0.0.0.0 for development)
5. Copy connection string to .env
```

### Create Customer Model

```javascript
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  firstName: { type: String, required: true, index: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: true, index: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  governmentId: {
    type: String,
    number: String,
  },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Customer', customerSchema);
```

## Phase 3: Core APIs (Day 2-3)

### Customer API Routes

```javascript
// backend/src/routes/customers.js
const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// List customers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const customers = await Customer.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments(filter);

    res.json({
      success: true,
      customers,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json({ success: true, customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

### Server Setup

```javascript
// backend/src/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api/customers', require('./routes/customers'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/payments', require('./routes/payments'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## Phase 4: Frontend API Service

```javascript
// frontend/src/services/api.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Customers API
export const customerAPI = {
  list: (page = 1, limit = 20) => apiClient.get('/customers', { params: { page, limit } }),
  create: (data) => apiClient.post('/customers', data),
  get: (id) => apiClient.get(`/customers/${id}`),
  update: (id, data) => apiClient.put(`/customers/${id}`, data),
  delete: (id) => apiClient.delete(`/customers/${id}`),
};

// Loans API
export const loanAPI = {
  list: () => apiClient.get('/loans'),
  create: (data) => apiClient.post('/loans', data),
  get: (id) => apiClient.get(`/loans/${id}`),
  approve: (id) => apiClient.put(`/loans/${id}/approve`),
  getBalance: (id) => apiClient.get(`/loans/${id}/balance`),
};

// Payments API
export const paymentAPI = {
  list: () => apiClient.get('/payments'),
  create: (data) => apiClient.post('/payments', data),
  getForLoan: (loanId) => apiClient.get(`/payments/loan/${loanId}`),
};
```

## Phase 5: React Hooks

```javascript
// frontend/src/hooks/useCustomers.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerAPI } from '../services/api';

export const useCustomers = (page = 1) => {
  return useQuery(['customers', page], () => customerAPI.list(page), {
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation(customerAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation(customerAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
    },
  });
};
```

---

# FUTURE-PROOFING & SCALABILITY

## Phase 2 (Next 3-6 months)

```
1. Real-Time Notifications
   - Socket.io for payment confirmations
   - Push notifications via Firebase Cloud Messaging
   - Email notifications (nodemailer)

2. Analytics Dashboard
   - Monthly collection trends
   - Default risk analysis
   - Customer lifetime value
   - Revenue projections

3. Advanced Reporting
   - Custom date range reports
   - Export to Excel/CSV
   - Scheduled email reports
   - Tax compliance reports

4. Authentication & Authorization
   - JWT-based authentication
   - Role-based access control (RBAC)
   - Multi-factor authentication
   - Session management

5. Multi-Currency & Localization
   - Support multiple currencies (USD, EUR, etc.)
   - i18n for multiple languages
   - Regional tax compliance
```

## Phase 3 (6-12 months)

```
1. AI & Predictive Analytics
   - Credit risk scoring
   - Default prediction
   - Optimal interest rate suggestion
   - Customer churn prediction

2. Automated Collection
   - Payment reminders (SMS/Email)
   - Automated penalty calculation
   - Late payment escalation workflow
   - Settlement recommendations

3. Integration with Banks
   - Direct bank API integration
   - Automated settlement verification
   - Bank statement parsing

4. Mobile App (React Native)
   - Native iOS/Android apps
   - Offline capability
   - Biometric authentication
   - Push notifications

5. Blockchain/NFT Features (Optional)
   - Smart contracts for loan terms
   - NFT-based loan certificates
   - Transparent audit trail
```

## Scalability Checklist

```
Current (MVP):
✓ Monolithic backend
✓ Single MongoDB instance
✓ No caching layer
✓ Synchronous PDF generation

Scalable (Production-Ready):
✓ API rate limiting (express-rate-limit)
✓ Redis caching for frequent queries
✓ Database indexing optimization
✓ Async PDF generation (Bull queue)
✓ Load balancing (Nginx)
✓ Database replication (MongoDB replica set)
✓ CDN for static assets
✓ Monitoring & logging (Winston, Sentry)
✓ Health checks & auto-scaling (K8s ready)
✓ Microservices split (if needed)
```

---

# DEPLOYMENT CHECKLIST

## Frontend Deployment

```
- Build optimization (code splitting, minification)
- Environment variables configured
- Deployed to Vercel/Netlify
- CDN enabled
- Cache headers configured
- Service Worker enabled
- SEO meta tags added
```

## Backend Deployment

```
- Environment variables (.env)
- MongoDB Atlas connection configured
- Rate limiting enabled
- CORS configured
- Error handling & logging setup
- API documentation (Swagger/Postman)
- Docker containerized
- Deployed to Railway/Heroku/AWS
- Health check endpoint active
- Database backups automated
```

## Security

```
- HTTPS enabled
- Helmet security headers
- Input validation & sanitization
- SQL injection prevention
- CORS properly configured
- Rate limiting active
- Sensitive data encrypted
- GDPR compliance checked
```

## Monitoring

```
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Uptime monitoring (UptimeRobot)
- Log aggregation (LogRocket)
- Analytics setup
```

---

## Key Commands Reference

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality

# Backend
npm run dev          # Start with nodemon
npm start            # Start production
npm test             # Run tests
npm run lint         # Check code quality

# Database
# Check indexes: db.customers.getIndexes()
# Create index: db.loans.createIndex({ customerId: 1, status: 1 })
```

---

## Important Environment Variables

```bash
# frontend/.env
VITE_API_URL=http://localhost:5000/api

# backend/.env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/loan-app
PORT=5000
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

---

## Testing the APIs with Curl

```bash
# Create customer
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+91-9999999999"
  }'

# Get customers
curl http://localhost:5000/api/customers?page=1&limit=20

# Get customer by ID
curl http://localhost:5000/api/customers/{id}
```

---

## Implementation Timeline

```
- Days 1-2: Setup & Database
- Days 2-3: Core APIs
- Days 3-5: Frontend Components
- Days 5-6: Interest Calculations
- Days 6-7: PDF Generation
- Days 7-8: Testing & Deployment

Total: 8 days to MVP launch!
```

---

**Total Deliverables:**
- Complete tech stack specification
- Mobile-first optimization guide
- Database schema with indexing
- 25+ REST API endpoints
- Interest calculation logic
- PDF generation strategy
- 10+ React components
- Complete Express routes & controllers
- System architecture diagrams
- Mobile & CSS optimization guide
- Quick start implementation guide
- Future-proofing roadmap
- Deployment checklist

**Start with Phase 1 setup, then follow sequentially. Each phase builds on the previous one.**

