"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Heart, Volume2, VolumeX, Volume1, Menu, Trophy, Save, Tent } from "lucide-react"
import { cn } from "@/lib/utils"
import { CombatOverlay } from "@/components/combat-overlay"
import type { CombatState } from "@/lib/types"
import { useSound } from "@/components/sound-provider"

interface GameShellProps {
  children?: React.ReactNode
  characterName?: string
  characterClass?: string
  health?: number
  maxHealth?: number
  level?: number
  combatState?: CombatState
  onMenuClick?: () => void
  onViewAchievements?: () => void
  onSaveGame?: () => void
  onRest?: () => void
  disableSave?: boolean // [TICKET 13.4] Anti-cheat: disable saving during combat
}

export function GameShell({
  children,
  characterName = "Adventurer",
  characterClass = "Warrior",
  health = 100,
  maxHealth = 100,
  level = 1,
  combatState,
  onMenuClick,
  onViewAchievements,
  onSaveGame,
  onRest,
  disableSave = false,
}: GameShellProps) {
  // [TICKET 18.6] Audio Visibility & Control
  const { isMuted, toggleMute, volume, setVolume } = useSound()
  const [showCharacterPanel, setShowCharacterPanel] = React.useState(false)
  const [showAchievements, setShowAchievements] = React.useState(false)
  const [showVolumeControl, setShowVolumeControl] = React.useState(false)
  const volumeControlRef = React.useRef<HTMLDivElement>(null)

  // Close volume control when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (volumeControlRef.current && !volumeControlRef.current.contains(event.target as Node)) {
        setShowVolumeControl(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Get appropriate volume icon
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  const healthPercentage = (health / maxHealth) * 100

  return (
    <>
      <div className="h-screen flex flex-col bg-[hsl(50,50%,90%)] overflow-hidden">
        {/* Header Bar */}
        <header className="sticky top-0 z-50 w-full border-b-2 border-[hsl(35,40%,70%)] bg-[hsl(50,80%,95%)] shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 md:px-6 gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="md:hidden flex-shrink-0 hover:bg-[hsl(35,40%,85%)]"
                title="Character Info"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="font-[family-name:var(--font-heading)] text-lg md:text-xl font-bold text-[hsl(25,50%,25%)] truncate">
                Tales of Middle-earth
              </h1>
              <p className="text-sm text-[hsl(35,40%,40%)] truncate hidden sm:block">
                {characterName} • Lvl {level}
              </p>
            </div>

            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              {/* Quick Stats - hidden on small screens to prevent overlap */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(50,70%,92%)] border border-[hsl(35,40%,75%)]">
                <Heart className="h-4 w-4 text-[hsl(0,70%,50%)]" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[hsl(25,50%,25%)] whitespace-nowrap">
                    {health}/{maxHealth}
                  </span>
                  <div className="w-16 h-1.5 bg-[hsl(35,40%,80%)] rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all rounded-full",
                        healthPercentage > 50
                          ? "bg-[hsl(120,50%,45%)]"
                          : healthPercentage > 25
                            ? "bg-[hsl(45,90%,50%)]"
                            : "bg-[hsl(0,70%,50%)]",
                      )}
                      style={{ width: `${healthPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onRest}
                title="Rest to heal (Risks ambush)"
                disabled={combatState?.isActive || health >= maxHealth}
                className="hover:bg-[hsl(35,40%,85%)] hidden sm:flex disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Tent className="h-5 w-5 text-[hsl(200,60%,40%)]" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onSaveGame}
                title={disableSave ? "Cannot save during combat" : "Save Game"}
                disabled={disableSave}
                className="hover:bg-[hsl(35,40%,85%)] hidden sm:flex disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5 text-[hsl(35,60%,40%)]" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onViewAchievements}
                title="Achievements"
                className="hover:bg-[hsl(35,40%,85%)] flex-shrink-0"
              >
                <Trophy className="h-5 w-5 text-[hsl(45,80%,40%)]" />
              </Button>

              {/* [TICKET 18.6] Volume Control with Slider */}
              <div className="relative hidden md:block" ref={volumeControlRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowVolumeControl(!showVolumeControl)}
                  onDoubleClick={toggleMute}
                  title={`Volume: ${Math.round(volume * 100)}% (Double-click to ${isMuted ? "unmute" : "mute"})`}
                  className="hover:bg-[hsl(35,40%,85%)] flex-shrink-0"
                >
                  <VolumeIcon className="h-5 w-5" />
                </Button>

                {/* Volume Slider Dropdown */}
                {showVolumeControl && (
                  <div className="absolute right-0 top-full mt-2 p-4 bg-[hsl(50,80%,97%)] border-2 border-[hsl(35,40%,70%)] rounded-lg shadow-lg z-50 w-48">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[hsl(25,50%,25%)]">Volume</span>
                        <span className="text-xs text-[hsl(35,40%,50%)]">{Math.round(volume * 100)}%</span>
                      </div>
                      <Slider
                        value={[volume]}
                        onValueChange={(value) => setVolume(value[0])}
                        min={0}
                        max={1}
                        step={0.05}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleMute}
                          className="flex-1 text-xs"
                        >
                          {isMuted ? "Unmute" : "Mute"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Combat Overlay - Appears when combat is active */}
        {combatState?.isActive && (
          <div className="w-full z-40">
            <CombatOverlay combatState={combatState} />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Game Content */}
          <main className="flex-1 flex flex-col overflow-hidden">{children}</main>

          {/* Character Panel Sidebar */}
          {showCharacterPanel && (
            <aside className="hidden lg:block w-80 border-l border-border bg-card/50 backdrop-blur">
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">{characterName}</h2>
                  <p className="text-sm text-muted-foreground">{characterClass}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-destructive" />
                      Health
                    </span>
                    <span className="font-medium">
                      {health}/{maxHealth}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all rounded-full",
                        healthPercentage > 50
                          ? "bg-green-500"
                          : healthPercentage > 25
                            ? "bg-yellow-500"
                            : "bg-destructive",
                      )}
                      style={{ width: `${healthPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-gold" />
                      Level
                    </span>
                    <span className="font-medium">{level}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => setShowAchievements(true)}
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      View Achievements
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Menu className="h-4 w-4 mr-2" />
                      Character Stats
                    </Button>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {showAchievements && <div>Achievements Modal Placeholder</div>}
    </>
  )
}
