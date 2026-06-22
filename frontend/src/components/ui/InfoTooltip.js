import React, { useState } from 'react';

export default function InfoTooltip({ text }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 6 }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {/* ⓘ icon */}
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 14, height: 14, borderRadius: '50%',
        border: '1px solid #4a4a4a', color: '#666',
        fontSize: 9, fontWeight: 700, cursor: 'default',
        userSelect: 'none', flexShrink: 0,
        transition: 'border-color .15s, color .15s',
        ...(visible ? { borderColor: '#27ae60', color: '#27ae60' } : {}),
      }}>
        i
      </span>

      {/* Tooltip bubble */}
      {visible && (
        <span style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 8,
          background: '#1a1a1d',
          border: '1px solid #333',
          borderRadius: 8,
          padding: '8px 12px',
          width: 220,
          fontSize: 11,
          lineHeight: 1.5,
          color: '#ccc',
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          whiteSpace: 'normal',
        }}>
          {/* Arrow */}
          <span style={{
            position: 'absolute',
            top: '100%', left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid #333',
          }} />
          {text}
        </span>
      )}
    </span>
  );
}
