import React from 'react';

const statuses = [
  { label: 'Pending', value: 'Pending', color: 'var(--danger)' },
  { label: 'In Progress', value: 'In Progress', color: 'var(--warning)' },
  { label: 'Under Review', value: 'Under Review', color: '#22d3ee' },
  { label: 'Escalated', value: 'Escalated', color: '#fb923c' },
  { label: 'Resolved', value: 'Resolved', color: 'var(--success)' },
];

const StatusChips = ({ currentStatus, onChange }) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
      {statuses.map((s) => {
        const isActive = currentStatus === s.value;
        return (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange(s.value)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '12px',
              border: isActive ? `2px solid ${s.color}` : '1px solid var(--glass-border)',
              background: isActive ? `${s.color}15` : 'var(--glass-bg)',
              color: isActive ? s.color : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isActive && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }}></div>}
            {s.label}
          </button>
        );
      })}
    </div>
  );
};

export default StatusChips;
