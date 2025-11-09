"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { WizardProgress } from "@/components/wizard-progress"
import { NavigationFooter } from "@/components/navigation-footer"
import { ChoiceButton } from "@/components/choice-button"
import { ArrowLeft, Loader2, MapPin, Scroll, Heart, Users, Sparkles, Swords } from "lucide-react"
import Link from "next/link"
import { REGIONS, TONE_OPTIONS, COMPANION_PREFERENCES, URGENCY_OPTIONS, STAKES_OPTIONS } from "@/lib/scenario-config"
import { generateScenarioId } from "@/lib/scenario-builder"
import type { CustomScenarioConfig, EnhancedChoice } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const STEP_LABELS = ["Setting", "Quest", "Tone", "Companions", "Element", "Confirm"]

export default function CustomWizardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [character, setCharacter] = React.useState<any>(null)
  const [currentStep, setCurrentStep] = React.useState(1)

  // Step 1: Setting
  const [region, setRegion] = React.useState("")
  const [customRegion, setCustomRegion] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [customLocation, setCustomLocation] = React.useState("")
  const [locationOptions, setLocationOptions] = React.useState<any[]>([])
  const [loadingLocations, setLoadingLocations] = React.useState(false)

  // Step 2: Quest
  const [questHook, setQuestHook] = React.useState("")
  const [customQuestHook, setCustomQuestHook] = React.useState("")
  const [urgency, setUrgency] = React.useState("")
  const [stakes, setStakes] = React.useState("")
  const [questOptions, setQuestOptions] = React.useState<any[]>([])
  const [loadingQuests, setLoadingQuests] = React.useState(false)

  // Step 3: Tone & Combat
  const [tones, setTones] = React.useState<string[]>([])
  const [combatFrequency, setCombatFrequency] = React.useState(3)

  // Step 4: Companions
  const [companionPreference, setCompanionPreference] = React.useState("")
  const [companionType, setCompanionType] = React.useState("")
  const [customCompanionType, setCustomCompanionType] = React.useState("")
  const [companionOptions, setCompanionOptions] = React.useState<any[]>([])
  const [loadingCompanions, setLoadingCompanions] = React.useState(false)

  // Step 5: Unique Element
  const [uniqueElement, setUniqueElement] = React.useState("")
  const [customUniqueElement, setCustomUniqueElement] = React.useState("")
  const [uniqueOptions, setUniqueOptions] = React.useState<any[]>([])
  const [loadingUnique, setLoadingUnique] = React.useState(false)

  React.useEffect(() => {
    const savedCharacter = localStorage.getItem("character")
    if (savedCharacter) {
      setCharacter(JSON.parse(savedCharacter))
    } else {
      router.push("/character-creation")
    }
  }, [router])

  // Fetch location options when region changes
  React.useEffect(() => {
    if (region && currentStep === 1) {
      fetchLocationOptions()
    }
  }, [region, currentStep])

  // Fetch quest hooks when location changes
  React.useEffect(() => {
    if (location && currentStep === 2) {
      fetchQuestOptions()
    }
  }, [location, currentStep])

  // Fetch companion options when step 4 loads
  React.useEffect(() => {
    if (currentStep === 4 && companionPreference && companionPreference !== "solo") {
      fetchCompanionOptions()
    }
  }, [currentStep, companionPreference])

  // Fetch unique elements when step 5 loads
  React.useEffect(() => {
    if (currentStep === 5) {
      fetchUniqueOptions()
    }
  }, [currentStep])

  const fetchLocationOptions = async () => {
    setLoadingLocations(true)
    try {
      const response = await fetch("/api/generate-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "locations",
          context: { region, character },
        }),
      })
      const { options } = await response.json()
      console.log("[v0] Received location options:", options)
      setLocationOptions(options || [])
    } catch (error) {
      console.error("[v0] Failed to fetch locations:", error)
    } finally {
      setLoadingLocations(false)
    }
  }

  const fetchQuestOptions = async () => {
    setLoadingQuests(true)
    try {
      const response = await fetch("/api/generate-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quest-hooks",
          context: { region, location, character },
        }),
      })
      const { options } = await response.json()
      console.log("[v0] Received quest options:", options)
      setQuestOptions(options || [])
    } catch (error) {
      console.error("[v0] Failed to fetch quests:", error)
    } finally {
      setLoadingQuests(false)
    }
  }

  const fetchCompanionOptions = async () => {
    setLoadingCompanions(true)
    try {
      const response = await fetch("/api/generate-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "companions",
          context: { region, location, questHook, tones, companionPreference, character },
        }),
      })
      const { options } = await response.json()
      console.log("[v0] Received companion options:", options)
      setCompanionOptions(options || [])
    } catch (error) {
      console.error("[v0] Failed to fetch companions:", error)
    } finally {
      setLoadingCompanions(false)
    }
  }

  const fetchUniqueOptions = async () => {
    setLoadingUnique(true)
    try {
      const response = await fetch("/api/generate-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "unique-elements",
          context: { region, location, questHook, tones, companionPreference, character },
        }),
      })
      const { options } = await response.json()
      console.log("[v0] Received unique element options:", options)
      setUniqueOptions(options || [])
    } catch (error) {
      console.error("[v0] Failed to fetch unique elements:", error)
    } finally {
      setLoadingUnique(false)
    }
  }

  const canProceedStep1 = () => {
    return (region || customRegion.trim()) && (location || customLocation.trim())
  }

  const canProceedStep2 = () => {
    return (questHook || customQuestHook.trim()) && urgency && stakes
  }

  const canProceedStep3 = () => {
    return tones.length > 0 && tones.length <= 2
  }

  const canProceedStep4 = () => {
    if (!companionPreference) return false
    if (companionPreference === "solo") return true
    return companionType || customCompanionType.trim()
  }

  const canProceedStep5 = () => {
    return uniqueElement || customUniqueElement.trim()
  }

  const canProceedCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return canProceedStep1()
      case 2:
        return canProceedStep2()
      case 3:
        return canProceedStep3()
      case 4:
        return canProceedStep4()
      case 5:
        return canProceedStep5()
      case 6:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (!canProceedCurrentStep()) {
      // Show toast messages for specific step validation failures
      if (currentStep === 1) {
        if (!region && !customRegion.trim()) toast({ title: "Please select or enter a region", variant: "destructive" })
        if (!location && !customLocation.trim())
          toast({ title: "Please select or enter a location", variant: "destructive" })
      } else if (currentStep === 2) {
        if (!questHook && !customQuestHook.trim())
          toast({ title: "Please select or enter a quest hook", variant: "destructive" })
        if (!urgency) toast({ title: "Please select an urgency", variant: "destructive" })
        if (!stakes) toast({ title: "Please select stakes", variant: "destructive" })
      } else if (currentStep === 3) {
        if (tones.length === 0) toast({ title: "Please select at least one tone", variant: "destructive" })
        if (tones.length > 2) toast({ title: "Please select a maximum of two tones", variant: "destructive" })
      } else if (currentStep === 4) {
        if (!companionPreference) toast({ title: "Please select a companion preference", variant: "destructive" })
        if (companionPreference !== "solo" && !companionType && !customCompanionType.trim())
          toast({ title: "Please select or describe a companion type", variant: "destructive" })
      } else if (currentStep === 5) {
        if (!uniqueElement && !customUniqueElement.trim())
          toast({ title: "Please select or describe a unique element", variant: "destructive" })
      }
      return
    }

    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleFinish()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleFinishWithAI = async () => {
    try {
      const partialConfig = {
        creationMethod: "full-custom" as const,
        region: customRegion || region,
        location: customLocation || location,
        questHook: customQuestHook || questHook,
        urgency,
        stakes,
        tones,
        combatFrequency,
        companionPreference,
        companionType: customCompanionType || companionType,
        uniqueElement: customUniqueElement || uniqueElement,
      }

      const response = await fetch("/api/complete-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partialConfig, character }),
      })

      const { config } = await response.json()

      const scenario = {
        id: config.id,
        title: `${config.region} Adventure`,
        description: config.questHook || "A custom adventure awaits",
        difficulty: "medium",
        estimatedTime: "30-40 minutes",
        unlocked: true,
        customConfig: config,
      }

      localStorage.setItem("scenario", JSON.stringify(scenario))
      router.push("/game")
    } catch (error) {
      console.error("[v0] Failed to complete with AI:", error)
      toast({ title: "Failed to complete scenario", variant: "destructive" })
    }
  }

  const handleFinish = () => {
    const config: CustomScenarioConfig = {
      id: generateScenarioId(),
      generatedAt: Date.now(),
      creationMethod: "full-custom",
      region: customRegion || region,
      location: customLocation || location,
      questHook: customQuestHook || questHook,
      urgency: urgency as any,
      stakes: stakes as any,
      tones: tones as any,
      combatFrequency,
      companionPreference: companionPreference as any,
      companionType: customCompanionType || companionType,
      uniqueElement: customUniqueElement || uniqueElement,
      aiContext: {
        characterContext: `${character.race} ${character.background}`,
        userPrompt: `${customQuestHook || questHook}`,
      },
    }

    const scenario = {
      id: config.id,
      title: `${config.region} Adventure`,
      description: config.questHook || "A custom adventure awaits",
      difficulty: "medium",
      estimatedTime: "30-40 minutes",
      unlocked: true,
      customConfig: config,
    }

    localStorage.setItem("scenario", JSON.stringify(scenario))
    router.push("/game")
  }

  // Removed unused handlers from existing code
  // const handleLocationClick = (optionLabel: string) => {
  //   console.log("[v0] Location clicked:", optionLabel)
  //   setLocation(optionLabel)
  //   setCustomLocation("")
  // }

  // const handleQuestHookClick = (optionLabel: string) => {
  //   console.log("[v0] Quest hook clicked:", optionLabel)
  //   setQuestHook(optionLabel)
  //   setCustomQuestHook("")
  // }

  // const handleUrgencyClick = (optionId: string) => {
  //   console.log("[v0] Urgency clicked:", optionId)
  //   setUrgency(optionId)
  // }

  // const handleStakesClick = (optionId: string) => {
  //   console.log("[v0] Stakes clicked:", optionId)
  //   setStakes(optionId)
  // }

  // const handleCompanionTypeClick = (optionLabel: string) => {
  //   console.log("[v0] Companion type clicked:", optionLabel)
  //   setCompanionType(optionLabel)
  // }

  // const handleUniqueElementClick = (optionLabel: string) => {
  //   console.log("[v0] Unique element clicked:", optionLabel)
  //   setUniqueElement(optionLabel)
  //   setCustomUniqueElement("")
  // }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(40,30%,94%)]">
        <div className="animate-spin w-8 h-8 border-4 border-[hsl(30,50%,50%)] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[hsl(40,30%,94%)]">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/custom-scenario">
            <Button
              variant="outline"
              size="icon"
              className="border-2 border-[hsl(30,40%,20%)] shadow-card-interactive bg-transparent hover:-translate-y-0.5 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold">Craft Your Tale</h1>
            <p className="text-[hsl(30,40%,40%)] text-sm md:text-base">Build your adventure step by step</p>
          </div>
        </div>

        <Card className="p-6 bg-[hsl(40,35%,92%)] border-2 border-[hsl(30,40%,20%)] shadow-card">
          <WizardProgress currentStep={currentStep} totalSteps={6} labels={STEP_LABELS} />
        </Card>

        {/* Step Content */}
        <Card className="p-8 bg-[hsl(40,35%,92%)] border-2 border-[hsl(30,40%,20%)] shadow-card">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-2">
                  Where Shall Your Tale Begin?
                </h2>
                <p className="text-sm text-[hsl(30,40%,40%)]">Choose a region in Middle-earth</p>
              </div>

              <div className="space-y-3">
                <Label>Region</Label>
                <div className="grid md:grid-cols-2 gap-2 w-full">
                  {REGIONS.map((r) => (
                    <ChoiceButton
                      key={r.id}
                      choice={
                        {
                          id: r.id,
                          text: r.name,
                          actionType: "narrative",
                          requiresRoll: false,
                          consequence: r.description,
                        } as EnhancedChoice
                      }
                      onClick={() => {
                        console.log("[v0] Region clicked:", r.id)
                        setRegion(r.id)
                        setCustomRegion("")
                      }}
                      selected={region === r.id}
                    />
                  ))}
                </div>
                <Input
                  placeholder="Or describe your own region..."
                  value={customRegion}
                  onChange={(e) => {
                    setCustomRegion(e.target.value)
                    setRegion("")
                  }}
                  className="border-2 border-[hsl(30,40%,20%)]"
                />
              </div>

              {(region || customRegion) && (
                <div className="space-y-3">
                  <Label>Location</Label>
                  {loadingLocations ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[hsl(30,50%,40%)]" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 w-full">
                        {locationOptions.map((opt) => (
                          <ChoiceButton
                            key={opt.id}
                            choice={
                              {
                                id: opt.id,
                                text: opt.label,
                                actionType: "narrative",
                                requiresRoll: false,
                                consequence: opt.description,
                              } as EnhancedChoice
                            }
                            onClick={() => {
                              console.log("[v0] Location clicked:", opt.label)
                              setLocation(opt.label)
                              setCustomLocation("")
                            }}
                            selected={location === opt.label}
                          />
                        ))}
                      </div>
                      <Input
                        placeholder="Or enter your own location..."
                        value={customLocation}
                        onChange={(e) => {
                          setCustomLocation(e.target.value)
                          setLocation("")
                        }}
                        className="border-2 border-[hsl(30,40%,20%)]"
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-2">What Calls You Forth?</h2>
                <p className="text-sm text-[hsl(30,40%,40%)]">Choose the hook that draws you into adventure</p>
              </div>

              <div className="space-y-3">
                <Label>Quest Hook</Label>
                {loadingQuests ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[hsl(30,50%,40%)]" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 w-full">
                      {questOptions.map((opt) => (
                        <ChoiceButton
                          key={opt.id}
                          choice={
                            {
                              id: opt.id,
                              text: opt.label,
                              actionType: "narrative",
                              requiresRoll: false,
                              consequence: opt.description,
                            } as EnhancedChoice
                          }
                          onClick={() => {
                            console.log("[v0] Quest hook clicked:", opt.label)
                            setQuestHook(opt.label)
                            setCustomQuestHook("")
                          }}
                          selected={questHook === opt.label}
                        />
                      ))}
                    </div>
                    <Textarea
                      placeholder="Or describe your own quest hook..."
                      value={customQuestHook}
                      onChange={(e) => {
                        setCustomQuestHook(e.target.value)
                        setQuestHook("")
                      }}
                      className="border-2 border-[hsl(30,40%,20%)] min-h-[100px]"
                    />
                  </>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label>Urgency</Label>
                  <div className="space-y-2 w-full">
                    {URGENCY_OPTIONS.map((opt) => (
                      <ChoiceButton
                        key={opt.id}
                        choice={
                          {
                            id: opt.id,
                            text: opt.label,
                            actionType: "narrative",
                            requiresRoll: false,
                            consequence: opt.description,
                          } as EnhancedChoice
                        }
                        onClick={() => {
                          console.log("[v0] Urgency clicked:", opt.id)
                          setUrgency(opt.id)
                        }}
                        selected={urgency === opt.id}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Stakes</Label>
                  <div className="space-y-2 w-full">
                    {STAKES_OPTIONS.map((opt) => (
                      <ChoiceButton
                        key={opt.id}
                        choice={
                          {
                            id: opt.id,
                            text: opt.label,
                            actionType: "narrative",
                            requiresRoll: false,
                            consequence: opt.description,
                          } as EnhancedChoice
                        }
                        onClick={() => {
                          console.log("[v0] Stakes clicked:", opt.id)
                          setStakes(opt.id)
                        }}
                        selected={stakes === opt.id}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-2">Set the Mood</h2>
                <p className="text-sm text-[hsl(30,40%,40%)]">Choose the tone and pace of your adventure</p>
              </div>

              <div className="space-y-3">
                <Label>Tones (select 1-2)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                  {TONE_OPTIONS.map((tone) => (
                    <ChoiceButton
                      key={tone.id}
                      choice={
                        {
                          id: tone.id,
                          text: tone.label,
                          actionType: "narrative",
                          requiresRoll: false,
                          consequence: tone.description,
                        } as EnhancedChoice
                      }
                      onClick={() => {
                        setTones((prev) => {
                          if (prev.includes(tone.id)) {
                            return prev.filter((t) => t !== tone.id)
                          }
                          if (prev.length >= 2) {
                            return [...prev.slice(1), tone.id]
                          }
                          return [...prev, tone.id]
                        })
                      }}
                      selected={tones.includes(tone.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Combat Intensity</Label>
                  <span className="font-[family-name:var(--font-heading)] font-bold text-lg text-[hsl(30,50%,40%)]">
                    {combatFrequency}/5
                  </span>
                </div>

                {/* Visual badges for selection */}
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        console.log("[v0] Combat frequency clicked:", level)
                        setCombatFrequency(level)
                      }}
                      className={cn(
                        "flex-1 h-12 rounded-md border-2 transition-all font-[family-name:var(--font-heading)] font-bold",
                        combatFrequency === level
                          ? "bg-[hsl(30,50%,40%)] border-[hsl(30,50%,40%)] text-white shadow-card-interactive scale-105"
                          : "bg-transparent border-[hsl(30,40%,20%)] hover:border-[hsl(30,50%,40%)] hover:-translate-y-0.5",
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between text-sm text-[hsl(30,40%,40%)] px-1">
                  <span>Rare</span>
                  <span>Frequent</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold mb-2">Choose Your Company</h2>
                <p className="text-sm text-[hsl(30,40%,40%)]">Will you travel alone or with companions?</p>
              </div>

              <div className="space-y-3">
                <Label>Companion Preference</Label>
                <div className="grid md:grid-cols-2 gap-3">
                  {COMPANION_PREFERENCES.map((pref) => (
                    <Card
                      key={pref.id}
                      className={cn(
                        "p-4 cursor-pointer border-2 transition-all",
                        companionPreference === pref.id
                          ? "border-[hsl(30,50%,40%)] bg-[hsl(35,60%,88%)] shadow-card-hover"
                          : "border-[hsl(30,40%,20%)] bg-[hsl(40,35%,92%)] hover:shadow-card",
                      )}
                      onClick={() => {
                        console.log("[v0] Companion preference clicked:", pref.id)
                        setCompanionPreference(pref.id)
                        // Clear companion type if switching to solo
                        if (pref.id === "solo") {
                          setCompanionType("")
                          setCustomCompanionType("")
                        }
                      }}
                    >
                      <div>
                        <h4 className="font-[family-name:var(--font-heading)] font-bold">{pref.label}</h4>
                        <p className="text-xs text-[hsl(30,40%,40%)] text-pretty">{pref.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {companionPreference && companionPreference !== "solo" && (
                <div className="space-y-3">
                  <Label>Companion Type</Label>
                  {loadingCompanions ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[hsl(30,50%,40%)]" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 w-full">
                        {companionOptions.map((opt) => (
                          <ChoiceButton
                            key={opt.id}
                            choice={
                              {
                                id: opt.id,
                                text: opt.label,
                                actionType: "narrative",
                                requiresRoll: false,
                                consequence: opt.description,
                              } as EnhancedChoice
                            }
                            onClick={() => {
                              console.log("[v0] Companion type clicked:", opt.label)
                              setCompanionType(opt.label)
                              setCustomCompanionType("")
                            }}
                            selected={companionType === opt.label}
                          />
                        ))}
                      </div>
                      <Input
                        placeholder="Or describe your own companion type..."
                        value={customCompanionType}
                        onChange={(e) => {
                          setCustomCompanionType(e.target.value)
                          setCompanionType("")
                        }}
                        className="border-2 border-[hsl(30,40%,20%)] bg-[hsl(40,30%,96%)]"
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-2">Add Something Special</h2>
                <p className="text-sm text-[hsl(30,40%,40%)]">A unique element to make your tale unforgettable</p>
              </div>

              <div className="space-y-3">
                <Label>Unique Element</Label>
                {loadingUnique ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[hsl(30,50%,40%)]" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 w-full">
                      {uniqueOptions.map((opt) => (
                        <ChoiceButton
                          key={opt.id}
                          choice={
                            {
                              id: opt.id,
                              text: opt.label,
                              actionType: "narrative",
                              requiresRoll: false,
                              consequence: opt.description,
                            } as EnhancedChoice
                          }
                          onClick={() => {
                            console.log("[v0] Unique element clicked:", opt.label)
                            setUniqueElement(opt.label)
                            setCustomUniqueElement("")
                          }}
                          selected={uniqueElement === opt.label}
                        />
                      ))}
                    </div>
                    <Textarea
                      placeholder="Or describe your own unique element..."
                      value={customUniqueElement}
                      onChange={(e) => {
                        setCustomUniqueElement(e.target.value)
                        setUniqueElement("")
                      }}
                      className="border-2 border-[hsl(30,40%,20%)] min-h-[100px]"
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center pb-4 border-b border-[hsl(30,40%,60%)]">
                <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold mb-2">
                  Your Tale Awaits
                </h2>
                <p className="text-[hsl(30,40%,40%)]">Review your custom adventure before beginning</p>
              </div>

              <div className="space-y-4">
                {/* Setting Section - Full Width */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Setting Card */}
                  <div className="p-5 bg-[hsl(40,25%,85%)] rounded-lg border-2 border-[hsl(30,40%,60%)]">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-5 h-5 text-[hsl(30,50%,40%)]" />
                      <h3 className="text-sm font-semibold text-[hsl(30,40%,40%)] uppercase tracking-wide">SETTING</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-[hsl(30,40%,40%)] uppercase tracking-wide">Region</span>
                        <p className="font-[family-name:var(--font-heading)] font-bold text-lg mt-0.5 capitalize">
                          {customRegion || region}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-[hsl(30,40%,40%)] uppercase tracking-wide">Location</span>
                        <p className="font-[family-name:var(--font-heading)] font-bold text-lg mt-0.5 text-pretty">
                          {customLocation || location}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quest Card */}
                  <div className="p-5 bg-[hsl(35,60%,88%)] rounded-lg border-2 border-[hsl(30,40%,60%)]">
                    <div className="flex items-center gap-2 mb-3">
                      <Scroll className="w-5 h-5 text-[hsl(30,50%,40%)]" />
                      <h3 className="text-sm font-semibold text-[hsl(30,40%,40%)] uppercase tracking-wide">QUEST</h3>
                    </div>
                    <p className="font-[family-name:var(--font-heading)] font-bold text-base mb-3 text-pretty">
                      {customQuestHook || questHook}
                    </p>
                    <div className="space-y-1.5 text-sm">
                      {urgency && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[hsl(30,40%,40%)]">Urgency:</span>
                          <span className="font-semibold">{URGENCY_OPTIONS.find((u) => u.id === urgency)?.label}</span>
                        </div>
                      )}
                      {stakes && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[hsl(30,40%,40%)]">Stakes:</span>
                          <span className="font-semibold">{STAKES_OPTIONS.find((s) => s.id === stakes)?.label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Two Column Grid for Tones & Combat */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Tones */}
                  <div className="p-5 bg-[hsl(40,25%,85%)] rounded-lg border-2 border-[hsl(30,40%,60%)]">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-5 h-5 text-[hsl(30,50%,40%)]" />
                      <h3 className="text-sm font-semibold text-[hsl(30,40%,40%)] uppercase tracking-wide">TONES</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tones.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1.5 bg-[hsl(30,50%,40%)] text-white text-sm rounded-full font-medium"
                        >
                          {TONE_OPTIONS.find((tone) => tone.id === t)?.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Combat Intensity */}
                  <div className="p-5 bg-[hsl(35,60%,88%)] rounded-lg border-2 border-[hsl(30,40%,60%)]">
                    <div className="flex items-center gap-2 mb-3">
                      <Swords className="w-5 h-5 text-[hsl(30,50%,40%)]" />
                      <h3 className="text-sm font-semibold text-[hsl(30,40%,40%)] uppercase tracking-wide">
                        COMBAT INTENSITY
                      </h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <div className="font-[family-name:var(--font-heading)] text-4xl font-bold text-[hsl(30,50%,40%)]">
                        {combatFrequency}/5
                      </div>
                      <span className="text-sm text-[hsl(30,40%,40%)]">
                        {combatFrequency <= 2 ? "Rare" : combatFrequency === 3 ? "Moderate" : "Frequent"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Two Column Grid for Companions & Unique Element */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Companions */}
                  <div className="p-5 bg-[hsl(40,25%,85%)] rounded-lg border-2 border-[hsl(30,40%,60%)]">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-[hsl(30,50%,40%)]" />
                      <h3 className="text-sm font-semibold text-[hsl(30,40%,40%)] uppercase tracking-wide">
                        COMPANIONS
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium">
                        {COMPANION_PREFERENCES.find((c) => c.id === companionPreference)?.label}
                      </div>
                      {(companionType || customCompanionType) && companionPreference !== "solo" && (
                        <div className="font-[family-name:var(--font-heading)] font-bold text-lg text-pretty">
                          {customCompanionType || companionType}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Unique Element */}
                  <div className="p-5 bg-[hsl(35,60%,88%)] rounded-lg border-2 border-[hsl(30,40%,60%)]">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-[hsl(30,50%,40%)]" />
                      <h3 className="text-sm font-semibold text-[hsl(30,40%,40%)] uppercase tracking-wide">
                        UNIQUE ELEMENT
                      </h3>
                    </div>
                    <p className="font-[family-name:var(--font-heading)] font-bold text-lg text-pretty">
                      {customUniqueElement || uniqueElement}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        <NavigationFooter
          onBack={currentStep > 1 ? handleBack : undefined}
          onNext={handleNext}
          onFinishWithAI={currentStep < 6 ? handleFinishWithAI : undefined}
          nextLabel={currentStep === 6 ? "Begin Adventure" : "Next"}
          canProceed={canProceedCurrentStep()}
          showBack={currentStep > 1}
          showFinishWithAI={currentStep < 6}
        />
      </div>
    </div>
  )
}
