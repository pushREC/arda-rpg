export interface Achievement {
  id: string
  title: string
  description: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  {
    id: "first-steps",
    title: "First Steps",
    description: "Begin your first adventure in Middle-earth",
    rarity: "common",
  },
  {
    id: "brave-warrior",
    title: "Brave Warrior",
    description: "Win your first battle",
    rarity: "common",
  },
  {
    id: "defender",
    title: "Stalwart Defender",
    description: "Survive a battle with less than 20% health",
    rarity: "rare",
  },
  {
    id: "critical-success",
    title: "Lucky Roll",
    description: "Roll a natural 20 on a crucial check",
    rarity: "rare",
  },
  {
    id: "storyteller",
    title: "Tale Spinner",
    description: "Make 50 choices in your adventures",
    rarity: "epic",
  },
  {
    id: "legendary-hero",
    title: "Legendary Hero",
    description: "Complete 3 scenarios with different characters",
    rarity: "legendary",
  },
]

export function getUnlockedAchievements(): string[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("achievements")
  return stored ? JSON.parse(stored) : ["first-steps"]
}

export function unlockAchievement(achievementId: string): boolean {
  if (typeof window === "undefined") return false

  const unlocked = getUnlockedAchievements()

  if (unlocked.includes(achievementId)) {
    return false // Already unlocked
  }

  unlocked.push(achievementId)
  localStorage.setItem("achievements", JSON.stringify(unlocked))
  return true
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((a) => a.id === id)
}
