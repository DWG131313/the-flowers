import { aliveSurvivors, cloneState, generateSurvivor } from './survivor.js';
import {
  AMMO_COST_BURN,
  CONVINCE_SUCCESS_RATE,
  PET_FOOD_GAINED,
} from './constants.js';
import { addItem, hasItem, removeItem, RARE_ITEMS } from './items.js';
import { equipItem, ALL_EQUIPMENT, getEquipmentBonus } from './equipment.js';

function findTarget(state, event) {
  return state.survivors.find(s => s.id === event.targetId);
}

function reduceDamage(survivor, baseDmg) {
  const reduction = getEquipmentBonus(survivor, 'damageMinus');
  return Math.max(1, baseDmg - reduction);
}

function groupWeaponBonus(state) {
  const alive = aliveSurvivors(state.survivors);
  let total = 0;
  alive.forEach(s => { total += getEquipmentBonus(s, 'damagePlus'); });
  return total;
}

function killSurvivor(state, survivor, cause) {
  survivor.alive = false;
  survivor.health = 0;
  survivor.causeOfDeath = cause;
  survivor.deathDay = state.day;
  state.log.push(`☠ ${survivor.name} is dead. ${cause}`);
}

function exileSurvivor(state, survivor, reason) {
  survivor.alive = false;
  survivor.causeOfDeath = `Exiled: ${reason}`;
  survivor.deathDay = state.day;
  state.log.push(`→ ${survivor.name} was exiled. ${reason}`);
}

function adjustGroupMorale(state, amount) {
  aliveSurvivors(state.survivors).forEach(s => {
    s.morale = Math.max(0, Math.min(100, s.morale + amount));
  });
}

function adjustGroupTrust(state, amount) {
  aliveSurvivors(state.survivors).forEach(s => {
    s.trust = Math.max(0, Math.min(100, s.trust + amount));
  });
}

export function applyChoice(state, event, effectKey) {
  const newState = cloneState(state);
  const target = event.targetId != null ? findTarget(newState, event) : null;
  const medicineCost = newState.settings?.medicineCost ?? 9;
  const ambushRisk = newState.settings?.ambushRisk ?? 0.25;
  const bodyLootInfectionRisk = newState.settings?.bodyLootInfectionRisk ?? 0.2;

  switch (effectKey) {
    // === BITE CHECK ===
    case 'bite_check_enforce': {
      if (target) {
        killSurvivor(newState, target, 'Executed for refusing bite check.');
        adjustGroupTrust(newState, 3);
        adjustGroupMorale(newState, -5);
        newState.log.push(`⚖ You enforced the rule. ${target.name} looked at the flowers.`);
      }
      break;
    }
    case 'bite_check_pressure': {
      if (target) {
        if (target.infected || target.hiding) {
          target.hiding = false;
          target.infected = true;
          target.infectedDay = target.infectedDay || newState.day;
          newState.log.push(`⚠ ${target.name} was pressured. A bite was found.`);
          adjustGroupMorale(newState, -3);
        } else {
          target.hiding = false;
          newState.log.push(`✓ ${target.name} was pressured into compliance. Clean.`);
          adjustGroupTrust(newState, 1);
        }
      }
      break;
    }
    case 'bite_check_slide': {
      adjustGroupTrust(newState, -5);
      adjustGroupMorale(newState, -2);
      if (target && target.infected) {
        newState.log.push(`⚠ You let ${target.name} slide. They're hiding something.`);
      } else {
        newState.log.push(`⚠ You let ${target.name} slide. Trust erodes.`);
      }
      break;
    }
    case 'bite_found_execute': {
      if (target) {
        killSurvivor(newState, target, 'Executed after bite discovered.');
        adjustGroupTrust(newState, 5);
        adjustGroupMorale(newState, -8);
        newState.log.push(`⚖ ${target.name} looked at the flowers.`);
      }
      break;
    }
    case 'bite_found_treat': {
      if (target) {
        newState.medicine = Math.max(0, newState.medicine - medicineCost);
        target.infected = true;
        target.infectedDay = newState.day;
        target.quarantined = true;
        target.infectionTreated = true;
        newState.log.push(`💉 ${target.name} is quarantined and treated. Medicine spent.`);
      }
      break;
    }
    case 'bite_found_wait': {
      if (target) {
        target.infected = true;
        target.infectedDay = newState.day;
        newState.log.push(`⏳ Watching ${target.name}. No treatment. Clock is ticking.`);
        adjustGroupMorale(newState, -3);
      }
      break;
    }

    // === PREGNANCY ===
    case 'pregnancy_exile': {
      if (target) {
        newState.food = Math.max(0, newState.food - 8);
        exileSurvivor(newState, target, 'Exiled due to pregnancy.');
        adjustGroupTrust(newState, 3);
        adjustGroupMorale(newState, -5);
      }
      break;
    }
    case 'pregnancy_keep': {
      if (target) {
        target.pregnant = true;
        adjustGroupTrust(newState, -5);
        adjustGroupMorale(newState, 3);
        newState.log.push(`♥ ${target.name} stays. The rule bends.`);
      }
      break;
    }
    case 'pregnancy_choice': {
      if (target) {
        if (Math.random() < 0.5) {
          exileSurvivor(newState, target, 'Left by choice — pregnant.');
          newState.log.push(`→ ${target.name} chose to leave.`);
        } else {
          target.pregnant = true;
          newState.log.push(`♥ ${target.name} chose to stay.`);
          adjustGroupMorale(newState, 1);
        }
      }
      break;
    }

    // === CHILDREN ===
    case 'child_execute': {
      adjustGroupMorale(newState, -15);
      adjustGroupTrust(newState, 5);
      newState.log.push(`⚖ The child looked at the flowers. The rule holds.`);
      break;
    }
    case 'child_take': {
      const nextId = Math.max(...newState.survivors.map(s => s.id)) + 1;
      const child = {
        id: nextId,
        name: event.childName,
        age: event.childAge,
        health: 40,
        morale: 30,
        trust: 80,
        skill: 'craft',
        hasPet: false,
        petType: null,
        alive: true,
        infected: false,
        infectedDay: null,
        infectionTreated: false,
        injured: false,
        injuredDay: null,
        injuredTreated: false,
        sick: false,
        sickDay: null,
        sickTreated: false,
        hiding: false,
        pregnant: false,
        quarantined: false,
        causeOfDeath: null,
        deathDay: null,
        weapon: null,
        armor: null,
      };
      newState.survivors.push(child);
      adjustGroupMorale(newState, 3);
      newState.log.push(`+ ${event.childName} joins the group.`);
      break;
    }
    case 'child_leave': {
      adjustGroupMorale(newState, -8);
      newState.log.push(`→ You walked away. Don't look back.`);
      break;
    }

    // === FIGHT REFUSAL ===
    case 'fight_exempt_medic': {
      if (target) {
        target.trust = Math.min(100, target.trust + 10);
        adjustGroupMorale(newState, 2);
        newState.log.push(`✓ ${target.name} exempted — medical skills needed.`);
      }
      break;
    }
    case 'fight_force_medic': {
      if (target) {
        target.morale = Math.max(0, target.morale - 20);
        target.trust = Math.max(0, target.trust - 15);
        adjustGroupMorale(newState, -5);
        newState.log.push(`⚠ ${target.name} forced to fight. They won't forget.`);
      }
      break;
    }
    case 'fight_exile': {
      if (target) {
        exileSurvivor(newState, target, 'Refused to fight.');
        adjustGroupTrust(newState, 3);
        adjustGroupMorale(newState, -3);
      }
      break;
    }
    case 'fight_train': {
      if (target) {
        target.morale = Math.max(0, target.morale - 5);
        newState.log.push(`⏳ ${target.name} starts combat training. Three days.`);
      }
      break;
    }
    case 'fight_reassign': {
      if (target) {
        target.skill = 'scavenge';
        newState.log.push(`✓ ${target.name} reassigned to scavenging.`);
      }
      break;
    }

    // === DEFECTION ===
    case 'defection_let_go': {
      if (target) {
        exileSurvivor(newState, target, 'Left the group.');
        adjustGroupMorale(newState, -3);
        newState.log.push(`→ ${target.name} walked away. The rule holds.`);
      }
      break;
    }
    case 'defection_convince': {
      if (target) {
        if (Math.random() < CONVINCE_SUCCESS_RATE) {
          target.morale = Math.min(100, target.morale + 15);
          newState.log.push(`✓ ${target.name} was convinced to stay.`);
        } else {
          exileSurvivor(newState, target, 'Left despite attempts to convince.');
          newState.log.push(`→ ${target.name} left anyway. Words weren't enough.`);
          adjustGroupMorale(newState, -5);
        }
      }
      break;
    }
    case 'defection_vote': {
      if (target) {
        const groupMorale = newState.groupMorale;
        const stayVote = groupMorale > 40 ? 0.6 : 0.35;
        if (Math.random() < stayVote) {
          target.morale = Math.min(100, target.morale + 10);
          adjustGroupMorale(newState, 2);
          newState.log.push(`✓ The group voted: ${target.name} stays.`);
        } else {
          exileSurvivor(newState, target, 'Voted out by the group.');
          newState.log.push(`→ The group voted: ${target.name} goes.`);
          adjustGroupMorale(newState, -2);
        }
      }
      break;
    }

    // === PETS ===
    case 'pet_remove': {
      if (target) {
        target.hasPet = false;
        target.petType = null;
        target.morale = Math.max(0, target.morale - 20);
        adjustGroupMorale(newState, 1);
        newState.log.push(`✕ ${target.name}'s pet was removed. They're devastated.`);
      }
      break;
    }
    case 'pet_warn': {
      adjustGroupMorale(newState, -2);
      adjustGroupTrust(newState, -2);
      newState.log.push(`⚠ Warning given. The pet stays — for now.`);
      break;
    }
    case 'pet_eat': {
      if (target) {
        newState.food += PET_FOOD_GAINED;
        target.hasPet = false;
        target.petType = null;
        target.morale = Math.max(0, target.morale - 25);
        adjustGroupMorale(newState, -5);
        newState.log.push(`✕ The pet was eaten. +${PET_FOOD_GAINED} food. ${target.name} won't speak.`);
      }
      break;
    }
    case 'pet_release': {
      if (target) {
        target.hasPet = false;
        target.petType = null;
        target.morale = Math.max(0, target.morale - 8);
        newState.log.push(`→ ${target.name}'s pet was released into the wild.`);
      }
      break;
    }
    case 'pet_keep_hungry': {
      adjustGroupMorale(newState, -3);
      newState.log.push(`⚠ The pet stays. Everyone's hungrier for it.`);
      break;
    }

    // === BODIES ===
    case 'bodies_burn': {
      newState.ammo = Math.max(0, newState.ammo - AMMO_COST_BURN);
      adjustGroupTrust(newState, 2);
      newState.log.push(`🔥 Bodies burned. The rule holds. -${AMMO_COST_BURN} ammo.`);
      // Small chance of attracting attention
      if (Math.random() < 0.15) {
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const unlucky = alive[Math.floor(Math.random() * alive.length)];
          unlucky.health = Math.max(0, unlucky.health - 10);
          newState.log.push(`⚠ The fire drew walkers. ${unlucky.name} took a hit.`);
        }
      }
      break;
    }
    case 'bodies_loot': {
      const foodGain = 3 + Math.floor(Math.random() * 5);
      newState.food += foodGain;
      newState.ammo = Math.max(0, newState.ammo - AMMO_COST_BURN);
      newState.log.push(`🔍 Looted +${foodGain} food, then burned. -${AMMO_COST_BURN} ammo.`);

      // Infection risk
      const alive = aliveSurvivors(newState.survivors);
      if (alive.length > 0 && Math.random() < bodyLootInfectionRisk) {
        const unlucky = alive[Math.floor(Math.random() * alive.length)];
        unlucky.sick = true;
        unlucky.sickDay = newState.day;
        newState.log.push(`⚠ ${unlucky.name} caught something from the bodies.`);
      }
      break;
    }
    case 'bodies_ignore': {
      adjustGroupTrust(newState, -4);
      newState.log.push(`→ Bodies left behind. Trust in the rules fades.`);
      break;
    }

    // === INJURY ===
    case 'injury_treat': {
      if (target) {
        newState.medicine = Math.max(0, newState.medicine - medicineCost);
        target.injured = true;
        target.injuredDay = newState.day;
        target.injuredTreated = true;
        target.quarantined = true;
        newState.log.push(`💉 ${target.name} treated. Three-day clock starts. -${medicineCost} medicine.`);
      }
      break;
    }
    case 'injury_wait': {
      if (target) {
        target.injured = true;
        target.injuredDay = newState.day;
        target.injuredTreated = false;
        target.quarantined = true;
        newState.log.push(`⏳ ${target.name} untreated. Three-day clock starts.`);
      }
      break;
    }
    case 'injury_execute': {
      if (target) {
        killSurvivor(newState, target, 'Executed — injury deemed fatal.');
        adjustGroupMorale(newState, -8);
        adjustGroupTrust(newState, 3);
        newState.log.push(`⚖ ${target.name} looked at the flowers.`);
      }
      break;
    }

    // === ILLNESS ===
    case 'illness_treat': {
      if (target) {
        newState.medicine = Math.max(0, newState.medicine - medicineCost);
        target.sick = true;
        target.sickDay = newState.day;
        target.sickTreated = true;
        target.quarantined = true;
        newState.log.push(`💉 ${target.name} quarantined and treated. -${medicineCost} medicine.`);
      }
      break;
    }
    case 'illness_quarantine': {
      if (target) {
        target.sick = true;
        target.sickDay = newState.day;
        target.sickTreated = false;
        target.quarantined = true;
        newState.log.push(`⏳ ${target.name} quarantined. No treatment. Three days.`);
      }
      break;
    }
    case 'illness_execute': {
      if (target) {
        killSurvivor(newState, target, 'Executed — illness feared contagious.');
        adjustGroupMorale(newState, -8);
        adjustGroupTrust(newState, 3);
        newState.log.push(`⚖ ${target.name} looked at the flowers.`);
      }
      break;
    }

    // === SCAVENGE ===
    case 'scavenge_full': {
      const hasScavenger = aliveSurvivors(newState.survivors).some(s => s.skill === 'scavenge');
      const baseFood = hasScavenger ? 12 : 8;
      const baseMed = hasScavenger ? 5 : 3;
      const baseAmmo = hasScavenger ? 4 : 2;

      const foodGain = baseFood + Math.floor(Math.random() * 5);
      const medGain = Math.floor(Math.random() * baseMed);
      const ammoGain = Math.floor(Math.random() * baseAmmo);

      newState.food += foodGain;
      newState.medicine += medGain;
      newState.ammo += ammoGain;
      newState.log.push(`🔍 Full search: +${foodGain} food, +${medGain} medicine, +${ammoGain} ammo.`);

      // Ambush risk
      if (Math.random() < ambushRisk) {
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const unlucky = alive[Math.floor(Math.random() * alive.length)];
          const dmg = reduceDamage(unlucky, 15 + Math.floor(Math.random() * 15));
          unlucky.health = Math.max(0, unlucky.health - dmg);
          newState.log.push(`⚠ Ambush during the search! ${unlucky.name} took ${dmg} damage.`);
          if (unlucky.health <= 0) {
            killSurvivor(newState, unlucky, 'Killed during supply run ambush.');
          }
        }
      }
      break;
    }
    case 'scavenge_quick': {
      const hasCrafter = aliveSurvivors(newState.survivors).some(s => s.skill === 'craft');
      const foodGain = 3 + Math.floor(Math.random() * 4) + (hasCrafter ? 2 : 0);
      newState.food += foodGain;
      const ammoGain = Math.random() < 0.3 ? 1 + Math.floor(Math.random() * 2) : 0;
      newState.ammo += ammoGain;
      const medGain = hasCrafter && Math.random() < 0.3 ? 2 : 0;
      newState.medicine += medGain;
      newState.log.push(`🔍 Quick grab: +${foodGain} food${ammoGain > 0 ? `, +${ammoGain} ammo` : ''}${medGain > 0 ? `, +${medGain} medicine (crafted)` : ''}.`);
      break;
    }
    case 'scavenge_skip': {
      newState.log.push(`→ Skipped the location. Kept moving.`);
      break;
    }

    // === AMBUSH ===
    case 'ambush_fight': {
      newState.ammo = Math.max(0, newState.ammo - 5);
      const hasCombat = aliveSurvivors(newState.survivors).some(s => s.skill === 'combat');
      const weaponEdge = Math.min(0.15, groupWeaponBonus(newState) * 0.01);
      if (hasCombat || Math.random() < (0.7 + weaponEdge)) {
        newState.log.push(`⚔ Fought off the ambush. -5 ammo.`);
        adjustGroupMorale(newState, 3);
      } else {
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const unlucky = alive[Math.floor(Math.random() * alive.length)];
          const dmg = reduceDamage(unlucky, 20 + Math.floor(Math.random() * 15));
          unlucky.health = Math.max(0, unlucky.health - dmg);
          newState.log.push(`⚔ Fought back but ${unlucky.name} took ${dmg} damage. -5 ammo.`);
          if (unlucky.health <= 0) {
            killSurvivor(newState, unlucky, 'Killed in ambush.');
          }
        }
      }
      break;
    }
    case 'ambush_run': {
      const foodLoss = 3 + Math.floor(Math.random() * 5);
      newState.food = Math.max(0, newState.food - foodLoss);
      newState.log.push(`→ Ran from the ambush. Lost ${foodLoss} food in the chaos.`);
      // Small chance someone gets hurt anyway
      if (Math.random() < 0.3) {
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const unlucky = alive[Math.floor(Math.random() * alive.length)];
          unlucky.health = Math.max(0, unlucky.health - 10);
          newState.log.push(`⚠ ${unlucky.name} tripped while running. -10 health.`);
        }
      }
      break;
    }

    // === RARE FINDS ===
    case 'rare_military_breach': {
      newState.ammo = Math.max(0, newState.ammo - 8);
      const hasCombat = aliveSurvivors(newState.survivors).some(s => s.skill === 'combat');
      const success = hasCombat ? Math.random() < 0.75 : Math.random() < 0.45;
      if (success) {
        addItem(newState, event.rareItemId);
        const item = RARE_ITEMS[event.rareItemId];
        newState.food += 8;
        newState.ammo += 5;
        newState.log.push(`★ Breach successful! Found ${item.name}. +8 food, +5 ammo.`);
        adjustGroupMorale(newState, 5);
        if (event.rareItemId === 'weapons_cache') newState.ammo += 25;
      } else {
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const unlucky = alive[Math.floor(Math.random() * alive.length)];
          const dmg = 25 + Math.floor(Math.random() * 20);
          unlucky.health = Math.max(0, unlucky.health - dmg);
          newState.log.push(`⚠ Breach failed. Walkers inside. ${unlucky.name} took ${dmg} damage.`);
          if (unlucky.health <= 0) killSurvivor(newState, unlucky, 'Killed breaching military outpost.');
        }
        adjustGroupMorale(newState, -5);
      }
      break;
    }
    case 'rare_military_scout': {
      newState.ammo = Math.max(0, newState.ammo - 3);
      if (Math.random() < 0.6) {
        addItem(newState, event.rareItemId);
        const item = RARE_ITEMS[event.rareItemId];
        newState.food += 5;
        newState.log.push(`★ Scout found a way in. Recovered ${item.name}. +5 food.`);
        adjustGroupMorale(newState, 3);
        if (event.rareItemId === 'weapons_cache') newState.ammo += 25;
      } else {
        newState.log.push(`→ Scout reported too many walkers. Pulled back. -3 ammo.`);
      }
      break;
    }
    case 'rare_military_skip': {
      newState.log.push(`→ Left the outpost. Too dangerous.`);
      break;
    }
    case 'rare_hospital_enter': {
      newState.medicine = Math.max(0, newState.medicine - 5);
      const hasMedic = aliveSurvivors(newState.survivors).some(s => s.skill === 'medical');
      const infectionRisk = hasMedic ? 0.1 : 0.3;
      addItem(newState, event.rareItemId);
      const item = RARE_ITEMS[event.rareItemId];
      newState.medicine += 12;
      newState.log.push(`★ Quarantine breached. Found ${item.name}. +12 medicine.`);
      adjustGroupMorale(newState, 4);
      // Infection risk
      if (Math.random() < infectionRisk) {
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const unlucky = alive[Math.floor(Math.random() * alive.length)];
          unlucky.sick = true;
          unlucky.sickDay = newState.day;
          newState.log.push(`⚠ ${unlucky.name} contracted something inside.`);
        }
      }
      break;
    }
    case 'rare_hospital_lobby': {
      const medGain = 5 + Math.floor(Math.random() * 4);
      newState.medicine += medGain;
      newState.log.push(`🔍 Searched the lobby. +${medGain} medicine. Quarantine stays sealed.`);
      break;
    }
    case 'rare_hospital_skip': {
      newState.log.push(`→ Left the hospital. Some doors should stay closed.`);
      break;
    }
    case 'rare_bunker_force': {
      if (Math.random() < 0.55) {
        addItem(newState, event.rareItemId);
        const item = RARE_ITEMS[event.rareItemId];
        newState.food += 10;
        newState.log.push(`★ Hatch forced open. Found ${item.name}. +10 food.`);
        adjustGroupMorale(newState, 5);
      } else {
        // Noise attracted walkers
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const unlucky = alive[Math.floor(Math.random() * alive.length)];
          unlucky.health = Math.max(0, unlucky.health - 20);
          newState.log.push(`⚠ The noise brought them. ${unlucky.name} took 20 damage. Hatch jammed.`);
          if (unlucky.health <= 0) killSurvivor(newState, unlucky, 'Killed at the bunker entrance.');
        }
      }
      break;
    }
    case 'rare_bunker_careful': {
      const hasCrafter = aliveSurvivors(newState.survivors).some(s => s.skill === 'craft');
      const success = hasCrafter ? Math.random() < 0.8 : Math.random() < 0.4;
      if (success) {
        addItem(newState, event.rareItemId);
        const item = RARE_ITEMS[event.rareItemId];
        newState.food += 10;
        newState.log.push(`★ ${hasCrafter ? 'Lock picked.' : 'Got lucky.'} Found ${item.name}. +10 food.`);
        adjustGroupMorale(newState, 5);
      } else {
        newState.log.push(`→ ${hasCrafter ? 'Lock wouldn\'t budge.' : 'Couldn\'t open it.'} Wasted time.`);
        adjustGroupMorale(newState, -2);
      }
      break;
    }
    case 'rare_bunker_skip': {
      newState.log.push(`→ Marked the bunker. Moved on.`);
      break;
    }
    case 'rare_crash_fast': {
      if (Math.random() < 0.6) {
        addItem(newState, event.rareItemId);
        const item = RARE_ITEMS[event.rareItemId];
        newState.log.push(`★ Grabbed the ${item.name} and ran. Heart pounding.`);
        adjustGroupMorale(newState, 4);
        if (event.rareItemId === 'body_armor') {
          newState.log.push(`  Kevlar vest secured.`);
        }
      } else {
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const unlucky = alive[Math.floor(Math.random() * alive.length)];
          const dmg = 20 + Math.floor(Math.random() * 20);
          unlucky.health = Math.max(0, unlucky.health - dmg);
          newState.log.push(`⚠ Fuel ignited! ${unlucky.name} caught in the blast. -${dmg} health.`);
          if (unlucky.health <= 0) killSurvivor(newState, unlucky, 'Killed in helicopter explosion.');
        }
        adjustGroupMorale(newState, -5);
      }
      break;
    }
    case 'rare_crash_careful': {
      if (Math.random() < 0.7) {
        addItem(newState, event.rareItemId);
        const item = RARE_ITEMS[event.rareItemId];
        newState.log.push(`★ Fuel drained safely. Recovered ${item.name}.`);
        adjustGroupMorale(newState, 4);
      } else {
        newState.log.push(`⚠ Walkers arrived while draining fuel. Had to abort.`);
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const unlucky = alive[Math.floor(Math.random() * alive.length)];
          unlucky.health = Math.max(0, unlucky.health - 10);
          newState.log.push(`  ${unlucky.name} got clipped escaping. -10 health.`);
        }
      }
      break;
    }
    case 'rare_crash_skip': {
      newState.log.push(`→ Left the wreckage. Not worth one spark.`);
      break;
    }
    case 'rare_pharmacy_smash': {
      newState.ammo = Math.max(0, newState.ammo - 5);
      addItem(newState, event.rareItemId);
      const item = RARE_ITEMS[event.rareItemId];
      newState.medicine += 15;
      newState.log.push(`★ Smashed in. Alarm screaming. Grabbed ${item.name} and ran. +15 medicine.`);
      // Alarm draws walkers — someone may get hurt
      if (Math.random() < 0.4) {
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const unlucky = alive[Math.floor(Math.random() * alive.length)];
          const dmg = 15 + Math.floor(Math.random() * 10);
          unlucky.health = Math.max(0, unlucky.health - dmg);
          newState.log.push(`⚠ Walkers caught up. ${unlucky.name} took ${dmg} damage.`);
          if (unlucky.health <= 0) killSurvivor(newState, unlucky, 'Killed by walkers at pharmacy.');
        }
      }
      adjustGroupMorale(newState, 3);
      break;
    }
    case 'rare_pharmacy_stealth': {
      const hasCrafter = aliveSurvivors(newState.survivors).some(s => s.skill === 'craft');
      const hasMedic = aliveSurvivors(newState.survivors).some(s => s.skill === 'medical');
      const success = (hasCrafter || hasMedic) ? Math.random() < 0.65 : Math.random() < 0.35;
      if (success) {
        addItem(newState, event.rareItemId);
        const item = RARE_ITEMS[event.rareItemId];
        newState.medicine += 15;
        newState.log.push(`★ Alarm disabled. Silent entry. ${item.name} secured. +15 medicine.`);
        adjustGroupMorale(newState, 5);
      } else {
        newState.medicine += 5;
        newState.log.push(`⚠ Alarm tripped! Grabbed what you could. +5 medicine.`);
        if (Math.random() < 0.3) {
          const alive = aliveSurvivors(newState.survivors);
          if (alive.length > 0) {
            const unlucky = alive[Math.floor(Math.random() * alive.length)];
            unlucky.health = Math.max(0, unlucky.health - 12);
            newState.log.push(`  ${unlucky.name} hit during escape. -12 health.`);
          }
        }
        adjustGroupMorale(newState, -2);
      }
      break;
    }
    case 'rare_pharmacy_skip': {
      newState.log.push(`→ Left the pharmacy. That alarm is a dinner bell.`);
      break;
    }

    // === STRANGER ===
    case 'stranger_accept': {
      const d = event.strangerData;
      const nextId = Math.max(...newState.survivors.map(s => s.id)) + 1;
      const stranger = {
        id: nextId, name: d.name, age: d.age,
        health: 60 + Math.floor(Math.random() * 20),
        morale: 40 + Math.floor(Math.random() * 20),
        trust: d.trust, skill: d.skill,
        hasPet: false, petType: null, alive: true,
        infected: false, infectedDay: null,
        infectionTreated: false,
        injured: false, injuredDay: null, injuredTreated: false,
        sick: false, sickDay: null, sickTreated: false,
        hiding: false,
        pregnant: false, quarantined: false, causeOfDeath: null,
        deathDay: null, weapon: null, armor: null,
      };
      // Suspicious strangers have a chance of being secretly infected
      if (d.suspicious && Math.random() < 0.3) {
        stranger.infected = true;
        stranger.infectedDay = newState.day;
        stranger.hiding = true;
      }
      newState.survivors.push(stranger);
      adjustGroupMorale(newState, 2);
      newState.log.push(`+ ${d.name} joins the group. ${d.skill} skill.`);
      break;
    }
    case 'stranger_test': {
      const d = event.strangerData;
      if (d.suspicious && Math.random() < 0.5) {
        // They fail the test
        newState.log.push(`⚠ ${d.name} failed the bite check. Turned away.`);
        adjustGroupTrust(newState, 2);
      } else {
        const nextId = Math.max(...newState.survivors.map(s => s.id)) + 1;
        const stranger = {
          id: nextId, name: d.name, age: d.age,
          health: 65 + Math.floor(Math.random() * 20),
          morale: 45 + Math.floor(Math.random() * 20),
          trust: d.trust + 10, skill: d.skill,
          hasPet: false, petType: null, alive: true,
          infected: false, infectedDay: null, infectionTreated: false,
          injured: false, injuredDay: null, injuredTreated: false,
          sick: false, sickDay: null, sickTreated: false,
          hiding: false, pregnant: false, quarantined: false, causeOfDeath: null,
          deathDay: null, weapon: null, armor: null,
        };
        newState.survivors.push(stranger);
        adjustGroupMorale(newState, 2);
        adjustGroupTrust(newState, 2);
        newState.log.push(`✓ ${d.name} passed. Welcome to the group. ${d.skill} skill.`);
      }
      break;
    }
    case 'stranger_reject': {
      adjustGroupMorale(newState, -2);
      newState.log.push(`→ Turned the stranger away. Can't trust anyone.`);
      break;
    }

    // === TRADER ===
    case 'trader_accept': {
      const offer = event.tradeOffer;
      newState[offer.give] = Math.max(0, newState[offer.give] - offer.giveAmt);
      newState[offer.get] = (newState[offer.get] || 0) + offer.getAmt;
      newState.log.push(`✓ Trade complete. -${offer.giveAmt} ${offer.give}, +${offer.getAmt} ${offer.get}.`);
      break;
    }
    case 'trader_rob': {
      newState.ammo = Math.max(0, newState.ammo - 3);
      if (Math.random() < 0.5) {
        const offer = event.tradeOffer;
        newState[offer.get] = (newState[offer.get] || 0) + offer.getAmt + 5;
        newState.food += 5;
        newState.log.push(`⚔ Robbery successful. Took everything. +${offer.getAmt + 5} ${offer.get}, +5 food.`);
        adjustGroupTrust(newState, -8);
        adjustGroupMorale(newState, -3);
      } else {
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const unlucky = alive[Math.floor(Math.random() * alive.length)];
          const dmg = 20 + Math.floor(Math.random() * 15);
          unlucky.health = Math.max(0, unlucky.health - dmg);
          newState.log.push(`⚔ They fought back. ${unlucky.name} took ${dmg} damage. Got nothing.`);
          if (unlucky.health <= 0) killSurvivor(newState, unlucky, 'Killed in failed robbery.');
        }
        adjustGroupMorale(newState, -5);
        adjustGroupTrust(newState, -5);
      }
      break;
    }
    case 'trader_decline': {
      newState.log.push(`→ Waved the traders on.`);
      break;
    }

    // === INFIGHT ===
    case 'infight_side_defender': {
      const defender = newState.survivors.find(s => s.id === event.defenderId);
      const aggressor = newState.survivors.find(s => s.id === event.aggressorId);
      if (defender) defender.trust = Math.min(100, defender.trust + 10);
      if (aggressor) {
        aggressor.morale = Math.max(0, aggressor.morale - 15);
        aggressor.trust = Math.max(0, aggressor.trust - 10);
      }
      adjustGroupTrust(newState, 2);
      newState.log.push(`⚖ Sided with the rules. ${aggressor?.name} won't forget.`);
      break;
    }
    case 'infight_side_aggressor': {
      const defender = newState.survivors.find(s => s.id === event.defenderId);
      const aggressor = newState.survivors.find(s => s.id === event.aggressorId);
      if (aggressor) aggressor.morale = Math.min(100, aggressor.morale + 10);
      if (defender) {
        defender.trust = Math.max(0, defender.trust - 10);
        defender.morale = Math.max(0, defender.morale - 5);
      }
      adjustGroupTrust(newState, -3);
      newState.log.push(`⚖ Bent the rules. ${defender?.name} lost faith.`);
      break;
    }
    case 'infight_mediate': {
      const hasLeader = aliveSurvivors(newState.survivors).some(s => s.skill === 'leadership');
      if (hasLeader || Math.random() < 0.6) {
        adjustGroupMorale(newState, 2);
        newState.log.push(`✓ Mediation worked. Tension lowered. ${hasLeader ? 'Leadership helped.' : ''}`);
      } else {
        adjustGroupMorale(newState, -3);
        newState.log.push(`⚠ Mediation failed. Both sides resentful.`);
      }
      break;
    }

    // === SHELTER ===
    case 'shelter_stay': {
      aliveSurvivors(newState.survivors).forEach(s => {
        s.health = Math.min(100, s.health + 8);
        s.morale = Math.min(100, s.morale + 6);
      });
      newState.food += 6;
      newState.log.push(`🏠 Rested in the shelter. Everyone heals. +8 health, +6 morale, +6 food.`);
      // Basement risk
      if (Math.random() < 0.35) {
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const unlucky = alive[Math.floor(Math.random() * alive.length)];
          const dmg = 15 + Math.floor(Math.random() * 15);
          unlucky.health = Math.max(0, unlucky.health - dmg);
          newState.log.push(`⚠ Something in the basement. ${unlucky.name} took ${dmg} damage investigating.`);
          if (unlucky.health <= 0) killSurvivor(newState, unlucky, 'Killed by what was in the basement.');
        }
      }
      break;
    }
    case 'shelter_raid': {
      const foodGain = 6 + Math.floor(Math.random() * 5);
      newState.food += foodGain;
      const medGain = Math.floor(Math.random() * 4);
      newState.medicine += medGain;
      newState.log.push(`🔍 Raided the pantry. +${foodGain} food, +${medGain} medicine.`);
      break;
    }
    case 'shelter_skip': {
      adjustGroupMorale(newState, -3);
      newState.log.push(`→ Kept moving. The group wanted to stop.`);
      break;
    }

    // === NIGHT HORDE ===
    case 'horde_fight': {
      newState.ammo = Math.max(0, newState.ammo - 10);
      const hasCombat = aliveSurvivors(newState.survivors).some(s => s.skill === 'combat');
      const weaponEdge2 = Math.min(0.15, groupWeaponBonus(newState) * 0.01);
      if (hasCombat || Math.random() < (0.5 + weaponEdge2)) {
        newState.log.push(`⚔ Held the line. Horde pushed back. Ammo spent.`);
        adjustGroupMorale(newState, 8);
        adjustGroupTrust(newState, 3);
      } else {
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const casualties = Math.min(2, alive.length);
          for (let i = 0; i < casualties; i++) {
            const unlucky = alive[Math.floor(Math.random() * alive.length)];
            const dmg = reduceDamage(unlucky, 25 + Math.floor(Math.random() * 20));
            unlucky.health = Math.max(0, unlucky.health - dmg);
            newState.log.push(`⚠ ${unlucky.name} took ${dmg} damage in the fight.`);
            if (unlucky.health <= 0) killSurvivor(newState, unlucky, 'Killed fighting the night horde.');
          }
        }
        adjustGroupMorale(newState, -5);
      }
      break;
    }
    case 'horde_ravine': {
      if (Math.random() < 0.7) {
        newState.log.push(`→ Made it through the ravine. Scratches and bruises.`);
        aliveSurvivors(newState.survivors).forEach(s => {
          s.health = Math.max(0, s.health - 5);
        });
      } else {
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const unlucky = alive[Math.floor(Math.random() * alive.length)];
          unlucky.injured = true;
          unlucky.injuredDay = newState.day;
          unlucky.quarantined = true;
          newState.log.push(`⚠ ${unlucky.name} fell in the ravine. Injured — three-day clock starts.`);
        }
        aliveSurvivors(newState.survivors).forEach(s => {
          s.health = Math.max(0, s.health - 3);
        });
      }
      break;
    }
    case 'horde_distract': {
      newState.food = Math.max(0, newState.food - 8);
      if (Math.random() < 0.8) {
        newState.log.push(`🔥 Fire drew the horde north. Slipped away clean. -8 food.`);
        adjustGroupMorale(newState, 3);
      } else {
        newState.log.push(`⚠ Fire didn't hold them. Some got through.`);
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const unlucky = alive[Math.floor(Math.random() * alive.length)];
          unlucky.health = Math.max(0, unlucky.health - 15);
          newState.log.push(`  ${unlucky.name} got clipped. -15 health. -8 food.`);
        }
      }
      break;
    }

    // === LOOT EVENTS ===
    case 'loot_armory_breach': {
      newState.ammo = Math.max(0, newState.ammo - 5);
      if (target && Math.random() < 0.7) {
        const item = ALL_EQUIPMENT[event.lootItemId];
        equipItem(target, event.lootItemId);
        newState.log.push(`★ Breached the armory! ${target.name} equipped ${item.name}.`);
        adjustGroupMorale(newState, 3);
      } else {
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const unlucky = alive[Math.floor(Math.random() * alive.length)];
          const dmg = 20 + Math.floor(Math.random() * 15);
          unlucky.health = Math.max(0, unlucky.health - dmg);
          newState.log.push(`⚠ Walkers swarmed the breach. ${unlucky.name} took ${dmg} damage.`);
          if (unlucky.health <= 0) killSurvivor(newState, unlucky, 'Killed breaching the armory.');
        }
        adjustGroupMorale(newState, -3);
      }
      break;
    }
    case 'loot_armory_cautious': {
      if (target && Math.random() < 0.5) {
        const item = ALL_EQUIPMENT[event.lootItemId];
        equipItem(target, event.lootItemId);
        newState.log.push(`★ Found a side way in. ${target.name} grabbed a ${item.name}.`);
        adjustGroupMorale(newState, 2);
      } else {
        newState.log.push(`→ Side entrance was blocked. Couldn't get in.`);
      }
      break;
    }
    case 'loot_armory_skip': {
      newState.log.push(`→ Left the armory. Too many walkers.`);
      break;
    }
    case 'loot_lodge_clear': {
      if (target && Math.random() < 0.65) {
        const item = ALL_EQUIPMENT[event.lootItemId];
        equipItem(target, event.lootItemId);
        const foodGain = 4 + Math.floor(Math.random() * 4);
        newState.food += foodGain;
        newState.log.push(`★ Lodge cleared. ${target.name} found a ${item.name}. +${foodGain} food from the pantry.`);
        adjustGroupMorale(newState, 3);
      } else {
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const unlucky = alive[Math.floor(Math.random() * alive.length)];
          const dmg = 10 + Math.floor(Math.random() * 10);
          unlucky.health = Math.max(0, unlucky.health - dmg);
          newState.log.push(`⚠ Something was inside. ${unlucky.name} took ${dmg} damage.`);
          if (unlucky.health <= 0) killSurvivor(newState, unlucky, 'Killed clearing the hunting lodge.');
        }
      }
      break;
    }
    case 'loot_lodge_sneak': {
      if (target && Math.random() < 0.45) {
        const item = ALL_EQUIPMENT[event.lootItemId];
        equipItem(target, event.lootItemId);
        newState.log.push(`★ Slipped in quietly. ${target.name} grabbed a ${item.name}.`);
        adjustGroupMorale(newState, 2);
      } else {
        const foodGain = 2 + Math.floor(Math.random() * 3);
        newState.food += foodGain;
        newState.log.push(`→ Couldn't reach the good gear. Grabbed +${foodGain} food and left.`);
      }
      break;
    }
    case 'loot_lodge_skip': {
      newState.log.push(`→ Passed the lodge. Kept to the road.`);
      break;
    }
    case 'loot_police_rush': {
      if (target && Math.random() < 0.65) {
        const item = ALL_EQUIPMENT[event.lootItemId];
        equipItem(target, event.lootItemId);
        newState.log.push(`★ Rushed the lockers. ${target.name} suited up with a ${item.name}.`);
        adjustGroupMorale(newState, 3);
      } else {
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const unlucky = alive[Math.floor(Math.random() * alive.length)];
          const dmg = 15 + Math.floor(Math.random() * 10);
          unlucky.health = Math.max(0, unlucky.health - dmg);
          newState.log.push(`⚠ Turned officer attacked! ${unlucky.name} took ${dmg} damage.`);
          if (unlucky.health <= 0) killSurvivor(newState, unlucky, 'Killed by a turned officer.');
        }
      }
      break;
    }
    case 'loot_police_careful': {
      if (target && Math.random() < 0.5) {
        const item = ALL_EQUIPMENT[event.lootItemId];
        equipItem(target, event.lootItemId);
        newState.log.push(`★ Building cleared. ${target.name} found a ${item.name} in the lockers.`);
        adjustGroupMorale(newState, 2);
      } else {
        newState.log.push(`→ Lockers were already cleaned out. Nothing useful.`);
      }
      break;
    }
    case 'loot_police_skip': {
      newState.log.push(`→ Left the precinct. Didn't like the sounds inside.`);
      break;
    }
    case 'loot_hospital_enter': {
      if (target && Math.random() < 0.6) {
        const item = ALL_EQUIPMENT[event.lootItemId];
        equipItem(target, event.lootItemId);
        const medGain = 3 + Math.floor(Math.random() * 4);
        newState.medicine += medGain;
        newState.log.push(`★ Made it through quarantine. ${target.name} found a ${item.name}. +${medGain} medicine.`);
        adjustGroupMorale(newState, 3);
      } else {
        // Infection risk
        const alive = aliveSurvivors(newState.survivors);
        if (alive.length > 0) {
          const unlucky = alive[Math.floor(Math.random() * alive.length)];
          unlucky.sick = true;
          unlucky.sickDay = newState.day;
          newState.log.push(`⚠ ${unlucky.name} caught something inside the quarantine zone.`);
        }
        adjustGroupMorale(newState, -2);
      }
      break;
    }
    case 'loot_hospital_perimeter': {
      if (target && Math.random() < 0.4) {
        const item = ALL_EQUIPMENT[event.lootItemId];
        equipItem(target, event.lootItemId);
        newState.log.push(`★ Found a supply crate outside. ${target.name} got a ${item.name}.`);
        adjustGroupMorale(newState, 2);
      } else {
        const medGain = 2 + Math.floor(Math.random() * 3);
        newState.medicine += medGain;
        newState.log.push(`→ Perimeter picked clean. Found +${medGain} medicine.`);
      }
      break;
    }
    case 'loot_hospital_skip': {
      newState.log.push(`→ Avoided the quarantine zone. Not worth the risk.`);
      break;
    }

    // === FLARE GUN (consumable item) ===
    case 'use_flare': {
      if (hasItem(newState, 'flare_gun')) {
        removeItem(newState, 'flare_gun');
        newState.food += 20;
        newState.medicine += 10;
        newState.ammo += 10;
        newState.log.push(`★ Flare fired! Emergency supply drop incoming. +20 food, +10 medicine, +10 ammo.`);
        adjustGroupMorale(newState, 10);
      }
      break;
    }

    default:
      newState.log.push(`[Unknown effect: ${effectKey}]`);
  }

  // Recalculate group morale
  const alive = aliveSurvivors(newState.survivors);
  if (alive.length > 0) {
    newState.groupMorale = Math.round(
      alive.reduce((sum, s) => sum + s.morale, 0) / alive.length
    );
  } else {
    newState.groupMorale = 0;
  }

  newState.currentEvent = null;
  return newState;
}
