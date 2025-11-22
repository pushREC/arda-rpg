import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import type { Character, Scenario, CustomScenarioConfig, StoryEntry, DamageTier, CombatState } from "@/lib/types"
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
      actionType, // Sprint 8: Receive actionType for death detection
    } = await request.json()

    // ========================================================================
    // TICKET 8.1: WORLD STATE TRACKING - Parse World State from Request
    // ========================================================================
    const worldState: string[] = (customConfig as any)?.worldState || []
    console.log("[DEV B] World State:", worldState)

    // ========================================================================
    // TICKET 8.2: DEATH NARRATIVE ENDPOINT - Early Death Detection
    // ========================================================================
    if (playerChoice === "DIRECT_DEATH_TRIGGER" || actionType === "death") {
      console.log("[DEV B] Death condition detected, generating final narrative")

      // Build recent history for death context
      const recentHistory = storyHistory
        .slice(-5)
        .map((entry: StoryEntry) => `${entry.type}: ${entry.text}`)
        .join("\n\n")

      // Death-specific prompt (bypasses standard system prompt)
      const deathPrompt = `You are the Game Master. The player (Level ${character.level} ${character.race} ${character.background}) has perished.
Current Context: ${recentHistory}

Generate a grim, final paragraph describing their demise.
Do NOT offer choices.
Do NOT offer hope.
Output JSON: { "narrative": "...", "choices": [], "consequenceTier": "lethal", "stateChanges": { "isDead": true } }`

      const deathResult = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: deathPrompt,
        temperature: 0.8,
        providerOptions: {
          openai: {
            responseFormat: { type: "json_object" },
          },
        },
      })

      const deathResponse = JSON.parse(deathResult.text)

      // Force death response format
      return NextResponse.json({
        narrative: deathResponse.narrative,
        choices: [], // No choices in death
        consequenceTier: "lethal",
        stateChanges: {
          isDead: true,
        },
      })
    }

    // ========================================================================
    // TICKET 2.3: PACING ENGINE - Calculate Turn Count
    // ========================================================================
    const turnCount = storyHistory.filter((entry: StoryEntry) => entry.type === "action").length
    console.log(`[DEV B] Processing turn ${turnCount}`)

    if (diceRoll) {
      console.log("[DEV B] Dice roll data:", diceRoll)
    }

    // ========================================================================
    // TICKET 4.1 & 4.2: COMBAT LOCK & QUEST CONTEXT - Extract state data
    // ========================================================================
    const combatState: CombatState = character.combat || {
      isActive: false,
      enemyId: null,
      enemyName: null,
      enemyHpCurrent: 0,
      enemyHpMax: 0,
      roundCount: 0,
    }

    // Extract quest progress from story history or state
    const questProgress = storyHistory
      .slice()
      .reverse()
      .find((entry: any) => entry.questProgress)?.questProgress || null

    console.log("[DEV B] Combat State:", combatState)
    console.log("[DEV B] Quest Progress:", questProgress)

    // ========================================================================
    // TICKET 2.1: JSON SCHEMA ENFORCEMENT - Build Strict System Prompt
    // ========================================================================
    const systemPrompt = buildGameMasterPrompt(
      character,
      scenario,
      customConfig,
      combatIntensity,
      tones,
      turnCount,
      combatState,
      questProgress,
      worldState // TICKET 8.1: Pass world state to prompt builder
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
      "actionType": "combat|social|investigation|craft|narrative|stealth|survival|trade",
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
  },
  "newWorldFacts": ["string"] (optional, concise summaries of major plot events for persistent memory),
  "startCombat": {
    "enemyId": "string",
    "enemyName": "string",
    "enemyHpMax": number
  } (optional, ONLY when a new enemy appears in the narrative)
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
      providerOptions: {
        openai: {
          responseFormat: { type: "json_object" },
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
        // ========================================================================
        // TICKET 8.4: LEVEL SCALING INTEGRATION - Pass character level to calculateDamage
        // ========================================================================
        calculatedHealth = -calculateDamage(tier, true, character.level || 1) // Negative for damage
        console.log(`[DEV B] Damage Calculation: Tier ${tier} @ Lvl ${character.level} -> ${calculatedHealth}`)
      }
    }

    // Override AI's raw state changes with calculated values
    const finalStateChanges = sanitizeStateChanges({
      ...aiResponse.stateChanges,
      health: calculatedHealth !== 0 ? calculatedHealth : aiResponse.stateChanges?.health,
    })

    // ========================================================================
    // TICKET 8.3: DETERMINISTIC COMBAT TRIGGER - Force Combat on Dangerous Failure
    // ========================================================================
    const riskLevel = diceRoll?.riskLevel || "safe"
    const isDangerousFailure =
      (diceRoll?.success === false) &&
      (riskLevel === "dangerous" || riskLevel === "lethal")

    const isCombatActive = combatState.isActive

    if (isDangerousFailure && !isCombatActive) {
      // Check if AI already started combat
      if (!aiResponse.startCombat) {
        console.log("[DEV B] Forcing Combat due to Dangerous Failure")

        // Inject Force-Start Combat Data
        aiResponse.startCombat = {
          enemyId: `force-enemy-${crypto.randomUUID()}`,
          enemyName: "Ambushing Threat", // Generic fallback
          enemyHpMax: 20 + (character.level * 2) // Scaling HP
        }

        // Append narrative justification
        aiResponse.narrative += "\n\nYour failure attracts unwanted attention. An enemy moves to strike!"
      }
    }

    // ========================================================================
    // TICKET 4.3: STATE MIDDLEWARE - Combat Calculations & Persistence
    // ========================================================================
    const combatUpdate: Partial<CombatState> = {}

    // Handle ongoing combat
    if (combatState.isActive) {
      // Increment round counter
      combatUpdate.roundCount = combatState.roundCount + 1
      console.log(`[DEV B] Combat Round ${combatUpdate.roundCount}`)

      // Calculate player damage if attack was successful
      if (diceRoll?.success && aiResponse.choices?.some((c: any) =>
        c.actionType === "combat" ||
        c.actionType === "survival" ||
        playerChoice.toLowerCase().includes("attack") ||
        playerChoice.toLowerCase().includes("strike") ||
        playerChoice.toLowerCase().includes("hit")
      )) {
        // Calculate player damage: base damage + level bonus
        const playerDmg = calculateDamage("STANDARD", true) + (character.level || 1)
        const newEnemyHp = Math.max(0, combatState.enemyHpCurrent - playerDmg)

        combatUpdate.enemyHpCurrent = newEnemyHp
        console.log(`[DEV B] Player hit ${combatState.enemyName} for ${playerDmg} dmg (${combatState.enemyHpCurrent} -> ${newEnemyHp} HP)`)

        // Check for enemy death
        if (newEnemyHp === 0) {
          combatUpdate.isActive = false
          combatUpdate.enemyHpCurrent = 0
          finalStateChanges.xp = (finalStateChanges.xp || 0) + 50 // Kill bonus
          console.log(`[DEV B] ${combatState.enemyName} defeated! +50 XP bonus`)
        }
      } else {
        // No damage dealt this round, preserve current HP
        combatUpdate.enemyHpCurrent = combatState.enemyHpCurrent
      }
    }

    // Handle new combat spawn
    if (aiResponse.startCombat && !combatState.isActive) {
      const { enemyId, enemyName, enemyHpMax } = aiResponse.startCombat
      combatUpdate.isActive = true
      combatUpdate.enemyId = enemyId
      combatUpdate.enemyName = enemyName
      combatUpdate.enemyHpMax = enemyHpMax
      combatUpdate.enemyHpCurrent = enemyHpMax
      combatUpdate.roundCount = 1
      console.log(`[DEV B] New combat started: ${enemyName} (${enemyHpMax} HP)`)
    }

    // Add combat update to state changes if there are changes
    if (Object.keys(combatUpdate).length > 0) {
      finalStateChanges.combatUpdate = combatUpdate
    }

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

    // ========================================================================
    // TICKET 8.1: WORLD STATE TRACKING - Handle newWorldFacts from AI Response
    // ========================================================================
    if (aiResponse.newWorldFacts && Array.isArray(aiResponse.newWorldFacts)) {
      finalStateChanges.worldUpdates = aiResponse.newWorldFacts
      console.log("[DEV B] New World Facts:", aiResponse.newWorldFacts)
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
    // [FIX] Log the error details to help debug AI failures
    if (error instanceof Error) {
      console.error("[DEV B] Error message:", error.message)
      console.error("[DEV B] Error stack:", error.stack)
    }

    // Fallback narrative to prevent 500 errors
    // CRITICAL: Must match new schema with consequenceTier
    // [FIX] Ensure fallback increments turn count and provides varied choices to prevent loops
    return NextResponse.json({
      narrative:
        "The chaos of battle obscures the outcome... The path ahead remains uncertain, but you must press on. (AI Generation Failed - Fallback Mode)",
      choices: [
        {
          id: "fallback-1",
          text: "Press the attack despite the confusion",
          actionType: "combat",
          requiresRoll: true,
          stat: "valor",
          dc: 12,
          riskLevel: "dangerous",
        },
        {
          id: "fallback-2",
          text: "Retreat and regroup",
          actionType: "survival",
          requiresRoll: true,
          stat: "endurance",
          dc: 10,
          riskLevel: "safe",
        },
        {
          id: "fallback-3",
          text: "Look for a tactical advantage",
          actionType: "investigation",
          requiresRoll: true,
          stat: "wisdom",
          dc: 11,
          riskLevel: "moderate",
        },
      ],
      consequenceTier: "none", // NEW: Match Sprint 2 schema
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
  combatState?: CombatState,
  questProgress?: any,
  worldState?: string[], // TICKET 8.1: Add world state parameter
): string {
  const activeTones = tones || customConfig?.tones || ["epic"]
  const activeCombat = combatIntensity || customConfig?.combatFrequency || 3

  // ========================================================================
  // TICKET 4.2: QUEST CONTEXT - Prevent AI memory loss
  // ========================================================================
  const questContext = customConfig?.questHook
    ? `
QUEST CONTEXT:
- Main Objective: "${customConfig.questHook}"
- Current Status: "${questProgress?.newObjective || questProgress?.activeObjective || 'Just started'}"
${questProgress?.objectiveCompleted ? `- Recent Progress: Completed "${questProgress.objectiveCompleted}"` : ""}
`
    : ""

  // ========================================================================
  // TICKET 4.1: COMBAT LOCK - Force combat focus when active
  // ========================================================================
  let combatInstructions = ""
  if (combatState?.isActive) {
    combatInstructions = `
🚨 COMBAT MODE ACTIVE 🚨
ENEMY: ${combatState.enemyName}
HP: ${combatState.enemyHpCurrent} / ${combatState.enemyHpMax}
ROUND: ${combatState.roundCount}

DIRECTIVES:
1. The narrative MUST focus *exclusively* on the duel with ${combatState.enemyName}.
2. Do NOT spawn new enemies or change location.
3. If the player attacks successfully, describe the enemy taking damage.
4. If the enemy attacks, describe the player taking damage (using consequenceTier).
5. If the enemy dies (HP reaches 0), narrate their defeat clearly and set isActive to false.
6. Do NOT include "startCombat" in your response - combat is already active.
`
  }

  return `You are the Game Master for a Middle-earth text RPG. You are a fair but firm storyteller who respects the dice and maintains game balance.
${questContext}
CHARACTER:
- Name: ${character.name}
- Race: ${character.race}
- Background: ${character.background}
- Stats: Valor ${character.stats.valor}, Wisdom ${character.stats.wisdom}, Fellowship ${character.stats.fellowship}, Craft ${character.stats.craft}, Endurance ${character.stats.endurance}, Lore ${character.stats.lore}
- Current Health: ${character.health}/${character.maxHealth}

${customConfig
      ? `
CUSTOM SCENARIO DIRECTIVES (MUST BE FOLLOWED):
- Tones: ${activeTones.join(", ")} - Maintain these emotional tones
- Combat Frequency: ${activeCombat}/5 - ${getCombatGuidance(activeCombat)}
- Setting: ${customConfig.location}, ${customConfig.region}
${customConfig.uniqueElement ? `- Unique Element: ${customConfig.uniqueElement}` : ""}

${customConfig.modifications && customConfig.modifications.length > 0
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
${combatInstructions}

WORLD CONTEXT (PERSISTENT MEMORY):
${worldState && worldState.length > 0 ? worldState.join('\n') : "No major events recorded yet."}

INSTRUCTION: If a MAJOR plot event occurs (e.g., NPC met, Boss killed, Secret revealed), add a concise summary string to the 'newWorldFacts' array in your JSON response.

CRITICAL RULES FOR RESPONSES:

1. ACTION TYPES (MANDATORY ENUM):
   You MUST use ONLY these actionType values:
   - "combat" | "social" | "investigation" | "craft" | "narrative" | "stealth" | "survival" | "trade"

   NOTE: Use "trade" ONLY when the player is in a shop, merchant, or safe trading hub.

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
