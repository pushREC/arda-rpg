/**
 * Item Icon Mapping for Inventory UI
 *
 * This file maps item name keywords to Lucide React icons.
 * The keywords are centralized in lib/rules.ts (VALID_ITEM_KEYWORDS).
 *
 * When the AI generates items, it must use keywords from VALID_ITEM_KEYWORDS
 * to ensure proper icon rendering in the UI.
 *
 * See lib/rules.ts for the authoritative list of valid keywords.
 */
import {
  Sword,
  Shield,
  Shirt,
  Sparkles,
  Scroll,
  BookOpen,
  Wrench,
  Gem,
  Coins,
  Flame,
  Package,
  MapPin,
  Compass,
  Tent,
  Wheat,
  Apple,
  Wine,
  Wand2,
  Crown,
  Key,
  Pickaxe,
  Axe,
  Hammer,
  Zap,
  Heart,
  Droplet,
  Star,
  Moon,
  Sun,
  Feather,
  Bone,
  Fish,
  Flower2,
  Leaf,
  Skull,
  Target,
  Backpack,
  Badge as Bandage,
  Beaker,
  Bell,
  Box,
  Calculator,
  Cable as Candle,
  Diamond,
  Egg,
  FishSymbol,
  FlaskConical,
  Glasses,
  Globe,
  Hourglass,
  Music,
  Paintbrush,
  Palette,
  PenTool,
  Pipette,
  Scissors,
  type LucideIcon,
} from "lucide-react"

/**
 * Maps item name keywords to Lucide icons.
 * Keywords match VALID_ITEM_KEYWORDS from lib/rules.ts.
 */
export const ITEM_ICONS: Record<string, LucideIcon> = {
  // Weapons - More variety
  sword: Sword,
  longsword: Sword,
  greatsword: Sword,
  shortsword: Target,
  dagger: Feather,
  knife: Feather,
  "hunter's knife": Feather,
  longbow: Target,
  bow: Target,
  crossbow: Target,
  axe: Axe,
  battleaxe: Axe,
  warhammer: Hammer,
  hammer: Hammer,
  mace: Hammer,
  spear: Target,
  staff: Wand2,
  quarterstaff: Wrench,

  // Armor & Protection - More variety
  shield: Shield,
  "wooden shield": Shield,
  "iron shield": Shield,
  armor: Shield,
  chainmail: Shield,
  "chainmail armor": Shield,
  "plate armor": Shield,
  "leather armor": Shirt,
  helmet: Crown,
  gauntlets: Wrench,
  boots: Shirt,

  // Clothing - More variety
  clothes: Shirt,
  "fine clothes": Shirt,
  cloak: Shirt,
  "travel cloak": Shirt,
  robes: Shirt,
  "scholar's robes": Shirt,
  tunic: Shirt,
  vest: Shirt,
  hat: Crown,

  // Magic Items - More variety
  "ancient text": Sparkles,
  scroll: Scroll,
  "magic scroll": Scroll,
  rune: Star,
  "rune stone": Star,
  wand: Wand2,
  "magic wand": Wand2,
  orb: Moon,
  "crystal orb": Moon,
  amulet: Star,
  "magic amulet": Star,
  ring: Diamond,
  "magic ring": Diamond,
  talisman: Sun,
  charm: Sparkles,
  "enchanted item": Sparkles,

  // Books & Knowledge - More variety
  book: BookOpen,
  tome: BookOpen,
  text: BookOpen,
  journal: BookOpen,
  ledger: Calculator,
  "merchant's ledger": Calculator,
  map: MapPin,
  "weathered map": MapPin,
  "treasure map": MapPin,
  chart: Compass,
  atlas: Globe,
  manuscript: Scroll,

  // Tools - More variety
  rope: Wrench,
  "rope (50ft)": Wrench,
  supplies: Package,
  "writing supplies": PenTool,
  "walking staff": Wrench,
  "flint and steel": Flame,
  pickaxe: Pickaxe,
  shovel: Wrench,
  crowbar: Wrench,
  grappling: Wrench,
  "grappling hook": Wrench,
  lockpicks: Key,
  "thieves' tools": Scissors,
  compass: Compass,
  spyglass: Glasses,
  telescope: Glasses,

  // Treasure - More variety
  gem: Gem,
  ruby: Gem,
  emerald: Gem,
  sapphire: Diamond,
  diamond: Diamond,
  jewel: Diamond,
  gold: Coins,
  silver: Coins,
  coins: Coins,
  purse: Coins,
  "coin purse": Coins,
  crown: Crown,
  "golden crown": Crown,
  necklace: Star,
  bracelet: Diamond,

  // Consumables - More variety
  potion: FlaskConical,
  "health potion": Heart,
  "mana potion": Zap,
  elixir: Beaker,
  "healing elixir": Heart,
  food: Apple,
  "trail rations": Wheat,
  bread: Wheat,
  meat: Bone,
  fish: Fish,
  cheese: Package,
  apple: Apple,
  berries: Flower2,
  herbs: Leaf,
  water: Droplet,
  waterskin: Wine,
  ale: Wine,
  wine: Wine,
  "bottle of wine": Wine,
  bandage: Bandage,
  "healing salve": Heart,

  // Quest Items - More variety
  key: Key,
  "old key": Key,
  "golden key": Key,
  artifact: Crown,
  relic: Star,
  "ancient relic": Star,
  "quest item": Sparkles,
  letter: Scroll,
  note: Scroll,
  token: Coins,
  badge: Shield,
  seal: Star,

  // Supplies & Gear - More variety
  bedroll: Tent,
  tent: Tent,
  "camping gear": Tent,
  lantern: Flame,
  torch: Flame,
  candle: Candle,
  wares: Package,
  "sample wares": Package,
  quiver: Backpack,
  "quiver (20 arrows)": Backpack,
  arrows: Target,
  backpack: Backpack,
  "adventuring pack": Backpack,
  sack: Package,
  chest: Box,
  "treasure chest": Box,
  barrel: Package,
  crate: Box,
  hourglass: Hourglass,
  bell: Bell,
  horn: Music,
  flute: Music,
  drum: Music,

  // Nature & Misc - More variety
  feather: Feather,
  bone: Bone,
  skull: Skull,
  egg: Egg,
  shell: FishSymbol,
  flower: Flower2,
  leaf: Leaf,
  seed: Flower2,
  vial: Pipette,
  jar: FlaskConical,
  bottle: Wine,
  paint: Palette,
  ink: Paintbrush,
  quill: Feather,
  parchment: Scroll,
  canvas: Palette,
  brush: Paintbrush,
  chisel: Hammer,
  needle: PenTool,
  thread: Wrench,

  // Default
  default: Package,
}

/**
 * Adjective keywords (low priority) - these are modifiers, not item types.
 * Only match these if no specific item type is found.
 */
const ADJECTIVE_KEYWORDS = [
  "gold",
  "golden",
  "silver",
  "ancient",
  "magic",
  "enchanted",
  "old",
  "fine",
  "crude",
  "rusty",
  "broken",
  "weathered",
]

export function getItemIcon(itemName: string): LucideIcon {
  const normalizedName = itemName.toLowerCase().trim()

  // Try exact match first
  if (ITEM_ICONS[normalizedName]) {
    return ITEM_ICONS[normalizedName]
  }

  // Collect all matches with priority scoring
  const matches: Array<{ key: string; icon: LucideIcon; priority: number }> = []

  for (const [key, icon] of Object.entries(ITEM_ICONS)) {
    if (key === "default") continue

    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      // Calculate priority:
      // - Longer matches are more specific (e.g., "longsword" > "sword")
      // - Adjectives get lower priority
      const isAdjective = ADJECTIVE_KEYWORDS.includes(key)
      const priority = isAdjective ? key.length : key.length + 100

      matches.push({ key, icon, priority })
    }
  }

  // Return highest priority match
  if (matches.length > 0) {
    matches.sort((a, b) => b.priority - a.priority)
    return matches[0].icon
  }

  // Default fallback
  return ITEM_ICONS.default
}

export function getItemColor(itemName: string): string {
  const normalizedName = itemName.toLowerCase()

  // Weapons - red tones
  if (
    normalizedName.includes("sword") ||
    normalizedName.includes("bow") ||
    normalizedName.includes("knife") ||
    normalizedName.includes("dagger") ||
    normalizedName.includes("axe") ||
    normalizedName.includes("spear") ||
    normalizedName.includes("arrow")
  ) {
    return "text-red-600"
  }

  // Armor - green tones
  if (normalizedName.includes("shield") || normalizedName.includes("armor") || normalizedName.includes("helmet")) {
    return "text-green-600"
  }

  // Consumables - blue tones
  if (
    normalizedName.includes("potion") ||
    normalizedName.includes("food") ||
    normalizedName.includes("water") ||
    normalizedName.includes("bread") ||
    normalizedName.includes("meat") ||
    normalizedName.includes("elixir") ||
    normalizedName.includes("salve") ||
    normalizedName.includes("bandage")
  ) {
    return "text-blue-600"
  }

  // Treasure - yellow/gold tones
  if (
    normalizedName.includes("gold") ||
    normalizedName.includes("coin") ||
    normalizedName.includes("gem") ||
    normalizedName.includes("jewel") ||
    normalizedName.includes("diamond") ||
    normalizedName.includes("ruby") ||
    normalizedName.includes("crown")
  ) {
    return "text-yellow-600"
  }

  // Books & Knowledge - purple tones
  if (
    normalizedName.includes("scroll") ||
    normalizedName.includes("book") ||
    normalizedName.includes("text") ||
    normalizedName.includes("ledger") ||
    normalizedName.includes("map") ||
    normalizedName.includes("tome") ||
    normalizedName.includes("manuscript")
  ) {
    return "text-purple-600"
  }

  // Magic - pink/magenta tones
  if (
    normalizedName.includes("magic") ||
    normalizedName.includes("ancient") ||
    normalizedName.includes("rune") ||
    normalizedName.includes("enchanted") ||
    normalizedName.includes("wand") ||
    normalizedName.includes("orb") ||
    normalizedName.includes("amulet") ||
    normalizedName.includes("talisman")
  ) {
    return "text-pink-600"
  }

  // Tools & Supplies - amber tones
  if (
    normalizedName.includes("rope") ||
    normalizedName.includes("tool") ||
    normalizedName.includes("supplies") ||
    normalizedName.includes("compass") ||
    normalizedName.includes("lantern") ||
    normalizedName.includes("torch")
  ) {
    return "text-amber-600"
  }

  // Clothing - brown tones
  if (
    normalizedName.includes("cloth") ||
    normalizedName.includes("robe") ||
    normalizedName.includes("cloak") ||
    normalizedName.includes("tunic")
  ) {
    return "text-orange-700"
  }

  return "text-[hsl(35,40%,50%)]"
}
