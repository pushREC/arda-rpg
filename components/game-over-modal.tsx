"use client"
import { Skull, Home, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface GameOverModalProps {
  isOpen: boolean
  cause?: string
  finalStats?: {
    turns: number
    enemiesDefeated?: number
    itemsCollected?: number
    gold?: number
  }
}

export function GameOverModal({ isOpen, cause = "Your health reached zero", finalStats }: GameOverModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleRetry = () => {
    router.push("/scenario-selection")
  }

  const handleHome = () => {
    router.push("/")
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 animate-in fade-in duration-300">
      <div className="w-full max-w-md mx-4 bg-[hsl(50,80%,97%)] border-4 border-[hsl(35,40%,60%)] rounded-lg shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 space-y-6 text-center">
          {/* Death Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-[hsl(0,50%,85%)] border-4 border-[hsl(0,50%,50%)] flex items-center justify-center">
              <Skull className="h-10 w-10 text-[hsl(0,50%,30%)]" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[hsl(0,50%,25%)] mb-2">
              Your Tale Ends
            </h2>
            <p className="text-[hsl(25,40%,40%)] text-balance">{cause}</p>
          </div>

          {/* Stats Summary */}
          {finalStats && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[hsl(35,40%,92%)] rounded border-2 border-[hsl(35,40%,70%)]">
                <div className="text-sm text-[hsl(35,40%,40%)]">Turns</div>
                <div className="text-2xl font-bold text-[hsl(25,50%,25%)]">{finalStats.turns}</div>
              </div>
              <div className="p-3 bg-[hsl(35,40%,92%)] rounded border-2 border-[hsl(35,40%,70%)]">
                <div className="text-sm text-[hsl(35,40%,40%)]">Gold</div>
                <div className="text-2xl font-bold text-[hsl(25,50%,25%)]">{finalStats.gold || 0}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={handleRetry}
              className="w-full h-12 bg-[hsl(30,50%,40%)] hover:bg-[hsl(30,50%,35%)] text-white border-2 border-[hsl(30,50%,30%)] shadow-[2px_2px_0px_0px_hsl(30,50%,30%)] hover:shadow-[4px_4px_0px_0px_hsl(30,50%,30%)] hover:-translate-y-0.5 transition-all"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Try Again
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
