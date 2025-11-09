"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { VibeCard } from "@/components/vibe-card"
import { ScenarioOptionCard } from "@/components/scenario-option-card"
import { ArrowLeft, ArrowRight, Loader2, RefreshCw, Sparkles } from "lucide-react"
import Link from "next/link"
import { VIBE_OPTIONS } from "@/lib/scenario-config"
import { useToast } from "@/hooks/use-toast"

type ViewState = "selection" | "generating" | "options"

export default function VibeFirstPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [character, setCharacter] = React.useState<any>(null)
  const [viewState, setViewState] = React.useState<ViewState>("selection")
  const [selectedVibes, setSelectedVibes] = React.useState<string[]>([])
  const [scenarios, setScenarios] = React.useState<any[]>([])
  const [selectedScenario, setSelectedScenario] = React.useState<any>(null)

  React.useEffect(() => {
    const savedCharacter = localStorage.getItem("character")
    if (savedCharacter) {
      setCharacter(JSON.parse(savedCharacter))
    } else {
      router.push("/character-creation")
    }
  }, [router])

  const handleToggleVibe = (id: string) => {
    setSelectedVibes((prev) => {
      if (prev.includes(id)) {
        return prev.filter((v) => v !== id)
      }
      if (prev.length >= 2) {
        toast({
          title: "Maximum reached",
          description: "You can select up to 2 vibes",
        })
        return prev
      }
      return [...prev, id]
    })
  }

  const handleContinue = async () => {
    if (selectedVibes.length === 0) {
      toast({
        title: "Select at least one vibe",
        description: "Or click 'Skip' for a random scenario",
      })
      return
    }

    setViewState("generating")

    try {
      const response = await fetch("/api/generate-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "vibe-first",
          character,
          vibes: selectedVibes,
        }),
      })

      if (!response.ok) throw new Error("Generation failed")

      const { scenarios: generatedScenarios } = await response.json()
      setScenarios(generatedScenarios)
      setViewState("options")
    } catch (error) {
      console.error("[v0] Scenario generation failed:", error)
      toast({
        title: "Generation failed",
        description: "Using fallback scenarios",
        variant: "destructive",
      })
      // You could still set fallback scenarios here
    }
  }

  const handleSkip = async () => {
    // Random vibe selection
    const randomVibes = [VIBE_OPTIONS[Math.floor(Math.random() * VIBE_OPTIONS.length)].id]
    setSelectedVibes(randomVibes)

    // Slight delay for UX
    setTimeout(() => {
      handleContinue()
    }, 300)
  }

  const handleSelectScenario = (scenario: any) => {
    localStorage.setItem("scenario", JSON.stringify(scenario))
    router.push("/game")
  }

  const handleCustomizeScenario = (scenario: any) => {
    // Store selected scenario for refinement
    sessionStorage.setItem("scenarioToRefine", JSON.stringify(scenario))
    router.push("/custom-scenario/vibe/refine")
  }

  const handleGenerateNew = () => {
    setViewState("generating")
    setTimeout(() => handleContinue(), 100)
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(40,30%,94%)]">
        <div className="animate-spin w-8 h-8 border-4 border-[hsl(30,50%,50%)] border-t-transparent rounded-full" />
      </div>
    )
  }

  // Selection View
  if (viewState === "selection") {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-[hsl(40,30%,94%)]">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/custom-scenario">
              <Button
                variant="outline"
                size="icon"
                className="border-2 border-[hsl(30,40%,20%)] shadow-card-interactive bg-transparent hover:-translate-y-0.5 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-balance">
                What Calls to You Today?
              </h1>
              <p className="text-[hsl(30,40%,40%)] text-sm md:text-base">Select 1-2 vibes that speak to your spirit</p>
            </div>
          </div>

          {/* Vibes Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {VIBE_OPTIONS.map((vibe) => (
              <VibeCard
                key={vibe.id}
                id={vibe.id}
                label={vibe.label}
                description={vibe.description}
                icon={vibe.icon}
                selected={selectedVibes.includes(vibe.id)}
                onToggle={handleToggleVibe}
              />
            ))}
          </div>

          {/* Actions */}
          <Card className="p-6 bg-[hsl(35,60%,88%)] border-2 border-[hsl(30,40%,20%)] shadow-card">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[hsl(30,50%,40%)] shrink-0" />
                <p className="text-sm text-pretty">
                  {selectedVibes.length > 0
                    ? `${selectedVibes.length} vibe${selectedVibes.length > 1 ? "s" : ""} selected`
                    : "Select your vibes to continue"}
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1 sm:flex-none border-2 border-[hsl(30,40%,20%)] bg-transparent"
                >
                  Skip - Surprise Me
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={selectedVibes.length === 0}
                  className="flex-1 sm:flex-none font-[family-name:var(--font-heading)] border-2 border-[hsl(30,40%,20%)] shadow-card-interactive hover:-translate-y-0.5 transition-all"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Generating View
  if (viewState === "generating") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(40,30%,94%)] p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-[hsl(35,60%,88%)] border-2 border-[hsl(30,40%,20%)] rounded-lg shadow-card flex items-center justify-center animate-pulse">
              <Loader2 className="w-12 h-12 text-[hsl(30,50%,40%)] animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Weaving Your Tales...</h2>
            <p className="text-[hsl(30,40%,40%)] text-sm">Creating 3 unique adventures for you</p>
          </div>
        </div>
      </div>
    )
  }

  // Options View
  return (
    <div className="min-h-screen p-4 md:p-8 bg-[hsl(40,30%,94%)]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewState("selection")}
            className="border-2 border-[hsl(30,40%,20%)] shadow-card-interactive bg-transparent hover:-translate-y-0.5 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-balance">
              Three Tales Await You
            </h1>
            <p className="text-[hsl(30,40%,40%)] text-sm md:text-base">Choose your adventure or customize further</p>
          </div>
        </div>

        {/* Scenarios */}
        <div className="grid gap-6">
          {scenarios.map((scenario, index) => (
            <ScenarioOptionCard
              key={scenario.id || index}
              title={scenario.title}
              description={scenario.description}
              location={`${scenario.customConfig?.region} - ${scenario.customConfig?.location}`}
              tags={[...(scenario.customConfig?.tones || []), scenario.customConfig?.companionPreference || "unknown"]}
              onSelect={() => handleSelectScenario(scenario)}
              onCustomize={() => handleCustomizeScenario(scenario)}
              onViewDetails={() => setSelectedScenario(scenario)}
            />
          ))}
        </div>

        {/* Generate New */}
        <Card className="p-6 bg-[hsl(35,60%,88%)] border-2 border-[hsl(30,40%,20%)] shadow-card">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-pretty">Not quite right? Generate more options</p>
            <Button
              onClick={handleGenerateNew}
              variant="outline"
              className="border-2 border-[hsl(30,40%,20%)] bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New Options
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
