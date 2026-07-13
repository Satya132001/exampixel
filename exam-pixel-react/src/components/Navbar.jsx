import React, { useState, useEffect } from 'react';
import { FaCrown } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';

const t = {
  en: { exams: 'Exams', how: 'How it works', faq: 'FAQ', premium: 'Premium' },
  hi: { exams: 'परीक्षाएं', how: 'कैसे काम करे', faq: 'सवाल-जवाब', premium: 'प्रीमियम' }
};

function Navbar({ language, setLanguage, isPremium, onPremiumClick }) {
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

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-inner">
        <div className="logo">
          Exam<span>Pixel</span>
          {isPremium && <span className="pro-badge">PRO</span>}
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
          <li>
            <button className="premium-btn" onClick={onPremiumClick}>
              <FaCrown style={{ marginRight: '5px' }} />{text.premium}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
