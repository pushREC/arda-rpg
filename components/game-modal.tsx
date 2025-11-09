"use client"

import type React from "react"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GameModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function GameModal({ isOpen, onClose, title, children }: GameModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md max-h-[80vh] overflow-y-auto bg-[hsl(50,80%,97%)] border-2 border-[hsl(35,40%,60%)] rounded-lg shadow-[4px_4px_0px_0px_hsl(35,40%,60%)]">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b-2 border-[hsl(35,40%,60%)] bg-[hsl(50,80%,97%)]">
          <h2 className="text-xl font-bold text-[hsl(35,40%,20%)]">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
