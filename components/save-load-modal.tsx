"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Save, Upload, Trash2, Clock } from "lucide-react"
import { toast } from "sonner"

interface GameSave {
  id: string
  characterName: string
  scenario: string
  timestamp: Date
  health: number
  maxHealth: number
  turnCount: number
}

interface SaveLoadModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  onLoad: (saveId: string) => void
  currentSave?: GameSave
}

export function SaveLoadModal({ isOpen, onClose, onSave, onLoad, currentSave }: SaveLoadModalProps) {
  const [saves, setSaves] = React.useState<GameSave[]>([])

  React.useEffect(() => {
    if (isOpen) {
      loadSaves()
    }
  }, [isOpen])

  const loadSaves = () => {
    const savedGames = localStorage.getItem("gameSaves")
    if (savedGames) {
      const parsed = JSON.parse(savedGames)
      setSaves(parsed.map((save: any) => ({ ...save, timestamp: new Date(save.timestamp) })))
    }
  }

  const handleDelete = (saveId: string) => {
    const filtered = saves.filter((s) => s.id !== saveId)
    localStorage.setItem("gameSaves", JSON.stringify(filtered))
    setSaves(filtered)
    toast.success("Save deleted")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl mx-4 max-h-[80vh] bg-[hsl(50,80%,97%)] border-4 border-[hsl(35,40%,60%)] rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b-2 border-[hsl(35,40%,70%)] bg-[hsl(50,70%,90%)]">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[hsl(25,50%,25%)]">
            Save & Load Game
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current Game */}
          {currentSave && (
            <div className="space-y-3">
              <h3 className="font-bold text-[hsl(25,50%,25%)]">Current Game</h3>
              <div className="p-4 bg-[hsl(45,60%,88%)] border-2 border-[hsl(45,60%,70%)] rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[hsl(25,50%,25%)]">{currentSave.characterName}</div>
                    <div className="text-sm text-[hsl(35,40%,40%)]">{currentSave.scenario}</div>
                    <div className="text-xs text-[hsl(35,40%,40%)] mt-1">
                      Health: {currentSave.health}/{currentSave.maxHealth} • Turns: {currentSave.turnCount}
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      onSave()
                      onClose()
                    }}
                    className="bg-[hsl(30,50%,40%)] hover:bg-[hsl(30,50%,35%)] text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Saved Games */}
          <div className="space-y-3">
            <h3 className="font-bold text-[hsl(25,50%,25%)]">Saved Games</h3>
            {saves.length === 0 ? (
              <div className="p-8 text-center text-[hsl(35,40%,40%)] bg-[hsl(35,40%,92%)] rounded-lg border-2 border-[hsl(35,40%,70%)]">
                No saved games found
              </div>
            ) : (
              <div className="space-y-2">
                {saves.map((save) => (
                  <div
                    key={save.id}
                    className="p-4 bg-[hsl(50,80%,92%)] border-2 border-[hsl(35,40%,70%)] rounded-lg hover:bg-[hsl(50,80%,88%)] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-[hsl(25,50%,25%)]">{save.characterName}</div>
                        <div className="text-sm text-[hsl(35,40%,40%)]">{save.scenario}</div>
                        <div className="text-xs text-[hsl(35,40%,40%)] mt-1 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {save.timestamp.toLocaleString()}
                        </div>
                        <div className="text-xs text-[hsl(35,40%,40%)] mt-1">
                          Health: {save.health}/{save.maxHealth} • Turns: {save.turnCount}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            onLoad(save.id)
                            onClose()
                          }}
                          size="sm"
                          className="bg-[hsl(30,50%,40%)] hover:bg-[hsl(30,50%,35%)] text-white"
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Load
                        </Button>
                        <Button
                          onClick={() => handleDelete(save.id)}
                          size="sm"
                          variant="outline"
                          className="border-2 border-red-500 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-[hsl(35,40%,70%)] bg-[hsl(50,70%,90%)]">
          <Button onClick={onClose} variant="outline" className="w-full bg-transparent">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
