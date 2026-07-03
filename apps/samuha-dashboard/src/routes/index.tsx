import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Login from '../pages/Authentication/Login';
import Register from '../pages/Authentication/Register';
import Dashboard from '../pages/Dashboard/index';
import GroupsPage from '../pages/Groups/index';
import MembersList from '../pages/Members/index';
import UsersList from '../pages/Users/index';
import UserProfile from '../pages/Users/components/Profile';
import MemberProfile from '../pages/Members/components/MemberProfile';
import DepositsGrid from '../pages/Deposits/index';
import MemberDepositHistory from '../pages/Deposits/MemberDepositHistory';
import LoansList from '../pages/Loans/index';
import LoanDetails from '../pages/Loans/Details';
import FinesList from '../pages/Fines/index';
import ExpensesList from '../pages/Expenses/index';
import ActivityFeed from '../pages/Activity/index';
import RepaymentsPage from '../pages/Repayments/index';
import Reports from '../pages/Reports/index';
import GroupSettings from '../pages/Settings/GroupSettings';
import AdminSettings from '../pages/Settings/AdminSettings';
import ProtectedRoute from '../components/Auth/ProtectedRoute';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />,
            },
            {
                path: 'groups',
                element: <GroupsPage />,
            },
            {
                path: 'users',
                element: <UsersList />,
            },
            {
                path: 'members',
                element: <MembersList />,
            },
            {
                path: 'members/:id',
                element: <MemberProfile />,
            },
            {
                path: 'users/:id',
                element: <UserProfile />,
            },
            {
                path: 'deposits',
                element: <DepositsGrid />,
            },
            {
                path: 'deposits/member/:memberId',
                element: <MemberDepositHistory />,
            },
            {
                path: 'loans',
                element: <LoansList />,
            },
            {
                path: 'loans/:loanId',
                element: <LoanDetails />,
            },
            {
                path: 'repayments',
                element: <RepaymentsPage />,
            },
            {
                path: 'fines',
                element: <FinesList />,
            },
            {
                path: 'expenses',
                element: <ExpensesList />,
            },
            {
                path: 'activity',
                element: <ActivityFeed />,
            },
            {
                path: 'reports',
                element: <ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>,
            },
            {
                path: 'settings',
                children: [
                    {
                        path: 'group',
                        element: <ProtectedRoute allowedRoles={['admin']}><GroupSettings /></ProtectedRoute>,
                    },
                    {
                        path: 'admin',
                        element: <ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>,
                    },
                ],
            },
        ],
    },
]);
