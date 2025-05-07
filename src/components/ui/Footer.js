import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer>
      <div className="footer-content">
        <p>© {currentYear} Daily Journal. All rights reserved.</p>
        <p>Your secure space for daily reflections</p>
      </div>
    </footer>
  );
}