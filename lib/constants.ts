import type { Race, Scenario, Achievement } from "./types"

export const RACE_INFO: Record<
  Race,
  {
    name: string
    description: string
    bonuses: string[]
    imageUrl: string
  }
> = {
  human: {
    name: "Human",
    description: "Versatile and adaptable, humans excel in all endeavors through sheer determination.",
    bonuses: ["+2 to any one stat (your choice)", "Versatile ability"],
    imageUrl: "/placeholder.svg?height=200&width=200",
  },
  elf: {
    name: "Elf",
    description: "Ancient and wise, elves possess keen senses and natural grace.",
    bonuses: ["+2 Lore", "+1 Wisdom", "Keen Senses"],
    imageUrl: "/placeholder.svg?height=200&width=200",
  },
  dwarf: {
    name: "Dwarf",
    description: "Hardy and resilient, dwarves are master craftsmen with unbreakable spirits.",
    bonuses: ["+2 Endurance", "+1 Craft", "Stone-cunning"],
    imageUrl: "/placeholder.svg?height=200&width=200",
  },
  hobbit: {
    name: "Hobbit",
    description: "Small but brave, hobbits rely on luck and cleverness to overcome challenges.",
    bonuses: ["+2 Fellowship", "+1 Wisdom", "Brave"],
    imageUrl: "/placeholder.svg?height=200&width=200",
  },
}

// NOTE: BASE_STATS and STAT_NAMES were removed because they used D&D 5e stats.
// This game uses a custom 6-stat system: valor, wisdom, fellowship, craft, endurance, lore.
// See lib/character-data.ts for the correct stat system implementation.

export const SCENARIOS: Scenario[] = [
  {
    id: "prancing-pony",
    title: "The Prancing Pony",
    description: "A mysterious stranger awaits you in the corner of Bree's most famous inn.",
    difficulty: "easy",
    estimatedTime: "5-10 min",
    imageUrl: "/placeholder.svg?height=300&width=400",
    unlocked: true,
  },
  {
    id: "misty-mountains",
    title: "Passage Through Moria",
    description: "The ancient dwarven halls hold both treasure and terror in equal measure.",
    difficulty: "hard",
    estimatedTime: "15-20 min",
    imageUrl: "/placeholder.svg?height=300&width=400",
    unlocked: true,
  },
  {
    id: "fangorn-forest",
    title: "The Old Forest",
    description: "Ancient trees whisper secrets as you venture into the untamed wilderness.",
    difficulty: "medium",
    estimatedTime: "10-15 min",
    imageUrl: "/placeholder.svg?height=300&width=400",
    unlocked: true,
  },
  {
    id: "helms-deep",
    title: "Defense of the Hornburg",
    description: "Stand with the defenders as darkness gathers at the walls.",
    difficulty: "legendary",
    estimatedTime: "20-30 min",
    imageUrl: "/placeholder.svg?height=300&width=400",
    unlocked: true,
  },
  {
    id: "custom",
    title: "Your Own Tale",
    description: "Craft your own adventure in Middle-earth.",
    difficulty: "medium",
    estimatedTime: "Variable",
    unlocked: true,
  },
]

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-steps",
    title: "First Steps",
    description: "Complete your first adventure",
    unlocked: false,
    icon: "🎯",
  },
  {
    id: "natural-20",
    title: "Natural 20",
    description: "Roll a natural 20 on a skill check",
    unlocked: false,
    icon: "🎲",
  },
  {
    id: "companion-bond",
    title: "Bonds of Fellowship",
    description: "Reach 75+ relationship with a companion",
    unlocked: false,
    icon: "🤝",
  },
  {
    id: "treasure-hunter",
    title: "Treasure Hunter",
    description: "Collect 1000 gold",
    unlocked: false,
    icon: "💰",
  },
  {
    id: "master-persuader",
    title: "Silver Tongue",
    description: "Succeed on 5 fellowship checks",
    unlocked: false,
    icon: "🗣️",
  },
]
