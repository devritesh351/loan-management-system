import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import CoinbaseLayout from './components/CoinbaseLayout';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Loans from './pages/Loans';
import Payments from './pages/Payments';
import Customers from './pages/Customers';
import Notifications from './pages/Notifications';
import ApplyLoan from './pages/ApplyLoan';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <CoinbaseLayout>
      <Routes>
        <Route path="/" element={isAdmin ? <Dashboard /> : <UserDashboard />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/apply-loan" element={
          <PrivateRoute>
            {isAdmin ? <Navigate to="/" /> : <ApplyLoan />}
          </PrivateRoute>
        } />
        {isAdmin && <Route path="/customers" element={<Customers />} />}
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </CoinbaseLayout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
