import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthAwareLayout from '../components/AuthAwareLayout';
import Layout from '../components/Layout';
import CompoundInterestSimulationPage from '../pages/CompoundInterestSimulationPage';
import DashboardPage from '../pages/DashboardPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import LoginPage from '../pages/LoginPage';
import NotFound from '../pages/NotFound';
import ProfilePage from '../pages/ProfilePage';
import RegisterPage from '../pages/RegisterPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import TransactionsPage from '../pages/TransactionsPage';
import ProtectedRoute from './ProtectedRoute';
import { GoalsPage } from '../pages/goals/GoalsPage';
import { SpendingLimitPage } from '../pages/spendingLimit/SpendingLimitPage';
import AboutPage from '../pages/about/AboutPage';
import FinancialProfilePage from '../pages/financialProfile/FinancialProfilePage';

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AuthAwareLayout />}>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/compound-interest-simulator" element={<CompoundInterestSimulationPage />} />
                    <Route path="/spending-limit" element={<SpendingLimitPage />} />
                    <Route path="/about" element={<AboutPage />} />
                </Route>
                <Route
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/goals" element={<GoalsPage />} />
                    <Route path="/financial-profile" element={<FinancialProfilePage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}