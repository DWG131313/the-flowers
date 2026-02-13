import { aliveSurvivors } from '../survivor.js';
import { hasItem, RARE_ITEMS } from '../items.js';

const MILITARY_ART = `
┌──────────────────────────────┐
│    ╔═══════════════════╗     │
│    ║  ▓▓▓  MILITARY  ▓▓▓ ║     │
│    ║  ▓▓▓  OUTPOST   ▓▓▓ ║     │
│    ╚═══════════════════╝     │
│      ░░░ DANGER ░░░          │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  HIGH RISK ZONE   ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

const HOSPITAL_ART = `
┌──────────────────────────────┐
│       ┌───┐                  │
│       │ + │  HOSPITAL        │
│       └───┘  WING B          │
│    ▓▓▓▓▓▓▓▓▓▓▓▓▓            │
│    ▓  QUARANTINE  ▓           │
│    ▓▓▓▓▓▓▓▓▓▓▓▓▓            │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  OVERRUN          ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

const BUNKER_ART = `
┌──────────────────────────────┐
│                              │
│    ╔══════════════╗          │
│    ║   ▼ BUNKER ▼  ║          │
│    ╚══════════════╝          │
│     ▓▓▓▓▓▓▓▓▓▓▓▓▓           │
│     ▓ SEALED DOOR ▓          │
│     ▓▓▓▓▓▓▓▓▓▓▓▓▓           │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  UNDERGROUND      ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

const HELICOPTER_ART = `
┌──────────────────────────────┐
│         __                   │
│     ___/  \\_____             │
│    |  CRASHED   |            │
│    |___________ |            │
│       / \\   / \\              │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  WRECKAGE         ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

const PHARMACY_ART = `
┌──────────────────────────────┐
│    ╔═════════════════╗       │
│    ║  Rx  PHARMACY   ║       │
│    ╚═════════════════╝       │
│    ▓▓▓ ALARM ACTIVE ▓▓▓     │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  FORTIFIED        ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

// Each generator picks a rare item not yet owned and creates a scenario around it.

function pickUnobtainedItem(state, candidates) {
  const available = candidates.filter(id => !hasItem(state, id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export function generateMilitaryOutpostEvent(state) {
  const alive = aliveSurvivors(state.survivors);
  if (alive.length < 2) return null;

  const itemId = pickUnobtainedItem(state, ['military_radio', 'weapons_cache', 'body_armor']);
  if (!itemId) return null;
  const item = RARE_ITEMS[itemId];

  const scout = alive[Math.floor(Math.random() * alive.length)];
  const hasCombat = alive.some(s => s.skill === 'combat');

  return {
    type: 'rare_military',
    title: 'MILITARY OUTPOST',
    ascii: MILITARY_ART,
    text: `${scout.name} spotted a National Guard checkpoint half a mile east. Overrun — but the barricades are still up. Could be supplies inside. Could be a deathtrap. ${hasCombat ? 'Your combat specialist knows how to clear rooms.' : 'Nobody here has military training.'} Through the window, something glints: ${item.desc.toLowerCase()}`,
    targetId: scout.id,
    rareItemId: itemId,
    choices: [
      {
        label: 'Breach and clear',
        detail: `Send a team in. Heavy risk. ${hasCombat ? 'Combat specialist improves odds.' : 'No specialist — dangerous.'} [-8 AMMO]`,
        effect: 'rare_military_breach',
        cost: { ammo: 8 },
        color: 'danger',
      },
      {
        label: 'Scout first, then decide',
        detail: 'Send one person to check windows. Slower but safer. [-3 AMMO]',
        effect: 'rare_military_scout',
        cost: { ammo: 3 },
        color: 'amber',
      },
      {
        label: 'Too dangerous — move on',
        detail: 'Not worth the lives.',
        effect: 'rare_military_skip',
        color: 'primary',
      },
    ],
  };
}

export function generateHospitalEvent(state) {
  const alive = aliveSurvivors(state.survivors);
  if (alive.length < 2) return null;

  const itemId = pickUnobtainedItem(state, ['antibiotics', 'med_kit']);
  if (!itemId) return null;
  const item = RARE_ITEMS[itemId];

  const hasMedic = alive.some(s => s.skill === 'medical');

  return {
    type: 'rare_hospital',
    title: 'HOSPITAL WING',
    ascii: HOSPITAL_ART,
    text: `The east wing of County General. Most of it is gone — collapsed, burned, or worse. But Wing B's quarantine section might still be sealed. ${hasMedic ? 'Your medic knows which cabinets to check.' : 'Nobody here knows a scalpel from a suture.'} Behind the glass: ${item.name.toLowerCase()}.`,
    rareItemId: itemId,
    choices: [
      {
        label: 'Go through quarantine',
        detail: `Break the seal. Risk infection. ${hasMedic ? 'Medic reduces infection risk.' : 'High infection risk.'} [-5 MEDICINE]`,
        effect: 'rare_hospital_enter',
        cost: { medicine: 5 },
        color: 'danger',
      },
      {
        label: 'Search the lobby only',
        detail: 'Stay out of quarantine. Smaller haul, less risk.',
        effect: 'rare_hospital_lobby',
        color: 'amber',
      },
      {
        label: 'Leave it sealed',
        detail: 'What\'s locked away should stay locked.',
        effect: 'rare_hospital_skip',
        color: 'primary',
      },
    ],
  };
}

export function generateBunkerEvent(state) {
  const alive = aliveSurvivors(state.survivors);
  if (alive.length < 2) return null;

  const itemId = pickUnobtainedItem(state, ['generator', 'water_purifier']);
  if (!itemId) return null;
  const item = RARE_ITEMS[itemId];

  const hasCrafter = alive.some(s => s.skill === 'craft');

  return {
    type: 'rare_bunker',
    title: 'SEALED BUNKER',
    ascii: BUNKER_ART,
    text: `A hatch in the ground behind a strip mall. Heavy steel. Padlocked. Someone built this before things went bad. The lock is rusted but the hatch is intact. ${hasCrafter ? 'Your crafter thinks they can pick it.' : 'Brute force or nothing.'} You can hear a low hum inside. ${item.desc}`,
    rareItemId: itemId,
    choices: [
      {
        label: 'Force the hatch open',
        detail: 'Loud. Will attract attention. Could be trapped inside.',
        effect: 'rare_bunker_force',
        color: 'danger',
      },
      {
        label: hasCrafter ? 'Pick the lock' : 'Try to pry it carefully',
        detail: hasCrafter ? 'Quiet. Takes time. Craft skill makes this viable.' : 'Slow and uncertain without a crafter.',
        effect: 'rare_bunker_careful',
        color: 'amber',
      },
      {
        label: 'Mark it and move on',
        detail: 'Maybe come back later. (You won\'t.)',
        effect: 'rare_bunker_skip',
        color: 'primary',
      },
    ],
  };
}

export function generateCrashSiteEvent(state) {
  const alive = aliveSurvivors(state.survivors);
  if (alive.length < 2) return null;

  const itemId = pickUnobtainedItem(state, ['flare_gun', 'military_radio', 'body_armor']);
  if (!itemId) return null;
  const item = RARE_ITEMS[itemId];

  return {
    type: 'rare_crash',
    title: 'HELICOPTER WRECKAGE',
    ascii: HELICOPTER_ART,
    text: `A military helicopter, nose-down in a field. Rotors bent, cabin crushed. Pilot's dead — days old. But the cargo compartment is mostly intact. You can see a ${item.name.toLowerCase()} wedged in the wreckage. The fuel is leaking. One spark and it all goes up.`,
    rareItemId: itemId,
    choices: [
      {
        label: 'Go in fast',
        detail: 'Grab it and run. If the fuel catches, someone burns.',
        effect: 'rare_crash_fast',
        color: 'danger',
      },
      {
        label: 'Drain the fuel first',
        detail: 'Slow. Safe. But walkers could arrive while you work.',
        effect: 'rare_crash_careful',
        color: 'amber',
      },
      {
        label: 'Not worth the risk',
        detail: 'One spark. That\'s all it takes.',
        effect: 'rare_crash_skip',
        color: 'primary',
      },
    ],
  };
}

export function generatePharmacyEvent(state) {
  const alive = aliveSurvivors(state.survivors);
  if (alive.length < 2) return null;

  const itemId = pickUnobtainedItem(state, ['antibiotics', 'med_kit']);
  if (!itemId) return null;
  const item = RARE_ITEMS[itemId];

  return {
    type: 'rare_pharmacy',
    title: 'FORTIFIED PHARMACY',
    ascii: PHARMACY_ART,
    text: `Someone barricaded this place from the inside. Steel shutters, alarm system still beeping on battery backup. But you can see through the gap — shelves still stocked. ${item.name} sitting right there on the counter. The alarm will draw every walker in a mile.`,
    rareItemId: itemId,
    choices: [
      {
        label: 'Smash in — take everything',
        detail: 'The alarm goes off. You have 60 seconds before they come. [-5 AMMO]',
        effect: 'rare_pharmacy_smash',
        cost: { ammo: 5 },
        color: 'danger',
      },
      {
        label: 'Cut the alarm first',
        detail: 'Requires skill. Quiet entry if it works. If it doesn\'t — alarm anyway.',
        effect: 'rare_pharmacy_stealth',
        color: 'amber',
      },
      {
        label: 'Walk away',
        detail: 'That alarm is a dinner bell.',
        effect: 'rare_pharmacy_skip',
        color: 'primary',
      },
    ],
  };
}
