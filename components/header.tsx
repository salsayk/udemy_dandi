"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { GithubIcon } from "lucide-react"
import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useEffect } from "react"

export function Header() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboards" })
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GithubIcon className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-balance">Dandi Github Analyzer</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {!mounted || status === "loading" ? (
              // Loading state
              <div className="flex items-center gap-3">
                <div className="h-9 w-16 bg-muted animate-pulse rounded-md" />
                <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
              </div>
            ) : session ? (
              // Logged in state
              <div className="flex items-center gap-3">
                <Link href="/dashboards">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "Profile"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              // Logged out state
              <>
                <Button variant="ghost" size="sm" onClick={handleSignIn}>
                  Login
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleSignIn}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
