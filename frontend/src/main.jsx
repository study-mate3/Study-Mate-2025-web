// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AuthProvider from './contexts/AuthContext';
import './index.css';

// Initialize the root
const root = createRoot(document.getElementById('root'));

// Render the app within AuthProvider
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
