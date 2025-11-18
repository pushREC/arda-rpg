// ⚠️ DEPRECATED: This file uses an old stat system and is NOT used in the current game.
// The active type definitions are in /lib/types.ts with the correct 6-stat system:
// valor, wisdom, fellowship, craft, endurance, lore
//
// This file is kept for reference only and should NOT be imported.

export interface CharacterStats {
  health: number
  attack: number
  defense: number
  agility: number
}

export interface CharacterClass {
  id: string
  name: string
  description: string
  baseStats: CharacterStats
  color: string
  bgColor: string
}

export interface Character {
  name: string
  class: CharacterClass
  stats: CharacterStats & { maxHealth: number; currentHealth: number }
  level: number
  experience: number
  achievements: string[]
}

export interface Scenario {
  id: string
  title: string
  description: string
  difficulty: "easy" | "medium" | "hard"
  estimatedLength: string
  tags: string[]
}

export interface StoryEntry {
  id: string
  type: "narration" | "action" | "dice-roll" | "combat"
  text: string
  timestamp: Date
}

export interface GameState {
  character: Character
  scenario: Scenario
  storyEntries: StoryEntry[]
  currentChoices: string[]
  isComplete: boolean
}
