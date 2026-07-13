import React, { useState, useRef, useCallback, useEffect } from 'react';

export default function ComparisonSlider({ originalSrc, convertedSrc, language = 'en' }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [dragging,  setDragging]  = useState(false);
  const [imgSize,   setImgSize]   = useState({ w: 0, h: 0 });
  const containerRef = useRef(null);
  const imgRef       = useRef(null);

  const label = language === 'hi'
    ? { original: 'मूल', converted: 'परिवर्तित', drag: 'स्लाइडर खींचें' }
    : { original: 'Original', converted: 'Converted', drag: 'Drag slider to compare' };

  // Get actual rendered image size so both sides match perfectly
  useEffect(() => {
    if (!imgRef.current) return;
    const update = () => {
      setImgSize({ w: imgRef.current.offsetWidth, h: imgRef.current.offsetHeight });
    };
    imgRef.current.addEventListener('load', update);
    if (imgRef.current.complete) update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [convertedSrc]);

  const calcPos = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const onMouseMove  = useCallback(e => { if (dragging) calcPos(e.clientX); }, [dragging, calcPos]);
  const onTouchMove  = useCallback(e => { if (dragging) calcPos(e.touches[0].clientX); e.preventDefault(); }, [dragging, calcPos]);

  return (
    <div style={S.wrapper}>
      <div
        ref={containerRef}
        style={S.container}
        onMouseMove={onMouseMove}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
        onTouchMove={onTouchMove}
        onTouchEnd={() => setDragging(false)}
      >
        {/* ── RIGHT side: Converted (base layer, full width) ── */}
        <img
          ref={imgRef}
          src={convertedSrc}
          alt="Converted"
          style={S.imgFull}
          draggable={false}
        />

        {/* ── LEFT side: Original — clipped to sliderPos% width ── */}
        {imgSize.w > 0 && (
          <div style={{ ...S.clipWrap, width: `${sliderPos}%` }}>
            {/* The original image must be SAME rendered size as converted */}
            <img
              src={originalSrc}
              alt="Original"
              draggable={false}
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: imgSize.w,
                height: imgSize.h,
                objectFit: 'contain',
                objectPosition: 'center',
                background: '#f8f9ff',
                display: 'block',
              }}
            />
          </div>
        )}

        {/* Labels */}
        <div style={S.labelLeft}>{label.original}</div>
        <div style={S.labelRight}>{label.converted}</div>

        {/* Divider line */}
        <div style={{ ...S.line, left: `${sliderPos}%` }} />

        {/* Handle */}
        <div
          style={{ ...S.handle, left: `${sliderPos}%` }}
          onMouseDown={e => { e.preventDefault(); setDragging(true); }}
          onTouchStart={e => { e.preventDefault(); setDragging(true); }}
        >
          <div style={S.handleCircle}>
            <span style={{ fontSize: 13, userSelect: 'none', letterSpacing: -2 }}>◀▶</span>
          </div>
        </div>
      </div>
      <div style={S.hint}>← {label.drag} →</div>
    </div>
  );
}

const S = {
  wrapper:   { marginTop: 16, userSelect: 'none', touchAction: 'none' },
  container: {
    position: 'relative', overflow: 'hidden', borderRadius: 14,
    border: '2px solid #e8eaf0', cursor: 'col-resize', background: '#f8f9ff',
  },
  imgFull: {
    display: 'block', width: '100%', maxHeight: 360,
    objectFit: 'contain', objectPosition: 'center',
    background: '#f8f9ff', pointerEvents: 'none',
  },
  clipWrap: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    overflow: 'hidden',
  },
  line: {
    position: 'absolute', top: 0, bottom: 0, width: 2,
    background: 'white', transform: 'translateX(-50%)',
    boxShadow: '0 0 8px rgba(0,0,0,0.25)', pointerEvents: 'none', zIndex: 5,
  },
  handle: {
    position: 'absolute', top: '50%',
    transform: 'translate(-50%, -50%)', zIndex: 10, cursor: 'col-resize',
  },
  handleCircle: {
    width: 40, height: 40, borderRadius: '50%',
    background: 'white', border: '2.5px solid #4f46e5',
    boxShadow: '0 3px 14px rgba(79,70,229,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#4f46e5', fontWeight: 800,
  },
  labelLeft: {
    position: 'absolute', top: 10, left: 10, zIndex: 6,
    background: 'rgba(0,0,0,0.5)', color: 'white',
    fontSize: 10, fontWeight: 700, padding: '3px 10px',
    borderRadius: 50, textTransform: 'uppercase', letterSpacing: '0.5px',
    pointerEvents: 'none',
  },
  labelRight: {
    position: 'absolute', top: 10, right: 10, zIndex: 6,
    background: 'rgba(79,70,229,0.75)', color: 'white',
    fontSize: 10, fontWeight: 700, padding: '3px 10px',
    borderRadius: 50, textTransform: 'uppercase', letterSpacing: '0.5px',
    pointerEvents: 'none',
  },
  hint: { textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 8, fontFamily: 'Inter,sans-serif' },
};
