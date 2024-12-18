// src/layout/Layout.jsx
import React from 'react';
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-4 bg-gray-100">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
