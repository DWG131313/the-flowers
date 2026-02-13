import { aliveSurvivors } from '../survivor.js';

const ASCII_ART = `
┌──────────────────────────────┐
│                              │
│     ╔══╗                     │
│     ║██║  WON'T FIGHT.       │
│     ║██║  WON'T HOLD A GUN.  │
│     ╚══╝                     │
│                              │
│     ░░░░░░░░░░░░░░░░░░░░    │
│     ░  FIGHT OR LEAVE   ░    │
│     ░░░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────┘`.trim();

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const refusalVariants = [
  (target, isMedic) => `${target.name} puts the gun down. Won't pick it up. Says they can't — or won't. ${isMedic ? 'But those hands save lives. The rule gives medics an out.' : 'No medical skills. No exemption. The rule is clear: fight or leave.'}`,

  (target, isMedic) => `${target.name} threw the rifle into the river. Watched it sink. "I killed someone yesterday," ${target.name} says. "Not a walker. A person. They were turning but they were still talking and I—" ${target.age < 25 ? 'Hands won\'t stop shaking. Too young for this weight.' : `At ${target.age}, some lines can't be uncrossed.`} ${isMedic ? 'A medic\'s oath runs deeper than the group\'s rules. Maybe that matters.' : 'The group can\'t carry dead weight. Not out here.'}`,

  (target, isMedic) => `"I'll cook. I'll carry. I'll dig latrines." ${target.name} is on their knees. Literally. "But I can't point a weapon at something that used to be a person." ${target.hasPet ? `The ${target.petType} sits beside them, loyal and useless.` : 'Nobody helps them up.'} ${isMedic ? `${target.name}'s medical training makes this complicated. The rule allows an exemption — but the group is watching.` : `${target.trust > 55 ? 'People like ' + target.name + '. That makes it harder to enforce the rule.' : 'Trust was already thin. This cracks it further.'}`}`,

  (target, isMedic) => `It happened during the last watch. ${target.name} had a clean shot at a walker coming through the fence. Didn't take it. Froze. ${target.skill === 'combat' ? 'The trained fighter who can\'t pull the trigger anymore. Something broke inside.' : `Never was a fighter. But the rules don't ask what you were — they ask what you're willing to be.`} ${isMedic ? 'Medical exemption is on the table. But freezing on watch almost got two people killed.' : `${target.name} says it won't happen again. The eyes say otherwise.`}`,

  (target, isMedic) => `${target.name} showed up to weapons training this morning and sat down. Just sat. "My daughter was ${target.age < 30 ? 'seven' : 'fourteen'} when she turned. I held the gun for twenty minutes and couldn't do it. Someone else did." ${target.name} looks at the weapon on the table. "I'm not that person. I'll never be that person." ${isMedic ? 'The group needs healers more than it needs another gun. The rule accounts for this.' : 'Grief isn\'t an exemption. But mercy might be. Your call.'}`,
];

export function generateFightRefusalEvent(state) {
  const alive = aliveSurvivors(state.survivors).filter(
    s => !s.quarantined && !s.pregnant
  );
  if (alive.length < 2) return null;

  const target = alive[Math.floor(Math.random() * alive.length)];
  const isMedic = target.skill === 'medical';

  const choices = [];

  if (isMedic) {
    choices.push({
      label: 'Grant medical exemption',
      detail: `${target.name} has medical skills. The rule allows this.`,
      effect: 'fight_exempt_medic',
      color: 'primary',
    });
    choices.push({
      label: 'Force them to fight anyway',
      detail: 'Everyone fights. No exceptions. Even medics.',
      effect: 'fight_force_medic',
      color: 'danger',
    });
  } else {
    choices.push({
      label: 'Exile them',
      detail: `${target.name} won't fight, ${target.name} doesn't stay.`,
      effect: 'fight_exile',
      color: 'danger',
    });
    choices.push({
      label: 'Give them training',
      detail: 'Three days. Learn to hold a weapon or leave.',
      effect: 'fight_train',
      color: 'amber',
    });
    choices.push({
      label: 'Reassign to scavenging',
      detail: 'Not combat. But they still pull weight.',
      effect: 'fight_reassign',
      color: 'primary',
    });
  }

  return {
    type: 'fight_refusal',
    title: 'COMBAT REFUSAL',
    ascii: ASCII_ART,
    text: pick(refusalVariants)(target, isMedic),
    targetId: target.id,
    choices,
  };
}
