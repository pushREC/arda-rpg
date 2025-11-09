import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import type { Character, Scenario, CustomScenarioConfig } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { character, scenario, customConfig } = await request.json()

    console.log("[v0] Generating opening for custom scenario")

    const systemPrompt = buildGameMasterPrompt(character, scenario, customConfig)

    const userPrompt = `Generate the opening narrative for this custom adventure.

SCENARIO: ${scenario.title}
SETTING: ${customConfig.location}, ${customConfig.region}
QUEST HOOK: ${customConfig.questHook}

DIRECTIVES:
- Tones: ${customConfig.tones.join(", ")}
- Combat Frequency: ${customConfig.combatFrequency}/5
- Companion Preference: ${customConfig.companionPreference}
${customConfig.uniqueElement ? `- Unique Element: ${customConfig.uniqueElement}` : ""}
${customConfig.urgency ? `- Urgency: ${customConfig.urgency}` : ""}
${customConfig.stakes ? `- Stakes: ${customConfig.stakes}` : ""}

Generate:
1. An engaging opening narrative (3-4 paragraphs) that establishes the setting and hook
2. 3-4 initial choices that reflect the character's abilities and the scenario directives

Format as JSON:
{
  "narrative": "opening text",
  "choices": [
    {
      "id": "choice-1",
      "text": "choice text",
      "actionType": "combat|social|investigation|craft|narrative|stealth|survival",
      "requiresRoll": boolean,
      "stat": "valor|wisdom|fellowship|craft|endurance|lore",
      "dc": number (8-18),
      "riskLevel": "safe|moderate|dangerous"
    }
  ]
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
    console.error("[v0] Opening generation error:", error)

    // Fallback opening
    const { scenario, customConfig } = await request.json()

    return NextResponse.json({
      narrative: `You find yourself in ${customConfig.location}, ${customConfig.region}. ${customConfig.questHook || "An adventure awaits you."}`,
      choices: [
        {
          id: "choice-1",
          text: "Investigate the area carefully",
          actionType: "investigation",
          requiresRoll: true,
          stat: "wisdom",
          dc: 12,
          riskLevel: "safe",
        },
        {
          id: "choice-2",
          text: "Approach directly and announce your presence",
          actionType: "social",
          requiresRoll: true,
          stat: "fellowship",
          dc: 12,
          riskLevel: "moderate",
        },
        {
          id: "choice-3",
          text: "Prepare for potential danger",
          actionType: "combat",
          requiresRoll: false,
          stat: "valor",
          riskLevel: "moderate",
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
- Inventory: ${character.inventory.map((i) => i.name).join(", ")}

${
  customConfig
    ? `
CUSTOM SCENARIO DIRECTIVES:
- Location: ${customConfig.location}, ${customConfig.region}
- Quest Hook: ${customConfig.questHook}
- Tones: ${customConfig.tones.join(", ")} - Maintain these emotional tones throughout
- Combat Frequency: ${customConfig.combatFrequency}/5 - ${getCombatGuidance(customConfig.combatFrequency)}
- Companion Preference: ${customConfig.companionPreference}
${customConfig.uniqueElement ? `- Unique Element: ${customConfig.uniqueElement} - Weave this into the narrative` : ""}
${customConfig.urgency ? `- Urgency: ${customConfig.urgency}` : ""}
${customConfig.stakes ? `- Stakes: ${customConfig.stakes}` : ""}

${
  customConfig.modifications && customConfig.modifications.length > 0
    ? `
RECENT ADJUSTMENTS:
${customConfig.modifications
  .slice(-3)
  .map((m) => `Turn ${m.turnNumber}: ${m.reason}`)
  .join("\n")}
Apply these adjustments gradually over the next 3-5 turns.
`
    : ""
}
`
    : ""
}

IMPORTANT RULES:
- Respect the custom directives above at all times
- Generate choices that match the character's abilities and the scenario's tone
- Set appropriate DCs: Easy 8-10, Medium 12-14, Hard 15-18
- Balance choice types: combat, social, investigation, craft, stealth, survival
- Make the ${customConfig?.tones.join(" and ") || "epic"} tone evident in your writing
- Keep narratives concise but evocative (2-4 paragraphs)
- Always provide meaningful choices that matter`
}

function getCombatGuidance(frequency: number): string {
  if (frequency === 1) return "Minimal combat - focus on story, negotiation, and investigation"
  if (frequency === 2) return "Rare combat - only when story demands it"
  if (frequency === 3) return "Moderate combat - balance action with other activities"
  if (frequency === 4) return "Frequent combat - action-focused with regular battles"
  return "Constant combat - highly action-oriented with combat in most scenes"
}
