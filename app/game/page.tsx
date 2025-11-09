"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { GameShell } from "@/components/game-shell"
import { StoryDisplay } from "@/components/story-display"
import { DiceRoller } from "@/components/dice-roller"
import { CharacterPanel } from "@/components/character-panel"
import { AchievementToast } from "@/components/achievement-toast"
import { AchievementsModal } from "@/components/achievements-modal"
import { ScenarioAdjustmentPanel } from "@/components/scenario-adjustment-panel"
import type { StoryEntry, EnhancedChoice, StatType, CustomScenarioConfig } from "@/lib/types"
import { toast } from "sonner"
import { unlockAchievement, getAchievementById } from "@/lib/achievements"

export default function GamePage() {
  const router = useRouter()
  const [character, setCharacter] = React.useState<any>(null)
  const [scenario, setScenario] = React.useState<any>(null)
  const [storyEntries, setStoryEntries] = React.useState<StoryEntry[]>([])
  const [currentHealth, setCurrentHealth] = React.useState(100)
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

  React.useEffect(() => {
    const savedCharacter = localStorage.getItem("character")
    const savedScenario = localStorage.getItem("scenario")

    if (!savedCharacter || !savedScenario) {
      router.push("/character-creation")
      return
    }

    const charData = JSON.parse(savedCharacter)
    const scenarioData = JSON.parse(savedScenario)

    setCharacter(charData)
    setScenario(scenarioData)
    setCurrentHealth(charData.maxHealth)

    startGame(charData, scenarioData)
  }, [router])

  const startGame = async (charData: any, scenarioData: any) => {
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (scenarioData.customConfig) {
      console.log("[v0] Starting custom scenario:", scenarioData.customConfig)
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
        actionType: "agility",
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

      if (!response.ok) throw new Error("Failed to generate opening")

      const { narrative, choices } = await response.json()

      addStoryEntry("narration", narrative)
      setCurrentChoices(choices)
      setIsLoading(false)
    } catch (error) {
      console.error("[v0] Failed to start custom scenario:", error)
      // Fallback to basic opening
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
      const modifier = Math.floor((statValue - 10) / 2)

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
          (result) => {
            const success = result >= enhancedChoice.dc!

            if (success) {
              addStoryEntry("narration", "Success! Your skill sees you through.")
              continueStoryAfterChoice(choiceText, true)
            } else {
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
            actionType: "agility",
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
      const response = await fetch("/api/process-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character,
          scenario,
          storyHistory: storyEntries,
          playerChoice,
          customConfig: scenario.customConfig,
        }),
      })

      if (!response.ok) throw new Error("Failed to process turn")

      const { narrative, choices, stateChanges } = await response.json()

      // Apply state changes
      if (stateChanges) {
        if (stateChanges.health !== undefined) {
          setCurrentHealth((prev) => Math.max(0, Math.min(character.maxHealth, prev + stateChanges.health)))
        }
        if (stateChanges.inventory) {
          // Update character inventory in localStorage
          const updatedCharacter = {
            ...character,
            inventory: [...character.inventory, ...stateChanges.inventory],
          }
          setCharacter(updatedCharacter)
          localStorage.setItem("character", JSON.stringify(updatedCharacter))
        }
      }

      addStoryEntry("narration", narrative)
      setCurrentChoices(choices)
      setIsLoading(false)
    } catch (error) {
      console.error("[v0] Failed to continue custom scenario:", error)
      // Fallback response
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

    // Update scenario in localStorage
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

    // Update local state
    setScenarioModifications([...scenarioModifications, modification])

    // Show confirmation
    toast.success("Tale adjusted", {
      description: "Changes will take effect over the next few turns",
    })

    // Add story entry
    addStoryEntry("narration", `[The tale's direction shifts subtly as ${reason.toLowerCase()}]`)
  }

  const isInCombat =
    storyEntries.length > 0 && storyEntries[storyEntries.length - 1]?.text?.toLowerCase().includes("combat")

  if (!character || !scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
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
        onViewAchievements={() => setShowAchievements(true)}
      >
        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
          <div className="flex-1 flex flex-col overflow-hidden">
            <StoryDisplay
              entries={storyEntries}
              currentChoices={currentChoices}
              onChoiceSelect={handleChoiceSelect}
              isLoading={isLoading}
              characterStats={characterStats}
            />
          </div>
          <aside className="hidden lg:block lg:w-72 flex-shrink-0 border-l border-[hsl(35,40%,70%)] bg-[hsl(50,80%,95%)]">
            <div className="h-full overflow-y-auto p-3">
              <CharacterPanel
                character={character}
                currentHealth={currentHealth}
                onViewAchievements={() => setShowAchievements(true)}
              />
            </div>
          </aside>
        </div>
      </GameShell>
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
    </>
  )
}
