'use client'

import { RepoData } from '@/lib/types'

interface RepoSummaryPanelProps {
  data: RepoData
}

export function RepoSummaryPanel({ data }: RepoSummaryPanelProps) {
  return (
    <div className="sticky top-8 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm p-6">
      <h3 className="text-sm font-semibold text-white mb-6">What we found</h3>

      {/* Project section */}
      <div className="mb-8">
        <div className="text-xs text-white/50 uppercase tracking-wide font-mono mb-3">
          Project
        </div>
        <div className="font-mono text-sm text-white mb-2">{data.repoId}</div>
        <p className="text-sm text-white/70 mb-4">{data.description}</p>
        <div className="flex flex-wrap gap-2">
          {data.techStack.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 text-xs border border-white/20 rounded-full text-white/70 font-mono"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Unique angle section */}
      <div className="mb-8 pb-8 border-b border-white/10">
        <div className="flex items-start gap-3">
          <div className="w-1 h-1 rounded-full bg-indigo-600 mt-2 flex-shrink-0"></div>
          <div>
            <div className="text-xs text-white/50 uppercase tracking-wide font-mono mb-2">
              Unique Angle
            </div>
            <p className="text-sm text-white/70">{data.uniqueAngle}</p>
          </div>
        </div>
      </div>

      {/* Competitors section */}
      <div>
        <div className="text-xs text-white/50 uppercase tracking-wide font-mono mb-3">
          Competitors Found
        </div>
        <div className="flex flex-wrap gap-2">
          {data.competitors.map((comp) => (
            <span
              key={comp.name}
              className="px-3 py-1 text-xs border border-white/20 rounded-full text-white/70 font-mono"
            >
              {comp.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
