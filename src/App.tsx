import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useDispatch } from 'react-redux';

import { useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { setCredentials, setLoading } from './store/slices/authSlice';

// Import pages directly instead of lazy loading for faster initial load
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { GuestsPage } from './pages/GuestsPage';
import { RoomsPage } from './pages/RoomsPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { HousekeepingPage } from './pages/HousekeepingPage';
import { StaffPage } from './pages/StaffPage';
import { BillingPage } from './pages/BillingPage';
import { ReportsPage } from './pages/ReportsPage';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useAuth();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          // Validate token by fetching user profile
          const response = await fetch('http://localhost:3001/api/auth/me', {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            dispatch(setCredentials({
              user: data.data.user,
              token: storedToken,
            }));
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('token');
            dispatch(setLoading(false));
          }
        } catch (error) {
          console.error('Error validating token:', error);
          localStorage.removeItem('token');
          dispatch(setLoading(false));
        }
      } else {
        dispatch(setLoading(false));
      }
    };

    checkAuth();
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <LoadingSpinner />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guests/*"
          element={
            <ProtectedRoute>
              <GuestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms/*"
          element={
            <ProtectedRoute>
              <RoomsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations/*"
          element={
            <ProtectedRoute>
              <ReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/housekeeping/*"
          element={
            <ProtectedRoute>
              <HousekeepingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/*"
          element={
            <ProtectedRoute>
              <StaffPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/*"
          element={
            <ProtectedRoute>
              <BillingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/*"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
