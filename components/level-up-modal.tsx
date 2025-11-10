"use client"
import { Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LevelUpModalProps {
  isOpen: boolean
  newLevel: number
  onClose: () => void
  statIncreases?: Record<string, number>
}

export function LevelUpModal({ isOpen, newLevel, onClose, statIncreases }: LevelUpModalProps) {
  if (!isOpen) return null

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

          {/* Stat Increases */}
          {statIncreases && Object.keys(statIncreases).length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-[hsl(35,40%,40%)]">
                <TrendingUp className="h-4 w-4" />
                <span className="font-semibold">Stats Increased</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(statIncreases).map(([stat, increase]) => (
                  <div
                    key={stat}
                    className="p-2 bg-[hsl(45,60%,88%)] rounded border-2 border-[hsl(45,60%,70%)] text-center"
                  >
                    <div className="text-xs text-[hsl(35,40%,40%)] capitalize">{stat}</div>
                    <div className="text-lg font-bold text-green-600">+{increase}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Continue Button */}
          <Button
            onClick={onClose}
            className="w-full h-12 bg-[hsl(45,80%,50%)] hover:bg-[hsl(45,80%,45%)] text-[hsl(25,50%,20%)] border-2 border-[hsl(45,80%,40%)] shadow-[2px_2px_0px_0px_hsl(45,80%,40%)] hover:shadow-[4px_4px_0px_0px_hsl(45,80%,40%)] hover:-translate-y-0.5 transition-all font-bold"
          >
            Continue Adventure
          </Button>
        </div>
      </div>
    </div>
  )
}
