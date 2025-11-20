/**
 * GAME RULES ENGINE - Middle-earth RPG Math
 *
 * This file contains the deterministic logic for the 6-stat system (3-8 scale).
 * The AI selects outcomes (tiers/events), but this code calculates the results (numbers).
 *
 * STATUS: Contract-first implementation to unblock Sprint 2 (Dev B).
 * Dev A should replace/enhance this with full implementation + unit tests.
 */

// ============================================================================
// ITEM ICON KEYWORDS (Extracted from lib/item-icons.tsx)
// ============================================================================

/**
 * Valid keywords that trigger icon rendering in the UI.
 * Items MUST contain at least one of these keywords to display correctly.
 *
 * Example: "Elven Dagger" ✅ (contains "dagger")
 * Example: "Shiny Shard" ❌ (no keyword match)
 */
export const VALID_ITEM_KEYWORDS = [
  // Weapons
  "sword", "longsword", "greatsword", "shortsword", "dagger", "knife",
  "bow", "longbow", "crossbow", "axe", "battleaxe", "hammer", "warhammer",
  "mace", "spear", "staff", "quarterstaff",

  // Armor & Protection
  "shield", "armor", "chainmail", "helmet", "gauntlets", "boots",

  // Clothing
  "clothes", "cloak", "robes", "tunic", "vest", "hat",

  // Magic Items
  "scroll", "rune", "wand", "orb", "amulet", "ring", "talisman", "charm", "enchanted",

  // Books & Knowledge
  "book", "tome", "text", "journal", "ledger", "map", "chart", "atlas", "manuscript",

  // Tools
  "rope", "supplies", "pickaxe", "shovel", "crowbar", "grappling", "lockpicks",
  "compass", "spyglass", "telescope",

  // Treasure
  "gem", "ruby", "emerald", "sapphire", "diamond", "jewel", "gold", "silver",
  "coins", "purse", "crown", "necklace", "bracelet",

  // Consumables
  "potion", "elixir", "food", "bread", "meat", "fish", "cheese", "apple",
  "berries", "herbs", "water", "waterskin", "ale", "wine", "bandage", "salve",

  // Quest Items
  "key", "artifact", "relic", "letter", "note", "token", "badge", "seal",

  // Supplies & Gear
  "bedroll", "tent", "lantern", "torch", "candle", "quiver", "arrows",
  "backpack", "sack", "chest", "barrel", "crate",

  // Nature & Misc
  "feather", "bone", "skull", "egg", "shell", "flower", "leaf", "seed",
  "vial", "jar", "bottle", "paint", "ink", "quill", "parchment"
];

/**
 * Validates that an item name contains at least one valid keyword.
 * If not, suggests adding a keyword or returns a fallback.
 */
export function validateItemName(name: string): {
  isValid: boolean;
  keyword?: string;
  suggestion?: string
} {
  const normalizedName = name.toLowerCase();

  for (const keyword of VALID_ITEM_KEYWORDS) {
    if (normalizedName.includes(keyword)) {
      return { isValid: true, keyword };
    }
  }

  // No keyword found - suggest a fallback
  return {
    isValid: false,
    suggestion: `${name} (Item)` // Generic fallback
  };
}

// ============================================================================
// THE 6-STAT SYSTEM (3-8 Scale, NOT D&D)
// ============================================================================

/**
 * Calculate stat modifier from base stat value.
 * Formula: Math.max(0, statValue - 3)
 *
 * Examples:
 * - Stat 3 → +0 modifier
 * - Stat 5 → +2 modifier
 * - Stat 8 → +5 modifier
 */
export function getStatModifier(statValue: number): number {
  return Math.max(0, statValue - 3);
}

/**
 * Calculate Difficulty Class (DC) for checks.
 */
export function calculateDC(difficulty: "easy" | "medium" | "hard"): number {
  switch (difficulty) {
    case "easy":
      return 8;
    case "medium":
      return 12;
    case "hard":
      return 16;
    default:
      return 12;
  }
}

/**
 * Calculate maximum health from Endurance stat.
 * Formula: 10 + (endurance * 2)
 *
 * Examples:
 * - Endurance 3 → 16 HP
 * - Endurance 5 → 20 HP
 * - Endurance 8 → 26 HP
 */
export function calculateMaxHealth(endurance: number): number {
  return 10 + (endurance * 2);
}

// ============================================================================
// DAMAGE TIER SYSTEM (The "Economy of Suffering")
// ============================================================================

export type DamageTier = "trivial" | "standard" | "dangerous" | "lethal" | "none";

export const DAMAGE_TIERS: Record<DamageTier, { min: number; max: number }> = {
  none: { min: 0, max: 0 },
  trivial: { min: 1, max: 3 },
  standard: { min: 4, max: 8 },
  dangerous: { min: 9, max: 15 },
  lethal: { min: 16, max: 25 },
};

/**
 * Calculate damage based on tier.
 *
 * @param tier - The severity tier (AI selects this)
 * @param variance - If true, return random value in range. If false, return average.
 * @returns Damage amount as positive integer
 */
export function calculateDamage(tier: DamageTier, variance: boolean = true): number {
  const range = DAMAGE_TIERS[tier];

  if (!variance) {
    // Return average (for predictable testing)
    return Math.floor((range.min + range.max) / 2);
  }

  // Return random value in range
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

// ============================================================================
// XP SYSTEM
// ============================================================================

/**
 * XP required to reach each level.
 * Level calculation: Math.floor(totalXP / 100) + 1
 */
export const XP_TABLE = {
  level1to2: 100,
  level2to3: 250,
  level3to4: 450,
  level4to5: 700,
  level5to6: 1000,
};

/**
 * XP rewards by challenge difficulty.
 */
export const XP_REWARDS: Record<"minor" | "moderate" | "major" | "legendary", number> = {
  minor: 15,
  moderate: 35,
  major: 60,
  legendary: 100,
};

/**
 * Calculate current level from total XP.
 */
export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 100) + 1;
}

// ============================================================================
// SANITIZATION & VALIDATION
// ============================================================================

/**
 * Sanitize state changes to prevent AI from breaking game balance.
 *
 * @param stateChanges - Raw state changes from AI
 * @returns Sanitized state changes with clamped values
 */
export function sanitizeStateChanges(stateChanges: any): any {
  const sanitized = { ...stateChanges };

  // Clamp health changes (max 25 damage from lethal tier)
  if (sanitized.health !== undefined) {
    if (sanitized.health < -25) {
      console.warn(`[RULES] Clamping excessive damage: ${sanitized.health} → -25`);
      sanitized.health = -25;
    }
    if (sanitized.health > 30) {
      console.warn(`[RULES] Clamping excessive healing: ${sanitized.health} → 30`);
      sanitized.health = 30;
    }
  }

  // Clamp XP (max 100 unless victory condition)
  if (sanitized.xp !== undefined && sanitized.xp > 100) {
    if (!sanitized.questProgress?.questComplete) {
      console.warn(`[RULES] Clamping excessive XP: ${sanitized.xp} → 100`);
      sanitized.xp = 100;
    }
  }

  // Ensure gold changes are positive unless explicit theft
  if (sanitized.gold !== undefined && sanitized.gold < -50) {
    console.warn(`[RULES] Clamping excessive gold loss: ${sanitized.gold} → -50`);
    sanitized.gold = -50;
  }

  return sanitized;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  VALID_ITEM_KEYWORDS,
  validateItemName,
  getStatModifier,
  calculateDC,
  calculateMaxHealth,
  DAMAGE_TIERS,
  calculateDamage,
  XP_TABLE,
  XP_REWARDS,
  calculateLevel,
  sanitizeStateChanges,
};
