"use client"
import * as React from "react"
import { Sparkles, TrendingUp, Swords, Eye, Users, Wrench, Shield, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CharacterStats } from "@/lib/types"

/**
 * TICKET 18.2: Interactive Level-Up Core
 *
 * The LevelUpModal now allows the player to choose which stat to increase
 * when they level up, making the progression system interactive.
 */

interface LevelUpModalProps {
  isOpen: boolean
  newLevel: number
  onClose: (chosenStat?: keyof CharacterStats) => void
  statIncreases?: Record<string, number>
}

const STAT_OPTIONS: Array<{
  key: keyof CharacterStats
  label: string
  icon: React.ElementType
  color: string
  description: string
}> = [
  { key: "valor", label: "Valor", icon: Swords, color: "text-red-600", description: "Combat prowess" },
  { key: "wisdom", label: "Wisdom", icon: Eye, color: "text-purple-600", description: "Perception & insight" },
  { key: "fellowship", label: "Fellowship", icon: Users, color: "text-blue-600", description: "Charisma & diplomacy" },
  { key: "craft", label: "Craft", icon: Wrench, color: "text-orange-600", description: "Dexterity & skill" },
  { key: "endurance", label: "Endurance", icon: Shield, color: "text-green-600", description: "Constitution & HP" },
  { key: "lore", label: "Lore", icon: BookOpen, color: "text-blue-700", description: "Knowledge & magic" },
]

export function LevelUpModal({ isOpen, newLevel, onClose, statIncreases }: LevelUpModalProps) {
  const [chosenStat, setChosenStat] = React.useState<keyof CharacterStats | null>(null)

  // Reset chosen stat when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setChosenStat(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleContinue = () => {
    if (chosenStat) {
      onClose(chosenStat)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 animate-in fade-in duration-200">
      <div className="w-full max-w-md mx-4 bg-[hsl(50,80%,97%)] border-4 border-[hsl(45,80%,50%)] rounded-lg shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 space-y-6 text-center">
          {/* Level Up Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-[hsl(45,90%,88%)] border-4 border-[hsl(45,80%,50%)] flex items-center justify-center animate-pulse">
              <Sparkles className="h-10 w-10 text-[hsl(45,80%,40%)]" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[hsl(25,50%,25%)] mb-2">
              Level Up!
            </h2>
            <p className="text-xl text-[hsl(35,60%,40%)] font-bold">You reached Level {newLevel}</p>
          </div>

          {/* TICKET 18.2: Interactive Stat Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-[hsl(35,40%,40%)]">
              <TrendingUp className="h-4 w-4" />
              <span className="font-semibold">Choose a stat to increase (+1)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {STAT_OPTIONS.map((stat) => {
                const Icon = stat.icon
                const isSelected = chosenStat === stat.key

                return (
                  <button
                    key={stat.key}
                    onClick={() => setChosenStat(stat.key)}
                    className={cn(
                      "p-3 rounded border-2 transition-all duration-200 text-left",
                      isSelected
                        ? "border-[hsl(45,80%,50%)] bg-[hsl(45,60%,88%)] shadow-md scale-[1.02]"
                        : "border-[hsl(45,60%,70%)] bg-[hsl(50,70%,95%)] hover:bg-[hsl(45,60%,90%)] hover:border-[hsl(45,70%,60%)]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-5 w-5", stat.color)} />
                      <div>
                        <div className="text-sm font-semibold text-[hsl(25,50%,25%)]">{stat.label}</div>
                        <div className="text-xs text-[hsl(35,40%,50%)]">{stat.description}</div>
                      </div>
                      {isSelected && (
                        <span className="ml-auto text-lg font-bold text-green-600">+1</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Continue Button - Disabled until stat chosen */}
          <Button
            onClick={handleContinue}
            disabled={!chosenStat}
            className={cn(
              "w-full h-12 border-2 transition-all font-bold",
              chosenStat
                ? "bg-[hsl(45,80%,50%)] hover:bg-[hsl(45,80%,45%)] text-[hsl(25,50%,20%)] border-[hsl(45,80%,40%)] shadow-[2px_2px_0px_0px_hsl(45,80%,40%)] hover:shadow-[4px_4px_0px_0px_hsl(45,80%,40%)] hover:-translate-y-0.5"
                : "bg-[hsl(45,60%,80%)] text-[hsl(35,30%,50%)] border-[hsl(45,40%,70%)] cursor-not-allowed opacity-70"
            )}
          >
            {chosenStat ? `Apply +1 ${chosenStat.charAt(0).toUpperCase() + chosenStat.slice(1)}` : "Select a Stat to Continue"}
          </Button>
        </div>
      </div>
    </div>
  )
}
