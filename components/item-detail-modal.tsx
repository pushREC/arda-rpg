"use client"
import { X, Swords, Shield, Heart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ItemDetailModalProps {
  isOpen: boolean
  item: any
  onClose: () => void
  onUse?: () => void
  onEquip?: () => void
  onDrop?: () => void
  onSell?: (sellValue: number) => void
}

export function ItemDetailModal({ isOpen, item, onClose, onUse, onEquip, onDrop, onSell }: ItemDetailModalProps) {
  if (!isOpen || !item) return null

  const sellValue = Math.floor((item.value || 0) / 2)

  const getItemIcon = () => {
    if (item.type === "weapon") return Swords
    if (item.type === "armor") return Shield
    if (item.type === "consumable") return Heart
    return Sparkles
  }

  const ItemIcon = getItemIcon()

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 animate-in fade-in duration-200">
      <div className="w-full max-w-md mx-4 bg-[hsl(50,80%,97%)] border-4 border-[hsl(35,40%,60%)] rounded-lg shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b-2 border-[hsl(35,40%,70%)] bg-[hsl(50,70%,90%)] flex items-center justify-between">
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[hsl(25,50%,25%)]">
            {item.name}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-[hsl(35,40%,85%)]">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Item Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-lg border-2 border-[hsl(35,40%,70%)] bg-[hsl(50,80%,92%)] flex items-center justify-center">
              <ItemIcon className="h-10 w-10 text-[hsl(35,60%,40%)]" />
            </div>
          </div>

          {/* Description */}
          <div className="p-4 bg-[hsl(35,40%,92%)] rounded-lg border-2 border-[hsl(35,40%,70%)]">
            <p className="text-sm text-[hsl(35,40%,30%)] text-center">{item.description || "A mysterious item."}</p>
          </div>

          {/* Stats */}
          {item.stats && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[hsl(35,40%,40%)] uppercase">Effects</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(item.stats).map(([stat, value]) => (
                  <div key={stat} className="p-2 bg-[hsl(45,60%,88%)] rounded border border-[hsl(45,60%,70%)]">
                    <div className="text-xs text-[hsl(35,40%,40%)] capitalize">{stat}</div>
                    <div className="text-lg font-bold text-[hsl(25,50%,25%)]">+{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2">
            {onUse && item.type === "consumable" && (
              <Button onClick={onUse} className="w-full bg-[hsl(30,50%,40%)] hover:bg-[hsl(30,50%,35%)] text-white">
                Use Item
              </Button>
            )}
            {onEquip && (item.type === "weapon" || item.type === "armor") && (
              <Button onClick={onEquip} className="w-full bg-[hsl(30,50%,40%)] hover:bg-[hsl(30,50%,35%)] text-white">
                {item.equipped ? "Unequip" : "Equip"}
              </Button>
            )}
            {onSell && item.type !== "quest" && item.value && item.value > 0 && (
              <Button
                onClick={() => onSell(sellValue)}
                variant="outline"
                className="w-full border-2 border-[hsl(35,60%,50%)] text-[hsl(35,60%,40%)] hover:bg-[hsl(35,60%,95%)] bg-transparent"
              >
                Sell for {sellValue} Gold
              </Button>
            )}
            {onDrop && (
              <Button
                onClick={onDrop}
                variant="outline"
                className="w-full border-2 border-red-500 text-red-600 hover:bg-red-50 bg-transparent"
              >
                Drop Item
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
