"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Scenario, CustomScenarioConfig, ScenarioTone } from "@/lib/types"
import { TONE_OPTIONS } from "@/lib/scenario-config"

interface ScenarioAdjustmentPanelProps {
  scenario: Scenario
  onAdjust: (changes: Partial<CustomScenarioConfig>, reason: string) => void
  currentTurn: number
  isInCombat?: boolean
}

export function ScenarioAdjustmentPanel({ scenario, onAdjust, currentTurn, isInCombat }: ScenarioAdjustmentPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [changes, setChanges] = React.useState<Partial<CustomScenarioConfig>>({})
  const [reason, setReason] = React.useState("")

  // Only show if custom scenario AND not in combat
  if (!scenario.customConfig || isInCombat) return null

  const toggleTone = (toneId: ScenarioTone) => {
    const currentTones = changes.tones || scenario.customConfig!.tones
    const newTones = currentTones.includes(toneId)
      ? currentTones.filter((t) => t !== toneId)
      : [...currentTones, toneId]

    setChanges({ ...changes, tones: newTones })
  }

  const handleSubmit = () => {
    if (!reason.trim()) {
      return
    }

    onAdjust(changes, reason)
    setIsOpen(false)
    setChanges({})
    setReason("")
  }

  const currentTones = changes.tones || scenario.customConfig!.tones
  const currentCombat = changes.combatFrequency ?? scenario.customConfig!.combatFrequency

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-40 border-2 border-[hsl(30,40%,20%)] shadow-card-interactive bg-[hsl(40,35%,92%)] hover:-translate-y-0.5 transition-all"
      >
        <Settings2 className="w-4 h-4 mr-2" />
        Adjust Tale
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[hsl(40,35%,92%)] border-2 border-[hsl(30,40%,20%)] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)] text-2xl">
              Adjust Your Tale's Direction
            </DialogTitle>
            <DialogDescription className="text-[hsl(30,40%,40%)]">
              Changes will take effect gradually over the next 3-5 turns
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Tone adjustments */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tones</Label>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map((tone) => {
                  const Icon = tone.icon
                  const isSelected = currentTones.includes(tone.id)

                  return (
                    <Button
                      key={tone.id}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTone(tone.id as ScenarioTone)}
                      className={cn(
                        "border-2 transition-all",
                        isSelected
                          ? "border-[hsl(30,50%,40%)] bg-[hsl(30,50%,40%)] text-white hover:bg-[hsl(30,50%,35%)]"
                          : "border-[hsl(30,40%,60%)] hover:border-[hsl(30,40%,50%)]",
                      )}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {tone.label}
                    </Button>
                  )
                })}
              </div>
              <p className="text-xs text-[hsl(30,40%,40%)]">Select 1-2 tones that define the story's feeling</p>
            </div>

            {/* Combat frequency */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Combat Intensity</Label>
              <div className="space-y-2">
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={currentCombat}
                  onChange={(e) => setChanges({ ...changes, combatFrequency: Number(e.target.value) })}
                  className="w-full h-2 bg-[hsl(30,40%,60%)] rounded-lg appearance-none cursor-pointer accent-[hsl(30,50%,40%)]"
                />
                <div className="flex justify-between text-xs text-[hsl(30,40%,40%)]">
                  <span>Rare</span>
                  <span>Occasional</span>
                  <span>Frequent</span>
                  <span>Common</span>
                  <span>Constant</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Badge
                      key={level}
                      variant={currentCombat === level ? "default" : "outline"}
                      className={cn(
                        "flex-1 justify-center transition-all",
                        currentCombat === level
                          ? "bg-[hsl(30,50%,40%)] border-[hsl(30,50%,40%)] text-white"
                          : "border-[hsl(30,40%,60%)]",
                      )}
                    >
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Reason for change */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Why this change?</Label>
              <Textarea
                placeholder="e.g., 'I want more action' or 'Slow down the pacing' or 'More mystery, less combat'"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-24 bg-white border-2 border-[hsl(30,40%,60%)] resize-none"
              />
              <p className="text-xs text-[hsl(30,40%,40%)]">
                This helps the AI understand your intent and adjust the narrative smoothly
              </p>
            </div>

            {/* Current scenario info */}
            <div className="p-4 bg-[hsl(35,60%,88%)] border-2 border-[hsl(30,40%,60%)] rounded-lg space-y-2">
              <p className="text-xs font-semibold text-[hsl(30,40%,30%)]">Current Adventure</p>
              <p className="text-sm">{scenario.title}</p>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <Badge variant="outline" className="text-xs border-[hsl(30,40%,60%)]">
                  Turn {currentTurn}
                </Badge>
                {scenario.customConfig!.tones.map((tone) => (
                  <Badge
                    key={tone}
                    variant="secondary"
                    className="text-xs bg-[hsl(40,25%,85%)] border border-[hsl(30,40%,60%)]"
                  >
                    {TONE_OPTIONS.find((t) => t.id === tone)?.label || tone}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="border-2 border-[hsl(30,40%,60%)]">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!reason.trim()}
              className="border-2 border-[hsl(30,40%,20%)] bg-[hsl(30,50%,40%)] hover:bg-[hsl(30,50%,35%)] text-white shadow-card-interactive hover:-translate-y-0.5 transition-all"
            >
              Apply Adjustments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
