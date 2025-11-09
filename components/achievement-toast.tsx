"use client"
import { Trophy } from "lucide-react"

interface AchievementToastProps {
  title: string
  description: string
}

export function AchievementToast({ title, description }: AchievementToastProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-gold/20 to-gold/5 border-2 border-gold/30 rounded-lg shadow-lg">
      <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center shrink-0">
        <Trophy className="w-5 h-5 text-gold" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold">Achievement Unlocked!</p>
        <p className="font-[family-name:var(--font-heading)] font-semibold text-base">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
