import type { Character, InventoryItem, ActiveEffect, CharacterStats, CombatState } from "./types"
import {
  calculateLevel as calculateLevelFromRules,
  getXPForNextLevel as getXPFromRules,
  validateItemName,
  suggestItemNameWithKeyword,
  calculateDerivedStats,
  calculateMaxHealth,
  ITEM_STAT_RANGES,
} from "./rules"
import { generateUUID } from "./utils"

const SAVE_VERSION = "1.0.0"
const MAX_INVENTORY_SIZE = 50

/**
 * Default combat state for new characters and migration.
 */
export const DEFAULT_COMBAT_STATE: CombatState = {
  isActive: false,
  enemyId: null,
  enemyName: null,
  enemyHpCurrent: 0,
  enemyHpMax: 0,
  roundCount: 0,
}

/**
 * Migrates old character saves to include new fields.
 * Ensures backward compatibility with existing save files.
 *
 * @param char - Raw character object (potentially missing new fields)
 * @returns Fully migrated Character object
 */
export function migrateCharacter(char: any): Character {
  // Handle baseStats migration - CRITICAL for backward compatibility
  if (!char.baseStats) {
    // Assume current stats are base stats for old saves
    // This prevents data loss from pre-Sprint 6 saves
    char.baseStats = { ...char.stats }
  }

  return {
    ...char,
    baseStats: char.baseStats,
    combat: char.combat || { ...DEFAULT_COMBAT_STATE },
    isDead: char.isDead ?? false,
  }
}

/**
 * @deprecated Use calculateLevel from lib/rules.ts instead
 */
const XP_PER_LEVEL = 100

export function useItem(
  item: InventoryItem,
  character: Character,
  currentHealth: number,
): {
  success: boolean
  message: string
  healthChange?: number
  statChange?: Partial<CharacterStats>
  effect?: ActiveEffect
} {
  if (!item.consumable && item.type !== "potion") {
    return { success: false, message: "This item cannot be used" }
  }

  if (item.effect) {
    switch (item.effect.type) {
      case "heal":
        const healAmount = item.effect.value
        const newHealth = Math.min(character.maxHealth, currentHealth + healAmount)
        const actualHeal = newHealth - currentHealth
        return {
          success: true,
          message: `Restored ${actualHeal} health`,
          healthChange: actualHeal,
        }

      case "buff":
        return {
          success: true,
          message: `${item.name} takes effect!`,
          effect: {
            id: generateUUID(),
            name: item.name,
            type: "buff",
            value: item.effect.value,
            remainingTurns: item.effect.duration || 3,
          },
        }

      default:
        return { success: false, message: "Unknown effect type" }
    }
  }

  return { success: false, message: "Item has no effect" }
}

/**
 * Equips or unequips an item on the character.
 *
 * This is the NEW NON-DESTRUCTIVE implementation that prevents "Stat Drift".
 * Instead of manually adding/subtracting stat values, we:
 * 1. Toggle the equipped boolean in inventory
 * 2. Recalculate ALL derived stats from baseStats
 *
 * @param item - The item to equip/unequip
 * @param character - The character
 * @returns Updated character with new inventory and recalculated stats
 */
export function equipItem(item: InventoryItem, character: Character): Character {
  if (item.type !== "weapon" && item.type !== "armor") {
    return character
  }

  // Unequip other items of same type and toggle the target item
  const updatedInventory = character.inventory.map((invItem) => {
    if (invItem.type === item.type && invItem.id !== item.id) {
      // Unequip other items of same type (only one weapon, one armor at a time)
      return { ...invItem, equipped: false }
    }
    if (invItem.id === item.id) {
      // Toggle the equipped status of the target item
      return { ...invItem, equipped: !item.equipped }
    }
    return invItem
  })

  // CRITICAL: Recalculate derived stats from baseStats (NO manual math!)
  // This prevents stat drift by always calculating from the source of truth
  const derivedStats = calculateDerivedStats(
    character.baseStats,
    updatedInventory,
    [] // TODO: Pass active effects from game state when available
  )

  return {
    ...character,
    inventory: updatedInventory,
    stats: derivedStats,
  }
}

export function saveGame(gameData: any): { success: boolean; error?: string } {
  try {
    const saveData = {
      ...gameData,
      version: SAVE_VERSION,
      timestamp: new Date().toISOString(),
    }

    const existingSaves = getSaves()
    const newSaves = [...existingSaves, saveData]

    localStorage.setItem("gameSaves", JSON.stringify(newSaves))
    return { success: true }
  } catch (error) {
    console.error("[v0] Save game error:", error)
    return { success: false, error: "Failed to save game. Storage may be full." }
  }
}

export function loadGame(saveId: string): { success: boolean; data?: any; error?: string } {
  try {
    const saves = getSaves()
    const save = saves.find((s) => s.id === saveId)

    if (!save) {
      return { success: false, error: "Save not found" }
    }

    // Version compatibility check
    if (save.version !== SAVE_VERSION) {
      return {
        success: false,
        error: "Save file is from an incompatible version",
      }
    }

    // Migrate character data to ensure new fields are present
    if (save.character) {
      save.character = migrateCharacter(save.character)
    }

    return { success: true, data: save }
  } catch (error) {
    console.error("[v0] Load game error:", error)
    return { success: false, error: "Failed to load game. Save data may be corrupted." }
  }
}

export function getSaves(): any[] {
  try {
    const data = localStorage.getItem("gameSaves")
    if (!data) return []
    return JSON.parse(data)
  } catch (error) {
    console.error("[v0] Error reading saves:", error)
    return []
  }
}

export function deleteSave(saveId: string): boolean {
  try {
    const saves = getSaves()
    const filtered = saves.filter((s) => s.id !== saveId)
    localStorage.setItem("gameSaves", JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error("[v0] Error deleting save:", error)
    return false
  }
}

export function autoSave(gameData: any): void {
  try {
    localStorage.setItem("autoSave", JSON.stringify({ ...gameData, timestamp: new Date().toISOString() }))
  } catch (error) {
    console.error("[v0] Auto-save failed:", error)
  }
}

export function loadAutoSave(): { success: boolean; data?: any } {
  try {
    const data = localStorage.getItem("autoSave")
    if (!data) return { success: false }
    const parsedData = JSON.parse(data)

    // Migrate character data to ensure new fields are present
    if (parsedData.character) {
      parsedData.character = migrateCharacter(parsedData.character)
    }

    return { success: true, data: parsedData }
  } catch (error) {
    console.error("[v0] Load auto-save failed:", error)
    return { success: false }
  }
}

/**
 * Calculates current level from total XP.
 * Uses the tiered XP system from lib/rules.ts.
 *
 * @param xp - Total experience points
 * @returns Current level (1-10+)
 */
export function calculateLevel(xp: number): number {
  return calculateLevelFromRules(xp)
}

/**
 * Gets XP needed for the next level.
 * Uses the tiered XP system from lib/rules.ts.
 *
 * @param currentLevel - The character's current level
 * @returns XP threshold for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  return getXPFromRules(currentLevel)
}

export function checkLevelUp(
  currentXP: number,
  currentLevel: number,
): { leveledUp: boolean; newLevel: number; remainingXP: number } {
  const xpNeeded = getXPForNextLevel(currentLevel)
  if (currentXP >= xpNeeded) {
    return {
      leveledUp: true,
      newLevel: currentLevel + 1,
      remainingXP: currentXP - xpNeeded,
    }
  }
  return { leveledUp: false, newLevel: currentLevel, remainingXP: currentXP }
}

export function detectQuestCompletion(narrative: string, turnCount: number, scenario: any): boolean {
  const completionKeywords = [
    "quest complete",
    "mission accomplished",
    "victory",
    "you have succeeded",
    "the deed is done",
    "peace is restored",
    "evil is vanquished",
  ]

  const narrativeLower = narrative.toLowerCase()
  const hasKeyword = completionKeywords.some((keyword) => narrativeLower.includes(keyword))

  // Preset scenarios have turn limits
  if (scenario && !scenario.customConfig && turnCount >= 20) {
    return true
  }

  return hasKeyword
}

export function parseStateChanges(narrative: string): {
  health?: number
  gold?: number
  xp?: number
  items?: string[]
} {
  const changes: any = {}

  // Health changes
  const healthPatterns = [
    /(?:lose|lost|take|took)s?\s+(\d+)\s+(?:health|damage|hp)/i,
    /(\d+)\s+damage/i,
    /(?:heal|restore|gain)s?\s+(\d+)\s+(?:health|hp)/i,
  ]

  healthPatterns.forEach((pattern) => {
    const match = narrative.match(pattern)
    if (match) {
      const value = Number.parseInt(match[1])
      if (pattern.source.includes("lose|lost|take|took|damage")) {
        changes.health = -value
      } else {
        changes.health = value
      }
    }
  })

  // Gold changes
  const goldPatterns = [/(?:find|found|gain|receive)s?\s+(\d+)\s+gold/i, /(\d+)\s+gold\s+pieces/i]

  goldPatterns.forEach((pattern) => {
    const match = narrative.match(pattern)
    if (match) {
      changes.gold = Number.parseInt(match[1])
    }
  })

  // XP/Experience
  const xpPatterns = [/(?:gain|earn)s?\s+(\d+)\s+(?:xp|experience)/i]

  xpPatterns.forEach((pattern) => {
    const match = narrative.match(pattern)
    if (match) {
      changes.xp = Number.parseInt(match[1])
    }
  })

  // Items found
  const itemPatterns = [/(?:find|found|discover|obtain)s?\s+(?:a|an|the)\s+([A-Z][a-z\s]+)/g]

  itemPatterns.forEach((pattern) => {
    const matches = narrative.matchAll(pattern)
    for (const match of matches) {
      if (!changes.items) changes.items = []
      changes.items.push(match[1].trim())
    }
  })

  return changes
}

export function applyStateChanges(
  stateChanges: any,
  character: Character,
  currentHealth: number,
  currentXP: number,
  onNotification: (type: string, value: any) => void,
): {
  updatedCharacter: Character
  newHealth: number
  newXP: number
  effects: ActiveEffect[]
} {
  const updatedCharacter = { ...character }
  let newHealth = currentHealth
  let newXP = currentXP
  const effects: ActiveEffect[] = []

  // Health changes
  if (stateChanges.health !== undefined) {
    newHealth = Math.max(0, Math.min(character.maxHealth, currentHealth + stateChanges.health))

    if (stateChanges.health > 0) {
      onNotification("health", stateChanges.health)
    } else if (stateChanges.health < 0) {
      onNotification("damage", Math.abs(stateChanges.health))
    }
  }

  // Gold changes
  if (stateChanges.gold !== undefined) {
    updatedCharacter.gold = (updatedCharacter.gold || 0) + stateChanges.gold
    onNotification("gold", stateChanges.gold)
  }

  // XP changes
  if (stateChanges.xp !== undefined) {
    newXP += stateChanges.xp
    onNotification("xp", stateChanges.xp)
  }

  // Inventory additions
  if (stateChanges.inventory && Array.isArray(stateChanges.inventory)) {
    if (canAddToInventory(updatedCharacter.inventory, stateChanges.inventory.length)) {
      updatedCharacter.inventory = [...updatedCharacter.inventory, ...stateChanges.inventory]
      stateChanges.inventory.forEach((item: any) => {
        onNotification("item", item.name)
      })
    }
  }

  // Inventory removals
  if (stateChanges.removeItems && Array.isArray(stateChanges.removeItems)) {
    updatedCharacter.inventory = updatedCharacter.inventory.filter(
      (item) => !stateChanges.removeItems.includes(item.id),
    )
  }

  // Companion additions
  if (stateChanges.companions && Array.isArray(stateChanges.companions)) {
    updatedCharacter.companions = [...updatedCharacter.companions, ...stateChanges.companions]
  }

  // Companion relationship updates
  if (stateChanges.updateCompanions && Array.isArray(stateChanges.updateCompanions)) {
    updatedCharacter.companions = updatedCharacter.companions.map((companion) => {
      const update = stateChanges.updateCompanions.find((u: any) => u.id === companion.id)
      if (update) {
        return {
          ...companion,
          relationship: Math.max(-100, Math.min(100, companion.relationship + update.relationshipChange)),
        }
      }
      return companion
    })
  }

  // Effects
  if (stateChanges.effects && Array.isArray(stateChanges.effects)) {
    effects.push(...stateChanges.effects)
  }

  return {
    updatedCharacter,
    newHealth,
    newXP,
    effects,
  }
}

export function canAddToInventory(inventory: InventoryItem[], additionalCount = 1): boolean {
  return inventory.length + additionalCount <= MAX_INVENTORY_SIZE
}

export function getInventorySpace(inventory: InventoryItem[]): { used: number; max: number } {
  return {
    used: inventory.length,
    max: MAX_INVENTORY_SIZE,
  }
}

export function validateAIResponse(response: any): { valid: boolean; error?: string } {
  if (!response) {
    return { valid: false, error: "Empty response from AI" }
  }

  if (!response.narrative || typeof response.narrative !== "string") {
    return { valid: false, error: "Missing or invalid narrative" }
  }

  if (!response.choices || !Array.isArray(response.choices) || response.choices.length === 0) {
    return { valid: false, error: "Missing or invalid choices" }
  }

  // Validate each choice has required fields
  for (const choice of response.choices) {
    if (!choice.text || typeof choice.text !== "string") {
      return { valid: false, error: "Invalid choice format" }
    }
  }

  return { valid: true }
}

export function validateGameData(): { valid: boolean; character?: any; scenario?: any; error?: string } {
  try {
    const characterData = localStorage.getItem("character")
    const scenarioData = localStorage.getItem("scenario")

    if (!characterData || !scenarioData) {
      return { valid: false, error: "Missing game data" }
    }

    const character = JSON.parse(characterData)
    const scenario = JSON.parse(scenarioData)

    if (!character.name || !character.race || !character.stats) {
      return { valid: false, error: "Invalid character data" }
    }

    if (!scenario.id || !scenario.title) {
      return { valid: false, error: "Invalid scenario data" }
    }

    return { valid: true, character, scenario }
  } catch (error) {
    return { valid: false, error: "Corrupted game data" }
  }
}

/**
 * Re-export item validation functions from lib/rules.ts for convenience.
 */
export { validateItemName, suggestItemNameWithKeyword }

// ============================================================================
// SPRINT 10: SYSTEMS REALISM - Item Stats, Level Up, Effect Decay
// ============================================================================

/**
 * Generates stat bonuses for an item based on its type and rarity.
 *
 * TICKET 10.1: The Item Stat Generator
 *
 * Logic:
 * - Determines primary stat based on item type (weapon->valor, armor->endurance, etc.)
 * - Rolls a value between min/max from ITEM_STAT_RANGES based on rarity
 * - Legendary items also get a bonus +1 to a random secondary stat
 *
 * @param type - The item type (weapon, armor, staff, etc.)
 * @param rarity - The item rarity (common, rare, legendary, artifact)
 * @returns Stat bonuses for the item
 *
 * @example
 * generateItemStats('weapon', 'rare') // { valor: 2 }
 * generateItemStats('armor', 'legendary') // { endurance: 3, valor: 1 }
 */
export function generateItemStats(type: string, rarity: string): Partial<CharacterStats> {
  // Get stat range from rarity (default to common if not found)
  const range = ITEM_STAT_RANGES[rarity as keyof typeof ITEM_STAT_RANGES] || ITEM_STAT_RANGES.common

  // Determine primary stat based on type
  let primaryStat: keyof CharacterStats = "valor" // default fallback
  const typeLower = type.toLowerCase()

  if (typeLower.includes("weapon") || typeLower.includes("sword") || typeLower.includes("axe") || typeLower.includes("mace") || typeLower.includes("hammer")) {
    primaryStat = "valor"
  } else if (typeLower.includes("armor") || typeLower.includes("shield") || typeLower.includes("helmet") || typeLower.includes("chainmail")) {
    primaryStat = "endurance"
  } else if (typeLower.includes("staff") || typeLower.includes("wand") || typeLower.includes("scroll") || typeLower.includes("book")) {
    primaryStat = "lore"
  } else if (typeLower.includes("bow") || typeLower.includes("dagger") || typeLower.includes("crossbow")) {
    primaryStat = "craft"
  }

  // Roll value between min and max
  const primaryValue = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min

  const stats: Partial<CharacterStats> = {
    [primaryStat]: primaryValue,
  }

  // Legendary items get a bonus secondary stat (+1)
  if (rarity === "legendary") {
    const secondaryStats: Array<keyof CharacterStats> = ["valor", "wisdom", "fellowship", "craft", "endurance", "lore"]
    const availableStats = secondaryStats.filter(s => s !== primaryStat)
    const secondaryStat = availableStats[Math.floor(Math.random() * availableStats.length)]
    stats[secondaryStat] = 1
  }

  return stats
}

/**
 * Applies level up stat increases to a character.
 *
 * TICKET 10.2: Level Up Application Logic
 *
 * Logic:
 * - Adds stat increases to character.baseStats
 * - Recalculates max health based on new endurance
 * - Heals character by the health increase amount
 * - Increments level by 1
 * - Recalculates derived stats (stats = baseStats + equipment + effects)
 *
 * @param character - The character to level up
 * @param statIncreases - The stat increases to apply (e.g., { valor: 1 })
 * @returns Updated character with new level and stats
 *
 * @example
 * applyLevelUp(char, { valor: 1, endurance: 1 }) // Level up with +1 valor, +1 endurance
 */
export function applyLevelUp(character: Character, statIncreases: Partial<CharacterStats>): Character {
  // Clone character to avoid mutation
  const updated = { ...character }

  // Safety: If baseStats is missing, initialize it from stats (migration safety)
  if (!updated.baseStats) {
    updated.baseStats = { ...updated.stats }
  }

  // Calculate old max HP before stat changes
  const oldMaxHp = calculateMaxHealth(updated.baseStats.endurance)

  // Apply stat increases to baseStats
  const newBaseStats: CharacterStats = { ...updated.baseStats }
  Object.entries(statIncreases).forEach(([stat, value]) => {
    if (value !== undefined) {
      newBaseStats[stat as keyof CharacterStats] += value
    }
  })
  updated.baseStats = newBaseStats

  // Recalculate max health with new endurance
  const newMaxHp = calculateMaxHealth(newBaseStats.endurance)
  const hpDiff = newMaxHp - oldMaxHp

  // Heal character by the HP increase (or use full heal if preferred)
  updated.health = Math.min(newMaxHp, updated.health + hpDiff)
  updated.maxHealth = newMaxHp

  // Increment level
  updated.level += 1

  // Recalculate derived stats (base + equipment + effects)
  // Note: We pass empty activeEffects array here as they're managed in game state
  updated.stats = calculateDerivedStats(newBaseStats, updated.inventory, [])

  return updated
}

/**
 * Processes active effects at the end of a turn, decrementing durations and removing expired effects.
 *
 * TICKET 10.3: Effect Entropy (Fixing Eternal Potions)
 *
 * Logic:
 * - Decrements remainingTurns for each active effect
 * - Removes effects with remainingTurns <= 0
 * - Recalculates derived stats to reflect removed buffs
 * - Returns updated character and list of expired effect names
 *
 * @param character - The character whose effects to process
 * @param activeEffects - The current active effects (from game state)
 * @returns Updated character and list of expired effect names
 *
 * @example
 * const result = processTurnEffects(char, activeEffects)
 * // result.character - updated character
 * // result.expiredEffects - ["Health Potion", "Strength Elixir"]
 */
export function processTurnEffects(
  character: Character,
  activeEffects: ActiveEffect[]
): { character: Character; expiredEffects: string[] } {
  const expiredEffects: string[] = []

  // Process each effect: decrement turns and filter out expired ones
  const updatedEffects = activeEffects
    .map(effect => ({
      ...effect,
      remainingTurns: effect.remainingTurns - 1,
    }))
    .filter(effect => {
      if (effect.remainingTurns <= 0) {
        expiredEffects.push(effect.name)
        return false // Remove expired effect
      }
      return true // Keep active effect
    })

  // Recalculate derived stats with updated effects
  const updatedStats = calculateDerivedStats(
    character.baseStats,
    character.inventory,
    updatedEffects
  )

  return {
    character: {
      ...character,
      stats: updatedStats,
    },
    expiredEffects,
  }
}
