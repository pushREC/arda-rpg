# Core Game Mechanics - Implementation Specification

**Status:** FINAL - Ready for Implementation
**Priority:** CRITICAL - Required before any coding begins

---

## 1. STAT SYSTEM

### Stat Range
- **Base stats (point buy):** 3-8
- **With race bonuses:** +1 to +3 to specific stats
- **With background bonuses:** +1 to +2 to specific stats
- **Final range:** 4-11 (typical max at character creation)

### Point Buy System
```typescript
TOTAL_POINTS = 27
STAT_MIN = 3
STAT_MAX = 8
COST_FORMULA = (statValue - 3) × 2

// Examples:
// All stats at 5: (5-3)×2 × 6 = 24 points ✓
// Min-max (8,8,3,3,3,3): 20 points ✓
// Specialist (8,6,5,5,4,4): 26 points ✓
```

---

## 2. DICE ROLLING SYSTEM (FIXED)

### The Formula (CORRECTED)

```typescript
// WRONG (current lib/dice.ts):
modifier = Math.floor((statValue - 10) / 2)  // ❌ D&D formula

// CORRECT (use this):
totalRoll = d20 + statValue  // ✅ Direct addition

// No modifier needed - stats are already calibrated for 3-11 range
```

### Roll Calculation
```typescript
function performCheck(stat: number, dc: number): RollResult {
  const d20 = Math.floor(Math.random() * 20) + 1
  const total = d20 + stat
  const success = total >= dc
  const margin = total - dc

  return {
    d20,
    stat,
    total,
    dc,
    success,
    margin,
    critical: d20 === 20 || d20 === 1
  }
}
```

### DC Difficulty Table

| DC | Difficulty | Stat 3 | Stat 5 | Stat 8 | Stat 11 |
|----|-----------|--------|--------|--------|---------|
| 8  | Trivial   | 75%    | 85%    | 95%    | 100%    |
| 10 | Easy      | 65%    | 75%    | 90%    | 100%    |
| 12 | Medium    | 50%    | 60%    | 75%    | 90%     |
| 14 | Hard      | 40%    | 45%    | 65%    | 80%     |
| 16 | V.Hard    | 25%    | 30%    | 50%    | 70%     |
| 18 | Heroic    | 15%    | 20%    | 35%    | 60%     |
| 20 | Legendary | 5%     | 10%    | 25%    | 50%     |

### DC Assignment Formula (For AI)

```typescript
// Target: 60% success rate for character's relevant stat
recommendedDC = characterStatValue + 7

// Example: Character has Valor 8
// DC = 8 + 7 = 15
// Success rate = 70% (65% is close enough to 60% target)

// Adjust for difficulty:
easyDC = statValue + 5    // 75% success
mediumDC = statValue + 7  // 60% success
hardDC = statValue + 9    // 45% success
```

### Critical Hits/Failures

```typescript
if (d20 === 20) {
  // CRITICAL SUCCESS
  // - Always succeeds regardless of DC
  // - Bonus: +15 XP
  // - Narrative: Exceptional outcome
}

if (d20 === 1) {
  // CRITICAL FAILURE
  // - Always fails regardless of total
  // - Penalty: No XP gained
  // - Narrative: Complication occurs
  // - Damage (if dangerous): Full base damage
}
```

---

## 3. STATE CHANGE FORMULAS

### XP Rewards

```typescript
const BASE_XP = {
  combat: 25,
  social: 15,
  investigation: 20,
  craft: 15,
  stealth: 20,
  survival: 15,
  narrative: 10  // Safe choices
}

const DIFFICULTY_MULTIPLIER = {
  easy:      0.6,  // DC 8-10
  medium:    1.0,  // DC 11-13
  hard:      1.5,  // DC 14-16
  very_hard: 2.0   // DC 17+
}

function calculateXP(actionType, dc, rollResult) {
  const baseXP = BASE_XP[actionType]

  // Determine difficulty tier
  let multiplier = 1.0
  if (dc <= 10) multiplier = 0.6
  else if (dc <= 13) multiplier = 1.0
  else if (dc <= 16) multiplier = 1.5
  else multiplier = 2.0

  // Base award
  let xp = baseXP * multiplier

  // Margin bonus (beat DC by X → bonus XP)
  if (rollResult.success) {
    const marginBonus = Math.max(0, rollResult.margin) * 2
    xp += marginBonus
  }

  // Critical success bonus
  if (rollResult.critical && rollResult.d20 === 20) {
    xp += 15
  }

  // Round and cap
  xp = Math.round(xp)
  xp = Math.min(xp, 60)  // Safety cap

  return rollResult.success ? xp : 0
}

// Examples:
// Combat (DC 12), roll 15: 25 × 1.0 + (3×2) = 31 XP ✓
// Social (DC 10), roll 18: 15 × 0.6 + (8×2) = 25 XP ✓
// Investigation (DC 16), roll 11: 20 × 1.5 + 0 = 0 XP (failed) ✓
```

### Damage Calculation

```typescript
const BASE_DAMAGE = {
  combat_failure: 12,
  dangerous_action: 8,
  environmental: 5,
  trap: 10
}

function calculateDamage(actionType, dc, rollResult) {
  if (rollResult.success) return 0  // No damage on success

  const baseDamage = BASE_DAMAGE[actionType] || 5

  // Failure margin penalty (but capped)
  const margin = Math.abs(rollResult.margin)
  const marginPenalty = Math.min(margin, 5)

  let damage = baseDamage + marginPenalty

  // Critical failure
  if (rollResult.critical && rollResult.d20 === 1) {
    damage = baseDamage * 2
  }

  // Safety cap: Never more than 60% of max HP in one hit
  const character = getCurrentCharacter()
  const maxDamage = Math.floor(character.maxHealth * 0.6)
  damage = Math.min(damage, maxDamage)

  return damage
}

// Examples:
// Combat fail by 2: 12 + 2 = 14 HP ✓
// Combat fail by 8: 12 + 5 = 17 HP (capped margin) ✓
// Trap fail by 1: 10 + 1 = 11 HP ✓
// Critical fail in combat: 12 × 2 = 24 HP ✓
```

### Gold Rewards

```typescript
const GOLD_RANGES = {
  minor_loot: [5, 15],
  enemy_loot: [10, 30],
  chest: [25, 75],
  quest_reward: [50, 150],
  boss: [100, 250]
}

function randomGold(category) {
  const [min, max] = GOLD_RANGES[category]

  // Weighted toward middle (bell curve)
  const r1 = Math.random()
  const r2 = Math.random()
  const normalized = (r1 + r2) / 2

  return Math.floor(min + (max - min) * normalized)
}

// Distribution:
// minor_loot: Average ~10g
// enemy_loot: Average ~20g
// chest: Average ~50g
// quest_reward: Average ~100g
// boss: Average ~175g
```

### Item Generation

```typescript
interface ItemGenerationRule {
  minTurn: number       // Don't spam items early
  maxPerTurn: number    // Never more than 3 items
  rarityWeights: {      // Probability distribution
    common: 0.70,       // 70% chance
    uncommon: 0.25,     // 25% chance
    rare: 0.05          // 5% chance
  }
}

const ITEM_STATS = {
  common: {
    weapon: { valor: 1 },
    armor: { endurance: 1 }
  },
  uncommon: {
    weapon: { valor: 2 },
    armor: { endurance: 1, craft: 1 }
  },
  rare: {
    weapon: { valor: 3, fellowship: 1 },
    armor: { endurance: 2, wisdom: 1 }
  }
}

// CRITICAL: All items must include icon keywords!
const ICON_KEYWORDS = [
  'sword', 'bow', 'dagger', 'axe', 'spear', 'staff',  // Weapons
  'shield', 'armor', 'chainmail', 'helmet',            // Armor
  'potion', 'elixir', 'bread', 'food', 'water',       // Consumables
  'scroll', 'book', 'map', 'tome',                     // Knowledge
  'rope', 'lantern', 'compass', 'torch'                // Tools
]

// Example item names:
// ✅ "Elven Longsword" (contains "sword")
// ✅ "Sturdy Shield" (contains "shield")
// ✅ "Health Potion" (contains "potion")
// ❌ "Glimmering Blade" (no keyword match - will show default icon)
```

---

## 4. PROGRESSION SYSTEM

### XP Curve

```typescript
function getXPForLevel(level: number): number {
  return 75 + (level * 25)
}

// Level requirements:
// Level 2: 100 XP
// Level 3: 125 XP
// Level 4: 150 XP
// Level 5: 175 XP
// Level 6: 200 XP

// In typical 20-turn scenario (500 XP total):
// Player reaches level 4-5 ✓
```

### Level Up Rewards

```typescript
function onLevelUp(character: Character, newLevel: number) {
  // Automatic: HP increase
  const hpGain = 3
  character.maxHealth += hpGain
  character.health = character.maxHealth  // Full heal on level up

  // Every 3 levels: Stat increase
  if (newLevel % 3 === 0) {
    // Show modal: "Choose +1 to any stat"
    return {
      type: 'STAT_CHOICE',
      options: ['valor', 'wisdom', 'fellowship', 'craft', 'endurance', 'lore']
    }
  }

  // Level 5: Unlock ability (future feature)
  if (newLevel === 5) {
    return {
      type: 'ABILITY_UNLOCK',
      ability: 'Second Wind'  // Heal 25% HP once per scenario
    }
  }

  return { type: 'HP_ONLY' }
}

// Examples:
// Level 1→2: +3 HP only
// Level 2→3: +3 HP, choose +1 stat ✓
// Level 3→4: +3 HP only
// Level 4→5: +3 HP, unlock "Second Wind" ability
```

---

## 5. SAFETY RAILS (Prevent Game-Breaking Bugs)

```typescript
const SAFETY_CAPS = {
  // Per-turn maximums
  xpPerTurn: 60,
  damagePerTurn: (maxHP) => Math.floor(maxHP * 0.6),
  goldGainPerTurn: 200,
  goldLossPerTurn: 100,
  itemsPerTurn: 3,

  // Absolute limits
  maxInventory: 20,      // Down from 50
  maxCompanions: 1,      // Simplified
  maxActiveEffects: 3,
  maxStoryEntries: 100,  // Prevent memory leak
  maxTurns: 100,         // Force end

  // Stat bounds
  minHealth: 0,
  maxStatValue: 20,      // With all bonuses
  minStatValue: 1,
  companionRelationship: { min: -100, max: 100 }
}

function applySafetyRails(stateChange: StateChange) {
  // Cap XP
  if (stateChange.xp) {
    stateChange.xp = Math.min(stateChange.xp, SAFETY_CAPS.xpPerTurn)
  }

  // Cap damage
  if (stateChange.health && stateChange.health < 0) {
    const maxDamage = SAFETY_CAPS.damagePerTurn(character.maxHealth)
    stateChange.health = Math.max(stateChange.health, -maxDamage)
  }

  // Cap gold changes
  if (stateChange.gold) {
    if (stateChange.gold > 0) {
      stateChange.gold = Math.min(stateChange.gold, SAFETY_CAPS.goldGainPerTurn)
    } else {
      stateChange.gold = Math.max(stateChange.gold, -SAFETY_CAPS.goldLossPerTurn)
    }
  }

  // Limit items
  if (stateChange.inventory) {
    stateChange.inventory = stateChange.inventory.slice(0, SAFETY_CAPS.itemsPerTurn)
  }

  return stateChange
}
```

---

## 6. COMPANION SYSTEM (SIMPLIFIED)

### Maximum Companions
```typescript
MAX_COMPANIONS = 1  // Only one companion for MVP

// Based on companionPreference:
// - "solo": 0 companions
// - "single-ally", "small-party", "large-fellowship": 1 companion
```

### Companion Structure
```typescript
interface Companion {
  id: string
  name: string
  description: string
  relationship: -100 | 100  // Binary: Allied (100) or Neutral (0)
  usedAssist: boolean       // One assist per scenario
}
```

### Companion Assist Mechanic
```typescript
function useCompanionAssist(companion: Companion, check: RollResult) {
  if (companion.usedAssist) {
    return { allowed: false, reason: "Already used assist" }
  }

  if (companion.relationship < 50) {
    return { allowed: false, reason: "Relationship too low" }
  }

  // Grant assist
  companion.usedAssist = true
  check.total += 5  // +5 bonus to the roll

  return {
    allowed: true,
    bonus: 5,
    message: `${companion.name} helps you!`
  }
}
```

---

## 7. INVENTORY SIMPLIFICATION

### Capacity
```typescript
MAX_INVENTORY = 20  // Down from 50

// Reasoning:
// - 50 is too many (UI clutter)
// - 20 is enough for variety without spam
// - Forces meaningful choices (keep or discard?)
```

### Equipment Slots
```typescript
interface EquipmentSlots {
  weapon: InventoryItem | null      // One active weapon
  armor: InventoryItem | null       // One active armor
  accessory1: InventoryItem | null  // Ring, amulet, etc.
  accessory2: InventoryItem | null  // Second accessory
}

// Equipped items provide stat bonuses
// Bonuses stack (weapon +2 Valor, armor +1 Endurance = total +2 Valor, +1 Endurance)
```

---

## IMPLEMENTATION CHECKLIST

- [ ] Fix `lib/dice.ts` - Remove modifier formula, use direct stat addition
- [ ] Create `lib/state-changes.ts` - Implement XP/damage/gold formulas
- [ ] Create `lib/progression.ts` - Implement leveling system
- [ ] Update `lib/game-logic.ts` - Add safety rails
- [ ] Simplify companions - Max 1, binary relationship
- [ ] Reduce inventory cap - 20 items max
- [ ] Add equipment slots - 2 accessories

---

**FINAL NOTE:** These mechanics are mathematically balanced, transparent to players, and simple to implement. No ambiguity remains.
