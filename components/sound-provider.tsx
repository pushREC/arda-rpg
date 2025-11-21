"use client"

import * as React from "react"
import { SOUND_ASSETS, type SoundType } from "@/lib/sounds"

interface SoundContextType {
  playSound: (type: SoundType) => void
  isMuted: boolean
  toggleMute: () => void
  volume: number
  setVolume: (volume: number) => void
}

const SoundContext = React.createContext<SoundContextType | null>(null)

const MUTE_STORAGE_KEY = "arda-rpg-muted"
const VOLUME_STORAGE_KEY = "arda-rpg-volume"

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = React.useState(false)
  const [volume, setVolumeState] = React.useState(0.5)
  const [isClient, setIsClient] = React.useState(false)

  // Load persisted settings on mount (client-side only)
  React.useEffect(() => {
    setIsClient(true)
    try {
      const storedMuted = localStorage.getItem(MUTE_STORAGE_KEY)
      if (storedMuted !== null) {
        setIsMuted(storedMuted === "true")
      }

      const storedVolume = localStorage.getItem(VOLUME_STORAGE_KEY)
      if (storedVolume !== null) {
        const parsed = parseFloat(storedVolume)
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          setVolumeState(parsed)
        }
      }
    } catch (error) {
      console.warn("[SoundProvider] Failed to load settings from localStorage:", error)
    }
  }, [])

  // Persist mute setting
  React.useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted))
      } catch (error) {
        console.warn("[SoundProvider] Failed to save mute setting:", error)
      }
    }
  }, [isMuted, isClient])

  // Persist volume setting
  React.useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(VOLUME_STORAGE_KEY, String(volume))
      } catch (error) {
        console.warn("[SoundProvider] Failed to save volume setting:", error)
      }
    }
  }, [volume, isClient])

  const playSound = React.useCallback(
    (type: SoundType) => {
      if (isMuted || !isClient) return

      try {
        const url = SOUND_ASSETS[type]
        if (!url) {
          console.warn(`[SoundProvider] Unknown sound type: ${type}`)
          return
        }

        const audio = new Audio(url)
        audio.volume = volume

        // Play and handle any errors gracefully
        audio.play().catch((error) => {
          // Autoplay may be blocked by browser policy - this is expected
          console.debug(`[SoundProvider] Could not play sound "${type}":`, error.message)
        })
      } catch (error) {
        console.warn(`[SoundProvider] Error playing sound "${type}":`, error)
      }
    },
    [isMuted, volume, isClient]
  )

  const toggleMute = React.useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  const setVolume = React.useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setVolumeState(clampedVolume)
  }, [])

  const value = React.useMemo(
    () => ({
      playSound,
      isMuted,
      toggleMute,
      volume,
      setVolume,
    }),
    [playSound, isMuted, toggleMute, volume, setVolume]
  )

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound() {
  const context = React.useContext(SoundContext)
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider")
  }
  return context
}
