import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Features from '../components/Features';
import Header from '../components/Header/Header';
import Welcome from '../components/Welcome';
import DownloadSection from '../components/Downloads';

const Home = () => {
  const location = useLocation();

  // Create refs for each section
  const welcomeRef = useRef(null);
  const downloadRef = useRef(null);
  const featuresRef = useRef(null);

  // Function to scroll based on section name
  const scrollToSection = (section) => {
    if (section === 'welcome') welcomeRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (section === 'downloads') downloadRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (section === 'features') featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (location.state?.scrollTo) {
      scrollToSection(location.state.scrollTo);
      // Optional: clear the state so it doesn't scroll again if user navigates back
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <>
      <div
        className="container relative h-[760px] w-full bg-[url('./assets/images/HomePageIcons/bg_img_math.png')] bg-center bg-no-repeat m-0"
      >
        <Header onScrollToSection={scrollToSection} />
        <section id="welcome-section" ref={welcomeRef} className="m-0 p-0">
          <Welcome />
        </section>
      </div>
      <section className="py-4 px-20" ref={downloadRef}>
        <div>
          <h2 className="text-[22px] sm:text-[30px] font-extra-bold text-center tracking-super-wide text-headingColor">
            DOWNLOADS
          </h2>
          <DownloadSection />
        </div>
      </section>
      <section className="pt-8" ref={featuresRef}>
        <Features />
      </section>
    </>
  );
};

export default Home;
