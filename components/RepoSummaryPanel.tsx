'use client'

import { RepoData } from '@/lib/types'

interface RepoSummaryPanelProps {
  data: RepoData
}

export function RepoSummaryPanel({ data }: RepoSummaryPanelProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm p-6">
      <h3 className="text-sm font-semibold text-white mb-6">Repository Info</h3>

      {/* Project section */}
      <div className="mb-8">
        <div className="text-xs text-white/50 uppercase tracking-wide font-mono mb-3">
          Project
        </div>
        <div className="font-mono text-sm text-white mb-2">{data.repoName}</div>
        <p className="text-sm text-white/70 mb-4">{data.description}</p>
        <div className="space-y-2 text-sm text-white/70">
          <div>
            <span className="text-white/50">Language:</span> {data.language}
          </div>
          <div>
            <span className="text-white/50">Stars:</span> {data.stars.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Topics section */}
      {data.topics.length > 0 && (
        <div className="mb-8 pb-8 border-b border-white/10">
          <div className="text-xs text-white/50 uppercase tracking-wide font-mono mb-3">
            Topics
          </div>
          <div className="flex flex-wrap gap-2">
            {data.topics.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1 text-xs border border-white/20 rounded-full text-white/70 font-mono"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Script info */}
      <div>
        <div className="text-xs text-white/50 uppercase tracking-wide font-mono mb-3">
          Script
        </div>
        <div className="text-sm text-white/70">
          {data.scriptScenes.length} scenes
          <br />
          {data.totalDurationSeconds}s total
        </div>
      </div>
    </div>
  )
}
