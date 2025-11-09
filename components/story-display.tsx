"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { ChoiceButton } from "@/components/choice-button"
import type { EnhancedChoice, StoryEntry, StatType } from "@/lib/types"

interface StoryDisplayProps {
  entries?: StoryEntry[]
  currentChoices?: (string | EnhancedChoice)[]
  onChoiceSelect?: (choice: string | EnhancedChoice) => void
  isLoading?: boolean
  characterStats?: Record<StatType, number>
}

export function StoryDisplay({
  entries = [],
  currentChoices = [],
  onChoiceSelect,
  isLoading = false,
  characterStats,
}: StoryDisplayProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }, [entries, isLoading])

  const isEnhancedChoice = (choice: string | EnhancedChoice): choice is EnhancedChoice => {
    return typeof choice === "object" && "actionType" in choice
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 min-h-0 p-4 md:p-6">
        <div className="h-full rounded-lg border-2 border-[hsl(35,40%,70%)] bg-[hsl(50,80%,97%)] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="space-y-4">
              {entries.length === 0 ? (
                <div className="flex items-center justify-center min-h-[200px] text-[hsl(25,40%,50%)]">
                  <p className="text-center text-balance">Your adventure begins here...</p>
                </div>
              ) : (
                entries.map((entry) => (
                  <div key={entry.id} className="animate-[fade-in-up_0.4s_ease-out]">
                    {entry.type === "narration" && (
                      <p className="text-[hsl(25,50%,25%)] leading-relaxed text-pretty">{entry.text}</p>
                    )}
                    {entry.type === "action" && (
                      <p className="text-[hsl(25,70%,40%)] font-medium italic">{entry.text}</p>
                    )}
                    {entry.type === "dice-roll" && (
                      <div className="inline-flex items-center gap-2 bg-[hsl(50,70%,92%)] px-3 py-1.5 rounded-lg border border-[hsl(35,40%,75%)]">
                        <span className="text-sm font-medium text-[hsl(25,50%,30%)]">{entry.text}</span>
                      </div>
                    )}
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex items-center gap-2 text-[hsl(25,40%,50%)]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">The tale continues...</span>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>
        </div>
      </div>

      {currentChoices.length > 0 && !isLoading && (
        <div className="flex-shrink-0 px-4 md:px-6 pb-4 md:pb-6">
          <div className="rounded-lg border-2 border-[hsl(35,40%,70%)] bg-[hsl(50,70%,92%)] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-4 space-y-3">
            <p className="text-sm text-[hsl(25,50%,40%)] font-medium">What will you do?</p>
            <div className="grid grid-cols-1 gap-2">
              {currentChoices.map((choice, index) => {
                if (isEnhancedChoice(choice)) {
                  return (
                    <ChoiceButton
                      key={choice.id}
                      choice={choice}
                      characterStats={characterStats}
                      onClick={() => onChoiceSelect?.(choice)}
                      index={index}
                    />
                  )
                } else {
                  return (
                    <ChoiceButton
                      key={index}
                      choice={{
                        id: `choice-${index}`,
                        text: choice,
                        actionType: "narrative",
                        requiresRoll: false,
                      }}
                      onClick={() => onChoiceSelect?.(choice)}
                      index={index}
                    />
                  )
                }
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
