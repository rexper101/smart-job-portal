/**
 * App.jsx — Root component
 * Defines all routes and wraps them with the Navbar
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar   from './components/Navbar';
import Footer   from './components/Footer';
import Spinner  from './components/Spinner';

// Pages
import Home           from './pages/Home';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Jobs           from './pages/Jobs';
import JobDetail      from './pages/JobDetail';
import PostJob        from './pages/PostJob';
import EditJob        from './pages/EditJob';
import Dashboard      from './pages/Dashboard';
import Applications   from './pages/Applications';
import Profile        from './pages/Profile';
import NotFound       from './pages/NotFound';

// ── Protected Route ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <Spinner fullscreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;

  return children;
};

// ── Public-only Route (redirect if already logged in) ─────────────────────────
const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner fullscreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { isLoading } = useAuth();
  if (isLoading) return <Spinner fullscreen />;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Home />} />
          <Route path="/jobs"     element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          {/* Guest only */}
          <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          {/* Private – any role */}
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Private – job seekers */}
          <Route path="/applications" element={<ProtectedRoute roles={['user']}><Applications /></ProtectedRoute>} />

          {/* Private – recruiters / admins */}
          <Route path="/post-job"      element={<ProtectedRoute roles={['recruiter','admin']}><PostJob /></ProtectedRoute>} />
          <Route path="/jobs/:id/edit" element={<ProtectedRoute roles={['recruiter','admin']}><EditJob /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
