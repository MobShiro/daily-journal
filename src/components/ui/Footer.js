import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaTwitter, FaFacebook, FaInstagram, FaGithub } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h4 className="footer-title">Daily Journal</h4>
            <p className="footer-description">
              Your secure space for daily reflections and personal growth.
              Record your thoughts, track your mood, and discover insights.
            </p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/entries">My Entries</Link></li>
              <li><Link to="/new-entry">Create Entry</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-title">Resources</h4>
            <ul className="footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Help & Support</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-title">Connect</h4>
            <div className="social-links">
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="Facebook"><FaFacebook /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="GitHub"><FaGithub /></a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} Daily Journal. All rights reserved.</p>
          <p className="footer-credit">Made with <FaHeart className="heart-icon" /> for reflective journaling</p>
        </div>
      </div>
    </footer>
  );
}