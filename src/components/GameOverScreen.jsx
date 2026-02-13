import { colors, fonts, crt } from '../styles/theme.js';
import SurvivorSprite from './SurvivorSprite.jsx';

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

function DeathMemorial({ dead }) {
  // Sort by deathDay, group by day
  const sorted = [...dead].sort((a, b) => (a.deathDay || 0) - (b.deathDay || 0));
  const groups = [];
  let currentDay = null;
  sorted.forEach(s => {
    const day = s.deathDay || '?';
    if (day !== currentDay) {
      groups.push({ day, entries: [s] });
      currentDay = day;
    } else {
      groups[groups.length - 1].entries.push(s);
    }
  });

  return (
    <div style={{ marginTop: '24px', maxWidth: '400px', width: '100%' }}>
      <div style={{ fontSize: '10px', color: colors.danger, letterSpacing: '2px', marginBottom: '8px' }}>
        THE DEAD ({dead.length})
      </div>
      {groups.map((group, gi) => (
        <div key={gi}>
          <div style={{
            fontSize: '9px',
            color: colors.faint,
            letterSpacing: '3px',
            textAlign: 'center',
            margin: '8px 0 6px',
          }}>
            ── DAY {group.day} ──
          </div>
          {group.entries.map(s => (
            <div key={s.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              color: colors.dim,
              padding: '4px 0',
              borderBottom: `1px solid ${colors.faint}`,
            }}>
              <div style={{ filter: 'grayscale(100%)', opacity: 0.6, flexShrink: 0 }}>
                <SurvivorSprite survivor={s} size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ color: colors.danger }}>✕</span> {s.name}, {s.age}
                <div style={{ fontSize: '9px', color: colors.faint, marginTop: '1px' }}>
                  {s.causeOfDeath || 'Unknown'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

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
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '16px',
        marginTop: '24px',
        maxWidth: '500px',
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
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: colors.dim, letterSpacing: '2px' }}>LIVES LOST</div>
          <div style={{ fontSize: '24px', color: colors.danger, ...crt.dangerGlow }}>{dead.length}</div>
        </div>
      </div>

      {/* Death Memorial */}
      {dead.length > 0 && <DeathMemorial dead={dead} />}

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
