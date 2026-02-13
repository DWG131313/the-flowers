import { colors, fonts, crt } from '../styles/theme.js';

const WIN_ART = `
╔══════════════════════════════════════╗
║                                      ║
║  ██████╗ ███████╗███████╗ ██████╗    ║
║  ██╔══██╗██╔════╝██╔════╝██╔════╝    ║
║  ██████╔╝█████╗  ███████╗██║         ║
║  ██╔══██╗██╔══╝  ╚════██║██║         ║
║  ██║  ██║███████╗███████║╚██████╗    ║
║  ╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝    ║
║                                      ║
║          U   E   D                   ║
║                                      ║
╚══════════════════════════════════════╝`;

const LOSE_ART = `
╔══════════════════════════════════════╗
║                                      ║
║  ████████╗ ██████╗ ████████╗ █████╗  ║
║  ╚══██╔══╝██╔═══██╗╚══██╔══╝██╔══██╗ ║
║     ██║   ██║   ██║   ██║   ███████║ ║
║     ██║   ██║   ██║   ██║   ██╔══██║ ║
║     ██║   ╚██████╔╝   ██║   ██║  ██║ ║
║     ╚═╝    ╚═════╝    ╚═╝   ╚═╝  ╚═╝ ║
║                                      ║
║       L   O   S   S                  ║
║                                      ║
╚══════════════════════════════════════╝`;

export default function GameOverScreen({ state, onRestart }) {
  const won = state.gameWon;
  const alive = state.survivors.filter(s => s.alive);
  const dead = state.survivors.filter(s => !s.alive);

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
        color: won ? colors.primary : colors.danger,
        fontSize: '9px',
        lineHeight: 1.2,
        textShadow: `0 0 10px ${won ? 'rgba(51,255,51,0.5)' : 'rgba(255,51,51,0.5)'}`,
        textAlign: 'center',
        margin: 0,
      }}>
        {won ? WIN_ART : LOSE_ART}
      </pre>

      <div style={{
        color: won ? colors.primary : colors.danger,
        fontSize: '12px',
        marginTop: '16px',
        textAlign: 'center',
        maxWidth: '500px',
        lineHeight: 1.6,
      }}>
        {state.gameOverReason}
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginTop: '24px',
        maxWidth: '400px',
        width: '100%',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: colors.dim, letterSpacing: '2px' }}>DAYS SURVIVED</div>
          <div style={{ fontSize: '24px', color: colors.primary, ...crt.textGlow }}>{Math.min(state.day, 30)}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: colors.dim, letterSpacing: '2px' }}>DECISIONS MADE</div>
          <div style={{ fontSize: '24px', color: colors.primary, ...crt.textGlow }}>
            {state.log.filter(l => l.startsWith('⚖') || l.startsWith('→') || l.startsWith('✓') || l.startsWith('✕')).length}
          </div>
        </div>
      </div>

      {/* Dead */}
      {dead.length > 0 && (
        <div style={{ marginTop: '24px', maxWidth: '400px', width: '100%' }}>
          <div style={{ fontSize: '10px', color: colors.danger, letterSpacing: '2px', marginBottom: '6px' }}>
            THE DEAD ({dead.length})
          </div>
          {dead.map(s => (
            <div key={s.id} style={{
              fontSize: '11px',
              color: colors.dim,
              padding: '3px 0',
              borderBottom: `1px solid ${colors.faint}`,
            }}>
              <span style={{ color: colors.danger }}>✕</span> {s.name}, {s.age} — {s.causeOfDeath || 'Unknown'}
            </div>
          ))}
        </div>
      )}

      {/* Survivors */}
      {alive.length > 0 && (
        <div style={{ marginTop: '20px', maxWidth: '400px', width: '100%' }}>
          <div style={{ fontSize: '10px', color: colors.primary, letterSpacing: '2px', marginBottom: '6px' }}>
            THE LIVING ({alive.length})
          </div>
          {alive.map(s => (
            <div key={s.id} style={{
              fontSize: '11px',
              color: colors.dim,
              padding: '3px 0',
              borderBottom: `1px solid ${colors.faint}`,
            }}>
              <span style={{ color: colors.primary }}>●</span> {s.name}, {s.age} — Health: {s.health}, Morale: {s.morale}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onRestart}
        style={{
          fontFamily: fonts.mono,
          fontSize: '14px',
          letterSpacing: '3px',
          color: colors.primary,
          backgroundColor: 'transparent',
          border: `1px solid ${colors.border}`,
          padding: '12px 32px',
          cursor: 'pointer',
          marginTop: '32px',
          ...crt.textGlow,
        }}
        onMouseEnter={e => e.target.style.backgroundColor = 'rgba(51,255,51,0.1)'}
        onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
      >
        [ TRY AGAIN ]
      </button>
    </div>
  );
}
