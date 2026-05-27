# 💰 Money Lender App

> A full-stack, production-ready loan management platform built for independent money lenders. Manage customers, loans, payments, and real-time chat — all from a single professional dashboard.

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://money-lender-app-dev.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://render.com)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-010101?logo=socket.io)](https://socket.io)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## 📸 Preview

| Lender Dashboard | Customer Portal | Real-time Chat |
|---|---|---|
| Portfolio overview, cash flow charts, stats cards | Loan tracking, payment history, lender discovery | Instant messaging with file/image sharing |

---

## ✨ Features

### 🏦 Lender Dashboard
- **Portfolio Overview** — live stats for total lent, interest earned, collected amounts, and active customers
- **Cash Flow Charts** — 6-month visual breakdown using Recharts (lent vs. collected)
- **Customer Management** — add, view, and manage borrower profiles
- **Loan Management** — create loans with interest rates, tenures, and repayment schedules
- **Payment Tracking** — record and verify payments with automatic balance calculations
- **Invoice Generation** — export professional PDF invoices with jsPDF
- **Data Export** — export customer and loan data to CSV/PDF
- **Loan Requests** — receive and manage incoming loan applications with accept/reject flow
- **Real-time Notifications** — toast alerts and unread badge counts for new messages and requests
- **Loan Calculator** — built-in EMI and interest calculator

### 👤 Customer Portal
- **Self-service Dashboard** — view active loans, upcoming payments, and loan history
- **Lender Discovery** — browse and connect with available lenders
- **Loan Request Submission** — apply for loans directly through the portal
- **Real-time Chat** — communicate with lenders with file and image sharing
- **Payment History** — detailed statement of all payments made

### 🌐 Guest / Public Flow (No Account Required)
- **Accountless Loan Requests** — guests can submit loan applications using only a phone number
- **Loan Status Tracking** — track loan request status via phone number lookup
- **Guest Chat** — chat with lenders using a secure tracking token (no registration needed)
- **File Uploads in Chat** — guests can attach documents and images via Cloudinary
- **Phone Persistence** — last tracked phone number is saved in `localStorage` for convenience

### ⚡ Real-time Engine
- **Socket.IO** for instant bi-directional chat
- **Event-driven notifications** — backend emits `message_notification` to receivers on every message
- **Smart suppression** — frontend suppresses toast/badge if the user is already viewing that chat (URL-based detection)
- **Unread badge aggregation** — Requests nav badge combines unread messages + pending loan requests

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite 7 | Core UI framework and build tool |
| Tailwind CSS v4 | Utility-first styling |
| React Router DOM v7 | Client-side routing |
| Zustand | Global state management (auth, notifications) |
| TanStack React Query v5 | Server state, caching, background refetch |
| Socket.IO Client | Real-time WebSocket communication |
| Framer Motion | Page transitions and micro-animations |
| Recharts | Dashboard charts and data visualization |
| React Hook Form + Zod | Form handling and validation |
| Axios | HTTP client with interceptors |
| jsPDF + AutoTable | PDF invoice and export generation |
| Lucide React | Consistent SVG icon system |
| React Hot Toast | Toast notification system |
| SweetAlert2 | Confirmation dialogs |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database and ODM |
| Socket.IO | WebSocket server |
| JSON Web Tokens (JWT) | Authentication for lenders and customers |
| bcryptjs | Password hashing |
| Helmet | HTTP security headers |
| express-rate-limit | API rate limiting |
| Compression | Response compression |
| Cloudinary | Cloud file and image storage |
| node-cron | Scheduled background tasks |

### Infrastructure
| Service | Role |
|---|---|
| Vercel | Frontend hosting (auto-deploy from `dev` branch) |
| Render | Backend hosting (auto-deploy from `dev` branch) |
| MongoDB Atlas | Cloud database |
| Cloudinary | Media storage for chat file uploads |

---

## 📁 Project Structure

```
money-lender/
├── frontend/                  # React + Vite SPA
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── chat/          # ChatWindow, MessageBubble
│   │   │   ├── common/        # Navbar, Layout, LoadingSpinner
│   │   │   ├── layouts/       # CustomerPortalLayout
│   │   │   └── notifications/ # NotificationBadge
│   │   ├── contexts/          # SocketContext (real-time)
│   │   ├── pages/
│   │   │   ├── Auth/          # Login, Register
│   │   │   ├── CustomerPortal/# Dashboard, Chat, Loans, Payments
│   │   │   ├── Customers/     # Customer list and details
│   │   │   ├── Dashboard.jsx  # Lender main dashboard
│   │   │   ├── Invoices/      # Invoice management
│   │   │   ├── LoanRequests/  # Incoming requests, lender chat
│   │   │   ├── Loans/         # Loan list and details
│   │   │   ├── Payments/      # Payment management
│   │   │   └── Public/        # Guest loan flow, tracking
│   │   ├── services/          # Axios API service layer
│   │   ├── store/             # Zustand stores (auth, notifications)
│   │   └── utils/             # Date formatting, helpers
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── backend/                   # Node.js + Express API
    └── src/
        ├── config/            # Database connection
        ├── controllers/       # Route handlers
        ├── middleware/        # Auth (JWT + tracking token), error handler
        ├── models/            # Mongoose schemas
        │   ├── User.js        # Lender user accounts
        │   ├── Lender.js      # Lender business profiles
        │   ├── Customer.js    # Borrower profiles
        │   ├── Loan.js        # Loan records
        │   ├── LoanRequest.js # Incoming loan applications
        │   ├── Message.js     # Chat messages
        │   ├── Payment.js     # Payment records
        │   ├── Invoice.js     # Invoice records
        │   └── Contract.js    # Loan contracts
        ├── routes/            # Express route definitions
        ├── socket/            # Socket.IO event handlers
        └── utils/             # Scheduler, helpers
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)

### 1. Clone the Repository

```bash
git clone https://github.com/Rajdeep2922/Money-Lender-App.git
cd Money-Lender-App
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/moneylender

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_MAX=500

# Cloudinary (for chat file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

---

## 🔌 API Overview

| Prefix | Description | Auth |
|---|---|---|
| `POST /api/auth/register` | Register a new lender account | Public |
| `POST /api/auth/login` | Lender login → JWT | Public |
| `POST /api/customer-auth/register` | Customer registration | Public |
| `POST /api/customer-auth/login` | Customer login → JWT | Public |
| `GET /api/customers` | List all customers | Lender JWT |
| `GET /api/loans` | List all loans | Lender JWT |
| `GET /api/payments` | List all payments | Lender JWT |
| `GET /api/stats` | Dashboard statistics | Lender JWT |
| `GET /api/invoices` | Invoice management | Lender JWT |
| `GET /api/loan-request` | Incoming loan requests | Lender/Customer JWT |
| `GET /api/chat/:loanRequestId` | Chat message history | JWT or Tracking Token |
| `POST /api/upload` | File upload to Cloudinary | JWT or Tracking Token |
| `POST /api/public/loan-request` | Guest loan submission | Public |
| `GET /api/public/track` | Track loan by phone number | Public |
| `GET /api/lenders` | Lender discovery | Public |
| `GET /api/calculator` | Loan EMI calculator | Public |
| `GET /api/health` | Health check | Public |

---

## 🔄 Real-time Events (Socket.IO)

| Event | Direction | Description |
|---|---|---|
| `join_room` | Client → Server | Join a loan request chat room |
| `leave_room` | Client → Server | Leave a chat room (triggers notification logic) |
| `send_message` | Client → Server | Send a text, image, or file message |
| `new_message` | Server → Client | Broadcast new message to room members |
| `message_notification` | Server → Client | Push notification to receiver when outside the chat |
| `new_loan_request` | Server → Client | Alert lender of a new incoming loan application |

---

## 🌍 Deployment

### Frontend — Vercel
- **Branch:** `dev`
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:** `VITE_API_URL`, `VITE_SOCKET_URL`

### Backend — Render
- **Branch:** `dev`
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variables:** All variables from the `.env` template above

---

## 🔐 Authentication

The app uses a **dual authentication** system:

| Role | Mechanism | Scope |
|---|---|---|
| Lender | JWT Bearer token | Full dashboard access |
| Customer | JWT Bearer token (separate) | Customer portal access |
| Guest | Tracking Token (`X-Tracking-Token` header) | Chat + file uploads without an account |

---

## 📦 Key Scripts

```bash
# Frontend
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run preview    # Preview production build

# Backend
npm run dev        # Start with nodemon (hot reload)
npm start          # Production start
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request to `dev`

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/Rajdeep2922">Rajdeep Singh</a></p>
</div>
