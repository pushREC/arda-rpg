/**
 * Verification tests for lib/rules.ts
 * Run with: npx tsx lib/rules.test.ts
 */

import {
  getStatModifier,
  calculateDC,
  calculateMaxHealth,
  DAMAGE_TIERS,
  calculateDamage,
  calculateDamageDetailed,
  XP_THRESHOLDS,
  calculateLevel,
  getXPForNextLevel,
  VALID_ITEM_KEYWORDS,
  validateItemName,
  suggestItemNameWithKeyword,
  GOLD_REWARDS,
  calculateGoldReward,
  MIN_STAT_VALUE,
  MAX_STAT_VALUE,
  validateStats,
  clampStat,
} from "./rules"

console.log("🧪 Running ARDA RPG Rules Engine Verification Tests...\n")

let testsPassed = 0
let testsFailed = 0

function test(name: string, condition: boolean) {
  if (condition) {
    console.log(`✅ ${name}`)
    testsPassed++
  } else {
    console.error(`❌ ${name}`)
    testsFailed++
  }
}

// ============================================================================
// STAT MODIFIER TESTS
// ============================================================================

console.log("\n📊 Testing Stat Modifier Calculations:")
test("getStatModifier(3) === 0", getStatModifier(3) === 0)
test("getStatModifier(4) === 1", getStatModifier(4) === 1)
test("getStatModifier(5) === 2", getStatModifier(5) === 2)
test("getStatModifier(6) === 3", getStatModifier(6) === 3)
test("getStatModifier(7) === 4", getStatModifier(7) === 4)
test("getStatModifier(8) === 5", getStatModifier(8) === 5)
test("getStatModifier(2) === 0 (clamps to 0)", getStatModifier(2) === 0)

// ============================================================================
// DIFFICULTY CLASS TESTS
// ============================================================================

console.log("\n🎯 Testing Difficulty Class Calculations:")
test('calculateDC("easy") === 8', calculateDC("easy") === 8)
test('calculateDC("medium") === 12', calculateDC("medium") === 12)
test('calculateDC("hard") === 16', calculateDC("hard") === 16)

// ============================================================================
// HEALTH CALCULATION TESTS
// ============================================================================

console.log("\n❤️  Testing Health Calculations:")
test("calculateMaxHealth(3) === 16", calculateMaxHealth(3) === 16)
test("calculateMaxHealth(5) === 20", calculateMaxHealth(5) === 20)
test("calculateMaxHealth(6) === 22", calculateMaxHealth(6) === 22)
test("calculateMaxHealth(8) === 26", calculateMaxHealth(8) === 26)

// ============================================================================
// DAMAGE TIER TESTS
// ============================================================================

console.log("\n⚔️  Testing Damage Tiers:")
test("DAMAGE_TIERS.TRIVIAL.min === 1", DAMAGE_TIERS.TRIVIAL.min === 1)
test("DAMAGE_TIERS.TRIVIAL.max === 3", DAMAGE_TIERS.TRIVIAL.max === 3)
test("DAMAGE_TIERS.STANDARD.min === 4", DAMAGE_TIERS.STANDARD.min === 4)
test("DAMAGE_TIERS.STANDARD.max === 8", DAMAGE_TIERS.STANDARD.max === 8)
test("DAMAGE_TIERS.DANGEROUS.min === 9", DAMAGE_TIERS.DANGEROUS.min === 9)
test("DAMAGE_TIERS.DANGEROUS.max === 15", DAMAGE_TIERS.DANGEROUS.max === 15)
test("DAMAGE_TIERS.LETHAL.min === 16", DAMAGE_TIERS.LETHAL.min === 16)
test("DAMAGE_TIERS.LETHAL.max === 25", DAMAGE_TIERS.LETHAL.max === 25)

// Test damage calculation ranges
const trivialDamage = calculateDamage("TRIVIAL")
test(
  `calculateDamage("TRIVIAL") in range [1,3]: ${trivialDamage}`,
  trivialDamage >= 1 && trivialDamage <= 3
)

const lethalDamage = calculateDamage("LETHAL")
test(
  `calculateDamage("LETHAL") in range [16,25]: ${lethalDamage}`,
  lethalDamage >= 16 && lethalDamage <= 25
)

// Test average damage
const avgDamage = calculateDamage("STANDARD", false)
test(`calculateDamage("STANDARD", false) === 6 (average)`, avgDamage === 6)

// Test detailed damage result (future-proofing)
console.log("\n🔬 Testing Detailed Damage Result (Future-Proofing):")
const detailedDamage = calculateDamageDetailed("DANGEROUS")
test(
  "calculateDamageDetailed returns correct tier",
  detailedDamage.tier === "DANGEROUS"
)
test("calculateDamageDetailed returns correct min", detailedDamage.min === 9)
test("calculateDamageDetailed returns correct max", detailedDamage.max === 15)
test(
  "calculateDamageDetailed returns correct label",
  detailedDamage.label === "severe injury"
)
test(
  "calculateDamageDetailed amount in range",
  detailedDamage.amount >= 9 && detailedDamage.amount <= 15
)

// ============================================================================
// XP THRESHOLD TESTS
// ============================================================================

console.log("\n⭐ Testing XP Thresholds:")
test("XP_THRESHOLDS[1] === 0", XP_THRESHOLDS[1] === 0)
test("XP_THRESHOLDS[2] === 100", XP_THRESHOLDS[2] === 100)
test("XP_THRESHOLDS[3] === 250", XP_THRESHOLDS[3] === 250)
test("XP_THRESHOLDS[4] === 450", XP_THRESHOLDS[4] === 450)
test("XP_THRESHOLDS[5] === 750", XP_THRESHOLDS[5] === 750)

console.log("\n📈 Testing Level Calculations:")
test("calculateLevel(0) === 1", calculateLevel(0) === 1)
test("calculateLevel(50) === 1", calculateLevel(50) === 1)
test("calculateLevel(100) === 2", calculateLevel(100) === 2)
test("calculateLevel(250) === 3", calculateLevel(250) === 3)
test("calculateLevel(275) === 3", calculateLevel(275) === 3)
test("calculateLevel(450) === 4", calculateLevel(450) === 4)

console.log("\n🎯 Testing XP for Next Level:")
test("getXPForNextLevel(1) === 100", getXPForNextLevel(1) === 100)
test("getXPForNextLevel(2) === 250", getXPForNextLevel(2) === 250)
test("getXPForNextLevel(3) === 450", getXPForNextLevel(3) === 450)

// ============================================================================
// ITEM KEYWORD TESTS
// ============================================================================

console.log("\n🗡️  Testing Item Keyword Validation:")
test("VALID_ITEM_KEYWORDS includes 'sword'", VALID_ITEM_KEYWORDS.includes("sword"))
test("VALID_ITEM_KEYWORDS includes 'potion'", VALID_ITEM_KEYWORDS.includes("potion"))
test("VALID_ITEM_KEYWORDS includes 'gem'", VALID_ITEM_KEYWORDS.includes("gem"))

test('validateItemName("Elven Sword") === true', validateItemName("Elven Sword") === true)
test('validateItemName("Health Potion") === true', validateItemName("Health Potion") === true)
test(
  'validateItemName("Ancient Scroll") === true',
  validateItemName("Ancient Scroll") === true
)
test(
  'validateItemName("Mysterious Shard") === false',
  validateItemName("Mysterious Shard") === false
)

const suggestedName = suggestItemNameWithKeyword("Mysterious Shard", "treasure")
test(
  'suggestItemNameWithKeyword("Mysterious Shard", "treasure") contains keyword',
  validateItemName(suggestedName) === true
)

// ============================================================================
// GOLD REWARD TESTS
// ============================================================================

console.log("\n💰 Testing Gold Rewards:")
test("GOLD_REWARDS.TRIVIAL.min === 1", GOLD_REWARDS.TRIVIAL.min === 1)
test("GOLD_REWARDS.TRIVIAL.max === 5", GOLD_REWARDS.TRIVIAL.max === 5)
test("GOLD_REWARDS.COMMON.min === 5", GOLD_REWARDS.COMMON.min === 5)
test("GOLD_REWARDS.COMMON.max === 15", GOLD_REWARDS.COMMON.max === 15)
test("GOLD_REWARDS.LEGENDARY.min === 100", GOLD_REWARDS.LEGENDARY.min === 100)
test("GOLD_REWARDS.LEGENDARY.max === 250", GOLD_REWARDS.LEGENDARY.max === 250)

const commonGold = calculateGoldReward("COMMON")
test(
  `calculateGoldReward("COMMON") in range [5,15]: ${commonGold}`,
  commonGold >= 5 && commonGold <= 15
)

// ============================================================================
// STAT VALIDATION TESTS
// ============================================================================

console.log("\n🔢 Testing Stat Validation:")
test("MIN_STAT_VALUE === 3", MIN_STAT_VALUE === 3)
test("MAX_STAT_VALUE === 8", MAX_STAT_VALUE === 8)

const validStats = {
  valor: 5,
  wisdom: 4,
  fellowship: 6,
  craft: 5,
  endurance: 5,
  lore: 6,
}
test("validateStats(validStats) === true", validateStats(validStats) === true)

const invalidStats = {
  valor: 2, // Too low
  wisdom: 4,
  fellowship: 6,
  craft: 5,
  endurance: 5,
  lore: 6,
}
test("validateStats(invalidStats) === false", validateStats(invalidStats) === false)

test("clampStat(2) === 3", clampStat(2) === 3)
test("clampStat(5) === 5", clampStat(5) === 5)
test("clampStat(10) === 8", clampStat(10) === 8)

// ============================================================================
// SUMMARY
// ============================================================================

console.log("\n" + "=".repeat(60))
console.log(`\n📊 Test Results:`)
console.log(`   ✅ Passed: ${testsPassed}`)
console.log(`   ❌ Failed: ${testsFailed}`)
console.log(`   📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`)

if (testsFailed === 0) {
  console.log("\n🎉 ALL TESTS PASSED! The rules engine is working correctly.")
} else {
  console.error("\n⚠️  SOME TESTS FAILED! Please review the implementation.")
  process.exit(1)
}

console.log("\n" + "=".repeat(60) + "\n")
