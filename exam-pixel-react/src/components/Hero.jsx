import React, { useEffect, useRef } from 'react';

const content = {
  en: {
    badge: 'AI Enhance Available',
    title: 'Perfect Photo for Govt Exams —',
    span: '1 Click',
    sub: 'SSC, Railway, UPSC, Odisha SSC — correct size, DPI and file size set automatically for every exam.',
    btn: 'Choose Your Exam →',
    trust: ['100% Free', 'No Registration', 'Instant Download', 'Browser-only Processing']
  },
  hi: {
    badge: 'AI एन्हांस उपलब्ध',
    title: 'सरकारी परीक्षा के लिए —',
    span: 'परफेक्ट फोटो, 1 क्लिक में',
    sub: 'SSC, Railway, UPSC, Odisha SSC — सही साइज़, DPI और फ़ाइल साइज़ हर परीक्षा के लिए अपने आप सेट।',
    btn: 'अपना एग्जाम चुनें →',
    trust: ['100% मुफ्त', 'कोई रजिस्ट्रेशन नहीं', 'तुरंत डाउनलोड', 'ब्राउज़र में प्रोसेसिंग']
  }
};

export default function Hero({ language }) {
  const t   = content[language] || content.en;
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const particles = [];
    for (let i = 0; i < 22; i++) {
      const span = document.createElement('span');
      const size = Math.random() * 5 + 2;
      span.style.cssText = `
        position:absolute;
        width:${size}px; height:${size}px;
        background:rgba(255,255,255,${Math.random() * 0.3 + 0.08});
        border-radius:50%;
        left:${Math.random() * 100}%;
        bottom:${Math.random() * 15}%;
        animation:particleRise ${Math.random() * 10 + 9}s linear ${Math.random() * 8}s infinite;
      `;
      el.appendChild(span);
      particles.push(span);
    }
    return () => particles.forEach(p => p.remove());
  }, []);

  return (
    <section className="hero">
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />
      <div ref={ref} className="hero-particles" />

      <div className="hero-content container">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          {t.badge}
        </div>

        <h1>
          {t.title}<br />
          <span>{t.span}</span>
        </h1>

        <p className="hero-sub">{t.sub}</p>

        <button
          className="btn-primary"
          onClick={() => document.getElementById('exams')?.scrollIntoView({ behavior: 'smooth' })}
        >
          {t.btn}
        </button>

        <div className="hero-trust">
          {t.trust.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="dot" />}
              <span>{item}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="hero-bg-shape" />
    </section>
  );
}
