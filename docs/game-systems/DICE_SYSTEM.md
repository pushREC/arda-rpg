# ARDA RPG - Dice System Documentation

**Version:** 1.0
**Status:** Production
**Last Updated:** January 2025

---

## Overview

ARDA RPG uses a **d20 system** with a custom **3-8 stat scale** (NOT D&D's 10-20 scale). This document defines the exact mathematical formulas for stat modifiers, difficulty classes, and dice roll resolution.

**All formulas are implemented in `lib/rules.ts`.**

---

## Stat System: The "Middle-earth Math"

### Stat Value Range

| Stat Value | Description | Modifier | Examples |
|------------|-------------|----------|----------|
| 3 | Weak | +0 | Untrained, disadvantaged |
| 4 | Below Average | +1 | Some experience |
| 5 | Average | +2 | Competent |
| 6 | Above Average | +3 | Skilled |
| 7 | Exceptional | +4 | Expert |
| 8 | Legendary | +5 | Master, hero-level |

### Modifier Calculation

**Formula:** `modifier = stat_value - 3`

**Implementation:**
```typescript
import { getStatModifier } from "./lib/rules"

const valorStat = 5
const modifier = getStatModifier(valorStat) // Returns +2
```

**Examples:**
- Character with Valor 3 → Modifier +0 (roll is pure d20)
- Character with Craft 5 → Modifier +2 (roll is d20 + 2)
- Character with Wisdom 8 → Modifier +5 (roll is d20 + 5)

**Why this matters:**
- D&D uses 10-20 stats with modifiers from -5 to +10
- ARDA uses 3-8 stats with modifiers from 0 to +5
- This creates a tighter probability curve and makes every stat point feel impactful

---

## Difficulty Classes (DC)

### Standard DCs

| Difficulty | DC | Success Rate (Stat 3) | Success Rate (Stat 5) | Success Rate (Stat 8) |
|------------|----|-----------------------|-----------------------|-----------------------|
| Easy | 8 | 65% | 75% | 80% |
| Medium | 12 | 45% | 55% | 60% |
| Hard | 16 | 25% | 35% | 40% |

**Formula:**
```typescript
import { calculateDC } from "./lib/rules"

const easyDC = calculateDC("easy")     // Returns 8
const mediumDC = calculateDC("medium") // Returns 12
const hardDC = calculateDC("hard")     // Returns 16
```

### When to Use Each DC

**Easy (DC 8):**
- Routine tasks with time pressure
- Basic social interactions
- Simple investigations
- Climbing a ladder, picking a simple lock

**Medium (DC 12):**
- Challenging tasks requiring skill
- Persuading a skeptical NPC
- Spotting a hidden trap
- Lockpicking a reinforced door

**Hard (DC 16):**
- Expert-level challenges
- Convincing an enemy to stand down
- Detecting magical illusions
- Disarming a complex trap

---

## Dice Roll Resolution

### Roll Formula

```
Total = d20 + getStatModifier(stat_value)
Success = (Total >= DC)
```

### Example Scenarios

**Scenario 1: Lockpicking a Door (Medium DC)**
- Character has Craft 6
- DC = 12 (Medium)
- Modifier = getStatModifier(6) = +3
- Player rolls d20: **10**
- Total = 10 + 3 = **13**
- **Success!** (13 >= 12)

**Scenario 2: Spotting an Ambush (Hard DC)**
- Character has Wisdom 4
- DC = 16 (Hard)
- Modifier = getStatModifier(4) = +1
- Player rolls d20: **14**
- Total = 14 + 1 = **15**
- **Failure!** (15 < 16)

**Scenario 3: Intimidating a Guard (Easy DC)**
- Character has Valor 8
- DC = 8 (Easy)
- Modifier = getStatModifier(8) = +5
- Player rolls d20: **2**
- Total = 2 + 5 = **7**
- **Failure!** (7 < 8) - Even heroes can fail!

---

## Stat to Action Type Mapping

| Stat | Primary Use Cases | Example Challenges |
|------|-------------------|-------------------|
| **Valor** | Combat, intimidation, courage | Melee attack, resist fear, break down door |
| **Wisdom** | Perception, insight, nature | Spot trap, understand motives, track animal |
| **Fellowship** | Persuasion, negotiation, leadership | Convince merchant, rally allies, deceive guard |
| **Craft** | Lockpicking, stealth, ranged attacks | Pick lock, move silently, shoot bow |
| **Endurance** | Resist poison, marathon marches, survival | Resist disease, climb mountain, hold breath |
| **Lore** | History, magic, languages, puzzles | Decipher runes, identify artifact, recall legend |

---

## Probability Analysis

### Critical Success & Failure

**Critical Success (Natural 20):**
- Always succeeds regardless of DC
- Exceptional outcome (extra damage in combat, major breakthrough in investigation)
- 5% chance on any roll

**Critical Failure (Natural 1):**
- Always fails regardless of modifier
- Potential complication (weapon breaks, trap triggers, guard alerted)
- 5% chance on any roll

### Probability by Stat Value

**Chance to beat DC 12 (Medium difficulty):**
- Stat 3 (+0): 45% (need 12-20 on d20)
- Stat 4 (+1): 50% (need 11-20 on d20)
- Stat 5 (+2): 55% (need 10-20 on d20)
- Stat 6 (+3): 60% (need 9-20 on d20)
- Stat 7 (+4): 65% (need 8-20 on d20)
- Stat 8 (+5): 70% (need 7-20 on d20)

**Key Insight:** A +1 stat increase gives +5% success rate. Every point matters!

---

## Implementation for Backend Developers

### Processing Dice Rolls from Frontend

The frontend sends dice roll results in the API request:

```typescript
{
  "diceRoll": {
    "stat": "craft",
    "roll": 14,           // Raw d20 roll
    "modifier": 3,        // From getStatModifier(6)
    "total": 17,          // 14 + 3
    "dc": 12,             // Medium difficulty
    "success": true       // 17 >= 12
  }
}
```

**Your AI narrative MUST respect the success/failure:**

```typescript
if (diceRoll.success) {
  // Narrative: "You skillfully pick the lock..."
  // State Changes: Grant XP, progress quest, no damage
} else {
  // Narrative: "The lock resists your efforts..."
  // State Changes: Minor setback, possible damage, alternative path
}
```

### Generating Choices with Dice Rolls

When creating `EnhancedChoice` objects, specify which stat is required:

```typescript
{
  id: "choice-1",
  text: "Try to sneak past the guards",
  actionType: "stealth",
  requiresRoll: true,
  stat: "craft",              // Use Craft for stealth
  dc: 12,                     // Medium difficulty
  riskLevel: "moderate",
  consequence: "If you fail, combat may ensue"
}
```

**Frontend will:**
1. Calculate modifier using `getStatModifier(character.stats.craft)`
2. Roll d20
3. Calculate total and success
4. Send result to API

---

## Edge Cases & Special Rules

### Contested Rolls

When two characters oppose each other (e.g., stealth vs perception):
- Both roll d20 + modifier
- Higher total wins
- Ties favor the active character (the one attempting the action)

### Advantage/Disadvantage (Future)

Not currently implemented, but reserved for future use:
- **Advantage:** Roll 2d20, take higher result
- **Disadvantage:** Roll 2d20, take lower result

### Passive Checks (Not Used)

Unlike D&D, ARDA does not use passive perception scores. All checks are active rolls.

---

## Testing Your Implementation

### Verification Checklist

```typescript
import { getStatModifier, calculateDC } from "./lib/rules"

// Test 1: Stat Modifier Boundary Cases
console.assert(getStatModifier(3) === 0, "Stat 3 should give +0")
console.assert(getStatModifier(5) === 2, "Stat 5 should give +2")
console.assert(getStatModifier(8) === 5, "Stat 8 should give +5")

// Test 2: DC Values
console.assert(calculateDC("easy") === 8, "Easy DC should be 8")
console.assert(calculateDC("medium") === 12, "Medium DC should be 12")
console.assert(calculateDC("hard") === 16, "Hard DC should be 16")

// Test 3: Roll Resolution
const testRoll = {
  roll: 10,
  modifier: getStatModifier(6), // +3
  total: 13,
  dc: calculateDC("medium"),    // 12
  success: 13 >= 12             // true
}
console.assert(testRoll.success === true, "Roll 10 + mod 3 should beat DC 12")
```

---

## See Also

- `lib/rules.ts` - Implementation of all formulas
- `lib/types.ts` - TypeScript type definitions
- `BACKEND_HANDOFF.md` - API integration guide
- `docs/game-systems/STATE_CHANGE_RULES.md` - Damage, XP, and rewards
