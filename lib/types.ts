export type Race = "human" | "elf" | "dwarf" | "hobbit"

export type Background = "ranger" | "scholar" | "merchant" | "soldier" | "wanderer"

/**
 * Valid stat values (3-8 scale).
 * - 3 = Weak (+0 modifier)
 * - 5 = Average (+2 modifier)
 * - 8 = Legendary (+5 modifier)
 */
export type StatValue = 3 | 4 | 5 | 6 | 7 | 8

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
  equipped?: boolean
  consumable?: boolean
  stats?: Partial<CharacterStats>
  effect?: {
    type: "heal" | "buff" | "damage"
    value: number
    duration?: number // in turns
  }
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

export type ActionType = "combat" | "social" | "investigation" | "craft" | "narrative" | "stealth" | "survival"

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

export type GameSaveData = {
  id: string
  version: string // for save format compatibility
  characterName: string
  scenario: string
  timestamp: Date
  health: number
  maxHealth: number
  turnCount: number
  character: Character
  scenario: any
  storyEntries: StoryEntry[]
  currentXP: number
  currentLevel: number
  choiceCount: number
  activeEffects: ActiveEffect[]
}

export type ActiveEffect = {
  id: string
  name: string
  type: "buff" | "debuff"
  stat?: keyof CharacterStats
  value: number
  remainingTurns: number
}

export type StateChanges = {
  health?: number // Can be positive (heal) or negative (damage)
  gold?: number // Can be positive (gain) or negative (spend)
  xp?: number // Experience gained
  inventory?: InventoryItem[] // Items to add
  removeItems?: string[] // Item IDs to remove
  companions?: Companion[] // Companions to add
  updateCompanions?: Array<{ id: string; relationshipChange: number }> // Update existing companion relationships
  questProgress?: {
    objectiveCompleted?: string
    newObjective?: string
    questComplete?: boolean
  }
  effects?: ActiveEffect[] // Buffs/debuffs to apply
}

export type DiceRollData = {
  stat: keyof CharacterStats
  statValue: number
  modifier: number
  diceType: 6 | 8 | 10 | 12 | 20
  roll: number // The actual die roll (before modifier)
  total: number // roll + modifier
  dc: number // Difficulty class
  success: boolean
}

/**
 * Damage tiers for combat and hazards.
 * See lib/rules.ts for actual damage ranges.
 */
export type DamageTier = "TRIVIAL" | "STANDARD" | "DANGEROUS" | "LETHAL"

/**
 * Difficulty levels for skill checks.
 * Easy = DC 8, Medium = DC 12, Hard = DC 16
 */
export type DifficultyLevel = "easy" | "medium" | "hard"

/**
 * Gold reward tiers for loot.
 * See lib/rules.ts for actual gold ranges.
 */
export type GoldTier = "TRIVIAL" | "COMMON" | "UNCOMMON" | "RARE" | "LEGENDARY"
