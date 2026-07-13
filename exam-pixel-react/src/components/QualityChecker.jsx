import React from 'react';

// Shows quality analysis result inline under the upload
export default function QualityChecker({ result }) {
  if (!result) return null;

  const { ok, issues, tips, brightness, sharpness } = result;

  const brightnessLabel =
    brightness < 60  ? '🌑 Too Dark' :
    brightness > 210 ? '☀️ Too Bright' : '✅ Good';

  const sharpnessLabel =
    sharpness < 100  ? '🌫️ Blurry' :
    sharpness < 400  ? '👍 Acceptable' : '✅ Sharp';

  return (
    <div style={{
      background: ok
        ? 'linear-gradient(135deg,#ecfdf5,#d1fae5)'
        : 'linear-gradient(135deg,#fffbeb,#fef3c7)',
      border: `1.5px solid ${ok ? '#6ee7b7' : '#fde68a'}`,
      borderRadius: 14, padding: '14px 18px', marginBottom: 16,
      fontFamily: 'Inter,sans-serif',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: ok ? 0 : 10 }}>
        <span style={{ fontSize: 18 }}>{ok ? '✅' : '⚠️'}</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: ok ? '#065f46' : '#92400e' }}>
          {ok ? 'Photo looks great! Ready to convert.' : 'Photo quality issues detected'}
        </span>
      </div>

      {/* Metrics bar */}
      <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
        <div style={S.metric}>
          <span style={S.metricLabel}>Brightness</span>
          <span style={S.metricVal}>{brightnessLabel}</span>
        </div>
        <div style={S.metric}>
          <span style={S.metricLabel}>Sharpness</span>
          <span style={S.metricVal}>{sharpnessLabel}</span>
        </div>
      </div>

      {/* Issues + tips */}
      {issues.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {issues.map((issue, i) => (
            <div key={i} style={S.issue}>{issue}</div>
          ))}
          {tips.map((tip, i) => (
            <div key={i} style={S.tip}>💡 {tip}</div>
          ))}
        </div>
      )}
    </div>
  );
}

const S = {
  metric:      { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 90 },
  metricLabel: { fontSize: 9, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' },
  metricVal:   { fontSize: 12, fontWeight: 700, color: '#1a1a2e' },
  issue:       { fontSize: 13, color: '#92400e', marginBottom: 2 },
  tip:         { fontSize: 12, color: '#065f46', marginTop: 2 },
};
