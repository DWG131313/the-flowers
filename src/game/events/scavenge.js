import { aliveSurvivors } from '../survivor.js';
import { AMBUSH_RISK } from '../constants.js';

const SCAVENGE_ART = `
┌──────────────────────────────┐
│                              │
│     ┌───┐ ┌───┐ ┌───┐       │
│     │ F │ │ M │ │ A │       │
│     └───┘ └───┘ └───┘       │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  SUPPLY RUN       ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

const AMBUSH_ART = `
┌──────────────────────────────┐
│                              │
│     ╔══════════════╗         │
│     ║  ! ! ! ! !   ║         │
│     ║   AMBUSH     ║         │
│     ╚══════════════╝         │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  THEY FOUND US    ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const scavengeVariants = [
  (location, hasScavenger) => `Found ${location} nearby. Could have supplies inside. Could have worse. ${hasScavenger ? 'Your scavenger knows the approach — better odds of a clean haul.' : 'No trained scavenger. Going in blind.'}`,

  (location, hasScavenger) => `Smoke rising from ${location} — fire went out days ago, but the structure held. Through the window: shelves. Some still stocked. ${hasScavenger ? 'Your scavenger spots a side entrance, away from the main road. Safer approach.' : 'Front door is the only way in. Wide open. Exposed.'} The question is always the same: what else is in there.`,

  (location, hasScavenger) => `One of the scouts marked ${location} on the map two days ago. Said it looked untouched — which either means nobody found it, or nobody came back from it. ${hasScavenger ? 'The scavenger\'s been watching it through binoculars. No movement. Says it\'s clean.' : 'No way to know what\'s inside without going in.'} Every supply run is a gamble. This one feels bigger.`,

  (location, hasScavenger) => `Rain last night washed out a section of road, exposed ${location} that was half-buried in mud. The collapse cracked it open. You can see crates inside — military markings. ${hasScavenger ? 'Your scavenger is already grinning. Knows the crate codes. "That\'s the good stuff."' : 'Could be rations. Could be empty boxes someone already cleaned out.'} But the mud around it is churned up. Something else found this place too.`,

  (location, hasScavenger) => `A hand-painted sign on the road: "SUPPLIES — TAKE WHAT YOU NEED." Arrow pointing toward ${location}. Could be genuine — some people still do that. Could be bait. ${hasScavenger ? 'Your scavenger has seen this trick before. "Let me go first. Alone."' : 'No one with the experience to tell the difference.'} Trust is a luxury. So is starvation.`,
];

const ambushVariants = [
  (target) => `They came out of nowhere. A pack of walkers — eight, maybe ten. ${target.name} is closest. The group has seconds to react.`,

  (target) => `The treeline erupts. Walkers — a dozen at least, stumbling out of the brush in a ragged line. ${target.name} was on point, ${target.skill === 'combat' ? 'already reaching for the weapon' : 'unarmed, twenty yards ahead of everyone else'}. They're closing fast. ${target.age < 25 ? 'Young legs might outrun them.' : 'No time to think. Only time to choose.'}`,

  (target) => `A car alarm. Someone tripped it — maybe ${target.name}, maybe a walker. Doesn't matter now. The sound is a dinner bell and they're coming from everywhere. ${target.name} is cut off from the group, ${target.hasPet ? `${target.petType} barking, drawing more of them` : 'back against a wall, nowhere to go'}. Fight or run, but decide now.`,

  (target) => `${target.name} went to check a noise behind the building. Thirty seconds later — screaming. Not ${target.name}'s voice. The walkers'. That guttural moan, multiplied. A pack, six or seven, piling out of a basement hatch. ${target.name} is backing up but they're faster than the usual ones. ${target.health < 70 ? 'Not in great shape to run.' : 'Still strong enough to fight, but the numbers are bad.'}`,

  (target) => `Quiet road. Too quiet. ${target.name} says it first: "Where are the birds?" Then the first one comes around the corner — a crawler, legless, pulling itself by the arms. Behind it, the pack. Standing ones. Fast ones. They must have been herding, following the group's trail for miles. ${target.name} is between them and the rest of the group. ${target.skill === 'combat' ? 'Trained for this. But training doesn\'t stop teeth.' : 'Never signed up for front-line combat. Got it anyway.'}`,
];

export function generateScavengeEvent(state) {
  const alive = aliveSurvivors(state.survivors).filter(
    s => !s.quarantined && !s.pregnant
  );
  if (alive.length === 0) return null;

  const LOCATIONS = [
    'an abandoned grocery store',
    'a boarded-up pharmacy',
    'a wrecked convoy on the highway',
    'a ransacked house',
    'a collapsed gas station',
    'an overturned supply truck',
    'a deserted school cafeteria',
  ];

  const location = pick(LOCATIONS);
  const hasScavenger = alive.some(s => s.skill === 'scavenge');

  return {
    type: 'scavenge',
    title: 'SUPPLY RUN',
    ascii: SCAVENGE_ART,
    text: pick(scavengeVariants)(location, hasScavenger),
    choices: [
      {
        label: 'Full search',
        detail: `Go in deep. Higher yield, higher risk.${hasScavenger ? ' Scavenger bonus.' : ''}`,
        effect: 'scavenge_full',
        color: 'amber',
      },
      {
        label: 'Quick grab',
        detail: 'In and out. Less loot, less danger.',
        effect: 'scavenge_quick',
        color: 'primary',
      },
      {
        label: 'Skip it',
        detail: 'Not worth the risk. Keep moving.',
        effect: 'scavenge_skip',
        color: 'primary',
      },
    ],
  };
}

export function generateAmbushEvent(state) {
  const alive = aliveSurvivors(state.survivors);
  if (alive.length === 0) return null;

  const target = alive[Math.floor(Math.random() * alive.length)];

  return {
    type: 'ambush',
    title: 'AMBUSH',
    ascii: AMBUSH_ART,
    text: pick(ambushVariants)(target),
    targetId: target.id,
    choices: [
      {
        label: 'Stand and fight',
        detail: 'Use ammo. Protect everyone. [-5 AMMO]',
        effect: 'ambush_fight',
        cost: { ammo: 5 },
        color: 'danger',
      },
      {
        label: 'Run',
        detail: 'Drop everything and sprint. May lose supplies.',
        effect: 'ambush_run',
        color: 'amber',
      },
    ],
  };
}
