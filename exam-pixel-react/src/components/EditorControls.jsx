import React from 'react';

const t = {
  en: { format: 'Format', quality: 'Quality', bg: 'Background', ai: '🤖 AI Enhance — Sharpen & Upscale', on: 'ON', off: 'OFF' },
  hi: { format: 'फॉर्मेट', quality: 'क्वालिटी', bg: 'बैकग्राउंड', ai: '🤖 AI एन्हांस — शार्पन और अपस्केल', on: 'ON', off: 'OFF' }
};

function EditorControls({ language, format, quality, bgColor, enhance, setFormat, setQuality, setBgColor, setEnhance }) {
  const text = t[language] || t.hi;
  return (
    <div className="editor-controls">
      <div className="row">
        <div className="form-group">
          <label>{text.format}</label>
          <select value={format} onChange={e => setFormat(e.target.value)}>
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WEBP</option>
          </select>
        </div>
        <div className="form-group">
          <label>{text.quality}</label>
          <input type="range" min="10" max="100" value={quality}
            onChange={e => setQuality(parseInt(e.target.value))} />
          <div className="range-value">{quality}%</div>
        </div>
        <div className="form-group">
          <label>{text.bg}</label>
          <select value={bgColor} onChange={e => setBgColor(e.target.value)}>
            <option value="#ffffff">White</option>
            <option value="transparent">Transparent</option>
            <option value="#f0f0f0">Light Gray</option>
            <option value="#000000">Black</option>
            <option value="#4f46e5">Exam Blue</option>
          </select>
        </div>
      </div>
      <div className="row">
        <div className="form-group" style={{ gridColumn: 'span 3' }}>
          <div
            className={`ai-enhance ${enhance ? 'active' : ''}`}
            onClick={() => setEnhance(!enhance)}
            style={{ cursor: 'pointer' }}
          >
            <span className="lock">{enhance ? '✅' : '⬜'}</span>
            <span className="label">{text.ai}</span>
            <span className="badge-pro">{enhance ? text.on : text.off}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorControls;
