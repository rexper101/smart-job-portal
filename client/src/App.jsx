import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar         from './components/Navbar';
import Footer         from './components/Footer';
import Spinner        from './components/Spinner';
import Home           from './pages/Home';
import Login          from './pages/Login';
import Register       from './pages/Register';
import VerifyEmail    from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';
import Jobs           from './pages/Jobs';
import JobDetail      from './pages/JobDetail';
import PostJob        from './pages/PostJob';
import EditJob        from './pages/EditJob';
import Dashboard      from './pages/Dashboard';
import Applications   from './pages/Applications';
import Profile        from './pages/Profile';
import NotFound       from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner fullscreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner fullscreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  const { isLoading } = useAuth();
  if (isLoading) return <Spinner fullscreen />;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"                      element={<Home />} />
          <Route path="/jobs"                  element={<Jobs />} />
          <Route path="/jobs/:id"              element={<JobDetail />} />
          <Route path="/forgot-password"       element={<ForgotPassword />} />
          <Route path="/reset-password"        element={<ResetPassword />} />
          <Route path="/verify-email"          element={<VerifyEmail />} />
          <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/applications"  element={<ProtectedRoute><Applications /></ProtectedRoute>} />
          <Route path="/post-job"      element={<ProtectedRoute><PostJob /></ProtectedRoute>} />
          <Route path="/jobs/:id/edit" element={<ProtectedRoute><EditJob /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}