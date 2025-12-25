"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2, Sparkles, Star, GitFork, Check, ExternalLink } from "lucide-react"

interface AnalysisResult {
  repository?: {
    name: string
    fullName: string
    description: string | null
    url: string
    stars: number
    forks: number
    language: string | null
    topics: string[]
  }
  analysis?: {
    purpose: string
    features: string[]
    techStack: string[]
    targetAudience: string
    summary: string
  }
  error?: string
  aiPowered?: boolean
}

export function TryItOut() {
  const [githubUrl, setGithubUrl] = useState("https://github.com/salsayk/udemy_dandi")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!githubUrl.trim()) return

    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      // Add timeout using AbortController
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      const response = await fetch("/api/github-summarizer/demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ githubUrl: githubUrl.trim() }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "An error occurred")
      } else {
        setResult(data)
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError("Request timed out. Please try again.")
      } else {
        setError(err instanceof Error ? err.message : "Failed to connect to API")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="try-it-out" className="py-16 sm:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-foreground">Live Demo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-balance">
            Try it out
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Enter any public GitHub repository URL and see our AI-powered analysis in action.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* API Request - Left Side */}
            <div className="bg-card border border-border rounded-xl lg:rounded-2xl overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground ml-2">API Request</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">POST</span>
              </div>
              <div className="p-4 lg:p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="demo-url" className="block text-sm font-medium text-foreground mb-2">
                      GitHub Repository URL
                    </label>
                    <input
                      id="demo-url"
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/owner/repository"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  {/* Request Preview */}
                  <div className="bg-muted/30 rounded-lg p-3 lg:p-4 font-mono text-xs lg:text-sm overflow-x-auto">
                    <pre className="text-muted-foreground">
{`{
  "githubUrl": "${githubUrl || "https://github.com/owner/repo"}"
}`}
                    </pre>
                  </div>

                  <Button
                    type="submit"
                    disabled={!githubUrl.trim() || isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze Repository
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="mt-4 text-xs text-muted-foreground text-center">
                  No API key required for demo. Limited to 3 requests per day.
                </p>
              </div>
            </div>

            {/* API Response - Right Side */}
            <div className="bg-card border border-border rounded-xl lg:rounded-2xl overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground ml-2">AI Analysis</span>
                </div>
                <span className={`text-xs font-mono px-2 py-1 rounded ${
                  error 
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
                    : result 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                }`}>
                  {error ? "ERROR" : result ? "200 OK" : "---"}
                </span>
              </div>
              <div className="p-4 lg:p-6 h-[400px] lg:h-[450px] overflow-y-auto">
                {/* Loading State */}
                {isLoading && (
                  <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Analyzing repository with AI...</span>
                      <span className="text-xs text-muted-foreground">This may take 10-20 seconds</span>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" x2="12" y1="8" y2="12"/>
                          <line x1="12" x2="12.01" y1="16" y2="16"/>
                        </svg>
                      </div>
                      <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!result && !error && !isLoading && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Enter a GitHub URL and click &quot;Analyze Repository&quot;</p>
                      <p className="text-xs mt-1">AI-powered analysis will appear here</p>
                    </div>
                  </div>
                )}

                {/* Result State */}
                {result && !error && !isLoading && (
                  <div className="space-y-4">
                    {/* Repository Header */}
                    {result.repository && (
                      <div className="pb-4 border-b border-border">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <a 
                            href={result.repository.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-lg font-semibold text-primary hover:underline flex items-center gap-1"
                          >
                            {result.repository.fullName}
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                        {result.repository.description && (
                          <p className="text-sm text-muted-foreground mb-3">{result.repository.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Star className="h-4 w-4 text-amber-500" />
                            {result.repository.stars?.toLocaleString() || 0}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <GitFork className="h-4 w-4" />
                            {result.repository.forks?.toLocaleString() || 0}
                          </span>
                          {result.repository.language && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                              {result.repository.language}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* AI Analysis */}
                    {result.analysis && (
                      <div className="space-y-4">
                        {/* Purpose */}
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Purpose
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{result.analysis.purpose}</p>
                        </div>

                        {/* Key Features */}
                        {result.analysis.features && result.analysis.features.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Key Features
                            </h4>
                            <ul className="space-y-1.5">
                              {result.analysis.features.slice(0, 4).map((feature, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Tech Stack */}
                        {result.analysis.techStack && result.analysis.techStack.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Tech Stack
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {result.analysis.techStack.slice(0, 6).map((tech, index) => (
                                <span 
                                  key={index} 
                                  className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Summary */}
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Summary
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{result.analysis.summary}</p>
                        </div>

                        {/* AI Badge */}
                        <div className="pt-3 border-t border-border">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Sparkles className="h-3 w-3 text-primary" />
                            {result.aiPowered ? "AI-powered analysis" : "Basic analysis"} • Demo mode
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
