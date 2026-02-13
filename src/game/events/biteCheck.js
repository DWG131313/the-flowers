import { BITE_CHECK_REFUSAL_RATE, BITE_DISCOVERY_RATE } from '../constants.js';
import { aliveSurvivors } from '../survivor.js';

const ASCII_ART = `
┌──────────────────────────────┐
│     ╔═══╗                    │
│     ║ ? ║   STRIP DOWN.     │
│     ╚═══╝   SHOW ME.        │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  MANDATORY CHECK  ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const refusalVariants = [
  (target) => `${target.name} won't strip down for the check. Arms crossed, jaw tight. Everyone's watching. ${target.hiding ? 'Something in those eyes — fear, maybe.' : 'Could be nothing. Could be everything.'}`,

  (target) => `You call for the check and ${target.name} backs up two steps. Hands in pockets. "${target.age < 25 ? 'I don\'t have to do this. You can\'t make me.' : 'I said no. That\'s the end of it.'}" The silence after is worse than any argument. ${target.hiding ? 'There\'s sweat on the back of their neck. Wrong kind of sweat.' : 'Maybe it\'s pride. Maybe it\'s something else.'}`,

  (target) => `${target.name} starts unbuttoning, then stops. Looks at the ground. "Not today." ${target.skill === 'medical' ? 'The medic who won\'t submit to a medical check. That tells you something.' : `${target.age > 40 ? 'Forty-something years of dignity — hard to strip that away.' : 'Young enough to still think rules don\'t apply.'}`} ${target.hiding ? 'But the way those hands are shaking — that\'s not cold.' : 'The group is watching. Waiting on you.'}`,

  (target) => `"Check everyone else first." ${target.name} says it calm, almost reasonable. But when you circle back, they\'re by the door. Ready to run. ${target.hiding ? 'There\'s a bandage on the left forearm that wasn\'t there yesterday.' : 'Could be a bluff. Could be survival instinct.'} ${target.hasPet ? `Their ${target.petType} is pressed against their leg, hackles up.` : 'Nobody moves.'}`,

  (target) => `${target.name} throws a water jug against the wall. "Every goddamn day with this." ${target.trust < 40 ? 'Never trusted the process. Never trusted you.' : 'Used to line up first for checks. Something changed.'} ${target.hiding ? 'When the jug hit, the sleeve rode up. You saw something. Maybe.' : 'Anger or fear — hard to tell the difference anymore.'}`,
];

const biteFoundVariants = [
  (target) => `${target.name} rolls up a sleeve and there it is. Teeth marks. Fresh. The skin around it is already going gray. ${target.name} looks at you. Everyone looks at you.`,

  (target) => `The check is almost done when someone spots it — on ${target.name}'s calf, half-hidden by a torn pant leg. A crescent of puncture wounds, swollen purple at the edges. ${target.name} doesn't deny it. "Happened last night. I thought maybe... I thought I had more time."`,

  (target) => `${target.name} strips down and at first it looks clean. Then they turn around. Four ragged bite marks across the shoulder blade, the flesh already darkening. ${target.name} didn't even know it was there. ${target.age < 25 ? '"I can\'t feel it. That\'s good, right? That means it\'s fine?"' : 'The look on their face says they already know what comes next.'}`,

  (target) => `It's ${target.name}'s hand. The webbing between thumb and forefinger — torn, inflamed, weeping something that isn't blood. "I grabbed one by the jaw," ${target.name} says. "${target.skill === 'combat' ? 'Ran out of ammo. Had to.' : 'It was on top of me. I didn\'t have a choice.'}" The room goes quiet. ${target.hasPet ? `Their ${target.petType} whines from the corner, like it already knows.` : 'Someone near the back starts checking the exits.'}`,

  (target) => `${target.name} cooperates with the check — rolls up both sleeves, lifts the shirt. Clean. But when someone asks about the neck, ${target.name} freezes. A scarf comes off and there it is. Small bite, almost surgical. Right over the artery. ${target.health < 70 ? 'Already pale. Already fading.' : 'Still looks strong. That makes it worse, somehow.'}`,
];

export function generateBiteCheckEvent(state) {
  const alive = aliveSurvivors(state.survivors);
  if (alive.length === 0) return null;

  const target = alive[Math.floor(Math.random() * alive.length)];
  const roll = Math.random();

  // Infected survivors hiding are more likely to refuse
  const refusalChance = target.hiding ? 0.7 : BITE_CHECK_REFUSAL_RATE;

  if (roll < refusalChance) {
    return {
      type: 'bite_check_refusal',
      title: 'BITE CHECK — REFUSAL',
      ascii: ASCII_ART,
      text: pick(refusalVariants)(target),
      targetId: target.id,
      choices: [
        {
          label: 'Enforce the rule',
          detail: `If ${target.name} won't show, ${target.name} looks at the flowers.`,
          effect: 'bite_check_enforce',
          color: 'danger',
        },
        {
          label: 'Pressure them',
          detail: 'Talk them down. Make them show. Find out.',
          effect: 'bite_check_pressure',
          color: 'amber',
        },
        {
          label: 'Let it slide',
          detail: 'Not worth the fight. This time.',
          effect: 'bite_check_slide',
          color: 'primary',
        },
      ],
    };
  }

  if (roll < refusalChance + BITE_DISCOVERY_RATE) {
    return {
      type: 'bite_check_found',
      title: 'BITE CHECK — BITE FOUND',
      ascii: ASCII_ART,
      text: pick(biteFoundVariants)(target),
      targetId: target.id,
      choices: [
        {
          label: 'Execute immediately',
          detail: `${target.name} looks at the flowers.`,
          effect: 'bite_found_execute',
          color: 'danger',
        },
        {
          label: 'Quarantine and treat',
          detail: 'Spend medicine. Maybe there\'s time. [-9 MEDICINE]',
          effect: 'bite_found_treat',
          cost: { medicine: 9 },
          color: 'amber',
        },
        {
          label: 'Wait and see',
          detail: 'Watch them. Maybe it\'s not what it looks like.',
          effect: 'bite_found_wait',
          color: 'primary',
        },
      ],
    };
  }

  // Clean check — no event needed, return null to let generator pick another
  return null;
}
