import { useState, useEffect } from 'react';
import { colors, fonts, crt } from '../styles/theme.js';
import { DIFFICULTIES, DIFFICULTY_ORDER } from '../game/difficulty.js';

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
  const [showDifficulty, setShowDifficulty] = useState(false);

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

      {!showDifficulty && (
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
      )}

      {!showDifficulty ? (
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
            onClick={() => setShowDifficulty(true)}
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
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          marginTop: '30px',
          width: '100%',
          maxWidth: '360px',
        }}>
          <div style={{
            fontSize: '10px',
            letterSpacing: '3px',
            color: colors.dim,
            marginBottom: '6px',
          }}>
            CHOOSE YOUR PATH
          </div>

          {DIFFICULTY_ORDER.map(key => {
            const diff = DIFFICULTIES[key];
            return (
              <button
                key={key}
                onClick={() => onStart(key)}
                style={{
                  fontFamily: fonts.mono,
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${diff.color}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = `${diff.color}11`}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  fontSize: '14px',
                  letterSpacing: '3px',
                  color: diff.color,
                  textShadow: `0 0 8px ${diff.color}44`,
                  marginBottom: '2px',
                }}>
                  {diff.name}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: colors.dim,
                  letterSpacing: '1px',
                }}>
                  {diff.tagline}
                </div>
              </button>
            );
          })}

          <button
            onClick={() => setShowDifficulty(false)}
            style={{
              fontFamily: fonts.mono,
              fontSize: '10px',
              letterSpacing: '2px',
              color: colors.faint,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginTop: '8px',
              padding: '8px',
            }}
          >
            BACK
          </button>
        </div>
      )}
    </div>
  );
}
