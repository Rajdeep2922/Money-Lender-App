import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/Customers/CustomerList';
import CustomerDetails from './pages/Customers/CustomerDetails';
import AddCustomer from './pages/Customers/AddCustomer';
import LoanList from './pages/Loans/LoanList';
import LoanDetails from './pages/Loans/LoanDetails';
import CreateLoan from './pages/Loans/CreateLoan';
import PaymentList from './pages/Payments/PaymentList';
import RecordPayment from './pages/Payments/RecordPayment';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import SignOut from './pages/Auth/SignOut';
import Settings from './pages/Settings';
import InvoiceList from './pages/Invoices/InvoiceList';

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes (No Layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signout" element={<SignOut />} />

          <Route element={<Layout />}>
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
    </QueryClientProvider>
  );
}

export default App;
