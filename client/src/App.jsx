import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/layout/PrivateRoute'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import IncomesPage from './pages/incomes/IncomesPage'
import ExpensesPage from './pages/expenses/ExpensesPage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'
import ResidentsPage from './pages/residents/ResidentsPage'
import ResidentDetailPage from './pages/residents/ResidentDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard"  element={<DashboardPage />} />
            <Route path="/incomes"    element={<IncomesPage />} />
            <Route path="/expenses"   element={<ExpensesPage />} />
            <Route path="/analytics"  element={<AnalyticsPage />} />
            <Route path="/residents"  element={<ResidentsPage />} />
            <Route path="/residents/:id" element={<ResidentDetailPage />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
