# ARDA RPG - State Change Rules Documentation

**Version:** 1.0
**Status:** Production
**Last Updated:** January 2025

---

## Overview

This document defines the **exact numerical ranges** for damage, experience points, gold rewards, and other state changes in the game. These rules prevent AI hallucinations and ensure consistent game balance.

**All constants are defined in `lib/rules.ts`.**

---

## Damage System: The "Economy of Suffering"

### Damage Tiers

The AI selects the *tier* based on narrative context, but `lib/rules.ts` determines the *actual number*.

| Tier | Range | Label | When to Use |
|------|-------|-------|-------------|
| **TRIVIAL** | 1-3 | Scratch | Minor hazards, superficial wounds |
| **STANDARD** | 4-8 | Wound | Failed combat rolls, basic traps |
| **DANGEROUS** | 9-15 | Severe Injury | Critical failures, elite enemies |
| **LETHAL** | 16-25 | Mortal Wound | Boss attacks, catastrophic failures |

### Implementation

```typescript
import { DAMAGE_TIERS, calculateDamage } from "./lib/rules"

// Random damage within tier
const damage = calculateDamage("STANDARD") // Returns 4-8 (random)

// Average damage (for AI planning)
const avgDamage = calculateDamage("STANDARD", false) // Returns 6 (average)
```

### Usage Guidelines for Backend Developers

**TRIVIAL (1-3 damage):**
- Falling from a low height
- Minor animal bite
- Superficial cut from rusty blade
- Tripping over roots

**STANDARD (4-8 damage):**
- Failed melee combat roll
- Basic trap (arrow, pit)
- Orc warrior's strike
- Fire damage from torch

**DANGEROUS (9-15 damage):**
- Critical combat failure
- Elite enemy attack (troll, warg)
- Poison dart trap
- Falling from moderate height

**LETHAL (16-25 damage):**
- Boss enemy attack (dragon, Nazgûl)
- Catastrophic trap (collapsing ceiling)
- Falling from extreme height
- Direct hit from siege weapon

### Context-Aware Damage Selection

**Consider character level and stats:**
- A level 1 character with Endurance 3 has 16 HP → LETHAL damage can kill
- A level 5 character with Endurance 7 has 24 HP → Can survive most hits

**Narrative Balance:**
- Don't use LETHAL on every failed roll
- Escalate damage tier as story intensifies
- Allow healing opportunities between DANGEROUS encounters

---

## Experience Points: The "XP Economy"

### XP Thresholds by Level

| Level | Total XP Required | XP to Next Level |
|-------|-------------------|------------------|
| 1 | 0 | 100 |
| 2 | 100 | 150 |
| 3 | 250 | 200 |
| 4 | 450 | 300 |
| 5 | 750 | 400 |
| 6 | 1150 | 500 |
| 7 | 1650 | 600 |
| 8 | 2250 | 700 |
| 9 | 2950 | 800 |
| 10 | 3750 | (continues +800 per level) |

### Implementation

```typescript
import { XP_THRESHOLDS, calculateLevel, getXPForNextLevel } from "./lib/rules"

// Get current level from total XP
const totalXP = 275
const level = calculateLevel(totalXP) // Returns 3

// Get XP needed for next level
const nextLevelXP = getXPForNextLevel(3) // Returns 450 (Level 4 threshold)
const xpRemaining = nextLevelXP - totalXP // Returns 175 XP needed
```

### XP Reward Guidelines

**Award XP based on challenge difficulty, NOT character level.**

| Challenge Type | XP Range | Examples |
|----------------|----------|----------|
| **Minor** | 10-20 | Simple puzzle, basic social success, trivial combat |
| **Moderate** | 25-40 | Medium DC success, standard combat victory |
| **Major** | 45-70 | Hard DC success, elite enemy defeated, quest milestone |
| **Epic** | 75-100 | Boss defeated, major quest completed, legendary achievement |

**Examples:**
- Successfully picking a lock (Medium DC) → **30 XP**
- Defeating 3 orcs in combat → **35 XP**
- Solving a complex riddle (Hard DC) → **50 XP**
- Slaying a troll → **65 XP**
- Completing a full quest arc → **100 XP**

### XP Pacing Strategy

**Early Game (Levels 1-3):**
- Award XP generously (30-50 per scene)
- Players should reach Level 2 within 3-5 turns
- Rapid progression feels rewarding

**Mid Game (Levels 4-6):**
- Balance XP rewards (25-40 per scene)
- Level-ups every 6-8 turns
- Steady power curve

**Late Game (Levels 7+):**
- Reduce XP awards (20-35 per scene)
- Level-ups become rare achievements
- Focus on epic narrative moments

---

## Gold Rewards: The "Loot Economy"

### Gold Reward Tiers

| Tier | Range | When to Use |
|------|-------|-------------|
| **TRIVIAL** | 1-5 | Pocket change, begging, minor sale |
| **COMMON** | 5-15 | Basic loot, quest reward (minor) |
| **UNCOMMON** | 15-40 | Valuable find, completed side objective |
| **RARE** | 40-100 | Treasure chest, major quest reward |
| **LEGENDARY** | 100-250 | Dragon hoard, quest completion |

### Implementation

```typescript
import { GOLD_REWARDS, calculateGoldReward } from "./lib/rules"

// Random gold within tier
const gold = calculateGoldReward("COMMON") // Returns 5-15 (random)
```

### Usage Examples

**TRIVIAL (1-5 gold):**
- Looting a bandit's corpse
- Selling a worthless trinket
- Begging from a merchant
- Finding coins in a drawer

**COMMON (5-15 gold):**
- Defeating a group of enemies
- Selling a standard weapon
- Quest reward from a farmer
- Finding a small purse

**UNCOMMON (15-40 gold):**
- Looting a treasure chest
- Selling a magical item
- Quest reward from a merchant
- Gambling winnings

**RARE (40-100 gold):**
- Completing a major quest
- Finding a noble's cache
- Selling rare artifacts
- Blackmail/ransom

**LEGENDARY (100-250 gold):**
- Slaying a dragon
- Completing main story quest
- Finding ancient vault
- Royal reward

### Gold Balance Guidelines

**Starting Gold by Background:**
- Ranger: 20g
- Scholar: 15g
- Merchant: 50g
- Soldier: 25g
- Wanderer: 10g

**Item Costs (Reference):**
- Basic weapon: 10-20g
- Quality weapon: 30-50g
- Basic armor: 20-40g
- Health potion: 15-25g
- Inn stay: 2-5g
- Meal: 1-3g

**Don't flood the economy:**
- Award COMMON tier most frequently
- RARE+ only for significant achievements
- Allow players to feel wealthy without breaking immersion

---

## Health Changes

### Healing

**Potion Healing:**
- Minor Health Potion: +10 HP
- Health Potion: +15 HP
- Greater Health Potion: +25 HP

**Rest Healing:**
- Short rest (1 hour): +5 HP
- Long rest (8 hours): Full heal
- Camping with medical supplies: +10 HP

### Max Health Calculation

```typescript
import { calculateMaxHealth } from "./lib/rules"

const endurance = 6
const maxHP = calculateMaxHealth(endurance) // Returns 22 (10 + 6*2)
```

**Max Health by Endurance:**
- Endurance 3 → 16 HP (fragile)
- Endurance 5 → 20 HP (average)
- Endurance 7 → 24 HP (hardy)
- Endurance 8 → 26 HP (legendary constitution)

---

## Inventory Changes

### Adding Items

When the AI generates items, **item names MUST contain a valid keyword** from `VALID_ITEM_KEYWORDS` (lib/rules.ts).

```typescript
import { validateItemName, suggestItemNameWithKeyword } from "./lib/rules"

// Validate item name
const itemName = "Mysterious Shard"
if (!validateItemName(itemName)) {
  // Fix it by adding keyword
  const fixedName = suggestItemNameWithKeyword(itemName, "treasure")
  // Returns: "Mysterious Shard (Gem)"
}
```

**Good Item Names:**
- ✅ "Elven Longsword" (contains "sword")
- ✅ "Ancient Scroll of Fire" (contains "scroll")
- ✅ "Health Potion" (contains "potion")
- ✅ "Mithril Chainmail" (contains "chainmail")

**Bad Item Names:**
- ❌ "Glimmering Shard" (no keyword → default icon)
- ❌ "Mysterious Artifact" (no keyword unless "artifact" is last word)

### Item Value Guidelines

| Item Type | Value Range |
|-----------|-------------|
| Basic weapon | 10-20g |
| Quality weapon | 30-50g |
| Magical weapon | 75-150g |
| Basic armor | 20-40g |
| Quality armor | 50-80g |
| Magical armor | 100-200g |
| Potion | 15-25g |
| Quest item | 0g (priceless) |
| Treasure | 10-100g |

### Inventory Limits

- Max inventory size: **50 items**
- Frontend enforces this limit
- Encourage players to sell/drop items

---

## Companion Relationships

### Relationship Scale

Companion relationships range from **-100 to +100**.

| Range | Status | Effect |
|-------|--------|--------|
| -100 to -50 | Hostile | May leave or betray |
| -49 to -10 | Unfriendly | Reluctant to help |
| -9 to +9 | Neutral | Transactional |
| +10 to +49 | Friendly | Helpful, loyal |
| +50 to +100 | Devoted | Will sacrifice for player |

### Relationship Change Guidelines

**Minor interactions:**
- +5 to +10: Compliment, help with task, agree with them
- -5 to -10: Insult, ignore them, disagree

**Major interactions:**
- +15 to +25: Save their life, achieve shared goal
- -15 to -25: Betray them, harm them, abandon them

**Epic moments:**
- +30 to +50: Fulfill their personal quest, ultimate sacrifice
- -30 to -50: Major betrayal, kill their loved one

---

## State Change API Response Format

### Complete Example

```json
{
  "narrative": "You strike the orc with your sword! It falls...",
  "choices": [...],
  "stateChanges": {
    "health": -6,
    "gold": 12,
    "xp": 30,
    "inventory": [{
      "id": "orc-sword-123",
      "name": "Crude Orcish Sword",
      "description": "Rough but effective",
      "type": "weapon",
      "quantity": 1,
      "value": 8,
      "stats": { "valor": 1 }
    }],
    "removeItems": ["broken-key-456"],
    "updateCompanions": [{
      "id": "gimli",
      "relationshipChange": 10
    }]
  }
}
```

### Validation Rules

**Backend MUST enforce:**
- Health changes within DAMAGE_TIERS ranges
- Gold changes within GOLD_REWARDS ranges
- XP changes within 10-100 range
- All items have valid names (use validateItemName)

**Frontend will:**
- Clamp health to [0, maxHealth]
- Clamp companion relationships to [-100, 100]
- Reject invalid items

---

## Testing Your Implementation

### Verification Script

```typescript
import {
  DAMAGE_TIERS,
  calculateDamage,
  XP_THRESHOLDS,
  calculateLevel,
  GOLD_REWARDS,
  calculateGoldReward,
  validateItemName
} from "./lib/rules"

// Test 1: Damage Tiers
const trivialDamage = calculateDamage("TRIVIAL")
console.assert(trivialDamage >= 1 && trivialDamage <= 3, "Trivial damage out of range")

const lethalDamage = calculateDamage("LETHAL")
console.assert(lethalDamage >= 16 && lethalDamage <= 25, "Lethal damage out of range")

// Test 2: XP Thresholds
console.assert(calculateLevel(0) === 1, "0 XP should be level 1")
console.assert(calculateLevel(100) === 2, "100 XP should be level 2")
console.assert(calculateLevel(250) === 3, "250 XP should be level 3")

// Test 3: Gold Rewards
const commonGold = calculateGoldReward("COMMON")
console.assert(commonGold >= 5 && commonGold <= 15, "Common gold out of range")

// Test 4: Item Name Validation
console.assert(validateItemName("Elven Sword") === true, "Sword should be valid")
console.assert(validateItemName("Health Potion") === true, "Potion should be valid")
console.assert(validateItemName("Random Thing") === false, "Invalid name should fail")
```

---

## See Also

- `lib/rules.ts` - Implementation of all constants
- `lib/types.ts` - TypeScript type definitions
- `BACKEND_HANDOFF.md` - API integration guide
- `docs/game-systems/DICE_SYSTEM.md` - Stat modifiers and DCs
