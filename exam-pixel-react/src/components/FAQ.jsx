import React, { useState } from 'react';

const t = {
  en: {
    tag: 'FAQ', heading: 'Common Questions',
    items: [
      { q: 'Is this completely free?', a: 'Yes, ExamPixel is 100% free. No registration, no payment — ever. Basic photo conversion will always remain free.' },
      { q: 'Is my photo safe?', a: 'Absolutely. Your photo is processed only inside your browser using Canvas API. Nothing is uploaded to our servers at any point.' },
      { q: 'Which formats are supported?', a: 'JPG, JPEG and PNG uploads are supported. Output can be downloaded as JPG, PNG, or WEBP based on your selection in editor controls.' },
      { q: 'What does AI Enhance do?', a: 'AI Enhance sharpens your photo using a convolution filter, upscales it to 2x resolution, and optimizes quality — making it sharper and clearer for official documents.' },
      { q: 'My exam is not in the list?', a: 'Use the Custom Size option at the bottom of the exam list. You can manually enter any width, height, DPI and max file size as per your exam notification.' }
    ]
  },
  hi: {
    tag: 'सवाल-जवाब', heading: 'आम सवाल',
    items: [
      { q: 'क्या यह बिल्कुल मुफ्त है?', a: 'हाँ, ExamPixel बिल्कुल मुफ्त है। कोई रजिस्ट्रेशन नहीं, कोई भुगतान नहीं। बेसिक फोटो कन्वर्जन हमेशा मुफ्त रहेगा।' },
      { q: 'क्या मेरी फोटो सुरक्षित है?', a: 'बिल्कुल। आपकी फोटो केवल आपके ब्राउज़र में Canvas API से प्रोसेस होती है। हमारे सर्वर पर कुछ भी अपलोड नहीं होता।' },
      { q: 'कौन से फॉर्मेट स्वीकार्य हैं?', a: 'JPG, JPEG और PNG — तीनों अपलोड हो सकते हैं। आउटपुट आपकी पसंद के अनुसार JPG, PNG, या WEBP में मिलेगा।' },
      { q: 'AI एन्हांस क्या करता है?', a: 'AI एन्हांस फोटो को convolution filter से शार्पन करता है, 2x रिज़ॉल्यूशन में अपस्केल करता है — जिससे सरकारी दस्तावेज़ों के लिए फोटो और स्पष्ट बनती है।' },
      { q: 'मेरी परीक्षा सूची में नहीं है?', a: 'Custom Size विकल्प उपयोग करें। आप अपनी परीक्षा की अधिसूचना के अनुसार width, height, DPI और max file size खुद सेट कर सकते हैं।' }
    ]
  }
};

function FAQ({ language }) {
  const [openIdx, setOpenIdx] = useState(null);
  const text = t[language] || t.hi;

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section className="faq" id="faq">
      <div className="container">
        <div className="section-tag">{text.tag}</div>
        <h2>{text.heading}</h2>
        <div className="faq-list">
          {text.items.map((item, i) => (
            <div key={i} className={`faq-item ${openIdx === i ? 'open' : ''}`}>
              <div className="faq-q" onClick={() => toggle(i)}>
                <span>{item.q}</span>
                <span className={`faq-arrow ${openIdx === i ? 'open' : ''}`}>▼</span>
              </div>
              <div className="faq-a" style={{ display: openIdx === i ? 'block' : 'none' }}>
                {item.a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
