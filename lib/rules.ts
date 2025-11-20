/**
 * ARDA RPG - Core Game Rules Engine
 *
 * This file is the SINGLE SOURCE OF TRUTH for all game mathematics.
 * All damage, XP, stat calculations, and difficulty checks MUST use these functions.
 *
 * DO NOT use magic numbers anywhere else in the codebase.
 */

import type { CharacterStats } from "./types"

// ============================================================================
// STAT SYSTEM - The "Middle-earth Math" (3-8 Scale)
// ============================================================================

/**
 * Converts a stat value (3-8) to a d20 modifier.
 *
 * Formula: Value - 3
 * - Stat 3 (Weak) = +0 modifier
 * - Stat 5 (Average) = +2 modifier
 * - Stat 8 (Legendary) = +5 modifier
 *
 * @param value - The stat value (should be 3-8)
 * @returns The modifier to add to dice rolls (0-5)
 */
export function getStatModifier(value: number): number {
  return Math.max(0, value - 3)
}

/**
 * Calculates difficulty class (DC) for skill checks.
 *
 * @param difficulty - The challenge difficulty
 * @returns The target DC number
 */
export function calculateDC(difficulty: "easy" | "medium" | "hard"): number {
  switch (difficulty) {
    case "easy":
      return 8
    case "medium":
      return 12
    case "hard":
      return 16
  }
}

/**
 * Calculates maximum health based on Endurance stat.
 *
 * Formula: 10 + (endurance * 2)
 * - Endurance 3 = 16 HP
 * - Endurance 5 = 20 HP
 * - Endurance 8 = 26 HP
 *
 * @param endurance - The character's Endurance stat
 * @returns Maximum health points
 */
export function calculateMaxHealth(endurance: number): number {
  return 10 + endurance * 2
}

// ============================================================================
// DAMAGE TIERS - The "Economy of Suffering"
// ============================================================================

/**
 * Standardized damage ranges to prevent AI hallucinations.
 *
 * The AI selects the tier, this code determines the actual damage.
 */
export const DAMAGE_TIERS = {
  TRIVIAL: { min: 1, max: 3, label: "scratch" },
  STANDARD: { min: 4, max: 8, label: "wound" },
  DANGEROUS: { min: 9, max: 15, label: "severe injury" },
  LETHAL: { min: 16, max: 25, label: "mortal wound" },
} as const

export type DamageTier = keyof typeof DAMAGE_TIERS

/**
 * Calculates damage from a damage tier.
 *
 * @param tier - The damage tier (TRIVIAL, STANDARD, DANGEROUS, LETHAL)
 * @param variance - If true, returns random value in range. If false, returns average.
 * @returns The damage amount
 */
export function calculateDamage(tier: DamageTier, variance: boolean = true): number {
  const tierData = DAMAGE_TIERS[tier]

  if (variance) {
    // Random damage between min and max (inclusive)
    return Math.floor(Math.random() * (tierData.max - tierData.min + 1)) + tierData.min
  } else {
    // Average damage (useful for AI decision-making)
    return Math.floor((tierData.min + tierData.max) / 2)
  }
}

// ============================================================================
// EXPERIENCE & LEVELING - The "XP Economy"
// ============================================================================

/**
 * XP required to reach each level.
 *
 * Level progression:
 * - Level 1: 0 XP (starting level)
 * - Level 2: 100 XP
 * - Level 3: 250 XP
 * - Level 4: 450 XP
 * - Level 5+: Previous + (Level * 200)
 */
export const XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 450,
  5: 750,
  6: 1150,
  7: 1650,
  8: 2250,
  9: 2950,
  10: 3750,
} as const

/**
 * Calculates current level from total XP.
 *
 * @param xp - Total experience points
 * @returns Current level (1-10+)
 */
export function calculateLevel(xp: number): number {
  for (let level = 10; level >= 1; level--) {
    if (xp >= XP_THRESHOLDS[level]) {
      return level
    }
  }
  return 1
}

/**
 * Gets XP needed for the next level.
 *
 * @param currentLevel - The character's current level
 * @returns XP threshold for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  const nextLevel = currentLevel + 1
  return XP_THRESHOLDS[nextLevel] ?? XP_THRESHOLDS[10] + (nextLevel - 10) * 800
}

// ============================================================================
// ITEM ICON KEYWORDS - Shared between Frontend & Backend
// ============================================================================

/**
 * Valid item keywords that trigger specific icons in the UI.
 *
 * When the AI generates items, names MUST contain one of these keywords
 * to ensure proper icon rendering.
 *
 * Example:
 * - ✅ "Elven Longsword" (contains "sword")
 * - ✅ "Health Potion" (contains "potion")
 * - ❌ "Glimmering Shard" (no match, gets default icon)
 */
export const VALID_ITEM_KEYWORDS = [
  // Weapons
  "sword",
  "longsword",
  "greatsword",
  "shortsword",
  "dagger",
  "knife",
  "bow",
  "longbow",
  "crossbow",
  "axe",
  "battleaxe",
  "hammer",
  "warhammer",
  "mace",
  "spear",
  "staff",
  "quarterstaff",

  // Armor & Protection
  "shield",
  "armor",
  "chainmail",
  "helmet",
  "gauntlets",
  "boots",

  // Clothing
  "clothes",
  "cloak",
  "robes",
  "tunic",
  "vest",
  "hat",

  // Magic Items
  "scroll",
  "rune",
  "wand",
  "orb",
  "amulet",
  "ring",
  "talisman",
  "charm",
  "enchanted",

  // Books & Knowledge
  "book",
  "tome",
  "text",
  "journal",
  "ledger",
  "map",
  "chart",
  "atlas",
  "manuscript",

  // Tools
  "rope",
  "supplies",
  "pickaxe",
  "shovel",
  "crowbar",
  "grappling",
  "lockpicks",
  "compass",
  "spyglass",
  "telescope",

  // Treasure
  "gem",
  "ruby",
  "emerald",
  "sapphire",
  "diamond",
  "jewel",
  "gold",
  "silver",
  "coins",
  "purse",
  "crown",
  "necklace",
  "bracelet",

  // Consumables
  "potion",
  "elixir",
  "food",
  "bread",
  "meat",
  "fish",
  "cheese",
  "apple",
  "berries",
  "herbs",
  "water",
  "waterskin",
  "ale",
  "wine",
  "bandage",
  "salve",

  // Quest Items
  "key",
  "artifact",
  "relic",
  "letter",
  "note",
  "token",
  "badge",
  "seal",

  // Supplies & Gear
  "bedroll",
  "tent",
  "lantern",
  "torch",
  "candle",
  "quiver",
  "arrows",
  "backpack",
  "sack",
  "chest",
  "barrel",
  "crate",
  "hourglass",
  "bell",
  "horn",
  "flute",
  "drum",

  // Nature & Misc
  "feather",
  "bone",
  "skull",
  "egg",
  "shell",
  "flower",
  "leaf",
  "seed",
  "vial",
  "jar",
  "bottle",
  "paint",
  "ink",
  "quill",
  "parchment",
  "canvas",
  "brush",
  "chisel",
  "needle",
  "thread",
] as const

/**
 * Validates if an item name contains a valid icon keyword.
 *
 * @param name - The item name to validate
 * @returns true if the name contains a valid keyword, false otherwise
 */
export function validateItemName(name: string): boolean {
  const normalizedName = name.toLowerCase().trim()

  return VALID_ITEM_KEYWORDS.some(
    (keyword) => normalizedName.includes(keyword) || keyword.includes(normalizedName)
  )
}

/**
 * Gets a suggested item type suffix if the name doesn't match any keywords.
 *
 * This is a fallback helper to ensure items always render with an icon.
 *
 * @param name - The original item name
 * @param itemType - The InventoryItem type
 * @returns A suggested name with keyword appended
 */
export function suggestItemNameWithKeyword(
  name: string,
  itemType: "weapon" | "armor" | "potion" | "quest" | "treasure"
): string {
  if (validateItemName(name)) {
    return name // Already has a keyword
  }

  // Append appropriate keyword based on item type
  switch (itemType) {
    case "weapon":
      return `${name} (Sword)`
    case "armor":
      return `${name} (Armor)`
    case "potion":
      return `${name} (Potion)`
    case "treasure":
      return `${name} (Gem)`
    case "quest":
      return `${name} (Artifact)`
    default:
      return `${name} (Item)`
  }
}

// ============================================================================
// GOLD REWARDS - The "Loot Economy"
// ============================================================================

/**
 * Standard gold reward ranges for different loot tiers.
 */
export const GOLD_REWARDS = {
  TRIVIAL: { min: 1, max: 5 }, // Pocket change
  COMMON: { min: 5, max: 15 }, // Common loot
  UNCOMMON: { min: 15, max: 40 }, // Valuable find
  RARE: { min: 40, max: 100 }, // Treasure hoard
  LEGENDARY: { min: 100, max: 250 }, // Dragon's hoard
} as const

export type GoldTier = keyof typeof GOLD_REWARDS

/**
 * Calculates gold reward from a loot tier.
 *
 * @param tier - The loot tier
 * @returns The gold amount
 */
export function calculateGoldReward(tier: GoldTier): number {
  const tierData = GOLD_REWARDS[tier]
  return Math.floor(Math.random() * (tierData.max - tierData.min + 1)) + tierData.min
}

// ============================================================================
// STAT CONSTRAINTS & VALIDATION
// ============================================================================

/**
 * Minimum stat value (weak).
 */
export const MIN_STAT_VALUE = 3

/**
 * Maximum stat value (legendary).
 */
export const MAX_STAT_VALUE = 8

/**
 * Validates that all character stats are within valid range.
 *
 * @param stats - The character's stats
 * @returns true if all stats are valid (3-8), false otherwise
 */
export function validateStats(stats: CharacterStats): boolean {
  return Object.values(stats).every((value) => value >= MIN_STAT_VALUE && value <= MAX_STAT_VALUE)
}

/**
 * Clamps a stat value to the valid range (3-8).
 *
 * @param value - The stat value to clamp
 * @returns The clamped value
 */
export function clampStat(value: number): number {
  return Math.max(MIN_STAT_VALUE, Math.min(MAX_STAT_VALUE, value))
}
