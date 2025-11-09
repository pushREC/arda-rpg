import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import type { Character, Scenario, CustomScenarioConfig, StoryEntry } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { character, scenario, storyHistory, playerChoice, customConfig } = await request.json()

    console.log("[v0] Processing turn for custom scenario")

    const systemPrompt = buildGameMasterPrompt(character, scenario, customConfig)

    // Build story context
    const recentHistory = storyHistory
      .slice(-5)
      .map((entry: StoryEntry) => `${entry.type}: ${entry.text}`)
      .join("\n\n")

    const userPrompt = `Continue the story based on the player's choice.

RECENT STORY:
${recentHistory}

PLAYER'S CHOICE: ${playerChoice}

Generate:
1. A narrative response (2-3 paragraphs) that:
   - Resolves the player's choice
   - Advances the story
   - Respects the ${customConfig?.tones.join(" and ") || "epic"} tone
   - Follows combat frequency directive (${customConfig?.combatFrequency}/5)
2. 3-4 new meaningful choices
3. Any state changes (health, inventory, etc.)

Format as JSON:
{
  "narrative": "story text",
  "choices": [
    {
      "id": "choice-1",
      "text": "choice text",
      "actionType": "combat|social|investigation|craft|narrative|stealth|survival",
      "requiresRoll": boolean,
      "stat": "valor|wisdom|fellowship|craft|endurance|lore",
      "dc": number,
      "riskLevel": "safe|moderate|dangerous"
    }
  ],
  "stateChanges": {
    "health": number (optional, only if health changes),
    "inventory": [{"id": "...", "name": "...", "description": "...", "type": "...", "quantity": 1, "value": 0}] (optional)
  }
}`

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.8,
    })

    const parsed = JSON.parse(result.text)
    return NextResponse.json(parsed)
  } catch (error) {
    console.error("[v0] Turn processing error:", error)

    return NextResponse.json({
      narrative: "The tale continues as you press forward, each step bringing new challenges and discoveries.",
      choices: [
        {
          id: "fallback-1",
          text: "Continue onward",
          actionType: "narrative",
          requiresRoll: false,
          riskLevel: "safe",
        },
      ],
    })
  }
}

function buildGameMasterPrompt(character: Character, scenario: Scenario, customConfig?: CustomScenarioConfig): string {
  return `You are the Game Master for a Middle-earth text RPG.

CHARACTER:
- Name: ${character.name}
- Race: ${character.race}
- Background: ${character.background}
- Stats: Valor ${character.stats.valor}, Wisdom ${character.stats.wisdom}, Fellowship ${character.stats.fellowship}, Craft ${character.stats.craft}, Endurance ${character.stats.endurance}, Lore ${character.stats.lore}
- Current Health: ${character.health}/${character.maxHealth}

${
  customConfig
    ? `
CUSTOM SCENARIO DIRECTIVES (MUST BE FOLLOWED):
- Tones: ${customConfig.tones.join(", ")} - Maintain these emotional tones
- Combat Frequency: ${customConfig.combatFrequency}/5 - ${getCombatGuidance(customConfig.combatFrequency)}
- Setting: ${customConfig.location}, ${customConfig.region}
${customConfig.uniqueElement ? `- Unique Element: ${customConfig.uniqueElement}` : ""}

${
  customConfig.modifications && customConfig.modifications.length > 0
    ? `
RECENT ADJUSTMENTS:
${customConfig.modifications
  .slice(-3)
  .map((m) => `Turn ${m.turnNumber}: ${m.reason} - ${JSON.stringify(m.changedFields)}`)
  .join("\n")}
`
    : ""
}
`
    : ""
}

Generate engaging, choice-driven narrative that respects all directives.`
}

function getCombatGuidance(frequency: number): string {
  if (frequency === 1) return "Minimal combat"
  if (frequency === 2) return "Rare combat"
  if (frequency === 3) return "Moderate combat"
  if (frequency === 4) return "Frequent combat"
  return "Constant combat"
}
