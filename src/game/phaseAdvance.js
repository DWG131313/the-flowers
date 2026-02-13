import { aliveSurvivors, cloneState } from './survivor.js';
import {
  INFECTION_TURN_DAYS,
  INJURY_ILLNESS_TIMER_DAYS,
  PET_MORALE_BONUS,
  WIN_DAY,
  PHASE_NAMES,
  PHASE_ICONS,
} from './constants.js';
import { generateEvent } from './eventGenerator.js';
import { hasItem } from './items.js';
import { getEquipmentBonus } from './equipment.js';

export function advancePhase(state) {
  const newState = cloneState(state);
  const alive = aliveSurvivors(newState.survivors);
  const foodDrainRate = newState.settings?.foodDrain ?? 1.2;
  const treatedRecovery = newState.settings?.treatedRecovery ?? 0.6;
  const untreatedRecovery = newState.settings?.untreatedRecovery ?? 0.33;
  const petFoodDrain = newState.settings?.petFoodDrain ?? 3;

  const currentPhase = newState.phase;
  const isEndOfDay = currentPhase === 2; // Dusk

  // Phase label for log
  const nextPhase = (currentPhase + 1) % 3;
  const nextDay = isEndOfDay ? newState.day + 1 : newState.day;

  if (isEndOfDay) {
    newState.log.push(`──── DAY ${newState.day} ENDS ────`);

    // === FOOD DRAIN (once per day at end of Dusk) ===
    const hasCrafter = alive.some(s => s.skill === 'craft');
    const hasWaterPurifier = hasItem(newState, 'water_purifier');
    let drainMult = 1;
    if (hasCrafter) drainMult *= 0.85;
    if (hasWaterPurifier) drainMult *= 0.8;
    const drainRate = foodDrainRate * drainMult;
    const foodDrain = Math.ceil(alive.length * drainRate);
    const petCount = alive.filter(s => s.hasPet).length;
    const petDrain = Math.ceil(petCount * petFoodDrain);
    const totalDrain = foodDrain + petDrain;
    newState.food = Math.max(0, newState.food - totalDrain);
    newState.log.push(`🍖 -${totalDrain} food (${alive.length} survivors${petCount > 0 ? `, ${petCount} pets` : ''}${hasCrafter ? ', craft bonus' : ''}).`);

    // Starvation
    if (newState.food === 0) {
      newState.log.push(`⚠ NO FOOD. Everyone suffers.`);
      alive.forEach(s => {
        s.health = Math.max(0, s.health - 5);
        s.morale = Math.max(0, s.morale - 5);
      });
    }

    // === PET MORALE BONUS ===
    alive.forEach(s => {
      if (s.hasPet) {
        s.morale = Math.min(100, s.morale + PET_MORALE_BONUS);
      }
    });

    // === GENERATOR MORALE BONUS ===
    if (hasItem(newState, 'generator')) {
      alive.forEach(s => {
        s.morale = Math.min(100, s.morale + 3);
      });
    }

    // === EQUIPMENT DAILY BONUSES ===
    alive.forEach(s => {
      const moraleBonus = getEquipmentBonus(s, 'moraleBonus');
      if (moraleBonus > 0) s.morale = Math.min(100, s.morale + moraleBonus);
      const healthRecovery = getEquipmentBonus(s, 'healthRecovery');
      if (healthRecovery > 0) s.health = Math.min(100, s.health + healthRecovery);
    });
  }

  // === TIMER CHECKS (every phase) ===
  alive.forEach(s => {
    // Infection progression
    if (s.infected && s.infectedDay != null) {
      const daysSinceInfection = newState.day - s.infectedDay + (isEndOfDay ? 1 : 0);
      if (daysSinceInfection >= INFECTION_TURN_DAYS && !s.infectionTreated) {
        s.alive = false;
        s.health = 0;
        s.causeOfDeath = 'Turned — untreated bite.';
        s.deathDay = newState.day;
        newState.log.push(`☠ ${s.name} turned. The infection won.`);

        // May injure another survivor
        const others = aliveSurvivors(newState.survivors).filter(o => o.id !== s.id);
        if (others.length > 0 && Math.random() < 0.3) {
          const victim = others[Math.floor(Math.random() * others.length)];
          victim.health = Math.max(0, victim.health - 20);
          victim.infected = true;
          victim.infectedDay = newState.day;
          victim.hiding = true;
          newState.log.push(`⚠ ${s.name} bit ${victim.name} while turning!`);
        }
      } else if (daysSinceInfection >= INFECTION_TURN_DAYS && s.infectionTreated) {
        // Treated infection — recovery check
        if (Math.random() < treatedRecovery) {
          s.infected = false;
          s.infectedDay = null;
          s.infectionTreated = false;
          s.quarantined = false;
          newState.log.push(`✓ ${s.name} recovered from the infection. Against all odds.`);
        } else {
          s.alive = false;
          s.health = 0;
          s.causeOfDeath = 'Turned despite treatment.';
          s.deathDay = newState.day;
          newState.log.push(`☠ ${s.name} turned despite treatment.`);
        }
      }
    }

    // Injury timer
    if (s.injured && s.injuredDay != null && !s.infected) {
      const daysSinceInjury = newState.day - s.injuredDay + (isEndOfDay ? 1 : 0);
      if (daysSinceInjury >= INJURY_ILLNESS_TIMER_DAYS) {
        const hasSurgKit = hasItem(newState, 'med_kit');
        const baseChance = s.injuredTreated ? treatedRecovery : untreatedRecovery;
        const equipRecovery = getEquipmentBonus(s, 'recoveryBonus');
        const chance = (hasSurgKit && s.injuredTreated ? 0.8 : baseChance) + equipRecovery;
        if (Math.random() < chance) {
          s.injured = false;
          s.injuredDay = null;
          s.injuredTreated = false;
          s.quarantined = false;
          newState.log.push(`✓ ${s.name}'s injury healed.${hasSurgKit && s.injuredTreated ? ' Surgery kit helped.' : ''}`);
        } else {
          s.health = Math.max(0, s.health - 50);
          newState.log.push(`⚠ ${s.name}'s injury worsened critically. Health: ${s.health}`);
          if (s.health <= 0) {
            s.alive = false;
            s.causeOfDeath = 'Died from untreated injury.';
            s.deathDay = newState.day;
            newState.log.push(`☠ ${s.name} didn't make it. The three-day rule.`);
          }
        }
      }
    }

    // Illness timer
    if (s.sick && s.sickDay != null) {
      const daysSinceSick = newState.day - s.sickDay + (isEndOfDay ? 1 : 0);
      if (daysSinceSick >= INJURY_ILLNESS_TIMER_DAYS) {
        const hasSurgKit2 = hasItem(newState, 'med_kit');
        const baseChance2 = s.sickTreated ? treatedRecovery : untreatedRecovery;
        const equipRecovery2 = getEquipmentBonus(s, 'recoveryBonus');
        const chance = (hasSurgKit2 && s.sickTreated ? 0.8 : baseChance2) + equipRecovery2;
        if (Math.random() < chance) {
          s.sick = false;
          s.sickDay = null;
          s.sickTreated = false;
          s.quarantined = false;
          newState.log.push(`✓ ${s.name} recovered from illness.${hasSurgKit2 && s.sickTreated ? ' Surgery kit helped.' : ''}`);
        } else {
          s.health = Math.max(0, s.health - 50);
          newState.log.push(`⚠ ${s.name}'s illness worsened. Health: ${s.health}`);
          if (s.health <= 0) {
            s.alive = false;
            s.causeOfDeath = 'Died from illness.';
            s.deathDay = newState.day;
            newState.log.push(`☠ ${s.name} succumbed to illness.`);
          }
        }
      }
    }
  });

  // === DEATH CHECK ===
  newState.survivors.forEach(s => {
    if (s.alive && s.health <= 0) {
      s.alive = false;
      if (!s.causeOfDeath) s.causeOfDeath = 'Health reached zero.';
      s.deathDay = s.deathDay || newState.day;
      newState.log.push(`☠ ${s.name} is dead. ${s.causeOfDeath}`);
    }
  });

  // === RECALCULATE MORALE ===
  const stillAlive = aliveSurvivors(newState.survivors);
  if (stillAlive.length > 0) {
    newState.groupMorale = Math.round(
      stillAlive.reduce((sum, s) => sum + s.morale, 0) / stillAlive.length
    );
  } else {
    newState.groupMorale = 0;
  }

  // === ADVANCE PHASE/DAY ===
  newState.phase = nextPhase;
  if (isEndOfDay) {
    newState.day = nextDay;
  }

  // === GAME OVER CHECK ===
  if (aliveSurvivors(newState.survivors).length === 0) {
    newState.gameOver = true;
    newState.gameWon = false;
    newState.gameOverReason = 'All survivors are dead. No one is left.';
    newState.log.push(`══════ TOTAL LOSS ══════`);
    return newState;
  }

  const effectiveWinDay = hasItem(newState, 'military_radio') ? WIN_DAY - 3 : WIN_DAY;
  if (newState.day > effectiveWinDay) {
    newState.gameOver = true;
    newState.gameWon = true;
    const count = aliveSurvivors(newState.survivors).length;
    const radioBonus = hasItem(newState, 'military_radio') ? ' The radio made the difference.' : '';
    newState.gameOverReason = `Day ${effectiveWinDay} reached. The military found your group. ${count} survivor${count !== 1 ? 's' : ''} made it.${radioBonus}`;
    newState.log.push(`══════ RESCUED ══════`);
    return newState;
  }

  // === RESCUE COUNTDOWN ===
  const daysLeft = effectiveWinDay - newState.day + 1;
  if (daysLeft <= 5 && daysLeft > 0 && newState.phase === 0) {
    const msgs = {
      5: '📻 Static on the radio. Something is out there.',
      4: '📻 A signal. Faint. Military frequency.',
      3: '📻 "...sector sweep in 3 days. Hold position."',
      2: '📻 Helicopters in the distance. Two more days.',
      1: '📻 "Tomorrow. We\'re coming tomorrow. Hold on."',
    };
    if (msgs[daysLeft]) {
      newState.log.push(msgs[daysLeft]);
    }
  }

  // === GENERATE NEXT EVENT ===
  newState.log.push(`── ${PHASE_ICONS[newState.phase]} ${PHASE_NAMES[newState.phase].toUpperCase()}, DAY ${newState.day} ──`);
  newState.currentEvent = generateEvent(newState);

  return newState;
}
