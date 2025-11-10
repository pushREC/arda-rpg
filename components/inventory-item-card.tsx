"use client"

import * as React from "react"
import { Swords, Shield, Droplet, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { ItemDetailModal } from "./item-detail-modal"

interface InventoryItemCardProps {
  item?: any
  size?: "sm" | "lg"
  interactive?: boolean
  onUse?: () => void
  onEquip?: () => void
  onDrop?: () => void
}

export function InventoryItemCard({
  item,
  size = "sm",
  interactive = false,
  onUse,
  onEquip,
  onDrop,
}: InventoryItemCardProps) {
  const [showDetail, setShowDetail] = React.useState(false)

  const getItemIcon = () => {
    if (!item) return null
    if (item.type === "weapon") return Swords
    if (item.type === "armor") return Shield
    if (item.type === "consumable") return Droplet
    return Sparkles
  }

  const ItemIcon = getItemIcon()

  const sizeClasses = {
    sm: "w-full aspect-square p-2",
    lg: "w-full aspect-square p-4",
  }

  const iconSizes = {
    sm: "h-6 w-6",
    lg: "h-10 w-10",
  }

  if (!item) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          "border-2 border-dashed border-[hsl(35,40%,75%)] rounded bg-[hsl(50,80%,94%)] flex items-center justify-center",
        )}
      >
        <div className="w-4 h-4 border-2 border-dashed border-[hsl(35,40%,70%)] rounded-full" />
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => interactive && setShowDetail(true)}
        disabled={!interactive}
        className={cn(
          sizeClasses[size],
          "border-2 border-[hsl(35,40%,60%)] rounded bg-[hsl(50,80%,92%)] flex flex-col items-center justify-center gap-1 shadow-sm",
          interactive &&
            "hover:bg-[hsl(50,80%,88%)] hover:border-[hsl(30,50%,40%)] hover:-translate-y-0.5 transition-all cursor-pointer",
          item.equipped && "ring-2 ring-[hsl(45,80%,50%)] ring-offset-2",
        )}
        title={item.name}
      >
        {ItemIcon && <ItemIcon className={cn(iconSizes[size], "text-[hsl(35,60%,40%)]")} />}
        {size === "lg" && (
          <span className="text-xs font-medium text-[hsl(25,50%,25%)] text-center line-clamp-1">{item.name}</span>
        )}
      </button>

      <ItemDetailModal
        isOpen={showDetail}
        item={item}
        onClose={() => setShowDetail(false)}
        onUse={onUse}
        onEquip={onEquip}
        onDrop={onDrop}
      />
    </>
  )
}
