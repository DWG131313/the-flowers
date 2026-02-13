import { colors, fonts, crt } from '../styles/theme.js';

const BUTTON_COLORS = {
  danger: { color: colors.danger, border: colors.danger, glow: 'rgba(255,51,51,0.3)' },
  amber: { color: colors.amber, border: colors.amber, glow: 'rgba(255,170,51,0.3)' },
  primary: { color: colors.primary, border: colors.primary, glow: 'rgba(51,255,51,0.3)' },
};

export default function EventCard({ event, onChoice, resources }) {
  if (!event) return null;

  return (
    <div style={{
      border: `1px solid ${colors.border}`,
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: 'rgba(10,10,10,0.9)',
    }}>
      {/* Title */}
      <div style={{
        textAlign: 'center',
        color: colors.amber,
        fontSize: '14px',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        marginBottom: '12px',
        ...crt.amberGlow,
        fontWeight: 'bold',
      }}>
        {event.title}
      </div>

      {/* ASCII Art */}
      {event.ascii && (
        <pre style={{
          color: colors.dim,
          fontSize: 'min(1.8vw, 10px)',
          lineHeight: 1.2,
          textAlign: 'center',
          margin: '0 0 12px 0',
          fontFamily: fonts.mono,
          overflow: 'hidden',
          whiteSpace: 'pre',
        }}>
          {event.ascii}
        </pre>
      )}

      {/* Narrative Text */}
      <div style={{
        color: colors.primary,
        fontSize: '13px',
        lineHeight: 1.8,
        marginBottom: '16px',
        opacity: 0.9,
      }}>
        {event.text}
      </div>

      {/* Choice Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {event.choices.map((choice, i) => {
          const colorScheme = BUTTON_COLORS[choice.color] || BUTTON_COLORS.primary;

          // Check if the player can afford this choice
          let canAfford = true;
          if (choice.cost && resources) {
            for (const [key, amount] of Object.entries(choice.cost)) {
              if ((resources[key] || 0) < amount) {
                canAfford = false;
                break;
              }
            }
          }

          return (
            <button
              key={i}
              onClick={() => canAfford && onChoice(choice.effect)}
              disabled={!canAfford}
              style={{
                fontFamily: fonts.mono,
                fontSize: '12px',
                cursor: canAfford ? 'pointer' : 'not-allowed',
                border: `1px solid ${canAfford ? colorScheme.border : colors.faint}`,
                backgroundColor: 'transparent',
                padding: '12px 14px',
                minHeight: '44px',
                textAlign: 'left',
                color: canAfford ? colorScheme.color : colors.faint,
                transition: 'background-color 0.15s',
                opacity: canAfford ? 1 : 0.4,
              }}
              onMouseEnter={e => { if (canAfford) e.currentTarget.style.backgroundColor = colorScheme.glow; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                {`> ${choice.label}`}{!canAfford ? ' [CAN\'T AFFORD]' : ''}
              </div>
              <div style={{
                fontSize: '10px',
                color: canAfford ? colors.dim : colors.faint,
                marginLeft: '16px',
              }}>
                {choice.detail}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
