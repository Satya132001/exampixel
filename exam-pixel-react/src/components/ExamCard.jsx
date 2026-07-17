import React from 'react';
import { EXAM_ICON_COMPONENTS, GearIcon } from './ExamIcons';

export default function ExamCard({ exam, isSelected, onSelect }) {
  const badge = exam.trending >= 8
    ? <span className="exam-badge trending">🔥 Trending</span>
    : exam.isNew
      ? <span className="exam-badge new">🆕 New</span>
      : exam.trending >= 5
        ? <span className="exam-badge popular">⭐ Popular</span>
        : null;

  const IconComponent = EXAM_ICON_COMPONENTS[exam.icon] || GearIcon;

  return (
    <div
      className={`exam-card ${isSelected ? 'active' : ''}`}
      onClick={onSelect}
      title={`${exam.name} — ${exam.detail}`}
    >
      {badge}
      <div className={`exam-icon ${exam.icon}`}>
        <IconComponent />
      </div>
      <div className="exam-name">{exam.name}</div>
      <div className="exam-detail">{exam.detail}</div>
      <div className="exam-size">Max {exam.maxSize}</div>
    </div>
  );
}
