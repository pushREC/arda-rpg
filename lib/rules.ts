/**
 * ARDA RPG - Core Game Rules Engine
 *
 * This file is the SINGLE SOURCE OF TRUTH for all game mathematics.
 * All damage, XP, stat calculations, and difficulty checks MUST use these functions.
 *
 * DO NOT use magic numbers anywhere else in the codebase.
 */

import type { CharacterStats, InventoryItem, ActiveEffect, Companion } from "./types"

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
 * Detailed damage result for advanced use cases (critical hits, damage types, etc.)
 * Use this for future features that need more than just a number.
 */
export type DamageResult = {
  amount: number
  tier: DamageTier
  min: number
  max: number
  label: string
  // Future fields (not yet implemented):
  // critical?: boolean
  // damageType?: "physical" | "fire" | "poison" | "magic"
  // resistanceApplied?: boolean
}

/**
 * Calculates damage from a damage tier with level scaling.
 *
 * Formula: base damage + scaling bonus
 * Scaling: +1 damage every 2 levels (floors at integer)
 *
 * @param tier - The damage tier (TRIVIAL, STANDARD, DANGEROUS, LETHAL)
 * @param variance - If true, returns random value in range. If false, returns average.
 * @param level - Character level for scaling (default: 1)
 * @returns The damage amount with level scaling applied
 */
export function calculateDamage(tier: DamageTier, variance: boolean = true, level: number = 1): number {
  const tierData = DAMAGE_TIERS[tier]
  const scaling = Math.floor((level - 1) * 0.5) // +1 damage every 2 levels

  const base = variance
    ? Math.floor(Math.random() * (tierData.max - tierData.min + 1)) + tierData.min
    : Math.floor((tierData.min + tierData.max) / 2)

  return base + scaling
}

/**
 * Calculates detailed damage information (extended version).
 * Use this when you need more context than just a number.
 *
 * @param tier - The damage tier
 * @param variance - If true, returns random damage. If false, returns average.
 * @returns Detailed damage result with metadata
 */
export function calculateDamageDetailed(tier: DamageTier, variance: boolean = true): DamageResult {
  const tierData = DAMAGE_TIERS[tier]
  const amount = calculateDamage(tier, variance)

  return {
    amount,
    tier,
    min: tierData.min,
    max: tierData.max,
    label: tierData.label,
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
// TRADE ECONOMY - Merchant Pricing Rules
// ============================================================================

/**
 * Trading configuration for merchant interactions.
 *
 * - BUY_MULTIPLIER: How much the player pays relative to base value
 * - SELL_MULTIPLIER: How much the player gets when selling items
 * - PRICE_VARIANCE: Random price fluctuation (+/- percentage)
 */
export const TRADE_CONFIG = {
  BUY_MULTIPLIER: 1.0, // Player buys at full value
  SELL_MULTIPLIER: 0.5, // Player sells at 50% value
  PRICE_VARIANCE: 0.2, // Prices fluctuate +/- 20%
} as const

// ============================================================================
// COMPANION BONUSES - Fellowship Stat Modifiers
// ============================================================================

/**
 * Stat bonuses granted by companions based on their type.
 *
 * These bonuses are applied when a companion joins the party.
 * The keyword is matched against the companion's name or description.
 */
export const COMPANION_BONUSES: Record<string, { stat: keyof CharacterStats; bonus: number }> = {
  Ranger: { stat: "valor", bonus: 2 },
  Scholar: { stat: "lore", bonus: 2 },
  Merchant: { stat: "fellowship", bonus: 2 },
  Warrior: { stat: "valor", bonus: 2 },
  Guide: { stat: "wisdom", bonus: 2 },
  Rogue: { stat: "craft", bonus: 2 },
  Guardian: { stat: "endurance", bonus: 2 },
} as const

/**
 * Gets the stat bonus from companions for a specific action stat.
 *
 * Only ONE companion bonus applies (the first match).
 *
 * @param companions - The character's companions
 * @param actionStat - The stat being used for the action
 * @returns The bonus value (0 if no match)
 */
export function getCompanionBonus(companions: Companion[], actionStat: keyof CharacterStats): number {
  for (const companion of companions) {
    // Check if companion name or description matches a bonus type
    for (const [type, bonus] of Object.entries(COMPANION_BONUSES)) {
      const nameLower = companion.name.toLowerCase()
      const descLower = companion.description.toLowerCase()
      const typeLower = type.toLowerCase()

      if (nameLower.includes(typeLower) || descLower.includes(typeLower)) {
        if (bonus.stat === actionStat) {
          return bonus.bonus
        }
      }
    }
  }
  return 0
}

/**
 * Gets the stat bonus from active effects for a specific stat.
 *
 * Sums all buffs that affect the given stat.
 *
 * @param effects - Active effects on the character
 * @param stat - The stat to check
 * @returns The total bonus from all effects
 */
export function getActiveEffectBonus(effects: ActiveEffect[], stat: keyof CharacterStats): number {
  return effects
    .filter((effect) => effect.stat === stat)
    .reduce((total, effect) => total + effect.value, 0)
}

// ============================================================================
// RACE ABILITIES - The "Advantage" System
// ============================================================================

/**
 * Race-specific advantages for certain action types or stats.
 *
 * When a character's race grants advantage on a roll, they can roll twice
 * and take the better result (or get a bonus, depending on implementation).
 *
 * - Elf: Keen Senses (advantage on wisdom, investigation)
 * - Hobbit: Brave/Small (advantage on survival, stealth)
 * - Dwarf: Stone-cunning (advantage on endurance, craft)
 * - Human: Versatile (advantage on fellowship, valor)
 */
export const RACE_ABILITIES: Record<string, { advantage: string[] }> = {
  elf: { advantage: ["wisdom", "investigation"] },
  hobbit: { advantage: ["survival", "stealth"] },
  dwarf: { advantage: ["endurance", "craft"] },
  human: { advantage: ["fellowship", "valor"] },
} as const

/**
 * Determines if a character should roll with advantage based on their race.
 *
 * @param race - The character's race
 * @param actionType - The type of action being performed
 * @param stat - The stat being used for the action
 * @returns true if the race grants advantage for this action/stat
 */
export function shouldRollAdvantage(race: string, actionType: string, stat: keyof CharacterStats): boolean {
  const raceAbilities = RACE_ABILITIES[race.toLowerCase()]
  if (!raceAbilities) return false

  // Check if actionType or stat matches any advantage
  return raceAbilities.advantage.some((adv) => {
    return adv === actionType.toLowerCase() || adv === stat.toLowerCase()
  })
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

/**
 * Calculates derived stats from base stats, equipment, and active effects.
 *
 * This is the CORE STAT CALCULATION ENGINE that prevents "Stat Drift".
 * All stat modifications MUST go through this function.
 *
 * Formula: derived = base + equipment bonuses + effect bonuses
 *
 * @param baseStats - The character's base stats (naked, no equipment)
 * @param inventory - The character's inventory (equipped items add bonuses)
 * @param activeEffects - Active buffs/debuffs affecting the character
 * @returns Calculated effective stats
 */
export function calculateDerivedStats(
  baseStats: CharacterStats,
  inventory: InventoryItem[],
  activeEffects: ActiveEffect[]
): CharacterStats {
  // Clone base stats to avoid mutation
  const current: CharacterStats = { ...baseStats }

  // Add equipment bonuses (only equipped items)
  inventory.forEach((item) => {
    if (item.equipped && item.stats) {
      Object.entries(item.stats).forEach(([stat, value]) => {
        if (value !== undefined) {
          current[stat as keyof CharacterStats] += value
        }
      })
    }
  })

  // Add active effect bonuses
  activeEffects.forEach((effect) => {
    if (effect.type === "buff" && effect.stat && effect.value) {
      current[effect.stat] += effect.value
    }
  })

  // NOTE: Do NOT clamp derived stats - equipment can push you past base limits (3-8)
  // Only base stats should be clamped during character creation/leveling
  return current
}

// ============================================================================
// AI PROMPT OPTIMIZATION - Token Cost Reduction
// ============================================================================

/**
 * CURATED SUBSET for AI prompt injection (20 core keywords).
 *
 * This is a reduced list of the most common item keywords optimized for:
 * - Token efficiency in AI prompts
 * - 90%+ coverage of typical item types
 * - Reduced prompt injection cost
 *
 * Use this instead of VALID_ITEM_KEYWORDS when injecting into AI prompts.
 * The full list (VALID_ITEM_KEYWORDS) should still be used for validation.
 *
 * @example
 * ```typescript
 * const systemPrompt = `
 *   Generated items MUST contain one of these keywords:
 *   ${PROMPT_ITEM_KEYWORDS.join(", ")}
 * `
 * ```
 */
export const PROMPT_ITEM_KEYWORDS = [
  // Weapons (5 core types cover 80% of items)
  "sword",
  "bow",
  "dagger",
  "axe",
  "staff",

  // Armor (3 types)
  "shield",
  "armor",
  "helmet",

  // Magic Items (4 types)
  "scroll",
  "wand",
  "amulet",
  "ring",

  // Consumables (3 types)
  "potion",
  "food",
  "bandage",

  // Treasure (2 types)
  "gem",
  "gold",

  // Utility (3 types)
  "book",
  "map",
  "rope",
] as const

// ============================================================================
// STATE CHANGE SANITIZATION - Safety Clamps
// ============================================================================

/**
 * Sanitizes state changes from AI to prevent game-breaking values.
 *
 * This function enforces hard limits on state changes to ensure:
 * - No instant-death scenarios (max 25 damage per turn)
 * - No XP exploits (max 100 XP unless quest complete)
 * - No gold inflation (reasonable limits)
 * - No negative gold (prevent debt bugs)
 *
 * Use this on ALL AI-generated state changes before applying to game state.
 *
 * @param changes - The raw state changes from AI
 * @returns Sanitized state changes with clamped values
 *
 * @example
 * ```typescript
 * const aiResponse = await generateAIResponse(...)
 * const safeChanges = sanitizeStateChanges(aiResponse.stateChanges)
 * applyStateChanges(safeChanges)
 * ```
 */
export function sanitizeStateChanges(changes: any): any {
  const sanitized = { ...changes }

  // Clamp Health Damage (Max 25 dmg per turn = LETHAL tier max)
  if (typeof sanitized.health === "number") {
    // Allow healing up to +30 HP, damage down to -25 HP
    sanitized.health = Math.max(-DAMAGE_TIERS.LETHAL.max, Math.min(30, sanitized.health))
  }

  // Clamp XP (Max 100 unless quest complete)
  if (typeof sanitized.xp === "number" && !sanitized.questProgress?.questComplete) {
    // Prevent XP exploits, but allow quest completion bonus
    sanitized.xp = Math.min(100, Math.max(0, sanitized.xp))
  }

  // Clamp Gold (Max 250 = LEGENDARY tier, prevent negative)
  if (typeof sanitized.gold === "number") {
    // Allow legendary rewards, but prevent gold exploits
    sanitized.gold = Math.min(GOLD_REWARDS.LEGENDARY.max, Math.max(-100, sanitized.gold))
  }

  // Validate damage tier if specified
  if (sanitized.damageTier && !DAMAGE_TIERS[sanitized.damageTier as DamageTier]) {
    delete sanitized.damageTier // Remove invalid tier
  }

  return sanitized
}
