"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Zap, Sparkles, PenTool, Clock } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const PATHS = [
  {
    id: "quick",
    title: "Quick Start",
    description: "Surprise me - start playing now",
    icon: Zap,
    time: "10 seconds",
    gradient: "from-amber-500/20 to-orange-600/20",
    route: "/custom-scenario/quick",
  },
  {
    id: "vibe",
    title: "Vibe-First",
    description: "Choose a feeling, let AI build it",
    icon: Sparkles,
    time: "30-60 seconds",
    gradient: "from-purple-500/20 to-violet-600/20",
    route: "/custom-scenario/vibe",
  },
  {
    id: "custom",
    title: "Full Customization",
    description: "Craft every detail yourself",
    icon: PenTool,
    time: "2-3 minutes",
    gradient: "from-blue-500/20 to-indigo-600/20",
    route: "/custom-scenario/custom",
  },
]

export default function CustomScenarioEntryPage() {
  const router = useRouter()
  const [character, setCharacter] = React.useState<any>(null)

  React.useEffect(() => {
    const savedCharacter = localStorage.getItem("character")
    if (savedCharacter) {
      setCharacter(JSON.parse(savedCharacter))
    } else {
      router.push("/character-creation")
    }
  }, [router])

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(40,30%,94%)]">
        <div className="animate-spin w-8 h-8 border-4 border-[hsl(30,50%,50%)] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[hsl(40,30%,94%)]">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/scenario-selection">
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
              How Would You Like to Begin?
            </h1>
            <p className="text-[hsl(30,40%,40%)] text-sm md:text-base">Choose your path to adventure</p>
          </div>
        </div>

        {/* Path Cards */}
        <div className="grid gap-6">
          {PATHS.map((path) => {
            const Icon = path.icon

            return (
              <Card
                key={path.id}
                className={cn(
                  "p-8 cursor-pointer transition-all hover:scale-[1.02] border-2",
                  "border-[hsl(30,40%,20%)] shadow-card hover:shadow-card-hover bg-[hsl(40,35%,92%)]",
                )}
                onClick={() => router.push(path.route)}
              >
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-16 h-16 rounded-lg flex items-center justify-center bg-gradient-to-br shrink-0",
                      path.gradient,
                    )}
                  >
                    <Icon className="w-8 h-8 text-foreground" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold">{path.title}</h3>
                    <p className="text-[hsl(30,40%,40%)] text-pretty leading-relaxed">{path.description}</p>
                    <div className="flex items-center gap-2 text-sm text-[hsl(30,40%,50%)]">
                      <Clock className="w-4 h-4" />
                      <span>{path.time}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Back to presets */}
        <div className="text-center">
          <Link href="/scenario-selection">
            <Button variant="outline" className="border-2 border-[hsl(30,40%,20%)] bg-transparent">
              Back to Preset Scenarios
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
