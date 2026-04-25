'use client'

import { useEffect, useRef, useState } from 'react'

interface AgentLogLine {
  text: string
  timestamp: number
}

interface AgentLogProps {
  repoName: string
  onComplete?: () => void
}

const LOG_LINES = [
  { text: '> Fetching repo: samirpatil2000/Buffer', time: 500 },
  { text: '> README found: 847 words', time: 1000 },
  { text: '> Language detected: Swift (96.8%)', time: 1500 },
  { text: '> Logo found: /Assets/Buffer-Logo.png', time: 2000 },
  { text: '> Tech stack: SwiftUI, AppKit, AVFoundation', time: 2500 },
  { text: '> Searching: macOS clipboard manager alternatives', time: 3500 },
  { text: '> Competitors found: Paste, Maccy, CopyClip, Clipboard Manager', time: 4000 },
  { text: '> Analyzing differentiation...', time: 4500 },
  { text: '> Unique angle: privacy-first, Vision OCR, native macOS design', time: 5500 },
  { text: '> Drafting script structure: 6 scenes', time: 6500 },
  { text: '> Scene 1 (Hook): complete', time: 7000 },
  { text: '> Scene 2 (Problem): complete', time: 7500 },
  { text: '> Scene 3 (Solution): complete', time: 8000 },
  { text: '> Scene 4 (Unique Angle): complete', time: 8500 },
  { text: '> Scene 5 (Social Proof): complete', time: 9000 },
  { text: '> Scene 6 (CTA): complete', time: 9500 },
  { text: '> Script finalized. Starting render...', time: 10000 },
  { text: '> Remotion template loaded', time: 11000 },
  { text: '> Compositing 6 scenes...', time: 11500 },
  { text: '> Render complete. 58s · 1080×1920', time: 12000 },
]

export function AgentLog({ repoName, onComplete }: AgentLogProps) {
  const [lines, setLines] = useState<AgentLogLine[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []

    LOG_LINES.forEach(({ text, time }) => {
      const timeout = setTimeout(() => {
        setLines((prev) => [...prev, { text, timestamp: time }])
      }, time)
      timeouts.push(timeout)
    })

    const completeTimeout = setTimeout(() => {
      onComplete?.()
    }, 12000)
    timeouts.push(completeTimeout)

    return () => {
      timeouts.forEach((t) => clearTimeout(t))
    }
  }, [onComplete])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  return (
    <div className="h-full flex flex-col bg-black/60 border border-white/10 rounded-xl p-4">
      <div className="text-xs text-white/50 font-mono mb-3">Agent log</div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-hidden font-mono text-xs space-y-1"
      >
        {lines.map((line, i) => (
          <div key={i} className="text-green-400">
            {line.text}
          </div>
        ))}
      </div>
    </div>
  )
}
