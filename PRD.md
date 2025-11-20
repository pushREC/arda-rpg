# Tales of Middle-earth RPG - Product Requirements Document

**Version:** 1.0
**Date:** January 2025
**Status:** MVP Development

---

## 📋 Executive Summary

A single-player, AI-powered text RPG set in Middle-earth. Players create custom characters, embark on AI-generated adventures, and make choices that affect their journey through narrative, combat, and exploration.

---

## 🎯 MVP Scope

### Core Features (MUST HAVE)

1. **Character Creation System**
   - Custom 6-stat system (valor, wisdom, fellowship, craft, endurance, lore)
   - 4 races: Human, Elf, Dwarf, Hobbit
   - 5 backgrounds: Ranger, Scholar, Merchant, Soldier, Wanderer
   - Point-buy stat allocation (27 points total)
   - Race and background bonuses
   - Starting equipment based on background

2. **Scenario Creation (3 Paths)**
   - **Quick Start**: Auto-generated scenario based on character
   - **Vibe-First**: Choose 2-3 vibes, AI generates 3 scenario options
   - **Full Custom**: Manual configuration with AI assistance
   - 4 preset scenarios (Mirkwood, Helm's Deep, Moria, Lost Ring)

3. **Gameplay Loop**
   - AI-generated narrative text (2-4 paragraphs)
   - Player choices (3-4 options per turn)
   - Dice rolling for skill checks (d20 + stat modifier vs DC)
   - State changes (health, gold, XP, inventory, companions)
   - Quest progression and completion

4. **Character Management**
   - Real-time health tracking
   - Experience and leveling system (every 100 XP)
   - Gold and economy
   - Inventory with item usage
   - Companion system with relationships
   - Active effects (buffs/debuffs)

5. **Persistence**
   - Auto-save to browser localStorage
   - Manual save slots
   - Save/load functionality

6. **UI/UX**
   - Parchment-themed mobile-first design
   - Character panel with stats
   - Inventory drawer
   - Game over and victory screens
   - Level-up notifications
   - Toast notifications for events

### Out of Scope for MVP

- ❌ Multiplayer/co-op
- ❌ User authentication/accounts
- ❌ Server-side save persistence (database)
- ❌ Community features (leaderboards, sharing)
- ❌ Premium features/monetization
- ❌ Mobile apps (iOS/Android)
- ❌ Voice/audio integration
- ❌ Image generation for scenes
- ❌ Combat animations
- ❌ Extensive analytics beyond basic Vercel Analytics

---

## 🛠️ Tech Stack (January 2025)

### Framework & Core

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Next.js** | 16.0.0 | Full-stack framework | App Router, API routes, SSR/CSR |
| **React** | 19.2.0 | UI library | Latest features, concurrent rendering |
| **TypeScript** | 5.x | Type safety | Catch errors at compile-time |
| **Tailwind CSS** | 4.1.9 | Styling | Utility-first, rapid development |

### AI Integration

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Vercel AI SDK** | latest | AI abstraction layer | Unified interface for LLMs |
| **OpenAI GPT-4o-mini** | - | Narrative generation | Cost-effective, fast, quality output |

### State Management & Data

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Zustand** | latest | Global state | Simple, no boilerplate vs Redux |
| **localStorage** | Browser API | Persistence | No backend needed for MVP |

### UI Components

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Radix UI** | latest | Accessible primitives | 8 components used (see below) |
| **Lucide React** | 0.454.0 | Icons | Lightweight, consistent design |
| **Sonner** | latest | Toast notifications | Best-in-class UX |

### Radix UI Components Used

Only the following 8 Radix UI packages are used in the codebase:

1. `@radix-ui/react-dialog` - Modals and dialogs
2. `@radix-ui/react-label` - Form labels
3. `@radix-ui/react-progress` - Health bars, XP bars
4. `@radix-ui/react-scroll-area` - Story text scrolling
5. `@radix-ui/react-separator` - Visual dividers
6. `@radix-ui/react-slider` - Combat frequency, stat adjustments
7. `@radix-ui/react-slot` - Component composition
8. `@radix-ui/react-toast` - Notification system

### Utilities

| Technology | Version | Purpose |
|------------|---------|---------|
| `class-variance-authority` | 0.7.1 | Component variants |
| `clsx` | 2.1.1 | Conditional classNames |
| `tailwind-merge` | 2.5.5 | Merge Tailwind classes |
| `tailwindcss-animate` | 1.0.7 | CSS animations |
| `next-themes` | latest | Dark mode support |

### Analytics & Monitoring

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vercel Analytics** | latest | Performance tracking |

---

## 🧹 Tech Stack Cleanup (January 2025)

### Removed Dependencies

The following **43 packages were removed** as they were installed but never used:

#### Form Libraries (Unused)
- `@hookform/resolvers` - Not using React Hook Form
- `react-hook-form` - Forms handled with controlled components

#### Radix UI Components (Unused - 19 packages)
- `@radix-ui/react-accordion`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-aspect-ratio`
- `@radix-ui/react-avatar`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-collapsible`
- `@radix-ui/react-context-menu`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-hover-card`
- `@radix-ui/react-menubar`
- `@radix-ui/react-navigation-menu`
- `@radix-ui/react-popover`
- `@radix-ui/react-radio-group`
- `@radix-ui/react-select`
- `@radix-ui/react-switch`
- `@radix-ui/react-tabs`
- `@radix-ui/react-toggle`
- `@radix-ui/react-toggle-group`
- `@radix-ui/react-tooltip`

#### Data Visualization (Unused)
- `recharts` - Text RPG doesn't need charts

#### Utility Libraries (Unused)
- `date-fns` - Using native `Date.now()` and browser APIs
- `immer` - Using spread operators for immutability
- `use-sync-external-store` - Not needed with Zustand

#### UI Components (Unused)
- `cmdk` - Command palette not implemented
- `embla-carousel-react` - No carousels in design
- `input-otp` - No OTP authentication
- `react-day-picker` - No date picking needed
- `react-resizable-panels` - No resizable panels
- `vaul` - Drawer library not used

#### Validation (Not Used Yet)
- `zod` - No runtime validation implemented yet (can add later)

### Bundle Impact

**Before cleanup:**
- 66 total dependencies
- ~15-20 MB production bundle estimate
- 27 Radix UI packages (67% unused)

**After cleanup:**
- 23 total dependencies (-43 packages)
- ~8-10 MB production bundle estimate (-50%)
- 8 Radix UI packages (100% utilized)

### Rationale

This cleanup was performed to:
1. **Reduce bundle size** - Faster page loads, better mobile performance
2. **Simplify maintenance** - Fewer dependencies to update
3. **Improve security** - Smaller attack surface
4. **Clarify architecture** - Only keep what's actually used

The project was generated with v0.app, which auto-includes many "just in case" libraries. This audit identified and removed all unused packages while preserving 100% of functionality.

---

## 🔌 API Architecture

### Backend (Next.js API Routes)

All AI logic is handled through 5 serverless API endpoints:

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/api/generate-opening` | POST | Game start | Character, Scenario, Config | Narrative + Choices |
| `/api/process-turn` | POST | Player actions | Character, Choice, History, Dice | Narrative + Choices + State Changes |
| `/api/generate-scenario` | POST | Quick/Vibe scenario gen | Method, Character, Vibes | Scenarios[] |
| `/api/complete-scenario` | POST | Full Custom AI assist | Partial Config, Character | Complete Config |
| `/api/generate-options` | POST | Dynamic dropdowns | Type, Context | Options[] |

**Environment Variables Required:**
- `OPENAI_API_KEY` - OpenAI API access

---

## 📊 Data Models

### Core Types

```typescript
Character {
  id, name, race, background, raceAbility,
  stats: { valor, wisdom, fellowship, craft, endurance, lore },
  level, experience, health, maxHealth, gold,
  inventory: InventoryItem[],
  companions: Companion[]
}

Scenario {
  id, name, description, difficulty,
  estimatedLength, mainObjective,
  customConfig: CustomScenarioConfig
}

CustomScenarioConfig {
  id, generatedAt, creationMethod,
  region, location, questHook, urgency, stakes,
  tones[], combatFrequency,
  companionPreference, companionType,
  uniqueElement,
  aiContext: { userPrompt, characterContext, generatedNarrative },
  modifications[]  // Mid-game adjustments
}

EnhancedChoice {
  id, text, actionType,
  requiresRoll, stat, dc, riskLevel, consequence
}
```

See `BACKEND_HANDOFF.md` for complete type definitions.

---

## 🎲 Game Mechanics

### Stat System

6-stat custom system (NOT D&D):

| Stat | Use Cases |
|------|-----------|
| **Valor** | Combat, bravery, intimidation |
| **Wisdom** | Perception, insight, nature |
| **Fellowship** | Persuasion, negotiation, leadership |
| **Craft** | Lockpicking, crafting, stealth, ranged attacks |
| **Endurance** | Resisting poison, stamina, health pool |
| **Lore** | History, magic, languages, puzzles |

**Point Buy:** 27 points, range 3-8, cost = (value - 3) × 2

### Dice Mechanics

- **Roll:** d20 + stat modifier
- **Success:** Total ≥ DC
- **DC Range:** Easy 8-10, Medium 12-14, Hard 15-18

### Progression

- **Health:** 10 + (endurance × 2)
- **Level Up:** Every 100 XP
- **XP Rewards:** 10-20 (minor), 30-40 (moderate), 50+ (major)

---

## 🎨 Design System

### Theme

- **Aesthetic:** Parchment/medieval manuscript
- **Colors:** Warm browns, sepia tones, gold accents
- **Typography:** Cinzel (headings), Lora (body)
- **Target:** Mobile-first, responsive to desktop

### Key UI Patterns

- **Story Display:** Scrollable parchment area
- **Choices:** Button grid (3-4 options)
- **Character Panel:** Collapsible drawer (mobile) / sidebar (desktop)
- **Inventory:** Grid with icon-based items
- **Notifications:** Toast messages (success, danger, info)
- **Modals:** Level-up, game over, victory screens

---

## 🚀 Deployment

### Platform

- **Host:** Vercel
- **Auto-deploy:** Connected to GitHub branch
- **Environment:** Node.js serverless functions
- **CDN:** Global edge network

### Environment Setup

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional (Vercel provides automatically)
VERCEL_URL=auto-provided
```

---

## 📈 Success Metrics (MVP)

### Technical Metrics

- ✅ Page load < 3 seconds (mobile)
- ✅ API response time < 2 seconds (AI calls)
- ✅ Zero critical accessibility violations
- ✅ Mobile-responsive (320px+)

### User Experience Metrics

- ✅ Character creation completion rate > 80%
- ✅ Average session length > 10 minutes
- ✅ Story turns per session > 15
- ✅ Save/load success rate > 95%

### AI Quality Metrics

- ✅ Narrative coherence (manual review)
- ✅ Choice relevance to character stats
- ✅ Tone consistency across turns
- ✅ State change accuracy (health, gold, XP)

---

## 🔄 Post-MVP Roadmap

### Phase 2 (Future Considerations)

1. **Authentication & Cloud Saves**
   - User accounts (Clerk or Auth0)
   - PostgreSQL database (Supabase or Vercel Postgres)
   - Cross-device save sync

2. **Enhanced AI**
   - Anthropic Claude integration as alternative provider
   - Streaming narrative text for better UX
   - Image generation for scenes (DALL-E or Midjourney)

3. **Social Features**
   - Share scenarios with friends
   - Leaderboard (most turns, highest XP)
   - Community-created scenarios

4. **Monetization**
   - Premium scenarios
   - Advanced AI models (GPT-4)
   - Unlimited save slots

### Technical Debt to Address

1. **Replace Zustand with React Context**
   - Current: 338 lines of Zustand boilerplate
   - Target: ~50-100 lines of React Context
   - Benefit: Fewer dependencies, simpler code

2. **Add Runtime Validation**
   - Re-introduce `zod` for API payload validation
   - Prevent corrupted data from AI responses

3. **Downgrade to Stable Versions** (Optional)
   - React 19.2.0 → 18.3.1
   - Next.js 16.0.0 → 14.2.18
   - Reason: More stable, better library support

---

## 📝 Documentation References

- **Backend API Contracts:** See `BACKEND_HANDOFF.md`
- **Type Definitions:** `lib/types.ts`
- **Game Constants:** `lib/scenario-config.ts`
- **State Management:** `lib/game-state.ts`
- **Game Logic:** `lib/game-logic.ts`

---

## 🤝 Contributing

This is an MVP project. For technical questions, refer to:

1. `BACKEND_HANDOFF.md` - Backend developer guide
2. `PRD.md` (this file) - Product requirements
3. `README.md` - Repository overview

---

## 📞 Contact & Support

**Project Status:** Active Development (MVP Phase)
**Last Updated:** January 2025

---

**May your code be as legendary as the tales of Middle-earth!** 🧙‍♂️⚔️
