export const colors = {
  bg: '#0a0a0a',
  primary: '#33ff33',
  dim: '#1a7a1a',
  border: '#1a5c1a',
  amber: '#ffaa33',
  danger: '#ff3333',
  faint: '#0d4a0d',
};

export const fonts = {
  mono: '"Courier New", "Lucida Console", monospace',
};

export const crt = {
  scanlines: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
    pointerEvents: 'none',
    zIndex: 9999,
  },
  screenGlow: {
    boxShadow: 'inset 0 0 80px rgba(51,255,51,0.06), inset 0 0 20px rgba(51,255,51,0.03)',
  },
  textGlow: {
    textShadow: '0 0 8px rgba(51,255,51,0.4)',
  },
  amberGlow: {
    textShadow: '0 0 8px rgba(255,170,51,0.4)',
  },
  dangerGlow: {
    textShadow: '0 0 8px rgba(255,51,51,0.4)',
  },
};

export const shared = {
  container: {
    backgroundColor: colors.bg,
    color: colors.primary,
    fontFamily: fonts.mono,
    fontSize: '13px',
    minHeight: '100vh',
    lineHeight: 1.6,
  },
  button: {
    fontFamily: fonts.mono,
    fontSize: '13px',
    cursor: 'pointer',
    border: `1px solid ${colors.border}`,
    backgroundColor: 'transparent',
    padding: '10px 16px',
    width: '100%',
    textAlign: 'left',
    transition: 'background-color 0.15s',
  },
  card: {
    border: `1px solid ${colors.border}`,
    padding: '10px',
    backgroundColor: 'rgba(10,10,10,0.8)',
  },
  label: {
    fontSize: '10px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: colors.dim,
  },
  statValue: {
    fontSize: '18px',
    fontFamily: fonts.mono,
    ...crt.textGlow,
  },
};

export function resourceColor(value, max) {
  const pct = value / max;
  if (pct > 0.5) return colors.primary;
  if (pct > 0.25) return colors.amber;
  return colors.danger;
}
