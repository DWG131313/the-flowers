import { colors, fonts, shared } from '../styles/theme.js';
import { SKILL_LABELS } from '../game/constants.js';

function StatusTag({ label, color }) {
  return (
    <span style={{
      fontSize: '9px',
      letterSpacing: '1px',
      padding: '1px 4px',
      border: `1px solid ${color}`,
      color: color,
      marginRight: '3px',
    }}>
      {label}
    </span>
  );
}

function SurvivorCard({ survivor }) {
  const s = survivor;
  const healthPct = s.health / 100;
  const healthColor = healthPct > 0.5 ? colors.primary : healthPct > 0.25 ? colors.amber : colors.danger;

  return (
    <div style={{
      ...shared.card,
      opacity: s.alive ? 1 : 0.35,
      position: 'relative',
    }}>
      {/* Alive indicator + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <span style={{ color: s.alive ? colors.primary : colors.danger, fontSize: '10px' }}>
          {s.alive ? '●' : '✕'}
        </span>
        <span style={{
          color: s.alive ? colors.primary : colors.dim,
          fontSize: '12px',
          fontWeight: 'bold',
        }}>
          {s.name}
        </span>
        <span style={{
          fontSize: '9px',
          color: colors.dim,
          marginLeft: 'auto',
        }}>
          {s.age}y
        </span>
      </div>

      {/* Skill tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <span style={{
          fontSize: '9px',
          letterSpacing: '1px',
          color: colors.amber,
          padding: '1px 4px',
          border: `1px solid ${colors.border}`,
        }}>
          {SKILL_LABELS[s.skill] || s.skill.toUpperCase()}
        </span>
        <span style={{ fontSize: '9px', color: colors.dim }}>
          T:{s.trust}
        </span>
      </div>

      {/* Status tags */}
      <div style={{ marginBottom: '4px', minHeight: '14px' }}>
        {s.injured && <StatusTag label="HURT" color={colors.amber} />}
        {s.sick && <StatusTag label="SICK" color={colors.amber} />}
        {s.pregnant && <StatusTag label="PREG" color={colors.amber} />}
        {s.quarantined && <StatusTag label="QRT" color={colors.danger} />}
        {s.hasPet && <StatusTag label={s.petType === 'dog' ? 'DOG' : 'CAT'} color={colors.dim} />}
      </div>

      {/* Health bar */}
      {s.alive && (
        <div style={{
          height: '3px',
          backgroundColor: colors.faint,
          marginTop: '4px',
        }}>
          <div style={{
            height: '100%',
            width: `${s.health}%`,
            backgroundColor: healthColor,
            transition: 'width 0.3s',
          }} />
        </div>
      )}

      {/* Death cause */}
      {!s.alive && s.causeOfDeath && (
        <div style={{ fontSize: '9px', color: colors.danger, marginTop: '2px' }}>
          {s.causeOfDeath}
        </div>
      )}
    </div>
  );
}

export default function SurvivorRoster({ survivors }) {
  const alive = survivors.filter(s => s.alive);
  const dead = survivors.filter(s => !s.alive);

  return (
    <div>
      <div style={{
        ...shared.label,
        marginBottom: '6px',
        color: colors.dim,
      }}>
        SURVIVORS ({alive.length} ALIVE)
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '6px',
      }}>
        {alive.map(s => <SurvivorCard key={s.id} survivor={s} />)}
        {dead.map(s => <SurvivorCard key={s.id} survivor={s} />)}
      </div>
    </div>
  );
}
