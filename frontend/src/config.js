// This file handles the API URL logic based on the environment

// Vite sets import.meta.env.PROD to true when building for production (Vercel)
const isProduction = import.meta.env.PROD;

// Your Render Backend URL
const PROD_URL = 'https://study-mate-2025-web.onrender.com';
const DEV_URL = 'http://localhost:8000';

export const API_BASE_URL = isProduction ? PROD_URL : DEV_URL;

// Log to verify (remove in production)
console.log('API_BASE_URL:', API_BASE_URL);
console.log('Is Production:', isProduction);