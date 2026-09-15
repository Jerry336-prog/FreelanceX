import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';

// Public & Auth Pages
import PublicLanding from './pages/PublicLanding';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import NotFound from './pages/NotFound';
import Overview from './pages/dashboard/Overview';
import BrowseJobs from './pages/dashboard/BrowseJobs';
import JobDetails from './pages/dashboard/JobDetails';
import SubmitProposal from './pages/dashboard/SubmitProposal';
import MyProposals from './pages/dashboard/MyProposals';
import MyContracts from './pages/dashboard/MyContracts';
import ContractDetails from './pages/dashboard/ContractDetails';
import SubmitWork from './pages/dashboard/SubmitWork';
import Payments from './pages/dashboard/Payments';
import Earnings from './pages/dashboard/Earnings';
import Messages from './pages/dashboard/Messages';
import Notifications from './pages/dashboard/Notifications';
import Profile from './pages/dashboard/Profile';
import Settings from './pages/dashboard/Settings';

// Client Pages
import ClientOverview from './pages/client/Overview';
import PostJob from './pages/client/PostJob';
import MyJobs from './pages/client/MyJobs';
import ViewProposals from './pages/client/ViewProposals';
import FreelancerProfile from './pages/client/FreelancerProfile';
import ClientContracts from './pages/client/MyContracts';
import ClientContractDetails from './pages/client/ContractDetails';
import ClientPayments from './pages/client/Payments';
import ClientMessages from './pages/client/Messages';
import ClientNotifications from './pages/client/Notifications';
import ClientProfile from './pages/client/Profile';
import ClientSettings from './pages/client/Settings';

// Admin Pages
import AdminOverview from './pages/admin/Overview';
import AdminUsers from './pages/admin/Users';
import AdminJobs from './pages/admin/Jobs';
import AdminProposals from './pages/admin/Proposals';
import AdminContracts from './pages/admin/Contracts';
import AdminPayments from './pages/admin/Payments';
import AdminDisputes from './pages/admin/Disputes';
import AdminReports from './pages/admin/Reports';
import AdminNotifications from './pages/admin/Notifications';
import AdminSettings from './pages/admin/Settings';

import { AuthProvider } from './context/AuthContext';
import { BadgeProvider } from './context/BadgeContext';

function App() {
  return (
    <AuthProvider>
      <BadgeProvider>
        <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<PublicLanding />} />
        </Route>

        {/* Auth & Error Routes (Standalone) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />

        {/* Freelancer Dashboard Routes */}
        <Route
          path="/freelancer"
          element={(
            <ProtectedRoute allowedRoles={['freelancer']}>
              <DashboardLayout />
            </ProtectedRoute>
          )}
        >
          <Route index element={<Overview />} />
          <Route path="jobs" element={<BrowseJobs />} />
          <Route path="jobs/:id" element={<JobDetails />} />
          <Route path="jobs/:id/apply" element={<SubmitProposal />} />
          <Route path="proposals" element={<MyProposals />} />
          <Route path="contracts" element={<MyContracts />} />
          <Route path="contracts/:id" element={<ContractDetails />} />
          <Route path="contracts/:id/submit" element={<SubmitWork />} />
          <Route path="payments" element={<Payments />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Client Dashboard Routes */}
        <Route
          path="/client"
          element={(
            <ProtectedRoute allowedRoles={['client']}>
              <ClientLayout />
            </ProtectedRoute>
          )}
        >
          <Route index element={<ClientOverview />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="jobs" element={<MyJobs />} />
          <Route path="jobs/:id/proposals" element={<ViewProposals />} />
          <Route path="freelancers/:id" element={<FreelancerProfile />} />
          <Route path="proposals" element={<ViewProposals />} />
          <Route path="contracts" element={<ClientContracts />} />
          <Route path="contracts/:id" element={<ClientContractDetails />} />
          <Route path="payments" element={<ClientPayments />} />
          <Route path="messages" element={<ClientMessages />} />
          <Route path="notifications" element={<ClientNotifications />} />
          <Route path="profile" element={<ClientProfile />} />
          <Route path="settings" element={<ClientSettings />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin"
          element={(
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          )}
        >
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="proposals" element={<AdminProposals />} />
          <Route path="contracts" element={<AdminContracts />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="disputes" element={<AdminDisputes />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
      </BadgeProvider>
    </AuthProvider>
  );
}

export default App;
