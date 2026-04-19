/**
 * Navbar Component
 * Responsive navigation with role-aware links and dark-mode toggle
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiBriefcase, FiMenu, FiX, FiChevronDown,
  FiUser, FiLogOut, FiLayout, FiMoon, FiSun, FiFileText,
} from 'react-icons/fi';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen,    setMenuOpen]    = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const [darkMode,    setDarkMode]    = useState(() => localStorage.getItem('theme') === 'dark');
  const [scrolled,    setScrolled]    = useState(false);
  const dropRef = useRef(null);

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Navbar shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); setMenuOpen(false); };

  const navLinkCls = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-150 ${isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400'}`;

  const roleLabel = { admin: '👑 Admin', recruiter: '🏢 Recruiter', user: '👤 Seeker' };

  return (
    <header className={`sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-shadow duration-200 ${scrolled ? 'shadow-md' : ''}`}>
      <div className="container-app flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <FiBriefcase className="w-6 h-6" />
          <span>Smart<span className="text-slate-800 dark:text-white">Hire</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/"    className={navLinkCls}>Home</NavLink>
          <NavLink to="/jobs" className={navLinkCls}>Browse Jobs</NavLink>
          {isAuthenticated && user?.role === 'recruiter' && (
            <NavLink to="/post-job" className={navLinkCls}>Post a Job</NavLink>
          )}
          {isAuthenticated && user?.role === 'user' && (
            <NavLink to="/applications" className={navLinkCls}>My Applications</NavLink>
          )}
          <NavLink to="/dashboard" className={navLinkCls}>Dashboard</NavLink>
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Dark mode */}
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors" aria-label="Toggle dark mode">
            {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>

          {isAuthenticated ? (
            <div className="relative" ref={dropRef}>
              <button onClick={() => setDropOpen(!dropOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">{user?.name}</span>
                <FiChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl py-2 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.email}</p>
                    <span className="text-xs text-indigo-600 font-medium">{roleLabel[user?.role]}</span>
                  </div>
                  <Link to="/dashboard" onClick={() => setDropOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 transition-colors">
                    <FiLayout className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link to="/profile" onClick={() => setDropOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 transition-colors">
                    <FiUser className="w-4 h-4" /> Profile
                  </Link>
                  {user?.role === 'user' && (
                    <Link to="/applications" onClick={() => setDropOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 transition-colors">
                      <FiFileText className="w-4 h-4" /> My Applications
                    </Link>
                  )}
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-1 border-t border-slate-100 dark:border-slate-700">
                    <FiLogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"    className="btn-secondary !py-2 !px-4">Log In</Link>
              <Link to="/register" className="btn-primary  !py-2 !px-4">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" aria-label="Toggle menu">
          {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 pb-4 animate-slide-up">
          <nav className="flex flex-col gap-1 pt-3">
            {[
              { to: '/',            label: 'Home' },
              { to: '/jobs',        label: 'Browse Jobs' },
              { to: '/dashboard',   label: 'Dashboard', auth: true },
              { to: '/post-job',    label: 'Post a Job',       roles: ['recruiter','admin'] },
              { to: '/applications',label: 'My Applications',  roles: ['user'] },
              { to: '/profile',     label: 'Profile',          auth: true },
            ].map(({ to, label, auth, roles: r }) => {
              if (auth  && !isAuthenticated)        return null;
              if (r && (!isAuthenticated || !r.includes(user?.role))) return null;
              return (
                <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300'}`}>
                  {label}
                </NavLink>
              );
            })}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              {isAuthenticated ? (
                <button onClick={handleLogout} className="btn-danger w-full">Logout</button>
              ) : (
                <>
                  <Link to="/login"    onClick={() => setMenuOpen(false)} className="btn-secondary flex-1">Log In</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary  flex-1">Sign Up</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
