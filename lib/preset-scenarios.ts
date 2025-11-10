import type { CustomScenarioConfig } from "./types"

export const PRESET_SCENARIO_CONFIGS: Record<string, CustomScenarioConfig> = {
  "shadows-of-mirkwood": {
    id: "shadows-of-mirkwood",
    generatedAt: Date.now(),
    creationMethod: "full-custom",

    // Setting
    region: "Mirkwood",
    location: "The Forest's Edge",
    locationDescription: "Ancient twisted trees blocking out the sun, narrow paths winding into shadowy depths",

    // Quest
    questHook:
      "Dark forces gather in the ancient forest. Strange creatures have been spotted near the woodland villages, and travelers speak of an evil presence growing in the depths.",
    urgency: "building",
    stakes: "community",

    // Tone & Style
    tones: ["dark", "mysterious"],
    combatFrequency: 3, // Moderate combat

    // Companions
    companionPreference: "single-ally",
    companionType: "Forest Ranger",

    // Unique Element
    uniqueElement: "Ancient corrupted magic seeping from the forest's heart",

    // AI Context
    aiContext: {
      characterContext: "Preset scenario: Shadows of Mirkwood",
      generatedNarrative: "Pre-configured Middle-earth adventure",
    },
  },

  "siege-of-helms-deep": {
    id: "siege-of-helms-deep",
    generatedAt: Date.now(),
    creationMethod: "full-custom",

    region: "Rohan",
    location: "Helm's Deep Fortress",
    locationDescription: "The mighty fortress stands ready as drums of war thunder in the distance",

    questHook:
      "An army of Uruk-hai marches toward Helm's Deep. The defenders look to you for guidance as thousands of enemies approach the walls.",
    urgency: "immediate",
    stakes: "kingdom",

    tones: ["epic", "desperate"],
    combatFrequency: 5, // Constant combat

    companionPreference: "large-fellowship",
    companionType: "Rohan Warriors and Defenders",

    uniqueElement: "Strategic fortress defense with overwhelming odds",

    aiContext: {
      characterContext: "Preset scenario: Siege of Helm's Deep",
      generatedNarrative: "Epic battle scenario",
    },
  },

  "mines-of-moria": {
    id: "mines-of-moria",
    generatedAt: Date.now(),
    creationMethod: "full-custom",

    region: "Misty Mountains",
    location: "The Mines of Moria",
    locationDescription: "Abandoned dwarven kingdom where darkness and ancient evils lurk in endless passages",

    questHook:
      "Venture deep into the abandoned dwarven kingdom. Navigate treacherous passages, solve ancient puzzles, and face what dwells in the deep.",
    urgency: "slow-burn",
    stakes: "personal",

    tones: ["dark", "mysterious"],
    combatFrequency: 4, // Frequent combat

    companionPreference: "small-party",
    companionType: "Fellow Adventurers",

    uniqueElement: "Ancient dwarven ruins with puzzles and lurking horrors",

    aiContext: {
      characterContext: "Preset scenario: Mines of Moria",
      generatedNarrative: "Dungeon crawl with horror elements",
    },
  },

  "quest-for-the-ring": {
    id: "quest-for-the-ring",
    generatedAt: Date.now(),
    creationMethod: "full-custom",

    region: "The Shire to Mordor",
    location: "The Shire",
    locationDescription: "Peaceful rolling hills where a simple quest begins its transformation into an epic journey",

    questHook:
      "A mysterious ring has been discovered. What starts as a simple delivery becomes an epic journey across Middle-earth as dark riders pursue you.",
    urgency: "building",
    stakes: "world",

    tones: ["epic", "hopeful"],
    combatFrequency: 3, // Moderate combat

    companionPreference: "small-party",
    companionType: "The Fellowship",

    uniqueElement: "A powerful artifact that corrupts those who possess it",

    aiContext: {
      characterContext: "Preset scenario: Quest for the Lost Ring",
      generatedNarrative: "Epic quest across Middle-earth",
    },
  },
}
