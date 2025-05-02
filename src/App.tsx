import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './hooks/useAuth';
import ThemeRipple from './components/ThemeRipple';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import EventAnalytics from './pages/EventAnalytics';
import EventRsvps from './pages/EventRsvps';
import BrowseEvents from './pages/BrowseEvents';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  const location = useLocation();
  const { checkAuth } = useAuth();
  
  // Check authentication status when the app loads
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ThemeProvider>
      <ThemeRipple />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Main App Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<BrowseEvents />} />
            <Route path="/create-event" element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            } />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/event/:id/analytics" element={
              <ProtectedRoute>
                <EventAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/event/:id/rsvps" element={
              <ProtectedRoute>
                <EventRsvps />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </ThemeProvider>
  );
};

export default App;