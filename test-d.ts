/**
 * QA VERIFICATION TEST - Ticket D
 * Tests the casing hotfix and damage calculation logic
 */

import { calculateDamage } from "./lib/rules"

console.log("=" .repeat(60))
console.log("QA VERIFICATION TEST - TICKET D")
console.log("=" .repeat(60))

console.log("\n✅ TEST 1: Math Logic Check - Uppercase Tiers")
console.log("-".repeat(60))

try {
  const dangerousResult = calculateDamage("DANGEROUS")
  console.log(`calculateDamage("DANGEROUS") → ${dangerousResult} HP`)

  if (dangerousResult >= 9 && dangerousResult <= 15) {
    console.log("✅ PASS: Result is within expected range (9-15)")
  } else {
    console.log(`❌ FAIL: Result ${dangerousResult} is outside range (9-15)`)
  }
} catch (error) {
  console.log(`❌ FAIL: calculateDamage("DANGEROUS") threw error:`, error)
}

console.log("\n❌ TEST 2: Math Logic Check - Lowercase Tier (Should Fail)")
console.log("-".repeat(60))
console.log("This demonstrates why Ticket D.1 was needed:")

try {
  // @ts-expect-error - Testing lowercase input (should fail)
  const lowercaseResult = calculateDamage("dangerous" as any)
  console.log(`calculateDamage("dangerous") → ${lowercaseResult}`)
  console.log("❌ UNEXPECTED: Function accepted lowercase (should have failed)")
} catch (error) {
  console.log("✅ EXPECTED: Function correctly rejects lowercase input")
  console.log(`   Error: ${(error as Error).message || error}`)
}

console.log("\n✅ TEST 3: All Damage Tiers")
console.log("-".repeat(60))

const tiers = ["TRIVIAL", "STANDARD", "DANGEROUS", "LETHAL"] as const
const expectedRanges = {
  TRIVIAL: { min: 1, max: 3 },
  STANDARD: { min: 4, max: 8 },
  DANGEROUS: { min: 9, max: 15 },
  LETHAL: { min: 16, max: 25 },
}

let allTestsPassed = true

for (const tier of tiers) {
  try {
    const result = calculateDamage(tier, false) // Use average for consistent testing
    const range = expectedRanges[tier]
    const withinRange = result >= range.min && result <= range.max

    console.log(
      `${withinRange ? "✅" : "❌"} ${tier.padEnd(12)} → ${result} HP (expected ${range.min}-${range.max})`
    )

    if (!withinRange) {
      allTestsPassed = false
    }
  } catch (error) {
    console.log(`❌ ${tier.padEnd(12)} → ERROR: ${error}`)
    allTestsPassed = false
  }
}

console.log("\n" + "=".repeat(60))
if (allTestsPassed) {
  console.log("✅ ALL TESTS PASSED - Logic Engine is operational")
} else {
  console.log("❌ SOME TESTS FAILED - Review lib/rules.ts")
}
console.log("=".repeat(60))

console.log("\n📋 INTEGRATION NOTE:")
console.log("The API middleware now applies .toUpperCase() at process-turn/route.ts:140")
console.log("This ensures that AI responses like 'dangerous' are converted to 'DANGEROUS'")
console.log("before being passed to calculateDamage().")
console.log("\n")
