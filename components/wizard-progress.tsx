"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface WizardProgressProps {
  currentStep: number
  totalSteps: number
  labels: string[]
}

export function WizardProgress({ currentStep, totalSteps, labels }: WizardProgressProps) {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum = index + 1
          const isCompleted = stepNum < currentStep
          const isCurrent = stepNum === currentStep

          return (
            <React.Fragment key={index}>
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    isCompleted && "bg-[hsl(30,50%,50%)] border-[hsl(30,50%,50%)]",
                    isCurrent && "bg-[hsl(35,60%,88%)] border-[hsl(30,50%,50%)]",
                    !isCompleted && !isCurrent && "bg-white border-[hsl(30,40%,60%)]",
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <span
                      className={cn(
                        "font-[family-name:var(--font-heading)] font-bold",
                        isCurrent ? "text-[hsl(30,50%,40%)]" : "text-[hsl(30,40%,60%)]",
                      )}
                    >
                      {stepNum}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs mt-2 hidden sm:block",
                    isCurrent ? "text-foreground font-medium" : "text-[hsl(30,40%,60%)]",
                  )}
                >
                  {labels[index]}
                </span>
              </div>

              {/* Connector line */}
              {index < totalSteps - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-[hsl(30,40%,80%)] relative">
                  <div
                    className="absolute inset-0 bg-[hsl(30,50%,50%)] transition-all"
                    style={{
                      width: stepNum < currentStep ? "100%" : "0%",
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Mobile step label */}
      <div className="text-center sm:hidden text-sm text-[hsl(30,40%,40%)] mt-2">
        Step {currentStep} of {totalSteps}: {labels[currentStep - 1]}
      </div>
    </div>
  )
}
