import { aliveSurvivors } from '../survivor.js';
import { DEFECTION_MORALE_THRESHOLD } from '../constants.js';

const ASCII_ART = `
┌──────────────────────────────┐
│                              │
│     ◯──→                     │
│    /|\\      WALKING OUT.     │
│    / \\      ALONE.           │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  LEAVE = GONE     ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const defectionVariants = [
  (target) => `${target.name} is packed. Bag over one shoulder, won't meet your eyes. "I'm done," they say. Morale's been low for days. The rule says if you leave, you're gone. But that was before you knew what alone out there means.`,

  (target) => `You find ${target.name} at the fence at 3 AM, cutting wire. Not sneaking — just quiet. "I found something on the radio," ${target.name} says. "A settlement, north. Real walls. Real food." ${target.age < 25 ? 'Young enough to still believe in safe places.' : 'Old enough to know better, but desperate enough to try.'} ${target.skill === 'medical' ? 'Losing the medic would gut this group.' : target.skill === 'combat' ? 'Losing a fighter now, when the hordes are getting bigger.' : `${target.name} has been pulling weight. The gap would show.`} Could be real. Could be a trap broadcast.`,

  (target) => `${target.name} hasn't said a word in three days. Then, at breakfast: "I had a family in Chesterfield. I need to know." ${target.hasPet ? `Holds the ${target.petType} tighter. "They'd want me to come."` : 'Hands shaking around a cold cup of water.'} ${target.trust < 40 ? 'Never fully committed to this group anyway.' : 'Has been loyal from the start. That makes this harder.'} Chesterfield is forty miles through open country. Suicide walk. But the not-knowing is killing them slower.`,

  (target) => `"You executed Reyes." ${target.name} says it flat. Not angry — worse. Certain. "Reyes had two more days on the clock and you made the call." ${target.morale < 25 ? 'Been carrying this a long time. The dam finally broke.' : 'Something about today tipped the scale.'} ${target.name} has the pack, the water, one of the good knives. Planned this. "I won't live under someone who does that. I'd rather die out there honest." ${target.skill === 'leadership' ? 'Other people are listening. Some of them are nodding.' : 'A few people look away. Nobody argues.'}`,

  (target) => `${target.name} puts a hand-drawn map on the table. The coast. A boat marked in red ink. "I've been planning this for weeks. There's an island — no walkers crossed water that I ever saw." ${target.age > 40 ? `At ${target.age}, this might be the last shot at something that isn't just surviving.` : 'The kind of hope only someone who hasn\'t buried enough people can still carry.'} ${target.name} isn't asking permission. "I'm going. The question is whether you stop me."`,
];

export function generateDefectionEvent(state) {
  const candidates = aliveSurvivors(state.survivors).filter(
    s => s.morale < DEFECTION_MORALE_THRESHOLD
  );
  if (candidates.length === 0) return null;

  // Pick the lowest morale survivor
  const target = candidates.reduce((a, b) => a.morale < b.morale ? a : b);

  return {
    type: 'defection',
    title: 'DEFECTION',
    ascii: ASCII_ART,
    text: pick(defectionVariants)(target),
    targetId: target.id,
    choices: [
      {
        label: 'Let them go',
        detail: 'The rule is the rule. Leave and you\'re gone.',
        effect: 'defection_let_go',
        color: 'danger',
      },
      {
        label: 'Try to convince them',
        detail: 'Talk. Remind them what this group means. Maybe it works.',
        effect: 'defection_convince',
        color: 'amber',
      },
      {
        label: 'Put it to a vote',
        detail: 'Let the group decide. Democracy in the apocalypse.',
        effect: 'defection_vote',
        color: 'primary',
      },
    ],
  };
}
