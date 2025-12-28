import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/common/Layout';
import { GlobalErrorBoundary } from './components/common/GlobalErrorBoundary';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/Customers/CustomerList';
import CustomerDetails from './pages/Customers/CustomerDetails';
import AddCustomer from './pages/Customers/AddCustomer';
import LoanList from './pages/Loans/LoanList';
import LoanDetails from './pages/Loans/LoanDetails';
import CreateLoan from './pages/Loans/CreateLoan';
import EditLoan from './pages/Loans/EditLoan';
import PaymentList from './pages/Payments/PaymentList';
import RecordPayment from './pages/Payments/RecordPayment';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import SignOut from './pages/Auth/SignOut';
import Settings from './pages/Settings';
import InvoiceList from './pages/Invoices/InvoiceList';
import useAuthStore from './store/authStore';

// Create React Query client with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route component (redirect to home if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <GlobalErrorBoundary>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes (No Layout) - Public only */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/signout" element={<SignOut />} />

            {/* Protected Routes with Layout */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              {/* Dashboard */}
              <Route path="/" element={<Dashboard />} />

              {/* Customers */}
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/customers/new" element={<AddCustomer />} />
              <Route path="/customers/:id" element={<CustomerDetails />} />
              <Route path="/customers/:id/edit" element={<AddCustomer />} />

              {/* Loans */}
              <Route path="/loans" element={<LoanList />} />
              <Route path="/loans/new" element={<CreateLoan />} />
              <Route path="/loans/:id/edit" element={<EditLoan />} />
              <Route path="/loans/:id" element={<LoanDetails />} />

              {/* Payments */}
              <Route path="/payments" element={<PaymentList />} />
              <Route path="/payments/new" element={<RecordPayment />} />

              {/* Invoices */}
              <Route path="/invoices" element={<InvoiceList />} />

              {/* Settings */}
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </GlobalErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
