"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function QuickStartPage() {
  const router = useRouter()
  const [status, setStatus] = React.useState("Generating your adventure...")

  React.useEffect(() => {
    async function generateQuickScenario() {
      try {
        const characterData = localStorage.getItem("character")
        if (!characterData) {
          router.push("/character-creation")
          return
        }

        const character = JSON.parse(characterData)

        setStatus("Creating a tale just for you...")

        const response = await fetch("/api/generate-scenario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: "quick",
            character,
          }),
        })

        if (!response.ok) throw new Error("Generation failed")

        const { scenarios } = await response.json()
        const scenario = scenarios[0]

        // Save scenario to localStorage
        localStorage.setItem("scenario", JSON.stringify(scenario))

        setStatus("Adventure ready! Starting...")

        // Navigate to game
        setTimeout(() => {
          router.push("/game")
        }, 500)
      } catch (error) {
        console.error("[v0] Quick start generation failed:", error)
        // Fallback: redirect to vibe selection
        router.push("/custom-scenario/vibe")
      }
    }

    generateQuickScenario()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(40,30%,94%)] p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Animated parchment */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto bg-[hsl(35,60%,88%)] border-2 border-[hsl(30,40%,20%)] rounded-lg shadow-card flex items-center justify-center animate-pulse">
            <Loader2 className="w-12 h-12 text-[hsl(30,50%,40%)] animate-spin" />
          </div>
        </div>

        {/* Status text */}
        <div className="space-y-2">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">{status}</h2>
          <p className="text-[hsl(30,40%,40%)] text-sm">The quill is writing your story...</p>
        </div>
      </div>
    </div>
  )
}
