import { colors, fonts, crt, shared, resourceColor } from '../styles/theme.js';
import { STARTING_FOOD, STARTING_MEDICINE, STARTING_AMMO } from '../game/constants.js';

export default function StatusBar({ food, medicine, ammo, groupMorale }) {
  const resources = [
    { label: 'FOOD', value: food, max: STARTING_FOOD * 1.5, critical: food === 0 },
    { label: 'MED', value: medicine, max: STARTING_MEDICINE * 1.5, critical: medicine === 0 },
    { label: 'AMMO', value: ammo, max: STARTING_AMMO * 1.5, critical: ammo === 0 },
    { label: 'MORALE', value: groupMorale, max: 100, critical: groupMorale < 15 },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '4px',
      padding: '6px 4px',
      border: `1px solid ${colors.border}`,
      marginBottom: '12px',
    }}>
      {resources.map(r => (
        <div key={r.label} style={{
          textAlign: 'center',
          backgroundColor: r.critical ? 'rgba(255,51,51,0.08)' : 'transparent',
          padding: '2px 0',
          borderRadius: '2px',
        }}>
          <div style={{
            ...shared.label,
            marginBottom: '2px',
            fontSize: '8px',
            letterSpacing: '1px',
          }}>
            {r.label}
          </div>
          <div style={{
            fontSize: 'clamp(16px, 4.5vw, 20px)',
            fontFamily: fonts.mono,
            color: resourceColor(r.value, r.max),
            textShadow: `0 0 8px ${resourceColor(r.value, r.max)}55`,
            fontWeight: 'bold',
            animation: r.critical ? 'pulse 1.5s ease-in-out infinite' : 'none',
          }}>
            {Math.round(r.value)}
          </div>
        </div>
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
