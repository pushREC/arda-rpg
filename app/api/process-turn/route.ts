import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import type { Character, Scenario, CustomScenarioConfig, StoryEntry } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const {
      character,
      scenario,
      storyHistory,
      playerChoice,
      customConfig,
      combatIntensity,
      tones,
      diceRoll, // NEW: Receive dice roll result from frontend
    } = await request.json()

    console.log("[v0] Processing turn for custom scenario")
    if (diceRoll) {
      console.log("[v0] Dice roll data:", diceRoll)
    }

    const systemPrompt = buildGameMasterPrompt(character, scenario, customConfig, combatIntensity, tones)

    // Build story context
    const recentHistory = storyHistory
      .slice(-5)
      .map((entry: StoryEntry) => `${entry.type}: ${entry.text}`)
      .join("\n\n")

    const diceContext = diceRoll
      ? `\nDICE ROLL RESULT: The player rolled ${diceRoll.roll} on a d${diceRoll.diceType}, added ${diceRoll.modifier} (${diceRoll.stat} modifier) for a total of ${diceRoll.total} against DC ${diceRoll.dc}. Result: ${diceRoll.success ? "SUCCESS" : "FAILURE"}.`
      : ""

    const userPrompt = `Continue the story based on the player's choice.

RECENT STORY:
${recentHistory}

PLAYER'S CHOICE: ${playerChoice}${diceContext}

Generate:
1. A narrative response (2-3 paragraphs) that:
   - Resolves the player's choice${diceRoll ? ` and dice roll ${diceRoll.success ? "success" : "failure"}` : ""}
   - Advances the story
   - Respects the ${tones?.join(" and ") || customConfig?.tones?.join(" and ") || "epic"} tone
   - Follows combat frequency directive (${combatIntensity || customConfig?.combatFrequency || 3}/5)
2. 3-4 new meaningful choices
3. Any state changes (health, gold, XP, inventory, etc.)

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
    "health": number (optional, positive for heal, negative for damage),
    "gold": number (optional, positive for gain, negative for loss),
    "xp": number (optional, experience gained),
    "inventory": [{"id": "...", "name": "...", "description": "...", "type": "...", "quantity": 1, "value": 0}] (optional, items to add),
    "removeItems": ["item-id"] (optional, item IDs to remove),
    "companions": [{"id": "...", "name": "...", "relationship": 50, "description": "..."}] (optional, new companions),
    "updateCompanions": [{"id": "companion-id", "relationshipChange": number}] (optional),
    "questProgress": {
      "objectiveCompleted": "string" (optional),
      "newObjective": "string" (optional),
      "questComplete": boolean (optional)
    },
    "effects": [{"id": "...", "name": "...", "type": "buff|debuff", "value": number, "remainingTurns": number}] (optional)
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
      stateChanges: {},
    })
  }
}

function buildGameMasterPrompt(
  character: Character,
  scenario: Scenario,
  customConfig?: CustomScenarioConfig,
  combatIntensity?: number,
  tones?: string[],
): string {
  const activeTones = tones || customConfig?.tones || ["epic"]
  const activeCombat = combatIntensity || customConfig?.combatFrequency || 3

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
- Tones: ${activeTones.join(", ")} - Maintain these emotional tones
- Combat Frequency: ${activeCombat}/5 - ${getCombatGuidance(activeCombat)}
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

IMPORTANT: When determining state changes:
- Award XP for overcoming challenges (10-50 XP depending on difficulty)
- Inflict damage for failed rolls or dangerous situations (5-20 damage)
- Grant gold for looting or completing objectives (5-100 gold)
- Add items when narratively appropriate (weapons, potions, quest items)
- Track quest progress if objectives are completed

Generate engaging, choice-driven narrative that respects all directives.`
}

function getCombatGuidance(frequency: number): string {
  if (frequency === 1) return "Minimal combat"
  if (frequency === 2) return "Rare combat"
  if (frequency === 3) return "Moderate combat"
  if (frequency === 4) return "Frequent combat"
  return "Constant combat"
}
