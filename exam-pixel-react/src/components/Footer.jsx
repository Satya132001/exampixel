import React, { useState } from 'react';

// ── Modal content ────────────────────────────────────────────────────────────
const PRIVACY = `
**Privacy Policy — ExamPixel**
Last updated: January 2025

**1. Information We Collect**
ExamPixel does NOT collect, store, or transmit any personal information or images. All photo processing happens entirely within your browser using the Canvas API. Your photos never leave your device.

**2. Local Storage**
We use your browser's localStorage only to save:
- Your theme preference (dark/light mode)
- Your language preference (English/Hindi)
- Recently used exam selections
- Premium activation status

No personal data, no images, and no form data is stored.

**3. No Cookies**
ExamPixel does not use tracking cookies, analytics cookies, or advertising cookies of any kind.

**4. Third-Party Services**
If you choose to subscribe to Premium, payment is processed securely by Razorpay. ExamPixel does not store your payment details. Please refer to Razorpay's Privacy Policy for their data practices.

**5. Children's Privacy**
ExamPixel does not knowingly collect data from anyone under the age of 13.

**6. Changes to This Policy**
We may update this Privacy Policy. Continued use of ExamPixel after changes constitutes acceptance.

**7. Contact**
For privacy concerns, email us at: privacy@exampixel.in
`;

const TERMS = `
**Terms of Use — ExamPixel**
Last updated: January 2025

**1. Acceptance of Terms**
By using ExamPixel, you agree to these Terms of Use. If you do not agree, please discontinue use immediately.

**2. Service Description**
ExamPixel is a free browser-based tool that helps users resize and crop photos for government exam forms. The service is provided "as is" without warranties of any kind.

**3. Permitted Use**
You may use ExamPixel for:
- Personal photo resizing for government exam applications
- Educational purposes
- Non-commercial use

**4. Prohibited Use**
You may NOT use ExamPixel to:
- Upload illegal, obscene, or harmful content
- Attempt to reverse-engineer or misuse the service
- Use the service for any commercial purpose without written permission

**5. Accuracy of Output**
While ExamPixel strives to produce correct photo dimensions as per exam guidelines, users are responsible for verifying that their photo meets the specific requirements of their exam notification. ExamPixel is not liable for form rejections.

**6. Premium Subscription**
Premium features are available via paid subscription. Payments are processed by Razorpay. Refund requests must be made within 7 days of purchase.

**7. Intellectual Property**
The ExamPixel name, logo, and design are the property of ExamPixel. You may not copy or redistribute any part of this service.

**8. Limitation of Liability**
ExamPixel is not liable for any direct, indirect, or consequential damages arising from the use or inability to use this service.

**9. Governing Law**
These terms are governed by the laws of India.

**10. Contact**
For terms-related queries: legal@exampixel.in
`;

// Contact is handled as a modal form (see ContactModal below)

// ── PolicyModal ──────────────────────────────────────────────────────────────
function PolicyModal({ title, content, onClose }) {
  const lines = content.trim().split('\n');
  return (
    <div style={MS.overlay} onClick={onClose}>
      <div style={MS.box} onClick={e => e.stopPropagation()}>
        <button style={MS.close} onClick={onClose}>✕</button>
        <h2 style={MS.title}>{title}</h2>
        <div style={MS.body}>
          {lines.map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={i} style={{ height: 10 }} />;
            if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.split('**').length === 3) {
              return <div key={i} style={MS.heading}>{trimmed.replace(/\*\*/g, '')}</div>;
            }
            if (trimmed.startsWith('- ')) {
              return <div key={i} style={MS.bullet}>• {trimmed.slice(2)}</div>;
            }
            return <p key={i} style={MS.para}>{trimmed}</p>;
          })}
        </div>
      </div>
    </div>
  );
}

// ── ContactModal ─────────────────────────────────────────────────────────────
function ContactModal({ onClose }) {
  const [form, setForm]     = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Please fill all required fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSent(true);
  };

  return (
    <div style={MS.overlay} onClick={onClose}>
      <div style={{ ...MS.box, maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <button style={MS.close} onClick={onClose}>✕</button>
        <h2 style={MS.title}>Contact Us</h2>
        <p style={{ ...MS.para, marginBottom: 20, color: '#888' }}>
          Have a question or feedback? We'd love to hear from you.
        </p>

        {sent ? (
          <div style={CS.success}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Message Sent!</div>
            <div style={{ fontSize: 14, color: '#555' }}>Thank you for reaching out. We'll get back to you within 24 hours.</div>
            <button style={CS.submitBtn} onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={CS.row}>
              <div style={CS.group}>
                <label style={CS.label}>Name *</label>
                <input style={CS.input} placeholder="Your full name"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div style={CS.group}>
                <label style={CS.label}>Email *</label>
                <input style={CS.input} type="email" placeholder="your@email.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div style={CS.group}>
              <label style={CS.label}>Subject</label>
              <select style={CS.input} value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}>
                <option value="">Select a topic...</option>
                <option>Photo conversion issue</option>
                <option>Premium subscription</option>
                <option>Exam size missing</option>
                <option>Bug report</option>
                <option>Feedback / Suggestion</option>
                <option>Other</option>
              </select>
            </div>

            <div style={CS.group}>
              <label style={CS.label}>Message *</label>
              <textarea style={{ ...CS.input, height: 110, resize: 'vertical' }}
                placeholder="Describe your issue or feedback in detail..."
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })} />
            </div>

            {error && <div style={CS.error}>{error}</div>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={CS.submitBtn}>Send Message →</button>
              <button type="button" style={CS.cancelBtn} onClick={onClose}>Cancel</button>
            </div>

            <div style={{ fontSize: 12, color: '#aaa', textAlign: 'center' }}>
              Or email us directly at{' '}
              <a href="mailto:support@exampixel.in" style={{ color: '#4f46e5' }}>support@exampixel.in</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const MS = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(12px)', zIndex: 2000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  },
  box: {
    background: '#fff', borderRadius: 24, padding: '40px 36px',
    maxWidth: 680, width: '100%', maxHeight: '85vh',
    display: 'flex', flexDirection: 'column', position: 'relative',
    boxShadow: '0 40px 120px rgba(0,0,0,0.25)',
    animation: 'modalIn 0.35s cubic-bezier(.2,.9,.3,1)',
  },
  close: {
    position: 'absolute', top: 16, right: 18, fontSize: 18,
    background: '#f0f0f5', border: 'none', borderRadius: '50%',
    width: 34, height: 34, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#555',
  },
  title:   { fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 16 },
  body:    { overflowY: 'auto', flex: 1, paddingRight: 4 },
  heading: { fontSize: 15, fontWeight: 700, color: '#4f46e5', margin: '16px 0 6px' },
  para:    { fontSize: 14, color: '#444', lineHeight: 1.7, marginBottom: 6 },
  bullet:  { fontSize: 14, color: '#555', lineHeight: 1.7, paddingLeft: 12, marginBottom: 4 },
};

const CS = {
  row:       { display: 'flex', gap: 12 },
  group:     { display: 'flex', flexDirection: 'column', gap: 5, flex: 1 },
  label:     { fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input:     {
    padding: '10px 14px', border: '1.5px solid #e8eaf0', borderRadius: 10,
    fontSize: 14, fontFamily: 'Inter,sans-serif', outline: 'none',
    transition: 'border-color 0.2s', width: '100%', color: '#1a1a2e',
  },
  error:     { background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: 13 },
  success:   { textAlign: 'center', padding: '20px 0' },
  submitBtn: {
    flex: 1, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: 'white',
    border: 'none', borderRadius: 50, padding: '13px 28px', fontSize: 14,
    fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 4px 18px rgba(79,70,229,0.3)', transition: 'all 0.2s',
  },
  cancelBtn: {
    background: '#f0f0f8', color: '#888', border: 'none', borderRadius: 50,
    padding: '13px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
};

// ── Footer ────────────────────────────────────────────────────────────────────
const t = {
  en: { tagline: 'Made with ❤️ for Indian Exam Aspirants', hindi: 'भारत के परीक्षार्थियों के लिए', copy: '© 2025 ExamPixel. All rights reserved.' },
  hi: { tagline: 'भारत के परीक्षार्थियों के लिए ❤️ से बनाया गया', hindi: '', copy: '© 2025 ExamPixel. सर्वाधिकार सुरक्षित।' }
};

export default function Footer({ language }) {
  const [modal, setModal] = useState(null); // 'privacy' | 'terms' | 'contact'
  const text = t[language] || t.en;

  return (
    <>
      <footer className="footer">
        <div className="container">

          {/* Top section */}
          <div style={FS.top}>
            {/* Brand */}
            <div style={FS.brand}>
              <div className="logo" style={{ color: 'white', fontSize: 24, justifyContent: 'center' }}>
                Exam<span style={{ color: '#a5b4fc' }}>Pixel</span>
              </div>
              <p style={FS.brandSub}>
                India's #1 free government exam photo converter. No uploads, no registration, instant results.
              </p>
              <div style={FS.socialRow}>
                {['📧', '🐦', '💼'].map((icon, i) => (
                  <div key={i} style={FS.socialIcon}>{icon}</div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div style={FS.col}>
              <div style={FS.colTitle}>Quick Links</div>
              {[
                { label: '🎯 Choose Exam',   href: '#exams' },
                { label: '📤 Upload Photo',  href: '#upload-section' },
                { label: '⚙️ How it Works',  href: '#how' },
                { label: '❓ FAQ',           href: '#faq' },
              ].map((l, i) => (
                <a key={i} href={l.href} style={FS.link}
                  onClick={e => { e.preventDefault(); document.querySelector(l.href)?.scrollIntoView({ behavior: 'smooth' }); }}>
                  {l.label}
                </a>
              ))}
            </div>

            {/* Exams */}
            <div style={FS.col}>
              <div style={FS.colTitle}>Popular Exams</div>
              {['SSC CGL / CHSL', 'Railway NTPC', 'UPSC CSE', 'IBPS PO / Clerk', 'OSSC CGL', 'DSSSB'].map((e, i) => (
                <div key={i} style={FS.link}>{e}</div>
              ))}
            </div>

            {/* Legal + Contact */}
            <div style={FS.col}>
              <div style={FS.colTitle}>Support</div>
              <div style={{ ...FS.link, cursor: 'pointer' }} onClick={() => setModal('contact')}>📩 Contact Us</div>
              <div style={{ ...FS.link, cursor: 'pointer' }} onClick={() => setModal('privacy')}>🔒 Privacy Policy</div>
              <div style={{ ...FS.link, cursor: 'pointer' }} onClick={() => setModal('terms')}>📄 Terms of Use</div>
              <div style={FS.link}>🛡️ Secure &amp; Private</div>
              <div style={{ marginTop: 14 }}>
                <div style={FS.secureBadge}>🔐 Browser-only Processing</div>
                <div style={{ ...FS.secureBadge, marginTop: 6 }}>✅ No Data Stored</div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={FS.divider} />

          {/* Bottom */}
          <div style={FS.bottom}>
            <div style={FS.hindi}>{text.hindi || text.tagline}</div>
            <div style={FS.copy}>{text.copy}</div>
            <div style={FS.bottomLinks}>
              <span style={{ cursor: 'pointer', color: '#4a4a7a' }} onClick={() => setModal('privacy')}>Privacy</span>
              <span style={FS.dot}>·</span>
              <span style={{ cursor: 'pointer', color: '#4a4a7a' }} onClick={() => setModal('terms')}>Terms</span>
              <span style={FS.dot}>·</span>
              <span style={{ cursor: 'pointer', color: '#4a4a7a' }} onClick={() => setModal('contact')}>Contact</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Modals */}
      {modal === 'privacy' && (
        <PolicyModal title="Privacy Policy" content={PRIVACY} onClose={() => setModal(null)} />
      )}
      {modal === 'terms' && (
        <PolicyModal title="Terms of Use" content={TERMS} onClose={() => setModal(null)} />
      )}
      {modal === 'contact' && (
        <ContactModal onClose={() => setModal(null)} />
      )}
    </>
  );
}

// ── Footer styles ─────────────────────────────────────────────────────────────
const FS = {
  top: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
    gap: 40, paddingBottom: 40,
    '@media(max-width:768px)': { gridTemplateColumns: '1fr 1fr' },
  },
  brand:    { display: 'flex', flexDirection: 'column', gap: 12 },
  brandSub: { fontSize: 13, color: '#6870a0', lineHeight: 1.7, maxWidth: 260 },
  socialRow:{ display: 'flex', gap: 8, marginTop: 4 },
  socialIcon:{
    width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 16, cursor: 'pointer',
    transition: 'background 0.2s',
  },
  col:      { display: 'flex', flexDirection: 'column', gap: 8 },
  colTitle: { fontSize: 12, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 },
  link:     { fontSize: 13, color: '#6870a0', transition: 'color 0.2s', lineHeight: 1.8 },
  secureBadge: {
    display: 'inline-block', background: 'rgba(79,70,229,0.15)',
    border: '1px solid rgba(129,140,248,0.25)', color: '#818cf8',
    fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 50,
  },
  divider:  { borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 0 28px' },
  bottom:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' },
  hindi:    { fontSize: 15, color: '#818cf8', fontWeight: 500 },
  copy:     { fontSize: 12, color: '#3a3a5c' },
  bottomLinks: { display: 'flex', gap: 10, alignItems: 'center', fontSize: 12 },
  dot:      { color: '#3a3a5c' },
};
