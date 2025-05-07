import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();
  
  // Check if current route is an auth route
  const isAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/verify-otp'].includes(location.pathname);
  
  // Don't show header/footer on auth routes
  if (isAuthRoute) {
    return <>{children}</>;
  }
  
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}