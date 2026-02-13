import { useState } from 'react';
import { colors, fonts, crt, shared } from '../styles/theme.js';
import { PHASE_NAMES, PHASE_ICONS, WIN_DAY } from '../game/constants.js';
import { aliveSurvivors } from '../game/survivor.js';
import { RARE_ITEMS, hasItem } from '../game/items.js';
import StatusBar from './StatusBar.jsx';
import EventCard from './EventCard.jsx';
import SurvivorRoster from './SurvivorRoster.jsx';
import GameLog from './GameLog.jsx';
import TutorialScreen from './TutorialScreen.jsx';

function RescueBar({ day, items }) {
  const effectiveWinDay = hasItem({ items }, 'military_radio') ? WIN_DAY - 3 : WIN_DAY;
  const progress = Math.min(1, (day - 1) / (effectiveWinDay - 1));
  const barColor = progress < 0.67 ? colors.primary : progress < 0.83 ? colors.amber : colors.danger;

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{
        height: '4px',
        backgroundColor: colors.faint,
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${progress * 100}%`,
          backgroundColor: barColor,
          transition: 'width 0.5s, background-color 0.5s',
          boxShadow: `0 0 6px ${barColor}55`,
        }} />
      </div>
      <div style={{
        textAlign: 'center',
        fontSize: '9px',
        letterSpacing: '2px',
        color: barColor,
        marginTop: '3px',
      }}>
        RESCUE: DAY {day}/{effectiveWinDay}
      </div>
    </div>
  );
}

export default function GameScreen({ state, onChoice, onAdvance }) {
  const [showBriefing, setShowBriefing] = useState(false);
  const alive = aliveSurvivors(state.survivors);
  const nextPhase = (state.phase + 1) % 3;
  const nextDay = state.phase === 2 ? state.day + 1 : state.day;
  const advanceLabel = state.phase === 2
    ? `ADVANCE TO ${PHASE_ICONS[0]} ${PHASE_NAMES[0].toUpperCase()}, DAY ${nextDay}`
    : `ADVANCE TO ${PHASE_ICONS[nextPhase]} ${PHASE_NAMES[nextPhase].toUpperCase()}`;

  return (
    <div style={{
      maxWidth: '720px',
      margin: '0 auto',
      padding: '8px 10px',
      fontFamily: fonts.mono,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '8px',
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '8px',
      }}>
        <div style={{
          fontSize: '22px',
          color: colors.primary,
          ...crt.textGlow,
          fontWeight: 'bold',
        }}>
          DAY {state.day}
        </div>
        <div style={{
          fontSize: '13px',
          color: colors.amber,
          letterSpacing: '2px',
        }}>
          {PHASE_ICONS[state.phase]} {PHASE_NAMES[state.phase].toUpperCase()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            fontSize: '11px',
            color: colors.dim,
          }}>
            {alive.length} ALIVE
          </div>
          <button
            onClick={() => setShowBriefing(true)}
            style={{
              fontFamily: fonts.mono,
              fontSize: '11px',
              color: colors.dim,
              backgroundColor: 'transparent',
              border: `1px solid ${colors.faint}`,
              padding: '4px 8px',
              minHeight: '32px',
              minWidth: '32px',
              cursor: 'pointer',
              letterSpacing: '1px',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = colors.dim}
            onMouseLeave={e => e.currentTarget.style.borderColor = colors.faint}
          >
            ?
          </button>
        </div>
      </div>

      {/* Rescue Countdown Bar */}
      <RescueBar day={state.day} items={state.items} />

      {/* Resources */}
      <StatusBar
        food={state.food}
        medicine={state.medicine}
        ammo={state.ammo}
        groupMorale={state.groupMorale}
        prevResources={state.prevResources}
        settings={state.settings}
      />

      {/* Items */}
      {state.items && state.items.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          marginBottom: '8px',
        }}>
          {state.items.map(id => {
            const item = RARE_ITEMS[id];
            return item ? (
              <span key={id} style={{
                fontSize: '8px',
                letterSpacing: '1px',
                padding: '2px 6px',
                border: `1px solid ${colors.amber}`,
                color: colors.amber,
              }}>
                ★ {item.tag}
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* Event Card */}
      {state.currentEvent && (
        <EventCard
          event={state.currentEvent}
          onChoice={onChoice}
          resources={{ food: state.food, medicine: state.medicine, ammo: state.ammo }}
        />
      )}

      {/* Advance Button */}
      {!state.currentEvent && (
        <button
          onClick={onAdvance}
          style={{
            ...shared.button,
            color: colors.amber,
            border: `1px solid ${colors.amber}`,
            textAlign: 'center',
            fontSize: '13px',
            letterSpacing: '2px',
            marginBottom: '12px',
            padding: '16px',
            minHeight: '48px',
            ...crt.amberGlow,
          }}
          onMouseEnter={e => e.target.style.backgroundColor = 'rgba(255,170,51,0.1)'}
          onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
        >
          {`▸ ${advanceLabel}`}
        </button>
      )}

      {/* Survivor Roster */}
      <div style={{ marginBottom: '12px' }}>
        <SurvivorRoster survivors={state.survivors} day={state.day} />
      </div>

      {/* Game Log */}
      <GameLog log={state.log} />

      {/* Briefing Overlay */}
      {showBriefing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.92)',
          zIndex: 1000,
          overflowY: 'auto',
        }}>
          <TutorialScreen
            onComplete={() => setShowBriefing(false)}
            closeLabel="CLOSE"
          />
        </div>
      )}
    </div>
  );
}
