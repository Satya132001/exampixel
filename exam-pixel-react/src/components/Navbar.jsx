import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

const t = {
  en: { exams: 'Exams', how: 'How it works', faq: 'FAQ', login: 'Login', history: 'My Photos', logout: 'Logout' },
  hi: { exams: 'परीक्षाएं', how: 'कैसे काम करे', faq: 'सवाल-जवाब', login: 'लॉगिन', history: 'मेरी फोटो', logout: 'लॉगआउट' }
};

function Navbar({ language, setLanguage, user, onLoginClick, onLogoutClick, onHistoryClick }) {
  const [scrolled, setScrolled] = useState(false);
  const text = t[language] || t.hi;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const firstName = (user?.full_name || user?.username || '').split(' ')[0];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-inner">
        <div className="logo">
          Exam<span>Pixel</span>
        </div>

        <ul className="nav-links">
          <li><a href="#exams" onClick={(e) => handleNavClick(e, 'exams')}>{text.exams}</a></li>
          <li><a href="#how"   onClick={(e) => handleNavClick(e, 'how')}>{text.how}</a></li>
          <li><a href="#faq"   onClick={(e) => handleNavClick(e, 'faq')}>{text.faq}</a></li>
          <li>
            <div className="lang-toggle" onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}>
              <span className="lang-label">{language === 'hi' ? 'HI' : 'EN'}</span>
              <div className="toggle-track">
                <div className={`toggle-knob ${language === 'en' ? 'active' : ''}`}></div>
              </div>
              <span className="lang-label">{language === 'hi' ? 'EN' : 'HI'}</span>
            </div>
          </li>
          <li><ThemeToggle /></li>

          {user ? (
            <>
              <li>
                <span className="navbar-welcome fade-in-down">
                  👋 {language === 'hi' ? 'नमस्ते' : 'Welcome'}, {firstName}
                </span>
              </li>
              <li>
                <button className="navbar-btn fade-in-down" onClick={onHistoryClick}>
                  📁 {text.history}
                </button>
              </li>
              <li>
                <button className="navbar-btn-logout fade-in-down" onClick={onLogoutClick}>
                  {text.logout}
                </button>
              </li>
            </>
          ) : (
            <li>
              <button className="navbar-btn navbar-btn-shine" onClick={onLoginClick}>
                👤 {text.login}
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
