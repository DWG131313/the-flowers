import { AMMO_COST_BURN } from '../constants.js';

const ASCII_ART = `
┌──────────────────────────────┐
│                              │
│     ═══╗  ═══╗  ═══╗        │
│     ░░░║  ░░░║  ░░░║        │
│     ═══╝  ═══╝  ═══╝        │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░   BURN THEM ALL   ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const bodyVariants = [
  (count) => `${count} bodies on the road. Fresh enough to smell, old enough to worry about. The rule says burn them all — every body, every time. But there might be supplies on them. And burning takes ammo.`,

  (count) => `A minivan on its side, doors pried open. ${count} bodies inside — a family, from the look of it. Kids' shoes scattered on the asphalt. They didn't turn. Someone put them down clean, then took the car's gas and left them to rot. Their packs might still have food. The rule says burn. The rule doesn't say anything about looking away.`,

  (count) => `${count} bodies in a ditch off the highway, lined up in a row. Hands bound with zip ties. Someone executed these people — not walkers, people. One of them is still wearing a hospital bracelet. Whatever they were running from, it wasn't just the dead. Pockets might hold something useful. But touching them means risk.`,

  (count) => `An overturned shopping cart and ${count} bodies sprawled around it. Looks like they were fighting over the cart when a pack hit them. Canned goods spilled everywhere, some rolled under the bodies. Flies are thick. The smell hits from thirty feet out. Burn rules exist for a reason — but those cans could feed the group for days.`,

  (count) => `A checkpoint that didn't hold. ${count} bodies in military fatigues, slumped behind a barricade of sandbags. The walkers came through here hard and fast. One soldier still has a sidearm in the holster. Another has a medkit strapped to the vest. The gear is right there. But every one of these bodies could be hours from getting back up.`,
];

export function generateBodiesEvent(state) {
  const count = 2 + Math.floor(Math.random() * 5);

  return {
    type: 'bodies_found',
    title: 'BODIES FOUND',
    ascii: ASCII_ART,
    text: pick(bodyVariants)(count),
    bodyCount: count,
    choices: [
      {
        label: 'Burn them',
        detail: `Follow the rule. Use ${AMMO_COST_BURN} ammo. [-${AMMO_COST_BURN} AMMO]`,
        effect: 'bodies_burn',
        cost: { ammo: AMMO_COST_BURN },
        color: 'danger',
      },
      {
        label: 'Loot then burn',
        detail: 'Search first. Risk infection. Then burn what\'s left.',
        effect: 'bodies_loot',
        color: 'amber',
      },
      {
        label: 'Keep moving',
        detail: 'Not our problem. Save the ammo.',
        effect: 'bodies_ignore',
        color: 'primary',
      },
    ],
  };
}
