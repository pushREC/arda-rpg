"use client"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import * as LucideIcons from "lucide-react"

interface VibeCardProps {
  id: string
  label: string
  description: string
  icon: string
  selected: boolean
  onToggle: (id: string) => void
}

export function VibeCard({ id, label, description, icon, selected, onToggle }: VibeCardProps) {
  const Icon = (LucideIcons as any)[icon] || LucideIcons.Sparkles

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all hover:scale-[1.02] border-2",
        "bg-[hsl(40,35%,92%)]",
        selected
          ? "border-[hsl(30,50%,40%)] shadow-card-hover"
          : "border-[hsl(30,40%,20%)] shadow-card hover:shadow-card-hover",
      )}
      onClick={() => onToggle(id)}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[hsl(35,60%,88%)] border border-[hsl(30,40%,60%)]">
            <Icon className="w-5 h-5 text-[hsl(30,50%,40%)]" />
          </div>
          {selected && (
            <div className="w-6 h-6 rounded-full bg-[hsl(30,50%,50%)] flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        <div>
          <h4 className="font-[family-name:var(--font-heading)] font-bold text-sm">{label}</h4>
          <p className="text-xs text-[hsl(30,40%,40%)] text-pretty">{description}</p>
        </div>
      </div>
    </Card>
  )
}
