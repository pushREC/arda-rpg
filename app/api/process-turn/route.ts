import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import type { Character, Scenario, CustomScenarioConfig, StoryEntry, DamageTier } from "@/lib/types"
import {
  PROMPT_ITEM_KEYWORDS,
  DAMAGE_TIERS,
  calculateDamage,
  sanitizeStateChanges,
} from "@/lib/rules"

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
      diceRoll, // Receive dice roll result from frontend
    } = await request.json()

    // ========================================================================
    // TICKET 2.3: PACING ENGINE - Calculate Turn Count
    // ========================================================================
    const turnCount = storyHistory.filter((entry: StoryEntry) => entry.type === "action").length
    console.log(`[DEV B] Processing turn ${turnCount}`)

    if (diceRoll) {
      console.log("[DEV B] Dice roll data:", diceRoll)
    }

    // ========================================================================
    // TICKET 2.1: JSON SCHEMA ENFORCEMENT - Build Strict System Prompt
    // ========================================================================
    const systemPrompt = buildGameMasterPrompt(
      character,
      scenario,
      customConfig,
      combatIntensity,
      tones,
      turnCount
    )

    // Build story context
    const recentHistory = storyHistory
      .slice(-5)
      .map((entry: StoryEntry) => `${entry.type}: ${entry.text}`)
      .join("\n\n")

    const diceContext = diceRoll
      ? `\nDICE ROLL RESULT: The player rolled ${diceRoll.roll} on a d${diceRoll.diceType}, added ${diceRoll.modifier} (${diceRoll.stat} modifier) for a total of ${diceRoll.total} against DC ${diceRoll.dc}. Result: ${diceRoll.success ? "SUCCESS" : "FAILURE"}.`
      : ""

    // ========================================================================
    // TICKET 2.3: PACING ENGINE - Inject Dynamic Pacing Instructions
    // ========================================================================
    const pacingInstruction = getPacingInstruction(turnCount)

    const userPrompt = `Continue the story based on the player's choice.

RECENT STORY:
${recentHistory}

PLAYER'S CHOICE: ${playerChoice}${diceContext}

${pacingInstruction}

Generate:
1. A narrative response (2-3 paragraphs) that:
   - Resolves the player's choice${diceRoll ? ` and dice roll ${diceRoll.success ? "success" : "failure"}` : ""}
   - Advances the story
   - Respects the ${tones?.join(" and ") || customConfig?.tones?.join(" and ") || "epic"} tone
   - Follows combat frequency directive (${combatIntensity || customConfig?.combatFrequency || 3}/5)
2. 3-4 new meaningful choices
3. Any state changes (health, gold, XP, inventory, etc.)

CRITICAL: Respond ONLY with valid JSON. Do not include any text outside the JSON object.

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
  "consequenceTier": "none|trivial|standard|dangerous|lethal",
  "stateChanges": {
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

    // ========================================================================
    // TICKET 2.1: JSON SCHEMA ENFORCEMENT - Force JSON Response
    // ========================================================================
    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.8,
      // CRITICAL: Enforce JSON output
      experimental_providerMetadata: {
        openai: {
          response_format: { type: "json_object" },
        },
      },
    })

    const aiResponse = JSON.parse(result.text)

    // ========================================================================
    // TICKET 2.2: GAME MASTER MIDDLEWARE - Logic Injection
    // ========================================================================
    let calculatedHealth = 0

    // AI specifies SEVERITY, we calculate DAMAGE
    if (aiResponse.consequenceTier && aiResponse.consequenceTier !== "none") {
      // ✅ TICKET D.1: Casing Hotfix - Normalize AI response to uppercase
      const rawTier = aiResponse.consequenceTier || "NONE"
      const tier = rawTier.toUpperCase() as DamageTier
      console.log(`[DEV D] Processing Tier: ${rawTier} -> ${tier}`)

      // Only calculate damage for non-NONE tiers
      if (tier !== "NONE") {
        calculatedHealth = -calculateDamage(tier, true) // Negative for damage
        console.log(`[DEV B] AI requested "${tier}" damage → ${calculatedHealth} HP`)
      }
    }

    // Override AI's raw state changes with calculated values
    const finalStateChanges = sanitizeStateChanges({
      ...aiResponse.stateChanges,
      health: calculatedHealth !== 0 ? calculatedHealth : aiResponse.stateChanges?.health,
    })

    // ========================================================================
    // TICKET D.3: VICTORY CONDITION - Ensure questComplete is set at Turn 20+
    // ========================================================================
    if (turnCount >= 20) {
      // Safety: Ensure questProgress is initialized before assignment
      finalStateChanges.questProgress = {
        ...finalStateChanges.questProgress,
        questComplete: true,
      }
      console.log(`[DEV D] Turn ${turnCount}: Auto-setting questComplete = true`)
    }

    const finalResponse = {
      narrative: aiResponse.narrative,
      choices: aiResponse.choices,
      stateChanges: finalStateChanges,
    }

    console.log(`[DEV B] Final state changes:`, finalStateChanges)

    return NextResponse.json(finalResponse)
  } catch (error) {
    console.error("[DEV B] Turn processing error:", error)

    // Fallback narrative to prevent 500 errors
    // CRITICAL: Must match new schema with consequenceTier
    return NextResponse.json({
      narrative:
        "The chaos of battle obscures the outcome... The path ahead remains uncertain, but you must press on.",
      choices: [
        {
          id: "fallback-1",
          text: "Continue onward",
          actionType: "narrative" as const,
          requiresRoll: false,
          riskLevel: "safe" as const,
        },
        {
          id: "fallback-2",
          text: "Take a moment to assess the situation",
          actionType: "investigation" as const,
          requiresRoll: false,
          riskLevel: "safe" as const,
        },
      ],
      consequenceTier: "none" as const, // NEW: Match Sprint 2 schema
      stateChanges: {
        health: 0, // Explicit zero (no change)
      },
    })
  }
}

// ============================================================================
// TICKET 2.3: PACING ENGINE - Dynamic Pacing Instructions
// ============================================================================
function getPacingInstruction(turnCount: number): string {
  if (turnCount < 5) {
    return `PACING (ACT 1 - INTRODUCTION): You are in the opening phase. Establish the setting and introduce low-risk threats. Focus on world-building and character development.`
  } else if (turnCount >= 5 && turnCount < 16) {
    return `PACING (ACT 2 - RISING ACTION): You are in the middle phase. Increase difficulty and raise the stakes. Introduce moderate challenges and develop the central conflict.`
  } else if (turnCount >= 16 && turnCount < 20) {
    return `PACING (ACT 3 - CLIMAX): You are approaching the finale. Guide the player toward the final confrontation. Increase tension and prepare for resolution.`
  } else {
    return `PACING (CONCLUSION MANDATORY): You MUST wrap up the story NOW. The choices provided must lead to immediate Victory or Defeat. Do not introduce new plot threads. Set "questComplete": true in questProgress if the player succeeds.`
  }
}

// ============================================================================
// TICKET 2.1: JSON SCHEMA ENFORCEMENT - Strict System Prompt
// ============================================================================
function buildGameMasterPrompt(
  character: Character,
  scenario: Scenario,
  customConfig?: CustomScenarioConfig,
  combatIntensity?: number,
  tones?: string[],
  turnCount?: number,
): string {
  const activeTones = tones || customConfig?.tones || ["epic"]
  const activeCombat = combatIntensity || customConfig?.combatFrequency || 3

  return `You are the Game Master for a Middle-earth text RPG. You are a fair but firm storyteller who respects the dice and maintains game balance.

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

CRITICAL RULES FOR RESPONSES:

1. ACTION TYPES (MANDATORY ENUM):
   You MUST use ONLY these actionType values:
   - "combat" | "social" | "investigation" | "craft" | "narrative" | "stealth" | "survival"

2. ITEM GENERATION (MANDATORY KEYWORDS):
   Generated items MUST contain one of these keywords in their name to ensure icon rendering:
   ${PROMPT_ITEM_KEYWORDS.join(", ")}

   Examples:
   ✅ GOOD: "Ancient Elven Sword", "Healing Potion", "Rusty Key"
   ❌ BAD: "Glimmering Shard", "Mysterious Object", "Strange Device"

   If you want to generate a unique item, combine a keyword with a descriptor:
   "Shard-Blade (Dagger)", "Moonstone Amulet", "Enchanted Rope"

3. DAMAGE SYSTEM (TIER-BASED):
   DO NOT specify raw damage numbers. Instead, use the "consequenceTier" field:
   - "none" = No damage (success, safe choice)
   - "trivial" = Minor scrape (1-3 HP)
   - "standard" = Moderate injury (4-8 HP)
   - "dangerous" = Serious wound (9-15 HP)
   - "lethal" = Life-threatening (16-25 HP)

   The backend will calculate the exact damage. You select the SEVERITY.

4. XP REWARDS:
   - Award 10-20 XP for minor challenges
   - Award 30-40 XP for moderate challenges
   - Award 50-80 XP for major victories
   - Award 100+ XP only for quest completion

5. GOLD REWARDS:
   - Small loot: 5-15 gold
   - Moderate loot: 20-50 gold
   - Major loot: 60-100 gold

6. QUEST PROGRESS:
   If the player completes a major objective, set "questComplete": true in questProgress.

7. JSON FORMATTING:
   Respond ONLY with valid JSON. Do not include markdown code blocks or explanatory text.

Generate engaging, choice-driven narrative that respects all directives and maintains game balance.`
}

function getCombatGuidance(frequency: number): string {
  if (frequency === 1) return "Minimal combat"
  if (frequency === 2) return "Rare combat"
  if (frequency === 3) return "Moderate combat"
  if (frequency === 4) return "Frequent combat"
  return "Constant combat"
}
