import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar       from './components/Navbar';
import Hero         from './components/Hero';
import Stats        from './components/Stats';
import ExamSection  from './components/ExamSection';
import UploadSection from './components/UploadSection';
import HowItWorks   from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import FAQ          from './components/FAQ';
import Footer       from './components/Footer';
import AuthModal    from './components/AuthModal';
import SavedPhotos  from './components/SavedPhotos';
import ScrollToTop  from './components/ScrollToTop';
import ToastContainer, { showToast } from './components/Toast';
import { ThemeProvider } from './context/ThemeContext';

/* ── Scroll reveal hook ── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

function welcomeText(user, language) {
  const name = (user?.full_name || user?.username || '').split(' ')[0];
  return language === 'hi' ? `वापसी पर स्वागत है, ${name}!` : `Welcome back, ${name}!`;
}

function AppInner() {
  const [selectedExam, setSelectedExam] = useState(null);
  const [language,     setLanguage]     = useState('en');
  const [user,         setUser]         = useState(null);
  const [showAuth,     setShowAuth]     = useState(false);
  const [showHistory,  setShowHistory]  = useState(false);

  useScrollReveal();

  useEffect(() => {
    const saved = localStorage.getItem('examPixelUser');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch (_) { /* ignore corrupt value */ }
    }
  }, []);

  const handleSelectExam = (exam) => {
    setSelectedExam(exam);
    showToast(`${exam.name} selected!`, 'success');
    setTimeout(() => {
      document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleLoginSuccess = (userObj) => {
    setUser(userObj);
    localStorage.setItem('examPixelUser', JSON.stringify(userObj));
    setShowAuth(false);
    showToast(`👋 Welcome, ${userObj.full_name || userObj.username}!`, 'success', 3000);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('examPixelUser');
    showToast('Logged out', 'success', 2000);
  };

  return (
    <div className="app">
      <ScrollToTop />
      <Navbar
        language={language}
        setLanguage={setLanguage}
        user={user}
        onLoginClick={() => setShowAuth(true)}
        onLogoutClick={handleLogout}
        onHistoryClick={() => setShowHistory(true)}
      />

      <div style={{ position: 'relative' }}>
        {/* Account bar — now an overlay on top of the Hero's purple
            gradient (top-right), so there's no separate light-colored
            strip/gap above the Hero anymore. Move into Navbar.jsx itself
            once that file is shared, so it sits properly next to the
            Premium button. */}
        <div className={`account-bar ${user ? 'logged-in' : ''}`}>
          {user ? (
            <>
              <button onClick={() => setShowHistory(true)} className="account-btn fade-in-down">📁 My Photos</button>
              <button onClick={handleLogout} className="account-btn-logout fade-in-down">Logout</button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)} className="account-btn account-btn-shine">👤 Login</button>
          )}
        </div>

        {user && (
          <div className="hero-welcome-left">
            <span
              className="typewriter-text"
              style={{ '--typewriter-chars': `${welcomeText(user, language).length + 1}ch` }}
            >
              {welcomeText(user, language)}
            </span>
          </div>
        )}
        <Hero language={language} />
      </div>

      <Stats />
      <ExamSection
        language={language}
        onSelectExam={handleSelectExam}
        selectedExam={selectedExam}
      />
      <UploadSection
        selectedExam={selectedExam}
        language={language}
        user={user}
      />
      <HowItWorks language={language} />
      <Testimonials language={language} />
      <FAQ language={language} />
      <Footer language={language} />
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={handleLoginSuccess}
        language={language}
      />
      <SavedPhotos
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        user={user}
        language={language}
      />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
