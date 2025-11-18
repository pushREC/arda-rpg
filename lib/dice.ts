import type { CharacterStats, DiceRollResult } from "./types"

export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1
}

export function getStatModifier(statValue: number): number {
  // In this game, stats range from 3-8 (base) up to ~14 (with bonuses)
  // The stat value itself IS the modifier (not D&D's (stat-10)/2 formula)
  // Example: Valor 7 gives +7 to rolls, not (7-10)/2 = -1
  return statValue
}

export function performStatCheck(stat: keyof CharacterStats, statValue: number, dc: number): DiceRollResult {
  const roll = rollD20()
  const modifier = getStatModifier(statValue)
  const total = roll + modifier

  return {
    roll,
    modifier,
    total,
    dc,
    success: total >= dc,
    stat,
  }
}

// NOTE: calculateInitialStats was removed because it used D&D 5e stat names
// (strength, dexterity, etc.) instead of this game's custom stat system
// (valor, wisdom, fellowship, craft, endurance, lore).
// Character creation is handled by lib/character-data.ts instead.
