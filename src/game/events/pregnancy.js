import { aliveSurvivors } from '../survivor.js';

const ASCII_ART = `
┌──────────────────────────────┐
│                              │
│        ◯                     │
│       ╱│╲    NEW LIFE        │
│       ╱ ╲    WRONG TIME      │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░    THE RULE SAYS   ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

export function generatePregnancyEvent(state) {
  const eligible = aliveSurvivors(state.survivors).filter(
    s => s.age >= 18 && s.age <= 42 && !s.pregnant && !s.sick && !s.injured
  );
  if (eligible.length === 0) return null;

  const target = eligible[Math.floor(Math.random() * eligible.length)];

  return {
    type: 'pregnancy',
    title: 'PREGNANCY DISCOVERED',
    ascii: ASCII_ART,
    text: `${target.name} pulls you aside. Quiet voice, shaking hands. Pregnant. In a world like this. The rule is clear — they go, or the pregnancy does. But rules were made before you saw the look in someone's eyes.`,
    targetId: target.id,
    choices: [
      {
        label: 'Exile with supplies',
        detail: `${target.name} leaves with 5 days of food. The rule holds. [-8 FOOD]`,
        effect: 'pregnancy_exile',
        cost: { food: 8 },
        color: 'danger',
      },
      {
        label: 'Let them stay',
        detail: 'Break the rule. Extra food cost. Some will approve. Some won\'t.',
        effect: 'pregnancy_keep',
        color: 'amber',
      },
      {
        label: 'Let them decide',
        detail: '50/50 they stay or go. At least it\'s their choice.',
        effect: 'pregnancy_choice',
        color: 'primary',
      },
    ],
  };
}
