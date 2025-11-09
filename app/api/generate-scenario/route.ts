import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import type { Character, CustomScenarioConfig } from "@/lib/types"
import { generateScenarioId, buildCharacterContext, fillWithSmartDefaults } from "@/lib/scenario-builder"
import { getFallbackScenarios } from "@/lib/scenario-templates"
import { VIBE_OPTIONS } from "@/lib/scenario-config"

export async function POST(request: NextRequest) {
  try {
    const { method, character, vibes, partialConfig } = await request.json()

    console.log("[v0] Generating scenario:", { method, vibes })

    // Build character context
    const characterContext = buildCharacterContext(character as Character)

    // Generate scenarios based on method
    if (method === "quick") {
      const scenario = await generateQuickScenario(character, characterContext)
      return NextResponse.json({ scenarios: [scenario] })
    }

    if (method === "vibe-first") {
      const scenarios = await generateVibeScenarios(character, characterContext, vibes)
      return NextResponse.json({ scenarios })
    }

    return NextResponse.json({ error: "Invalid method" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Scenario generation error:", error)

    // Fallback to templates
    const { vibes = ["noble-quest"] } = await request.json()
    const fallbackScenarios = getFallbackScenarios(vibes)

    return NextResponse.json({
      scenarios: fallbackScenarios,
      usedFallback: true,
    })
  }
}

async function generateQuickScenario(character: Character, characterContext: string): Promise<any> {
  try {
    const systemPrompt = `You are a Middle-earth storytelling AI. Generate a custom scenario for this character.

Character: ${characterContext}

Create a scenario with:
- Appropriate title
- Engaging description (2-3 sentences)
- Setting (region and specific location)
- Quest hook
- 2 thematic tones
- Combat frequency (1-5)
- Companion preference

Return ONLY valid JSON matching this structure:
{
  "title": "string",
  "description": "string",
  "region": "string",
  "location": "string",
  "questHook": "string",
  "tones": ["string", "string"],
  "combatFrequency": number,
  "companionPreference": "solo|single-ally|small-party|large-fellowship"
}`

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: "Generate an appropriate scenario for this character.",
      temperature: 0.8,
    })

    const parsed = JSON.parse(result.text)

    // Build full config
    const config: CustomScenarioConfig = {
      id: generateScenarioId(),
      generatedAt: Date.now(),
      creationMethod: "quick",
      region: parsed.region,
      location: parsed.location,
      questHook: parsed.questHook,
      tones: parsed.tones,
      combatFrequency: parsed.combatFrequency,
      companionPreference: parsed.companionPreference,
      aiContext: {
        characterContext,
        generatedNarrative: parsed.description,
      },
    }

    return {
      id: config.id,
      title: parsed.title,
      description: parsed.description,
      difficulty: "medium",
      estimatedTime: "30-40 minutes",
      unlocked: true,
      customConfig: config,
    }
  } catch (error) {
    console.error("[v0] AI generation failed, using smart defaults")
    const config = fillWithSmartDefaults({ creationMethod: "quick" }, character)
    return {
      id: config.id,
      title: "An Unexpected Journey",
      description: "A mysterious quest calls you forth into Middle-earth.",
      difficulty: "medium",
      estimatedTime: "30-40 minutes",
      unlocked: true,
      customConfig: config,
    }
  }
}

async function generateVibeScenarios(character: Character, characterContext: string, vibes: string[]): Promise<any[]> {
  try {
    const vibeDetails = vibes.map((v) => VIBE_OPTIONS.find((opt) => opt.id === v)).filter(Boolean)

    const systemPrompt = `You are a Middle-earth storytelling AI. Generate 3 distinct scenario options based on these vibes.

Character: ${characterContext}
Selected Vibes: ${vibeDetails.map((v) => `${v?.label} - ${v?.description}`).join(", ")}

Create 3 varied scenarios, each with unique settings and approaches to the vibe.

Return ONLY valid JSON array with 3 scenarios:
[
  {
    "title": "string",
    "description": "string (2-3 sentences)",
    "region": "string",
    "location": "string",
    "questHook": "string",
    "tones": ["string", "string"],
    "combatFrequency": number (1-5),
    "companionPreference": "solo|single-ally|small-party|large-fellowship",
    "uniqueElement": "string"
  }
]`

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: "Generate 3 distinct scenario options.",
      temperature: 0.9,
    })

    const parsed = JSON.parse(result.text)

    return parsed.map((p: any) => {
      const config: CustomScenarioConfig = {
        id: generateScenarioId(),
        generatedAt: Date.now(),
        creationMethod: "vibe-first",
        vibes,
        region: p.region,
        location: p.location,
        questHook: p.questHook,
        tones: p.tones,
        combatFrequency: p.combatFrequency,
        companionPreference: p.companionPreference,
        uniqueElement: p.uniqueElement,
        aiContext: {
          characterContext,
          generatedNarrative: p.description,
        },
      }

      return {
        id: config.id,
        title: p.title,
        description: p.description,
        difficulty: "medium",
        estimatedTime: "30-40 minutes",
        unlocked: true,
        customConfig: config,
      }
    })
  } catch (error) {
    console.error("[v0] Vibe scenario generation failed, using templates")
    return getFallbackScenarios(vibes)
      .slice(0, 3)
      .map((config) => ({
        id: config.id,
        title: "Generated Adventure",
        description: config.questHook || "An adventure awaits",
        difficulty: "medium",
        estimatedTime: "30-40 minutes",
        unlocked: true,
        customConfig: config,
      }))
  }
}
