"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import type { CombatState } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CombatOverlayProps {
  combatState: CombatState
}

export function CombatOverlay({ combatState }: CombatOverlayProps) {
  if (!combatState.isActive) {
    return null
  }

  const healthPercentage = (combatState.enemyHpCurrent / combatState.enemyHpMax) * 100

  return (
    <div className="w-full bg-gradient-to-r from-red-950 to-black border-b-2 border-red-900 py-3 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Enemy Name and Round */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-[family-name:var(--font-heading)] text-lg md:text-xl font-bold text-red-100">
            {combatState.enemyName}
          </h2>
          <span className="text-sm text-red-300 font-medium">
            Round {combatState.roundCount}
          </span>
        </div>

        {/* Health Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-red-200">
            <span>Enemy Health</span>
            <span className="font-mono">
              {combatState.enemyHpCurrent}/{combatState.enemyHpMax}
            </span>
          </div>
          <div className="w-full h-3 bg-red-950/50 rounded-full overflow-hidden border border-red-800">
            <div
              className={cn(
                "h-full transition-all duration-500 ease-out rounded-full",
                healthPercentage > 50
                  ? "bg-red-600"
                  : healthPercentage > 25
                    ? "bg-red-700"
                    : "bg-red-800",
              )}
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
