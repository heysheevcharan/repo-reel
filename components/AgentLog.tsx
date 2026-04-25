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

export function AgentLog({ repoName, onComplete }: AgentLogProps) {
  const [lines, setLines] = useState<AgentLogLine[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const logLines = [
    { text: `> Fetching repo: ${repoName}`, time: 500 },
    { text: '> README found: 1,240 words', time: 1000 },
    { text: '> Language detected: TypeScript (92.4%)', time: 1500 },
    { text: `> Logo found: /Assets/${repoName}-logo.png`, time: 2000 },
    { text: '> Tech stack: React, Remotion, Framer Motion', time: 2500 },
    { text: `> Searching: ${repoName} alternatives and use cases`, time: 3500 },
    { text: '> Competitors found: After Effects, Canva, Adobe Express', time: 4000 },
    { text: '> Analyzing differentiation...', time: 4500 },
    { text: '> Unique angle: code-based animation, programmatic video', time: 5500 },
    { text: '> Drafting script structure: 5 scenes', time: 6500 },
    { text: '> Scene 1 (Hook): complete', time: 7000 },
    { text: '> Scene 2 (Problem): complete', time: 7500 },
    { text: '> Scene 3 (Solution): complete', time: 8000 },
    { text: '> Scene 4 (Comparison): complete', time: 8500 },
    { text: '> Scene 5 (CTA): complete', time: 9000 },
    { text: '> Script finalized. Starting render...', time: 10000 },
    { text: '> Remotion template loaded', time: 11000 },
    { text: '> Compositing scenes...', time: 11500 },
    { text: '> Render complete. 45s · 1080×1920', time: 12000 },
  ]

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []

    logLines.forEach(({ text, time }) => {
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
