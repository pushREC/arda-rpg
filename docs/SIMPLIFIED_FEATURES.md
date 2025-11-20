# Simplified Features - What to Keep vs Cut

**Purpose:** Reduce complexity by 30-40% while preserving 95% of player value
**Status:** FINAL DECISION - Ready for Implementation

---

## ✅ KEEP (Core Experience)

### 1. Character Creation System
- ✅ 6-stat system (valor, wisdom, fellowship, craft, endurance, lore)
- ✅ Point buy (27 points, stats 3-8)
- ✅ 4 races with bonuses (human, elf, dwarf, hobbit)
- ✅ 5 backgrounds with bonuses and equipment
- **Complexity:** Medium | **Value:** High | **Verdict:** KEEP

### 2. Scenario Selection
- ✅ Quick Start (1 button → AI generates → play)
- ✅ 4 Preset Scenarios (curated, instant start)
- ✅ Simplified Vibe (pick vibes → AI generates 1 scenario → play)
- **Complexity:** Low-Medium | **Value:** High | **Verdict:** KEEP

### 3. Core Game Loop
- ✅ AI-generated narrative (100-200 words)
- ✅ 3-4 choices per turn
- ✅ Dice rolling (stat + d20 vs DC)
- ✅ State changes (HP, gold, XP, items)
- **Complexity:** Medium | **Value:** High | **Verdict:** KEEP

### 4. Progression System
- ✅ XP gain from actions
- ✅ Level up (every 100-200 XP)
- ✅ HP increase per level (+3 HP)
- ✅ Stat increase every 3 levels (+1 to chosen stat)
- **Complexity:** Medium | **Value:** High | **Verdict:** KEEP

### 5. Inventory System (SIMPLIFIED)
- ✅ Collect items (weapons, armor, potions, quest items)
- ✅ Equipment slots (1 weapon, 1 armor, 2 accessories)
- ✅ Item effects (stat bonuses, healing, buffs)
- ✅ **Cap at 20 items** (down from 50)
- **Complexity:** Medium | **Value:** Medium | **Verdict:** KEEP BUT SIMPLIFY

### 6. Economy
- ✅ Gold currency
- ✅ Item values
- ✅ Selling items (50% value)
- ❌ No shops (too complex for MVP)
- **Complexity:** Low | **Value:** Medium | **Verdict:** KEEP (minimal)

### 7. Save/Load System
- ✅ Auto-save (localStorage)
- ✅ 3 manual save slots
- ✅ Load game from save select
- **Complexity:** Medium | **Value:** High | **Verdict:** KEEP

---

## ⚠️ SIMPLIFY (Reduce Complexity)

### 1. Companion System
**Current:** Multiple companions, relationship -100 to +100, unclear benefits

**Simplified:**
- ⚠️ **One companion maximum**
- ⚠️ Relationship: Binary (Allied = 100, or Neutral = 0)
- ⚠️ Benefit: One "assist" per scenario (+5 to one roll)
- ⚠️ Simple tracking (name, description, usedAssist boolean)

**Complexity:** High → Low | **Value:** Low → Medium | **Verdict:** SIMPLIFY

### 2. Vibe-First Scenario Creation
**Current:** Pick 3 vibes → AI generates 3 scenarios → pick one → refine → play

**Simplified:**
- ⚠️ Pick 3 vibes → AI generates **1 scenario** → play
- ⚠️ Remove "refine" step (adds complexity)
- ⚠️ Remove "choose from 3" step (decision fatigue)

**Complexity:** Medium → Low | **Value:** Medium → Medium | **Verdict:** SIMPLIFY

### 3. Active Effects (Buffs/Debuffs)
**Current:** Unlimited effects, complex stat modifications

**Simplified:**
- ⚠️ Max 3 active effects at once
- ⚠️ Simple stat bonuses only (no complex interactions)
- ⚠️ Clear expiration (turn count visible)

**Complexity:** High → Medium | **Value:** Medium | **Verdict:** SIMPLIFY

### 4. Inventory Capacity
**Current:** 50 items (too many, UI clutter)

**Simplified:**
- ⚠️ **20 items maximum**
- ⚠️ Force discard decisions (meaningful choice)
- ⚠️ Less AI spam (generate items less frequently)

**Complexity:** High → Medium | **Value:** Medium | **Verdict:** SIMPLIFY

---

## 🚨 CUT (Remove Entirely for MVP)

### 1. Mid-Game Scenario Adjustments ❌
**Current:** Player can change tone/combat frequency during game

**Problem:**
- Jarring narrative shifts (dark → hopeful feels inconsistent)
- AI struggles to blend smoothly ("gradually over 3-5 turns" is vague)
- High complexity for low value
- Player confusion ("why isn't it changing faster?")

**Solution:**
- ❌ **Cut entirely** - choose tone at start only
- If player doesn't like it, restart scenario
- Simpler, clearer, more consistent

**Complexity Removed:** High | **Value Lost:** Low | **Verdict:** CUT

### 2. Quest Tracker UI Component ❌
**Current:** Separate UI component tracking objectives

**Problem:**
- Quest objectives are implicit in narrative
- Redundant information
- UI clutter
- Player already knows what they're doing

**Solution:**
- ❌ **Cut the UI component**
- Quest progress handled via narrative
- State changes indicate objective completion
- Less cognitive load

**Complexity Removed:** Medium | **Value Lost:** Low | **Verdict:** CUT

### 3. Achievement System ❌
**Current:** 6 achievements, localStorage tracking, modals

**Problem:**
- Nice-to-have, not core experience
- Interrupts flow (modals)
- Adds code complexity
- No mechanical benefit

**Solution:**
- ❌ **Cut entirely for MVP**
- Can add post-launch if desired
- Focus on core loop first

**Complexity Removed:** Low | **Value Lost:** Low | **Verdict:** CUT

### 4. Full Custom Scenario Builder ❌
**Current:** 7-step wizard (region, location, quest, urgency, stakes, tones, combat, companions, unique element)

**Problem:**
- **7 steps is TOO MANY** (player fatigue)
- Low completion rate (estimated 30%)
- Choice paralysis (what's the difference between "building" and "slow-burn" urgency?)
- 3-5 minutes before game even starts
- High complexity, low value

**Solution:**
- ❌ **Cut the 7-step wizard**
- ✅ Keep Quick Start and Vibe-First (simpler)
- ✅ Keep 4 Presets (instant play)
- Alternative if needed: "Pick Region → AI generates → play" (2 steps max)

**Complexity Removed:** VERY HIGH | **Value Lost:** Low | **Verdict:** CUT

### 5. Multiple Companions ❌
**Current:** Support for 4-6 companions based on preference

**Problem:**
- Cognitive load (remember 4-6 NPCs)
- Relationship tracking complex
- Unclear mechanical benefit
- UI clutter in character panel

**Solution:**
- ❌ **Cut multiple companions**
- ✅ Keep one companion max (see "SIMPLIFY" section)

**Complexity Removed:** High | **Value Lost:** Medium | **Verdict:** CUT (keep 1 max)

### 6. Shopping/Merchant System ❌
**Current:** Not implemented, but hinted at in code

**Problem:**
- Adds entire layer of complexity
- Requires merchant NPCs, shop inventory, pricing
- Requires UI for shop interface
- Not core to the experience (finding loot is more exciting)

**Solution:**
- ❌ **Do not implement** for MVP
- Items found through exploration only
- Can add post-launch if economy becomes important

**Complexity Removed:** High | **Value Lost:** Low | **Verdict:** CUT

---

## 📊 COMPLEXITY REDUCTION ANALYSIS

### Before Simplification

| System | Complexity |
|--------|-----------|
| Character creation | Medium |
| Scenario builder | VERY HIGH |
| Core game loop | Medium |
| Companions | High |
| Inventory (50 items) | High |
| Active effects | High |
| Mid-game adjustments | High |
| Quest tracker | Medium |
| Achievements | Low |
| Progression | Medium |
| Save/Load | Medium |
| **TOTAL** | **Very High** |

### After Simplification

| System | Complexity |
|--------|-----------|
| Character creation | Medium |
| Scenario selection | LOW ✅ |
| Core game loop | Medium |
| Companions (1 max) | LOW ✅ |
| Inventory (20 items) | MEDIUM ✅ |
| Active effects (3 max) | MEDIUM ✅ |
| ~~Mid-game adjustments~~ | ❌ CUT |
| ~~Quest tracker~~ | ❌ CUT |
| ~~Achievements~~ | ❌ CUT |
| Progression | Medium |
| Save/Load | Medium |
| **TOTAL** | **Medium** ✅ |

**Complexity Reduced:** ~40%
**Value Retained:** ~95%

---

## 🎯 MVP FEATURE LIST (Final)

### Character Creation
- Point buy stat system
- 4 races, 5 backgrounds
- Starting equipment

### Scenario Selection (3 Paths)
1. Quick Start (instant)
2. Preset (4 curated)
3. Vibe-First (pick vibes → play)

### Core Gameplay
- AI narrative generation
- 3-4 choices per turn
- Dice rolling (stat + d20 vs DC)
- State changes (HP, gold, XP, items)

### Progression
- XP gain
- Leveling (+3 HP, +1 stat every 3 levels)
- Item equipment (stat bonuses)

### Systems
- Inventory (20 items, 4 equipment slots)
- One companion (optional, 1 assist per scenario)
- Active effects (max 3)
- Save/Load (auto + 3 manual)

### Victory Conditions
- Keyword detection ("quest complete", "victory")
- Turn limit for presets (20 turns)

**That's it. Clean, focused, achievable.**

---

## 🔄 POST-MVP FEATURES (Future Consideration)

These can be added AFTER MVP is stable:

1. **Achievements** (low complexity, low priority)
2. **Shopping system** (medium complexity, medium priority)
3. **Multiple companions** (high complexity, medium priority)
4. **Mid-game adjustments** (high complexity, low priority)
5. **Full custom scenario builder** (very high complexity, low priority)
6. **Abilities system** (medium complexity, high priority) ⭐
7. **Prestige classes** (high complexity, medium priority)
8. **Multiplayer scenarios** (very high complexity, unknown priority)

---

## ✅ IMPLEMENTATION CHECKLIST

### Code to Remove
- [ ] Delete mid-game scenario adjustment UI (`scenario-adjustment-panel.tsx`)
- [ ] Delete quest tracker component (`quest-tracker.tsx`)
- [ ] Delete achievement modals and tracking (`achievements-modal.tsx`, `achievement-toast.tsx`, `lib/achievements.ts`)
- [ ] Delete full custom scenario wizard (keep only vibe-first with simplified flow)
- [ ] Simplify companion tracking (max 1, binary relationship)

### Code to Simplify
- [ ] Reduce MAX_INVENTORY from 50 to 20
- [ ] Limit active effects to 3 max
- [ ] Simplify vibe-first to generate 1 scenario instead of 3
- [ ] Remove relationship score complexity from companions

### Code to Keep
- [ ] All core game loop files
- [ ] Character creation
- [ ] Preset scenarios
- [ ] Quick start
- [ ] Dice rolling
- [ ] State management
- [ ] Save/Load

---

**This simplification removes ~30% of code while preserving the complete core experience.**
**Development time reduced, testing surface reduced, documentation needs reduced.**
**Focus on what matters: the core gameplay loop.**
