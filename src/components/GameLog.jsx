import { useEffect, useRef } from 'react';
import { colors, fonts } from '../styles/theme.js';

function getLogColor(entry) {
  if (entry.startsWith('☠') || entry.startsWith('⚠') || entry.includes('turned') || entry.includes('dead') || entry.includes('bit')) {
    return colors.danger;
  }
  if (entry.startsWith('⚖') || entry.startsWith('→') || entry.startsWith('>')) {
    return colors.amber;
  }
  if (entry.startsWith('──') || entry.startsWith('══')) {
    return colors.faint;
  }
  return colors.dim;
}

export default function GameLog({ log }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [log.length]);

  const recentLog = log.slice(-30);

  return (
    <div>
      <div style={{
        fontSize: '10px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: colors.dim,
        marginBottom: '4px',
      }}>
        COMMAND LOG
      </div>
      <div
        ref={containerRef}
        style={{
          border: `1px solid ${colors.faint}`,
          padding: '8px',
          maxHeight: '150px',
          overflowY: 'auto',
          fontFamily: fonts.mono,
          fontSize: '10px',
          lineHeight: 1.6,
          backgroundColor: 'rgba(5,5,5,0.5)',
        }}
      >
        {recentLog.map((entry, i) => (
          <div key={i} style={{ color: getLogColor(entry) }}>
            {entry}
          </div>
        ))}
        {recentLog.length === 0 && (
          <div style={{ color: colors.faint }}>Awaiting orders...</div>
        )}
      </div>
    </div>
  );
}
