import { useState } from 'react';
import { colors, fonts, shared } from '../styles/theme.js';
import { SKILL_LABELS, INJURY_ILLNESS_TIMER_DAYS, INFECTION_TURN_DAYS } from '../game/constants.js';
import { ALL_EQUIPMENT } from '../game/equipment.js';
import SurvivorSprite from './SurvivorSprite.jsx';

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

function EquipTag({ itemId, type }) {
  const item = ALL_EQUIPMENT[itemId];
  if (!item) return null;
  const tagColor = type === 'weapon' ? '#ff4444' : '#44cc44';
  return (
    <span style={{
      fontSize: '8px',
      letterSpacing: '0.5px',
      padding: '0px 3px',
      border: `1px solid ${tagColor}`,
      color: tagColor,
      marginRight: '2px',
    }}>
      {item.tag}
    </span>
  );
}

function DetailPanel({ survivor, day }) {
  const s = survivor;
  const details = [];

  // Equipment details
  if (s.weapon) {
    const w = ALL_EQUIPMENT[s.weapon];
    if (w) {
      const bonuses = [];
      if (w.damagePlus) bonuses.push(`+${w.damagePlus} dmg`);
      if (w.moraleBonus) bonuses.push(`+${w.moraleBonus} morale/day`);
      if (w.healthRecovery) bonuses.push(`+${w.healthRecovery} hp/day`);
      if (w.scavengeBonus) bonuses.push(`+${Math.round(w.scavengeBonus * 100)}% scav`);
      details.push({ label: 'WEAPON', text: `${w.name}${bonuses.length ? ' — ' + bonuses.join(', ') : ''}` });
    }
  }
  if (s.armor) {
    const a = ALL_EQUIPMENT[s.armor];
    if (a) {
      const bonuses = [];
      if (a.damageMinus) bonuses.push(`-${a.damageMinus} dmg taken`);
      if (a.moraleBonus) bonuses.push(`+${a.moraleBonus} morale/day`);
      if (a.healthRecovery) bonuses.push(`+${a.healthRecovery} hp/day`);
      if (a.recoveryBonus) bonuses.push(`+${Math.round(a.recoveryBonus * 100)}% recovery`);
      if (a.sicknessReduction) bonuses.push(`-${Math.round(a.sicknessReduction * 100)}% sickness`);
      if (a.medicineSaving) bonuses.push(`-${a.medicineSaving} med cost`);
      details.push({ label: 'ARMOR', text: `${a.name}${bonuses.length ? ' — ' + bonuses.join(', ') : ''}` });
    }
  }

  // Status timers
  if (s.injured && s.injuredDay != null) {
    const elapsed = day - s.injuredDay;
    const remaining = Math.max(0, INJURY_ILLNESS_TIMER_DAYS - elapsed);
    details.push({ label: 'INJURED', text: `${elapsed} day${elapsed !== 1 ? 's' : ''} ago — ${remaining} day${remaining !== 1 ? 's' : ''} left${s.injuredTreated ? ' (treated)' : ''}`, color: colors.amber });
  }
  if (s.sick && s.sickDay != null) {
    const elapsed = day - s.sickDay;
    const remaining = Math.max(0, INJURY_ILLNESS_TIMER_DAYS - elapsed);
    details.push({ label: 'SICK', text: `${elapsed} day${elapsed !== 1 ? 's' : ''} ago — ${remaining} day${remaining !== 1 ? 's' : ''} left${s.sickTreated ? ' (treated)' : ''}`, color: colors.amber });
  }
  if (s.infected && s.infectedDay != null) {
    const elapsed = day - s.infectedDay;
    const remaining = Math.max(0, INFECTION_TURN_DAYS - elapsed);
    details.push({ label: 'INFECTED', text: `${elapsed} day${elapsed !== 1 ? 's' : ''} ago — ${remaining} day${remaining !== 1 ? 's' : ''} left${s.infectionTreated ? ' (treated)' : ''}`, color: colors.danger });
  }

  return (
    <div style={{
      marginTop: '6px',
      padding: '6px',
      borderTop: `1px solid ${colors.border}`,
      fontSize: '9px',
      color: colors.dim,
    }}>
      {/* Full stats */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: details.length > 0 ? '6px' : 0,
      }}>
        <span>HP: <span style={{ color: colors.primary }}>{s.health}</span></span>
        <span>MRL: <span style={{ color: colors.primary }}>{s.morale}</span></span>
        <span>TRS: <span style={{ color: colors.primary }}>{s.trust}</span></span>
      </div>

      {/* Equipment + status details */}
      {details.map((d, i) => (
        <div key={i} style={{
          marginBottom: '2px',
          color: d.color || colors.dim,
        }}>
          <span style={{ letterSpacing: '1px', fontSize: '8px' }}>{d.label}:</span> {d.text}
        </div>
      ))}
    </div>
  );
}

function SurvivorCard({ survivor, isSelected, onToggle, day }) {
  const s = survivor;
  const healthPct = s.health / 100;
  const healthColor = healthPct > 0.5 ? colors.primary : healthPct > 0.25 ? colors.amber : colors.danger;

  return (
    <div
      onClick={s.alive ? onToggle : undefined}
      style={{
        ...shared.card,
        opacity: s.alive ? 1 : 0.35,
        position: 'relative',
        cursor: s.alive ? 'pointer' : 'default',
        borderColor: isSelected ? colors.amber : colors.border,
      }}
    >
      {/* Sprite + Info row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
        {/* Sprite */}
        <SurvivorSprite survivor={s} size={48} />

        {/* Info column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + age */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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

          {/* Skill + trust */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
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
        </div>
      </div>

      {/* Equipment tags */}
      {(s.weapon || s.armor) && (
        <div style={{ marginBottom: '3px', minHeight: '12px' }}>
          {s.weapon && <EquipTag itemId={s.weapon} type="weapon" />}
          {s.armor && <EquipTag itemId={s.armor} type="armor" />}
        </div>
      )}

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

      {/* Expanded detail panel */}
      {isSelected && s.alive && <DetailPanel survivor={s} day={day} />}
    </div>
  );
}

export default function SurvivorRoster({ survivors, day }) {
  const [selectedId, setSelectedId] = useState(null);
  const alive = survivors.filter(s => s.alive);
  const dead = survivors.filter(s => !s.alive);

  const handleToggle = (id) => {
    setSelectedId(prev => prev === id ? null : id);
  };

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
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '6px',
      }}>
        {alive.map(s => (
          <SurvivorCard
            key={s.id}
            survivor={s}
            isSelected={selectedId === s.id}
            onToggle={() => handleToggle(s.id)}
            day={day}
          />
        ))}
        {dead.map(s => (
          <SurvivorCard
            key={s.id}
            survivor={s}
            isSelected={false}
            onToggle={() => {}}
            day={day}
          />
        ))}
      </div>
    </div>
  );
}
