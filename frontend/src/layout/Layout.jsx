
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import ChatAssistant from '../components/ChatAssistant/ChatAssistant';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { role } = useAuth();

  // ✅ Pages that SHOULD have the Header
  const headerIncludedRoutes = ["/home"]; // Add more if needed

  // ✅ Show header only if current path matches one in the above list
  const showHeader = headerIncludedRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  // ✅ Hide ChatAssistant on PDF Viewer and Quiz pages, OR if user is not a student
  const hideChatAssistant = location.pathname.startsWith('/pdf-viewer') || 
                           location.pathname.startsWith('/quiz') ||
                           role !== 'student';

  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}

      <main className="flex-grow bg-white">{children}</main>

      <Footer />
      
      {/* Chat Assistant - available only for students */}
      {/* Chat Assistant - HIDDEN on /pdf-viewer and /quiz paths, and for parent/admin roles */}
      {!hideChatAssistant && <ChatAssistant />}
    </div>
  );
};

export default Layout;
