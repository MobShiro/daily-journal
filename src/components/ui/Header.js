import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { FaSignOutAlt, FaBook } from 'react-icons/fa';

export default function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  return (
    <header>
      <div className="logo">
        <Link to="/" className="logo-link">
          <FaBook /> Daily Journal
        </Link>
      </div>

      <nav className="nav-links">
        <ThemeToggle />
        
        {currentUser && (
          <>
            <Link to="/entries" className="nav-link">
              Entries
            </Link>
            <Link to="/new-entry" className="nav-link">
              New Entry
            </Link>
            <button onClick={handleLogout} className="nav-link logout-btn">
              <FaSignOutAlt /> Logout
            </button>
          </>
        )}
        
        {!currentUser && (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/signup" className="nav-link">
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}