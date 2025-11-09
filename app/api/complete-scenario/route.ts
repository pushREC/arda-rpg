import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import type { CustomScenarioConfig } from "@/lib/types"
import { fillWithSmartDefaults } from "@/lib/scenario-builder"

export async function POST(request: NextRequest) {
  try {
    const { partialConfig, character } = await request.json()

    console.log("[v0] Completing scenario with AI:", partialConfig)

    // Identify what's missing
    const missingFields = identifyMissingFields(partialConfig)

    if (missingFields.length === 0) {
      // Nothing to fill, return as-is with proper structure
      const completed = fillWithSmartDefaults(partialConfig, character)
      return NextResponse.json({ config: completed })
    }

    // Use AI to complete missing fields
    const systemPrompt = `You are a Middle-earth storytelling AI completing a custom scenario.

Character: ${character.race} ${character.background}

Existing selections:
${JSON.stringify(partialConfig, null, 2)}

Missing fields that need to be filled: ${missingFields.join(", ")}

Complete the scenario by filling in the missing fields with contextually appropriate values.

Return ONLY valid JSON with the completed fields:
{
  "region": "string",
  "location": "string",
  "questHook": "string",
  "urgency": "immediate|building|slow-burn",
  "stakes": "personal|community|kingdom|world",
  "tones": ["tone1", "tone2"],
  "combatFrequency": number (1-5),
  "companionPreference": "solo|single-ally|small-party|large-fellowship",
  "uniqueElement": "string"
}`

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: "Complete this scenario with sensible, engaging values for the missing fields.",
      temperature: 0.7,
    })

    const aiCompleted = JSON.parse(result.text)

    // Merge AI results with partial config
    const mergedConfig = {
      ...partialConfig,
      ...aiCompleted,
    }

    // Ensure all required fields are present
    const finalConfig = fillWithSmartDefaults(mergedConfig, character)

    return NextResponse.json({ config: finalConfig })
  } catch (error) {
    console.error("[v0] Scenario completion error:", error)

    // Fallback to smart defaults
    const { partialConfig, character } = await request.json()
    const completed = fillWithSmartDefaults(partialConfig, character)

    return NextResponse.json({
      config: completed,
      usedFallback: true,
    })
  }
}

function identifyMissingFields(config: Partial<CustomScenarioConfig>): string[] {
  const required = ["region", "location", "questHook", "tones", "combatFrequency", "companionPreference"]

  const missing: string[] = []

  for (const field of required) {
    if (!config[field as keyof CustomScenarioConfig]) {
      missing.push(field)
    }
  }

  // Check if tones array is empty
  if (config.tones && config.tones.length === 0) {
    missing.push("tones")
  }

  return missing
}
