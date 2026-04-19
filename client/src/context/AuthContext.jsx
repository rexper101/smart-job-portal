/**
 * AuthContext
 * Provides global authentication state (user, token, login/logout)
 * Wrapped around the entire app in main.jsx
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axiosInstance from '../services/axiosInstance';
import toast from 'react-hot-toast';

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Reducer ───────────────────────────────────────────────────────────────────
const initialState = {
  user:          null,
  token:         localStorage.getItem('sjp_token') || null,
  isLoading:     true,   // true while we verify the stored token on mount
  isAuthenticated: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, token: null, isAuthenticated: false, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Persist token in localStorage whenever it changes
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('sjp_token', state.token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      localStorage.removeItem('sjp_token');
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // On mount: if a token exists, verify it by fetching /me
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('sjp_token');
      if (!storedToken) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      try {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        const { data } = await axiosInstance.get('/auth/me');
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user, token: storedToken } });
      } catch {
        // Token invalid or expired – clear it
        dispatch({ type: 'LOGOUT' });
      }
    };
    verifyToken();
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user, token: data.token } });
    toast.success(data.message || 'Logged in successfully!');
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await axiosInstance.post('/auth/register', formData);
    dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user, token: data.token } });
    toast.success(data.message || 'Account created!');
    return data;
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully. See you soon! 👋');
  }, []);

  const updateUser = useCallback((user) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
