import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';  // ✅ IMPORT

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>  {/* ✅ WRAP */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);