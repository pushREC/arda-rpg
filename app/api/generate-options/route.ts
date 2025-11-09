import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { buildContextForStep } from "@/lib/scenario-builder"

export async function POST(request: NextRequest) {
  try {
    const { type, context } = await request.json()

    console.log("[v0] Generating options:", { type, context })

    const options = await generateContextualOptions(type, context)
    return NextResponse.json({ options })
  } catch (error) {
    console.error("[v0] Options generation error:", error)

    // Fallback to static options
    const { type } = await request.json()
    const staticOptions = getStaticOptionsForType(type)

    return NextResponse.json({
      options: staticOptions,
      usedFallback: true,
    })
  }
}

async function generateContextualOptions(
  type: "locations" | "quest-hooks" | "companions" | "unique-elements",
  context: any,
): Promise<any[]> {
  const promptMap = {
    locations: buildLocationPrompt(context),
    "quest-hooks": buildQuestHookPrompt(context),
    companions: buildCompanionPrompt(context),
    "unique-elements": buildUniqueElementPrompt(context),
  }

  const systemPrompt = `You are a Middle-earth lore expert generating ${type} for a custom adventure.

Context:
${buildContextForStep(type, context, context.character)}

Generate 4-5 distinct, creative options that fit the context and feel authentic to Middle-earth.

Return ONLY valid JSON array:
[
  { "id": "unique-id", "label": "Option Name", "description": "Brief description" }
]`

  try {
    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: promptMap[type],
      temperature: 0.8,
    })

    const parsed = JSON.parse(result.text)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error(`[v0] AI generation failed for ${type}, using static options`)
    return getStaticOptionsForType(type)
  }
}

function buildLocationPrompt(context: any): string {
  return `Generate 4-5 specific locations within ${context.region} that would make compelling adventure settings.

Character: ${context.character?.race} ${context.character?.background}

Each location should:
- Be specific (not just "A village" but "The village of Edoras")
- Have narrative potential
- Fit the region's geography and lore
- Vary in type (city, ruins, wilderness, etc.)`
}

function buildQuestHookPrompt(context: any): string {
  return `Generate 4-5 quest hooks for an adventure in ${context.location}, ${context.region}.

Character: ${context.character?.race} ${context.character?.background}

Each quest hook should:
- Be compelling and specific
- Suit the location and character
- Create immediate intrigue
- Be achievable as a short adventure (30-40 mins)`
}

function buildCompanionPrompt(context: any): string {
  return `Generate 4-5 companion types for a ${context.companionPreference} adventure.

Setting: ${context.location}, ${context.region}
Quest: ${context.questHook}
Tones: ${context.tones?.join(", ")}

Each companion type should:
- Complement the character and quest
- Have a clear role/personality
- Fit the setting and tone
- Be interesting and diverse`
}

function buildUniqueElementPrompt(context: any): string {
  return `Generate 4-5 unique narrative elements for this adventure:

Setting: ${context.location}, ${context.region}
Quest: ${context.questHook}
Tones: ${context.tones?.join(", ")}
Companions: ${context.companionPreference}

Each unique element should:
- Add a twist or special feature
- Enhance the narrative
- Feel magical or memorable
- Tie the story together in an interesting way`
}

function getStaticOptionsForType(type: string): any[] {
  const staticOptions: Record<string, any[]> = {
    locations: [
      { id: "loc-1", label: "The Old Watchtower", description: "A crumbling fortress with secrets" },
      { id: "loc-2", label: "The Market Square", description: "Hub of commerce and rumors" },
      { id: "loc-3", label: "The Ancient Grove", description: "A sacred place of power" },
      { id: "loc-4", label: "The Harbor District", description: "Where ships bring news and danger" },
    ],
    "quest-hooks": [
      { id: "quest-1", label: "A mysterious stranger seeks your aid", description: "They know more than they reveal" },
      {
        id: "quest-2",
        label: "Ancient evil stirs in the depths",
        description: "Something that should have stayed buried",
      },
      {
        id: "quest-3",
        label: "A valuable artifact has been stolen",
        description: "And you're the only one who can retrieve it",
      },
      { id: "quest-4", label: "Rumors speak of a hidden treasure", description: "But the price may be too high" },
    ],
    companions: [
      { id: "comp-1", label: "A grizzled veteran warrior", description: "Scarred but still standing" },
      { id: "comp-2", label: "An enthusiastic young scholar", description: "Knowledge is their weapon" },
      { id: "comp-3", label: "A mysterious hooded figure", description: "Their past is a secret" },
      { id: "comp-4", label: "A reluctant noble", description: "Duty calls them forth" },
    ],
    "unique-elements": [
      { id: "unique-1", label: "A map that changes with the phases of the moon", description: "" },
      { id: "unique-2", label: "Dreams that reveal glimpses of the past", description: "" },
      { id: "unique-3", label: "An ancient song that holds the key", description: "" },
      { id: "unique-4", label: "Shadows that remember what was forgotten", description: "" },
    ],
  }

  return staticOptions[type] || []
}
