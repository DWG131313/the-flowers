import { aliveSurvivors } from './survivor.js';
import { LOW_FOOD_THRESHOLD, DEFECTION_MORALE_THRESHOLD } from './constants.js';
import { generateBiteCheckEvent } from './events/biteCheck.js';
import { generatePregnancyEvent } from './events/pregnancy.js';
import { generateChildEvent } from './events/children.js';
import { generateFightRefusalEvent } from './events/fightRefusal.js';
import { generateDefectionEvent } from './events/defection.js';
import { generatePetProblemEvent, generatePetFoodEvent } from './events/pets.js';
import { generateBodiesEvent } from './events/bodies.js';
import { generateInjuryEvent } from './events/injury.js';
import { generateIllnessEvent } from './events/illness.js';
import { generateScavengeEvent, generateAmbushEvent } from './events/scavenge.js';
import {
  generateMilitaryOutpostEvent,
  generateHospitalEvent,
  generateBunkerEvent,
  generateCrashSiteEvent,
  generatePharmacyEvent,
} from './events/rareFinds.js';
import {
  generateStrangerEvent,
  generateTraderEvent,
  generateInfightEvent,
  generateShelterEvent,
  generateNightHordeEvent,
} from './events/stranger.js';
import {
  generateArmoryBreachEvent,
  generateHuntingLodgeEvent,
  generatePoliceStationEvent,
  generateFieldHospitalEvent,
} from './events/lootEvents.js';

const EVENT_GENERATORS = [
  { key: 'bite_check', gen: generateBiteCheckEvent, baseWeight: 18 },
  { key: 'pregnancy', gen: generatePregnancyEvent, baseWeight: 3 },
  { key: 'child', gen: generateChildEvent, baseWeight: 4 },
  { key: 'fight_refusal', gen: generateFightRefusalEvent, baseWeight: 7 },
  { key: 'defection', gen: generateDefectionEvent, baseWeight: 5 },
  { key: 'pet_problem', gen: generatePetProblemEvent, baseWeight: 5 },
  { key: 'pet_food', gen: generatePetFoodEvent, baseWeight: 7 },
  { key: 'bodies', gen: generateBodiesEvent, baseWeight: 10 },
  { key: 'injury', gen: generateInjuryEvent, baseWeight: 9 },
  { key: 'illness', gen: generateIllnessEvent, baseWeight: 9 },
  { key: 'scavenge', gen: generateScavengeEvent, baseWeight: 16 },
  { key: 'ambush', gen: generateAmbushEvent, baseWeight: 7 },
  // New events
  { key: 'stranger', gen: generateStrangerEvent, baseWeight: 6 },
  { key: 'trader', gen: generateTraderEvent, baseWeight: 5 },
  { key: 'infight', gen: generateInfightEvent, baseWeight: 6 },
  { key: 'shelter', gen: generateShelterEvent, baseWeight: 4 },
  { key: 'night_horde', gen: generateNightHordeEvent, baseWeight: 3 },
  // Rare finds
  { key: 'rare_military', gen: generateMilitaryOutpostEvent, baseWeight: 3 },
  { key: 'rare_hospital', gen: generateHospitalEvent, baseWeight: 3 },
  { key: 'rare_bunker', gen: generateBunkerEvent, baseWeight: 3 },
  { key: 'rare_crash', gen: generateCrashSiteEvent, baseWeight: 2 },
  { key: 'rare_pharmacy', gen: generatePharmacyEvent, baseWeight: 3 },
  // Loot events — equipment drops
  { key: 'loot_armory', gen: generateArmoryBreachEvent, baseWeight: 3 },
  { key: 'loot_lodge', gen: generateHuntingLodgeEvent, baseWeight: 3 },
  { key: 'loot_police', gen: generatePoliceStationEvent, baseWeight: 3 },
  { key: 'loot_hospital', gen: generateFieldHospitalEvent, baseWeight: 3 },
];

let recentEvents = [];

function getWeight(entry, state) {
  let w = entry.baseWeight;
  const alive = aliveSurvivors(state.survivors);

  // Boost weights based on state
  if (entry.key === 'scavenge' && state.food < LOW_FOOD_THRESHOLD) w += 15;
  if (entry.key === 'pet_food' && state.food < LOW_FOOD_THRESHOLD) w += 12;
  if (entry.key === 'defection') {
    const lowMorale = alive.filter(s => s.morale < DEFECTION_MORALE_THRESHOLD);
    if (lowMorale.length > 0) w += 10;
    else w = 0;
  }
  if (entry.key === 'bite_check' && alive.length > 6) w += 5;
  if (entry.key === 'ambush' && state.day > 10) w += 5;
  if (entry.key === 'night_horde' && state.day > 15) w += 3;
  if (entry.key === 'infight' && state.groupMorale < 40) w += 5;
  if (entry.key === 'trader' && state.day > 5) w += 3;
  if (entry.key === 'stranger' && alive.length < 6) w += 4;

  // Rare finds become slightly more common mid-game
  if (entry.key.startsWith('rare_') && state.day > 7) w += 2;
  if (entry.key.startsWith('rare_') && state.day > 15) w += 2;

  // Loot events — appear after day 5, shared cooldown
  if (entry.key.startsWith('loot_') && state.day <= 5) w = 0;
  if (entry.key.startsWith('loot_') && state.day > 5) w += 2;

  // Cooldowns
  if (entry.key === 'pregnancy' && recentEvents.slice(-8).includes('pregnancy')) w = 0;
  if (entry.key === 'child' && recentEvents.slice(-6).includes('child')) w = 0;
  if (entry.key === 'stranger' && recentEvents.slice(-5).includes('stranger')) w = 0;
  if (entry.key === 'trader' && recentEvents.slice(-6).includes('trader')) w = 0;
  if (entry.key === 'shelter' && recentEvents.slice(-8).includes('shelter')) w = 0;
  if (entry.key === 'night_horde' && recentEvents.slice(-6).includes('night_horde')) w = 0;
  if (entry.key.startsWith('rare_') && recentEvents.slice(-4).some(e => e.startsWith('rare_'))) w = 0;
  if (entry.key.startsWith('loot_') && recentEvents.slice(-5).some(e => e.startsWith('loot_'))) w = 0;

  // Avoid back-to-back
  if (recentEvents.length > 0 && recentEvents[recentEvents.length - 1] === entry.key) {
    w = Math.floor(w * 0.2);
  }

  return w;
}

export function generateEvent(state) {
  const weighted = EVENT_GENERATORS.map(entry => ({
    ...entry,
    weight: getWeight(entry, state),
  })).filter(e => e.weight > 0);

  const totalWeight = weighted.reduce((sum, e) => sum + e.weight, 0);
  if (totalWeight === 0) {
    return generateScavengeEvent(state);
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    let roll = Math.random() * totalWeight;
    for (const entry of weighted) {
      roll -= entry.weight;
      if (roll <= 0) {
        const event = entry.gen(state);
        if (event) {
          recentEvents.push(entry.key);
          if (recentEvents.length > 8) recentEvents.shift();
          return event;
        }
        break;
      }
    }
  }

  const fallback = generateScavengeEvent(state) || generateBodiesEvent(state);
  recentEvents.push('scavenge');
  return fallback;
}

export function resetEventHistory() {
  recentEvents = [];
}
