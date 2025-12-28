import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/common/Layout';
import { GlobalErrorBoundary } from './components/common/GlobalErrorBoundary';
import { PageLoader } from './components/common/LoadingSpinner';
import useAuthStore from './store/authStore';

// Lazy Load Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CustomerList = lazy(() => import('./pages/Customers/CustomerList'));
const CustomerDetails = lazy(() => import('./pages/Customers/CustomerDetails'));
const AddCustomer = lazy(() => import('./pages/Customers/AddCustomer'));
const LoanList = lazy(() => import('./pages/Loans/LoanList'));
const LoanDetails = lazy(() => import('./pages/Loans/LoanDetails'));
const CreateLoan = lazy(() => import('./pages/Loans/CreateLoan'));
const EditLoan = lazy(() => import('./pages/Loans/EditLoan'));
const PaymentList = lazy(() => import('./pages/Payments/PaymentList'));
const RecordPayment = lazy(() => import('./pages/Payments/RecordPayment'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const SignOut = lazy(() => import('./pages/Auth/SignOut'));
const Settings = lazy(() => import('./pages/Settings'));
const InvoiceList = lazy(() => import('./pages/Invoices/InvoiceList'));

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

import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" />
        <GlobalErrorBoundary>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </BrowserRouter>
        </GlobalErrorBoundary>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
