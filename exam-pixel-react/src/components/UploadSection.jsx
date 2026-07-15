import React, { useState, useRef, useCallback, useMemo } from 'react';
import EditorControls from './EditorControls';
import ImageCropper from './ImageCropper';
import ComparisonSlider from './ComparisonSlider';
import QualityChecker from './QualityChecker';
import AIBackgroundRemover from './AIBackgroundRemover';
import BulkConvert from './BulkConvert';
import { getTargetDimensions, applyHDEnhance, checkPhotoQuality } from '../utils/imageUtils';
import { API_BASE_URL } from '../config';

const t = {
  en: {
    selected:'Selected:', change:'Change', changePhoto:'🔄 Change Photo',
    dragDrop:'Drag & Drop your photo here', or:'or',
    browse:'Browse File', formats:'JPG, PNG, JPEG supported',
    original:'Original', converted:'Converted',
    ready:'✅ Ready for Exam', download:'⬇️ Download Converted Photo',
    note:'Processed locally in your browser. We never store your images.',
    photo:'📸 Photo', sig:'✍️ Signature', finger:'🖐️ Fingerprint',
    modeConvert:'⚡ Auto Convert', modeCrop:'✂️ Crop',
    modeBg:'🖼️ BG Remove', modeBulk:'📦 Bulk',
    modeHint:'Mode:', compare:'↔️ Compare',
    customWidth:'Width (px)', customHeight:'Height (px)',
    customDpi:'DPI', customMax:'Max Size (KB)',
  },
  hi: {
    selected:'चुनी गई परीक्षा:', change:'बदलें', changePhoto:'🔄 फोटो बदलें',
    dragDrop:'अपनी फोटो यहाँ खींचें', or:'या',
    browse:'फ़ाइल चुनें', formats:'JPG, PNG, JPEG स्वीकार्य हैं',
    original:'मूल', converted:'परिवर्तित',
    ready:'✅ परीक्षा के लिए तैयार', download:'⬇️ परिवर्तित फोटो डाउनलोड करें',
    note:'आपकी फोटो केवल आपके ब्राउज़र में प्रोसेस होती है।',
    photo:'📸 फोटो', sig:'✍️ हस्ताक्षर', finger:'🖐️ अंगूठा',
    modeConvert:'⚡ ऑटो कन्वर्ट', modeCrop:'✂️ क्रॉप',
    modeBg:'🖼️ BG हटाएं', modeBulk:'📦 बल्क',
    modeHint:'मोड:', compare:'↔️ तुलना',
    customWidth:'चौड़ाई (px)', customHeight:'ऊंचाई (px)',
    customDpi:'DPI', customMax:'अधिकतम साइज़ (KB)',
  }
};

// Default starting JPEG quality for the auto-compress-to-target-size loop.
// There's no user-facing quality slider anymore — the app just compresses
// as much as needed to hit the exam's max file size automatically.
const DEFAULT_QUALITY = 0.92;

// ── JPEG DPI metadata patch ──────────────────────────────────────────
// Browsers' canvas.toDataURL('image/jpeg') never writes a real DPI value
// into the file — the JFIF header it produces has no meaningful density,
// even though the pixel dimensions are exactly right. Some exam portals
// check the DPI tag itself, so we patch those bytes directly after export.
function dataURLToBytes(dataURL) {
  const base64 = dataURL.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
function bytesToDataURL(bytes, mime) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return `data:${mime};base64,${btoa(binary)}`;
}
function setJpegDpi(dataURL, dpi) {
  if (!dpi || !dataURL.startsWith('data:image/jpeg')) return dataURL;
  try {
    const bytes = dataURLToBytes(dataURL);
    // SOI (FFD8) + APP0 marker (FFE0) + length(2) + "JFIF\0"(5) + version(2) = offset 13
    const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF && bytes[3] === 0xE0;
    const isJfif = isJpeg &&
      bytes[6] === 0x4A && bytes[7] === 0x46 && bytes[8] === 0x49 && bytes[9] === 0x46 && bytes[10] === 0x00;
    if (!isJfif) return dataURL;

    bytes[13] = 1; // density units = pixels per inch
    bytes[14] = (dpi >> 8) & 0xFF; bytes[15] = dpi & 0xFF; // X density
    bytes[16] = (dpi >> 8) & 0xFF; bytes[17] = dpi & 0xFF; // Y density
    return bytesToDataURL(bytes, 'image/jpeg');
  } catch (e) {
    console.error('Could not patch JPEG DPI metadata:', e);
    return dataURL;
  }
}

function UploadSection({ selectedExam, language, user }) {
  const [mode,       setMode]      = useState('convert');
  const [preview,    setPreview]   = useState(null);
  const [converted,  setConverted] = useState(null);
  const [convInfo,   setInfo]      = useState('');
  const [isDragging, setDragging]  = useState(false);
  const [activeTab,  setActiveTab] = useState('photo');
  const [format,     setFormat]    = useState('image/jpeg');
  const [bgColor,    setBgColor]   = useState('#ffffff');
  const [enhance,    setEnhance]   = useState(true);
  const [showCompare,setCompare]   = useState(false);
  const [qualResult, setQualResult]= useState(null);
  const [saveStatus, setSaveStatus]= useState(null); // null | 'saving' | 'saved' | 'error'
  const [customSize, setCustomSize]= useState({ width: 200, height: 250, dpi: 200, maxKB: 50 });
  const fileRef    = useRef(null);
  const originalRef= useRef(null);
  const text = t[language] || t.en;

  const isCustom = selectedExam?.icon === 'custom';

  // Per-document-type specs (e.g. NIELIT has different sizes for
  // Photo / Signature / Fingerprint). Falls back to the exam's top-level
  // spec for exams that don't define per-type overrides. For "Custom
  // Size", the user's own editable width/height/DPI/max-size wins.
  const activeSpec = useMemo(() => (
    isCustom
      ? { size: `${customSize.width}x${customSize.height}`, dpi: String(customSize.dpi), minSize: selectedExam.minSize, maxSize: `${customSize.maxKB}KB` }
      : (selectedExam?.specs && selectedExam.specs[activeTab]) || selectedExam
  ), [isCustom, customSize, selectedExam, activeTab]);

  const convertImage = useCallback((img, fmt, bg, spec, doEnhance) => {
    const { w, h } = getTargetDimensions(spec?.size);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (bg !== 'transparent') { ctx.fillStyle = bg; ctx.fillRect(0,0,w,h); }
    const scale = Math.min(w/img.width, h/img.height);
    const sW = img.width*scale, sH = img.height*scale;
    ctx.drawImage(img, (w-sW)/2, (h-sH)/2, sW, sH);

    if (doEnhance) applyHDEnhance(ctx, w, h, canvas);

    const maxKB = parseInt(spec?.maxSize)||50;
    let q = DEFAULT_QUALITY, url = canvas.toDataURL(fmt, q);
    while ((url.length*0.75/1024) > maxKB && q > 0.2) {
      q -= 0.05; url = canvas.toDataURL(fmt, q);
    }

    // Embed the exam's required DPI directly into the JPEG file bytes —
    // canvas export alone never sets this correctly.
    const dpiValue = parseInt(spec?.dpi) || null;
    if (fmt === 'image/jpeg' && dpiValue) {
      url = setJpegDpi(url, dpiValue);
    }

    setConverted(url);
    setInfo(`${w}×${h}px • ${Math.round(url.length*0.75/1024)}KB${dpiValue && fmt==='image/jpeg' ? ` • ${dpiValue} DPI` : ''}`);
    setCompare(false);
  }, []);

  const handleFile = useCallback((file) => {
    setSaveStatus(null);
    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target.result;
      originalRef.current = src;
      setPreview(src);
      setCompare(false);

      const img = new Image();
      img.onload = () => {
        // Quality check
        setQualResult(checkPhotoQuality(img));
        // Convert
        convertImage(img, format, bgColor, activeSpec, enhance);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, [format, bgColor, activeSpec, enhance, convertImage]);

  const reconvert = useCallback((fmt, bg, doEnhance, spec) => {
    if (!originalRef.current) return;
    const img = new Image();
    img.onload = () => convertImage(img, fmt, bg, spec || activeSpec, doEnhance);
    img.src = originalRef.current;
  }, [activeSpec, convertImage]);

  const reset = () => {
    setPreview(null); setConverted(null); setInfo('');
    setCompare(false); setQualResult(null); setSaveStatus(null);
    originalRef.current = null;
    if (fileRef.current) fileRef.current.value = '';
  };

  const updateCustomSize = (patch) => {
    const next = { ...customSize, ...patch };
    setCustomSize(next);
    if (originalRef.current) {
      const nextSpec = { size: `${next.width}x${next.height}`, dpi: String(next.dpi), minSize: selectedExam.minSize, maxSize: `${next.maxKB}KB` };
      reconvert(format, bgColor, enhance, nextSpec);
    }
  };

  // Sends the final converted image to the backend so it's saved in
  // `processed/` and, if the user is logged in, linked to their account
  // for later retrieval via "My Saved Photos".
  const saveToServer = async (dataUrl, ext) => {
    setSaveStatus('saving');
    try {
      const [header, base64] = dataUrl.split(',');
      const mime = (header.match(/:(.*?);/) || [])[1] || 'image/jpeg';
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime });

      const fd = new FormData();
      fd.append('image', blob, `exampixel_${Date.now()}.${ext}`);
      fd.append('examName', selectedExam?.name || '');
      fd.append('docType', activeTab);
      if (user?.id) fd.append('userId', user.id);

      const res = await fetch(`${API_BASE_URL}/api/images/save`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Save failed');
      setSaveStatus('saved');
    } catch (err) {
      console.error('Save to server failed:', err);
      setSaveStatus('error');
    }
  };

  const download = () => {
    if (!converted) return;
    const ext = format==='image/png'?'png':format==='image/webp'?'webp':'jpg';
    const a = document.createElement('a');
    a.download = `ExamPixel_${(selectedExam?.name||'exam').replace(/[\s/]+/g,'_')}_${activeTab}.${ext}`;
    a.href = converted; a.click();
    saveToServer(converted, ext);
  };

  if (!selectedExam) return null;

  const MODES = [
    { id:'convert', label: text.modeConvert },
    { id:'crop',    label: text.modeCrop    },
    { id:'bg',      label: text.modeBg      },
    { id:'bulk',    label: text.modeBulk    },
  ];

  return (
    <section className="upload-section" id="upload-section">
      <div className="container">

        {/* ── Mode Toggle ── */}
        <div className="mode-toggle-bar">
          <span className="mode-hint">{text.modeHint}</span>
          {MODES.map(m => (
            <button key={m.id} type="button"
              className={`mode-btn ${mode===m.id?'active':''}`}
              onClick={() => { setMode(m.id); reset(); }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* ── CROP MODE ── */}
        {mode==='crop' && <ImageCropper selectedExam={selectedExam} language={language} />}

        {/* ── BG REMOVE MODE ── */}
        {mode==='bg' && <AIBackgroundRemover language={language} />}

        {/* ── BULK MODE ── */}
        {mode==='bulk' && <BulkConvert selectedExam={selectedExam} language={language} isPremium={true} onOpenPremium={()=>{}} />}

        {/* ── CONVERT MODE ── */}
        {mode==='convert' && (
          <div className="upload-box">
            <div className="selected-exam-info">
              <span className="selected-label">{text.selected}</span>
              <span className="selected-name">{selectedExam.name}</span>
              <button type="button" className="change-btn" onClick={() => {
                reset(); document.getElementById('exams')?.scrollIntoView({behavior:'smooth'});
              }}>{text.change}</button>
            </div>

            <div className="specs-bar">
              {[['Size',activeSpec?.size],['DPI',activeSpec?.dpi],['Min',activeSpec?.minSize],['Max',activeSpec?.maxSize]].map(([l,v])=>(
                <div key={l} className="spec-item">
                  <span className="spec-label">{l}</span>
                  <span className="spec-val">{v}</span>
                </div>
              ))}
            </div>

            {/* ── Custom Size editable fields ── */}
            {isCustom && (
              <div className="custom-size-panel">
                <div className="custom-size-field">
                  <label>{text.customWidth}</label>
                  <input type="number" min="50" max="2000" value={customSize.width}
                    onChange={e => updateCustomSize({ width: parseInt(e.target.value) || 1 })} />
                </div>
                <div className="custom-size-field">
                  <label>{text.customHeight}</label>
                  <input type="number" min="50" max="2000" value={customSize.height}
                    onChange={e => updateCustomSize({ height: parseInt(e.target.value) || 1 })} />
                </div>
                <div className="custom-size-field">
                  <label>{text.customDpi}</label>
                  <input type="number" min="72" max="600" value={customSize.dpi}
                    onChange={e => updateCustomSize({ dpi: parseInt(e.target.value) || 72 })} />
                </div>
                <div className="custom-size-field">
                  <label>{text.customMax}</label>
                  <input type="number" min="5" max="2000" value={customSize.maxKB}
                    onChange={e => updateCustomSize({ maxKB: parseInt(e.target.value) || 5 })} />
                </div>
              </div>
            )}

            <EditorControls
              language={language}
              format={format} bgColor={bgColor} enhance={enhance}
              setFormat={v=>{setFormat(v);reconvert(v,bgColor,enhance);}}
              setBgColor={v=>{setBgColor(v);reconvert(format,v,enhance);}}
              setEnhance={v=>{setEnhance(v);reconvert(format,bgColor,v);}}
            />

            <div className="upload-tabs">
              {[['photo',text.photo],['signature',text.sig],['fingerprint',text.finger]].map(([id,label])=>(
                <button key={id} type="button"
                  className={`tab ${activeTab===id?'active':''}`}
                  onClick={()=>{setActiveTab(id);reset();}}>
                  {label}
                </button>
              ))}
            </div>

            {/* Quality checker */}
            <QualityChecker result={qualResult} />

            {/* Drop zone */}
            {!preview ? (
              <div className={`drop-zone ${isDragging?'drag-over':''}`}
                onDragOver={e=>{e.preventDefault();setDragging(true);}}
                onDragLeave={()=>setDragging(false)}
                onDrop={e=>{e.preventDefault();setDragging(false);const f=e.dataTransfer.files[0];if(f?.type.startsWith('image/'))handleFile(f);}}
                onClick={()=>fileRef.current?.click()}>
                <div className="drop-icon">📤</div>
                <div className="drop-text">{text.dragDrop}</div>
                <div className="drop-sub">{text.or}</div>
                <label className="btn-upload">{text.browse}</label>
                <input ref={fileRef} type="file" accept="image/*" hidden
                  onChange={e=>{if(e.target.files[0])handleFile(e.target.files[0]);}} />
                <div className="drop-formats">{text.formats}</div>
              </div>
            ) : (
              <>
                {/* Toggle between side-by-side and comparison slider */}
                {converted && (
                  <div style={{display:'flex',justifyContent:'flex-end',marginBottom:8}}>
                    <button type="button" onClick={()=>setCompare(c=>!c)}
                      style={{background:showCompare?'#4f46e5':'#f0f0f8',color:showCompare?'white':'#888',border:'none',borderRadius:50,padding:'6px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                      {text.compare} {showCompare ? '▼' : '▶'}
                    </button>
                  </div>
                )}

                {showCompare && converted ? (
                  <ComparisonSlider originalSrc={preview} convertedSrc={converted} language={language} />
                ) : (
                  <div className="preview-area">
                    <div className="preview-box">
                      <div className="preview-label">{text.original}</div>
                      <img src={preview} alt="Original" />
                      <div className="img-info">Uploaded</div>
                    </div>
                    <div className="preview-arrow">➡️</div>
                    <div className="preview-box">
                      <div className="preview-label">{text.converted}</div>
                      <img src={converted} alt="Converted" />
                      <div className="img-info converted-tag">{text.ready} • {convInfo}</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {preview && (
              <>
                <div className="preview-footer-actions">
                  <button type="button" className="btn-change-photo" onClick={reset}>{text.changePhoto}</button>
                  <button type="button" className="btn-download" onClick={download}>{text.download}</button>
                </div>
                {saveStatus === 'saving' && <div className="img-info" style={{textAlign:'center',marginTop:8}}>{language==='hi'?'सर्वर पर सेव हो रहा है…':'Saving to server…'}</div>}
                {saveStatus === 'saved'  && <div className="img-info converted-tag" style={{textAlign:'center',marginTop:8}}>{language==='hi'?'☁️ सेव हो गया':'☁️ Saved to server'}{user?.id ? (language==='hi'?' • आपकी History में जुड़ गया':' • Added to your History') : ''}</div>}
                {saveStatus === 'error'  && <div className="img-info" style={{textAlign:'center',marginTop:8,color:'#b91c1c'}}>{language==='hi'?'⚠️ सेव नहीं हुआ':'⚠️ Could not save to server'}</div>}
              </>
            )}
            <div className="note-box">🔒 {text.note}</div>
          </div>
        )}
      </div>
    </section>
  );
}

export default UploadSection;
