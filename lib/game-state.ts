"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  GameState,
  Character,
  Scenario,
  StoryEntry,
  EnhancedChoice,
  ActiveEffect,
  CustomScenarioConfig,
} from "./types"

interface ExtendedGameState extends GameState {
  // Story state
  storyEntries: StoryEntry[]
  currentChoices: (string | EnhancedChoice)[]

  // Character state
  currentHealth: number
  currentXP: number
  currentLevel: number
  activeEffects: ActiveEffect[]

  // UI state
  isLoading: boolean
  showCharacterDrawer: boolean
  showGameOver: boolean
  showVictory: boolean
  gameOverCause: string

  // Scenario modifications
  scenarioModifications: Array<{
    turnNumber: number
    changedFields: Partial<CustomScenarioConfig>
    reason: string
  }>

  // Counters
  choiceCount: number
  retryCount: number
}

interface GameStoreActions {
  // Core actions
  setCharacter: (character: Character) => void
  setScenario: (scenario: Scenario) => void
  updateCharacterStats: (stats: Partial<Character>) => void

  // Story actions
  addStoryEntry: (entry: StoryEntry) => void
  setStoryEntries: (entries: StoryEntry[]) => void
  setCurrentChoices: (choices: (string | EnhancedChoice)[]) => void

  // Health & Stats
  setCurrentHealth: (health: number) => void
  adjustHealth: (amount: number) => void
  setCurrentXP: (xp: number) => void
  addXP: (xp: number) => void
  setCurrentLevel: (level: number) => void

  // Effects
  addActiveEffect: (effect: ActiveEffect) => void
  removeActiveEffect: (effectId: string) => void
  tickEffects: () => void

  // UI state
  setIsLoading: (loading: boolean) => void
  setShowCharacterDrawer: (show: boolean) => void
  setShowGameOver: (show: boolean, cause?: string) => void
  setShowVictory: (show: boolean) => void

  // Scenario modifications
  addScenarioModification: (modification: any) => void
  updateScenarioConfig: (changes: Partial<CustomScenarioConfig>, reason: string) => void

  // Counters
  incrementChoiceCount: () => void
  setRetryCount: (count: number) => void

  // Inventory
  addInventoryItem: (item: any) => void
  removeInventoryItem: (itemId: string) => void
  updateInventory: (inventory: any[]) => void
  addGold: (amount: number) => void

  // Game control
  resetGame: () => void
  loadGameState: (state: Partial<ExtendedGameState>) => void

  // Achievements
  unlockAchievement: (achievementId: string) => void
  updateLastSaved: () => void
}

type GameStore = ExtendedGameState & GameStoreActions

const initialState: ExtendedGameState = {
  // Core game state
  character: null,
  currentScenario: null,
  storyHistory: [],
  choices: [],
  isGenerating: false,
  lastSaved: Date.now(),
  achievements: [],
  turnCount: 0,

  // Extended state
  storyEntries: [],
  currentChoices: [],
  currentHealth: 0,
  currentXP: 0,
  currentLevel: 1,
  activeEffects: [],
  isLoading: false,
  showCharacterDrawer: false,
  showGameOver: false,
  showVictory: false,
  gameOverCause: "",
  scenarioModifications: [],
  choiceCount: 0,
  retryCount: 0,
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Core actions
      setCharacter: (character) => {
        set({
          character,
          currentHealth: character.maxHealth,
          lastSaved: Date.now(),
        })
      },

      setScenario: (scenario) => set({ currentScenario: scenario, lastSaved: Date.now() }),

      updateCharacterStats: (stats) => {
        const character = get().character
        if (!character) return

        set({
          character: { ...character, ...stats },
          lastSaved: Date.now(),
        })
      },

      // Story actions
      addStoryEntry: (entry) =>
        set((state) => ({
          storyEntries: [...state.storyEntries, entry],
          lastSaved: Date.now(),
        })),

      setStoryEntries: (entries) => set({ storyEntries: entries, lastSaved: Date.now() }),

      setCurrentChoices: (choices) => set({ currentChoices: choices }),

      // Health & Stats
      setCurrentHealth: (health) => set({ currentHealth: health, lastSaved: Date.now() }),

      adjustHealth: (amount) => {
        const { currentHealth, character } = get()
        if (!character) return

        const newHealth = Math.max(0, Math.min(character.maxHealth, currentHealth + amount))
        set({ currentHealth: newHealth, lastSaved: Date.now() })

        if (newHealth <= 0) {
          set({ showGameOver: true, gameOverCause: "Your health reached zero" })
        }
      },

      setCurrentXP: (xp) => set({ currentXP: xp, lastSaved: Date.now() }),

      addXP: (xp) =>
        set((state) => ({
          currentXP: state.currentXP + xp,
          lastSaved: Date.now(),
        })),

      setCurrentLevel: (level) => set({ currentLevel: level, lastSaved: Date.now() }),

      // Effects
      addActiveEffect: (effect) =>
        set((state) => ({
          activeEffects: [...state.activeEffects, effect],
          lastSaved: Date.now(),
        })),

      removeActiveEffect: (effectId) =>
        set((state) => ({
          activeEffects: state.activeEffects.filter((e) => e.id !== effectId),
          lastSaved: Date.now(),
        })),

      tickEffects: () =>
        set((state) => ({
          activeEffects: state.activeEffects
            .map((e) => ({ ...e, remainingTurns: e.remainingTurns - 1 }))
            .filter((e) => e.remainingTurns > 0),
          lastSaved: Date.now(),
        })),

      // UI state
      setIsLoading: (loading) => set({ isLoading: loading }),
      setShowCharacterDrawer: (show) => set({ showCharacterDrawer: show }),
      setShowGameOver: (show, cause) =>
        set({
          showGameOver: show,
          ...(cause && { gameOverCause: cause }),
        }),
      setShowVictory: (show) => set({ showVictory: show }),

      // Scenario modifications
      addScenarioModification: (modification) =>
        set((state) => ({
          scenarioModifications: [...state.scenarioModifications, modification],
          lastSaved: Date.now(),
        })),

      updateScenarioConfig: (changes, reason) => {
        const { currentScenario, storyEntries } = get()
        if (!currentScenario?.customConfig) return

        const modification = {
          turnNumber: storyEntries.filter((e) => e.type === "action").length,
          changedFields: changes,
          reason,
        }

        const updatedScenario = {
          ...currentScenario,
          customConfig: {
            ...currentScenario.customConfig,
            ...changes,
            modifications: [...(currentScenario.customConfig.modifications || []), modification],
          },
        }

        set({
          currentScenario: updatedScenario,
          scenarioModifications: [...get().scenarioModifications, modification],
          lastSaved: Date.now(),
        })

        localStorage.setItem("scenario", JSON.stringify(updatedScenario))
      },

      // Counters
      incrementChoiceCount: () =>
        set((state) => ({
          choiceCount: state.choiceCount + 1,
          turnCount: state.turnCount + 1,
          lastSaved: Date.now(),
        })),

      setRetryCount: (count) => set({ retryCount: count }),

      // Inventory
      addInventoryItem: (item) => {
        const character = get().character
        if (!character) return

        set({
          character: {
            ...character,
            inventory: [...character.inventory, item],
          },
          lastSaved: Date.now(),
        })
      },

      removeInventoryItem: (itemId) => {
        const character = get().character
        if (!character) return

        set({
          character: {
            ...character,
            inventory: character.inventory.filter((i) => i.id !== itemId),
          },
          lastSaved: Date.now(),
        })
      },

      updateInventory: (inventory) => {
        const character = get().character
        if (!character) return

        set({
          character: {
            ...character,
            inventory,
          },
          lastSaved: Date.now(),
        })
      },

      addGold: (amount) => {
        const character = get().character
        if (!character) return

        set({
          character: {
            ...character,
            gold: (character.gold || 0) + amount,
          },
          lastSaved: Date.now(),
        })
      },

      // Game control
      resetGame: () => set({ ...initialState, lastSaved: Date.now() }),

      loadGameState: (state) => set({ ...state, lastSaved: Date.now() }),

      unlockAchievement: (achievementId) =>
        set((state) => ({
          achievements: state.achievements.map((achievement) =>
            achievement.id === achievementId ? { ...achievement, unlocked: true, unlockedAt: Date.now() } : achievement,
          ),
          lastSaved: Date.now(),
        })),

      updateLastSaved: () => set({ lastSaved: Date.now() }),
    }),
    {
      name: "middle-earth-rpg-save",
      partialize: (state) => ({
        // Only persist these fields
        character: state.character,
        currentScenario: state.currentScenario,
        storyEntries: state.storyEntries,
        currentHealth: state.currentHealth,
        currentXP: state.currentXP,
        currentLevel: state.currentLevel,
        activeEffects: state.activeEffects,
        scenarioModifications: state.scenarioModifications,
        choiceCount: state.choiceCount,
        achievements: state.achievements,
        turnCount: state.turnCount,
        lastSaved: state.lastSaved,
      }),
    },
  ),
)
