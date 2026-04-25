'use client'

import { Player } from '@remotion/player'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { RepoReelVideo } from '@/lib/remotion/VideoComposition'
import { KineticVideo } from '@/lib/remotion/KineticComposition'
import { calcDurationInFrames, calcKineticDurationInFrames } from '@/lib/remotion/duration'
import type { ScriptScene } from '@/lib/scriptGenerator'
import type { ProjectTheme } from '@/lib/types'

const FPS = 30

interface VideoOutputProps {
  repoName: string
  repoUrl: string
  scenes: ScriptScene[]
  template: 'launch' | 'kinetic'
  theme?: ProjectTheme
  onEdit: () => void
}

export function VideoOutput({ repoName, repoUrl, scenes, template, theme, onEdit }: VideoOutputProps) {
  const isKinetic = template === 'kinetic'
  const component = isKinetic ? KineticVideo : RepoReelVideo
  const durationInFrames = isKinetic
    ? calcKineticDurationInFrames(scenes, FPS)
    : calcDurationInFrames(scenes, FPS)

  const inputProps = { scenes, repoName, repoUrl, theme }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-background to-background">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
            <Check size={24} className="text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Your reel is ready.</h1>
        <p className="text-sm text-white/50 font-mono">
          {repoName} · {Math.round(durationInFrames / FPS)}s · live preview
        </p>
      </div>

      <div className="mb-8 w-full max-w-4xl">
        <div className="rounded-xl overflow-hidden border border-white/10 bg-black" style={{ aspectRatio: '16/9' }}>
          <Player
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            component={component as any}
            inputProps={inputProps}
            durationInFrames={durationInFrames}
            fps={FPS}
            compositionWidth={1920}
            compositionHeight={1080}
            style={{ width: '100%', height: '100%', display: 'block' }}
            controls
            autoPlay
            loop
          />
        </div>
      </div>

      <div className="flex gap-4 max-w-4xl w-full">
        <Button
          onClick={onEdit}
          variant="outline"
          className="flex-1 border-white/20 text-white/70 hover:text-white hover:bg-white/5"
        >
          ← Edit Script
        </Button>
      </div>

    </div>
  )
}
