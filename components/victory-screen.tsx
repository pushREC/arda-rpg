"use client"
import { Trophy, Home, RotateCcw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface VictoryScreenProps {
  isOpen: boolean
  questName?: string
  finalStats?: {
    turns: number
    enemiesDefeated?: number
    itemsCollected?: number
    gold?: number
    experience?: number
  }
}

export function VictoryScreen({ isOpen, questName = "The Quest", finalStats }: VictoryScreenProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleNewQuest = () => {
    router.push("/scenario-selection")
  }

  const handleHome = () => {
    router.push("/")
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 animate-in fade-in duration-300">
      <div className="w-full max-w-lg mx-4 bg-[hsl(50,80%,97%)] border-4 border-[hsl(45,80%,50%)] rounded-lg shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 space-y-6 text-center">
          {/* Victory Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-[hsl(45,90%,88%)] border-4 border-[hsl(45,80%,50%)] flex items-center justify-center animate-pulse">
              <Trophy className="h-12 w-12 text-[hsl(45,80%,40%)]" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[hsl(25,50%,25%)] mb-2">
              Victory!
            </h2>
            <p className="text-[hsl(25,40%,40%)] text-balance">You have completed {questName}</p>
          </div>

          {/* Stats Summary */}
          {finalStats && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[hsl(45,60%,88%)] rounded border-2 border-[hsl(45,60%,70%)]">
                <div className="text-sm text-[hsl(35,40%,40%)]">Turns</div>
                <div className="text-2xl font-bold text-[hsl(25,50%,25%)]">{finalStats.turns}</div>
              </div>
              <div className="p-3 bg-[hsl(45,60%,88%)] rounded border-2 border-[hsl(45,60%,70%)]">
                <div className="text-sm text-[hsl(35,40%,40%)]">Gold Earned</div>
                <div className="text-2xl font-bold text-[hsl(25,50%,25%)]">{finalStats.gold || 0}</div>
              </div>
              {finalStats.experience !== undefined && (
                <div className="col-span-2 p-3 bg-[hsl(45,60%,88%)] rounded border-2 border-[hsl(45,60%,70%)]">
                  <div className="text-sm text-[hsl(35,40%,40%)] mb-1 flex items-center justify-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    Experience Gained
                  </div>
                  <div className="text-3xl font-bold text-[hsl(25,50%,25%)]">+{finalStats.experience}</div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={handleNewQuest}
              className="w-full h-12 bg-[hsl(45,80%,50%)] hover:bg-[hsl(45,80%,45%)] text-[hsl(25,50%,20%)] border-2 border-[hsl(45,80%,40%)] shadow-[2px_2px_0px_0px_hsl(45,80%,40%)] hover:shadow-[4px_4px_0px_0px_hsl(45,80%,40%)] hover:-translate-y-0.5 transition-all font-bold"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              New Adventure
            </Button>
            <Button
              onClick={handleHome}
              variant="outline"
              className="w-full h-12 border-2 border-[hsl(35,40%,60%)] bg-transparent hover:bg-[hsl(50,80%,92%)] shadow-[2px_2px_0px_0px_hsl(35,40%,60%)] hover:shadow-[4px_4px_0px_0px_hsl(35,40%,60%)] hover:-translate-y-0.5 transition-all"
            >
              <Home className="h-5 w-5 mr-2" />
              Return Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
