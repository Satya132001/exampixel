import React from 'react';
import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
      <span className="theme-label">
        {theme === 'light' ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}

export default ThemeToggle;