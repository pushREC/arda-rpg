"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Shield, Swords, Sparkles, Volume2, VolumeX, Menu, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { AchievementsModal } from "./achievements-modal"

interface GameShellProps {
  children?: React.ReactNode
  characterName?: string
  characterClass?: string
  health?: number
  maxHealth?: number
  onMenuClick?: () => void
  onViewAchievements?: () => void
}

export function GameShell({
  children,
  characterName = "Adventurer",
  characterClass = "Warrior",
  health = 100,
  maxHealth = 100,
  onMenuClick,
  onViewAchievements,
}: GameShellProps) {
  const [isMuted, setIsMuted] = React.useState(false)
  const [showCharacterPanel, setShowCharacterPanel] = React.useState(false)
  const [showAchievements, setShowAchievements] = React.useState(false)

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
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="font-[family-name:var(--font-heading)] text-lg md:text-xl font-bold text-[hsl(25,50%,25%)] truncate">
                Tales of Middle-earth
              </h1>
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
                onClick={onViewAchievements}
                title="Achievements"
                className="hover:bg-[hsl(35,40%,85%)] flex-shrink-0"
              >
                <Trophy className="h-5 w-5 text-[hsl(45,80%,40%)]" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="hover:bg-[hsl(35,40%,85%)] flex-shrink-0"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </header>

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

                <Card className="p-4 space-y-4">
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
                        <Swords className="h-4 w-4 text-primary" />
                        Attack
                      </span>
                      <span className="font-medium">12</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-accent" />
                        Defense
                      </span>
                      <span className="font-medium">8</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-gold" />
                        Level
                      </span>
                      <span className="font-medium">1</span>
                    </div>
                  </div>
                </Card>

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
                      <Shield className="h-4 w-4 mr-2" />
                      Character Stats
                    </Button>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {showAchievements && <AchievementsModal onClose={() => setShowAchievements(false)} />}
    </>
  )
}
