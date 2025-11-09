import type { Character, CustomScenarioConfig } from "./types"

export function generateScenarioId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function buildCharacterContext(character: Character): string {
  return `${character.race} ${character.background} - High stats: ${getTopStats(character)}`
}

function getTopStats(character: Character): string {
  const stats = Object.entries(character.stats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([name]) => name)
  return stats.join(", ")
}

export function buildContextForStep(
  step: "locations" | "quest-hooks" | "companions" | "unique-elements",
  data: Partial<CustomScenarioConfig>,
  character: Character,
): string {
  let context = `Character: ${buildCharacterContext(character)}\n`

  if (data.region) context += `Region: ${data.region}\n`
  if (data.location) context += `Location: ${data.location}\n`
  if (data.questHook) context += `Quest: ${data.questHook}\n`
  if (data.tones && data.tones.length > 0) context += `Tones: ${data.tones.join(", ")}\n`
  if (data.combatFrequency) context += `Combat Level: ${data.combatFrequency}/5\n`
  if (data.companionPreference) context += `Companions: ${data.companionPreference}\n`

  return context
}

export function fillWithSmartDefaults(
  partialConfig: Partial<CustomScenarioConfig>,
  character: Character,
): CustomScenarioConfig {
  const id = generateScenarioId()

  // Default values based on character
  const defaultRegion = getDefaultRegion(character.race)
  const defaultTones = getDefaultTones(character.background)
  const defaultCombat = getDefaultCombat(character.stats)

  return {
    id,
    generatedAt: Date.now(),
    creationMethod: partialConfig.creationMethod || "full-custom",
    vibes: partialConfig.vibes,
    region: partialConfig.region || defaultRegion,
    location: partialConfig.location || `${defaultRegion} - Main Settlement`,
    questHook: partialConfig.questHook || "A mysterious summons has brought you here",
    urgency: partialConfig.urgency || "building",
    stakes: partialConfig.stakes || "community",
    tones: partialConfig.tones || defaultTones,
    combatFrequency: partialConfig.combatFrequency ?? defaultCombat,
    companionPreference: partialConfig.companionPreference || "single-ally",
    companionType: partialConfig.companionType,
    uniqueElement: partialConfig.uniqueElement || "An unexpected twist awaits",
    aiContext: {
      characterContext: buildCharacterContext(character),
      userPrompt: partialConfig.aiContext?.userPrompt,
      generatedNarrative: partialConfig.aiContext?.generatedNarrative,
    },
    modifications: [],
  }
}

function getDefaultRegion(race: string): string {
  const raceRegions: Record<string, string> = {
    hobbit: "Shire",
    dwarf: "Erebor",
    elf: "Rivendell",
    human: "Gondor",
  }
  return raceRegions[race] || "Gondor"
}

function getDefaultTones(background: string): string[] {
  const backgroundTones: Record<string, string[]> = {
    ranger: ["mysterious", "personal"],
    scholar: ["mysterious", "hopeful"],
    merchant: ["whimsical", "personal"],
    soldier: ["epic", "desperate"],
    wanderer: ["whimsical", "mysterious"],
  }
  return backgroundTones[background] || ["hopeful", "epic"]
}

function getDefaultCombat(stats: any): number {
  const valor = stats.valor || 0
  if (valor >= 15) return 4
  if (valor >= 12) return 3
  if (valor >= 10) return 2
  return 1
}

export function validateScenarioConfig(config: CustomScenarioConfig): boolean {
  return !!(
    config.id &&
    config.tones &&
    config.tones.length > 0 &&
    config.combatFrequency >= 1 &&
    config.combatFrequency <= 5 &&
    config.companionPreference
  )
}
