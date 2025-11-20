# Tales of Middle-earth RPG - Backend Developer Handoff Document

**Version:** 1.0 (Production Ready)
**Date:** January 2025
**Status:** Frontend Complete - Backend Integration Required

---

## 📚 **REQUIRED READING**

Before starting backend development, read these documents in order:

1. **PRD.md** - Product requirements, MVP scope, tech stack decisions
2. **BACKEND_HANDOFF.md** (this file) - API contracts, game rules, implementation guide
3. **ZUSTAND_TO_CONTEXT_MIGRATION.md** - Post-MVP refactoring guide (optional)

**Critical Files:**
- `lib/types.ts` - All TypeScript type definitions
- `lib/scenario-config.ts` - Game constants (regions, tones, vibes)
- `lib/preset-scenarios.ts` - Example scenario configurations
- `lib/game-logic.ts` - Frontend game logic utilities

**Environment Setup:**
```bash
# Required environment variable
OPENAI_API_KEY=sk-...

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

---

## 📋 Executive Summary

This document is the **single source of truth** for backend API development. The frontend is fully implemented with a polished parchment UI, complete state management, and comprehensive game systems. Your job is to build AI-powered backend logic that interfaces with the existing contracts documented here.

**What's Complete:**
- ✅ Full character creation wizard with 6-stat system (not D&D)
- ✅ Three scenario creation paths (Quick Start, Vibe-First, Full Custom)
- ✅ In-game scenario adjustment system
- ✅ Complete UI: game screen, character panel, inventory, notifications
- ✅ Zustand state management with localStorage persistence
- ✅ Save/load system, level-up detection, quest completion detection
- ✅ Mobile-responsive with character drawer
- ✅ All game logic utilities (item usage, equipment, stat calculation)

**What You Need to Build:**
- 🔨 AI-powered narrative generation for all 5 API endpoints
- 🔨 Contextual choice generation based on character stats
- 🔨 State change logic (health, gold, XP, inventory, companions)
- 🔨 Dynamic difficulty adjustment
- 🔨 Quest completion detection logic

---

## 🎯 Core Game Rules (AS-BUILT)

### The 6-Stat System (MANDATORY - NOT D&D)

The game uses a custom stat system inspired by Middle-earth themes:

| Stat | Description | Use Cases |
|------|-------------|-----------|
| `valor` | Combat prowess, bravery | Melee attacks, intimidation, courage checks |
| `wisdom` | Perception, insight | Spotting traps, understanding motives, nature |
| `fellowship` | Social skills, charisma | Persuasion, negotiation, leadership |
| `craft` | Dexterity, skill with tools | Lockpicking, crafting, stealth, ranged attacks |
| `endurance` | Constitution, stamina | Resisting poison, long marches, health |
| `lore` | Knowledge, intelligence | History, magic, languages, puzzles |

**Point Buy Rules:**
- Total points: `27`
- Stat range: `3-8` (base, before bonuses)
- Formula: Stat cost = `(value - 3) * 2` points

**Health Calculation:**
See `lib/rules.ts` for the exact formula:
\`\`\`typescript
import { calculateMaxHealth } from "./lib/rules"
maxHealth = calculateMaxHealth(endurance) // Formula: 10 + (endurance * 2)
\`\`\`

**Stat Modifiers:**
See `lib/rules.ts` for the exact formula:
\`\`\`typescript
import { getStatModifier } from "./lib/rules"
modifier = getStatModifier(statValue) // Formula: value - 3
// Stat 3 = +0, Stat 5 = +2, Stat 8 = +5
\`\`\`

**Difficulty Classes:**
See `lib/rules.ts` for DC calculations:
\`\`\`typescript
import { calculateDC } from "./lib/rules"
const easyDC = calculateDC("easy")     // 8
const mediumDC = calculateDC("medium") // 12
const hardDC = calculateDC("hard")     // 16
\`\`\`

---

## 📊 Data Models (EXACT TYPESCRIPT CONTRACTS)

### Character

\`\`\`typescript
export type Character = {
  id: string;
  name: string;
  race: "human" | "elf" | "dwarf" | "hobbit";
  background: "ranger" | "scholar" | "merchant" | "soldier" | "wanderer";
  raceAbility: string; // e.g., "Versatile", "Keen Senses"
  stats: CharacterStats; // Final calculated stats (Base + Race + Background)
  level: number;
  experience: number;
  health: number; // Current health
  maxHealth: number; // 10 + (endurance * 2)
  gold: number;
  inventory: InventoryItem[];
  companions: Companion[];
};

export type CharacterStats = {
  valor: number;
  wisdom: number;
  fellowship: number;
  craft: number;
  endurance: number;
  lore: number;
};
\`\`\`

### CustomScenarioConfig (THE MASTER OBJECT)

This is the single most important object. It defines the entire adventure.

\`\`\`typescript
export type CustomScenarioConfig = {
  id: string;
  generatedAt: number;
  creationMethod: "quick" | "vibe-first" | "full-custom";
  
  // Vibe-First Path
  vibes?: string[]; // e.g., ["ancient-mystery", "desperate-defense"]
  
  // Full Custom Path
  region?: string; // e.g., "Gondor", "Mirkwood"
  location?: string; // e.g., "The Old Watchtower"
  locationDescription?: string; // Optional, not used in UI
  questHook?: string; // e.g., "Dark forces gather..."
  urgency?: "immediate" | "building" | "slow-burn";
  stakes?: "personal" | "community" | "kingdom" | "world";

  // Tone & Combat
  tones: string[]; // e.g., ["dark", "hopeful"]
  combatFrequency: number; // 1-5 scale

  // Companions
  companionPreference: "solo" | "single-ally" | "small-party" | "large-fellowship";
  companionType?: string; // e.g., "A grizzled veteran warrior"

  // Unique Element
  uniqueElement?: string; // e.g., "A map that changes with the moon"

  // AI Context
  aiContext: {
    userPrompt?: string; // From "Refine" step
    characterContext: string; // e.g., "Human Ranger - High valor, craft"
    generatedNarrative?: string;
  };

  // In-Game Adjustments (CRITICAL)
  modifications?: Array<{
    turnNumber: number;
    changedFields: Partial<CustomScenarioConfig>;
    reason: string; // Player's explanation
  }>;
};
\`\`\`

**CRITICAL:** The `modifications` array tracks mid-game adjustments. Your AI must parse this and apply the latest changes to tone, combat frequency, etc.

### EnhancedChoice

This defines the buttons players click:

\`\`\`typescript
export type EnhancedChoice = {
  id: string;
  text: string; // e.g., "Try to pick the lock"
  actionType: "combat" | "social" | "investigation" | "craft" | "narrative" | "stealth" | "survival";
  requiresRoll: boolean; // If true, frontend rolls dice
  stat?: "valor" | "wisdom" | "fellowship" | "craft" | "endurance" | "lore";
  dc?: number; // Difficulty Class (8-18)
  riskLevel?: "safe" | "moderate" | "dangerous";
  consequence?: string; // Hint text for player
};
\`\`\`

**Dice Roll Mechanics:**
- Frontend rolls: `d20 + stat modifier`
- Success if: `total >= dc`
- DC Guidelines: Easy 8-10, Medium 12-14, Hard 15-18

---

## 🔌 API Contracts (FINAL SPECIFICATION)

### 1. POST /api/generate-opening

**Called:** On game start (all scenario types)

**Request:**
\`\`\`typescript
{
  character: Character,
  scenario: Scenario,
  customConfig: CustomScenarioConfig
}
\`\`\`

**Response:**
\`\`\`typescript
{
  narrative: string, // 3-4 paragraphs, establishes setting
  choices: EnhancedChoice[] // 3-4 initial choices
}
\`\`\`

**Your Job:**
- Generate an engaging opening that matches `customConfig.tones`
- Set the scene for `customConfig.location` and `customConfig.region`
- Introduce `customConfig.questHook`
- Create choices that match character's high stats
- Respect `customConfig.companionPreference` if applicable

---

### 2. POST /api/process-turn

**Called:** Every time player selects a choice

**Request:**
\`\`\`typescript
{
  character: Character,
  scenario: Scenario,
  storyHistory: StoryEntry[], // Last 5 entries
  playerChoice: string, // The text of the choice
  customConfig: CustomScenarioConfig,
  combatIntensity?: number, // If player adjusted mid-game
  tones?: string[], // If player adjusted mid-game
  diceRoll?: { // NEW: Frontend sends dice results
    roll: number, // Raw d20 roll
    diceType: 20,
    modifier: number, // Character stat modifier
    total: number, // roll + modifier
    dc: number, // Target DC
    stat: string, // Which stat was used
    success: boolean // Did they succeed?
  }
}
\`\`\`

**Response:**
\`\`\`typescript
{
  narrative: string, // 2-3 paragraphs continuing the story
  choices: EnhancedChoice[], // 3-4 new choices
  stateChanges?: {
    health?: number, // Positive = heal, negative = damage
    gold?: number, // Amount to add/subtract
    xp?: number, // Experience gained
    inventory?: InventoryItem[], // Items to ADD
    removeItems?: string[], // Item IDs to REMOVE
    companions?: Companion[], // New companions to ADD
    updateCompanions?: Array<{
      id: string,
      relationshipChange: number // +/- relationship
    }>,
    questProgress?: {
      objectiveCompleted?: string,
      newObjective?: string,
      questComplete?: boolean
    },
    effects?: ActiveEffect[] // Buffs/debuffs
  }
}
\`\`\`

**Your Job:**
- **CRITICAL:** If `diceRoll` is provided, your narrative MUST reflect success/failure
  - Success: Character achieves their goal
  - Failure: Complications, setbacks, or alternative outcomes
- Award XP for overcoming challenges (use XP_THRESHOLDS from lib/rules.ts)
- Inflict damage for failed rolls or dangerous situations (use DAMAGE_TIERS from lib/rules.ts)
- Grant gold for looting or completing objectives (use GOLD_REWARDS from lib/rules.ts)
- Add items when narratively appropriate
- Check `customConfig.modifications` and apply latest adjustments
- Respect `combatFrequency` (1=minimal, 5=constant combat)
- Maintain `tones` (dark, hopeful, mysterious, epic, etc.)

**State Change Guidelines (USE lib/rules.ts):**
- **Health:** Use damage tiers from `lib/rules.ts`:
  \`\`\`typescript
  import { DAMAGE_TIERS, calculateDamage } from "./lib/rules"
  // TRIVIAL: 1-3, STANDARD: 4-8, DANGEROUS: 9-15, LETHAL: 16-25
  const damage = calculateDamage("STANDARD") // Random 4-8
  \`\`\`
- **Gold:** Use gold rewards from `lib/rules.ts`:
  \`\`\`typescript
  import { GOLD_REWARDS, calculateGoldReward } from "./lib/rules"
  // TRIVIAL: 1-5, COMMON: 5-15, UNCOMMON: 15-40, RARE: 40-100, LEGENDARY: 100-250
  const gold = calculateGoldReward("COMMON") // Random 5-15
  \`\`\`
- **XP:** Use XP thresholds from `lib/rules.ts`:
  \`\`\`typescript
  import { XP_THRESHOLDS } from "./lib/rules"
  // Level 2: 100 XP, Level 3: 250 XP, Level 4: 450 XP, etc.
  // Award 10-50 XP per challenge based on difficulty
  \`\`\`
- **Inventory:** Add quest items, weapons, potions when found (use VALID_ITEM_KEYWORDS)
- **Remove Items:** If used in narrative (e.g., "You use the key to unlock the door")

---

### 3. POST /api/generate-scenario

**Called:** Quick Start and Vibe-First scenario creation

**Request:**
\`\`\`typescript
{
  method: "quick" | "vibe-first",
  character: Character,
  vibes?: string[] // Only for vibe-first, e.g., ["ancient-mystery"]
}
\`\`\`

**Response:**
\`\`\`typescript
{
  scenarios: Scenario[] // 1 for "quick", 3 for "vibe-first"
}
\`\`\`

**Your Job:**
- **Quick Start:** Generate 1 scenario appropriate for the character
- **Vibe-First:** Generate 3 distinct scenarios matching the selected vibes
- Each `Scenario` must include a fully populated `customConfig` object

---

### 4. POST /api/complete-scenario

**Called:** Full Custom wizard - "Finish with AI" button

**Request:**
\`\`\`typescript
{
  partialConfig: Partial<CustomScenarioConfig>, // What user filled in
  character: Character
}
\`\`\`

**Response:**
\`\`\`typescript
{
  config: CustomScenarioConfig // Fully completed config
}
\`\`\`

**Your Job:**
- Fill in missing fields with contextually appropriate values
- Ensure tones match the region/location
- Set appropriate combat frequency for the scenario type

---

### 5. POST /api/generate-options

**Called:** Full Custom wizard - dynamic dropdown population

**Request:**
\`\`\`typescript
{
  type: "locations" | "quest-hooks" | "companions" | "unique-elements",
  context: {
    region?: string,
    location?: string,
    questHook?: string,
    tones?: string[],
    companionPreference?: string,
    character: Character
  }
}
\`\`\`

**Response:**
\`\`\`typescript
{
  options: Array<{
    id: string,
    label: string,
    description: string
  }>
}
\`\`\`

**Your Job:**
- Generate 4-5 contextual options based on previous selections
- **Locations:** Must fit the region (e.g., "The Golden Hall" for Rohan)
- **Quest Hooks:** Must suit the location and character
- **Companions:** Match companion preference and tones
- **Unique Elements:** Add narrative spice

---

## 🎲 Game Constants (MUST KNOW)

### Race Bonuses

\`\`\`typescript
human: { flexChoice: true, bonusAmount: 2 } // Player chooses +2 to any stat
elf: { lore: +2, wisdom: +1 }
dwarf: { endurance: +2, craft: +1 }
hobbit: { fellowship: +2, wisdom: +1 }
\`\`\`

### Background Bonuses & Equipment

\`\`\`typescript
ranger: { bonuses: { valor: +1 }, startingGold: 20 }
scholar: { bonuses: { lore: +2 }, startingGold: 15 }
merchant: { bonuses: { fellowship: +1 }, startingGold: 50 }
soldier: { bonuses: { valor: +1, endurance: +1 }, startingGold: 25 }
wanderer: { bonuses: { wisdom: +1 }, startingGold: 10 }
\`\`\`

See `lib/character-data.ts` for full equipment lists.

### Available Tones

\`\`\`typescript
["dark", "hopeful", "mysterious", "epic", "personal", "desperate", "whimsical", "melancholic"]
\`\`\`

### Available Regions

\`\`\`typescript
["Gondor", "Rohan", "Shire", "Rivendell", "Mirkwood", "Moria", "Isengard", "Mordor", "Lothlórien", "Erebor"]
\`\`\`

### Available Vibes

\`\`\`typescript
["ancient-mystery", "desperate-defense", "political-intrigue", "supernatural-horror", 
 "noble-quest", "exploration-discovery", "personal-vendetta", "survival", 
 "heist-infiltration", "lost-civilization"]
\`\`\`

---

## 🛠️ Item Icon Keywords (CRITICAL FOR INVENTORY)

Items are rendered with icons based on **keyword matching** in the item name. Your AI must use these keywords when generating items.

**All valid keywords are defined in `lib/rules.ts` (VALID_ITEM_KEYWORDS).**

**Weapons:** sword, bow, dagger, knife, axe, spear, staff
**Armor:** shield, armor, chainmail, helmet
**Consumables:** potion, food, water, bread, elixir, bandage
**Treasure:** gold, gem, jewel, diamond, crown
**Books:** scroll, book, text, map, tome
**Magic:** magic, ancient, rune, enchanted, wand, amulet
**Tools:** rope, supplies, compass, lantern, torch

**Example:**
- ✅ Good: "Elven Dagger" (matches "dagger" → gets Feather icon)
- ✅ Good: "Health Potion" (matches "potion" → gets Flask icon)
- ❌ Bad: "Glimmering Shard" (no match → gets default Package icon)

**Item Name Validation:**
\`\`\`typescript
import { validateItemName, suggestItemNameWithKeyword } from "./lib/rules"

// Check if item name has valid keyword
if (!validateItemName("Mysterious Shard")) {
  // Suggest a name with keyword appended
  const validName = suggestItemNameWithKeyword("Mysterious Shard", "treasure")
  // Returns: "Mysterious Shard (Gem)"
}
\`\`\`

See `lib/rules.ts` for the complete list of keywords and `lib/item-icons.tsx` for icon mappings.

---

## 🔄 Preset Scenarios (CONVERTED TO CustomScenarioConfig)

All 4 preset scenarios are now defined as `CustomScenarioConfig` objects in `lib/preset-scenarios.ts`:

1. **Shadows of Mirkwood** - Dark forest mystery (dark, mysterious)
2. **Siege of Helm's Deep** - Epic fortress defense (epic, desperate)
3. **Mines of Moria** - Dungeon crawl (dark, mysterious)
4. **Quest for the Lost Ring** - Epic journey (epic, hopeful)

Your AI receives these configs the same way as custom scenarios.

---

## ⚠️ Critical Implementation Notes

### 1. Dice Roll Integration

The frontend now sends dice roll results to `/api/process-turn`. **YOU MUST** use this data:

\`\`\`typescript
if (diceRoll) {
  if (diceRoll.success) {
    // Generate narrative where player succeeds
    // Award XP, progress quest, grant rewards
  } else {
    // Generate narrative where player fails
    // Inflict damage, create complications, alternative paths
  }
}
\`\`\`

### 2. Scenario Modifications (Mid-Game Adjustments)

Players can adjust tone and combat frequency mid-game. Check `customConfig.modifications`:

\`\`\`typescript
if (customConfig.modifications && customConfig.modifications.length > 0) {
  const latestMod = customConfig.modifications[customConfig.modifications.length - 1];
  // Apply latestMod.changedFields to your AI prompt
  // Example: latestMod.changedFields.tones = ["hopeful"] (player changed from dark)
}
\`\`\`

### 3. State Changes Must Be Granular

Don't just say "You find treasure." Send:

\`\`\`json
{
  "stateChanges": {
    "gold": 50,
    "inventory": [{
      "id": "ancient-sword-123",
      "name": "Ancient Elven Sword",
      "description": "Forged in Rivendell, glows near orcs",
      "type": "weapon",
      "quantity": 1,
      "value": 100,
      "stats": { "valor": 2 }
    }],
    "xp": 30
  }
}
\`\`\`

### 4. XP and Leveling

**IMPORTANT: Use the tiered XP system from lib/rules.ts**

\`\`\`typescript
import { XP_THRESHOLDS, calculateLevel, getXPForNextLevel } from "./lib/rules"

// Award 10-50 XP per challenge
// XP Thresholds (from lib/rules.ts):
// Level 1: 0 XP
// Level 2: 100 XP
// Level 3: 250 XP
// Level 4: 450 XP
// Level 5: 750 XP
// etc.

// Calculate level from total XP
const currentLevel = calculateLevel(totalXP)

// Get XP needed for next level
const nextLevelXP = getXPForNextLevel(currentLevel)
\`\`\`

- Frontend auto-detects level-ups and shows modal

### 5. Quest Completion Detection

Frontend checks for keywords in narrative:
- "quest complete"
- "victory"
- "mission accomplished"
- "you have succeeded"

Or check turn count (preset scenarios ~20 turns).

### 6. Combat Frequency Scale

\`\`\`typescript
1 = Minimal combat (focus on story, negotiation)
2 = Rare combat (only when story demands)
3 = Moderate combat (balanced)
4 = Frequent combat (action-focused)
5 = Constant combat (combat in most scenes)
\`\`\`

### 7. AI Response Validation

Frontend validates your responses. You MUST return:
- `narrative` (string, non-empty)
- `choices` (array, 1-6 choices)
- Each choice must have `id`, `text`, `actionType`

If validation fails, fallback choices are used.

---

## 📁 File Structure Reference

\`\`\`
app/
├── api/
│   ├── complete-scenario/route.ts    // Endpoint 4
│   ├── generate-opening/route.ts     // Endpoint 1
│   ├── generate-options/route.ts     // Endpoint 5
│   ├── generate-scenario/route.ts    // Endpoint 3
│   └── process-turn/route.ts         // Endpoint 2 (MOST IMPORTANT)
lib/
├── types.ts                           // All TypeScript types
├── game-state.ts                      // Zustand store (frontend uses this)
├── game-logic.ts                      // Utility functions (item usage, leveling)
├── character-data.ts                  // Race/background bonuses
├── scenario-config.ts                 // All constants (tones, regions, etc.)
├── preset-scenarios.ts                // 4 preset configs
├── item-icons.tsx                     // Item keyword mapping
└── dice.ts                            // Dice rolling logic
\`\`\`

---

## 🎯 Success Criteria

Your backend is complete when:

1. ✅ All 5 API endpoints return valid responses
2. ✅ Dice roll results affect narrative outcomes
3. ✅ State changes (health, gold, XP, items) are granular and accurate
4. ✅ Scenario modifications are respected mid-game
5. ✅ Preset and custom scenarios generate equivalent quality narratives
6. ✅ Choices match character stats (high valor → combat options)
7. ✅ Tone and combat frequency are maintained consistently
8. ✅ Quest completion can be detected by frontend
9. ✅ Item names use icon keywords
10. ✅ Edge cases handled (corrupted data, AI failures → fallback responses)

---

## 🚀 Testing Checklist

- [ ] Create a human ranger with high valor, test combat choices appear
- [ ] Create a hobbit scholar with high lore, test investigation choices appear
- [ ] Start a preset scenario (Mirkwood), verify narrative matches tone
- [ ] Adjust tone mid-game (dark → hopeful), verify narrative shifts
- [ ] Fail a dice roll, verify narrative reflects failure
- [ ] Succeed a dice roll, verify XP is awarded
- [ ] Find an item, verify it appears in inventory with correct icon
- [ ] Use a health potion, verify health increases
- [ ] Reach 100 XP, verify level-up modal triggers
- [ ] Complete a quest, verify victory screen appears

---

---

## 🔄 SPRINT 2 UPDATES - API ENFORCEMENT & AI GUARDRAILS

**Last Updated:** January 2025 (Sprint 2 - Dev B)
**Status:** Production Implementation Complete

### New Features Implemented

#### 1. JSON Schema Enforcement

All API endpoints now use:
```typescript
experimental_providerMetadata: {
  openai: {
    response_format: { type: "json_object" }
  }
}
```

This forces the AI to return **ONLY** valid JSON, preventing hallucinations and malformed responses.

#### 2. Damage Tier System

The API no longer allows the AI to specify raw damage values. Instead:

**New Type (added to `lib/types.ts`):**
```typescript
export type DamageTier = "none" | "trivial" | "standard" | "dangerous" | "lethal"
```

**Tier Definitions (from `lib/rules.ts`):**
- `none`: 0 HP (success, safe choice)
- `trivial`: 1-3 HP (minor scrape)
- `standard`: 4-8 HP (moderate injury)
- `dangerous`: 9-15 HP (serious wound)
- `lethal`: 16-25 HP (life-threatening)

**Updated Response Contract:**
```typescript
{
  "narrative": string,
  "choices": EnhancedChoice[],
  "consequenceTier": "none|trivial|standard|dangerous|lethal", // NEW FIELD
  "stateChanges": {
    // health is now calculated server-side based on consequenceTier
    "gold": number,
    "xp": number,
    // ... rest unchanged
  }
}
```

**Middleware Logic:**
The backend calculates damage from the tier:
```typescript
if (aiResponse.consequenceTier && aiResponse.consequenceTier !== "none") {
  const tier = aiResponse.consequenceTier as DamageTier;
  calculatedHealth = -calculateDamage(tier, true);
}
```

#### 3. Item Keyword Enforcement

The system prompt now includes all valid item keywords from `lib/rules.ts`:

```
VALID_ITEM_KEYWORDS = [
  "sword", "bow", "dagger", "axe", "shield", "armor", "potion",
  "scroll", "book", "map", "rope", "gem", "gold", "key",
  // ... 100+ keywords total
]
```

Generated items MUST contain at least one keyword to render icons correctly.

#### 4. Pacing Engine (Turn 20 Wall)

The API tracks turn count and dynamically injects pacing instructions:

- **Turn 0-4:** ACT 1 (Introduction) - World-building, low-risk encounters
- **Turn 5-15:** ACT 2 (Rising Action) - Increased difficulty, central conflict
- **Turn 16-19:** ACT 3 (Climax) - Final confrontation setup
- **Turn 20+:** CONCLUSION MANDATORY - AI MUST force Victory or Defeat

At Turn 20+, the AI is instructed to set `questComplete: true` in stateChanges.

#### 5. State Change Sanitization

The backend now sanitizes all state changes via `lib/rules.ts`:

```typescript
export function sanitizeStateChanges(stateChanges: any): any {
  // Clamp health: -25 to +30
  // Clamp XP: max 100 (unless questComplete: true)
  // Clamp gold: max -50 loss per turn
}
```

This prevents the AI from breaking game balance with extreme values.

### New Files Created

- **lib/rules.ts** - Game rules engine (damage tiers, XP table, sanitization)
- **docs/api/AI_PROMPT_GUIDE.md** - Comprehensive AI prompt documentation

### Updated Files

- **app/api/process-turn/route.ts** - Middleware logic, pacing engine, JSON enforcement
- **app/api/generate-opening/route.ts** - Item keyword enforcement, JSON enforcement
- **lib/types.ts** - Added `DamageTier` type

### Breaking Changes

⚠️ **IMPORTANT:** The `process-turn` response now includes `consequenceTier` instead of direct health values in some cases. Frontend should use the `stateChanges.health` field, which is calculated server-side.

### Critical Fixes (Sprint 2.1)

#### Fix 1: Fallback Response Schema Mismatch ✅

**Issue:** Original fallback responses didn't include `consequenceTier` field, causing potential frontend crashes.

**Solution:** All fallback responses now include:
```typescript
{
  consequenceTier: "none",
  stateChanges: { health: 0 }
}
```

**Files Updated:**
- `app/api/process-turn/route.ts:162-187` - Added `consequenceTier` and explicit health
- `app/api/generate-opening/route.ts:101-116` - Added double-fallback for request parsing errors

#### Fix 2: Token Cost Optimization ✅

**Issue:** Injecting 100+ keywords into prompts caused context window bloat (~150 tokens).

**Solution:** Created curated subset `PROMPT_ITEM_KEYWORDS` with 20 core keywords (~30 tokens).

**Impact:**
- Token reduction: **80% fewer tokens** (150 → 30)
- Coverage: Still covers 90%+ of item types
- Validation: Full 100+ keyword list still used for validation in `VALID_ITEM_KEYWORDS`

**Files Updated:**
- `lib/rules.ts:91-116` - Added `PROMPT_ITEM_KEYWORDS` constant
- `app/api/process-turn/route.ts` - Uses `PROMPT_ITEM_KEYWORDS` instead of full list
- `app/api/generate-opening/route.ts` - Uses `PROMPT_ITEM_KEYWORDS` instead of full list

### Testing Notes

To test the new system:
1. Start a game and play through 5 turns - verify ACT 1 pacing
2. Continue to Turn 15 - verify ACT 2 increased difficulty
3. Reach Turn 20 - verify AI forces conclusion
4. Check that generated items have valid keywords (inspect inventory icons)
5. Verify damage values are within tier ranges (check console logs for "[DEV B]" messages)
6. **NEW:** Test fallback by simulating OpenAI timeout - verify `consequenceTier` exists in response
7. **NEW:** Monitor token usage - should see ~80% reduction in system prompt size

---

## 📞 Questions & References

### Documentation

- **PRD.md** - Product requirements, tech stack decisions, MVP scope
- **BACKEND_HANDOFF.md** (this file) - API contracts and implementation guide
- **docs/api/AI_PROMPT_GUIDE.md** - AI prompt engineering guide (NEW - Sprint 2)
- **ZUSTAND_TO_CONTEXT_MIGRATION.md** - Post-MVP state management refactor (optional)

### Code References

If ambiguous, refer to these files:
- `lib/types.ts` - All type definitions (Character, Scenario, EnhancedChoice, etc.)
- `lib/scenario-config.ts` - Game constants (regions, tones, vibes, races, backgrounds)
- `lib/preset-scenarios.ts` - Example of complete CustomScenarioConfig objects
- `lib/game-logic.ts` - State change logic examples (item usage, level-up, etc.)
- `lib/item-icons.tsx` - Item keyword to icon mapping (CRITICAL for inventory)
- `app/api/process-turn/route.ts` - Example AI prompt structure (when implemented)
- `app/api/generate-opening/route.ts` - Example opening narrative generation

### Tech Stack Dependencies

**Required for AI Integration:**
- `ai` (Vercel AI SDK) - Unified LLM interface
- OpenAI GPT-4o-mini model - Cost-effective narrative generation
- Environment variable: `OPENAI_API_KEY`

**Frontend Dependencies:**
- Next.js 16.0.0 (App Router + API Routes)
- React 19.2.0
- Zustand (state management - will be replaced with React Context post-MVP)
- Tailwind CSS 4.1.9
- 8 Radix UI components (dialog, label, progress, scroll-area, separator, slider, slot, toast)
- Lucide React icons
- Sonner toast notifications

**See PRD.md for complete tech stack details and cleanup rationale.**

### AI Integration Resources

**Vercel AI SDK Documentation:**
- Official docs: https://sdk.vercel.ai/docs
- `generateText()` API: https://sdk.vercel.ai/docs/reference/ai-sdk-core/generate-text
- OpenAI provider: https://sdk.vercel.ai/providers/ai-sdk-providers/openai
- Structured output: https://sdk.vercel.ai/docs/ai-sdk-core/generating-structured-data

**OpenAI Documentation:**
- GPT-4o-mini model: https://platform.openai.com/docs/models/gpt-4o-mini
- Chat completions: https://platform.openai.com/docs/api-reference/chat
- Prompt engineering: https://platform.openai.com/docs/guides/prompt-engineering

### Implementation Checklist

Backend developer should:
- [ ] Read PRD.md for MVP scope and tech stack context
- [ ] Set `OPENAI_API_KEY` environment variable
- [ ] Run `pnpm install` to install dependencies
- [ ] Review `lib/types.ts` for all TypeScript contracts
- [ ] Implement all 5 API endpoints (`/api/*`)
- [ ] Test with preset scenarios first (simpler)
- [ ] Test custom scenarios (more complex)
- [ ] Verify dice roll integration
- [ ] Verify state changes (health, gold, XP, inventory)
- [ ] Test mid-game scenario adjustments
- [ ] Handle AI failures gracefully (fallback responses)
- [ ] Use item keywords from `lib/item-icons.tsx`
- [ ] Run `pnpm build` to verify no TypeScript errors

### Edge Cases to Handle

1. **AI Failures**: OpenAI API timeout or rate limit → Return fallback narrative
2. **Corrupted Data**: Invalid character or scenario → Validate before processing
3. **Empty Inventory**: Player uses item not in inventory → Validate before removal
4. **Health Edge Cases**: Damage kills player → Set `showGameOver: true`
5. **XP Overflow**: Level-up mid-turn → Frontend auto-detects with `Math.floor(xp / 100) + 1`
6. **Missing Config**: Scenario without customConfig → Use defaults from preset-scenarios

### Performance Targets

- **API Response Time**: < 2 seconds (including OpenAI call)
- **Narrative Quality**: Coherent, maintains tone and context
- **State Changes**: Always granular (specific amounts, not vague)
- **Choice Relevance**: Match character stats (high valor = combat options)

---

**This document is your contract.** Frontend expects these exact API contracts.

**Good luck, and may your code be as legendary as the tales of Middle-earth!** 🧙‍♂️⚔️
