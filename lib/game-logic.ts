import type { Character, InventoryItem, ActiveEffect, CharacterStats } from "./types"

const SAVE_VERSION = "1.0.0"
const MAX_INVENTORY_SIZE = 50
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
            id: Date.now().toString(),
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

export function equipItem(item: InventoryItem, character: Character): Character {
  if (item.type !== "weapon" && item.type !== "armor") {
    return character
  }

  // Unequip other items of same type
  const updatedInventory = character.inventory.map((invItem) => {
    if (invItem.type === item.type && invItem.id !== item.id) {
      return { ...invItem, equipped: false }
    }
    if (invItem.id === item.id) {
      return { ...invItem, equipped: !item.equipped }
    }
    return invItem
  })

  // Calculate stats with equipment bonuses
  const equippedItems = updatedInventory.filter((i) => i.equipped && i.stats)
  const baseStats = { ...character.stats }
  const modifiedStats = { ...baseStats }

  equippedItems.forEach((equippedItem) => {
    if (equippedItem.stats) {
      Object.entries(equippedItem.stats).forEach(([stat, value]) => {
        modifiedStats[stat as keyof CharacterStats] += value as number
      })
    }
  })

  return {
    ...character,
    inventory: updatedInventory,
    stats: modifiedStats,
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
    return { success: true, data: JSON.parse(data) }
  } catch (error) {
    console.error("[v0] Load auto-save failed:", error)
    return { success: false }
  }
}

export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function getXPForNextLevel(currentLevel: number): number {
  return currentLevel * XP_PER_LEVEL
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
