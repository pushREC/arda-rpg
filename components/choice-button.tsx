"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  Dices,
  MessageCircle,
  Swords,
  Users,
  Search,
  Zap,
  Eye,
  Mountain,
  Shield,
  Hammer,
  BookOpen,
  Check,
} from "lucide-react"
import type { EnhancedChoice, StatType } from "@/lib/types"

interface ChoiceButtonProps {
  choice: EnhancedChoice
  characterStats?: Record<StatType, number>
  onClick: () => void
  index?: number
  selected?: boolean
}

const actionIcons = {
  combat: Swords,
  social: Users,
  investigation: Search,
  craft: Zap,
  narrative: MessageCircle,
  stealth: Eye,
  survival: Mountain,
}

const statIcons = {
  valor: Swords,
  wisdom: Eye,
  fellowship: Users,
  craft: Hammer,
  endurance: Shield,
  lore: BookOpen,
}

const statNames = {
  valor: "Valor",
  wisdom: "Wisdom",
  fellowship: "Fellowship",
  craft: "Craft",
  endurance: "Endurance",
  lore: "Lore",
}

export function ChoiceButton({ choice, characterStats, onClick, index = 0, selected = false }: ChoiceButtonProps) {
  const ActionIcon = actionIcons[choice.actionType] || MessageCircle
  const StatIcon = choice.stat ? statIcons[choice.stat] : null

  // Calculate success probability if roll is required
  const getSuccessProbability = React.useMemo(() => {
    if (!choice.requiresRoll || !choice.dc || !choice.stat || !characterStats) return null

    const statValue = characterStats[choice.stat] || 0
    const modifier = choice.modifier || 0
    // Stat value IS the modifier (not D&D's (stat-10)/2), plus any additional modifiers
    const totalModifier = statValue + modifier
    const dc = choice.dc

    // Probability: Need to roll (dc - modifier) or higher on d20
    const neededRoll = dc - totalModifier
    let probability = 0

    if (neededRoll <= 1)
      probability = 100 // Always succeed (except nat 1)
    else if (neededRoll >= 20)
      probability = 5 // Only nat 20
    else probability = ((21 - neededRoll) / 20) * 100

    return Math.max(5, Math.min(95, Math.round(probability)))
  }, [choice, characterStats])

  return (
    <Button
      variant="outline"
      className={`justify-between h-auto py-3 px-3 md:px-4 text-left hover:bg-primary/10 hover:border-primary hover:-translate-y-0.5 transition-all duration-200 border-2 shadow-button-primary hover:shadow-button-hover group w-full ${
        selected
          ? "bg-[hsl(35,60%,88%)] border-[hsl(30,50%,40%)] shadow-card-hover"
          : "bg-transparent border-[hsl(30,40%,20%)]"
      }`}
      onClick={onClick}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
        <div
          className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-md flex items-center justify-center ${
            selected
              ? "bg-[hsl(30,50%,40%)] border border-[hsl(30,50%,40%)]"
              : choice.requiresRoll
                ? "bg-amber-100 border border-amber-300"
                : "bg-slate-100 border border-slate-300"
          }`}
        >
          {selected ? (
            <Check className="h-4 w-4 text-white" />
          ) : (
            <ActionIcon
              className={`h-3.5 w-3.5 md:h-4 md:w-4 ${choice.requiresRoll ? "text-amber-700" : "text-slate-600"}`}
            />
          )}
        </div>

        {/* Choice Text */}
        <div className="flex-1 min-w-0">
          <span className="text-pretty block text-sm md:text-base">{choice.text}</span>

          {/* Show consequence hint if exists */}
          {choice.consequence && (
            <span className="text-xs text-muted-foreground italic block mt-1 text-pretty hidden sm:block">
              {choice.consequence}
            </span>
          )}
        </div>

        {choice.requiresRoll && choice.stat && StatIcon && characterStats && (
          <div className="flex-shrink-0 flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 text-xs">
            <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-[hsl(50,80%,92%)] border border-[hsl(35,40%,70%)]">
              <Dices className="h-3 w-3 text-[hsl(35,40%,40%)]" />
              <span className="font-medium text-[hsl(35,40%,30%)] text-[10px] sm:text-xs">
                {statNames[choice.stat]}
              </span>
            </div>

            {getSuccessProbability !== null && (
              <div
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-semibold text-[10px] sm:text-xs whitespace-nowrap ${
                  getSuccessProbability >= 70
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : getSuccessProbability >= 40
                      ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                      : "bg-red-100 text-red-700 border border-red-300"
                }`}
              >
                {getSuccessProbability}%
              </div>
            )}
          </div>
        )}
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 ml-2 transition-transform group-hover:translate-x-1" />
    </Button>
  )
}
