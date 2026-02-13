import { aliveSurvivors } from '../survivor.js';
import { MEDICINE_COST_TREATMENT } from '../constants.js';

const ASCII_ART = `
┌──────────────────────────────┐
│                              │
│     ◯                        │
│    /|\\   COUGHING.           │
│    / \\   SHIVERING.          │
│     ~    SWEATING.           │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  QUARANTINE        ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const illnessVariants = [
  (target) => `${target.name} woke up shaking. Fever hit fast — ${target.age > 40 ? 'the older ones go downhill quicker' : 'young body, but this thing doesn\'t care about age'}. Sweat-soaked through the blanket by morning. Could be flu. Could be the infection. Nobody wants to say it out loud. ${target.hasPet ? `Their ${target.petType} hasn't left their side, whimpering.` : 'The rule says quarantine, then the clock starts.'} Three days.`,

  (target) => `${target.name} started coughing at dawn. By noon, it was blood. Not a lot — flecks on the back of the hand, pink foam at the corner of the mouth. ${target.skill === 'medical' ? '"It\'s probably just bronchitis," they say. Nobody believes them.' : `${target.name} won't look anyone in the eye.`} Could be a chest infection. Could be the early signs of turning. Three days in quarantine will tell you which.`,

  (target) => `Found ${target.name} passed out by the water supply. Skin burning hot, pupils blown wide. Delirious — kept calling out a name nobody recognized. ${target.age < 25 ? 'Barely more than a kid. Hard to watch.' : `${target.age} years old. Survived this long just to get taken out by a fever.`} ${target.trust > 55 ? 'People are asking what we\'re going to do. They care about this one.' : 'A few people are already keeping their distance.'} The clock starts now.`,

  (target) => `A rash. That's how it started for ${target.name} — red welts crawling up from the wrist to the elbow. Then the tremors. Then the confusion. "I drank from the creek," ${target.name} admits. ${target.skill === 'scavenge' ? 'Should have known better. The scavenger who forgot rule one: never drink unfiltered.' : 'Contaminated water or early infection — the symptoms overlap.'} Quarantine. Three days. Maybe answers.`,

  (target) => `${target.name} hasn't eaten in two days. Vomiting anything that goes down, even water. Cramps so bad they can't stand straight. ${target.health < 70 ? 'Wasn\'t healthy to begin with. This could tip it.' : 'Was the strongest of us last week. That\'s what makes this terrifying.'} ${target.morale < 40 ? `"Just let me go," ${target.name} says. Doesn't mean outside.` : `${target.name} is fighting it. Jaw clenched, white-knuckled grip on the cot.`} The question nobody asks: is this natural, or is it the beginning of the end?`,
];

export function generateIllnessEvent(state) {
  const alive = aliveSurvivors(state.survivors).filter(
    s => !s.sick && !s.injured && !s.quarantined
  );
  if (alive.length === 0) return null;

  const target = alive[Math.floor(Math.random() * alive.length)];

  return {
    type: 'illness',
    title: 'ILLNESS DETECTED',
    ascii: ASCII_ART,
    text: pick(illnessVariants)(target),
    targetId: target.id,
    choices: [
      {
        label: 'Quarantine and treat',
        detail: `Medicine and isolation. Best chance. [-${MEDICINE_COST_TREATMENT} MEDICINE]`,
        effect: 'illness_treat',
        cost: { medicine: MEDICINE_COST_TREATMENT },
        color: 'amber',
      },
      {
        label: 'Quarantine only',
        detail: 'Isolate them. No medicine. See what happens.',
        effect: 'illness_quarantine',
        color: 'primary',
      },
      {
        label: 'Look at the flowers',
        detail: 'Can\'t risk it spreading. End it now.',
        effect: 'illness_execute',
        color: 'danger',
      },
    ],
  };
}
