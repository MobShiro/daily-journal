import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';

export default function ThemeToggle() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme} 
      className="theme-toggle-btn"
      aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {darkMode ? <FaSun /> : <FaMoon />}
    </button>
  );
}