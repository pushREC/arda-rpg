"use client"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RangeSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  leftLabel?: string
  rightLabel?: string
  showBadges?: boolean
}

export function RangeSlider({
  label,
  value,
  onChange,
  min,
  max,
  leftLabel,
  rightLabel,
  showBadges = true,
}: RangeSliderProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">{label}</Label>
      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-[hsl(30,40%,60%)] rounded-lg appearance-none cursor-pointer accent-[hsl(30,50%,40%)]"
        />
        {(leftLabel || rightLabel) && (
          <div className="flex justify-between text-xs text-[hsl(30,40%,40%)]">
            <span>{leftLabel}</span>
            <span>{rightLabel}</span>
          </div>
        )}
        {showBadges && (
          <div className="flex items-center gap-2">
            {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((level) => (
              <Badge
                key={level}
                variant={value === level ? "default" : "outline"}
                className={cn(
                  "flex-1 justify-center transition-all cursor-pointer",
                  value === level
                    ? "bg-[hsl(30,50%,40%)] border-[hsl(30,50%,40%)] text-white"
                    : "border-[hsl(30,40%,60%)]",
                )}
                onClick={() => onChange(level)}
              >
                {level}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
