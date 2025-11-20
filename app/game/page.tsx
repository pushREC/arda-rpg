"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { GameShell } from "@/components/game-shell"
import { StoryDisplay } from "@/components/story-display"
import { DiceRoller } from "@/components/dice-roller"
import { CharacterPanel } from "@/components/character-panel"
import { CharacterDrawer } from "@/components/character-drawer"
import { AchievementToast } from "@/components/achievement-toast"
import { AchievementsModal } from "@/components/achievements-modal"
import { ScenarioAdjustmentPanel } from "@/components/scenario-adjustment-panel"
import { GameOverModal } from "@/components/game-over-modal"
import { VictoryScreen } from "@/components/victory-screen"
import { ItemDetailModal } from "@/components/item-detail-modal"
import { SaveLoadModal } from "@/components/save-load-modal"
import { QuestTracker } from "@/components/quest-tracker"
import { LevelUpModal } from "@/components/level-up-modal"
import type { StoryEntry, EnhancedChoice, StatType, CustomScenarioConfig, InventoryItem } from "@/lib/types"
import { toast } from "sonner"
import { unlockAchievement, getAchievementById } from "@/lib/achievements"
import {
  useItem as applyItem, // Rename to avoid React hook linter confusion
  equipItem,
  saveGame,
  loadGame,
  autoSave,
  loadAutoSave,
  checkLevelUp,
  detectQuestCompletion,
  parseStateChanges,
  canAddToInventory,
  validateAIResponse,
  validateGameData,
} from "@/lib/game-logic"
import { getStatModifier } from "@/lib/rules"
import { modalQueue } from "@/lib/modal-queue"
import { NotificationManager, useNotifications } from "@/components/notification-manager"
import { useGameStore } from "@/lib/game-state"

function GamePageContent() {
  const router = useRouter()
  const { addNotification } = useNotifications()

  const [character, setCharacter] = React.useState<any>(null)
  const [scenario, setScenario] = React.useState<any>(null)
  const [storyEntries, setStoryEntries] = React.useState<StoryEntry[]>([])
  const [currentHealth, setCurrentHealth] = React.useState(100)
  const [currentXP, setCurrentXP] = React.useState(0)
  const [currentLevel, setCurrentLevel] = React.useState(1)
  const [showDiceRoller, setShowDiceRoller] = React.useState(false)
  const [diceConfig, setDiceConfig] = React.useState<{
    type: 6 | 8 | 10 | 12 | 20
    modifier: number
    reason: string
    statName?: string
  }>({ type: 20, modifier: 0, reason: "Roll to determine the outcome" })
  const [diceCallback, setDiceCallback] = React.useState<((result: number) => void) | null>(null)
  const [showAchievements, setShowAchievements] = React.useState(false)
  const [choiceCount, setChoiceCount] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [currentChoices, setCurrentChoices] = React.useState<(string | EnhancedChoice)[]>([])
  const [scenarioModifications, setScenarioModifications] = React.useState<
    Array<{
      turnNumber: number
      changedFields: Partial<CustomScenarioConfig>
      reason: string
    }>
  >([])

  const [showCharacterDrawer, setShowCharacterDrawer] = React.useState(false)
  const [showGameOver, setShowGameOver] = React.useState(false)
  const [showVictory, setShowVictory] = React.useState(false)
  const [showSaveLoad, setShowSaveLoad] = React.useState(false)
  const [showLevelUp, setShowLevelUp] = React.useState(false)
  const [activeEffects, setActiveEffects] = React.useState<any[]>([])
  const [currentQueuedModal, setCurrentQueuedModal] = React.useState<any>(null)
  const [retryCount, setRetryCount] = React.useState(0)
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(null)
  const [showItemDetail, setShowItemDetail] = React.useState(false)
  const MAX_RETRIES = 3
  const loadingTimeoutRef = React.useRef<NodeJS.Timeout>()
  const [gameOverCause, setGameOverCause] = React.useState("")

  const isInCombat =
    storyEntries.length > 0 && storyEntries[storyEntries.length - 1]?.text?.toLowerCase().includes("combat")

  const handleUseItem = React.useCallback(
    (item: InventoryItem) => {
      const result = applyItem(item, character, currentHealth)

      if (result.success) {
        toast.success(result.message)

        if (result.healthChange) {
          setCurrentHealth((prev) => prev + result.healthChange!)
          addNotification("health", result.healthChange)
        }

        if (result.effect) {
          setActiveEffects((prev) => [...prev, result.effect!])
        }

        const updatedInventory = character.inventory.filter((i: any) => i.id !== item.id)
        const updatedCharacter = { ...character, inventory: updatedInventory }
        setCharacter(updatedCharacter)
        localStorage.setItem("character", JSON.stringify(updatedCharacter))
      } else {
        toast.error(result.message)
      }
    },
    [character, currentHealth, addNotification],
  )

  const handleEquipItem = React.useCallback(
    (item: InventoryItem) => {
      const updatedCharacter = equipItem(item, character)
      setCharacter(updatedCharacter)
      localStorage.setItem("character", JSON.stringify(updatedCharacter))

      toast.success(item.equipped ? "Unequipped" : "Equipped", {
        description: item.name,
      })
    },
    [character],
  )

  const handleDropItem = React.useCallback(
    (item: InventoryItem) => {
      const updatedInventory = character.inventory.filter((i: any) => i.id !== item.id)
      const updatedCharacter = { ...character, inventory: updatedInventory }
      setCharacter(updatedCharacter)
      localStorage.setItem("character", JSON.stringify(updatedCharacter))

      toast.info("Item dropped", {
        description: item.name,
      })
    },
    [character],
  )

  const handleSellItem = React.useCallback(
    (item: InventoryItem, sellValue: number) => {
      // CRITICAL: Update Zustand store first (persistent source of truth)
      const store = useGameStore.getState()
      store.removeInventoryItem(item.id)
      store.addGold(sellValue)

      // Then sync local state from Zustand to ensure consistency
      const updatedCharacter = useGameStore.getState().character
      if (updatedCharacter) {
        setCharacter(updatedCharacter)
        // Zustand persist middleware handles localStorage automatically
      }

      addNotification("gold", sellValue)
      toast.success(`Sold ${item.name}`, {
        description: `+${sellValue} gold`,
      })
    },
    [addNotification],
  )

  React.useEffect(() => {
    const unsubscribe = modalQueue.subscribe((modal) => {
      setCurrentQueuedModal(modal)

      if (modal) {
        switch (modal.type) {
          case "levelUp":
            setShowLevelUp(true)
            break
          case "gameOver":
            setShowGameOver(true)
            break
          case "victory":
            setShowVictory(true)
            break
        }
      }
    })

    return unsubscribe
  }, [])

  React.useEffect(() => {
    const validation = validateGameData()

    if (!validation.valid) {
      console.error("[v0] Game data validation failed:", validation.error)

      const autoSaveData = loadAutoSave()
      if (autoSaveData.success && autoSaveData.data) {
        toast.info("Recovered from auto-save")
        setCharacter(autoSaveData.data.character)
        setScenario(autoSaveData.data.scenario)
        setStoryEntries(autoSaveData.data.storyEntries || [])
        setCurrentHealth(autoSaveData.data.health)
        setCurrentXP(autoSaveData.data.currentXP || 0)
        setCurrentLevel(autoSaveData.data.currentLevel || 1)
        return
      }

      toast.error("Game data is missing or corrupted", {
        description: "Returning to character creation",
      })
      router.push("/character-creation")
      return
    }

    setCharacter(validation.character)
    setScenario(validation.scenario)
    setCurrentHealth(validation.character.maxHealth)

    startGame(validation.character, validation.scenario)
  }, [router])

  React.useEffect(() => {
    if (character && scenario && storyEntries.length > 0) {
      autoSave({
        character,
        scenario,
        storyEntries,
        health: currentHealth,
        currentXP,
        currentLevel,
        choiceCount,
        activeEffects,
      })
    }
  }, [storyEntries, currentHealth, currentXP, currentLevel])

  React.useEffect(() => {
    if (currentHealth <= 0 && !showGameOver) {
      setGameOverCause("Your health reached zero")
      modalQueue.enqueue("gameOver", { cause: "Your health reached zero" }, 100)
    }
  }, [currentHealth, showGameOver])

  React.useEffect(() => {
    if (isLoading) {
      loadingTimeoutRef.current = setTimeout(() => {
        console.error("[v0] Loading timeout reached")
        toast.error("Taking longer than expected", {
          description: "The tale continues...",
        })
        setIsLoading(false)
      }, 30000) // 30 second timeout
    } else {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [isLoading])

  const handleSaveGame = React.useCallback(() => {
    const result = saveGame({
      id: Date.now().toString(),
      characterName: character.name,
      scenario: scenario.title,
      timestamp: new Date(),
      health: currentHealth,
      maxHealth: character.maxHealth,
      turnCount: storyEntries.filter((e) => e.type === "action").length,
      character,
      scenario,
      storyEntries,
      currentXP,
      currentLevel,
      choiceCount,
      activeEffects,
    })

    if (result.success) {
      toast.success("Game saved successfully")
    } else {
      toast.error("Failed to save game", {
        description: result.error,
      })
    }
  }, [character, scenario, storyEntries, currentHealth, currentXP, currentLevel, choiceCount, activeEffects])

  const handleLoadGame = React.useCallback((saveId: string) => {
    const result = loadGame(saveId)

    if (result.success && result.data) {
      setCharacter(result.data.character)
      setScenario(result.data.scenario)
      setStoryEntries(result.data.storyEntries || [])
      setCurrentHealth(result.data.health)
      setCurrentXP(result.data.currentXP || 0)
      setCurrentLevel(result.data.currentLevel || 1)
      setChoiceCount(result.data.choiceCount || 0)
      setActiveEffects(result.data.activeEffects || [])

      toast.success("Game loaded successfully")
      setShowSaveLoad(false)
    } else {
      toast.error("Failed to load game", {
        description: result.error,
      })
    }
  }, [])

  const startGame = async (charData: any, scenarioData: any) => {
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (scenarioData.customConfig) {
      await startCustomScenario(charData, scenarioData)
      return
    }

    let openingText = ""

    if (scenarioData.id === "mirkwood") {
      openingText = `The ancient trees of Mirkwood loom before you, their twisted branches blocking out the sun. A narrow path winds into the shadowy depths, where whispers of dark creatures echo through the gloom. As ${charData.name} the ${charData.race}, you feel the weight of your quest pressing upon you.

You stand at the forest's edge, your equipment ready at your side. The path ahead splits into three directions.

What will you do?`
    } else if (scenarioData.id === "helms-deep") {
      openingText = `The drums of war thunder in the distance. You stand atop the walls of Helm's Deep as thousands of Uruk-hai march toward the fortress. The defenders look to you, ${charData.name} the ${charData.race}, for guidance. Rain begins to fall as the enemy draws near.

The battle is about to begin. Your ${charData.stats.valor} valor may turn the tide.

How will you prepare?`
    } else if (scenarioData.id === "moria") {
      openingText = `The great doors of Moria stand before you, inscribed with ancient runes. ${charData.name} the ${charData.race}, you know that untold treasures—and dangers—lie within these abandoned halls. Your companions look to you nervously as darkness beckons from within.

The gate mechanism appears complex. Your ${charData.stats.craft} craft might help.

What is your approach?`
    } else {
      openingText = `Legends speak of a ring of great power, lost in the wilds of Middle-earth. As ${charData.name} the ${charData.race}, you've dedicated yourself to finding it before it falls into evil hands. Your journey begins in a small village where rumors have led you.

An old merchant claims to know something. Trust is hard to come by.

What will you do?`
    }

    addStoryEntry("narration", openingText)

    const initialChoices: EnhancedChoice[] = [
      {
        id: "choice-1",
        text: "Take the left path through the dense undergrowth",
        actionType: "craft",
        requiresRoll: true,
        stat: "craft",
        dc: 12,
        riskLevel: "moderate",
        consequence: "May encounter hidden dangers",
      },
      {
        id: "choice-2",
        text: "Follow the right path along the stream",
        actionType: "investigation",
        requiresRoll: false,
        riskLevel: "safe",
      },
      {
        id: "choice-3",
        text: "Venture straight into the darkest part of the forest",
        actionType: "combat",
        requiresRoll: true,
        stat: "valor",
        dc: 15,
        riskLevel: "dangerous",
        consequence: "High chance of combat",
      },
      {
        id: "choice-4",
        text: "Set up camp and wait for daylight",
        actionType: "survival",
        requiresRoll: true,
        stat: "endurance",
        dc: 10,
        riskLevel: "safe",
      },
    ]

    setCurrentChoices(initialChoices)
    setIsLoading(false)
  }

  const startCustomScenario = async (charData: any, scenarioData: any) => {
    try {
      const response = await fetch("/api/generate-opening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character: charData,
          scenario: scenarioData,
          customConfig: scenarioData.customConfig,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate opening: ${response.statusText}`)
      }

      const { narrative, choices } = await response.json()

      addStoryEntry("narration", narrative)
      setCurrentChoices(choices)
      setIsLoading(false)
    } catch (error) {
      console.error("[v0] Failed to start custom scenario:", error)
      toast.error("Failed to start adventure", {
        description: "Using fallback scenario. Please try again later.",
      })

      addStoryEntry("narration", `${scenarioData.description}\n\nWhat will you do?`)
      setCurrentChoices([
        {
          id: "fallback-1",
          text: "Investigate your surroundings",
          actionType: "investigation",
          requiresRoll: true,
          stat: "wisdom",
          dc: 12,
          riskLevel: "safe",
        },
        {
          id: "fallback-2",
          text: "Prepare for what lies ahead",
          actionType: "narrative",
          requiresRoll: false,
          riskLevel: "safe",
        },
      ])
      setIsLoading(false)
    }
  }

  const addStoryEntry = (type: StoryEntry["type"], text: string) => {
    const entry: StoryEntry = {
      id: Date.now().toString() + Math.random(),
      type,
      text,
      timestamp: new Date(),
    }
    setStoryEntries((prev) => [...prev, entry])
  }

  const checkAndUnlockAchievement = (achievementId: string) => {
    if (unlockAchievement(achievementId)) {
      const achievement = getAchievementById(achievementId)
      if (achievement) {
        toast.custom(() => <AchievementToast title={achievement.title} description={achievement.description} />, {
          duration: 5000,
        })
      }
    }
  }

  const handleChoiceSelect = async (choice: string | EnhancedChoice) => {
    const choiceText = typeof choice === "string" ? choice : choice.text
    const enhancedChoice = typeof choice === "object" ? choice : null

    addStoryEntry("action", `You chose: ${choiceText}`)

    const newCount = choiceCount + 1
    setChoiceCount(newCount)

    if (newCount >= 50) {
      checkAndUnlockAchievement("storyteller")
    }

    setIsLoading(true)
    setCurrentChoices([])

    if (enhancedChoice?.requiresRoll && enhancedChoice.stat && enhancedChoice.dc) {
      const statValue = character?.stats?.[enhancedChoice.stat] || 10
      const modifier = getStatModifier(statValue)

      const statDisplayNames: Record<string, string> = {
        valor: "Valor",
        wisdom: "Wisdom",
        fellowship: "Fellowship",
        craft: "Craft",
        endurance: "Endurance",
        lore: "Lore",
      }

      setTimeout(() => {
        triggerDiceRoll(
          (total) => {
            const roll = total - modifier // Extract base roll
            const success = total >= enhancedChoice.dc!

            // Immediate feedback toast BEFORE narrative
            if (success) {
              toast.success(`Roll ${roll} + ${modifier} = ${total} (DC ${enhancedChoice.dc})`, {
                description: "Success!",
              })
              addStoryEntry("narration", "Success! Your skill sees you through.")
              continueStoryAfterChoice(choiceText, true)
            } else {
              toast.error(`Roll ${roll} + ${modifier} = ${total} (DC ${enhancedChoice.dc})`, {
                description: "Failed!",
              })
              addStoryEntry("narration", "The attempt fails. Things take a turn for the worse...")
              continueStoryAfterChoice(choiceText, false)
            }
          },
          20,
          modifier,
          `Test your ${statDisplayNames[enhancedChoice.stat] || enhancedChoice.stat} to succeed`,
          statDisplayNames[enhancedChoice.stat],
        )
      }, 500)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))
    continueStoryAfterChoice(choiceText, true)
  }

  const continueStoryAfterChoice = async (choiceText: string, success: boolean) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (scenario?.customConfig) {
      await continueCustomScenario(choiceText)
      return
    }

    const responses: { text: string; choices: EnhancedChoice[] }[] = [
      {
        text: `You venture deeper into the forest. The path narrows, and strange sounds echo through the trees. Suddenly, a pack of wolves emerges from the shadows, their eyes gleaming with hunger. You grip your weapon tightly.`,
        choices: [
          {
            id: "wolf-1",
            text: "Attack with full force",
            actionType: "combat",
            requiresRoll: true,
            stat: "valor",
            dc: 13,
            riskLevel: "dangerous",
            consequence: "Direct confrontation",
          },
          {
            id: "wolf-2",
            text: "Try to intimidate the wolves",
            actionType: "social",
            requiresRoll: true,
            stat: "fellowship",
            dc: 14,
            riskLevel: "moderate",
          },
          {
            id: "wolf-3",
            text: "Climb a nearby tree",
            actionType: "craft",
            requiresRoll: true,
            stat: "craft",
            dc: 12,
            riskLevel: "safe",
          },
          {
            id: "wolf-4",
            text: "Back away slowly without sudden movements",
            actionType: "narrative",
            requiresRoll: false,
            riskLevel: "moderate",
          },
        ],
      },
      {
        text: `Your keen senses detect movement ahead. Through the mist, you spot an ancient stone altar covered in mysterious runes. A faint glow emanates from its surface, and you hear whispered voices in a language you don't recognize. The air grows colder as you approach.`,
        choices: [
          {
            id: "altar-1",
            text: "Examine the runes closely",
            actionType: "investigation",
            requiresRoll: true,
            stat: "lore",
            dc: 15,
            riskLevel: "moderate",
            consequence: "Ancient knowledge awaits",
          },
          {
            id: "altar-2",
            text: "Touch the glowing altar",
            actionType: "narrative",
            requiresRoll: false,
            riskLevel: "dangerous",
            consequence: "Unknown magical effect",
          },
          {
            id: "altar-3",
            text: "Search the surrounding area for clues",
            actionType: "investigation",
            requiresRoll: true,
            stat: "wisdom",
            dc: 12,
            riskLevel: "safe",
          },
          {
            id: "altar-4",
            text: "Leave quickly before something happens",
            actionType: "narrative",
            requiresRoll: false,
            riskLevel: "safe",
          },
        ],
      },
      {
        text: `The path opens into a small clearing where a lone traveler sits by a campfire. They look up as you approach, their hooded face barely visible. "Greetings, ${character?.name}," they say in a raspy voice. "I've been expecting you." Something feels wrong about this encounter.`,
        choices: [
          {
            id: "traveler-1",
            text: "Ask who they are and how they know your name",
            actionType: "social",
            requiresRoll: false,
            riskLevel: "safe",
          },
          {
            id: "traveler-2",
            text: "Draw your weapon and demand answers",
            actionType: "combat",
            requiresRoll: true,
            stat: "valor",
            dc: 14,
            riskLevel: "dangerous",
            consequence: "May trigger combat",
          },
          {
            id: "traveler-3",
            text: "Sit by the fire and share stories",
            actionType: "social",
            requiresRoll: true,
            stat: "fellowship",
            dc: 13,
            riskLevel: "moderate",
          },
          {
            id: "traveler-4",
            text: "Back away slowly",
            actionType: "stealth",
            requiresRoll: true,
            stat: "craft",
            dc: 11,
            riskLevel: "safe",
          },
        ],
      },
    ]

    const response = responses[Math.floor(Math.random() * responses.length)]
    addStoryEntry("narration", response.text)
    setCurrentChoices(response.choices)
    setIsLoading(false)
  }

  const continueCustomScenario = async (playerChoice: string) => {
    try {
      setRetryCount(0)

      const response = await fetch("/api/process-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character,
          scenario,
          storyHistory: storyEntries,
          playerChoice,
          customConfig: scenario.customConfig,
          combatIntensity: scenario.customConfig?.combatFrequency,
          tones: scenario.customConfig?.tones,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to process turn: ${response.statusText}`)
      }

      const data = await response.json()

      const validation = validateAIResponse(data)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      const { narrative, choices, stateChanges } = data

      const parsedChanges = parseStateChanges(narrative)
      const combinedChanges = { ...parsedChanges, ...stateChanges }

      if (combinedChanges.health !== undefined) {
        const healthChange = combinedChanges.health
        setCurrentHealth((prev) => Math.max(0, Math.min(character.maxHealth, prev + healthChange)))

        if (healthChange > 0) {
          addNotification("health", healthChange)
        } else if (healthChange < 0) {
          addNotification("damage", Math.abs(healthChange))
        }
      }

      if (combinedChanges.gold !== undefined) {
        const goldChange = combinedChanges.gold
        addNotification("gold", goldChange)

        const updatedCharacter = {
          ...character,
          gold: (character.gold || 0) + goldChange,
        }
        setCharacter(updatedCharacter)
        localStorage.setItem("character", JSON.stringify(updatedCharacter))
      }

      if (combinedChanges.xp !== undefined) {
        const xpGain = combinedChanges.xp
        const newXP = currentXP + xpGain

        addNotification("xp", xpGain)
        setCurrentXP(newXP)

        const levelCheck = checkLevelUp(newXP, currentLevel)
        if (levelCheck.leveledUp) {
          setCurrentLevel(levelCheck.newLevel)
          setCurrentXP(levelCheck.remainingXP)

          modalQueue.enqueue(
            "levelUp",
            {
              newLevel: levelCheck.newLevel,
              statIncreases: { valor: 1, endurance: 1 },
            },
            80,
          )
        }
      }

      if (combinedChanges.inventory || combinedChanges.items) {
        const itemsToAdd = combinedChanges.inventory || []

        if (canAddToInventory(character.inventory)) {
          const updatedCharacter = {
            ...character,
            inventory: [...character.inventory, ...itemsToAdd],
          }
          setCharacter(updatedCharacter)
          localStorage.setItem("character", JSON.stringify(updatedCharacter))

          itemsToAdd.forEach((item: any) => {
            addNotification("item", item.name)
          })
        } else {
          toast.warning("Inventory is full!", {
            description: "Drop items to make space",
          })
        }
      }

      const turnCount = storyEntries.filter((e) => e.type === "action").length + 1
      if (combinedChanges.questComplete || detectQuestCompletion(narrative, turnCount, scenario)) {
        modalQueue.enqueue(
          "victory",
          {
            questName: scenario.title,
            finalStats: {
              turns: turnCount,
              gold: character.gold || 0,
              experience: currentXP,
            },
          },
          100,
        )
      }

      addStoryEntry("narration", narrative)
      setCurrentChoices(choices)
      setIsLoading(false)
    } catch (error) {
      console.error("[v0] Failed to continue custom scenario:", error)

      if (retryCount < MAX_RETRIES) {
        const nextRetry = retryCount + 1
        setRetryCount(nextRetry)
        const delay = Math.pow(2, nextRetry) * 1000 // 2s, 4s, 8s

        toast.error(`Connection issue (Attempt ${nextRetry}/${MAX_RETRIES})`, {
          description: `Retrying in ${delay / 1000}s...`,
        })

        setTimeout(() => {
          continueCustomScenario(playerChoice)
        }, delay)
        return
      }

      toast.error("Connection issue", {
        description: "The tale pauses momentarily.",
        action: {
          label: "Retry",
          onClick: () => {
            setRetryCount(0)
            continueCustomScenario(playerChoice)
          },
        },
      })

      addStoryEntry("narration", "The tale continues as you press forward into the unknown.")
      setCurrentChoices([
        {
          id: "fallback-continue",
          text: "Continue onward",
          actionType: "narrative",
          requiresRoll: false,
          riskLevel: "safe",
        },
      ])
      setIsLoading(false)
    }
  }

  const handleDiceRoll = (result: number) => {
    const baseRoll = result - diceConfig.modifier
    addStoryEntry(
      "dice-roll",
      `Rolled ${result} (d${diceConfig.type}${diceConfig.modifier !== 0 ? ` ${diceConfig.modifier > 0 ? "+" : ""}${diceConfig.modifier}` : ""})`,
    )
    setShowDiceRoller(false)

    if (baseRoll === 20) {
      checkAndUnlockAchievement("critical-success")
    }

    if (diceCallback) {
      diceCallback(result)
      setDiceCallback(null)
    }
  }

  const triggerDiceRoll = (
    callback: (result: number) => void,
    type: 6 | 8 | 10 | 12 | 20 = 20,
    modifier = 0,
    reason = "Roll to determine the outcome",
    statName?: string,
  ) => {
    setDiceConfig({ type, modifier, reason, statName } as any)
    setShowDiceRoller(true)
    setDiceCallback(() => callback)
  }

  const characterStats: Record<StatType, number> | undefined = character
    ? {
        valor: character.stats.valor || 13,
        wisdom: character.stats.wisdom || 9,
        fellowship: character.stats.fellowship || 12,
        craft: character.stats.craft || 15,
        endurance: character.stats.endurance || 14,
        lore: character.stats.lore || 10,
      }
    : undefined

  const handleAdjustment = (changes: Partial<CustomScenarioConfig>, reason: string) => {
    const modification = {
      turnNumber: storyEntries.filter((e) => e.type === "action").length,
      changedFields: changes,
      reason,
    }

    const updatedScenario = {
      ...scenario,
      customConfig: {
        ...scenario.customConfig,
        ...changes,
        modifications: [...(scenario.customConfig.modifications || []), modification],
      },
    }

    setScenario(updatedScenario)
    localStorage.setItem("scenario", JSON.stringify(updatedScenario))

    setScenarioModifications([...scenarioModifications, modification])

    toast.success("Tale adjusted", {
      description: "Changes will take effect over the next few turns",
    })

    addStoryEntry("narration", `[The tale's direction shifts subtly as ${reason.toLowerCase()}]`)
  }

  if (!character || !scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(50,50%,90%)]">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-[hsl(30,50%,40%)] border-t-transparent rounded-full mx-auto" />
          <p className="text-[hsl(25,50%,25%)] font-medium">Loading your adventure...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {scenario?.customConfig && (
        <ScenarioAdjustmentPanel
          scenario={scenario}
          onAdjust={handleAdjustment}
          currentTurn={storyEntries.filter((e) => e.type === "action").length}
          isInCombat={isInCombat}
        />
      )}

      <GameShell
        characterName={character.name}
        characterClass={character.race}
        health={currentHealth}
        maxHealth={character.maxHealth}
        level={currentLevel}
        onMenuClick={() => setShowCharacterDrawer(true)}
        onViewAchievements={() => setShowAchievements(true)}
        onSaveGame={() => setShowSaveLoad(true)}
      >
        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
          <div className="flex-1 flex flex-col overflow-hidden">
            {scenario?.customConfig && (
              <div className="p-4 pb-2">
                <QuestTracker
                  questName={scenario.customConfig.questHook || scenario.title}
                  urgency={scenario.customConfig.urgency}
                  stakes={scenario.customConfig.stakes}
                  currentObjective="Continue your journey"
                />
              </div>
            )}

            <StoryDisplay
              entries={storyEntries}
              currentChoices={currentChoices}
              onChoiceSelect={handleChoiceSelect}
              isLoading={isLoading}
              characterStats={characterStats}
            />
          </div>

          <aside className="hidden lg:block lg:w-72 flex-shrink-0 border-l-2 border-[hsl(35,40%,70%)] bg-[hsl(50,80%,95%)]">
            <div className="h-full overflow-y-auto p-3">
              <CharacterPanel
                character={character}
                currentHealth={currentHealth}
                onViewAchievements={() => setShowAchievements(true)}
                onItemClick={(item) => {
                  setSelectedItem(item)
                  setShowItemDetail(true)
                }}
              />
            </div>
          </aside>
        </div>
      </GameShell>

      <CharacterDrawer
        character={character}
        currentHealth={currentHealth}
        isOpen={showCharacterDrawer}
        onClose={() => setShowCharacterDrawer(false)}
        onViewAchievements={() => setShowAchievements(true)}
        onItemClick={(item) => {
          setSelectedItem(item)
          setShowItemDetail(true)
        }}
      />

      {showAchievements && <AchievementsModal onClose={() => setShowAchievements(false)} />}

      {showDiceRoller && (
        <DiceRoller
          onRoll={handleDiceRoll}
          onClose={() => {
            setShowDiceRoller(false)
            setIsLoading(false)
            if (currentChoices.length === 0) {
              setIsLoading(false)
            }
          }}
          diceType={diceConfig.type}
          modifier={diceConfig.modifier}
          reason={diceConfig.reason}
          statName={(diceConfig as any).statName}
        />
      )}

      {showGameOver && (
        <GameOverModal
          isOpen={showGameOver}
          cause={gameOverCause}
          finalStats={{
            turns: storyEntries.filter((e) => e.type === "action").length,
            gold: character.gold || 0,
          }}
        />
      )}

      {showVictory && (
        <VictoryScreen
          isOpen={showVictory}
          questName={scenario.title}
          finalStats={{
            turns: storyEntries.filter((e) => e.type === "action").length,
            gold: character.gold || 0,
            experience: currentXP,
          }}
        />
      )}

      {showSaveLoad && (
        <SaveLoadModal
          isOpen={showSaveLoad}
          onClose={() => setShowSaveLoad(false)}
          onSave={handleSaveGame}
          onLoad={handleLoadGame}
          currentSave={{
            id: "current",
            characterName: character.name,
            scenario: scenario.title,
            timestamp: new Date(),
            health: currentHealth,
            maxHealth: character.maxHealth,
            turnCount: storyEntries.filter((e) => e.type === "action").length,
          }}
        />
      )}

      {showLevelUp && currentQueuedModal?.data && (
        <LevelUpModal
          isOpen={showLevelUp}
          newLevel={currentQueuedModal.data.newLevel || currentLevel}
          onClose={() => {
            setShowLevelUp(false)
            modalQueue.dismiss()
          }}
          statIncreases={currentQueuedModal.data.statIncreases || {}}
        />
      )}

      {showItemDetail && selectedItem && (
        <ItemDetailModal
          isOpen={showItemDetail}
          item={selectedItem}
          onClose={() => {
            setShowItemDetail(false)
            setSelectedItem(null)
          }}
          onUse={
            selectedItem.type === "potion" || selectedItem.consumable
              ? () => {
                  handleUseItem(selectedItem)
                  setShowItemDetail(false)
                  setSelectedItem(null)
                }
              : undefined
          }
          onEquip={
            selectedItem.type === "weapon" || selectedItem.type === "armor"
              ? () => {
                  handleEquipItem(selectedItem)
                  setShowItemDetail(false)
                  setSelectedItem(null)
                }
              : undefined
          }
          onSell={(sellValue) => {
            handleSellItem(selectedItem, sellValue)
            setShowItemDetail(false)
            setSelectedItem(null)
          }}
          onDrop={() => {
            handleDropItem(selectedItem)
            setShowItemDetail(false)
            setSelectedItem(null)
          }}
        />
      )}
    </>
  )
}

export default function GamePage() {
  return (
    <NotificationManager>
      <GamePageContent />
    </NotificationManager>
  )
}
