# Developer Onboarding - Tales of Middle-earth RPG

**Welcome!** This guide will get you up to speed in 30 minutes.

---

## 📚 Read These Documents (In Order)

### 1. Start Here: Overview
- **README.md** - Repository overview and deployment info
- **DEVELOPER_ONBOARDING.md** (this file) - Quick start guide

### 2. Product & Requirements
- **PRD.md** - Product requirements, MVP scope, tech stack decisions
- **BACKEND_HANDOFF.md** - API contracts, game rules, implementation guide

### 3. Optional (Post-MVP)
- **ZUSTAND_TO_CONTEXT_MIGRATION.md** - State management refactor guide
- **KNOWN_ISSUES.md** - Pre-existing TypeScript errors to fix

---

## ⚡ Quick Start (5 Minutes)

### 1. Clone & Install

```bash
# Clone the repository
git clone <repo-url>
cd arda-rpg

# Install dependencies (requires pnpm)
pnpm install

# Set environment variable
export OPENAI_API_KEY=sk-your-key-here

# Run development server
pnpm dev
```

Open http://localhost:3000

### 2. Project Structure

```
arda-rpg/
├── app/                        # Next.js App Router
│   ├── api/                    # Backend API routes (5 endpoints)
│   │   ├── generate-opening/   # Game start
│   │   ├── process-turn/       # Player actions (MOST IMPORTANT)
│   │   ├── generate-scenario/  # Quick/Vibe scenario creation
│   │   ├── complete-scenario/  # Full Custom AI assist
│   │   └── generate-options/   # Dynamic dropdowns
│   ├── character-creation/     # Character wizard
│   ├── custom-scenario/        # Scenario wizard
│   ├── game/                   # Main game screen
│   └── layout.tsx              # Root layout
├── components/                 # React components
│   ├── ui/                     # Radix UI components
│   ├── character-panel.tsx     # Stats, inventory, companions
│   └── ...                     # Game UI components
├── lib/                        # Shared utilities
│   ├── types.ts                # ALL TypeScript types (READ THIS!)
│   ├── game-state.ts           # Zustand store
│   ├── game-logic.ts           # Game mechanics
│   ├── character-data.ts       # Races, backgrounds, bonuses
│   ├── scenario-config.ts      # Game constants
│   ├── preset-scenarios.ts     # 4 preset scenarios
│   └── item-icons.tsx          # Item keyword mapping
├── styles/                     # Global CSS
├── public/                     # Static assets
├── PRD.md                      # Product requirements
├── BACKEND_HANDOFF.md          # API implementation guide
└── package.json                # Dependencies (cleaned up!)
```

---

## 🎯 Your Mission: Backend Development

### What's Already Done ✅

- ✅ Frontend UI (100% complete)
- ✅ Character creation wizard
- ✅ Scenario creation (3 paths)
- ✅ Game screen with inventory, stats, notifications
- ✅ Save/load system (localStorage)
- ✅ State management (Zustand)
- ✅ TypeScript types
- ✅ Game logic utilities

### What You Need to Build 🔨

Implement **5 API endpoints** with AI-powered logic:

1. **POST /api/generate-opening**
   - Input: Character + Scenario + CustomConfig
   - Output: Opening narrative (3-4 paragraphs) + 3-4 choices
   - AI Task: Generate engaging opening that matches scenario config

2. **POST /api/process-turn** ⭐ **MOST IMPORTANT**
   - Input: Character, Choice, History, Dice Roll Result, CustomConfig
   - Output: Narrative + Choices + State Changes (health, gold, XP, items)
   - AI Task: Continue story based on choice, apply dice roll outcome

3. **POST /api/generate-scenario**
   - Input: Method (quick/vibe-first), Character, Vibes
   - Output: 1 or 3 scenario options
   - AI Task: Generate scenarios matching vibes and character

4. **POST /api/complete-scenario**
   - Input: Partial CustomConfig, Character
   - Output: Complete CustomConfig
   - AI Task: Fill in missing fields with contextual values

5. **POST /api/generate-options**
   - Input: Type (locations/quest-hooks/companions/unique-elements), Context
   - Output: 4-5 contextual options
   - AI Task: Generate options fitting the region/location/tones

---

## 🔧 Tech Stack You'll Use

### AI Integration
- **Vercel AI SDK** (`ai` package) - Unified LLM interface
- **OpenAI GPT-4o-mini** - Cost-effective narrative generation
- **Environment:** `OPENAI_API_KEY` (required)

### Framework
- **Next.js 16.0.0** - App Router + API routes
- **React 19.2.0** - UI library
- **TypeScript 5.x** - Type safety

### Key Libraries
- **Zustand** - State management (will migrate to Context post-MVP)
- **Tailwind CSS** - Styling
- **Radix UI** - 8 accessible UI components
- **Sonner** - Toast notifications

**See PRD.md for complete tech stack details.**

---

## 📖 Critical Files to Read

### Before Coding

1. **lib/types.ts** - ALL TypeScript type definitions
   - `Character`, `Scenario`, `CustomScenarioConfig`
   - `EnhancedChoice`, `StoryEntry`, `InventoryItem`
   - Request/response types for all 5 endpoints

2. **BACKEND_HANDOFF.md** - Your implementation guide
   - Exact API contracts (input/output)
   - Game rules (6-stat system, dice mechanics)
   - State change logic
   - Edge cases to handle

3. **lib/scenario-config.ts** - Game constants
   - Available regions: `["Gondor", "Rohan", "Shire", ...]`
   - Available tones: `["dark", "hopeful", "mysterious", ...]`
   - Available vibes: `["ancient-mystery", "desperate-defense", ...]`

4. **lib/preset-scenarios.ts** - Example scenarios
   - 4 complete `CustomScenarioConfig` objects
   - Use as reference for structure

### For Reference

5. **lib/item-icons.tsx** - Item keyword mapping
   - **CRITICAL:** When generating items, use these keywords
   - Example: "Elven Dagger" (matches "dagger" → gets Feather icon)

6. **lib/game-logic.ts** - Frontend game logic
   - See how items are used, equipment applied, stats calculated

---

## 🚀 Development Workflow

### Day 1: Setup & Understanding

```bash
# 1. Install dependencies
pnpm install

# 2. Set API key
export OPENAI_API_KEY=sk-your-key-here

# 3. Read documentation
open PRD.md
open BACKEND_HANDOFF.md
open lib/types.ts

# 4. Run dev server
pnpm dev
```

### Day 2-3: Implement Endpoints

**Recommended Order:**

1. **Start with /api/generate-opening**
   - Simplest endpoint
   - Just generate narrative + choices
   - No state changes

2. **Then /api/generate-scenario**
   - Practice scenario generation
   - Learn CustomScenarioConfig structure

3. **Then /api/process-turn** ⭐
   - Most complex endpoint
   - Handles dice rolls, state changes, modifications
   - Test thoroughly!

4. **Then /api/complete-scenario**
   - Fill in missing fields
   - Contextual AI generation

5. **Finally /api/generate-options**
   - Simplest - just generate lists
   - Contextual to region/location

### Day 4: Testing

```bash
# Test flows:
# 1. Create character (all 4 races)
# 2. Start preset scenario
# 3. Play 10+ turns
# 4. Check health/gold/XP updates
# 5. Test dice rolls (success/failure)
# 6. Test mid-game adjustments
# 7. Create custom scenario
# 8. Test Quick Start
# 9. Test Vibe-First

# Build for production
pnpm build
```

---

## 🎲 Game Rules Quick Reference

### 6-Stat System (NOT D&D)

| Stat | Use Cases |
|------|-----------|
| **valor** | Combat, bravery, intimidation |
| **wisdom** | Perception, insight, nature |
| **fellowship** | Persuasion, negotiation, leadership |
| **craft** | Lockpicking, crafting, stealth, ranged attacks |
| **endurance** | Resisting poison, stamina, health pool |
| **lore** | History, magic, languages, puzzles |

### Dice Mechanics
- Roll: `d20 + stat modifier`
- Success: `total >= DC`
- DC: Easy 8-10, Medium 12-14, Hard 15-18

### Progression
- Health: `10 + (endurance × 2)`
- Level up: Every 100 XP
- XP rewards: 10-20 (minor), 30-40 (moderate), 50+ (major)

---

## ⚠️ Known Issues

See **KNOWN_ISSUES.md** for pre-existing TypeScript errors.

**Key Points:**
- These errors existed BEFORE dependency cleanup
- Not blockers for backend development
- Fix before production deployment
- Frontend works despite TypeScript errors (dev mode)

---

## 📞 Questions?

### Documentation

- **PRD.md** - Product requirements, tech stack
- **BACKEND_HANDOFF.md** - API implementation guide
- **KNOWN_ISSUES.md** - Pre-existing errors to fix

### Code References

- `lib/types.ts` - All type definitions
- `lib/scenario-config.ts` - Game constants
- `lib/preset-scenarios.ts` - Example scenarios
- `BACKEND_HANDOFF.md` - Edge cases, performance targets

### External Resources

**Vercel AI SDK:**
- Docs: https://sdk.vercel.ai/docs
- `generateText()`: https://sdk.vercel.ai/docs/reference/ai-sdk-core/generate-text

**OpenAI:**
- GPT-4o-mini: https://platform.openai.com/docs/models/gpt-4o-mini
- Prompt engineering: https://platform.openai.com/docs/guides/prompt-engineering

---

## ✅ Success Checklist

Your implementation is complete when:

- [ ] All 5 API endpoints return valid responses
- [ ] Dice roll results affect narrative (success vs failure)
- [ ] State changes are granular (specific amounts)
- [ ] Scenario modifications work mid-game
- [ ] Choices match character stats (high valor = combat options)
- [ ] Tone and combat frequency are consistent
- [ ] Quest completion can be detected
- [ ] Item names use icon keywords (see `lib/item-icons.tsx`)
- [ ] Edge cases handled (AI failures, corrupted data)
- [ ] `pnpm build` succeeds with no errors

---

## 🎯 MVP Launch Readiness

Before deploying to production:

1. ✅ Complete all 5 API endpoints
2. ✅ Fix TypeScript errors (see KNOWN_ISSUES.md)
3. ✅ Test all game flows
4. ✅ Verify state persistence (save/load)
5. ✅ Deploy to Vercel staging
6. ✅ QA testing
7. ✅ Production deployment

---

**Good luck! May your code be as legendary as the tales of Middle-earth!** 🧙‍♂️⚔️

---

## 📂 Quick Links

- [Product Requirements (PRD.md)](./PRD.md)
- [Backend Implementation Guide (BACKEND_HANDOFF.md)](./BACKEND_HANDOFF.md)
- [Known Issues (KNOWN_ISSUES.md)](./KNOWN_ISSUES.md)
- [Post-MVP Migration Guide (ZUSTAND_TO_CONTEXT_MIGRATION.md)](./ZUSTAND_TO_CONTEXT_MIGRATION.md)
- [Type Definitions (lib/types.ts)](./lib/types.ts)
- [Game Constants (lib/scenario-config.ts)](./lib/scenario-config.ts)
