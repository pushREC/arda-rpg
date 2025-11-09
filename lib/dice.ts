import type { CharacterStats, DiceRollResult } from "./types"

export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1
}

export function getStatModifier(statValue: number): number {
  return Math.floor((statValue - 10) / 2)
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

export function calculateInitialStats(race: string): CharacterStats {
  const base: CharacterStats = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  }

  switch (race) {
    case "human":
      return {
        strength: 11,
        dexterity: 11,
        constitution: 11,
        intelligence: 11,
        wisdom: 11,
        charisma: 11,
      }
    case "elf":
      return {
        ...base,
        dexterity: 12,
        intelligence: 11,
      }
    case "dwarf":
      return {
        ...base,
        constitution: 12,
        strength: 11,
      }
    case "hobbit":
      return {
        ...base,
        dexterity: 12,
        charisma: 11,
      }
    default:
      return base
  }
}
