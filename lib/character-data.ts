import type { Race, Background, CharacterStats } from "./types"

export const RACES = {
  human: {
    name: "Human",
    description: "Versatile and ambitious, the race of Men adapts to any challenge.",
    bonuses: { flexChoice: true }, // Player chooses +2 to any stat
    bonusAmount: 2,
    ability: "Versatile",
    abilityDescription: "Choose +2 to any one stat during character creation",
  },
  elf: {
    name: "Elf",
    description: "Ancient and wise, the Firstborn possess deep knowledge and keen senses.",
    bonuses: { lore: 2, wisdom: 1 },
    ability: "Keen Senses",
    abilityDescription: "Advantage on Wisdom checks to perceive hidden things",
  },
  dwarf: {
    name: "Dwarf",
    description: "Hardy and stalwart, Dwarves endure where others fall.",
    bonuses: { endurance: 2, craft: 1 },
    ability: "Stone-cunning",
    abilityDescription: "Advantage on Lore checks related to stonework and mining",
  },
  hobbit: {
    name: "Hobbit",
    description: "Small but brave, Hobbits possess surprising resilience and charm.",
    bonuses: { fellowship: 2, wisdom: 1 },
    ability: "Brave",
    abilityDescription: "Advantage on saves against fear effects",
  },
} as const

export const BACKGROUNDS = {
  ranger: {
    name: "Ranger",
    description: "A wanderer of the wild places, skilled with bow and blade.",
    bonuses: { valor: 1 },
    equipment: ["Longbow", "Quiver (20 arrows)", "Hunter's knife", "Rope (50ft)", "Bedroll"],
    startingGold: 20,
  },
  scholar: {
    name: "Scholar",
    description: "A keeper of ancient lore and forgotten knowledge.",
    bonuses: { lore: 2 },
    equipment: ["Ancient text", "Writing supplies", "Lantern", "Scholar's robes"],
    startingGold: 15,
  },
  merchant: {
    name: "Merchant",
    description: "A trader of goods and words, skilled in negotiation.",
    bonuses: { fellowship: 1 },
    equipment: ["Fine clothes", "Merchant's ledger", "Sample wares", "Coin purse"],
    startingGold: 50,
  },
  soldier: {
    name: "Soldier",
    description: "A trained warrior, hardened by battle.",
    bonuses: { valor: 1, endurance: 1 },
    equipment: ["Longsword", "Shield", "Chainmail armor", "Waterskin"],
    startingGold: 25,
  },
  wanderer: {
    name: "Wanderer",
    description: "A traveler with no fixed home, collecting stories and secrets.",
    bonuses: { wisdom: 1 },
    equipment: ["Walking staff", "Weathered map", "Travel cloak", "Flint and steel"],
    startingGold: 10,
  },
} as const

export const POINT_BUY_TOTAL = 27
export const STAT_MIN = 3
export const STAT_MAX = 8

export function calculateFinalStats(
  baseStats: CharacterStats,
  race: Race,
  background: Background,
  humanBonusStat?: keyof CharacterStats,
): CharacterStats {
  const finalStats = { ...baseStats }

  // Apply race bonuses
  const raceData = RACES[race]
  if ("flexChoice" in raceData.bonuses && humanBonusStat && "bonusAmount" in raceData) {
    finalStats[humanBonusStat] += raceData.bonusAmount
  } else {
    Object.entries(raceData.bonuses).forEach(([stat, value]) => {
      if (stat !== "flexChoice" && typeof value === "number") {
        finalStats[stat as keyof CharacterStats] += value
      }
    })
  }

  // Apply background bonuses
  const backgroundData = BACKGROUNDS[background]
  Object.entries(backgroundData.bonuses).forEach(([stat, value]) => {
    finalStats[stat as keyof CharacterStats] += value
  })

  return finalStats
}

export function calculateStartingHP(endurance: number): number {
  return 10 + endurance * 2
}
