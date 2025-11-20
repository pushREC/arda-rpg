/**
 * TEMPORARY STUB FOR SPRINT 3 - DEV C
 *
 * This file provides temporary implementations to unblock Sprint 3 (Frontend/State) work.
 * Dev A will replace this with the full "Middle-earth Math" engine.
 *
 * DO NOT rely on these implementations long-term.
 *
 * Sprint 1 (Dev A) will implement:
 * - Full stat modifier calculations
 * - DC calculation formulas
 * - Damage tier system
 * - XP progression tables
 * - Loot validation logic
 */

/**
 * STUB: Calculate stat modifier for dice rolls
 *
 * Temporary implementation: Uses the stat value directly as modifier
 *
 * Real implementation (Dev A): Will use formula (statValue - 3) for 3-8 range
 * where Stat 3 = +0 modifier, Stat 8 = +5 modifier
 *
 * @param statValue - The character's stat value (currently 8-16 range in the game)
 * @returns The modifier to add to dice rolls
 */
export function getStatModifier(statValue: number): number {
  // STUB: Direct value as modifier (matches current game behavior)
  // Dev A will replace with: Math.max(0, statValue - 3)
  return Math.floor((statValue - 10) / 2) // D&D-style calculation as temporary measure
}

/**
 * STUB: Calculate Difficulty Class based on difficulty tier
 *
 * @param difficulty - The difficulty level
 * @returns The DC value to beat
 */
export function calculateDC(difficulty: 'easy' | 'medium' | 'hard'): number {
  const dcMap = {
    easy: 8,
    medium: 12,
    hard: 16,
  }
  return dcMap[difficulty]
}

/**
 * STUB: Calculate maximum health from endurance
 *
 * @param endurance - The character's endurance stat
 * @returns Maximum health value
 */
export function calculateMaxHealth(endurance: number): number {
  return 10 + (endurance * 2)
}

// Export placeholder for damage tiers (Dev A will implement full system)
export const DAMAGE_TIERS = {
  TRIVIAL: { min: 1, max: 3 },
  STANDARD: { min: 4, max: 8 },
  DANGEROUS: { min: 9, max: 15 },
  LETHAL: { min: 16, max: 25 },
} as const

export type DamageTier = keyof typeof DAMAGE_TIERS

/**
 * STUB: Calculate damage from tier
 *
 * @param tier - Damage tier
 * @param variance - Whether to randomize within tier range
 * @returns Damage amount
 */
export function calculateDamage(tier: DamageTier, variance: boolean = true): number {
  const range = DAMAGE_TIERS[tier]
  if (variance) {
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
  }
  return Math.floor((range.min + range.max) / 2)
}

// XP Table placeholder
export const XP_TABLE = {
  1: 100,  // Level 1 -> 2
  2: 250,  // Level 2 -> 3
  3: 450,  // Level 3 -> 4
} as const
