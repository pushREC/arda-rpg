import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Scroll, Sword, Shield, Sparkles, ArrowRight } from "lucide-react"

export default function WelcomePage() {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-[hsl(40,30%,94%)]">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-4 pt-8 md:pt-16 animate-[fade-in-up_0.6s_ease-out]">
          <h1 className="font-[family-name:var(--font-heading)] text-5xl md:text-7xl font-bold text-balance tracking-tight">
            Tales of Middle-earth
          </h1>
          <p className="text-xl md:text-2xl text-[hsl(30,40%,40%)] text-balance max-w-2xl mx-auto leading-relaxed">
            An AI-powered interactive adventure where your choices shape the story
          </p>
        </div>

        <Card className="p-8 bg-[hsl(40,35%,92%)] border-2 border-[hsl(30,40%,20%)] shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-6 bg-[hsl(40,30%,96%)] rounded-lg border border-[hsl(30,40%,60%)]">
              <div className="w-12 h-12 rounded-lg bg-[hsl(30,50%,50%)]/10 flex items-center justify-center">
                <Scroll className="w-6 h-6 text-[hsl(30,50%,40%)]" />
              </div>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold">Dynamic Storytelling</h3>
              <p className="text-[hsl(30,40%,40%)] text-pretty leading-relaxed">
                Every choice matters. The AI adapts the narrative based on your decisions, creating a unique adventure.
              </p>
            </div>

            <div className="space-y-3 p-6 bg-[hsl(40,30%,96%)] rounded-lg border border-[hsl(30,40%,60%)]">
              <div className="w-12 h-12 rounded-lg bg-[hsl(30,50%,50%)]/10 flex items-center justify-center">
                <Sword className="w-6 h-6 text-[hsl(30,50%,40%)]" />
              </div>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold">Strategic Combat</h3>
              <p className="text-[hsl(30,40%,40%)] text-pretty leading-relaxed">
                Roll dice to determine outcomes. Manage your character's health and resources carefully.
              </p>
            </div>

            <div className="space-y-3 p-6 bg-[hsl(40,30%,96%)] rounded-lg border border-[hsl(30,40%,60%)]">
              <div className="w-12 h-12 rounded-lg bg-[hsl(30,50%,50%)]/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[hsl(30,50%,40%)]" />
              </div>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold">Character Progression</h3>
              <p className="text-[hsl(30,40%,40%)] text-pretty leading-relaxed">
                Create unique characters with distinct abilities. Unlock achievements as you progress.
              </p>
            </div>

            <div className="space-y-3 p-6 bg-[hsl(40,30%,96%)] rounded-lg border border-[hsl(30,40%,60%)]">
              <div className="w-12 h-12 rounded-lg bg-[hsl(30,50%,50%)]/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[hsl(30,50%,40%)]" />
              </div>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold">Immersive World</h3>
              <p className="text-[hsl(30,40%,40%)] text-pretty leading-relaxed">
                Explore Middle-earth with rich descriptions and atmospheric storytelling powered by AI.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-[hsl(35,60%,88%)] border-2 border-[hsl(30,40%,20%)] shadow-card">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center space-y-2">
              <p className="text-[hsl(30,40%,30%)] text-lg font-medium">Ready to begin your adventure?</p>
              <p className="text-sm text-[hsl(30,40%,40%)]">
                Embark on an epic journey filled with mystery, danger, and glory
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/character-creation" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full text-lg px-8 py-6 font-[family-name:var(--font-heading)] border-2 border-[hsl(30,40%,20%)] shadow-card-interactive hover:-translate-y-0.5 transition-all"
                >
                  Begin Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full text-lg px-8 py-6 font-[family-name:var(--font-heading)] border-2 border-[hsl(30,40%,20%)] shadow-card-interactive bg-transparent hover:-translate-y-0.5 transition-all"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
