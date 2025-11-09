import type React from "react"
import type { Metadata } from "next"
import { Cinzel, Lora } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"

const cinzel = Cinzel({
  subsets: ["latin"],
  display: "swap",
})

const lora = Lora({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Tales of Middle-earth - Interactive RPG",
  description: "An AI-powered text-based RPG adventure set in Middle-earth",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cinzel.className}`}>
      <body className={`${lora.className} antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
