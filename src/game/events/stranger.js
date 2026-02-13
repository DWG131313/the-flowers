import { aliveSurvivors } from '../survivor.js';
import { NAMES, SKILLS } from '../constants.js';

const STRANGER_ART = `
┌──────────────────────────────┐
│                              │
│       ◯                      │
│      /|\\   WHO ARE YOU?      │
│      / \\   WHERE DID YOU     │
│            COME FROM?        │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  UNKNOWN          ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

const TRADER_ART = `
┌──────────────────────────────┐
│                              │
│    ┌─────┐  ┌─────┐         │
│    │ $$$ │  │ ??? │         │
│    └─────┘  └─────┘         │
│       ◯ ←→ ◯                │
│      /|\\   /|\\               │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  TRADE            ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

const INFIGHT_ART = `
┌──────────────────────────────┐
│                              │
│       ◯   ◯                  │
│      /|\\X/|\\                 │
│      / \\ / \\                 │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  CONFLICT         ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

const SHELTER_ART = `
┌──────────────────────────────┐
│                              │
│    ╔══════════════╗          │
│    ║  ▓▓ SAFE ▓▓  ║          │
│    ║  ▓▓ HOUSE ▓▓ ║          │
│    ╚══════════════╝          │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  SHELTER          ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

const NIGHT_ART = `
┌──────────────────────────────┐
│    ☾ ☾ ☾ ☾ ☾ ☾ ☾ ☾ ☾       │
│                              │
│     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓      │
│     ▓  THEY'RE COMING  ▓     │
│     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓      │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  NIGHT HORDE      ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

const BACKSTORIES = [
  { intro: 'Says they were a nurse before all this.', skill: 'medical', trust: 60 },
  { intro: 'Carrying a rifle. Knows how to hold it.', skill: 'combat', trust: 40 },
  { intro: 'Thin. Quick eyes. Keeps looking at your supplies.', skill: 'scavenge', trust: 30 },
  { intro: 'Calm. Quiet. Says they led a group once. Lost them.', skill: 'leadership', trust: 55 },
  { intro: 'Has a toolbelt and steady hands.', skill: 'craft', trust: 50 },
];

export function generateStrangerEvent(state) {
  const alive = aliveSurvivors(state.survivors);
  if (alive.length < 2) return null;

  const usedNames = state.survivors.map(s => s.name);
  const available = NAMES.filter(n => !usedNames.includes(n));
  if (available.length === 0) return null;

  const name = available[Math.floor(Math.random() * available.length)];
  const back = BACKSTORIES[Math.floor(Math.random() * BACKSTORIES.length)];
  const age = 20 + Math.floor(Math.random() * 35);
  const isSuspicious = Math.random() < 0.25;

  return {
    type: 'stranger',
    title: 'STRANGER APPROACHING',
    ascii: STRANGER_ART,
    text: `Someone on the road. Alone. Hands up. "${name}," they say. Age ${age}, maybe. ${back.intro}${isSuspicious ? ' Something feels wrong — but you can\'t place it.' : ''} They want in.`,
    strangerData: { name, age, skill: back.skill, trust: back.trust, suspicious: isSuspicious },
    choices: [
      {
        label: `Take ${name} in`,
        detail: `Another survivor. Another mouth. ${back.skill} skill.`,
        effect: 'stranger_accept',
        color: 'amber',
      },
      {
        label: 'Test them first',
        detail: 'Bite check. Questions. Earn your place.',
        effect: 'stranger_test',
        color: 'primary',
      },
      {
        label: 'Turn them away',
        detail: 'Can\'t trust anyone. Not anymore.',
        effect: 'stranger_reject',
        color: 'danger',
      },
    ],
  };
}

export function generateTraderEvent(state) {
  const alive = aliveSurvivors(state.survivors);
  if (alive.length < 2) return null;

  // Offer trades based on what the player has most/least of
  const offers = [];
  if (state.food > 30 && state.medicine < 15) {
    offers.push({ give: 'food', giveAmt: 15, get: 'medicine', getAmt: 10, label: '15 food for 10 medicine' });
  }
  if (state.food > 30 && state.ammo < 15) {
    offers.push({ give: 'food', giveAmt: 12, get: 'ammo', getAmt: 10, label: '12 food for 10 ammo' });
  }
  if (state.ammo > 25 && state.medicine < 15) {
    offers.push({ give: 'ammo', giveAmt: 10, get: 'medicine', getAmt: 8, label: '10 ammo for 8 medicine' });
  }
  if (state.ammo > 25 && state.food < 25) {
    offers.push({ give: 'ammo', giveAmt: 8, get: 'food', getAmt: 15, label: '8 ammo for 15 food' });
  }
  if (state.medicine > 20 && state.food < 25) {
    offers.push({ give: 'medicine', giveAmt: 8, get: 'food', getAmt: 18, label: '8 medicine for 18 food' });
  }
  if (state.medicine > 20 && state.ammo < 15) {
    offers.push({ give: 'medicine', giveAmt: 6, get: 'ammo', getAmt: 12, label: '6 medicine for 12 ammo' });
  }

  if (offers.length === 0) return null;

  const offer = offers[Math.floor(Math.random() * offers.length)];

  return {
    type: 'trader',
    title: 'TRADER ON THE ROAD',
    ascii: TRADER_ART,
    text: `A pair of survivors with a cart. Armed, but not aggressive. They're traders — barter only, no charity. They're offering ${offer.label}. Fair deal, or as fair as deals get now.`,
    tradeOffer: offer,
    choices: [
      {
        label: 'Accept the trade',
        detail: `Give ${offer.giveAmt} ${offer.give}, get ${offer.getAmt} ${offer.get}.`,
        effect: 'trader_accept',
        cost: { [offer.give]: offer.giveAmt },
        color: 'amber',
      },
      {
        label: 'Try to rob them',
        detail: 'Take it all. They might fight back. [-3 AMMO]',
        effect: 'trader_rob',
        cost: { ammo: 3 },
        color: 'danger',
      },
      {
        label: 'Decline',
        detail: 'Wave them on. Keep what you have.',
        effect: 'trader_decline',
        color: 'primary',
      },
    ],
  };
}

export function generateInfightEvent(state) {
  const alive = aliveSurvivors(state.survivors).filter(s => !s.quarantined);
  if (alive.length < 3) return null;

  // Pick two survivors with different trust levels
  const sorted = [...alive].sort((a, b) => a.trust - b.trust);
  const aggressor = sorted[0];
  const defender = sorted[sorted.length - 1];
  if (aggressor.id === defender.id) return null;

  const hasLeader = alive.some(s => s.skill === 'leadership');

  return {
    type: 'infight',
    title: 'INTERNAL CONFLICT',
    ascii: INFIGHT_ART,
    text: `${aggressor.name} and ${defender.name} are in each other's faces. A shove. Then a fist. ${aggressor.name} says the rules aren't fair — ${defender.name} says rules are all they have. ${hasLeader ? 'Your leadership specialist is trying to get between them.' : 'Nobody\'s stepping in.'}`,
    aggressorId: aggressor.id,
    defenderId: defender.id,
    choices: [
      {
        label: `Side with ${defender.name}`,
        detail: 'The rules hold. Order matters.',
        effect: 'infight_side_defender',
        color: 'amber',
      },
      {
        label: `Side with ${aggressor.name}`,
        detail: 'Maybe the rules need bending.',
        effect: 'infight_side_aggressor',
        color: 'amber',
      },
      {
        label: 'Break it up — no sides',
        detail: `${hasLeader ? 'Your leader can mediate.' : 'Talk them both down.'} Everyone loses a little.`,
        effect: 'infight_mediate',
        color: 'primary',
      },
    ],
  };
}

export function generateShelterEvent(state) {
  return {
    type: 'shelter',
    title: 'SHELTER FOUND',
    ascii: SHELTER_ART,
    text: `An intact house. Doors locked, windows boarded from the inside. Someone was here — recently. Food in the pantry. Beds. A roof. Your group hasn't slept under a real roof in days. But staying means not moving. And something scratches behind the basement door.`,
    choices: [
      {
        label: 'Stay the night',
        detail: 'Rest. Heal. Eat well. But investigate that basement.',
        effect: 'shelter_stay',
        color: 'amber',
      },
      {
        label: 'Raid the pantry and go',
        detail: 'Take what you can carry. Don\'t open the basement.',
        effect: 'shelter_raid',
        color: 'primary',
      },
      {
        label: 'It\'s a trap — keep moving',
        detail: 'Too perfect. Something\'s wrong.',
        effect: 'shelter_skip',
        color: 'danger',
      },
    ],
  };
}

export function generateNightHordeEvent(state) {
  const alive = aliveSurvivors(state.survivors);
  if (alive.length < 2) return null;
  if (state.phase !== 2) return null; // Only at Dusk

  const hasCombat = alive.some(s => s.skill === 'combat');

  return {
    type: 'night_horde',
    title: 'NIGHT HORDE',
    ascii: NIGHT_ART,
    text: `You hear them before you see them. Dozens. A wall of dead shuffling through the dark. They haven't seen you yet, but the wind is shifting. ${hasCombat ? 'Your combat specialist is already counting ammunition.' : 'Nobody here is a soldier.'} There\'s a ravine to the south. Narrow, steep.`,
    choices: [
      {
        label: 'Fortify and fight',
        detail: `Stand your ground. Every bullet counts. [-10 AMMO]`,
        effect: 'horde_fight',
        cost: { ammo: 10 },
        color: 'danger',
      },
      {
        label: 'Use the ravine',
        detail: 'Scramble down in the dark. Someone might fall.',
        effect: 'horde_ravine',
        color: 'amber',
      },
      {
        label: 'Create a distraction',
        detail: 'Start a fire to the north. Burn supplies to draw them away. [-8 FOOD]',
        effect: 'horde_distract',
        cost: { food: 8 },
        color: 'amber',
      },
    ],
  };
}
