import React, { useState, useEffect } from 'react';
import ExamCard from './ExamCard';
import { examsData } from '../data/examsData';

const STATES = [
  { id: 'all',      label: '🌍 All' },
  { id: 'allindia', label: '🇮🇳 All India' },
  { id: 'odisha',   label: '🧡 Odisha' },
  { id: 'up',       label: '💛 UP' },
  { id: 'bihar',    label: '❤️ Bihar' },
  { id: 'mp',       label: '💚 MP' },
  { id: 'raj',      label: '💗 Rajasthan' },
  { id: 'custom',   label: '⚙️ Custom' },
];

const t = {
  en: {
    tag: 'Choose Your Exam', heading: 'Which exam are you applying for?',
    sub: 'Select your exam — all photo settings configured automatically.',
    trending: '🔥 Trending:', search: '🔍 Search exam...',
    recent: '🕐 Recently used:', noResults: 'No exams found. Try a different search.',
  },
  hi: {
    tag: 'अपना एग्जाम चुनें', heading: 'आप किस परीक्षा का फॉर्म भर रहे हैं?',
    sub: 'परीक्षा चुनें — सभी फोटो सेटिंग्स अपने आप हो जाएंगी।',
    trending: '🔥 ट्रेंडिंग:', search: '🔍 परीक्षा खोजें...',
    recent: '🕐 हाल ही में:', noResults: 'कोई परीक्षा नहीं मिली। दूसरे शब्द आज़माएं।',
  }
};

export default function ExamSection({ language, onSelectExam, selectedExam }) {
  const [search, setSearch]     = useState('');
  const [activeState, setActive] = useState('all');
  const [recent, setRecent]     = useState([]);
  const text = t[language] || t.en;

  // Load recent from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ep_recent') || '[]');
      setRecent(saved);
    } catch { setRecent([]); }
  }, []);

  const handleSelect = (exam) => {
    // Save to recent (max 3)
    setRecent(prev => {
      const updated = [exam.name, ...prev.filter(n => n !== exam.name)].slice(0, 3);
      localStorage.setItem('ep_recent', JSON.stringify(updated));
      return updated;
    });
    onSelectExam(exam);
  };

  const filtered = examsData
    .filter(e => {
      const stateOk  = activeState === 'all' || e.state === activeState;
      const searchOk = e.name.toLowerCase().includes(search.trim().toLowerCase());
      return stateOk && searchOk;
    })
    .sort((a, b) => (b.trending || 0) - (a.trending || 0));

  const trending = examsData.filter(e => (e.trending || 0) >= 8).slice(0, 4);

  return (
    <section className="exams reveal" id="exams">
      <div className="container">
        <div className="section-tag">{text.tag}</div>
        <h2>{text.heading}</h2>
        <p className="section-sub">{text.sub}</p>

        {/* Trending banner */}
        <div className="trending-banner">
          <span className="fire">🔥</span>
          <span className="text">{text.trending}</span>
          <div className="exams-list">
            {trending.map(exam => (
              <span key={exam.id} className="exam-tag" onClick={() => handleSelect(exam)}>
                {exam.name.split('/')[0].trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Recently used */}
        {recent.length > 0 && (
          <div className="recent-exams">
            <span>{text.recent}</span>
            {recent.map(name => {
              const exam = examsData.find(e => e.name === name);
              return exam ? (
                <span key={name} className="recent-chip" onClick={() => handleSelect(exam)}>{name}</span>
              ) : null;
            })}
          </div>
        )}

        {/* Search */}
        <div className="search-box">
          <input
            type="text"
            placeholder={text.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="button" className="clear-btn" onClick={() => setSearch('')}>✕</button>
        </div>

        {/* State filter */}
        <div className="state-filter">
          {STATES.map(s => (
            <button key={s.id} type="button"
              className={`state-btn ${activeState === s.id ? 'active' : ''}`}
              onClick={() => setActive(s.id)}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Exam grid — cards render fully visible immediately (no
            scroll-reveal animation), since this list changes dynamically
            as the user types/filters and shouldn't depend on a one-time
            page-load IntersectionObserver pass. */}
        <div className="exam-grid">
          {filtered.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              isSelected={selectedExam?.id === exam.id}
              onSelect={() => handleSelect(exam)}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: 15 }}>
              🔍 {text.noResults}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
