import React from 'react';
import './StudentDashboard.css'
import Navbar from './Navbar';
import DailyStudyTimeDistribution from './DailyStudyTimeDistribution';

const StudentDashboard = () => {
    return (
        
         <div className="dashboard-container">
            <Navbar/>
                      {/* Header section */}
          <header className="dashboard-header">
          <div className="greeting-text">
            Hello Student01, Let's Check Out Your Progress!
        </div>
            <img className="header-image" src="https://i.imgur.com/oT4DJyC.jpeg" alt="Header Background" />
            <div className="profile-section">
              <img className="profile-icon" src="https://i.imgur.com/JLrgvNT.jpeg" alt="Student Profile" />
             
              <button className="profile-btn" style={{width: 150, height: 31, background: 'linear-gradient(180deg, #0570B2 0%, #0745A3 100%)', fontFamily:'Inter', fontWeight:'600', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 100}}>
              <img src="https://i.imgur.com/8fmLxfo.png" alt="Icon" className="button-icon" />
              Export Data</button>
            </div>
            <img className="webpage-icon" src="https://i.imgur.com/uYSZpVM.png" alt="Webpage Icon" />
          </header>
    
          <div className="content-section">
              {/* Cards Section */}
              <div className="cards-container">

                  {/* Long Card */}
        <div className="long-card">
            <h1 className='subhead'>Today</h1>
            <div className="stats-container">
                <div className="stat-row">
                    <div className="stat-item">
                        <p className="stat-text">Total Study Hours</p>
                    </div>
                    <p className="highlighted-number">08h</p>
                </div>

                <div className="stat-row">
                    <div className="stat-item">
                        <p className="stat-text">Total Tasks</p>
                    </div>
                    <p className="highlighted-number">06</p>
                </div>

                <div className="stat-row">
                    <div className="stat-item">
                        <p className="stat-text">Total Breaks</p>
                    </div>
                    <p className="highlighted-number">02h</p>
                </div>

                <div className="stat-row">
                    <div className="stat-item">
                        <p className="stat-text">Completed Tasks</p>
                    </div>
                    <p className="highlighted-number">04</p>
                </div>
            </div>
        </div>
                  

                <div className="small-cards-container">
                <div className="small-cards">
                      <div className="small-card">
                          <img src="https://i.imgur.com/8fmLxfo.png" alt="Icon" className="card-icon" />
                          <p className="card-text">Total To-do <br></br>List Items</p>
                          <p className="number">26</p>
                      </div>

                      <div className="small-card">
                          <img src="https://i.imgur.com/8fmLxfo.png" alt="Icon" className="card-icon" />
                          <p className="card-text">Total Awards</p>
                          <p className="number">02</p>
                      </div>

                      <div className="small-card">
                          <img src="https://i.imgur.com/8fmLxfo.png" alt="Icon" className="card-icon" />
                          <p className="card-text">Total Study <br></br>Hours</p>
                          <p className="number">80h</p>
                      </div>

                      <div className="small-card">
                          <img src="https://i.imgur.com/8fmLxfo.png" alt="Icon" className="card-icon" />
                          <p className="card-text">Notifications</p>
                          <p className="number">6</p>
                      </div>
                  </div>
                </div>
                  {/* Small Cards */}
                  
                 

              </div>
              <div className='chart-container'>
              <DailyStudyTimeDistribution/>
              <StudyHoursOverviewChart/>

              </div>
          </div>
        </div>
        
    
        
          
      );
    };

export default StudentDashboard
