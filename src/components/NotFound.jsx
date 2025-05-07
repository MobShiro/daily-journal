import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import '../styles/main.css';

export default function NotFound() {
  return (
    <div className="not-found-container fade-in">
      <div className="not-found-content">
        <div className="not-found-icon">
          <FaExclamationTriangle size={64} />
        </div>
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <p className="not-found-message">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            <FaHome className="btn-icon-left" /> Return to Home
          </Link>
          <Link to="/entries" className="btn btn-secondary">
            <FaSearch className="btn-icon-left" /> Browse Journal Entries
          </Link>
        </div>
      </div>
    </div>
  );
}