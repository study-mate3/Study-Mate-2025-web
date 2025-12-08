import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import Header from '../components/Header/Header';  // Import Header
import './AboutUs.css';
import { LinearGradient } from 'react-text-gradients';

const supervisor = {
  name: 'Mr. Charuka Moremada',
  role: 'Project Supervisor',
  photo: '/team/supervisor.png',
  email: 'charukavinda@outlook.com',
  linkedin: 'https://www.linkedin.com/in/charuka-moremada-01b829121',
};


const teamMembers = [
  {
    name: 'Kanishka Gunasinghe',
    role: 'Project Manager/ Full Stack Developer',
    photo: '/team/kanishka-new.png',
    phone: '+94 710571733',
    email: 'kanishkapg1121@gmail.com',
    linkedin: 'https://www.linkedin.com/in/kanishka-gunasinghe/',
  },
  {
    name: 'Tharunethu Wanniarachchi',
    role: 'UX UI designer/ Full Stack Developer',
    photo: '/team/tharunethu.png',
    phone: '+94 766020225',
    email: 'tharu0nethu@gmail.com',
    linkedin: 'https://www.linkedin.com/in/tharunethu-wanniarachchi1/',
  },
  {
    name: 'Levindu Herath',
    role: 'Mobile Developer',
    photo: '/team/levindu-new.png',
    phone: '+94 779402148',
    email: 'levinduherath@gmail.com,',
    linkedin: 'https://www.linkedin.com/in/levindu-herath/',
  },
  {
    name: 'Imal Pasindu Hathnagoda',
    role: 'Full Stack Developer ',
    photo: '/team/pasindu-new.png',
    phone: '+94 706592381',
    email: 'pasindu.code2001@gmail.com ',
    linkedin: 'https://www.linkedin.com/in/imal-pasindu-hathnagoda-1a79982b3/',
  },
];

const AboutUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const sendEmail = (e) => {
    e.preventDefault();

    const templateParams = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
    };

    if (!formData.name || !formData.email || !formData.message) {
      setStatusMessage('Please fill in all fields.');
      return;
    }

    emailjs
      .send(
        'service_869z5ji',
        'template_90az1rd', // Replace with your EmailJS template ID
        templateParams,
        '9Ai-grfLxkPVUUyqz' // Replace with your EmailJS public key
      )
      .then(() => {
        setStatusMessage('Message sent! Thank you for reaching out.');
        setFormData({ name: '', email: '', message: '' });
      })
      .catch(() => {
        setStatusMessage('Oops! Something went wrong. Please try again later.');
      });
  };

  return (
    <>
      <Header hideStudyPlanButton={true} alwaysWhite={true} />
      <div className="aboutus-container">
        <h1 className="about-header"><LinearGradient gradient={['to left', '#012862 ,#0570B2']}>
    The Team Shaping Your Learning Journey
  </LinearGradient></h1>

      <h2 className="about-header supervisor-title">
  <LinearGradient gradient={['to left', '#012862 ,#0570B2']}>
    Project Supervisor
  </LinearGradient>
</h2>

<div className="supervisor-wrapper">
  <div className="team-card supervisor-card">
    <div className="image-container">
      <img src={supervisor.photo} alt={supervisor.name} className="team-photo" />
      <div className="overlay-text">
        <h3>{supervisor.name}</h3>
        <p className="role">{supervisor.role}</p>
      </div>
    </div>

    <div className="contact-info">
    
      <div className="contact-row">
        <img src="/icons/email.png" alt="Email" className="icon" />
        <span>{supervisor.email}</span>
      </div>
      <div className="contact-row">
        <img src="/icons/linkedin.png" alt="LinkedIn" className="icon" />
        <a href={supervisor.linkedin} target="_blank" rel="noopener noreferrer">
          {supervisor.linkedin}
        </a>
      </div>
    </div>
  </div>
</div>
 <h2 className="about-header supervisor-title">
  <LinearGradient gradient={['to left', '#012862 ,#0570B2']}>
    Our Team
  </LinearGradient>
</h2>
        <div className="team-grid">
          {teamMembers.map(({ name, role, photo, phone, email, linkedin }) => (
            <div key={name} className="team-card">
              <div className="image-container">
                <img src={photo} alt={`${name}`} className="team-photo" />
                <div className="overlay-text">
                  <h3>{name}</h3>
                  <p className="role">{role}</p>
                </div>
              </div>

              <div className="contact-info">
                    <div className="contact-row">
                      <img src="/icons/phone.png" alt="Phone" className="icon" />
                      <span>{phone}</span>
                    </div>
                    <div className="contact-row">
                      <img src="/icons/email.png" alt="Email" className="icon" />
                      <span>{email}</span>
                    </div>
                    <div className="contact-row">
                      <img src="/icons/linkedin.png" alt="LinkedIn" className="icon" />
                      <a href={linkedin} target="_blank" rel="noopener noreferrer">{linkedin}</a>
                    </div>
                  </div>

                              </div>
                            ))}
                          </div>

        <div className="contact-form-section">
          <h2>Send Us a Message</h2>
          <p className="intro-text">
          We’re here to help you with smart solutions. If you want to know more or share your feedback,
          please don’t hesitate to contact us. We love hearing from you!
        </p>

          <form onSubmit={sendEmail} className="contact-form">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              className="textarea-field"
            />
            <button type="submit" className="send-button">
              Send Message
            </button>
          </form>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
      </div>
    </>
  );
};

export default AboutUs;
