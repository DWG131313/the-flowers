import { aliveSurvivors } from '../survivor.js';

function pickSurvivorWithEmptySlot(state, slot) {
  const alive = aliveSurvivors(state.survivors);
  const candidates = alive.filter(s => s[slot] === null || s[slot] === undefined);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// === ARMORY BREACH ===
export function generateArmoryBreachEvent(state) {
  const target = pickSurvivorWithEmptySlot(state, 'weapon');
  if (!target) return null;
  const pool = ['fire_axe', 'shotgun', 'crossbow'];
  const itemId = pool[Math.floor(Math.random() * pool.length)];

  return {
    title: 'ARMORY BREACH',
    text: `${target.name} found a locked National Guard armory. The door is reinforced, but there's gear inside. Walkers are circling the building.`,
    targetId: target.id,
    lootItemId: itemId,
    choices: [
      { label: 'Breach the door (risky, -5 ammo)', effect: 'loot_armory_breach' },
      { label: 'Find a side entrance (cautious)', effect: 'loot_armory_cautious' },
      { label: 'Too dangerous — move on', effect: 'loot_armory_skip' },
    ],
  };
}

// === HUNTING LODGE ===
export function generateHuntingLodgeEvent(state) {
  const target = pickSurvivorWithEmptySlot(state, 'weapon');
  if (!target) return null;
  const pool = ['hunting_knife', 'crossbow', 'nail_bat', 'machete'];
  const itemId = pool[Math.floor(Math.random() * pool.length)];

  return {
    title: 'HUNTING LODGE',
    text: `A boarded-up hunting lodge on the ridge. ${target.name} spotted gear through a cracked window. Fresh deer tracks nearby — could mean food too.`,
    targetId: target.id,
    lootItemId: itemId,
    choices: [
      { label: 'Clear the lodge (moderate risk)', effect: 'loot_lodge_clear' },
      { label: 'Sneak through the back (cautious)', effect: 'loot_lodge_sneak' },
      { label: 'Keep moving', effect: 'loot_lodge_skip' },
    ],
  };
}

// === POLICE STATION (LOCKER ROOM) ===
export function generatePoliceStationEvent(state) {
  const target = pickSurvivorWithEmptySlot(state, 'armor');
  if (!target) return null;
  const pool = ['riot_shield', 'combat_vest', 'leather_jacket'];
  const itemId = pool[Math.floor(Math.random() * pool.length)];

  return {
    title: 'LOCKER ROOM',
    text: `An abandoned precinct. The locker room still has gear. ${target.name} heard something in the booking area — might be a turned officer.`,
    targetId: target.id,
    lootItemId: itemId,
    choices: [
      { label: 'Rush the locker room', effect: 'loot_police_rush' },
      { label: 'Clear the building first', effect: 'loot_police_careful' },
      { label: 'Not worth the risk', effect: 'loot_police_skip' },
    ],
  };
}

// === FIELD HOSPITAL ===
export function generateFieldHospitalEvent(state) {
  const target = pickSurvivorWithEmptySlot(state, 'armor');
  if (!target) return null;
  const pool = ['medic_pouch', 'gas_mask', 'hiking_boots', 'lucky_charm'];
  const itemId = pool[Math.floor(Math.random() * pool.length)];

  return {
    title: 'FIELD HOSPITAL',
    text: `A FEMA field hospital, half-collapsed. ${target.name} can see supply crates inside. The quarantine tape is still up — infection risk.`,
    targetId: target.id,
    lootItemId: itemId,
    choices: [
      { label: 'Go in with masks (moderate risk)', effect: 'loot_hospital_enter' },
      { label: 'Search the perimeter only', effect: 'loot_hospital_perimeter' },
      { label: 'Avoid the quarantine zone', effect: 'loot_hospital_skip' },
    ],
  };
}
