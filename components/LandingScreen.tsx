'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface LandingScreenProps {
  onSubmit: (url: string) => void
}

export function LandingScreen({ onSubmit }: LandingScreenProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    // Validate URL
    if (!url.startsWith('https://github.com/')) {
      setError('Please enter a valid public GitHub URL.')
      return
    }
    setError('')
    onSubmit(url)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Badge */}
      {/* Logo or Title would go here */}

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
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 font-semibold"
        >
          Generate Reel →
        </Button>
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
  )
}
