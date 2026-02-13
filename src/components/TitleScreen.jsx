import { useState, useEffect } from 'react';
import { colors, fonts, crt } from '../styles/theme.js';

const TITLE_ART = [
  '████████ ██  ██ ███████',
  '   ██    ██  ██ ██     ',
  '   ██    ██████ █████  ',
  '   ██    ██  ██ ██     ',
  '   ██    ██  ██ ███████',
  '',
  '███████ ██      ██████  ██   ██ ███████ ██████  ███████',
  '██      ██     ██    ██ ██   ██ ██      ██   ██ ██     ',
  '█████   ██     ██    ██ ██ █ ██ █████   ██████  ███████',
  '██      ██     ██    ██ ███████ ██      ██   ██      ██',
  '██      ███████ ██████  ██   ██ ███████ ██   ██ ███████',
].join('\n');

export default function TitleScreen({ onStart, hasSave, onContinue }) {
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setBlink(b => !b), 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: fonts.mono,
    }}>
      <pre style={{
        color: colors.primary,
        fontSize: 'clamp(5px, 1.5vw, 11px)',
        lineHeight: 1.3,
        ...crt.textGlow,
        textAlign: 'left',
        margin: 0,
        whiteSpace: 'pre',
        overflow: 'hidden',
        maxWidth: '90vw',
      }}>
        {TITLE_ART}
      </pre>

      <div style={{
        color: colors.dim,
        fontSize: 'clamp(9px, 2.5vw, 12px)',
        letterSpacing: 'clamp(1px, 0.5vw, 3px)',
        textTransform: 'uppercase',
        marginTop: '16px',
        textAlign: 'center',
        padding: '0 10px',
      }}>
        A SURVIVAL LEADERSHIP SIMULATION
      </div>

      <div style={{
        color: colors.dim,
        fontSize: 'clamp(10px, 2.8vw, 11px)',
        lineHeight: 1.8,
        marginTop: '20px',
        maxWidth: '480px',
        textAlign: 'center',
        padding: '0 16px',
      }}>
        <p>The dead walk. Your group survives — for now.</p>
        <p>You don't fight the zombies. You lead the living.</p>
        <p>You decide who stays. Who goes. Who looks at the flowers.</p>
        <p style={{ color: colors.faint, marginTop: '8px' }}>Survive 30 days. The military is coming.</p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        marginTop: '40px',
      }}>
        {hasSave && (
          <button
            onClick={onContinue}
            style={{
              fontFamily: fonts.mono,
              fontSize: '16px',
              letterSpacing: '4px',
              color: colors.amber,
              backgroundColor: 'transparent',
              border: `1px solid ${colors.amber}`,
              padding: '14px 40px',
              cursor: 'pointer',
              ...crt.amberGlow,
              transition: 'none',
            }}
          >
            [ CONTINUE ]
          </button>
        )}
        <button
          onClick={onStart}
          style={{
            fontFamily: fonts.mono,
            fontSize: '16px',
            letterSpacing: '4px',
            color: blink ? colors.primary : 'transparent',
            backgroundColor: 'transparent',
            border: `1px solid ${blink ? colors.border : 'transparent'}`,
            padding: '14px 40px',
            cursor: 'pointer',
            ...crt.textGlow,
            transition: 'none',
          }}
        >
          {hasSave ? '[ NEW GAME ]' : '[ PRESS START ]'}
        </button>
      </div>
    </div>
  );
}
