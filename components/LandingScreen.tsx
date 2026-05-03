'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface LandingScreenProps {
  onSubmit: (url: string) => void
}

const LOADING_PHRASES = [
  'Reading your code…',
  'Understanding the architecture…',
  'Researching the market…',
  'Writing the script…',
  'Preparing your reel…',
]

const SAMPLES = [
  { name: 'Buffer', url: 'https://github.com/samirpatil2000/Buffer' },
  { name: 'Claude Pulse', url: 'https://github.com/samirpatil2000/claude-pulse' },
]

export function LandingScreen({ onSubmit }: LandingScreenProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [fadeContent, setFadeContent] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const hasSubmitted = useRef(false)

  const handleSubmit = () => {
    if (isLoading) return
    // Validate URL
    if (!url.startsWith('https://github.com/')) {
      setError('Please enter a valid public GitHub URL.')
      return
    }
    setError('')
    setIsLoading(true)

    // Phase 1: fade out existing content
    setFadeContent(true)

    // Phase 2: after content fades, show loading state
    setTimeout(() => {
      setShowLoading(true)
    }, 600)

    // Phase 3: after the dramatic pause, actually submit
    setTimeout(() => {
      if (!hasSubmitted.current) {
        hasSubmitted.current = true
        onSubmit(url)
      }
    }, 2800)
  }

  // Cycle through loading phrases
  useEffect(() => {
    if (!showLoading) return
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [showLoading])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden">

      {/* ── Landing content ── */}
      <div
        className="flex flex-col items-center w-full transition-all duration-700 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{
          opacity: fadeContent ? 0 : 1,
          transform: fadeContent ? 'scale(0.96) translateY(12px)' : 'scale(1) translateY(0)',
          filter: fadeContent ? 'blur(6px)' : 'blur(0)',
          pointerEvents: fadeContent ? 'none' : 'auto',
        }}
      >
        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-bold text-white text-center mb-6 leading-tight tracking-tight max-w-3xl">
          Your repo deserves
          <br />a trailer.
        </h1>

        {/* Subheading */}
        <p className="text-lg text-white/60 text-center mb-12 max-w-2xl">
          Paste a public GitHub URL. We read the code, research the market,
          <br />
          write the script, and render a video. In under 2 minutes.
        </p>

        {/* Input and Button */}
        <div className="w-full max-w-2xl">
          <div className="flex flex-col gap-2 mb-4">
            <Input
              type="text"
              placeholder="https://github.com/username/repo"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError('')
              }}
              onKeyDown={handleKeyDown}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 font-mono text-base py-3 px-4"
            />
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 font-semibold transition-all duration-300"
          >
            Generate Reel →
          </Button>

          {/* Sample chips */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-xs text-white/40 font-medium">Try a sample:</span>
            <div className="flex gap-2">
              {SAMPLES.map((sample) => (
                <button
                  key={sample.url}
                  onClick={() => {
                    setUrl(sample.url)
                    setError('')
                  }}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full text-[11px] text-white/70 hover:text-white transition-all duration-300 backdrop-blur-sm"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Warning pills */}
        <div className="flex flex-col sm:flex-row gap-3 mt-12 justify-center flex-wrap max-w-2xl">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white/50 font-mono whitespace-nowrap">
            ⚠ Private repos won&apos;t work
          </div>
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white/50 font-mono whitespace-nowrap">
            ⚠ Monorepos may be incomplete
          </div>
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white/50 font-mono whitespace-nowrap">
            ⚠ Repos without a README produce limited results
          </div>
        </div>
      </div>

      {/* ── Cinematic loading state ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{
          opacity: showLoading ? 1 : 0,
          pointerEvents: showLoading ? 'auto' : 'none',
        }}
      >
        {/* Pulsing glow orb */}
        <div className="relative mb-12">
          {/* Outer glow */}
          <div
            className="absolute -inset-8 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)',
              animation: showLoading ? 'loadingPulse 2.4s ease-in-out infinite' : 'none',
            }}
          />
          {/* Inner orb */}
          <div
            className="relative w-16 h-16 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(139,92,246,0.9), rgba(79,70,229,0.6))',
              boxShadow: '0 0 60px rgba(79,70,229,0.3), 0 0 120px rgba(139,92,246,0.1)',
              animation: showLoading ? 'loadingPulse 2.4s ease-in-out infinite, orbFloat 6s ease-in-out infinite' : 'none',
            }}
          />
        </div>

        {/* Phrase text with crossfade */}
        <div className="relative h-8 flex items-center justify-center">
          {LOADING_PHRASES.map((phrase, i) => (
            <p
              key={phrase}
              className="absolute text-lg font-medium tracking-wide text-white/80 whitespace-nowrap transition-all duration-700 ease-[cubic-bezier(.4,0,.2,1)]"
              style={{
                opacity: i === phraseIndex ? 1 : 0,
                transform: i === phraseIndex ? 'translateY(0)' : 'translateY(8px)',
                filter: i === phraseIndex ? 'blur(0)' : 'blur(4px)',
              }}
            >
              {phrase}
            </p>
          ))}
        </div>

        {/* Subtle progress bar */}
        <div className="mt-10 w-48 h-[2px] bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, rgba(79,70,229,0.8), rgba(139,92,246,0.8))',
              animation: showLoading ? 'progressSlide 2.8s ease-in-out forwards' : 'none',
            }}
          />
        </div>
      </div>

      {/* Keyframe animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loadingPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes progressSlide {
          0% { width: 0%; }
          60% { width: 70%; }
          100% { width: 100%; }
        }
      `}} />
    </div>
  )
}
