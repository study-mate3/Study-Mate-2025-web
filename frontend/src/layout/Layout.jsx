
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import ChatAssistant from '../components/ChatAssistant/ChatAssistant';

const Layout = ({ children }) => {
  const location = useLocation();

  // ✅ Pages that SHOULD have the Header
  const headerIncludedRoutes = ["/home"]; // Add more if needed

  // ✅ Show header only if current path matches one in the above list
  const showHeader = headerIncludedRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}

      <main className="flex-grow bg-white">{children}</main>

      <Footer />
      
      {/* Chat Assistant - available everywhere for logged-in users */}
      <ChatAssistant />
    </div>
  );
};

export default Layout;
