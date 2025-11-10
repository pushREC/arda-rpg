# Tales of Middle-earth RPG - Backend Developer Handoff Document

**Version:** 1.0 (Production Ready)  
**Date:** January 2025  
**Status:** Frontend Complete - Backend Integration Required

---

## 📋 Executive Summary

This document is the **single source of truth** for backend development. The frontend is fully implemented with a polished parchment UI, complete state management, and comprehensive game systems. Your job is to build AI-powered backend logic that interfaces with the existing contracts documented here.

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
\`\`\`typescript
maxHealth = 10 + (endurance * 2)
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
- Award XP for overcoming challenges (10-50 XP)
- Inflict damage for failed rolls or dangerous situations (5-20 damage)
- Grant gold for looting or completing objectives (5-100 gold)
- Add items when narratively appropriate
- Check `customConfig.modifications` and apply latest adjustments
- Respect `combatFrequency` (1=minimal, 5=constant combat)
- Maintain `tones` (dark, hopeful, mysterious, epic, etc.)

**State Change Guidelines:**
- **Health:** Damage on failed dangerous rolls, healing from finding potions/rest
- **Gold:** Looting enemies, selling items, quest rewards
- **XP:** 10-20 for minor challenges, 30-40 for moderate, 50+ for major victories
- **Inventory:** Add quest items, weapons, potions when found
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

See `lib/item-icons.tsx` for the complete mapping.

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

- Award 10-50 XP per challenge
- Level up formula: `level = Math.floor(xp / 100) + 1`
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

## 📞 Questions?

If ambiguous, refer to these files:
- `lib/types.ts` - All type definitions
- `app/api/process-turn/route.ts` - Example AI prompt structure
- `lib/preset-scenarios.ts` - Example of complete configs
- `lib/game-logic.ts` - State change logic examples

**This document is your contract.** Frontend expects these exact contracts.

---

**Good luck, and may your code be as legendary as the tales of Middle-earth!** 🧙‍♂️⚔️
