import React, { useState, useCallback, useEffect } from 'react';

let _addToast = null;

export function showToast(msg, type = 'default', duration = 3000) {
  if (_addToast) _addToast({ msg, type, duration, id: Date.now() });
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((t) => {
    setToasts(prev => [...prev, t]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), t.duration);
  }, []);

  useEffect(() => { _addToast = add; return () => { _addToast = null; }; }, [add]);

  const icons = { success: '✅', error: '❌', default: 'ℹ️' };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {icons[t.type] || icons.default} {t.msg}
        </div>
      ))}
    </div>
  );
}
