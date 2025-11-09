"use client"

import { getItemIcon, getItemColor } from "@/lib/item-icons"
import { cn } from "@/lib/utils"
import type { InventoryItem } from "@/lib/types"

interface InventoryItemProps {
  item?: InventoryItem
  onClick?: () => void
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  interactive?: boolean
}

export function InventoryItemCard({
  item,
  onClick,
  showLabel = false,
  size = "md",
  interactive = false,
}: InventoryItemProps) {
  const Icon = item ? getItemIcon(item.name) : null
  const iconColor = item ? getItemColor(item.name) : "text-[hsl(35,40%,50%)]"

  const sizeClasses = {
    sm: "h-14 w-14",
    md: "h-20 w-20",
    lg: "h-24 w-24",
  }

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          sizeClasses[size],
          "rounded bg-[hsl(35,40%,92%)] border-2 border-[hsl(35,40%,70%)] flex items-center justify-center relative group",
          interactive &&
            item &&
            "cursor-pointer hover:bg-[hsl(35,40%,88%)] hover:border-[hsl(35,50%,60%)] transition-colors",
          !item && "opacity-50",
        )}
        onClick={onClick}
      >
        {Icon && <Icon className={cn(iconSizes[size], iconColor)} />}

        {interactive && item && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[hsl(35,40%,20%)] text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-75 pointer-events-none z-10">
            {item.name}
          </div>
        )}

        {item && item.quantity > 1 && (
          <div className="absolute -bottom-1 -right-1 bg-[hsl(35,50%,50%)] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-[hsl(35,40%,20%)]">
            {item.quantity}
          </div>
        )}
      </div>

      {showLabel && item && (
        <p className="text-xs text-center text-[hsl(35,40%,30%)] font-medium line-clamp-2 leading-tight max-w-full">
          {item.name}
        </p>
      )}
    </div>
  )
}
