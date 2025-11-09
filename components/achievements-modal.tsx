"use client"

import type * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Trophy, Lock, Sparkles, Sword, Shield, Scroll, Crown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  unlocked: boolean
  rarity: "common" | "rare" | "epic" | "legendary"
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-steps",
    title: "First Steps",
    description: "Begin your first adventure in Middle-earth",
    icon: Sparkles,
    unlocked: true,
    rarity: "common",
  },
  {
    id: "brave-warrior",
    title: "Brave Warrior",
    description: "Win your first battle",
    icon: Sword,
    unlocked: false,
    rarity: "common",
  },
  {
    id: "defender",
    title: "Stalwart Defender",
    description: "Survive a battle with less than 20% health",
    icon: Shield,
    unlocked: false,
    rarity: "rare",
  },
  {
    id: "critical-success",
    title: "Lucky Roll",
    description: "Roll a natural 20 on a crucial check",
    icon: Trophy,
    unlocked: false,
    rarity: "rare",
  },
  {
    id: "storyteller",
    title: "Tale Spinner",
    description: "Make 50 choices in your adventures",
    icon: Scroll,
    unlocked: false,
    rarity: "epic",
  },
  {
    id: "legendary-hero",
    title: "Legendary Hero",
    description: "Complete 3 scenarios with different characters",
    icon: Crown,
    unlocked: false,
    rarity: "legendary",
  },
]

const RARITY_CONFIG = {
  common: {
    label: "Common",
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30",
  },
  rare: {
    label: "Rare",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  epic: {
    label: "Epic",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  legendary: {
    label: "Legendary",
    color: "text-gold",
    bgColor: "bg-gold/10",
    borderColor: "border-gold/30",
  },
}

interface AchievementsModalProps {
  onClose: () => void
}

export function AchievementsModal({ onClose }: AchievementsModalProps) {
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length
  const totalCount = ACHIEVEMENTS.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal content with explicit opaque background */}
      <div className="relative w-full max-w-2xl max-h-[80vh] flex flex-col bg-[hsl(50,80%,97%)] rounded-lg shadow-2xl border-2 border-[hsl(30,40%,70%)] animate-[fade-in-up_0.2s_ease-out]">
        {/* Header */}
        <div className="p-6 border-b border-[hsl(30,40%,80%)]">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold flex items-center gap-2 text-[hsl(30,40%,20%)]">
                <Trophy className="h-6 w-6 text-[hsl(45,90%,45%)]" />
                Achievements
              </h2>
              <p className="text-sm text-[hsl(30,30%,40%)]">
                {unlockedCount} of {totalCount} unlocked
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Achievements List */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-3">
            {ACHIEVEMENTS.map((achievement) => {
              const Icon = achievement.icon
              const rarityConfig = RARITY_CONFIG[achievement.rarity]

              return (
                <Card
                  key={achievement.id}
                  className={cn(
                    "p-4 transition-all bg-white/80 border-[hsl(30,40%,80%)]",
                    achievement.unlocked ? "hover:bg-white/90" : "opacity-60",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                        achievement.unlocked ? rarityConfig.bgColor : "bg-muted",
                      )}
                    >
                      {achievement.unlocked ? (
                        <Icon className={cn("w-6 h-6", rarityConfig.color)} />
                      ) : (
                        <Lock className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-[family-name:var(--font-heading)] font-semibold">
                          {achievement.unlocked ? achievement.title : "???"}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs shrink-0",
                            rarityConfig.bgColor,
                            rarityConfig.color,
                            rarityConfig.borderColor,
                          )}
                        >
                          {rarityConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground text-pretty">
                        {achievement.unlocked ? achievement.description : "Complete hidden requirements to unlock"}
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </ScrollArea>

        {/* Footer Stats */}
        <div className="p-4 border-t border-[hsl(30,40%,80%)] bg-[hsl(50,60%,92%)]">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-[hsl(30,30%,40%)]">Progress</p>
              <p className="font-bold text-lg text-[hsl(30,40%,20%)]">
                {Math.round((unlockedCount / totalCount) * 100)}%
              </p>
            </div>
            <div className="h-8 w-px bg-[hsl(30,40%,80%)]" />
            <div className="text-center">
              <p className="text-[hsl(30,30%,40%)]">Unlocked</p>
              <p className="font-bold text-lg text-[hsl(30,40%,20%)]">{unlockedCount}</p>
            </div>
            <div className="h-8 w-px bg-[hsl(30,40%,80%)]" />
            <div className="text-center">
              <p className="text-[hsl(30,30%,40%)]">Remaining</p>
              <p className="font-bold text-lg text-[hsl(30,40%,20%)]">{totalCount - unlockedCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
