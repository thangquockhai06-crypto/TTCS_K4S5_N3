import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../hooks/useAuth';
import { ActivitiesPage } from '../pages/ActivitiesPage';
import { CreateCustomerPage } from '../pages/CreateCustomerPage';
import { CustomerDetailPage } from '../pages/CustomerDetailPage';
import { CustomerListPage } from '../pages/CustomerListPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DealPipelinePage } from '../pages/DealPipelinePage';
import { ErrorPage } from '../pages/ErrorPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ReportsPage } from '../pages/ReportsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { UserManagementPage } from '../pages/UserManagementPage';
import { ForgotPasswordPage } from '../features/auth/forgot-password/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/forgot-password/ResetPasswordPage';

interface IProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<IProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="customers" element={<CustomerListPage />} />
        <Route path="customers/new" element={<CreateCustomerPage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
        <Route path="deals" element={<DealPipelinePage />} />
        <Route path="activities" element={<ActivitiesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="/forbidden" element={<ErrorPage code={403} />} />
      <Route path="/not-found" element={<ErrorPage code={404} />} />
      <Route path="*" element={<ErrorPage code={404} />} />
    </Routes>
  );
};
