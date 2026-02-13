export const DIFFICULTIES = {
  shelter: {
    key: 'shelter',
    name: 'SHELTER',
    tagline: 'Supplies last. The dead are slow.',
    color: '#33ff33',
    settings: {
      startingFood: 80,
      startingMedicine: 45,
      startingAmmo: 55,
      foodDrain: 0.8,
      medicineCost: 5,
      treatedRecovery: 0.8,
      untreatedRecovery: 0.5,
      ambushRisk: 0.15,
      bodyLootInfectionRisk: 0.1,
      petFoodDrain: 2,
    },
  },
  road: {
    key: 'road',
    name: 'THE ROAD',
    tagline: 'Every choice has a cost.',
    color: '#ffaa33',
    settings: {
      startingFood: 65,
      startingMedicine: 35,
      startingAmmo: 45,
      foodDrain: 1.0,
      medicineCost: 7,
      treatedRecovery: 0.7,
      untreatedRecovery: 0.4,
      ambushRisk: 0.2,
      bodyLootInfectionRisk: 0.15,
      petFoodDrain: 2.5,
    },
  },
  rule: {
    key: 'rule',
    name: 'THE RULE',
    tagline: 'Medicine is scarce. The rule holds.',
    color: '#ff6633',
    settings: {
      startingFood: 60,
      startingMedicine: 30,
      startingAmmo: 40,
      foodDrain: 1.2,
      medicineCost: 9,
      treatedRecovery: 0.6,
      untreatedRecovery: 0.33,
      ambushRisk: 0.25,
      bodyLootInfectionRisk: 0.2,
      petFoodDrain: 3,
    },
  },
  flowers: {
    key: 'flowers',
    name: 'LOOK AT THE FLOWERS',
    tagline: 'No one is safe. This is how it ends.',
    color: '#ff3333',
    settings: {
      startingFood: 45,
      startingMedicine: 20,
      startingAmmo: 30,
      foodDrain: 1.5,
      medicineCost: 12,
      treatedRecovery: 0.4,
      untreatedRecovery: 0.15,
      ambushRisk: 0.35,
      bodyLootInfectionRisk: 0.35,
      petFoodDrain: 4,
    },
  },
};

export const DIFFICULTY_ORDER = ['shelter', 'road', 'rule', 'flowers'];

export function getSettings(difficultyKey) {
  return DIFFICULTIES[difficultyKey]?.settings || DIFFICULTIES.road.settings;
}
