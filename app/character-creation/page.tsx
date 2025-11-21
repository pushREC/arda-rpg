"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Swords, Eye, Users, Wrench, Shield, BookOpen, Minus, Plus, Sparkles } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Race, Background, CharacterStats, InventoryItem } from "@/lib/types"
import {
  RACES,
  BACKGROUNDS,
  POINT_BUY_TOTAL,
  STAT_MIN,
  STAT_MAX,
  calculateFinalStats,
  calculateStartingHP,
} from "@/lib/character-data"
import { calculateDerivedStats } from "@/lib/rules"
import { InventoryItemCard } from "@/components/inventory-item"
import { WizardProgress } from "@/components/wizard-progress"
import { NavigationFooter } from "@/components/navigation-footer"
import { generateItemStats } from "@/lib/game-logic"

type Step = "name" | "race" | "background" | "stats" | "confirmation"

const STAT_CONFIG = {
  valor: { label: "Valor", icon: Swords, color: "text-red-600", description: "Combat prowess, courage" },
  wisdom: { label: "Wisdom", icon: Eye, color: "text-purple-600", description: "Perception, insight" },
  fellowship: { label: "Fellowship", icon: Users, color: "text-blue-600", description: "Charisma, diplomacy" },
  craft: { label: "Craft", icon: Wrench, color: "text-orange-600", description: "Dexterity, skill" },
  endurance: { label: "Endurance", icon: Shield, color: "text-green-600", description: "Constitution, stamina" },
  lore: { label: "Lore", icon: BookOpen, color: "text-blue-700", description: "Knowledge, intelligence" },
}

export default function CharacterCreationPage() {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>("name")

  // Character data
  const [characterName, setCharacterName] = React.useState("")
  const [selectedRace, setSelectedRace] = React.useState<Race | null>(null)
  const [selectedBackground, setSelectedBackground] = React.useState<Background | null>(null)
  const [humanBonusStat, setHumanBonusStat] = React.useState<keyof CharacterStats | null>(null)
  const [baseStats, setBaseStats] = React.useState<CharacterStats>({
    valor: 3,
    wisdom: 3,
    fellowship: 3,
    craft: 3,
    endurance: 3,
    lore: 3,
  })

  const pointsSpent = Object.values(baseStats).reduce((sum, val) => sum + val, 0)
  const pointsRemaining = POINT_BUY_TOTAL - pointsSpent

  const finalStats = React.useMemo(() => {
    if (!selectedRace || !selectedBackground) return baseStats
    return calculateFinalStats(baseStats, selectedRace, selectedBackground, humanBonusStat || undefined)
  }, [baseStats, selectedRace, selectedBackground, humanBonusStat])

  // Step navigation
  const handleContinue = () => {
    if (step === "name" && characterName.trim()) {
      setStep("race")
    } else if (step === "race" && selectedRace) {
      setStep("background")
    } else if (step === "background" && selectedBackground) {
      setStep("stats")
    } else if (step === "stats" && pointsRemaining === 0) {
      setStep("confirmation")
    }
  }

  const handleBack = () => {
    if (step === "race") setStep("name")
    else if (step === "background") setStep("race")
    else if (step === "stats") setStep("background")
    else if (step === "confirmation") setStep("stats")
  }

  const handleBeginAdventure = () => {
    if (!selectedRace || !selectedBackground) return

    const raceData = RACES[selectedRace]
    const backgroundData = BACKGROUNDS[selectedBackground]
    const startingHP = calculateStartingHP(finalStats.endurance)

    // 1. Generate raw inventory (existing logic)
    const rawInventory = backgroundData.equipment.map((item, idx) => {
      // Detect item type based on name keywords
      const itemLower = item.toLowerCase()
      let type: InventoryItem["type"] = "quest"

      // TICKET 18.1: Detect accessories (ring, amulet, cloak)
      if (
        itemLower.includes("ring") ||
        itemLower.includes("amulet") ||
        itemLower.includes("necklace") ||
        itemLower.includes("pendant") ||
        itemLower.includes("cloak") ||
        itemLower.includes("cape") ||
        itemLower.includes("brooch")
      ) {
        type = "accessory"
      } else if (
        itemLower.includes("sword") ||
        itemLower.includes("bow") ||
        itemLower.includes("knife") ||
        itemLower.includes("staff") ||
        itemLower.includes("dagger") ||
        itemLower.includes("axe") ||
        itemLower.includes("mace") ||
        itemLower.includes("hammer")
      ) {
        type = "weapon"
      } else if (
        itemLower.includes("armor") ||
        itemLower.includes("shield") ||
        itemLower.includes("chainmail") ||
        itemLower.includes("helmet")
      ) {
        type = "armor"
      }

      // TICKET 18.1: Generate stats for all functional gear (weapons, armor, accessories)
      const stats =
        type === "weapon" || type === "armor" || type === "accessory"
          ? generateItemStats(itemLower, "common")
          : undefined

      return {
        id: `item-${idx}`,
        name: item,
        description: `Starting equipment from ${backgroundData.name} background`,
        type,
        quantity: 1,
        value: 0,
        stats,
      }
    })

    // 2. Auto-Equip Logic (TICKET 19.1)
    let hasWeapon = false
    let hasArmor = false

    const equippedInventory = rawInventory.map((item) => {
      // Auto-equip first weapon found
      if (item.type === "weapon" && !hasWeapon) {
        hasWeapon = true
        return { ...item, equipped: true }
      }
      // Auto-equip first armor found
      if (item.type === "armor" && !hasArmor) {
        hasArmor = true
        return { ...item, equipped: true }
      }
      return item
    })

    // 3. Recalculate Stats based on auto-equipped gear (TICKET 19.1)
    const startingStats = calculateDerivedStats(
      finalStats, // This is the baseStats calculated earlier in the component
      equippedInventory,
      [] // No active effects at start
    )

    // 4. Construct final Character object
    const character = {
      id: crypto.randomUUID(),
      name: characterName,
      race: selectedRace,
      background: selectedBackground,
      raceAbility: raceData.ability,
      baseStats: finalStats, // Base stats (naked, no equipment)
      stats: startingStats, // USE RECALCULATED STATS (TICKET 19.1)
      level: 1,
      experience: 0,
      health: startingHP,
      maxHealth: startingHP,
      gold: backgroundData.startingGold,
      inventory: equippedInventory, // USE EQUIPPED INVENTORY (TICKET 19.1)
      companions: [],
      combat: {
        isActive: false,
        enemyId: null,
        enemyName: null,
        enemyHpCurrent: 0,
        enemyHpMax: 0,
        roundCount: 0,
      },
      isDead: false,
    }

    localStorage.setItem("character", JSON.stringify(character))
    router.push("/scenario-selection")
  }

  const adjustStat = (stat: keyof CharacterStats, delta: number) => {
    const newValue = baseStats[stat] + delta
    if (newValue < STAT_MIN || newValue > STAT_MAX) return
    if (delta > 0 && pointsRemaining <= 0) return

    setBaseStats((prev) => ({ ...prev, [stat]: newValue }))
  }

  // Step progress
  const stepNumber = { name: 1, race: 2, background: 3, stats: 4, confirmation: 5 }[step]
  const totalSteps = 5

  const canProceedName = () => characterName.trim().length > 0
  const canProceedRace = () => selectedRace !== null
  const canProceedBackground = () => selectedBackground !== null
  const canProceedStats = () => pointsRemaining === 0 && (selectedRace !== "human" || humanBonusStat !== null)

  const canProceedCurrentStep = () => {
    switch (step) {
      case "name":
        return canProceedName()
      case "race":
        return canProceedRace()
      case "background":
        return canProceedBackground()
      case "stats":
        return canProceedStats()
      case "confirmation":
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[hsl(40,30%,94%)]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {step !== "name" ? (
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              className="border-2 border-[hsl(30,40%,20%)] shadow-card-interactive bg-transparent hover:-translate-y-0.5 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Link href="/">
              <Button
                variant="outline"
                size="icon"
                className="border-2 border-[hsl(30,40%,20%)] shadow-card-interactive bg-transparent hover:-translate-y-0.5 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <div className="flex-1">
            <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold">Create Your Hero</h1>
            <p className="text-[hsl(30,40%,40%)] text-sm md:text-base">
              {step === "name" && "Choose a name for your character"}
              {step === "race" && "Select your character's race"}
              {step === "background" && "Choose your background"}
              {step === "stats" && "Allocate your stat points"}
              {step === "confirmation" && "Review your character"}
            </p>
          </div>
        </div>

        <Card className="p-6 bg-[hsl(40,35%,92%)] border-2 border-[hsl(30,40%,20%)] shadow-card">
          <WizardProgress
            currentStep={stepNumber}
            totalSteps={totalSteps}
            labels={["Name", "Race", "Background", "Stats", "Confirm"]}
          />
        </Card>

        {/* Step 1: Name Entry */}
        {step === "name" && (
          <div className="space-y-6 animate-[fade-in-up_0.5s_ease-out]">
            <Card className="p-8 bg-[hsl(40,35%,92%)] border-2 border-[hsl(30,40%,20%)] shadow-card">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="characterName" className="text-lg font-medium flex items-center gap-2">
                    Character Name
                    <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="characterName"
                    placeholder="Enter your hero's name..."
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    className="mt-2 text-lg h-14 border-2 border-[hsl(30,40%,20%)] bg-[hsl(40,30%,96%)]"
                    autoFocus
                  />
                  <p className="text-xs text-[hsl(30,40%,40%)] mt-2">Give your hero a memorable name</p>
                </div>
              </div>
            </Card>

            <NavigationFooter
              onNext={handleContinue}
              nextLabel="Continue"
              canProceed={canProceedName()}
              showBack={false}
              showFinishWithAI={false}
            />
          </div>
        )}

        {/* Step 2: Race Selection */}
        {step === "race" && (
          <div className="space-y-6 animate-[fade-in-up_0.5s_ease-out]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(RACES).map(([key, race]) => {
                const isSelected = selectedRace === key

                return (
                  <Card
                    key={key}
                    className={cn(
                      "p-6 cursor-pointer transition-all duration-200 border-2 bg-[hsl(40,35%,92%)]",
                      isSelected
                        ? "border-[hsl(30,50%,40%)] shadow-card-hover scale-[1.02]"
                        : "border-[hsl(30,40%,20%)] shadow-card hover:shadow-card-hover hover:scale-[1.01]",
                    )}
                    onClick={() => setSelectedRace(key as Race)}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold">{race.name}</h3>
                          <p className="text-sm text-[hsl(30,40%,40%)] mt-1 text-pretty">{race.description}</p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[hsl(30,50%,50%)] flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="pt-2 space-y-2 border-t border-[hsl(30,40%,60%)]">
                        <p className="text-sm font-medium">Stat Bonuses:</p>
                        <p className="text-sm text-[hsl(30,40%,40%)]">
                          {race.bonuses.flexChoice
                            ? "+2 to any stat of your choice"
                            : Object.entries(race.bonuses)
                                .map(([stat, val]) => `+${val} ${stat.charAt(0).toUpperCase() + stat.slice(1)}`)
                                .join(", ")}
                        </p>
                        <p className="text-xs text-[hsl(30,40%,40%)] pt-1">
                          <span className="font-medium">Ability:</span> {race.abilityDescription}
                        </p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            <NavigationFooter
              onBack={handleBack}
              onNext={handleContinue}
              nextLabel="Continue"
              canProceed={canProceedRace()}
              showBack={true}
              showFinishWithAI={false}
            />
          </div>
        )}

        {/* Step 3: Background Selection */}
        {step === "background" && (
          <div className="space-y-6 animate-[fade-in-up_0.5s_ease-out]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(BACKGROUNDS).map(([key, background]) => {
                const isSelected = selectedBackground === key

                return (
                  <Card
                    key={key}
                    className={cn(
                      "p-6 cursor-pointer transition-all duration-200 border-2 bg-[hsl(40,35%,92%)]",
                      isSelected
                        ? "border-[hsl(30,50%,40%)] shadow-card-hover scale-[1.02]"
                        : "border-[hsl(30,40%,20%)] shadow-card hover:shadow-card-hover hover:scale-[1.01]",
                    )}
                    onClick={() => setSelectedBackground(key as Background)}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold">
                            {background.name}
                          </h3>
                          <p className="text-sm text-[hsl(30,40%,40%)] mt-1 text-pretty">{background.description}</p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[hsl(30,50%,50%)] flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 pt-2 border-t border-[hsl(30,40%,60%)]">
                        <div>
                          <p className="text-sm font-medium">Stat Bonuses:</p>
                          <p className="text-sm text-[hsl(30,40%,40%)]">
                            {Object.entries(background.bonuses)
                              .map(([stat, val]) => `+${val} ${stat.charAt(0).toUpperCase() + stat.slice(1)}`)
                              .join(", ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Starting Gold: {background.startingGold}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[hsl(30,40%,40%)]">Equipment:</p>
                          <p className="text-xs text-[hsl(30,40%,40%)]">{background.equipment.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            <NavigationFooter
              onBack={handleBack}
              onNext={handleContinue}
              nextLabel="Continue"
              canProceed={canProceedBackground()}
              showBack={true}
              showFinishWithAI={false}
            />
          </div>
        )}

        {/* Step 4: Stat Allocation */}
        {step === "stats" && (
          <div className="space-y-6 animate-[fade-in-up_0.5s_ease-out]">
            <Card className="p-8 bg-[hsl(40,35%,92%)] border-2 border-[hsl(30,40%,20%)] shadow-card">
              <div className="space-y-6">
                {/* Points Remaining */}
                <div className="flex items-center justify-between pb-4 border-b border-[hsl(30,40%,60%)]">
                  <div>
                    <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold">Allocate Stat Points</h3>
                    <p className="text-sm text-[hsl(30,40%,40%)]">
                      Distribute {POINT_BUY_TOTAL} points (min {STAT_MIN}, max {STAT_MAX} per stat)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[hsl(30,40%,40%)]">Points Remaining</p>
                    <p
                      className={cn(
                        "text-3xl font-bold",
                        pointsRemaining === 0 ? "text-green-600" : "text-[hsl(30,50%,50%)]",
                      )}
                    >
                      {pointsRemaining}
                    </p>
                  </div>
                </div>

                {/* Human Bonus Selection */}
                {selectedRace === "human" && (
                  <div className="p-4 bg-[hsl(35,60%,88%)] rounded-lg border border-[hsl(30,40%,60%)]">
                    <Label className="text-sm font-medium mb-2 block">Human Versatility: Choose +2 bonus stat</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(STAT_CONFIG).map(([key, config]) => (
                        <Button
                          key={key}
                          variant={humanBonusStat === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setHumanBonusStat(key as keyof CharacterStats)}
                          className="border-2 border-[hsl(30,40%,20%)] hover:-translate-y-0.5 transition-all"
                        >
                          {config.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stat Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(STAT_CONFIG).map(([key, config]) => {
                    const Icon = config.icon
                    const baseStat = baseStats[key as keyof CharacterStats]
                    const finalStat = finalStats[key as keyof CharacterStats]
                    const bonus = finalStat - baseStat

                    return (
                      <Card
                        key={key}
                        className="p-4 bg-[hsl(40,30%,96%)] border-2 border-[hsl(30,40%,20%)] shadow-card-interactive"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Icon className={cn("w-5 h-5", config.color)} />
                            <div>
                              <p className="font-medium text-sm">{config.label}</p>
                              <p className="text-xs text-[hsl(30,40%,40%)]">{config.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-2 border-[hsl(30,40%,20%)] bg-transparent"
                              onClick={() => adjustStat(key as keyof CharacterStats, -1)}
                              disabled={baseStat <= STAT_MIN}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-1 min-w-[80px] justify-center">
                              <span className="text-2xl font-bold">{baseStat}</span>
                              {bonus > 0 && (
                                <>
                                  <span className="text-xl text-[hsl(30,40%,40%)]">+</span>
                                  <span className="text-xl text-green-600 font-bold">{bonus}</span>
                                </>
                              )}
                            </div>

                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-2 border-[hsl(30,40%,20%)] bg-transparent"
                              onClick={() => adjustStat(key as keyof CharacterStats, 1)}
                              disabled={baseStat >= STAT_MAX || pointsRemaining <= 0}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {bonus > 0 && (
                            <p className="text-xs text-center text-[hsl(30,40%,40%)]">Final: {finalStat}</p>
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>

                {pointsRemaining > 0 && (
                  <p className="text-sm text-center text-[hsl(30,40%,40%)]">
                    You must spend all {POINT_BUY_TOTAL} points to continue
                  </p>
                )}
              </div>
            </Card>

            <NavigationFooter
              onBack={handleBack}
              onNext={handleContinue}
              nextLabel="Continue"
              canProceed={canProceedStats()}
              showBack={true}
              showFinishWithAI={false}
            />
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === "confirmation" && selectedRace && selectedBackground && (
          <div className="space-y-6 animate-[fade-in-up_0.5s_ease-out]">
            <Card className="p-8 bg-[hsl(40,35%,92%)] border-2 border-[hsl(30,40%,20%)] shadow-card">
              <div className="space-y-6">
                <div className="text-center pb-4 border-b border-[hsl(30,40%,60%)]">
                  <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold">{characterName}</h2>
                  <p className="text-lg text-[hsl(30,40%,40%)] mt-1">
                    {RACES[selectedRace].name} {BACKGROUNDS[selectedBackground].name}
                  </p>
                </div>

                {/* Stats Grid */}
                <div>
                  <h3 className="text-sm font-semibold text-[hsl(30,40%,40%)] uppercase mb-3">Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(STAT_CONFIG).map(([key, config]) => {
                      const Icon = config.icon
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-3 p-3 bg-[hsl(40,25%,85%)] rounded-lg border border-[hsl(30,40%,60%)]"
                        >
                          <Icon className={cn("w-5 h-5", config.color)} />
                          <div>
                            <p className="text-xs text-[hsl(30,40%,40%)] uppercase">{config.label}</p>
                            <p className="text-lg font-bold">{finalStats[key as keyof CharacterStats]}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Health */}
                <div className="flex items-center justify-between p-4 bg-[hsl(40,25%,85%)] rounded-lg border border-[hsl(30,40%,60%)]">
                  <p className="font-medium">Starting Health</p>
                  <p className="text-2xl font-bold text-green-600">{calculateStartingHP(finalStats.endurance)}</p>
                </div>

                {/* Race Ability */}
                <div className="p-4 bg-[hsl(35,60%,88%)] rounded-lg border border-[hsl(30,40%,60%)]">
                  <p className="text-sm font-medium mb-1">Racial Ability: {RACES[selectedRace].ability}</p>
                  <p className="text-sm text-[hsl(30,40%,40%)]">{RACES[selectedRace].abilityDescription}</p>
                </div>

                {/* Equipment */}
                <div>
                  <h3 className="text-sm font-semibold text-[hsl(30,40%,40%)] uppercase mb-3">Equipment</h3>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-4">
                    {BACKGROUNDS[selectedBackground].equipment.map((item, idx) => {
                      const mockItem: InventoryItem = {
                        id: `preview-${idx}`,
                        name: item,
                        description: `Starting equipment from ${BACKGROUNDS[selectedBackground].name} background`,
                        type: "quest",
                        quantity: 1,
                        value: 0,
                      }
                      return <InventoryItemCard key={idx} item={mockItem} size="md" showLabel interactive={false} />
                    })}
                  </div>

                  {/* Starting Gold */}
                  <div className="mt-4 flex items-center justify-between px-4 py-3 bg-[hsl(45,60%,88%)] rounded-lg border border-[hsl(30,40%,60%)]">
                    <span className="text-sm font-semibold text-[hsl(30,40%,30%)]">Starting Gold</span>
                    <span className="text-2xl font-bold text-[hsl(35,60%,40%)]">
                      {BACKGROUNDS[selectedBackground].startingGold}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <NavigationFooter
              onBack={handleBack}
              onNext={handleBeginAdventure}
              nextLabel="Begin Adventure"
              canProceed={true}
              showBack={true}
              showFinishWithAI={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}
