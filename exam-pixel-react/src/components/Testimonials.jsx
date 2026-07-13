import React from 'react';

const reviews = [
  { name: 'Rahul Kumar', role: 'SSC Aspirant', exam: 'SSC CGL', avatar: 'R', stars: 5,
    text: 'Bahut kaam ka tool hai! SSC CGL ka form bharte waqt photo size ki tension hoti thi. ExamPixel ne ek minute mein sab fix kar diya.' },
  { name: 'Priya Singh', role: 'Railway Exam', exam: 'Railway NTPC', avatar: 'P', stars: 5,
    text: 'Railway NTPC ke liye signature aur photo dono resize karne the. Crop feature ekdum sahi kaam kiya. Highly recommended!' },
  { name: 'Amit Patel', role: 'UPSC Aspirant', exam: 'UPSC CSE', avatar: 'A', stars: 5,
    text: 'Free mein itna achha tool! UPSC form mein 300x400px photo required thi — ExamPixel ne automatically sahi size de di.' },
  { name: 'Sneha Das', role: 'Odisha Aspirant', exam: 'OSSC CGL', avatar: 'S', stars: 5,
    text: 'OSSC CGL ke liye specifically settings hain — yeh bahut helpful hai. Manually photo resize karna ek nightmare tha pehle.' },
  { name: 'Vikash Yadav', role: 'IBPS Candidate', exam: 'IBPS PO', avatar: 'V', stars: 5,
    text: 'Dark mode bhi hai aur Hindi support bhi! Browser mein hi process hoti hai toh photo safe rehti hai. Great work!' },
  { name: 'Kavita Sharma', role: 'DSSSB Aspirant', exam: 'DSSSB', avatar: 'K', stars: 5,
    text: 'DSSSB form fill karte waqt yeh site mili. AI Enhance se photo aur sharp ho gayi. Download bhi ek click mein.' },
];

const t = {
  en: { tag: 'Student Reviews', heading: 'Trusted by Lakhs of Aspirants', sub: 'See what government exam candidates are saying about ExamPixel.' },
  hi: { tag: 'छात्रों की राय', heading: 'लाखों परीक्षार्थियों का भरोसा', sub: 'देखें कि सरकारी परीक्षा के उम्मीदवार ExamPixel के बारे में क्या कह रहे हैं।' }
};

export default function Testimonials({ language }) {
  const text = t[language] || t.en;
  return (
    <section className="testimonials-section reveal">
      <div className="container">
        <div className="section-tag">{text.tag}</div>
        <h2>{text.heading}</h2>
        <p className="section-sub">{text.sub}</p>
        <div className="testimonials-grid">
          {reviews.map((r, i) => (
            <div key={i} className={`testimonial-card reveal reveal-delay-${(i % 4) + 1}`}>
              <div className="testimonial-exam">{r.exam}</div>
              <div className="testimonial-stars">{'★'.repeat(r.stars)}</div>
              <p className="testimonial-text">{r.text}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{r.avatar}</div>
                <div>
                  <div className="testimonial-name">{r.name}</div>
                  <div className="testimonial-role">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
