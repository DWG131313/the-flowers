import { aliveSurvivors } from '../survivor.js';
import { LOW_FOOD_THRESHOLD, PET_FOOD_GAINED } from '../constants.js';

const PET_PROBLEM_ART = `
┌──────────────────────────────┐
│                              │
│     ▄   ▄                    │
│     █▀█▀█  BARK BARK BARK    │
│     █▄█▄█  THEY HEARD THAT.  │
│      ███                     │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  PROBLEM PET      ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

const PET_FOOD_ART = `
┌──────────────────────────────┐
│                              │
│     ▄   ▄                    │
│     █▀█▀█                    │
│     █▄█▄█  FOOD IS FOOD.     │
│      ███                     │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  STARVING         ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

export function generatePetProblemEvent(state) {
  const dogOwners = aliveSurvivors(state.survivors).filter(
    s => s.hasPet && s.petType === 'dog'
  );
  if (dogOwners.length === 0) return null;

  const target = dogOwners[Math.floor(Math.random() * dogOwners.length)];

  return {
    type: 'pet_problem',
    title: 'PROBLEM PET',
    ascii: PET_PROBLEM_ART,
    text: `${target.name}'s dog barked during a supply run. Loud. Echoing. Everyone froze. Could have drawn a horde. ${target.name} says the dog is trained, just spooked. But the rule's clear about untrained dogs.`,
    targetId: target.id,
    choices: [
      {
        label: 'Remove the dog',
        detail: `The dog goes. ${target.name} won't forgive you.`,
        effect: 'pet_remove',
        color: 'danger',
      },
      {
        label: 'Keep it — with a warning',
        detail: 'One more incident and the dog is gone.',
        effect: 'pet_warn',
        color: 'amber',
      },
    ],
  };
}

export function generatePetFoodEvent(state) {
  if (state.food > LOW_FOOD_THRESHOLD) return null;

  const petOwners = aliveSurvivors(state.survivors).filter(s => s.hasPet);
  if (petOwners.length === 0) return null;

  const target = petOwners[Math.floor(Math.random() * petOwners.length)];
  const animal = target.petType;

  return {
    type: 'pet_food',
    title: 'FOOD CRISIS — PET AS FOOD',
    ascii: PET_FOOD_ART,
    text: `Food's running out. People are staring at ${target.name}'s ${animal}. Nobody wants to say it, but everyone's thinking it. Protein is protein. ${target.name} holds the ${animal} tighter.`,
    targetId: target.id,
    choices: [
      {
        label: `Eat the ${animal}`,
        detail: `+${PET_FOOD_GAINED} food. ${target.name} will never be the same.`,
        effect: 'pet_eat',
        color: 'danger',
      },
      {
        label: `Release the ${animal}`,
        detail: `Let it go. No food, but ${target.name} keeps some dignity.`,
        effect: 'pet_release',
        color: 'amber',
      },
      {
        label: `Keep the ${animal}`,
        detail: 'Everyone gets less. The animal stays.',
        effect: 'pet_keep_hungry',
        color: 'primary',
      },
    ],
  };
}
