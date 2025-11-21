"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, ShoppingBag, Sparkles } from "lucide-react"
import { VALID_ITEM_KEYWORDS } from "@/lib/rules"
import type { MerchantItem, InventoryItem } from "@/lib/types"
import { toast } from "sonner"
import { useGame } from "@/lib/game-context"
import { generateUUID } from "@/lib/utils"
import { generateItemStats, generateItemEffect, MAX_INVENTORY_SIZE } from "@/lib/game-logic"
import { cn } from "@/lib/utils"

interface MerchantModalProps {
  isOpen: boolean
  onClose: () => void
  characterGold: number
  onPurchaseComplete?: () => void
}

function generateMerchantItem(): MerchantItem {
  // Select a random keyword from VALID_ITEM_KEYWORDS
  const keywords = [...VALID_ITEM_KEYWORDS]
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)]

  // Determine item type based on keyword
  let type: MerchantItem["type"] = "utility"
  const keyword = randomKeyword.toLowerCase()

  if (["sword", "longsword", "greatsword", "shortsword", "dagger", "knife", "bow", "longbow", "crossbow", "axe", "battleaxe", "hammer", "warhammer", "mace", "spear", "staff", "quarterstaff"].includes(keyword)) {
    type = "weapon"
  } else if (["shield", "armor", "chainmail", "helmet", "gauntlets", "boots"].includes(keyword)) {
    type = "armor"
  } else if (["potion", "elixir", "bandage", "salve"].includes(keyword)) {
    type = "potion"
  }

  // Generate item name with prefix
  const prefixes = ["Iron", "Steel", "Elven", "Dwarven", "Ancient", "Mystical", "Enchanted", "Common", "Fine", "Rusted"]
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const name = `${prefix} ${randomKeyword.charAt(0).toUpperCase() + randomKeyword.slice(1)}`

  // Generate price (15-50 gold as per spec)
  const price = Math.floor(Math.random() * 36) + 15 // 15-50

  // Determine rarity
  let rarity: MerchantItem["rarity"] = "common"
  if (price > 40) {
    rarity = "rare"
  } else if (price > 30) {
    rarity = "legendary"
  }

  // Generate stats for weapons and armor (TICKET 10.1)
  const stats = (type === "weapon" || type === "armor")
    ? generateItemStats(randomKeyword, rarity)
    : undefined

  return {
    id: `merchant-${generateUUID()}`,
    name,
    description: `A ${rarity} ${randomKeyword} available for purchase.`,
    type,
    price,
    rarity,
    stats,
  }
}

function convertMerchantItemToInventory(item: MerchantItem): InventoryItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    type: item.type === "utility" ? "quest" : item.type,
    quantity: 1,
    value: item.price,
    equipped: false,
    consumable: item.type === "potion",
    stats: item.stats, // Include stats from merchant item (TICKET 10.1)
    effect: generateItemEffect(item.name, item.rarity), // Generate effect for consumables (SPRINT 10.1)
  }
}

export function MerchantModal({ isOpen, onClose, characterGold, onPurchaseComplete }: MerchantModalProps) {
  const [shopInventory, setShopInventory] = React.useState<MerchantItem[]>([])
  // [TICKET 18.5] Migrated from Zustand to React Context
  const { character, addGold, addInventoryItem } = useGame()
  const inventoryCount = character?.inventory.length || 0
  const isInventoryFull = inventoryCount >= MAX_INVENTORY_SIZE

  // Generate shop inventory on mount
  React.useEffect(() => {
    if (isOpen && shopInventory.length === 0) {
      const items = [
        generateMerchantItem(),
        generateMerchantItem(),
        generateMerchantItem(),
      ]
      setShopInventory(items)
    }
  }, [isOpen, shopInventory.length])

  const handleBuy = (item: MerchantItem) => {
    if (isInventoryFull) {
      toast.error("Inventory is full!")
      return
    }

    if (characterGold < item.price) {
      toast.error("Not enough gold!")
      return
    }

    // [TICKET 18.5] Deduct gold using React Context
    addGold(-item.price)

    // Add item to inventory using React Context
    const inventoryItem = convertMerchantItemToInventory(item)
    addInventoryItem(inventoryItem)

    // Remove item from shop inventory (prevent buying twice)
    setShopInventory((prev) => prev.filter((i) => i.id !== item.id))

    toast.success(`Bought ${item.name} for ${item.price}g`, {
      description: "Item added to inventory",
    })
  }

  const handleLeaveShop = () => {
    onClose()
    if (onPurchaseComplete) {
      onPurchaseComplete()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleLeaveShop()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-heading)] text-2xl flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            Traveling Merchant
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Gold Display */}
          <div className="flex items-center justify-between p-4 bg-[hsl(50,70%,92%)] rounded-lg border-2 border-[hsl(45,80%,40%)]">
            <span className="font-medium text-[hsl(25,50%,25%)]">Your Gold</span>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-[hsl(45,80%,40%)]" />
              <span className="font-bold text-lg text-[hsl(45,80%,40%)]">{characterGold}</span>
            </div>
          </div>

          {/* Shop Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shopInventory.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-[hsl(45,80%,40%)] flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{item.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground capitalize">
                      {item.type}
                    </span>
                    <span className="text-xs px-2 py-1 bg-[hsl(50,70%,85%)] rounded-full capitalize">
                      {item.rarity}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <div className="w-full flex items-center justify-between">
                    <span className="font-bold text-[hsl(45,80%,40%)] flex items-center gap-1">
                      <Coins className="h-4 w-4" />
                      {item.price}g
                    </span>
                  </div>
                  <Button
                    onClick={() => handleBuy(item)}
                    disabled={characterGold < item.price || isInventoryFull}
                    className="w-full"
                    variant={characterGold < item.price || isInventoryFull ? "outline" : "default"}
                  >
                    {isInventoryFull ? "Inventory Full" : characterGold < item.price ? "Too Expensive" : "Buy"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {shopInventory.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>The merchant has sold out!</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row items-center">
          <div className={cn("text-xs font-mono mr-auto", isInventoryFull ? "text-red-500 font-bold" : "text-muted-foreground")}>
            Capacity: {inventoryCount}/{MAX_INVENTORY_SIZE}
          </div>
          <Button onClick={handleLeaveShop} variant="outline" className="w-full sm:w-auto">
            Leave Shop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
