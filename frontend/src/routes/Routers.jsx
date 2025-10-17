import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Unauthorized from '../pages/Unauthorized';
import AdminDashboard from '../pages/AdminDashboard';
import ParentDashboard from '../pages/ParentDashboard';
import StudentDashboard from '../pages/StudentDashboard';
import PrivateRoute from './PrivateRoute';
import Downloads from '../pages/Downloads';
import Contact from '../pages/Contact';
import PomodoroTimer from '../pages/PomodoroTimer';
import ToDoListPage from '../pages/ToDoAfterLogin';
import Notification from '../pages/Notification';
import SignUp from '../pages/Signup';
import RoleSelection from '../pages/RoleSelection';
import StudentDetailsPage from '../components/StudentDetails';
import Loading from '../components/Loading';
import FAQPage from '../pages/Contact';
import PomodoroReview from '../components/Rewards/PomodoroReview';
import IssuesList from '../pages/IssuesList';
import Quiz from '../pages/Quiz';
import PayPage from '../pages/Paypage';
import QuizGenerator from '../pages/QuizGenerator';
import OLQuiz from '../pages/Olquiz';
import AdminAddQuestion from '../pages/Adminquiz/AdminAddQuestions';
import UpdatePapers from '../pages/Adminquiz/UpdatePapers';

const Routers = () => {
  return (
    <Router>
      <Suspense fallback={<Loading />}></Suspense>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signup/:role" element={<SignUp/>} />
          <Route path="/role" element={<RoleSelection/>}/>
          <Route path="/login" element={<Login />} />
          <Route path="/faq" element={<PrivateRoute roleRequired="student"><FAQPage/></PrivateRoute>} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/timer" element={<PomodoroTimer/>} />
          <Route path="/todo-after-login" element={<PrivateRoute roleRequired="student"><ToDoListPage /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute roleRequired="student"><Notification /></PrivateRoute>} />
          <Route path="/admin-dashboard" element={<PrivateRoute roleRequired="admin"><AdminDashboard /></PrivateRoute>} />
          <Route path="/parent-dashboard" element={<PrivateRoute roleRequired="parent"><ParentDashboard /></PrivateRoute>} />
          <Route path="/student-dashboard/:studentId" element={<PrivateRoute roleRequired="student"><StudentDashboard/></PrivateRoute>} />
          <Route path="/student-details" element={<PrivateRoute roleRequired="parent"><StudentDetailsPage/></PrivateRoute>} />
          <Route path="/PomodoroReview" element={<PrivateRoute roleRequired="student"><PomodoroReview/></PrivateRoute>} />
          <Route path="/issues" element={<PrivateRoute roleRequired="admin"><IssuesList/></PrivateRoute>} />
          <Route path="/quiz" element={<PrivateRoute roleRequired="student"><Quiz/></PrivateRoute>} />
          <Route path="/payment" element={<PrivateRoute roleRequired="student"><PayPage/></PrivateRoute>} />
          <Route path="/quizGenerator" element={<QuizGenerator/>}   />
          <Route path="/olquiz" element={<OLQuiz/>}   />
          <Route path="/adminQuiz" element={<AdminAddQuestion/>}/>
          <Route path="/updateQuiz" element={<UpdatePapers/>}/>



          {/*<Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} /> */}
        </Routes>
      </Layout>
    </Router>
  );
};

export default Routers;
