import React from 'react';

const STATUS_STYLES = {
  applied:   'bg-blue-100 text-blue-700 border border-blue-200',
  reviewing: 'bg-amber-100 text-amber-700 border border-amber-200',
  selected:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
  rejected:  'bg-red-100 text-red-700 border border-red-200',
};

const STATUS_ICONS = {
  applied:   '📨',
  reviewing: '🔍',
  selected:  '✅',
  rejected:  '❌',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge capitalize font-semibold text-xs px-3 py-1 ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
      {STATUS_ICONS[status]} {status}
    </span>
  );
}
