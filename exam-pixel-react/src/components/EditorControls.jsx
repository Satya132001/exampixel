import React from 'react';

const t = {
  en: { format: 'Format', bg: 'Background' },
  hi: { format: 'फॉर्मेट', bg: 'बैकग्राउंड' }
};

function EditorControls({ language, format, bgColor, setFormat, setBgColor }) {
  const text = t[language] || t.hi;
  return (
    <div className="editor-controls">
      <div className="row two-col">
        <div className="form-group">
          <label>{text.format}</label>
          <select value={format} onChange={e => setFormat(e.target.value)}>
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WEBP</option>
          </select>
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
    </div>
  );
}

export default EditorControls;
