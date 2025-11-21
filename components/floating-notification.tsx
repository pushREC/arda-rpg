"use client"

import * as React from "react"
import { Heart, Coins, Package, Sparkles, Swords, Shield, Skull } from "lucide-react"

export type NotificationType = "health" | "gold" | "item" | "xp" | "damage" | "defense" | "crit"

interface FloatingNotificationProps {
  type: NotificationType
  value: number | string
  id: string
  onComplete: (id: string) => void
}

const typeConfig: Record<
  NotificationType,
  { icon: React.ElementType; color: string; prefix: string; bgColor: string }
> = {
  health: { icon: Heart, color: "text-green-600", prefix: "+", bgColor: "bg-green-100 border-green-300" },
  gold: { icon: Coins, color: "text-yellow-600", prefix: "+", bgColor: "bg-yellow-100 border-yellow-300" },
  item: { icon: Package, color: "text-blue-600", prefix: "", bgColor: "bg-blue-100 border-blue-300" },
  xp: { icon: Sparkles, color: "text-purple-600", prefix: "+", bgColor: "bg-purple-100 border-purple-300" },
  damage: { icon: Swords, color: "text-red-600", prefix: "-", bgColor: "bg-red-100 border-red-300" },
  defense: { icon: Shield, color: "text-cyan-600", prefix: "+", bgColor: "bg-cyan-100 border-cyan-300" },
  crit: { icon: Skull, color: "text-red-600", prefix: "CRITICAL HIT! -", bgColor: "bg-red-100 border-red-600 border-4 scale-110 shadow-[0_0_15px_rgba(220,38,38,0.5)]" },
}

export function FloatingNotification({ type, value, id, onComplete }: FloatingNotificationProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(id)
    }, 2000)
    return () => clearTimeout(timer)
  }, [id, onComplete])

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 shadow-lg ${config.bgColor} animate-[float-up_2s_ease-out_forwards]`}
    >
      <Icon className={`h-4 w-4 ${config.color}`} />
      <span className={`font-bold text-sm ${config.color}`}>
        {config.prefix}
        {value}
      </span>
    </div>
  )
}
