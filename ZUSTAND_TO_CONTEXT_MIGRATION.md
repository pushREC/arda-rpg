# Zustand to React Context Migration Guide

**Status:** Post-MVP Technical Debt
**Priority:** Low (Do After MVP Launch)
**Estimated Time:** 2-3 hours
**Risk:** Low (purely internal refactor)

---

## 🎯 Why Migrate?

### Current State (Zustand)
- **File:** `lib/game-state.ts` (338 lines)
- **Complexity:** 30+ actions, persist middleware, complex boilerplate
- **Dependencies:** `zustand` (5.0.8)
- **Bundle Impact:** ~500 KB

### Target State (React Context)
- **File:** `lib/game-context.tsx` (~100 lines)
- **Complexity:** Simple Provider/Consumer pattern
- **Dependencies:** None (built-in React)
- **Bundle Impact:** 0 KB (native React)

### Benefits
- ✅ Reduce bundle size by ~500 KB
- ✅ Fewer dependencies to maintain
- ✅ Simpler mental model for junior devs
- ✅ More idiomatic React code

### Why Not Now?
- ⚠️ Zustand works perfectly for MVP
- ⚠️ Don't refactor what's not broken before launch
- ⚠️ Focus on shipping features first

---

## 📋 Migration Steps

### Step 1: Create React Context Provider

Create `lib/game-context.tsx`:

```typescript
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type {
  Character,
  Scenario,
  StoryEntry,
  EnhancedChoice,
  ActiveEffect,
  CustomScenarioConfig,
} from "./types"

interface GameState {
  // Core state
  character: Character | null
  currentScenario: Scenario | null
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

  // Metadata
  choiceCount: number
  turnCount: number
  retryCount: number
  lastSaved: number
  achievements: any[]
  scenarioModifications: Array<{
    turnNumber: number
    changedFields: Partial<CustomScenarioConfig>
    reason: string
  }>
}

interface GameActions {
  // Character
  setCharacter: (character: Character) => void
  updateCharacterStats: (stats: Partial<Character>) => void

  // Story
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

  // UI
  setIsLoading: (loading: boolean) => void
  setShowCharacterDrawer: (show: boolean) => void
  setShowGameOver: (show: boolean, cause?: string) => void
  setShowVictory: (show: boolean) => void

  // Scenario
  setScenario: (scenario: Scenario) => void
  addScenarioModification: (modification: any) => void
  updateScenarioConfig: (changes: Partial<CustomScenarioConfig>, reason: string) => void

  // Counters
  incrementChoiceCount: () => void
  setRetryCount: (count: number) => void

  // Inventory
  addInventoryItem: (item: any) => void
  removeInventoryItem: (itemId: string) => void
  updateInventory: (inventory: any[]) => void

  // Game control
  resetGame: () => void
  loadGameState: (state: Partial<GameState>) => void
  unlockAchievement: (achievementId: string) => void
  updateLastSaved: () => void
}

type GameContextType = GameState & GameActions

const GameContext = createContext<GameContextType | undefined>(undefined)

const STORAGE_KEY = "middle-earth-rpg-save"

const initialState: GameState = {
  character: null,
  currentScenario: null,
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
  choiceCount: 0,
  turnCount: 0,
  retryCount: 0,
  lastSaved: Date.now(),
  achievements: [],
  scenarioModifications: [],
}

export function GameProvider({ children }: { children: ReactNode }) {
  // Load from localStorage on mount
  const [state, setState] = useState<GameState>(() => {
    if (typeof window === "undefined") return initialState

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...initialState, ...parsed }
      }
    } catch (error) {
      console.error("Failed to load game state:", error)
    }
    return initialState
  })

  // Auto-save to localStorage on state change
  useEffect(() => {
    if (typeof window === "undefined") return

    const persistedState = {
      character: state.character,
      currentScenario: state.currentScenario,
      storyEntries: state.storyEntries,
      currentHealth: state.currentHealth,
      currentXP: state.currentXP,
      currentLevel: state.currentLevel,
      activeEffects: state.activeEffects,
      scenarioModifications: state.scenarioModifications,
      choiceCount: state.choiceCount,
      turnCount: state.turnCount,
      achievements: state.achievements,
      lastSaved: state.lastSaved,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState))
  }, [state])

  // Actions
  const actions: GameActions = {
    setCharacter: (character) => {
      setState((prev) => ({
        ...prev,
        character,
        currentHealth: character.maxHealth,
        lastSaved: Date.now(),
      }))
    },

    updateCharacterStats: (stats) => {
      setState((prev) => ({
        ...prev,
        character: prev.character ? { ...prev.character, ...stats } : null,
        lastSaved: Date.now(),
      }))
    },

    addStoryEntry: (entry) => {
      setState((prev) => ({
        ...prev,
        storyEntries: [...prev.storyEntries, entry],
        lastSaved: Date.now(),
      }))
    },

    setStoryEntries: (entries) => {
      setState((prev) => ({ ...prev, storyEntries: entries, lastSaved: Date.now() }))
    },

    setCurrentChoices: (choices) => {
      setState((prev) => ({ ...prev, currentChoices: choices }))
    },

    setCurrentHealth: (health) => {
      setState((prev) => ({ ...prev, currentHealth: health, lastSaved: Date.now() }))
    },

    adjustHealth: (amount) => {
      setState((prev) => {
        if (!prev.character) return prev

        const newHealth = Math.max(0, Math.min(prev.character.maxHealth, prev.currentHealth + amount))

        return {
          ...prev,
          currentHealth: newHealth,
          showGameOver: newHealth <= 0,
          gameOverCause: newHealth <= 0 ? "Your health reached zero" : prev.gameOverCause,
          lastSaved: Date.now(),
        }
      })
    },

    setCurrentXP: (xp) => {
      setState((prev) => ({ ...prev, currentXP: xp, lastSaved: Date.now() }))
    },

    addXP: (xp) => {
      setState((prev) => ({
        ...prev,
        currentXP: prev.currentXP + xp,
        lastSaved: Date.now(),
      }))
    },

    setCurrentLevel: (level) => {
      setState((prev) => ({ ...prev, currentLevel: level, lastSaved: Date.now() }))
    },

    addActiveEffect: (effect) => {
      setState((prev) => ({
        ...prev,
        activeEffects: [...prev.activeEffects, effect],
        lastSaved: Date.now(),
      }))
    },

    removeActiveEffect: (effectId) => {
      setState((prev) => ({
        ...prev,
        activeEffects: prev.activeEffects.filter((e) => e.id !== effectId),
        lastSaved: Date.now(),
      }))
    },

    tickEffects: () => {
      setState((prev) => ({
        ...prev,
        activeEffects: prev.activeEffects
          .map((e) => ({ ...e, remainingTurns: e.remainingTurns - 1 }))
          .filter((e) => e.remainingTurns > 0),
        lastSaved: Date.now(),
      }))
    },

    setIsLoading: (loading) => {
      setState((prev) => ({ ...prev, isLoading: loading }))
    },

    setShowCharacterDrawer: (show) => {
      setState((prev) => ({ ...prev, showCharacterDrawer: show }))
    },

    setShowGameOver: (show, cause) => {
      setState((prev) => ({
        ...prev,
        showGameOver: show,
        ...(cause && { gameOverCause: cause }),
      }))
    },

    setShowVictory: (show) => {
      setState((prev) => ({ ...prev, showVictory: show }))
    },

    setScenario: (scenario) => {
      setState((prev) => ({ ...prev, currentScenario: scenario, lastSaved: Date.now() }))
    },

    addScenarioModification: (modification) => {
      setState((prev) => ({
        ...prev,
        scenarioModifications: [...prev.scenarioModifications, modification],
        lastSaved: Date.now(),
      }))
    },

    updateScenarioConfig: (changes, reason) => {
      setState((prev) => {
        if (!prev.currentScenario?.customConfig) return prev

        const modification = {
          turnNumber: prev.storyEntries.filter((e) => e.type === "action").length,
          changedFields: changes,
          reason,
        }

        const updatedScenario = {
          ...prev.currentScenario,
          customConfig: {
            ...prev.currentScenario.customConfig,
            ...changes,
            modifications: [...(prev.currentScenario.customConfig.modifications || []), modification],
          },
        }

        localStorage.setItem("scenario", JSON.stringify(updatedScenario))

        return {
          ...prev,
          currentScenario: updatedScenario,
          scenarioModifications: [...prev.scenarioModifications, modification],
          lastSaved: Date.now(),
        }
      })
    },

    incrementChoiceCount: () => {
      setState((prev) => ({
        ...prev,
        choiceCount: prev.choiceCount + 1,
        turnCount: prev.turnCount + 1,
        lastSaved: Date.now(),
      }))
    },

    setRetryCount: (count) => {
      setState((prev) => ({ ...prev, retryCount: count }))
    },

    addInventoryItem: (item) => {
      setState((prev) => {
        if (!prev.character) return prev

        return {
          ...prev,
          character: {
            ...prev.character,
            inventory: [...prev.character.inventory, item],
          },
          lastSaved: Date.now(),
        }
      })
    },

    removeInventoryItem: (itemId) => {
      setState((prev) => {
        if (!prev.character) return prev

        return {
          ...prev,
          character: {
            ...prev.character,
            inventory: prev.character.inventory.filter((i) => i.id !== itemId),
          },
          lastSaved: Date.now(),
        }
      })
    },

    updateInventory: (inventory) => {
      setState((prev) => {
        if (!prev.character) return prev

        return {
          ...prev,
          character: {
            ...prev.character,
            inventory,
          },
          lastSaved: Date.now(),
        }
      })
    },

    resetGame: () => {
      setState({ ...initialState, lastSaved: Date.now() })
    },

    loadGameState: (newState) => {
      setState((prev) => ({ ...prev, ...newState, lastSaved: Date.now() }))
    },

    unlockAchievement: (achievementId) => {
      setState((prev) => ({
        ...prev,
        achievements: prev.achievements.map((achievement) =>
          achievement.id === achievementId
            ? { ...achievement, unlocked: true, unlockedAt: Date.now() }
            : achievement
        ),
        lastSaved: Date.now(),
      }))
    },

    updateLastSaved: () => {
      setState((prev) => ({ ...prev, lastSaved: Date.now() }))
    },
  }

  const value = { ...state, ...actions }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
```

---

### Step 2: Update Root Layout

**File:** `app/layout.tsx`

```typescript
// BEFORE
import { GameStateProvider } from "@/lib/game-state" // (doesn't exist yet)

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}

// AFTER
import { GameProvider } from "@/lib/game-context"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  )
}
```

---

### Step 3: Replace All `useGameStore` Calls

**Find & Replace:**
- Find: `import { useGameStore } from "@/lib/game-state"`
- Replace: `import { useGame } from "@/lib/game-context"`

**Find & Replace:**
- Find: `const { ... } = useGameStore()`
- Replace: `const { ... } = useGame()`

**Files to Update:**
- `app/game/page.tsx`
- `app/character/page.tsx`
- Any other components using `useGameStore()`

---

### Step 4: Remove Zustand

```bash
pnpm remove zustand
```

Delete `lib/game-state.ts`

---

### Step 5: Test Everything

```bash
# Build to check for TypeScript errors
pnpm build

# Run dev server
pnpm dev

# Test these flows:
# 1. Create a new character
# 2. Save the game
# 3. Reload the page (should load from localStorage)
# 4. Play a few turns
# 5. Check health/XP/gold updates
# 6. Use an item from inventory
# 7. Check achievements
```

---

## 🔍 Key Differences

### State Updates

**Zustand (Before):**
```typescript
// Global store with actions
const useGameStore = create((set) => ({
  character: null,
  setCharacter: (char) => set({ character: char })
}))

// Usage
const { character, setCharacter } = useGameStore()
```

**React Context (After):**
```typescript
// Provider with useState
const [character, setCharacter] = useState(null)

// Usage (identical!)
const { character, setCharacter } = useGame()
```

### Persistence

**Zustand (Before):**
```typescript
// Built-in persist middleware
persist(
  (set) => ({ ... }),
  { name: "middle-earth-rpg-save" }
)
```

**React Context (After):**
```typescript
// Manual useEffect
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}, [state])
```

---

## ⚠️ Potential Issues

### 1. Re-renders

**Issue:** Context updates trigger re-renders of all consumers

**Solution:** Split into multiple contexts if needed
```typescript
// If performance becomes an issue
<CharacterProvider>
  <UIProvider>
    <GameProvider>
      {children}
    </GameProvider>
  </UIProvider>
</CharacterProvider>
```

### 2. Hydration

**Issue:** Server/client mismatch with localStorage

**Solution:** Already handled in `useState` initializer
```typescript
const [state, setState] = useState(() => {
  if (typeof window === "undefined") return initialState
  // Load from localStorage only on client
})
```

### 3. DevTools

**Issue:** Lose Zustand DevTools

**Solution:** Use React DevTools instead (built-in Context inspection)

---

## 📊 Performance Comparison

| Metric | Zustand | React Context |
|--------|---------|---------------|
| Bundle Size | +500 KB | 0 KB |
| Re-render Optimizations | Built-in selectors | Manual memoization |
| DevTools | Zustand DevTools | React DevTools |
| Learning Curve | External library | Native React |
| Code Lines | 338 lines | ~100 lines |

---

## 🎯 Recommendation

**For MVP:** Keep Zustand
- Already working
- No bugs
- Don't break what works

**For Post-MVP:** Migrate to Context
- Simpler codebase
- Fewer dependencies
- More maintainable

---

## 📝 Checklist

- [ ] Create `lib/game-context.tsx`
- [ ] Wrap app in `<GameProvider>` in `app/layout.tsx`
- [ ] Find & replace all `useGameStore` → `useGame`
- [ ] Test character creation
- [ ] Test save/load
- [ ] Test gameplay (health, XP, inventory)
- [ ] Run `pnpm build` to verify
- [ ] Remove Zustand with `pnpm remove zustand`
- [ ] Delete `lib/game-state.ts`
- [ ] Update `PRD.md` to remove Zustand from tech stack

---

**Estimated Time:** 2-3 hours (including testing)
**Risk Level:** Low (all changes are internal)
**When to Do:** After MVP launch and user validation
