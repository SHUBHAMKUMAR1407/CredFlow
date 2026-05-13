import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import CashFlowPage from './pages/CashFlowPage';
import CreditScorePage from './pages/CreditScorePage';
import SmartFeaturesPage from './pages/SmartFeaturesPage';
import ReportsPage from './pages/ReportsPage';
import BudgetsPage from './pages/BudgetsPage';

import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
          <Toaster 
            position="top-right" 
            toastOptions={{ 
              style: { 
                background: 'var(--bg-tertiary)', 
                color: 'var(--text-primary)', 
                border: '1px solid var(--border-glass)' 
              } 
            }} 
          />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="cashflow" element={<CashFlowPage />} />
              <Route path="credit-score" element={<CreditScorePage />} />
              <Route path="smart" element={<SmartFeaturesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="budgets" element={<BudgetsPage />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
