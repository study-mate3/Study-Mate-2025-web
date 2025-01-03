
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

import Test from '../pages/Test';
import Features from '../pages/Features';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const Routers = () => {
  return (
    <Router>
      <Suspense fallback={<Loading />}></Suspense>
      <Layout>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signup/:role" element={<SignUp/>} />
          <Route path="/role" element={<RoleSelection/>}/>
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/features" element={<Features />} />
          <Route path="/test" element={<PrivateRoute roleRequired="student"><Test /></PrivateRoute>} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/timer" element={<PrivateRoute roleRequired="student"><PomodoroTimer /></PrivateRoute>} />
          <Route path="/todo-after-login" element={<PrivateRoute roleRequired="student"><ToDoListPage /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute roleRequired="student"><Notification /></PrivateRoute>} />
          <Route path="/admin-dashboard" element={<PrivateRoute roleRequired="admin"><AdminDashboard /></PrivateRoute>} />
          <Route path="/parent-dashboard" element={<PrivateRoute roleRequired="parent"><ParentDashboard /></PrivateRoute>} />
          <Route path="/student-dashboard/:studentId" element={<PrivateRoute roleRequired="student"><StudentDashboard /></PrivateRoute>} />
          <Route path="/student-details" element={<PrivateRoute roleRequired="parent"><StudentDetailsPage/></PrivateRoute>} />

          {/*<Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} /> */}
        </Routes>
      </Layout>
    </Router>
  );
};

export default Routers;
