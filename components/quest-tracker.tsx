"use client"

import * as React from "react"
import { Scroll, AlertTriangle, Target } from "lucide-react"

interface QuestTrackerProps {
  questName: string
  urgency?: string
  stakes?: string
  currentObjective?: string
}

export function QuestTracker({ questName, urgency, stakes, currentObjective }: QuestTrackerProps) {
  const [isExpanded, setIsExpanded] = React.useState(true)

  return (
    <div className="bg-[hsl(50,80%,97%)] border-2 border-[hsl(35,40%,70%)] rounded-lg shadow-md">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-[hsl(50,80%,92%)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Scroll className="h-4 w-4 text-[hsl(35,60%,40%)]" />
          <span className="font-bold text-sm text-[hsl(25,50%,25%)]">Quest: {questName}</span>
        </div>
        <span className="text-xs text-[hsl(35,40%,40%)]">{isExpanded ? "▼" : "▶"}</span>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-2 text-xs animate-in slide-in-from-top-2 duration-200">
          {urgency && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-[hsl(35,40%,30%)]">Urgency:</div>
                <div className="text-[hsl(35,40%,40%)]">{urgency}</div>
              </div>
            </div>
          )}
          {stakes && (
            <div className="flex items-start gap-2">
              <Target className="h-3.5 w-3.5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-[hsl(35,40%,30%)]">Stakes:</div>
                <div className="text-[hsl(35,40%,40%)]">{stakes}</div>
              </div>
            </div>
          )}
          {currentObjective && (
            <div className="mt-2 p-2 bg-[hsl(45,60%,88%)] rounded border border-[hsl(45,60%,70%)]">
              <div className="font-semibold text-[hsl(35,40%,30%)] mb-1">Current Objective:</div>
              <div className="text-[hsl(35,40%,40%)]">{currentObjective}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
