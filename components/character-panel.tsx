"use client"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Heart,
  Swords,
  Shield,
  Sparkles,
  Trophy,
  Eye,
  Users,
  Hammer,
  BookOpen,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Coins,
} from "lucide-react"
import * as React from "react"
import { GameModal } from "./game-modal"
import { InventoryItemCard } from "./inventory-item"
import { ItemDetailModal } from "./item-detail-modal"
import type { ActiveEffect } from "@/lib/types"

interface CharacterPanelProps {
  character: any
  currentHealth: number
  className?: string
  onViewAchievements?: () => void
  onItemClick?: (item: any) => void
  activeEffects?: ActiveEffect[]
}

export function CharacterPanel({
  character,
  currentHealth,
  className,
  onViewAchievements,
  onItemClick,
  activeEffects,
}: CharacterPanelProps) {
  console.log("[v0] CharacterPanel received character:", character)

  const [abilityExpanded, setAbilityExpanded] = React.useState(false)
  const [showInventoryModal, setShowInventoryModal] = React.useState(false)
  const [showStatsModal, setShowStatsModal] = React.useState(false)
  const [showAchievementsModal, setShowAchievementsModal] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<any>(null)
  const [showItemDetail, setShowItemDetail] = React.useState(false)

  const healthPercentage = (currentHealth / character.maxHealth) * 100
  const level = 1
  const experience = 0
  const experienceToNextLevel = 100
  const xpPercentage = (experience / experienceToNextLevel) * 100

  const raceName = character.race ? character.race.charAt(0).toUpperCase() + character.race.slice(1) : "Unknown"
  const backgroundName = character.background
    ? character.background.charAt(0).toUpperCase() + character.background.slice(1)
    : ""

  const handleItemClick = React.useCallback(
    (item: any) => {
      if (onItemClick) {
        onItemClick(item)
      } else {
        setSelectedItem(item)
        setShowItemDetail(true)
      }
    },
    [onItemClick],
  )

  return (
    <>
      <div className={`bg-[hsl(50,80%,97%)] border-2 border-[hsl(35,40%,60%)] rounded-lg p-3 space-y-3 ${className}`}>
        {/* Character Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-[family-name:var(--font-heading)] text-base font-bold leading-none">
              {character.name}
            </h3>
            <Badge variant="secondary" className="h-5 text-xs px-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Lvl {level}
            </Badge>
          </div>
          <p className="text-xs text-[hsl(35,40%,40%)]">
            {raceName} {backgroundName}
          </p>
        </div>

        <Separator className="bg-[hsl(35,40%,70%)]" />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-red-600 fill-red-600" />
              Health
            </span>
            <span className="text-sm font-bold">
              {currentHealth} / {character.maxHealth}
            </span>
          </div>
          <Progress
            value={healthPercentage}
            className={`h-2.5 ${
              healthPercentage > 50
                ? "[&>div]:bg-green-500"
                : healthPercentage > 25
                  ? "[&>div]:bg-yellow-500"
                  : "[&>div]:bg-red-500"
            }`}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[hsl(35,60%,50%)]" />
              Experience
            </span>
            <span className="text-sm font-bold text-[hsl(35,40%,40%)]">
              {experience} / {experienceToNextLevel}
            </span>
          </div>
          <Progress value={xpPercentage} className="h-2.5 [&>div]:bg-[hsl(35,60%,50%)]" />
        </div>

        <Separator className="bg-[hsl(35,40%,70%)]" />

        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-[hsl(35,40%,40%)] uppercase tracking-wide">Stats</p>
          <div className="grid grid-cols-3 gap-2">
            {/* Row 1 */}
            <div className="text-center space-y-0.5 p-1.5 rounded bg-[hsl(35,40%,92%)]">
              <Swords className="h-3.5 w-3.5 mx-auto text-orange-600" />
              <p className="text-[10px] text-[hsl(35,40%,40%)]">Valor</p>
              <p className="font-bold text-base leading-none">{character.stats.valor || 10}</p>
            </div>
            <div className="text-center space-y-0.5 p-1.5 rounded bg-[hsl(35,40%,92%)]">
              <Eye className="h-3.5 w-3.5 mx-auto text-purple-600" />
              <p className="text-[10px] text-[hsl(35,40%,40%)]">Wisdom</p>
              <p className="font-bold text-base leading-none">{character.stats.wisdom || 10}</p>
            </div>
            <div className="text-center space-y-0.5 p-1.5 rounded bg-[hsl(35,40%,92%)]">
              <Users className="h-3.5 w-3.5 mx-auto text-blue-600" />
              <p className="text-[10px] text-[hsl(35,40%,40%)]">Fellowship</p>
              <p className="font-bold text-base leading-none">{character.stats.fellowship || 10}</p>
            </div>

            {/* Row 2 */}
            <div className="text-center space-y-0.5 p-1.5 rounded bg-[hsl(35,40%,92%)]">
              <Hammer className="h-3.5 w-3.5 mx-auto text-amber-600" />
              <p className="text-[10px] text-[hsl(35,40%,40%)]">Craft</p>
              <p className="font-bold text-base leading-none">{character.stats.craft || 10}</p>
            </div>
            <div className="text-center space-y-0.5 p-1.5 rounded bg-[hsl(35,40%,92%)]">
              <Shield className="h-3.5 w-3.5 mx-auto text-green-600" />
              <p className="text-[10px] text-[hsl(35,40%,40%)]">Endurance</p>
              <p className="font-bold text-base leading-none">{character.stats.endurance || 10}</p>
            </div>
            <div className="text-center space-y-0.5 p-1.5 rounded bg-[hsl(35,40%,92%)]">
              <BookOpen className="h-3.5 w-3.5 mx-auto text-indigo-600" />
              <p className="text-[10px] text-[hsl(35,40%,40%)]">Lore</p>
              <p className="font-bold text-base leading-none">{character.stats.lore || 10}</p>
            </div>
          </div>
        </div>

        {/* [TICKET 15.2] Active Effects / Buffs Display */}
        {activeEffects && activeEffects.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[hsl(35,40%,70%)]">
            <p className="text-[10px] font-bold uppercase text-red-600 tracking-wide">
              Active Buffs ({activeEffects.length})
            </p>
            <div className="grid grid-cols-2 gap-2">
              {activeEffects.map(effect => (
                <div key={effect.id} className="bg-yellow-50 border border-yellow-300 p-2 rounded text-xs">
                  <span className="font-semibold">{effect.name}</span>
                  <span className="block text-yellow-700">
                    {effect.value > 0 ? "+" : ""}{effect.value} {effect.stat}
                  </span>
                  <span className="text-[10px] text-yellow-500">
                    {effect.remainingTurns} turns left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="bg-[hsl(35,40%,70%)]" />

        <div className="space-y-1">
          <button
            onClick={() => setAbilityExpanded(!abilityExpanded)}
            className="w-full flex items-center justify-between p-2 rounded bg-[hsl(45,60%,88%)] border border-[hsl(35,40%,70%)] hover:bg-[hsl(45,60%,85%)] transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[hsl(35,60%,40%)]" />
              <p className="text-xs font-semibold">{character.raceAbility || "Special Ability"}</p>
            </div>
            {abilityExpanded ? (
              <ChevronUp className="h-3.5 w-3.5 text-[hsl(35,40%,40%)]" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-[hsl(35,40%,40%)]" />
            )}
          </button>

          {abilityExpanded && (
            <p className="text-[10px] text-[hsl(35,40%,35%)] leading-snug px-2 py-1 animate-in fade-in slide-in-from-top-1 duration-200">
              {character.race === "human" && "Versatile: You can adapt to any situation with your flexible abilities."}
              {character.race === "elf" && "Keen Senses: Your sharp perception helps you detect hidden dangers."}
              {character.race === "dwarf" &&
                "Stone-cunning: Your knowledge of stonework helps you in underground environments."}
              {character.race === "hobbit" && "Brave: You have advantage on saving throws against being frightened."}
            </p>
          )}
        </div>

        <Separator className="bg-[hsl(35,40%,70%)]" />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-[hsl(35,40%,40%)] uppercase tracking-wide">Inventory</p>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px] px-2 border-2 border-[hsl(35,40%,60%)] bg-[hsl(50,80%,97%)] hover:bg-[hsl(50,80%,92%)] rounded shadow-[2px_2px_0px_0px_hsl(35,40%,60%)]"
              onClick={() => setShowInventoryModal(true)}
            >
              View All →
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {character.inventory && character.inventory.length > 0
              ? character.inventory
                  .slice(0, 4)
                  .map((item: any) => (
                    <InventoryItemCard
                      key={item.id}
                      item={item}
                      size="sm"
                      interactive
                      onClick={() => handleItemClick(item)}
                    />
                  ))
              : // Empty slots fallback
                [1, 2, 3, 4].map((i) => <InventoryItemCard key={i} size="sm" />)}
          </div>

          <div className="flex items-center justify-between px-2 py-2 bg-[hsl(45,60%,88%)] rounded border border-[hsl(35,40%,70%)]">
            <div className="flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5 text-[hsl(35,60%,40%)]" />
              <span className="text-xs font-semibold text-[hsl(35,40%,30%)]">Gold</span>
            </div>
            <span className="text-base font-bold text-[hsl(35,40%,20%)]">{character.gold || 0}</span>
          </div>
        </div>

        <Separator className="bg-[hsl(35,40%,70%)]" />

        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-[hsl(35,40%,40%)] uppercase tracking-wide">Quick Actions</p>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start h-8 text-xs border-2 border-[hsl(35,40%,60%)] bg-[hsl(50,80%,97%)] hover:bg-[hsl(50,80%,92%)] rounded shadow-[2px_2px_0px_0px_hsl(35,40%,60%)]"
            onClick={() => setShowStatsModal(true)}
          >
            <BarChart3 className="h-3.5 w-3.5 mr-2" />
            View Stats
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start h-8 text-xs border-2 border-[hsl(35,40%,60%)] bg-[hsl(50,80%,97%)] hover:bg-[hsl(50,80%,92%)] rounded shadow-[2px_2px_0px_0px_hsl(35,40%,60%)]"
            onClick={() => setShowAchievementsModal(true)}
          >
            <Trophy className="h-3.5 w-3.5 mr-2" />
            View Achievements
          </Button>
        </div>
      </div>

      <GameModal isOpen={showInventoryModal} onClose={() => setShowInventoryModal(false)} title="Inventory">
        <div className="space-y-6">
          {character.inventory && character.inventory.length > 0 ? (
            <div
              className={`grid gap-4 ${
                character.inventory.length <= 4
                  ? "grid-cols-4 max-w-2xl mx-auto"
                  : character.inventory.length <= 8
                    ? "grid-cols-4"
                    : "grid-cols-6"
              }`}
            >
              {character.inventory.map((item: any) => (
                <InventoryItemCard
                  key={item.id}
                  item={item}
                  size="lg"
                  interactive
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <InventoryItemCard key={`empty-${i}`} size="lg" />
              ))}
            </div>
          )}

          <div className="pt-2 border-t-2 border-[hsl(35,40%,60%)]">
            <div className="flex items-center justify-between px-4 py-3 bg-[hsl(45,60%,88%)] rounded border-2 border-[hsl(35,40%,70%)]">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-[hsl(35,60%,40%)]" />
                <span className="text-lg font-bold text-[hsl(35,40%,20%)]">Total Gold</span>
              </div>
              <span className="text-2xl font-bold text-[hsl(35,40%,20%)]">{character.gold || 0}</span>
            </div>
          </div>
        </div>
      </GameModal>

      <GameModal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} title="Character Stats">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[hsl(35,40%,92%)] rounded border-2 border-[hsl(35,40%,70%)] text-center">
              <div className="text-sm text-[hsl(35,40%,40%)] mb-1">Battles</div>
              <div className="text-3xl font-bold">0</div>
            </div>
            <div className="p-4 bg-[hsl(35,40%,92%)] rounded border-2 border-[hsl(35,40%,70%)] text-center">
              <div className="text-sm text-[hsl(35,40%,40%)] mb-1">Wins</div>
              <div className="text-3xl font-bold">0</div>
            </div>
          </div>

          <div className="p-4 bg-[hsl(45,60%,88%)] rounded border-2 border-[hsl(35,40%,70%)]">
            <div className="text-sm text-[hsl(35,40%,40%)] mb-1 text-center">Win Rate</div>
            <div className="text-3xl font-bold text-center">0%</div>
          </div>

          <div className="p-4 bg-[hsl(35,40%,92%)] rounded border-2 border-[hsl(35,40%,70%)]">
            <div className="text-sm text-[hsl(35,40%,40%)] mb-1 text-center">Items Collected</div>
            <div className="text-3xl font-bold text-center">{character.inventory?.length || 0}</div>
          </div>
        </div>
      </GameModal>

      <GameModal isOpen={showAchievementsModal} onClose={() => setShowAchievementsModal(false)} title="Achievements">
        <div className="space-y-3">
          <div className="p-4 bg-[hsl(35,40%,92%)] rounded border-2 border-[hsl(35,40%,70%)] opacity-50">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-8 w-8 text-[hsl(35,40%,40%)]" />
              <div>
                <div className="font-bold text-[hsl(35,40%,20%)]">First Blood</div>
                <div className="text-sm text-[hsl(35,40%,40%)]">Win your first battle</div>
              </div>
            </div>
            <div className="text-xs text-[hsl(35,40%,40%)]">🔒 Locked</div>
          </div>

          <div className="p-4 bg-[hsl(35,40%,92%)] rounded border-2 border-[hsl(35,40%,70%)] opacity-50">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-8 w-8 text-[hsl(35,40%,40%)]" />
              <div>
                <div className="font-bold text-[hsl(35,40%,20%)]">Treasure Hunter</div>
                <div className="text-sm text-[hsl(35,40%,40%)]">Collect 10 items</div>
              </div>
            </div>
            <div className="text-xs text-[hsl(35,40%,40%)]">🔒 Locked</div>
          </div>

          <div className="p-4 bg-[hsl(35,40%,92%)] rounded border-2 border-[hsl(35,40%,70%)] opacity-50">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-8 w-8 text-[hsl(35,40%,40%)]" />
              <div>
                <div className="font-bold text-[hsl(35,40%,20%)]">Level Up!</div>
                <div className="text-sm text-[hsl(35,40%,40%)]">Reach level 5</div>
              </div>
            </div>
            <div className="text-xs text-[hsl(35,40%,40%)]">🔒 Locked</div>
          </div>
        </div>
      </GameModal>

      {!onItemClick && (
        <ItemDetailModal
          isOpen={showItemDetail}
          onClose={() => {
            setShowItemDetail(false)
            setSelectedItem(null)
          }}
          item={selectedItem}
          onUse={(item) => {
            console.log("[v0] Using item:", item)
            setShowItemDetail(false)
          }}
          onEquip={(item) => {
            console.log("[v0] Equipping item:", item)
            setShowItemDetail(false)
          }}
          onDrop={(item) => {
            console.log("[v0] Dropping item:", item)
            setShowItemDetail(false)
          }}
        />
      )}
    </>
  )
}
