"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Sparkles, Eye, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScenarioOptionCardProps {
  title: string
  description: string
  location: string
  tags: string[]
  onSelect: () => void
  onCustomize: () => void
  onViewDetails: () => void
  expanded?: boolean
}

export function ScenarioOptionCard({
  title,
  description,
  location,
  tags,
  onSelect,
  onCustomize,
  onViewDetails,
  expanded = false,
}: ScenarioOptionCardProps) {
  return (
    <Card
      className={cn(
        "p-6 border-2 border-[hsl(30,40%,20%)] shadow-card bg-[hsl(40,35%,92%)]",
        "hover:shadow-card-hover transition-all",
      )}
    >
      <div className="space-y-4">
        {/* Title */}
        <div>
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-balance">{title}</h3>
          <div className="flex items-center gap-2 mt-2 text-sm text-[hsl(30,40%,40%)]">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[hsl(30,40%,40%)] text-pretty leading-relaxed">{description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs bg-[hsl(40,25%,85%)] border border-[hsl(30,40%,60%)]"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            onClick={onSelect}
            className="font-[family-name:var(--font-heading)] border-2 border-[hsl(30,40%,20%)] shadow-card-interactive hover:-translate-y-0.5 transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Select
          </Button>
          <Button onClick={onCustomize} variant="outline" className="border-2 border-[hsl(30,40%,20%)] bg-transparent">
            <Settings className="w-4 h-4 mr-2" />
            Customize
          </Button>
          <Button
            onClick={onViewDetails}
            variant="outline"
            className="border-2 border-[hsl(30,40%,20%)] bg-transparent"
          >
            <Eye className="w-4 h-4 mr-2" />
            Details
          </Button>
        </div>
      </div>
    </Card>
  )
}
