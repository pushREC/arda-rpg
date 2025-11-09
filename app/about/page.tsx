import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Sparkles, Zap, BookOpen } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold">About the Game</h1>
        </div>

        <Card className="p-8 space-y-6">
          <div className="space-y-4">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">
              Welcome to Tales of Middle-earth
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              This is an AI-powered text-based RPG that brings the magic of interactive storytelling to life. Every
              decision you make shapes the narrative, creating a unique adventure tailored to your choices.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              How It Works
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-primary font-bold shrink-0">1.</span>
                <span>Create your character by choosing a class and customizing their attributes</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold shrink-0">2.</span>
                <span>Select a scenario to begin your adventure in Middle-earth</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold shrink-0">3.</span>
                <span>Make choices at key moments that influence the story's direction</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold shrink-0">4.</span>
                <span>Roll dice during challenges to determine success or failure</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Features
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Dynamic AI-generated narratives that adapt to your choices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Multiple character classes with unique abilities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Dice-based combat and skill checks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Achievement system to track your progress</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Immersive Middle-earth themed design</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Tips for New Adventurers
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Think carefully about your choices - they have consequences</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Manage your health wisely during combat encounters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Different character classes excel in different situations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Explore multiple paths to discover all the content</span>
              </li>
            </ul>
          </div>
        </Card>

        <div className="flex justify-center">
          <Link href="/character-creation">
            <Button size="lg" className="font-[family-name:var(--font-heading)]">
              Start Your Adventure
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
