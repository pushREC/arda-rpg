"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { X, Sparkles, Zap, Dices, RotateCcw, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSound } from "@/components/sound-provider"

interface DiceRollerProps {
  onRoll: (result: number) => void
  onClose: () => void
  diceType?: 6 | 8 | 10 | 12 | 20
  modifier?: number
  reason?: string
  statName?: string
  bonus?: number
  advantage?: boolean
  currentHealth?: number
  maxHealth?: number
  statValue?: number
}

type DiceState = "ready" | "rolling" | "slowing" | "result"

export function DiceRoller({
  onRoll,
  onClose,
  diceType = 20,
  modifier = 0,
  reason = "Roll to determine the outcome",
  statName,
  bonus = 0,
  advantage = false,
  currentHealth,
  maxHealth,
  statValue,
}: DiceRollerProps) {
  const { playSound } = useSound()
  const [diceState, setDiceState] = React.useState<DiceState>("ready")
  const [result, setResult] = React.useState<number | null>(null)
  const [displayValue, setDisplayValue] = React.useState<number>(1)
  const [secondaryValue, setSecondaryValue] = React.useState<number>(1)
  const [particles, setParticles] = React.useState<Array<{ id: number; x: number; y: number }>>([])

  const rollDice = () => {
    setDiceState("rolling")
    setResult(null)
    setParticles([])

    // Play dice roll sound when animation starts
    playSound("dice_roll")

    // Pre-determine the final results
    const roll1 = Math.floor(Math.random() * diceType) + 1
    const roll2 = advantage ? Math.floor(Math.random() * diceType) + 1 : 0
    const finalBase = advantage ? Math.max(roll1, roll2) : roll1
    const finalResult = finalBase + modifier + bonus

    let cycleCount = 0
    const fastCycles = 24 // 24 cycles at 50ms = 1200ms
    const fastInterval = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * diceType) + 1)
      if (advantage) {
        setSecondaryValue(Math.floor(Math.random() * diceType) + 1)
      }
      cycleCount++

      if (cycleCount >= fastCycles) {
        clearInterval(fastInterval)
        setDiceState("slowing")

        const slowValues = [
          Math.floor(Math.random() * diceType) + 1,
          Math.floor(Math.random() * diceType) + 1,
          roll1,
        ]
        const slowValues2 = advantage ? [
          Math.floor(Math.random() * diceType) + 1,
          Math.floor(Math.random() * diceType) + 1,
          roll2,
        ] : []
        let slowIndex = 0

        const slowInterval = setInterval(() => {
          setDisplayValue(slowValues[slowIndex])
          if (advantage && slowValues2[slowIndex]) {
            setSecondaryValue(slowValues2[slowIndex])
          }
          slowIndex++

          if (slowIndex >= slowValues.length) {
            clearInterval(slowInterval)

            setTimeout(() => {
              setResult(finalResult)
              setDiceState("result")

              if (roll1 === diceType || roll1 === 1 || (advantage && (roll2 === diceType || roll2 === 1))) {
                const newParticles = Array.from({ length: 16 }, (_, i) => ({
                  id: Date.now() + i,
                  x: Math.cos((i * Math.PI * 2) / 16) * 80,
                  y: Math.sin((i * Math.PI * 2) / 16) * 80,
                }))
                setParticles(newParticles)
                setTimeout(() => setParticles([]), 1200)
              }
            }, 100)
          }
        }, 200)
      }
    }, 50)
  }

  const handleConfirm = () => {
    if (result !== null) {
      // Play success or failure sound based on the roll result
      if (isCriticalSuccess || (!isCriticalFailure && baseRoll !== null && baseRoll >= (diceType / 2))) {
        playSound("success")
      } else {
        playSound("failure")
      }
      onRoll(result)
    }
  }

  const handleRollAgain = () => {
    rollDice()
  }

  const totalResult = result
  const baseRoll = result !== null ? result - modifier - bonus : null
  const isCriticalSuccess = baseRoll === diceType
  const isCriticalFailure = baseRoll === 1

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md rounded-lg shadow-2xl border-2 border-[hsl(30,40%,20%)] overflow-hidden bg-[hsl(45,50%,92%)]">
        {isCriticalSuccess && diceState === "result" && (
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(45,80%,65%)]/10 via-transparent to-[hsl(45,80%,65%)]/5 animate-pulse pointer-events-none" />
        )}
        {isCriticalFailure && diceState === "result" && (
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(0,70%,50%)]/10 via-transparent to-[hsl(0,70%,50%)]/5 animate-pulse pointer-events-none" />
        )}

        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              transform: `translate(calc(-50% + ${particle.x}px), calc(-50% + ${particle.y}px))`,
              transition: "all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              opacity: 0,
            }}
          >
            {isCriticalSuccess ? (
              <Sparkles className="w-6 h-6 text-[hsl(45,80%,65%)]" />
            ) : (
              <Zap className="w-6 h-6 text-[hsl(0,70%,50%)]" />
            )}
          </div>
        ))}

        <div className="relative p-6 space-y-6">
          {/* Mini-HUD for Mobile */}
          {currentHealth !== undefined && maxHealth !== undefined && (
            <div className="flex justify-between items-center bg-muted/50 p-2 rounded-lg mb-4 text-xs font-mono">
              {/* Left: Health */}
              <div className={cn("flex items-center gap-2", currentHealth < maxHealth * 0.3 && "text-red-600 font-bold")}>
                <Heart className="w-3 h-3" />
                <span>{currentHealth}/{maxHealth} HP</span>
              </div>

              {/* Right: Stat Context */}
              {statName && statValue !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="uppercase">{statName}</span>
                  <span className="font-bold">{statValue} ({modifier >= 0 ? "+" : ""}{modifier})</span>
                </div>
              )}
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-[hsl(30,40%,15%)]">
                {statName ? `${statName} Test` : "Rolling..."}
              </h2>
              {advantage && (
                <p className="text-sm text-[hsl(45,70%,50%)] font-bold">
                  ⚡ Advantage Active!
                </p>
              )}
              {modifier !== 0 && statName && (
                <p className="text-sm text-[hsl(35,40%,45%)] font-medium">
                  {statName} Modifier: {modifier > 0 ? "+" : ""}
                  {modifier}
                </p>
              )}
              {bonus !== 0 && (
                <p className="text-sm text-[hsl(35,40%,45%)] font-medium">
                  Bonus: +{bonus}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-[hsl(50,50%,85%)] transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            {advantage ? (
              <div className="flex gap-4">
                {/* First Die */}
                <div className="relative">
                  <div
                    className={cn(
                      "w-28 h-28 rounded-lg flex items-center justify-center relative border-2",
                      "transition-all duration-200",
                      "bg-[hsl(40,50%,88%)] border-[hsl(30,40%,25%)]",
                      diceState === "rolling" && "scale-105",
                      diceState === "slowing" && "scale-102",
                      diceState === "result" && displayValue >= secondaryValue && "scale-110 border-[hsl(120,50%,45%)] shadow-[0_0_15px_hsl(120,50%,45%,0.3)]",
                      diceState === "result" && displayValue < secondaryValue && "scale-95 opacity-50",
                    )}
                  >
                    <span
                      className={cn(
                        "text-6xl font-black text-[hsl(30,40%,20%)] transition-all duration-200",
                        diceState === "rolling" && "opacity-70",
                        diceState === "slowing" && "opacity-85",
                        diceState === "result" && "animate-in zoom-in duration-300",
                      )}
                    >
                      {displayValue}
                    </span>
                    <div className="absolute top-2 right-2 text-xs font-bold text-[hsl(30,40%,40%)] bg-[hsl(45,50%,85%)] px-2 py-0.5 rounded border border-[hsl(30,40%,50%)]">
                      d{diceType}
                    </div>
                  </div>
                </div>

                {/* Second Die */}
                <div className="relative">
                  <div
                    className={cn(
                      "w-28 h-28 rounded-lg flex items-center justify-center relative border-2",
                      "transition-all duration-200",
                      "bg-[hsl(40,50%,88%)] border-[hsl(30,40%,25%)]",
                      diceState === "rolling" && "scale-105",
                      diceState === "slowing" && "scale-102",
                      diceState === "result" && secondaryValue >= displayValue && "scale-110 border-[hsl(120,50%,45%)] shadow-[0_0_15px_hsl(120,50%,45%,0.3)]",
                      diceState === "result" && secondaryValue < displayValue && "scale-95 opacity-50",
                    )}
                  >
                    <span
                      className={cn(
                        "text-6xl font-black text-[hsl(30,40%,20%)] transition-all duration-200",
                        diceState === "rolling" && "opacity-70",
                        diceState === "slowing" && "opacity-85",
                        diceState === "result" && "animate-in zoom-in duration-300",
                      )}
                    >
                      {secondaryValue}
                    </span>
                    <div className="absolute top-2 right-2 text-xs font-bold text-[hsl(30,40%,40%)] bg-[hsl(45,50%,85%)] px-2 py-0.5 rounded border border-[hsl(30,40%,50%)]">
                      d{diceType}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div
                  className={cn(
                    "w-36 h-36 rounded-lg flex items-center justify-center relative border-2",
                    "transition-all duration-200",
                    "bg-[hsl(40,50%,88%)] border-[hsl(30,40%,25%)]",
                    diceState === "rolling" && "scale-105",
                    diceState === "slowing" && "scale-102",
                    diceState === "result" && "scale-110 shadow-card-hover",
                    isCriticalSuccess &&
                      diceState === "result" &&
                      "border-[hsl(45,80%,65%)] bg-[hsl(45,80%,92%)] shadow-[0_0_20px_hsl(45,80%,65%,0.3)]",
                    isCriticalFailure &&
                      diceState === "result" &&
                      "border-[hsl(0,70%,50%)] bg-[hsl(0,70%,92%)] shadow-[0_0_20px_hsl(0,70%,50%,0.3)]",
                  )}
                >
                  <span
                    className={cn(
                      "text-7xl font-black text-[hsl(30,40%,20%)] transition-all duration-200",
                      diceState === "rolling" && "opacity-70",
                      diceState === "slowing" && "opacity-85",
                      diceState === "result" && "animate-in zoom-in duration-300",
                    )}
                  >
                    {displayValue}
                  </span>

                  <div className="absolute top-2 right-2 text-xs font-bold text-[hsl(30,40%,40%)] bg-[hsl(45,50%,85%)] px-2 py-0.5 rounded border border-[hsl(30,40%,50%)]">
                    d{diceType}
                  </div>
                </div>
              </div>
            )}

            {diceState === "result" && result !== null && (
              <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {(modifier !== 0 || bonus !== 0) && (
                  <div className="space-y-1">
                    <p className="text-base text-[hsl(35,40%,45%)]">
                      {advantage && (
                        <>
                          <span className="font-bold text-[hsl(30,40%,15%)] text-xl">
                            [{displayValue}, {secondaryValue}] → {Math.max(displayValue, secondaryValue)}
                          </span>
                          <span className="mx-2 text-[hsl(35,40%,50%)]">+</span>
                        </>
                      )}
                      {!advantage && (
                        <>
                          <span className="font-bold text-[hsl(30,40%,15%)] text-xl">{baseRoll}</span>
                          <span className="mx-2 text-[hsl(35,40%,50%)]">+</span>
                        </>
                      )}
                      <span className="mx-1 text-[hsl(35,40%,50%)]">
                        {modifier}
                      </span>
                      {bonus > 0 && (
                        <>
                          <span className="mx-1 text-[hsl(35,40%,50%)]">+</span>
                          <span className="mx-1 text-[hsl(35,40%,50%)]">{bonus}</span>
                        </>
                      )}
                      <span className="mx-2 text-[hsl(35,40%,50%)]">=</span>
                      <span className="font-bold text-[hsl(30,40%,15%)] text-2xl">{totalResult}</span>
                    </p>
                  </div>
                )}
                {isCriticalSuccess && (
                  <div className="flex items-center justify-center gap-2 text-[hsl(45,70%,50%)] font-bold text-base">
                    <Sparkles className="w-4 h-4" />
                    <span>Critical Success!</span>
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                {isCriticalFailure && (
                  <div className="flex items-center justify-center gap-2 text-[hsl(0,70%,50%)] font-bold text-base">
                    <Zap className="w-4 h-4" />
                    <span>Critical Failure!</span>
                    <Zap className="w-4 h-4" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-center text-sm text-[hsl(35,40%,45%)] leading-relaxed px-2">
              {reason.replace(/$$DC \d+$$/, "").trim()}
            </p>

            {diceState === "ready" && (
              <Button
                className="w-full h-14 text-lg font-bold bg-[hsl(40,50%,88%)] hover:bg-[hsl(40,50%,85%)] text-[hsl(30,40%,15%)] border-2 border-[hsl(30,40%,20%)] shadow-button-primary hover:shadow-button-hover transition-all active:translate-y-[1px]"
                onClick={rollDice}
              >
                <Dices className="w-5 h-5 mr-2" />
                Roll Dice
              </Button>
            )}

            {(diceState === "rolling" || diceState === "slowing") && (
              <Button
                className="w-full h-14 text-lg font-bold bg-[hsl(40,50%,88%)] text-[hsl(30,40%,15%)] border-2 border-[hsl(30,40%,20%)]"
                disabled
              >
                <span className="flex items-center gap-3">
                  <Dices className="w-5 h-5 animate-subtle-bounce" />
                  <span>{diceState === "rolling" ? "Rolling..." : "Almost there..."}</span>
                </span>
              </Button>
            )}

            {diceState === "result" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Button
                  className="w-full h-14 text-lg font-bold bg-[hsl(45,50%,92%)] hover:bg-[hsl(45,50%,88%)] text-[hsl(30,40%,15%)] border-2 border-[hsl(30,40%,20%)] shadow-button-primary hover:shadow-button-hover transition-all active:translate-y-[1px]"
                  onClick={handleConfirm}
                >
                  <span className="mr-2">✓</span>
                  Confirm Result: {totalResult}
                </Button>
                <Button
                  className="w-full h-12 bg-[hsl(45,50%,92%)] hover:bg-[hsl(45,50%,88%)] text-[hsl(30,40%,15%)] border-2 border-[hsl(30,40%,20%)] shadow-button-primary hover:shadow-button-hover transition-all active:translate-y-[1px]"
                  onClick={handleRollAgain}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Roll Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
