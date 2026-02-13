// Rare items — persistent bonuses that stay for the rest of the game.
// Each item has an ID, name, description, and an effect tag used in phaseAdvance/effects.

export const RARE_ITEMS = {
  military_radio: {
    id: 'military_radio',
    name: 'MILITARY RADIO',
    desc: 'Shortwave radio on military frequency. Rescue comes 3 days sooner.',
    tag: 'RADIO',
  },
  antibiotics: {
    id: 'antibiotics',
    name: 'ANTIBIOTICS',
    desc: 'Full course of broad-spectrum antibiotics. Cures one illness instantly.',
    tag: 'MEDS',
    consumable: true,
  },
  body_armor: {
    id: 'body_armor',
    name: 'BODY ARMOR',
    desc: 'Kevlar vest. One survivor takes half damage from ambushes.',
    tag: 'ARMOR',
  },
  generator: {
    id: 'generator',
    name: 'PORTABLE GENERATOR',
    desc: 'Small gas generator. +3 morale per day. A little light in the dark.',
    tag: 'GEN',
  },
  water_purifier: {
    id: 'water_purifier',
    name: 'WATER PURIFIER',
    desc: 'Gravity-fed filter. Reduces food drain by 20%.',
    tag: 'H2O',
  },
  weapons_cache: {
    id: 'weapons_cache',
    name: 'WEAPONS CACHE',
    desc: '+25 ammo and ambush damage is reduced.',
    tag: 'GUNS',
  },
  med_kit: {
    id: 'med_kit',
    name: 'FIELD SURGERY KIT',
    desc: 'Professional medical tools. Treated recovery chance increases to 80%.',
    tag: 'SURG',
  },
  flare_gun: {
    id: 'flare_gun',
    name: 'FLARE GUN',
    desc: 'Signal flare launcher. Can call for an emergency supply drop once.',
    tag: 'FLARE',
    consumable: true,
  },
};

export function hasItem(state, itemId) {
  return (state.items || []).includes(itemId);
}

export function addItem(state, itemId) {
  if (!state.items) state.items = [];
  if (!state.items.includes(itemId)) {
    state.items.push(itemId);
  }
}

export function removeItem(state, itemId) {
  if (!state.items) return;
  state.items = state.items.filter(id => id !== itemId);
}
