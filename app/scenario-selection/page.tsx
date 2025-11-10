"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Flame, Mountain, Skull, Castle, Sparkles, Clock, Wand2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { PRESET_SCENARIO_CONFIGS } from "@/lib/preset-scenarios" // Import preset configs

const SCENARIOS = [
  {
    id: "shadows-of-mirkwood",
    title: "Shadows of Mirkwood",
    description:
      "Dark forces gather in the ancient forest. Strange creatures have been spotted near the woodland villages, and travelers speak of an evil presence growing in the depths of Mirkwood.",
    difficulty: "easy" as const,
    estimatedLength: "20-30 minutes",
    tags: ["Forest", "Mystery", "Combat"],
    icon: Mountain,
    gradient: "from-green-500/20 to-emerald-600/20",
  },
  {
    id: "siege-of-helms-deep",
    title: "The Siege of Helm's Deep",
    description:
      "The fortress stands ready as an army approaches. You must defend the walls against overwhelming odds, making strategic decisions that could save or doom everyone within.",
    difficulty: "medium" as const,
    estimatedLength: "30-45 minutes",
    tags: ["Warfare", "Strategy", "Epic"],
    icon: Castle,
    gradient: "from-blue-500/20 to-indigo-600/20",
  },
  {
    id: "mines-of-moria",
    title: "The Mines of Moria",
    description:
      "Venture deep into the abandoned dwarven kingdom where darkness and ancient evils lurk. Navigate treacherous passages, solve ancient puzzles, and face what dwells in the deep.",
    difficulty: "hard" as const,
    estimatedLength: "45-60 minutes",
    tags: ["Dungeon", "Puzzle", "Horror"],
    icon: Skull,
    gradient: "from-purple-500/20 to-violet-600/20",
  },
  {
    id: "quest-for-the-ring",
    title: "Quest for the Lost Ring",
    description:
      "A mysterious ring has been discovered in the Shire. What starts as a simple delivery quest becomes an epic journey across Middle-earth as dark riders pursue you.",
    difficulty: "medium" as const,
    estimatedLength: "40-50 minutes",
    tags: ["Adventure", "Stealth", "Story-Rich"],
    icon: Sparkles,
    gradient: "from-amber-500/20 to-orange-600/20",
  },
]

const CUSTOM_SCENARIO = {
  id: "custom",
  title: "Custom Adventure",
  description:
    "Create your own unique story. The AI will generate a personalized adventure based on your character, allowing for unlimited possibilities and emergent narratives.",
  difficulty: "medium" as const,
  estimatedLength: "Varies",
  tags: ["Custom", "Open-ended", "AI-Generated"],
  icon: Wand2,
  gradient: "from-violet-500/20 to-fuchsia-600/20",
}

const DIFFICULTY_CONFIG = {
  easy: { label: "Beginner", color: "text-green-500", bgColor: "bg-green-500/10 border-green-500/30" },
  medium: { label: "Intermediate", color: "text-yellow-500", bgColor: "bg-yellow-500/10 border-yellow-500/30" },
  hard: { label: "Challenging", color: "text-red-500", bgColor: "bg-red-500/10 border-red-500/30" },
}

export default function ScenarioSelectionPage() {
  const router = useRouter()
  const [selectedScenario, setSelectedScenario] = React.useState<string | null>(null)
  const [character, setCharacter] = React.useState<any>(null)

  React.useEffect(() => {
    // Load character data
    const savedCharacter = localStorage.getItem("character")
    if (savedCharacter) {
      setCharacter(JSON.parse(savedCharacter))
    } else {
      // Redirect back if no character
      router.push("/character-creation")
    }
  }, [router])

  const handleStartAdventure = () => {
    if (selectedScenario) {
      if (selectedScenario === "custom") {
        router.push("/custom-scenario")
        return
      }

      const scenario = SCENARIOS.find((s) => s.id === selectedScenario)

      if (scenario) {
        const presetConfig = PRESET_SCENARIO_CONFIGS[scenario.id]

        const scenarioWithConfig = {
          ...scenario,
          customConfig: presetConfig,
        }

        localStorage.setItem("scenario", JSON.stringify(scenarioWithConfig))
        router.push("/game")
      }
    }
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(40,30%,94%)]">
        <div className="animate-spin w-8 h-8 border-4 border-[hsl(30,40%,20%)] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[hsl(40,30%,94%)]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/character-creation">
              <Button
                variant="outline"
                size="icon"
                className="border-2 border-[hsl(30,40%,20%)] shadow-card-interactive bg-transparent hover:-translate-y-0.5 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold">
                Choose Your Quest
              </h1>
              <p className="text-[hsl(30,40%,40%)] text-sm md:text-base">
                Playing as {character.name}, the {character.race}
              </p>
            </div>
          </div>
        </div>

        {/* Custom Adventure Card */}
        <Card
          className={cn(
            "p-8 cursor-pointer transition-all hover:scale-[1.01] border-2 bg-gradient-to-br from-[hsl(40,35%,92%)] to-[hsl(35,40%,88%)]",
            selectedScenario === CUSTOM_SCENARIO.id
              ? "border-[hsl(30,50%,40%)] shadow-card-hover ring-2 ring-[hsl(30,50%,40%)]/20"
              : "border-[hsl(30,40%,20%)] shadow-card-hover hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
          )}
          onClick={() => setSelectedScenario(CUSTOM_SCENARIO.id)}
        >
          <div className="flex items-start gap-6">
            {/* Icon */}
            <div
              className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0 shadow-md",
                CUSTOM_SCENARIO.gradient,
              )}
            >
              <CUSTOM_SCENARIO.icon className="w-8 h-8 text-foreground" />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold">{CUSTOM_SCENARIO.title}</h3>
                  <p className="text-sm text-[hsl(30,40%,40%)] text-pretty leading-relaxed mt-2">
                    {CUSTOM_SCENARIO.description}
                  </p>
                </div>
                {selectedScenario === CUSTOM_SCENARIO.id && (
                  <div className="w-7 h-7 rounded-full bg-[hsl(30,50%,50%)] flex items-center justify-center animate-[fade-in-up_0.3s_ease-out] ml-4 shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Meta Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs border-2",
                      DIFFICULTY_CONFIG[CUSTOM_SCENARIO.difficulty].bgColor,
                      DIFFICULTY_CONFIG[CUSTOM_SCENARIO.difficulty].color,
                    )}
                  >
                    <Flame className="w-3 h-3 mr-1" />
                    {DIFFICULTY_CONFIG[CUSTOM_SCENARIO.difficulty].label}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-2 border-[hsl(30,40%,60%)]">
                    <Clock className="w-3 h-3 mr-1" />
                    {CUSTOM_SCENARIO.estimatedLength}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {CUSTOM_SCENARIO.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs bg-[hsl(40,25%,85%)] border border-[hsl(30,40%,60%)]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Preset Scenarios Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {SCENARIOS.map((scenario) => {
            const Icon = scenario.icon
            const isSelected = selectedScenario === scenario.id
            const difficultyConfig = DIFFICULTY_CONFIG[scenario.difficulty]

            return (
              <Card
                key={scenario.id}
                className={cn(
                  "p-6 cursor-pointer transition-all hover:scale-[1.01] border-2 bg-[hsl(40,35%,92%)]",
                  isSelected
                    ? "border-[hsl(30,50%,40%)] shadow-card-hover"
                    : "border-[hsl(30,40%,20%)] shadow-card hover:shadow-card-hover",
                )}
                onClick={() => setSelectedScenario(scenario.id)}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br",
                        scenario.gradient,
                      )}
                    >
                      <Icon className="w-6 h-6 text-foreground" />
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[hsl(30,50%,50%)] flex items-center justify-center animate-[fade-in-up_0.3s_ease-out]">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold">{scenario.title}</h3>
                    <p className="text-sm text-[hsl(30,40%,40%)] text-pretty leading-relaxed">{scenario.description}</p>
                  </div>

                  {/* Meta Info */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn("text-xs border-2", difficultyConfig.bgColor, difficultyConfig.color)}
                      >
                        <Flame className="w-3 h-3 mr-1" />
                        {difficultyConfig.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-2 border-[hsl(30,40%,60%)]">
                        <Clock className="w-3 h-3 mr-1" />
                        {scenario.estimatedLength}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {scenario.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-[hsl(40,25%,85%)] border border-[hsl(30,40%,60%)]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Action Buttons */}
        <Card className="p-6 bg-[hsl(35,60%,88%)] border-2 border-[hsl(30,40%,20%)] shadow-card">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[hsl(30,50%,40%)] shrink-0" />
              <p className="text-sm text-pretty">
                {selectedScenario ? "Ready to embark on this adventure?" : "Select a scenario to begin your journey"}
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleStartAdventure}
              disabled={!selectedScenario}
              className="font-[family-name:var(--font-heading)] w-full sm:w-auto border-2 border-[hsl(30,40%,20%)] shadow-card-interactive hover:-translate-y-0.5 transition-all"
            >
              Start Adventure
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
