import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const Layout = ({ children }) => {
  const location = useLocation();

  // Check if the current route is either /timer or /dashboard
  const isExcludedRoute = location.pathname === '/timer' || location.pathname === "/student-dashboard/:studentId"|| location.pathname === "/login"|| location.pathname === "/signup/:role"|| location.pathname === "/role"|| location.pathname === "/"|| location.pathname === "/signup/student"|| location.pathname === "/signup/parent"|| location.pathname === "/unauthorized"|| location.pathname === "/todo-after-login"||location.pathname === "/notifications"
  |location.pathname === "/faq" ||location.pathname === "/PomodoroReview" ||location.pathname === "/admin-dashboard" ||location.pathname === "/issues" ||location.pathname === "/quiz" ||location.pathname === "/payment" || location.pathname === "/quizGenerator" || location.pathname === "/olquiz" || location.pathname === "/adminQuiz" || location.pathname === "/updateQuiz";
  
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
