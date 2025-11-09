"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { GameState, Character, StoryTurn, Choice, Scenario } from "./types"

interface GameStore extends GameState {
  // Actions
  setCharacter: (character: Character) => void
  setScenario: (scenario: Scenario) => void
  addStoryTurn: (turn: StoryTurn) => void
  setChoices: (choices: Choice[]) => void
  setGenerating: (isGenerating: boolean) => void
  resetGame: () => void
  unlockAchievement: (achievementId: string) => void
  updateLastSaved: () => void
}

const initialState: GameState = {
  character: null,
  currentScenario: null,
  storyHistory: [],
  choices: [],
  isGenerating: false,
  lastSaved: Date.now(),
  achievements: [],
  turnCount: 0,
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialState,

      setCharacter: (character) => set({ character, lastSaved: Date.now() }),

      setScenario: (scenario) => set({ currentScenario: scenario, lastSaved: Date.now() }),

      addStoryTurn: (turn) =>
        set((state) => ({
          storyHistory: [...state.storyHistory, turn],
          turnCount: state.turnCount + 1,
          lastSaved: Date.now(),
        })),

      setChoices: (choices) => set({ choices, lastSaved: Date.now() }),

      setGenerating: (isGenerating) => set({ isGenerating }),

      resetGame: () => set({ ...initialState, lastSaved: Date.now() }),

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
    },
  ),
)
