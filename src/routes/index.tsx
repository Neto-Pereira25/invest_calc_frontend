import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthAwareLayout from '../components/AuthAwareLayout';
import Layout from '../components/Layout';
import CompoundInterestSimulationPage from '../pages/CompoundInterestSimulationPage';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import NotFound from '../pages/NotFound';
import RegisterPage from '../pages/RegisterPage';
import TransactionsPage from '../pages/TransactionsPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AuthAwareLayout />}>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/compound-interest-simulator" element={<CompoundInterestSimulationPage />} />
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
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}