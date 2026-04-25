'use client'

import { Button } from '@/components/ui/button'
import { Check, Download } from 'lucide-react'

interface VideoOutputProps {
  repoName: string
  duration: number
  onEdit: () => void
}

export function VideoOutput({
  repoName,
  duration,
  onEdit,
}: VideoOutputProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-background to-background">
      {/* Success message */}
      <div className="mb-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
            <Check size={24} className="text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Your reel is ready.
        </h1>
        <p className="text-sm text-white/50 font-mono">
          {repoName} · {duration} seconds · 1080×1920
        </p>
      </div>

      {/* Video player placeholder */}
      <div className="mb-8 w-full max-w-lg">
        <div className="aspect-video rounded-xl bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0c]">
            <div className="text-center">
              <div className="font-mono text-indigo-400 mb-2">
                {repoName}
              </div>
              <div className="text-xs text-white/40">
                Rendered by RepoReel
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-white/40 mt-2 text-center font-mono">
          Video player coming soon
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 mb-12 max-w-lg w-full">
        <Button
          variant="outline"
          className="flex-1 border-white/20 text-white/70 hover:text-white hover:bg-white/5 gap-2"
        >
          <Download size={16} />
          Download MP4
        </Button>
        <Button
          onClick={onEdit}
          variant="outline"
          className="flex-1 border-white/20 text-white/70 hover:text-white hover:bg-white/5"
        >
          ← Edit Script
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-white/40">
        <p className="mb-2">Built at Zero to Agent · Bengaluru · April 2026</p>
        <a
          href="#"
          className="text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          reproreel.vercel.app
        </a>
      </div>
    </div>
  )
}
