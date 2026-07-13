import React, { useState, useEffect } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible]   = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollY  = window.scrollY;
      const docH     = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(scrollY > 320);
      setProgress(docH > 0 ? (scrollY / docH) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Reading progress bar */}
      <div className="scroll-progress" style={{ width: `${progress}%` }} />
      {/* Scroll to top button */}
      <button
        className={`scroll-top-btn ${visible ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Back to top"
      >
        ↑
      </button>
    </>
  );
}
