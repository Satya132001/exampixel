import React, { useEffect, useRef, useState } from 'react';

const STATS = [
  { icon: '📋', endVal: 30, suffix: '+', label: 'Exams Supported' },
  { icon: '⚡', endVal: 1,  suffix: ' Click', label: 'Convert & Download' },
  { icon: '🔒', endVal: 100, suffix: '%', label: 'Private & Secure' },
  { icon: '🤖', endVal: 4,  suffix: 'K', label: 'HD AI Output' },
];

function useCounter(end, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

function StatCard({ icon, endVal, suffix, label, animate }) {
  const count = useCounter(endVal, 1600, animate);
  return (
    <div className="stat-card reveal">
      <div className="stat-icon">{icon}</div>
      <div className="stat-num">{animate ? count : endVal}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Stats() {
  const [animate, setAnimate] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimate(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="stats" ref={ref}>
      <div className="container stats-grid">
        {STATS.map((s, i) => (
          <StatCard key={i} {...s} animate={animate} />
        ))}
      </div>
    </section>
  );
}
