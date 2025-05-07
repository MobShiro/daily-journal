import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { FaSignOutAlt, FaBook, FaUserCircle, FaBars, FaTimes, FaPen, FaListAlt } from 'react-icons/fa';

export default function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if a route is active
  const isActive = (path) => location.pathname === path;

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  return (
    <header className={`app-header ${darkMode ? 'dark' : 'light'}`}>
      <div className="header-content">
        <div className="header-left">
          <Link to="/" className="logo-link">
            <FaBook className="logo-icon" />
            <span className="logo-text">Daily Journal</span>
          </Link>
        </div>

        {/* Mobile menu toggle button */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Navigation links - responsive */}
        <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {currentUser && (
            <>
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/entries" 
                className={`nav-link ${isActive('/entries') ? 'active' : ''}`}
              >
                <FaListAlt className="nav-icon" /> Entries
              </Link>
              <Link 
                to="/new-entry" 
                className={`nav-link ${isActive('/new-entry') ? 'active' : ''}`}
              >
                <FaPen className="nav-icon" /> New Entry
              </Link>
              <Link 
                to="/profile" 
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              >
                <FaUserCircle className="nav-icon" /> Profile
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <FaSignOutAlt className="nav-icon" /> Logout
              </button>
            </>
          )}

          {!currentUser && (
            <>
              <Link 
                to="/login" 
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={`nav-link ${isActive('/register') ? 'active' : ''}`}
              >
                Sign Up
              </Link>
            </>
          )}

          <div className="theme-toggle-container">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}