import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const Layout = ({ children }) => {
  const location = useLocation();

  // Check if the current route is either /timer or /dashboard
  const isExcludedRoute = location.pathname === '/timer' || location.pathname === "/student-dashboard/:studentId";
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Render Header only if not on the /timer or /dashboard route */}
      {!isExcludedRoute && <Header />}
      
      <main className="flex-grow bg-white">
        {children}
      </main>
      
      {/* Always render Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
