import { useState } from 'react';
import { colors, fonts, crt } from '../styles/theme.js';

const PAGES = [
  {
    title: 'BRIEFING 1/8 — SITUATION',
    body: `The dead walk. Cities fell in weeks.

You didn't choose to lead. But people followed you,
and now eight survivors depend on your decisions.

You won't fire a weapon. You won't scavenge ruins.
Your job is harder than that.

You decide who stays. Who goes.
Who eats. Who doesn't.
Who looks at the flowers.`,
  },
  {
    title: 'BRIEFING 2/8 — OBJECTIVE',
    body: `Survive 30 days. That's how long until
the military sweeps this sector.

Each day has three phases:

  ☀ DAWN     — Morning bite check
  ◐ MIDDAY   — The long hours
  ☾ DUSK     — Before the dark

Each phase brings one event.
Make a decision. Live with it. Move on.`,
  },
  {
    title: 'BRIEFING 3/8 — RESOURCES',
    body: `Four things keep your group alive:

  FOOD      Drains daily per survivor.
            Hit zero and everyone suffers.

  MEDICINE  Spent to treat injuries and illness.
            Without it, the clock just ticks.

  AMMO      Used for defense and burning bodies.
            Run out and you're defenseless.

  MORALE    Average of everyone's will to live.
            Drop too low and people walk.`,
  },
  {
    title: 'BRIEFING 4/8 — YOUR PEOPLE',
    body: `Each survivor has stats you can see:

  Health    0 = dead. No exceptions.
  Morale    Low morale means defection.
  Trust     How much they believe in your rules.
  Skill     One specialty per person:
              CMB  Combat — better in fights
              MED  Medical — can be exempt from combat
              SCV  Scavenge — better supply runs
              CRF  Craft — stretches food, finds extras
              LDR  Leadership — steadies the group

Some have pets. Pets help morale.
Pets also eat food. Remember that.`,
  },
  {
    title: 'BRIEFING 5/8 — EQUIPMENT',
    body: `Your people start with nothing. But the world
is full of what the dead left behind.

After day 5, you'll find gear in the field:
armories, hunting lodges, police stations,
field hospitals. Each one is a gamble.

  WEAPONS   One per survivor. Red tag on their card.
            Pipe wrenches, axes, crossbows, shotguns.
            Better weapons mean better odds in fights.

  ARMOR     One per survivor. Green tag on their card.
            Riot shields, combat vests, gas masks.
            Reduces damage taken. Some heal over time.

Risk more for better gear. Or play it safe
and take what the perimeter offers.

Equipment stays with the survivor who found it.
If they die, the gear goes with them.`,
  },
  {
    title: 'BRIEFING 6/8 — THE RULES',
    body: `You govern by ten rules. They are brutal.
They are the only reason you're still alive.

  1.  Mandatory bite checks — three times daily
  2.  Pregnant survivors leave or lose it
  3.  Children under 10 look at the flowers
  4.  Fight or leave — medics exempt
  5.  Leave the group, you're gone for good
  6.  No untrained dogs. Cats are fine.
  7.  If food runs out, pets are food
  8.  Burn every body you find
  9.  Injuries: 3 days to heal or look at the flowers
  10. Illness: quarantine, 3 days, same deal

Every event will test these rules.
Every choice will cost something.`,
  },
  {
    title: 'BRIEFING 7/8 — THE HARD PART',
    body: `Enforce the rules and people trust you.
Break them and they don't.

But rules cost lives. Mercy costs trust.
There is no right answer. Only trade-offs.

Some things are hidden from you. Bites can be
concealed. Illness might be the infection.
You won't always know until it's too late.

Treat injuries with medicine for better odds.
Or save the medicine. Someone else might need it.

The three-day clock doesn't care about fairness.`,
  },
  {
    title: 'BRIEFING 8/8 — ONE LAST THING',
    body: `When someone has to die — bitten, broken,
too far gone — your group has a phrase for it.

They say: "Look at the flowers."

Nobody remembers who said it first.
It doesn't matter. You'll know when it's time.

Survive 30 days. Get your people out.
As many as you can.`,
  },
];

export default function TutorialScreen({ onComplete, closeLabel }) {
  const [page, setPage] = useState(0);
  const current = PAGES[page];
  const isLast = page === PAGES.length - 1;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '12px',
      fontFamily: fonts.mono,
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        border: `1px solid ${colors.border}`,
        padding: 'clamp(12px, 4vw, 24px)',
        backgroundColor: 'rgba(10,10,10,0.9)',
      }}>
        {/* Title */}
        <div style={{
          color: colors.amber,
          fontSize: 'clamp(9px, 2.5vw, 11px)',
          letterSpacing: 'clamp(1px, 0.5vw, 3px)',
          marginBottom: '16px',
          ...crt.amberGlow,
        }}>
          {current.title}
        </div>

        {/* Body */}
        <pre style={{
          color: colors.primary,
          fontSize: 'clamp(10px, 2.8vw, 12px)',
          lineHeight: 1.7,
          fontFamily: fonts.mono,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          margin: 0,
          opacity: 0.85,
        }}>
          {current.body}
        </pre>

        {/* Progress bar */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginTop: '24px',
          marginBottom: '16px',
        }}>
          {PAGES.map((_, i) => (
            <div key={i} style={{
              flex: 1,
              height: '2px',
              backgroundColor: i <= page ? colors.primary : colors.faint,
              transition: 'background-color 0.3s',
            }} />
          ))}
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {page > 0 ? (
            <button
              onClick={() => setPage(p => p - 1)}
              style={{
                fontFamily: fonts.mono,
                fontSize: '11px',
                color: colors.dim,
                backgroundColor: 'transparent',
                border: `1px solid ${colors.faint}`,
                padding: '10px 16px',
                minHeight: '44px',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.target.style.borderColor = colors.dim}
              onMouseLeave={e => e.target.style.borderColor = colors.faint}
            >
              ◂ BACK
            </button>
          ) : (
            <button
              onClick={onComplete}
              style={{
                fontFamily: fonts.mono,
                fontSize: '11px',
                color: colors.dim,
                backgroundColor: 'transparent',
                border: `1px solid ${colors.faint}`,
                padding: '10px 16px',
                minHeight: '44px',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.target.style.borderColor = colors.dim}
              onMouseLeave={e => e.target.style.borderColor = colors.faint}
            >
              SKIP ▸▸
            </button>
          )}

          <span style={{ fontSize: '10px', color: colors.faint }}>
            {page + 1}/{PAGES.length}
          </span>

          <button
            onClick={() => isLast ? onComplete() : setPage(p => p + 1)}
            style={{
              fontFamily: fonts.mono,
              fontSize: '11px',
              color: isLast ? colors.amber : colors.primary,
              backgroundColor: 'transparent',
              border: `1px solid ${isLast ? colors.amber : colors.border}`,
              padding: '10px 16px',
              minHeight: '44px',
              cursor: 'pointer',
              textShadow: isLast ? '0 0 8px rgba(255,170,51,0.4)' : 'none',
            }}
            onMouseEnter={e => e.target.style.backgroundColor = isLast ? 'rgba(255,170,51,0.1)' : 'rgba(51,255,51,0.1)'}
            onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
          >
            {isLast ? `▸ ${closeLabel || 'BEGIN'}` : 'NEXT ▸'}
          </button>
        </div>
      </div>
    </div>
  );
}
