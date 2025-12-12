'use client'

import { HeroUIProvider } from "@heroui/react"
import { ThemeProvider } from "@/components/ThemeProvider"
import { FlaskAuthProvider } from "@/lib/flask-auth"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <FlaskAuthProvider>
        <HeroUIProvider
          disableRipple={false}
          disableAnimation={false}
        >
          {children}
        </HeroUIProvider>
      </FlaskAuthProvider>
    </ThemeProvider>
  )
}
