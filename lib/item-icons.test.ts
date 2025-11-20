/**
 * Verification tests for lib/item-icons.tsx
 * Tests the priority-based keyword matching system
 *
 * Run with: npx tsx lib/item-icons.test.ts
 */

import { getItemIcon, ITEM_ICONS } from "./item-icons"

console.log("🧪 Running Item Icon Keyword Matching Tests...\n")

let testsPassed = 0
let testsFailed = 0

function test(name: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`✅ ${name}`)
    testsPassed++
  } else {
    console.error(`❌ ${name}`)
    if (details) console.error(`   ${details}`)
    testsFailed++
  }
}

// ============================================================================
// CRITICAL: Gold Keyword Ambiguity Tests
// ============================================================================

console.log("🏆 Testing Gold Keyword Disambiguation:")

const goldenRingIcon = getItemIcon("Golden Ring")
test(
  '"Golden Ring" → Diamond icon (ring), NOT Coins (gold)',
  goldenRingIcon === ITEM_ICONS.ring,
  `Got: ${goldenRingIcon.name}, Expected: ${ITEM_ICONS.ring.name}`
)

const goldCoinsIcon = getItemIcon("Gold Coins")
test(
  '"Gold Coins" → Coins icon',
  goldCoinsIcon === ITEM_ICONS.coins || goldCoinsIcon === ITEM_ICONS.gold,
  `Got: ${goldCoinsIcon.name}`
)

const goldenCrownIcon = getItemIcon("Golden Crown")
test(
  '"Golden Crown" → Crown icon, NOT Coins',
  goldenCrownIcon === ITEM_ICONS.crown,
  `Got: ${goldenCrownIcon.name}, Expected: ${ITEM_ICONS.crown.name}`
)

// ============================================================================
// Ancient/Magic Adjective Tests
// ============================================================================

console.log("\n✨ Testing Adjective Priority:")

const ancientSwordIcon = getItemIcon("Ancient Sword")
test(
  '"Ancient Sword" → Sword icon, NOT Sparkles (ancient)',
  ancientSwordIcon === ITEM_ICONS.sword,
  `Got: ${ancientSwordIcon.name}, Expected: ${ITEM_ICONS.sword.name}`
)

const magicScrollIcon = getItemIcon("Magic Scroll")
test(
  '"Magic Scroll" → Scroll icon, NOT Wand (magic)',
  magicScrollIcon === ITEM_ICONS.scroll,
  `Got: ${magicScrollIcon.name}, Expected: ${ITEM_ICONS.scroll.name}`
)

const enchantedBowIcon = getItemIcon("Enchanted Longbow")
test(
  '"Enchanted Longbow" → Bow icon, NOT Sparkles (enchanted)',
  enchantedBowIcon === ITEM_ICONS.longbow || enchantedBowIcon === ITEM_ICONS.bow,
  `Got: ${enchantedBowIcon.name}`
)

// ============================================================================
// Standard Item Matching (Regression Tests)
// ============================================================================

console.log("\n🗡️  Testing Standard Item Matching:")

test('"Elven Sword" → Sword icon', getItemIcon("Elven Sword") === ITEM_ICONS.sword)
test('"Health Potion" → Flask icon', getItemIcon("Health Potion") === ITEM_ICONS.potion)
test('"Leather Armor" → Shield icon', getItemIcon("Leather Armor") === ITEM_ICONS.armor)
test(
  '"Ancient Text" → BookOpen icon',
  getItemIcon("Ancient Text") === ITEM_ICONS.text || getItemIcon("Ancient Text") === ITEM_ICONS.book
)

// ============================================================================
// Edge Cases
// ============================================================================

console.log("\n🔍 Testing Edge Cases:")

const rustedKeyIcon = getItemIcon("Rusted Key")
test('"Rusted Key" → Key icon, NOT default', rustedKeyIcon === ITEM_ICONS.key)

const fineClothesIcon = getItemIcon("Fine Clothes")
test('"Fine Clothes" → Shirt icon, NOT default', fineClothesIcon === ITEM_ICONS.clothes)

const brokenSwordIcon = getItemIcon("Broken Sword")
test('"Broken Sword" → Sword icon (still a sword)', brokenSwordIcon === ITEM_ICONS.sword)

// ============================================================================
// Currency vs Item Distinction
// ============================================================================

console.log("\n💰 Testing Currency vs Item:")

test('"Gold" (exact match) → Coins icon', getItemIcon("Gold") === ITEM_ICONS.gold)
test('"Silver" (exact match) → Coins icon', getItemIcon("Silver") === ITEM_ICONS.silver)
test(
  '"Gold Ring" → Diamond (ring priority)',
  getItemIcon("Gold Ring") === ITEM_ICONS.ring,
  `Got: ${getItemIcon("Gold Ring").name}, Expected: ${ITEM_ICONS.ring.name}`
)

// ============================================================================
// Longest Match Priority
// ============================================================================

console.log("\n📏 Testing Longest Match Priority:")

test(
  '"Longsword" → Sword icon (longsword is more specific)',
  getItemIcon("Longsword") === ITEM_ICONS.longsword || getItemIcon("Longsword") === ITEM_ICONS.sword
)

test(
  '"Elven Longsword" → Sword icon (longsword > sword)',
  getItemIcon("Elven Longsword") === ITEM_ICONS.longsword || getItemIcon("Elven Longsword") === ITEM_ICONS.sword
)

// ============================================================================
// Fallback Test
// ============================================================================

console.log("\n🎁 Testing Fallback:")

const mysteriousShardIcon = getItemIcon("Mysterious Shard")
test(
  '"Mysterious Shard" → Package icon (default fallback)',
  mysteriousShardIcon === ITEM_ICONS.default
)

// ============================================================================
// Summary
// ============================================================================

console.log("\n" + "=".repeat(60))
console.log(`\n📊 Test Results:`)
console.log(`   ✅ Passed: ${testsPassed}`)
console.log(`   ❌ Failed: ${testsFailed}`)
console.log(`   📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`)

if (testsFailed === 0) {
  console.log("\n🎉 ALL ICON MATCHING TESTS PASSED!")
  console.log("   ✓ Gold keyword disambiguation works correctly")
  console.log("   ✓ Adjectives properly deprioritized")
  console.log("   ✓ Specific item types take precedence")
} else {
  console.error("\n⚠️  SOME TESTS FAILED! Review the priority algorithm.")
  process.exit(1)
}

console.log("\n" + "=".repeat(60) + "\n")
