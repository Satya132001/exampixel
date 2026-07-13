import React from 'react';

const t = {
  en: {
    tag: 'Simple Process', heading: 'How does ExamPixel work?',
    steps: [
      { icon: '🎯', title: 'Select Your Exam', desc: 'Choose SSC, Railway, UPSC or any exam. All photo settings (size, DPI, file size) auto-configured.' },
      { icon: '📤', title: 'Upload Your Photo', desc: 'Upload photo, signature or fingerprint — any size. Use Auto Convert or Manual Crop mode.' },
      { icon: '⬇️', title: 'Download Instantly', desc: 'Exact size, DPI and file size — all automatic. One click download, ready for form submission.' },
    ]
  },
  hi: {
    tag: 'आसान प्रक्रिया', heading: 'ExamPixel कैसे काम करता है?',
    steps: [
      { icon: '🎯', title: 'परीक्षा चुनें', desc: 'SSC, Railway, UPSC चुनें। सभी फोटो सेटिंग्स (साइज़, DPI, फ़ाइल साइज़) अपने आप सेट हो जाती हैं।' },
      { icon: '📤', title: 'फोटो अपलोड करें', desc: 'फोटो, हस्ताक्षर या अंगूठे का निशान — ऑटो कन्वर्ट या मैनुअल क्रॉप मोड उपयोग करें।' },
      { icon: '⬇️', title: 'तुरंत डाउनलोड करें', desc: 'सही साइज़, DPI और फ़ाइल साइज़ — एक क्लिक में डाउनलोड, फॉर्म सबमिशन के लिए तैयार।' },
    ]
  }
};

export default function HowItWorks({ language }) {
  const text = t[language] || t.en;
  return (
    <section className="how" id="how">
      <div className="container">
        <div className="section-tag reveal">{text.tag}</div>
        <h2 className="reveal">{text.heading}</h2>
        <div className="steps-grid">
          {text.steps.map((s, i) => (
            <div key={i} className={`step-card reveal reveal-delay-${i + 1}`}>
              <div className="step-num">{i + 1}</div>
              <div className="step-icon">{s.icon}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
