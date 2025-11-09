"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { TONE_OPTIONS, COMPANION_PREFERENCES } from "@/lib/scenario-config"
import { cn } from "@/lib/utils"

export default function RefinePage() {
  const router = useRouter()
  const [scenario, setScenario] = React.useState<any>(null)
  const [tones, setTones] = React.useState<string[]>([])
  const [combatFrequency, setCombatFrequency] = React.useState(3)
  const [companionPreference, setCompanionPreference] = React.useState("")
  const [personalTouch, setPersonalTouch] = React.useState("")

  React.useEffect(() => {
    const stored = sessionStorage.getItem("scenarioToRefine")
    if (stored) {
      const parsed = JSON.parse(stored)
      setScenario(parsed)
      setTones(parsed.customConfig?.tones || [])
      setCombatFrequency(parsed.customConfig?.combatFrequency || 3)
      setCompanionPreference(parsed.customConfig?.companionPreference || "single-ally")
    } else {
      router.push("/custom-scenario/vibe")
    }
  }, [router])

  const handleToggleTone = (toneId: string) => {
    setTones((prev) => {
      if (prev.includes(toneId)) {
        return prev.filter((t) => t !== toneId)
      }
      if (prev.length >= 2) return prev
      return [...prev, toneId]
    })
  }

  const handleConfirm = () => {
    // Update scenario with refined values
    const updated = {
      ...scenario,
      customConfig: {
        ...scenario.customConfig,
        tones,
        combatFrequency,
        companionPreference,
        aiContext: {
          ...scenario.customConfig.aiContext,
          userPrompt: personalTouch,
        },
      },
    }

    localStorage.setItem("scenario", JSON.stringify(updated))
    router.push("/game")
  }

  const handleReset = () => {
    if (scenario) {
      setTones(scenario.customConfig?.tones || [])
      setCombatFrequency(scenario.customConfig?.combatFrequency || 3)
      setCompanionPreference(scenario.customConfig?.companionPreference || "single-ally")
      setPersonalTouch("")
    }
  }

  if (!scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(40,30%,94%)]">
        <div className="animate-spin w-8 h-8 border-4 border-[hsl(30,50%,50%)] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[hsl(40,30%,94%)]">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="border-2 border-[hsl(30,40%,20%)] shadow-card-interactive bg-transparent hover:-translate-y-0.5 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-balance">
              Refine: {scenario.title}
            </h1>
            <p className="text-[hsl(30,40%,40%)] text-sm md:text-base">Adjust the details to your liking</p>
          </div>
        </div>

        {/* Refinement Form */}
        <Card className="p-6 bg-[hsl(40,35%,92%)] border-2 border-[hsl(30,40%,20%)] shadow-card space-y-6">
          {/* Tones */}
          <div className="space-y-3">
            <Label className="text-base font-[family-name:var(--font-heading)]">Mood & Tone</Label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((tone) => (
                <Button
                  key={tone.id}
                  variant={tones.includes(tone.id) ? "default" : "outline"}
                  onClick={() => handleToggleTone(tone.id)}
                  className={cn(
                    "border-2 border-[hsl(30,40%,20%)]",
                    tones.includes(tone.id) && "shadow-card-interactive",
                  )}
                >
                  {tone.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-[hsl(30,40%,40%)]">Select up to 2 tones</p>
          </div>

          {/* Combat Intensity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-[family-name:var(--font-heading)]">Combat Intensity</Label>
              <span className="text-sm text-[hsl(30,40%,40%)]">{combatFrequency}/5</span>
            </div>
            <Slider
              value={[combatFrequency]}
              onValueChange={([value]) => setCombatFrequency(value)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-[hsl(30,40%,40%)]">
              <span>Rare</span>
              <span>Frequent</span>
            </div>
          </div>

          {/* Companions */}
          <div className="space-y-3">
            <Label className="text-base font-[family-name:var(--font-heading)]">Companions</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COMPANION_PREFERENCES.map((pref) => (
                <Card
                  key={pref.id}
                  className={cn(
                    "p-4 cursor-pointer border-2 transition-all",
                    companionPreference === pref.id
                      ? "border-[hsl(30,50%,40%)] bg-[hsl(35,60%,88%)] shadow-card-hover"
                      : "border-[hsl(30,40%,20%)] bg-[hsl(40,35%,92%)] hover:shadow-card",
                  )}
                  onClick={() => setCompanionPreference(pref.id)}
                >
                  <div className="space-y-1">
                    <h4 className="font-[family-name:var(--font-heading)] font-bold text-sm">{pref.label}</h4>
                    <p className="text-xs text-[hsl(30,40%,40%)]">{pref.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Personal Touch */}
          <div className="space-y-3">
            <Label className="text-base font-[family-name:var(--font-heading)]">Add Personal Touch (optional)</Label>
            <Textarea
              value={personalTouch}
              onChange={(e) => setPersonalTouch(e.target.value)}
              placeholder="e.g., 'My mentor disappeared here years ago' or 'I seek revenge for my family'"
              className="border-2 border-[hsl(30,40%,20%)] min-h-[100px]"
            />
          </div>
        </Card>

        {/* Actions */}
        <Card className="p-6 bg-[hsl(35,60%,88%)] border-2 border-[hsl(30,40%,20%)] shadow-card">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full sm:w-auto border-2 border-[hsl(30,40%,20%)] bg-transparent"
            >
              Reset to Default
            </Button>
            <Button
              onClick={handleConfirm}
              className="w-full sm:w-auto font-[family-name:var(--font-heading)] border-2 border-[hsl(30,40%,20%)] shadow-card-interactive hover:-translate-y-0.5 transition-all"
            >
              Confirm & Begin
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
