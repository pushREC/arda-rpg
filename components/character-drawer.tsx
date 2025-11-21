"use client"

import * as React from "react"
import { X } from "lucide-react"
import { CharacterPanel } from "@/components/character-panel"
import { Button } from "@/components/ui/button"
import { modalQueue } from "@/lib/modal-queue"
import type { ActiveEffect } from "@/lib/types"

interface CharacterDrawerProps {
  character: any
  currentHealth: number
  isOpen: boolean
  onClose: () => void
  onViewAchievements?: () => void
  onItemClick?: (item: any) => void
  activeEffects?: ActiveEffect[]
}

export function CharacterDrawer({
  character,
  currentHealth,
  isOpen,
  onClose,
  onViewAchievements,
  onItemClick,
  activeEffects,
}: CharacterDrawerProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // Auto-close drawer when global modals (LevelUp, Victory, GameOver) are triggered
  React.useEffect(() => {
    const unsubscribe = modalQueue.subscribe((modal) => {
      if (modal && isOpen) {
        onClose()
      }
    })
    return unsubscribe
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-80 bg-[hsl(50,80%,95%)] border-r-2 border-[hsl(35,40%,70%)] shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-2 border-[hsl(35,40%,70%)] bg-[hsl(50,70%,90%)]">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[hsl(25,50%,25%)]">
              Character
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-[hsl(35,40%,85%)] flex-shrink-0">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <CharacterPanel
              character={character}
              currentHealth={currentHealth}
              onViewAchievements={onViewAchievements}
              onItemClick={onItemClick}
              activeEffects={activeEffects}
            />
          </div>
        </div>
      </div>
    </>
  )
}
