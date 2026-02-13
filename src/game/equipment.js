// Equipment system — each survivor can hold 1 weapon + 1 armor/accessory.
// Bonuses are looked up by getEquipmentBonus() in combat / phase advance.

export const WEAPONS = {
  pipe_wrench: {
    id: 'pipe_wrench', name: 'PIPE WRENCH', tag: 'WRN', slot: 'weapon',
    damagePlus: 5,
  },
  hunting_knife: {
    id: 'hunting_knife', name: 'HUNTING KNIFE', tag: 'KNF', slot: 'weapon',
    damagePlus: 3, scavengeBonus: 0.05,
  },
  fire_axe: {
    id: 'fire_axe', name: 'FIRE AXE', tag: 'AXE', slot: 'weapon',
    damagePlus: 8,
  },
  crossbow: {
    id: 'crossbow', name: 'CROSSBOW', tag: 'XBW', slot: 'weapon',
    damagePlus: 7,
  },
  machete: {
    id: 'machete', name: 'MACHETE', tag: 'MCH', slot: 'weapon',
    damagePlus: 6, healthRecovery: 2,
  },
  shotgun: {
    id: 'shotgun', name: 'SAWED-OFF', tag: 'SHG', slot: 'weapon',
    damagePlus: 12,
  },
  nail_bat: {
    id: 'nail_bat', name: 'NAIL BAT', tag: 'BAT', slot: 'weapon',
    damagePlus: 4, moraleBonus: 3,
  },
};

export const ARMOR = {
  leather_jacket: {
    id: 'leather_jacket', name: 'LEATHER JACKET', tag: 'LJK', slot: 'armor',
    damageMinus: 3,
  },
  riot_shield: {
    id: 'riot_shield', name: 'RIOT SHIELD', tag: 'SHD', slot: 'armor',
    damageMinus: 6,
  },
  hiking_boots: {
    id: 'hiking_boots', name: 'HIKING BOOTS', tag: 'BTS', slot: 'armor',
    damageMinus: 2, healthRecovery: 5,
  },
  gas_mask: {
    id: 'gas_mask', name: 'GAS MASK', tag: 'MSK', slot: 'armor',
    sicknessReduction: 0.5,
  },
  combat_vest: {
    id: 'combat_vest', name: 'COMBAT VEST', tag: 'VST', slot: 'armor',
    damageMinus: 5,
  },
  lucky_charm: {
    id: 'lucky_charm', name: 'LUCKY CHARM', tag: 'LCK', slot: 'armor',
    moraleBonus: 5, recoveryBonus: 0.1,
  },
  medic_pouch: {
    id: 'medic_pouch', name: 'MEDIC POUCH', tag: 'MDP', slot: 'armor',
    medicineSaving: 2,
  },
};

export const ALL_EQUIPMENT = { ...WEAPONS, ...ARMOR };

// Get a specific bonus value from a survivor's equipped gear (weapon + armor combined).
export function getEquipmentBonus(survivor, bonusType) {
  let total = 0;
  if (survivor.weapon && ALL_EQUIPMENT[survivor.weapon]) {
    total += ALL_EQUIPMENT[survivor.weapon][bonusType] || 0;
  }
  if (survivor.armor && ALL_EQUIPMENT[survivor.armor]) {
    total += ALL_EQUIPMENT[survivor.armor][bonusType] || 0;
  }
  return total;
}

// Equip an item to the correct slot. Returns the previously equipped item id (or null).
export function equipItem(survivor, itemId) {
  const item = ALL_EQUIPMENT[itemId];
  if (!item) return null;
  const slot = item.slot; // 'weapon' or 'armor'
  const previous = survivor[slot];
  survivor[slot] = itemId;
  return previous;
}
