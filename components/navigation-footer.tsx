"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavigationFooterProps {
  onBack?: () => void
  onNext: () => void
  onFinishWithAI?: () => void
  nextLabel?: string
  canProceed: boolean
  showBack?: boolean
  showFinishWithAI?: boolean
  className?: string
}

export function NavigationFooter({
  onBack,
  onNext,
  onFinishWithAI,
  nextLabel = "Next",
  canProceed,
  showBack = true,
  showFinishWithAI = false,
  className,
}: NavigationFooterProps) {
  return (
    <Card className={cn("p-6 bg-[hsl(35,60%,88%)] border-2 border-[hsl(30,40%,20%)] shadow-card", className)}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-2">
          {showBack && onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="border-2 border-[hsl(30,40%,20%)] bg-transparent hover:-translate-y-0.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          {showFinishWithAI && onFinishWithAI && (
            <Button
              variant="outline"
              onClick={onFinishWithAI}
              className="border-2 border-[hsl(30,40%,20%)] bg-transparent hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Finish with AI
            </Button>
          )}
        </div>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className={cn(
            "w-full sm:w-auto font-[family-name:var(--font-heading)] border-2 border-[hsl(30,40%,20%)] transition-all",
            canProceed
              ? "shadow-card-interactive hover:-translate-y-0.5"
              : "opacity-50 cursor-not-allowed bg-[hsl(40,25%,75%)] text-[hsl(30,40%,50%)]",
          )}
        >
          {!canProceed && nextLabel === "Next" ? "Make a selection" : nextLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
