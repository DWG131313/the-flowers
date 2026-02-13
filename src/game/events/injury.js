import { aliveSurvivors } from '../survivor.js';
import { MEDICINE_COST_TREATMENT } from '../constants.js';

const ASCII_ART = `
┌──────────────────────────────┐
│                              │
│     ╔══╗                     │
│     ║++║  BLEEDING.          │
│     ╚══╝  CLOCK'S TICKING.  │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  THREE DAYS        ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const injuryVariants = [
  (target) => ({
    text: `${target.name} came back from a run dragging one leg. Fell through a rotten floor — ${target.age > 40 ? 'bones don\'t bounce like they used to at ' + target.age : 'lucky the whole building didn\'t come down'}. The ankle is swollen purple, might be fractured. ${target.skill === 'combat' ? 'Your best fighter, grounded.' : target.skill === 'medical' ? 'The medic can\'t even treat themselves.' : `Three days to see if ${target.name} walks again.`} The rule says if it's not better in three days, they look at the flowers.`,
    injuryType: 'fractured ankle',
  }),

  (target) => ({
    text: `${target.name} took a piece of rebar through the forearm clearing a building. Went clean through — you can see daylight on the other side. ${target.name} didn't scream. ${target.age < 25 ? 'Too young to understand how bad this is.' : 'Old enough to know exactly how bad this is.'} ${target.hasPet ? `Their ${target.petType} won't stop licking the blood off the floor.` : 'Blood on the concrete, steady drip.'} If infection sets in, three days is generous.`,
    injuryType: 'puncture wound',
  }),

  (target) => ({
    text: `A wall collapsed during the scavenge run. ${target.name} caught the worst of it — ribs on the left side, at least two broken. Every breath is a whistle. ${target.skill === 'scavenge' ? 'Won\'t be crawling through any more windows for a while.' : ''} Can't carry gear, can't run, can barely stand. ${target.health < 70 ? 'Wasn\'t in great shape before this. Now it\'s a coin flip.' : 'Strong enough to survive it — maybe.'} Three days. The rule doesn't bend.`,
    injuryType: 'fractured ribs',
  }),

  (target) => ({
    text: `${target.name} was sharpening a blade when it slipped. Deep cut across the palm, right through the tendons. ${target.skill === 'combat' ? 'Can\'t grip a weapon. Can\'t pull a trigger.' : target.skill === 'craft' ? 'The one person who could fix things, and now those hands are useless.' : 'One hand out of commission.'} Wrapped it in a shirt but the bleeding won't stop. Without stitches, without antibiotics — three days to see if that hand ever closes again.`,
    injuryType: 'deep laceration',
  }),

  (target) => ({
    text: `${target.name} dislocated a shoulder wrestling a door shut against a pack of walkers. Popped it back in — ${target.age < 30 ? 'screamed loud enough to draw more' : 'bit down on a belt and did it one-handed, the hard way'}. The joint is loose now, swelling fast. ${target.name} says it's fine. ${target.name}'s face says otherwise. ${target.trust > 60 ? 'The group is worried. This one matters to people.' : 'Nobody says much. But everyone\'s counting.'} Three days.`,
    injuryType: 'dislocated shoulder',
  }),
];

export function generateInjuryEvent(state) {
  const alive = aliveSurvivors(state.survivors).filter(
    s => !s.injured && !s.sick && !s.quarantined
  );
  if (alive.length === 0) return null;

  const target = alive[Math.floor(Math.random() * alive.length)];
  const variant = pick(injuryVariants)(target);

  return {
    type: 'injury',
    title: 'INJURY REPORT',
    ascii: ASCII_ART,
    text: variant.text,
    targetId: target.id,
    injuryType: variant.injuryType,
    choices: [
      {
        label: 'Treat with medicine',
        detail: `Spend ${MEDICINE_COST_TREATMENT} medicine. Better odds. [-${MEDICINE_COST_TREATMENT} MEDICINE]`,
        effect: 'injury_treat',
        cost: { medicine: MEDICINE_COST_TREATMENT },
        color: 'amber',
      },
      {
        label: 'Start the clock',
        detail: 'No medicine. Three days. Hope for the best.',
        effect: 'injury_wait',
        color: 'primary',
      },
      {
        label: 'Look at the flowers',
        detail: `End it now. Save the medicine for someone who'll make it.`,
        effect: 'injury_execute',
        color: 'danger',
      },
    ],
  };
}
