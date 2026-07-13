import React, { useEffect, useState } from 'react';

const t = {
  en: {
    title: '📁 My Saved Photos', empty: 'No saved photos yet — download a converted photo while logged in to see it here.',
    loading: 'Loading your photos…', download: 'Download', error: 'Could not load your photos.',
  },
  hi: {
    title: '📁 मेरी सेव की गई फोटो', empty: 'अभी तक कोई फोटो सेव नहीं है — लॉगिन रहते हुए कोई फोटो डाउनलोड करें, वो यहाँ दिखेगी।',
    loading: 'आपकी फोटो लोड हो रही हैं…', download: 'डाउनलोड', error: 'फोटो लोड नहीं हो पाईं।',
  }
};

export default function SavedPhotos({ isOpen, onClose, user, language }) {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const text = t[language] || t.en;

  useEffect(() => {
    if (!isOpen || !user?.id) return;
    setLoading(true);
    setError('');
    fetch(`/api/images/history/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success) throw new Error(data.message || 'Failed');
        setItems(data.images || []);
      })
      .catch(() => setError(text.error))
      .finally(() => setLoading(false));
  }, [isOpen, user, text.error]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-box wide" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        <span className="modal-icon">📁</span>
        <div className="modal-title">{text.title}</div>

        {!user?.id ? (
          <p className="modal-subtitle">Please login to view your saved photos.</p>
        ) : loading ? (
          <p className="modal-subtitle">{text.loading}</p>
        ) : error ? (
          <p className="modal-subtitle" style={{ color: '#b91c1c' }}>{error}</p>
        ) : items.length === 0 ? (
          <p className="modal-subtitle">{text.empty}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 14, marginTop: 10 }}>
            {items.map(item => (
              <div key={item.id} style={{ border: '1.5px solid #e8eaf0', borderRadius: 14, padding: 10, textAlign: 'center' }}>
                <img src={item.file_path} alt={item.exam_name}
                  style={{ width: '100%', height: 100, objectFit: 'contain', borderRadius: 8, background: '#f8f9ff' }} />
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a2e', marginTop: 8 }}>{item.exam_name}</div>
                <div style={{ fontSize: 10, color: '#888', textTransform: 'capitalize' }}>{item.doc_type}</div>
                <a href={item.file_path} download style={{
                  display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 700,
                  color: 'white', background: '#4f46e5', padding: '6px 14px', borderRadius: 50,
                }}>
                  {text.download}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
