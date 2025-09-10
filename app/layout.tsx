import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ReduxProvider } from "@/components/providers/redux-provider"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Pokédex AI Chatbot",
  description: "An AI-powered Pokédex with streaming responses",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <ReduxProvider>{children}</ReduxProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
