import React, { useState } from 'react';

const t = {
  en: {
    loginTitle: '👋 Welcome Back', signupTitle: '🚀 Create Your Account',
    subtitle: 'Save your resized photos and reuse them for future exams.',
    fullName: 'Full Name', email: 'Email', username: 'Username', password: 'Password',
    loginBtn: 'Login', signupBtn: 'Create Account',
    switchToSignup: "Don't have an account? Sign up",
    switchToLogin: 'Already have an account? Login',
    loading: 'Please wait…',
  },
  hi: {
    loginTitle: '👋 वापसी पर स्वागत है', signupTitle: '🚀 अपना अकाउंट बनाएं',
    subtitle: 'अपनी resize की गई फोटो सेव करें और भविष्य के एग्जाम के लिए दोबारा इस्तेमाल करें।',
    fullName: 'पूरा नाम', email: 'ईमेल', username: 'यूज़रनेम', password: 'पासवर्ड',
    loginBtn: 'लॉगिन करें', signupBtn: 'अकाउंट बनाएं',
    switchToSignup: 'अकाउंट नहीं है? साइन अप करें',
    switchToLogin: 'पहले से अकाउंट है? लॉगिन करें',
    loading: 'कृपया प्रतीक्षा करें…',
  }
};

export default function AuthModal({ isOpen, onClose, onSuccess, language }) {
  const [mode, setMode]       = useState('login'); // 'login' | 'signup'
  const [form, setForm]       = useState({ full_name: '', email: '', username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const text = t[language] || t.en;

  if (!isOpen) return null;

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/users/login' : '/api/users/register';
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : form;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Something went wrong');
      }
      onSuccess(data.user);
      setForm({ full_name: '', email: '', username: '', password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        <span className="modal-icon">{mode === 'login' ? '👋' : '🚀'}</span>
        <h2 className="modal-title">{mode === 'login' ? text.loginTitle : text.signupTitle}</h2>
        <p className="modal-subtitle">{text.subtitle}</p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
          {mode === 'signup' && (
            <div className="form-group">
              <label>{text.fullName}</label>
              <input required value={form.full_name} onChange={e => update('full_name', e.target.value)}
                style={authInput} placeholder={text.fullName} />
            </div>
          )}
          <div className="form-group">
            <label>{text.email}</label>
            <input required type="email" value={form.email} onChange={e => update('email', e.target.value)}
              style={authInput} placeholder="you@example.com" />
          </div>
          {mode === 'signup' && (
            <div className="form-group">
              <label>{text.username}</label>
              <input required value={form.username} onChange={e => update('username', e.target.value)}
                style={authInput} placeholder={text.username} />
            </div>
          )}
          <div className="form-group">
            <label>{text.password}</label>
            <input required type="password" value={form.password} onChange={e => update('password', e.target.value)}
              style={authInput} placeholder="••••••••" />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px 14px', borderRadius: 10, fontSize: 13 }}>
              {error}
            </div>
          )}

          <button type="submit" className="modal-subscribe-btn" disabled={loading}>
            {loading ? text.loading : (mode === 'login' ? text.loginBtn : text.signupBtn)}
          </button>
        </form>

        <div
          style={{ marginTop: 14, fontSize: 13, color: '#4f46e5', cursor: 'pointer', fontWeight: 600 }}
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
        >
          {mode === 'login' ? text.switchToSignup : text.switchToLogin}
        </div>
      </div>
    </div>
  );
}

const authInput = {
  padding: '10px 14px', border: '1.5px solid #e8eaf0', borderRadius: 10,
  fontSize: 14, fontFamily: 'Inter,sans-serif', outline: 'none', width: '100%',
};
