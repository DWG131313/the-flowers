import { NAMES, SKILLS } from './constants.js';

let usedNames = [];

function pickName() {
  const available = NAMES.filter(n => !usedNames.includes(n));
  if (available.length === 0) {
    usedNames = [];
    return NAMES[Math.floor(Math.random() * NAMES.length)];
  }
  const name = available[Math.floor(Math.random() * available.length)];
  usedNames.push(name);
  return name;
}

export function resetNames() {
  usedNames = [];
}

export function generateSurvivor(id) {
  const name = pickName();
  const age = 18 + Math.floor(Math.random() * 45);
  const skill = SKILLS[Math.floor(Math.random() * SKILLS.length)];
  const hasPet = Math.random() < 0.2;
  const petType = hasPet ? (Math.random() < 0.5 ? 'dog' : 'cat') : null;

  return {
    id,
    name,
    age,
    health: 80 + Math.floor(Math.random() * 21),
    morale: 50 + Math.floor(Math.random() * 21),
    trust: 50 + Math.floor(Math.random() * 21),
    skill,
    hasPet,
    petType,
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
  };
}

export function generateStartingGroup() {
  resetNames();
  const survivors = [];
  for (let i = 0; i < 8; i++) {
    survivors.push(generateSurvivor(i));
  }
  return survivors;
}

export function aliveSurvivors(survivors) {
  return survivors.filter(s => s.alive);
}

export function survivorByName(survivors, name) {
  return survivors.find(s => s.name === name);
}

export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}
