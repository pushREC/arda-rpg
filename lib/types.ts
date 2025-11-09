export type Race = "human" | "elf" | "dwarf" | "hobbit"

export type Background = "ranger" | "scholar" | "merchant" | "soldier" | "wanderer"

export type CharacterStats = {
  valor: number // Combat prowess, bravery (replaces attack)
  wisdom: number // Perception, insight
  fellowship: number // Social skills, charisma
  craft: number // Dexterity, skill with tools (replaces agility)
  endurance: number // Constitution, stamina (replaces defense)
  lore: number // Knowledge, intelligence
}

export type Character = {
  id: string
  name: string
  race: Race
  background: Background
  raceAbility: string
  stats: CharacterStats
  level: number
  experience: number
  health: number
  maxHealth: number
  gold: number
  inventory: InventoryItem[]
  companions: Companion[]
}

export type InventoryItem = {
  id: string
  name: string
  description: string
  type: "weapon" | "armor" | "potion" | "quest" | "treasure"
  quantity: number
  value: number
}

export type Companion = {
  id: string
  name: string
  relationship: number // -100 to 100
  description: string
}

export type StoryTurn = {
  id: string
  timestamp: number
  type: "narrative" | "player-choice" | "dice-roll"
  content: string
  choice?: string
  diceResult?: DiceRollResult
}

export type DiceRollResult = {
  roll: number
  modifier: number
  total: number
  dc: number // difficulty class
  success: boolean
  stat: keyof CharacterStats
}

export type Choice = {
  id: string
  text: string
  requiresStat?: {
    stat: keyof CharacterStats
    value: number
  }
  requiresItem?: string
}

export type ScenarioTone =
  | "dark"
  | "hopeful"
  | "mysterious"
  | "epic"
  | "personal"
  | "desperate"
  | "whimsical"
  | "melancholic"

export type CustomScenarioConfig = {
  // Core Identity
  id: string
  generatedAt: number

  // User Selections
  creationMethod: "quick" | "vibe-first" | "full-custom"

  // Vibe-First Path Data
  vibes?: string[]

  // Full Custom Path Data
  region?: string
  location?: string
  locationDescription?: string
  questHook?: string
  urgency?: "immediate" | "building" | "slow-burn"
  stakes?: "personal" | "community" | "kingdom" | "world"

  // Tone & Style (both paths)
  tones: ScenarioTone[]
  combatFrequency: number // 1-5 scale

  // Companions (both paths)
  companionPreference: "solo" | "single-ally" | "small-party" | "large-fellowship"
  companionType?: string

  // Unique Element (optional)
  uniqueElement?: string

  // AI Generation Context
  aiContext: {
    userPrompt?: string
    characterContext: string
    generatedNarrative?: string
  }

  // Mutable (for mid-game changes)
  modifications?: Array<{
    turnNumber: number
    changedFields: Partial<CustomScenarioConfig>
    reason: string
  }>
}

export type VibeOption = {
  id: string
  label: string
  description: string
  icon: string
  suggestedTones: ScenarioTone[]
  suggestedCombat: number
  suggestedRegions: string[]
}

export type RegionOption = {
  id: string
  name: string
  description: string
  icon: string
}

export type ToneOption = {
  id: ScenarioTone
  label: string
  icon: string
  color: string
}

export type Scenario = {
  id: string
  title: string
  description: string
  difficulty: "easy" | "medium" | "hard" | "legendary"
  estimatedTime: string
  imageUrl?: string
  unlocked: boolean
  customConfig?: CustomScenarioConfig
}

export type Achievement = {
  id: string
  title: string
  description: string
  unlocked: boolean
  unlockedAt?: number
  icon: string
}

export type GameState = {
  character: Character | null
  currentScenario: Scenario | null
  storyHistory: StoryTurn[]
  choices: Choice[]
  isGenerating: boolean
  lastSaved: number
  achievements: Achievement[]
  turnCount: number
}

export type ActionType = "combat" | "social" | "investigation" | "agility" | "narrative" | "stealth" | "survival"

export type StatType = "valor" | "wisdom" | "fellowship" | "craft" | "endurance" | "lore"

export type RiskLevel = "safe" | "moderate" | "dangerous"

export interface EnhancedChoice {
  id: string
  text: string
  actionType: ActionType
  requiresRoll: boolean
  stat?: StatType
  dc?: number // Difficulty Class
  modifier?: number
  riskLevel?: RiskLevel
  consequence?: string // Short hint about what might happen
}

export type StoryEntry = {
  id: string
  type: "narration" | "action" | "dice-roll"
  text: string
  timestamp: Date
}
