import React from 'react';

// Custom, original SVG icons used inside the gradient exam-badge circles.
// These are generic, hand-drawn symbols (building, train, shield, etc.) —
// deliberately NOT any official government emblem, department seal, or
// trademarked logo, since reproducing those would be both misleading
// (implying an official affiliation this app explicitly disclaims) and,
// for India's State Emblem specifically, restricted by law.

const box = { width: 26, height: 26, viewBox: '0 0 26 26', fill: 'none' };

export function BuildingIcon() {
  return (
    <svg {...box}>
      <path d="M13 2L23 8H3L13 2Z" fill="white" fillOpacity="0.95" />
      <rect x="4" y="9" width="18" height="1.4" fill="white" fillOpacity="0.7" />
      <rect x="5" y="11" width="2.2" height="10" fill="white" fillOpacity="0.9" />
      <rect x="9" y="11" width="2.2" height="10" fill="white" fillOpacity="0.9" />
      <rect x="13" y="11" width="2.2" height="10" fill="white" fillOpacity="0.9" />
      <rect x="17" y="11" width="2.2" height="10" fill="white" fillOpacity="0.9" />
      <rect x="3" y="21.4" width="20" height="2" rx="0.6" fill="white" />
    </svg>
  );
}

export function TrainIcon() {
  return (
    <svg {...box}>
      <rect x="5" y="6" width="16" height="11" rx="3" fill="white" fillOpacity="0.95" />
      <rect x="7" y="8.5" width="4.5" height="4" rx="0.8" fill="#00000025" />
      <rect x="14.5" y="8.5" width="4.5" height="4" rx="0.8" fill="#00000025" />
      <circle cx="9" cy="19" r="2" fill="white" />
      <circle cx="17" cy="19" r="2" fill="white" />
      <rect x="3" y="16.5" width="20" height="1.6" fill="white" fillOpacity="0.85" />
    </svg>
  );
}

export function DocumentIcon() {
  return (
    <svg {...box}>
      <rect x="6" y="3" width="14" height="20" rx="2" fill="white" fillOpacity="0.95" />
      <rect x="9" y="7" width="8" height="1.4" fill="#00000030" />
      <rect x="9" y="11" width="8" height="1.4" fill="#00000030" />
      <rect x="9" y="15" width="5" height="1.4" fill="#00000030" />
      <circle cx="18.5" cy="18.5" r="4" fill="white" />
      <path d="M17 18.5l1 1 2-2" stroke="#4f46e5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function BankIcon() {
  return (
    <svg {...box}>
      <path d="M13 2L23 7.5H3L13 2Z" fill="white" fillOpacity="0.95" />
      <rect x="3" y="8.5" width="20" height="1.4" fill="white" fillOpacity="0.75" />
      <rect x="5" y="10.5" width="2" height="9" fill="white" fillOpacity="0.9" />
      <rect x="9" y="10.5" width="2" height="9" fill="white" fillOpacity="0.9" />
      <rect x="13" y="10.5" width="2" height="9" fill="white" fillOpacity="0.9" />
      <rect x="17" y="10.5" width="2" height="9" fill="white" fillOpacity="0.9" />
      <rect x="3" y="20" width="20" height="2" rx="0.6" fill="white" />
      <circle cx="13" cy="5.2" r="1.2" fill="#00000030" />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg {...box}>
      <path d="M13 2L22 5.5V12C22 18 18 22 13 24C8 22 4 18 4 12V5.5L13 2Z" fill="white" fillOpacity="0.95" />
      <path d="M9.5 13L12 15.5L17 10" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function ChipIcon() {
  return (
    <svg {...box}>
      <rect x="7" y="7" width="12" height="12" rx="2" fill="white" fillOpacity="0.95" />
      <rect x="9.5" y="9.5" width="7" height="7" rx="1" fill="#00000030" />
      <line x1="9.5" y1="2.5" x2="9.5" y2="7" stroke="white" strokeWidth="1.4" />
      <line x1="13" y1="2.5" x2="13" y2="7" stroke="white" strokeWidth="1.4" />
      <line x1="16.5" y1="2.5" x2="16.5" y2="7" stroke="white" strokeWidth="1.4" />
      <line x1="9.5" y1="19" x2="9.5" y2="23.5" stroke="white" strokeWidth="1.4" />
      <line x1="13" y1="19" x2="13" y2="23.5" stroke="white" strokeWidth="1.4" />
      <line x1="16.5" y1="19" x2="16.5" y2="23.5" stroke="white" strokeWidth="1.4" />
      <line x1="2.5" y1="9.5" x2="7" y2="9.5" stroke="white" strokeWidth="1.4" />
      <line x1="2.5" y1="13" x2="7" y2="13" stroke="white" strokeWidth="1.4" />
      <line x1="2.5" y1="16.5" x2="7" y2="16.5" stroke="white" strokeWidth="1.4" />
      <line x1="19" y1="9.5" x2="23.5" y2="9.5" stroke="white" strokeWidth="1.4" />
      <line x1="19" y1="13" x2="23.5" y2="13" stroke="white" strokeWidth="1.4" />
      <line x1="19" y1="16.5" x2="23.5" y2="16.5" stroke="white" strokeWidth="1.4" />
    </svg>
  );
}

export function GearIcon() {
  return (
    <svg {...box}>
      <circle cx="13" cy="13" r="4.5" fill="none" stroke="white" strokeWidth="2" />
      <circle cx="13" cy="13" r="1.6" fill="white" />
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI) / 4;
        const x1 = 13 + Math.cos(angle) * 8.2, y1 = 13 + Math.sin(angle) * 8.2;
        const x2 = 13 + Math.cos(angle) * 10.6, y2 = 13 + Math.sin(angle) * 10.6;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="2" strokeLinecap="round" />;
      })}
    </svg>
  );
}

export function TempleIcon() {
  return (
    <svg {...box}>
      <path d="M13 2L16 7H10L13 2Z" fill="white" fillOpacity="0.95" />
      <rect x="11.3" y="7" width="3.4" height="4" fill="white" fillOpacity="0.9" />
      <path d="M6 11L13 8L20 11V13H6V11Z" fill="white" fillOpacity="0.95" />
      <rect x="5" y="13" width="16" height="8" fill="white" fillOpacity="0.9" />
      <rect x="8" y="16" width="2.2" height="5" fill="#00000030" />
      <rect x="11.9" y="16" width="2.2" height="5" fill="#00000030" />
      <rect x="15.8" y="16" width="2.2" height="5" fill="#00000030" />
      <rect x="4" y="21" width="18" height="2" rx="0.6" fill="white" />
    </svg>
  );
}

export const EXAM_ICON_COMPONENTS = {
  ssc: BuildingIcon,
  railway: TrainIcon,
  upsc: DocumentIcon,
  ibps: BankIcon,
  odisha: TempleIcon,
  up: ShieldIcon,
  bihar: ShieldIcon,
  mp: ShieldIcon,
  raj: ShieldIcon,
  custom: GearIcon,
  nielit: ChipIcon,
};
