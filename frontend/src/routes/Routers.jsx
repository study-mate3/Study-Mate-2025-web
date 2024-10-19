import React from 'react'

import Home from '../pages/Home'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import Contact from '../pages/Contact'

import {Routes, Route} from 'react-router-dom'
import OtpSubmissionPage from '../pages/OtpSubmissionPage'
import ToDoAfterLogin from '../pages/ToDoAfterLogin.jsx'

const Routers = () => {
  return (
    <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/home' element={<Home/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Signup/>} />
        <Route path='/contact' element={<Contact/>} />
        <Route path='/otp-submission' element={<OtpSubmissionPage/>} />
        <Route path='/to-do-after' element={<ToDoAfterLogin/>} />
    </Routes>
  )
}

export default Routers