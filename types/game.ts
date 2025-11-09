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
