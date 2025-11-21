import type { VibeOption, RegionOption, ToneOption } from "./types"

export const VIBE_OPTIONS: VibeOption[] = [
  {
    id: "ancient-mystery",
    label: "Ancient Mystery",
    description: "Uncover secrets lost to time",
    icon: "Scroll",
    suggestedTones: ["mysterious", "dark"],
    suggestedCombat: 2,
    suggestedRegions: ["Gondor", "Rivendell", "Moria"],
  },
  {
    id: "desperate-defense",
    label: "Desperate Defense",
    description: "Hold the line against overwhelming odds",
    icon: "Shield",
    suggestedTones: ["epic", "desperate"],
    suggestedCombat: 5,
    suggestedRegions: ["Helm's Deep", "Minas Tirith", "Osgiliath"],
  },
  {
    id: "political-intrigue",
    label: "Political Intrigue",
    description: "Navigate webs of power and deception",
    icon: "Crown",
    suggestedTones: ["dark", "mysterious"],
    suggestedCombat: 1,
    suggestedRegions: ["Gondor", "Rohan", "Lake-town"],
  },
  {
    id: "supernatural-horror",
    label: "Supernatural Horror",
    description: "Face terrors that should not be",
    icon: "Ghost",
    suggestedTones: ["dark", "desperate"],
    suggestedCombat: 3,
    suggestedRegions: ["Mirkwood", "Moria", "Dol Guldur"],
  },
  {
    id: "noble-quest",
    label: "Noble Quest",
    description: "Champion the cause of good",
    icon: "Sword",
    suggestedTones: ["epic", "hopeful"],
    suggestedCombat: 3,
    suggestedRegions: ["Rohan", "Gondor", "Shire"],
  },
  {
    id: "exploration-discovery",
    label: "Exploration & Discovery",
    description: "Chart unknown lands and find wonders",
    icon: "Map",
    suggestedTones: ["whimsical", "mysterious"],
    suggestedCombat: 2,
    suggestedRegions: ["Wilderland", "Ered Luin", "Rhovanion"],
  },
  {
    id: "personal-vendetta",
    label: "Personal Vendetta",
    description: "Settle old scores and seek justice",
    icon: "Target",
    suggestedTones: ["personal", "dark"],
    suggestedCombat: 4,
    suggestedRegions: ["Any"],
  },
  {
    id: "survival",
    label: "Survival",
    description: "Endure against nature and enemies",
    icon: "Flame",
    suggestedTones: ["desperate", "melancholic"],
    suggestedCombat: 3,
    suggestedRegions: ["Mirkwood", "Misty Mountains", "Wilderland"],
  },
  {
    id: "heist-infiltration",
    label: "Heist & Infiltration",
    description: "Steal, sneak, and deceive",
    icon: "Eye",
    suggestedTones: ["mysterious", "personal"],
    suggestedCombat: 2,
    suggestedRegions: ["Any"],
  },
  {
    id: "lost-civilization",
    label: "Lost Civilization",
    description: "Discover ruins of forgotten peoples",
    icon: "Landmark",
    suggestedTones: ["mysterious", "melancholic"],
    suggestedCombat: 2,
    suggestedRegions: ["Moria", "Fornost", "Annuminas"],
  },
]

export const REGIONS: RegionOption[] = [
  { id: "gondor", name: "Gondor", description: "The realm of the Dúnedain in the south", icon: "Castle" },
  { id: "rohan", name: "Rohan", description: "The horse-lords of the Mark", icon: "Horse" },
  { id: "shire", name: "The Shire", description: "Peaceful hobbit-lands of the west", icon: "Home" },
  { id: "rivendell", name: "Rivendell", description: "The Last Homely House east of the Sea", icon: "Leaf" },
  { id: "mirkwood", name: "Mirkwood", description: "The dark forest haunted by evil", icon: "Trees" },
  { id: "moria", name: "Moria", description: "The ancient dwarven kingdom beneath the mountains", icon: "Mountain" },
  { id: "isengard", name: "Isengard", description: "The stronghold of Saruman", icon: "Tower" },
  { id: "mordor", name: "Mordor", description: "The dark land where shadows lie", icon: "Flame" },
  { id: "lothlor", name: "Lothlórien", description: "The golden wood of the Galadhrim", icon: "Sparkles" },
  { id: "erebor", name: "Erebor", description: "The Lonely Mountain, kingdom under the mountain", icon: "Mountain" },
]

export const TONE_OPTIONS: ToneOption[] = [
  { id: "dark", label: "Dark", description: "Shadows and danger lurk everywhere", icon: "Cloud", color: "text-slate-600" },
  { id: "hopeful", label: "Hopeful", description: "Light shines even in dark times", icon: "Sun", color: "text-yellow-600" },
  { id: "mysterious", label: "Mysterious", description: "Secrets and riddles abound", icon: "HelpCircle", color: "text-purple-600" },
  { id: "epic", label: "Epic", description: "Grand battles and legendary deeds", icon: "Zap", color: "text-red-600" },
  { id: "personal", label: "Personal", description: "Intimate stakes and character growth", icon: "Heart", color: "text-pink-600" },
  { id: "desperate", label: "Desperate", description: "Against all odds, survival is uncertain", icon: "AlertTriangle", color: "text-orange-600" },
  { id: "whimsical", label: "Whimsical", description: "Lighthearted adventure with wonder", icon: "Sparkles", color: "text-blue-600" },
  { id: "melancholic", label: "Melancholic", description: "Bittersweet journeys and lost glory", icon: "CloudRain", color: "text-indigo-600" },
]

export const COMPANION_PREFERENCES = [
  {
    id: "solo",
    label: "Solo Journey",
    description: "Face the road alone, relying on your own skills",
    icon: "User",
  },
  {
    id: "single-ally",
    label: "One Trusted Ally",
    description: "Bring a single companion on your quest",
    icon: "Users",
  },
  {
    id: "small-party",
    label: "Small Fellowship",
    description: "Travel with 2-3 companions",
    icon: "Users2",
  },
  {
    id: "large-fellowship",
    label: "Large Fellowship",
    description: "Lead a diverse group of 4+ allies",
    icon: "UsersRound",
  },
]

export const URGENCY_OPTIONS = [
  {
    id: "immediate",
    label: "Immediate Crisis",
    description: "Time is of the essence - act now or all is lost",
  },
  {
    id: "building",
    label: "Building Tension",
    description: "Danger grows with each passing day",
  },
  {
    id: "slow-burn",
    label: "Slow Burn",
    description: "A mystery that unfolds over time",
  },
]

export const STAKES_OPTIONS = [
  {
    id: "personal",
    label: "Personal",
    description: "Your own fate hangs in the balance",
  },
  {
    id: "community",
    label: "Community",
    description: "A village or town depends on you",
  },
  {
    id: "kingdom",
    label: "Kingdom",
    description: "The fate of a realm rests on your shoulders",
  },
  {
    id: "world",
    label: "World",
    description: "All of Middle-earth is at stake",
  },
]
