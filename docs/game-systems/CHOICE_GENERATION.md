# Choice Generation System - Implementation Specification

**Status:** FINAL - Ready for AI Prompts
**Priority:** CRITICAL - Core gameplay loop depends on this

---

## THE 4-CHOICE TEMPLATE

Every turn must generate **exactly 3-4 choices** following this pattern:

###

 Position 1: PRIMARY STAT CHOICE
- **Uses:** Character's highest stat
- **Action Type:** Matches character archetype
- **DC:** `characterStatValue + 7` (target 60% success)
- **Risk:** Moderate
- **Purpose:** Make player feel competent

**Example (Valor 8 character):**
```json
{
  "id": "choice-1",
  "text": "Charge into battle with your sword drawn",
  "actionType": "combat",
  "requiresRoll": true,
  "stat": "valor",
  "dc": 15,
  "riskLevel": "moderate",
  "consequence": "Take damage if you fail"
}
```

### Position 2: SECONDARY STAT CHOICE
- **Uses:** Character's 2nd or 3rd highest stat
- **Action Type:** Different from Position 1
- **DC:** `characterStatValue + 8` (target 50% success)
- **Risk:** Moderate to Dangerous
- **Purpose:** Offer variety and challenge

**Example (Fellowship 6 character):**
```json
{
  "id": "choice-2",
  "text": "Attempt to negotiate with the enemy leader",
  "actionType": "social",
  "requiresRoll": true,
  "stat": "fellowship",
  "dc": 14,
  "riskLevel": "dangerous",
  "consequence": "They may attack if you fail to convince them"
}
```

### Position 3: SAFE/NARRATIVE CHOICE
- **Uses:** No stat roll required
- **Action Type:** "narrative"
- **No DC or risk**
- **Purpose:** Reduce anxiety, always available escape hatch

**Example:**
```json
{
  "id": "choice-3",
  "text": "Retreat and observe from a safe distance",
  "actionType": "narrative",
  "requiresRoll": false,
  "riskLevel": "safe",
  "consequence": "Progress the story without immediate danger"
}
```

### Position 4: WILDCARD CHOICE
- **Uses:** Varies - could be low stat (challenge), creative solution, or scenario-specific
- **Action Type:** Any
- **DC:** Variable
- **Risk:** Variable
- **Purpose:** Surprise, creativity, or leverage scenario's unique element

**Example (using scenario's unique element):**
```json
{
  "id": "choice-4",
  "text": "Consult your magical map that changes with the moon",
  "actionType": "investigation",
  "requiresRoll": true,
  "stat": "lore",
  "dc": 12,
  "riskLevel": "safe",
  "consequence": "May reveal a hidden path"
}
```

---

## ACTION TYPE DISTRIBUTION

### Based on Combat Frequency

```typescript
function getActionTypeDistribution(combatFrequency: number) {
  // combatFrequency: 1-5 scale

  if (combatFrequency === 1) {
    // Minimal combat - max 0-1 combat choices per turn
    return {
      combat: 0.1,      // 10% of choices
      social: 0.3,      // 30%
      investigation: 0.3,
      craft: 0.1,
      stealth: 0.1,
      narrative: 0.1
    }
  }

  if (combatFrequency === 3) {
    // Moderate combat - 1-2 combat choices per turn
    return {
      combat: 0.4,      // 40% of choices
      social: 0.2,
      investigation: 0.2,
      craft: 0.05,
      stealth: 0.1,
      narrative: 0.05
    }
  }

  if (combatFrequency === 5) {
    // Constant combat - 2-3 combat choices per turn
    return {
      combat: 0.7,      // 70% of choices
      social: 0.05,
      investigation: 0.1,
      craft: 0.05,
      stealth: 0.05,
      narrative: 0.05
    }
  }
}
```

### Stat-to-ActionType Mapping

```typescript
const STAT_ACTION_AFFINITY = {
  valor: ['combat', 'survival'],
  wisdom: ['investigation', 'survival'],
  fellowship: ['social', 'narrative'],
  craft: ['craft', 'stealth'],
  endurance: ['survival', 'combat'],
  lore: ['investigation', 'craft']
}

function getPreferredActions(character: Character) {
  // Sort stats highest to lowest
  const sortedStats = Object.entries(character.stats)
    .sort(([, a], [, b]) => b - a)

  // Get top 2 stats
  const [highestStat] = sortedStats[0]
  const [secondStat] = sortedStats[1]

  // Return preferred action types
  return {
    primary: STAT_ACTION_AFFINITY[highestStat],
    secondary: STAT_ACTION_AFFINITY[secondStat]
  }
}
```

---

## DC ASSIGNMENT RULES

### Formula

```typescript
function assignDC(characterStatValue: number, position: number) {
  if (position === 1) {
    // Primary stat choice - 60% success rate
    return characterStatValue + 7
  }

  if (position === 2) {
    // Secondary stat choice - 50% success rate
    return characterStatValue + 8
  }

  if (position === 4) {
    // Wildcard - varies
    // Use average of character's stats + 7
    const avgStat = Math.floor(
      Object.values(character.stats).reduce((a, b) => a + b) / 6
    )
    return avgStat + 7
  }

  // Position 3 is safe, no DC
  return null
}
```

### DC Bounds

```typescript
// Never go below 8 (too easy, trivial)
// Never go above 18 (too hard, frustrating)
const clampedDC = Math.max(8, Math.min(18, calculatedDC))
```

---

## RISK LEVEL ASSIGNMENT

```typescript
function assignRiskLevel(actionType: string, dc: number, statValue: number) {
  // Calculate success rate
  const successRate = (20 - (dc - statValue) + 1) / 20

  if (actionType === 'narrative' || !dc) {
    return 'safe'
  }

  if (successRate >= 0.70) {
    return 'safe'      // 70%+ success
  }

  if (successRate >= 0.50) {
    return 'moderate'  // 50-70% success
  }

  return 'dangerous'   // <50% success
}
```

---

## CONSEQUENCE TEXT REQUIREMENTS

**All non-safe choices MUST have consequence text!**

### Templates

```typescript
const CONSEQUENCE_TEMPLATES = {
  combat: {
    success: "Defeat the enemy",
    failure: "Take damage"
  },
  social: {
    success: "Win them over",
    failure: "Anger them, possible combat"
  },
  investigation: {
    success: "Discover valuable information",
    failure: "Miss important clues"
  },
  craft: {
    success: "Create/fix something useful",
    failure: "Waste materials or time"
  },
  stealth: {
    success: "Remain undetected",
    failure: "Get caught, trigger combat"
  },
  survival: {
    success: "Find safe passage",
    failure: "Take environmental damage"
  }
}

function generateConsequence(actionType, riskLevel) {
  const template = CONSEQUENCE_TEMPLATES[actionType]

  if (riskLevel === 'safe') {
    return template.success
  }

  if (riskLevel === 'moderate') {
    return `${template.success} or ${template.failure}`
  }

  if (riskLevel === 'dangerous') {
    return `High risk: ${template.failure} likely`
  }
}
```

---

## CHOICE QUALITY CHECKLIST

Before returning choices to player, validate:

```typescript
function validateChoices(choices: EnhancedChoice[]) {
  const errors = []

  // Count check
  if (choices.length < 3 || choices.length > 4) {
    errors.push('Must have 3-4 choices')
  }

  // Uniqueness check
  const texts = choices.map(c => c.text.toLowerCase())
  if (new Set(texts).size !== texts.length) {
    errors.push('Duplicate choice texts detected')
  }

  // Safe option check
  const hasSafe = choices.some(c => c.riskLevel === 'safe')
  if (!hasSafe) {
    errors.push('Must include at least one safe option')
  }

  // Consequence check
  const missingConsequence = choices.filter(c =>
    c.requiresRoll && !c.consequence
  )
  if (missingConsequence.length > 0) {
    errors.push('Risky choices missing consequence text')
  }

  // Action type variety
  const actionTypes = choices.map(c => c.actionType)
  if (new Set(actionTypes).size === 1) {
    errors.push('All choices have same action type (boring)')
  }

  // Character stat utilization
  const highestStat = getHighestStat(character)
  const usesHighStat = choices.some(c => c.stat === highestStat)
  if (!usesHighStat) {
    errors.push(`No choice uses character's highest stat (${highestStat})`)
  }

  return errors
}
```

---

## AI PROMPT INTEGRATION

### System Prompt Addition

```markdown
CHOICE GENERATION RULES:

1. Always generate EXACTLY 3-4 choices
2. Follow the 4-choice template:
   - Choice 1: Uses character's highest stat, DC = stat + 7
   - Choice 2: Uses character's 2nd/3rd stat, DC = stat + 8
   - Choice 3: Safe narrative option, no roll required
   - Choice 4: Wildcard (creative or uses scenario element)

3. Distribution based on combat frequency:
   - Frequency 1: Max 0-1 combat choices
   - Frequency 3: 1-2 combat choices
   - Frequency 5: 2-3 combat choices

4. All risky choices MUST include consequence text

5. DCs must be between 8-18

6. At least one choice must be risk level "safe"

CHARACTER STATS (sorted by value):
${Object.entries(character.stats).sort(([,a],[,b]) => b - a).map(([stat, val]) => `${stat}: ${val}`).join(', ')}

HIGHEST STAT: ${highestStat} (${character.stats[highestStat]})
```

### Validation in API Route

```typescript
// In /api/process-turn/route.ts

const aiResponse = await generateText({...})
const parsed = JSON.parse(aiResponse.text)

// Validate choices
const errors = validateChoices(parsed.choices)

if (errors.length > 0) {
  console.error('Choice validation failed:', errors)

  // Retry once with error feedback
  const retryPrompt = `Previous choices failed validation: ${errors.join(', ')}. Please regenerate following the rules exactly.`

  const retryResponse = await generateText({
    ...previousConfig,
    prompt: retryPrompt
  })

  // If retry also fails, use fallback
  if (validateChoices(retryParsed.choices).length > 0) {
    return useFallbackChoices(character)
  }
}
```

---

## FALLBACK CHOICES (When AI Fails)

```typescript
function generateFallbackChoices(character: Character, scenario: Scenario) {
  const highestStat = getHighestStat(character)
  const secondStat = getSecondHighestStat(character)

  return [
    {
      id: 'fallback-1',
      text: `Use your ${highestStat} to press forward`,
      actionType: STAT_ACTION_AFFINITY[highestStat][0],
      requiresRoll: true,
      stat: highestStat,
      dc: character.stats[highestStat] + 7,
      riskLevel: 'moderate',
      consequence: 'Face the challenge ahead'
    },
    {
      id: 'fallback-2',
      text: `Try a different approach using ${secondStat}`,
      actionType: STAT_ACTION_AFFINITY[secondStat][0],
      requiresRoll: true,
      stat: secondStat,
      dc: character.stats[secondStat] + 8,
      riskLevel: 'moderate',
      consequence: 'May be risky'
    },
    {
      id: 'fallback-3',
      text: 'Proceed cautiously and observe',
      actionType: 'narrative',
      requiresRoll: false,
      riskLevel: 'safe',
      consequence: 'Continue the story safely'
    }
  ]
}
```

---

## EXAMPLES BY CHARACTER TYPE

### Example 1: Combat Character (Valor 8, Endurance 7, Fellowship 4)

```json
[
  {
    "id": "1",
    "text": "Charge the orc warriors head-on",
    "actionType": "combat",
    "requiresRoll": true,
    "stat": "valor",
    "dc": 15,
    "riskLevel": "moderate",
    "consequence": "Take damage if you fail"
  },
  {
    "id": "2",
    "text": "Withstand their assault and hold the line",
    "actionType": "combat",
    "requiresRoll": true,
    "stat": "endurance",
    "dc": 15,
    "riskLevel": "moderate",
    "consequence": "Take damage but protect allies"
  },
  {
    "id": "3",
    "text": "Fall back to a defensive position",
    "actionType": "narrative",
    "requiresRoll": false,
    "riskLevel": "safe"
  },
  {
    "id": "4",
    "text": "Try to intimidate them into fleeing",
    "actionType": "social",
    "requiresRoll": true,
    "stat": "fellowship",
    "dc": 14,
    "riskLevel": "dangerous",
    "consequence": "They may attack harder if you fail"
  }
]
```

### Example 2: Social Character (Fellowship 8, Wisdom 7, Valor 4)

```json
[
  {
    "id": "1",
    "text": "Convince the guard to let you pass",
    "actionType": "social",
    "requiresRoll": true,
    "stat": "fellowship",
    "dc": 15,
    "riskLevel": "moderate",
    "consequence": "Alert raised if you fail"
  },
  {
    "id": "2",
    "text": "Read his body language for weaknesses",
    "actionType": "investigation",
    "requiresRoll": true,
    "stat": "wisdom",
    "dc": 15,
    "riskLevel": "safe",
    "consequence": "Learn useful information"
  },
  {
    "id": "3",
    "text": "Wait for a better opportunity",
    "actionType": "narrative",
    "requiresRoll": false,
    "riskLevel": "safe"
  },
  {
    "id": "4",
    "text": "Attempt to sneak past while he's distracted",
    "actionType": "stealth",
    "requiresRoll": true,
    "stat": "craft",
    "dc": 13,
    "riskLevel": "dangerous",
    "consequence": "Combat if caught"
  }
]
```

---

## IMPLEMENTATION CHECKLIST

- [ ] Add choice validation to API routes
- [ ] Implement 4-choice template in AI prompts
- [ ] Add DC calculation formulas
- [ ] Add consequence text generation
- [ ] Create fallback choice generator
- [ ] Test with different character archetypes

---

**This specification ensures EVERY choice set is balanced, meaningful, and tailored to the player's character.**
