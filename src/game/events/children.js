const ASCII_ART = `
┌──────────────────────────────┐
│                              │
│       ◯                      │
│      /|\\    SMALL.           │
│      / \\    ALONE.           │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░   UNDER TEN        ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

const CHILD_NAMES = ['Lily', 'Sam', 'Max', 'Cora', 'Eli', 'Mae'];

export function generateChildEvent(state) {
  const name = CHILD_NAMES[Math.floor(Math.random() * CHILD_NAMES.length)];
  const age = 4 + Math.floor(Math.random() * 6);

  return {
    type: 'child_found',
    title: 'CHILD FOUND',
    ascii: ASCII_ART,
    text: `Found behind a dumpster. ${name}, maybe ${age} years old. Dirty. Starving. Eyes too big for that face. No parents in sight. The rule says children under ten look at the flowers. But the rule didn't have a face like this.`,
    childName: name,
    childAge: age,
    choices: [
      {
        label: 'Look at the flowers',
        detail: 'The rule is the rule. It has to be.',
        effect: 'child_execute',
        color: 'danger',
      },
      {
        label: `Take ${name} in`,
        detail: 'Another mouth. No skills. But still breathing.',
        effect: 'child_take',
        color: 'amber',
      },
      {
        label: 'Walk away',
        detail: 'Leave them. Don\'t look back.',
        effect: 'child_leave',
        color: 'primary',
      },
    ],
  };
}
