import React from 'react';
import './App.css';
import Footer from './components/Footer.tsx';
import Header from './components/Header.tsx';
import HomePage from './components/HomePage.tsx';
import TravelPage from './components/TravelPage.tsx';
import FAQPage from './components/faq-page/FAQPage.tsx';
import Registry from './components/Registry.tsx';
import theme from './theme/theme.tsx';
import { ThemeProvider } from '@mui/material';
import Navigation from './components/navigation/Navigation.tsx';
import RSVPPage from './components/rsvp/RSVPPage.tsx';
import { NavigationProvider, useNavigation } from './context/NavigationContext.tsx';
import AdminDashboard from './admin/AdminDashboard.tsx';
import AdminLogin from './admin/AdminLogin.tsx';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';


function UserLayout() {

  const { tabValue } = useNavigation();

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Header />
        <div id="nav-container">
          <Navigation />
        </div>
        <div id='page-container'>
          {tabValue === 0 && <HomePage />}
          {tabValue === 1 && <TravelPage />}
          {tabValue === 2 && <RSVPPage />}
          {tabValue === 3 && <Registry />}
          {tabValue === 4 && <FAQPage />}
          {tabValue === 5 && <AdminDashboard />}
        </div>
        <Footer showText={tabValue > 0} />
      </div>
    </ThemeProvider>
  );
}

// A wrapper for the Admin routes that checks for authentication
const PrivateAdminRoute = () => {
  const isAdmin = sessionStorage.getItem('isAdmin'); // Check if isAdmin is true

  return isAdmin === 'true' ? <Outlet /> : <Navigate to="/admin-login" replace />;
};

function App() {
  return (
    <NavigationProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<UserLayout />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Private Admin Routes */}
          <Route element={<PrivateAdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Fallback for unmatched routes - optional */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </NavigationProvider>
  );
}

export default App;
