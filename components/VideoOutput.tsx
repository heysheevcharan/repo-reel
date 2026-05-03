'use client'

import { useState, useCallback, useEffect } from 'react'
import { Player } from '@remotion/player'
import { getTemplateOrDefault } from '@/lib/remotion/registry'
import type { ScriptScene } from '@/lib/scriptGenerator'
import type { ProjectTheme, AudioConfig, TemplateId } from '@/lib/types'
import { VideoModal, type VideoEntry } from './VideoModal'

const FPS = 30

interface VideoOutputProps {
  repoName: string
  repoUrl: string
  scenes: ScriptScene[]
  template: TemplateId
  theme?: ProjectTheme
  audioConfig?: AudioConfig
  onEdit: () => void
}

export function VideoOutput({ repoName, repoUrl, scenes, template, theme, audioConfig, onEdit }: VideoOutputProps) {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)

  // Build a list of videos. For now we show the current video.
  // Each new render creates a new entry. We store them in local state.
  const [videos, setVideos] = useState<VideoEntry[]>(() => {
    const entry: VideoEntry = {
      id: `video-${Date.now()}`,
      repoName,
      repoUrl,
      scenes,
      template,
      theme,
      audioConfig: audioConfig ?? { musicTrackId: 'motivational-1', musicVolume: 0.3 },
      createdAt: Date.now(),
    }
    return [entry]
  })

  const selectedVideo = videos.find((v) => v.id === selectedVideoId) ?? null

  const handleAudioUpdate = useCallback((id: string, config: AudioConfig) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, audioConfig: config } : v))
    )
  }, [])

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 bg-gradient-to-b from-background to-background">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto w-full mb-12">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors duration-200 group"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:-translate-x-0.5">
              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs font-mono uppercase tracking-widest">Back to Editor</span>
          </button>
        </div>

        <div className="mt-8">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
            Your Videos
          </h1>
          <p className="text-base text-white/40 max-w-lg">
            Click any video to preview it and fine-tune the audio.
            Every detail matters.
          </p>
        </div>
      </div>

      {/* ── Video Grid ───────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              index={index}
              onClick={() => setSelectedVideoId(video.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Modal ────────────────────────────────────────────── */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideoId(null)}
          onAudioUpdate={handleAudioUpdate}
        />
      )}

      {/* Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cardReveal {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
            filter: blur(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
      `}} />
    </div>
  )
}


// ─── Video Card ────────────────────────────────────────────────────────────────

function VideoCard({
  video,
  index,
  onClick,
}: {
  video: VideoEntry
  index: number
  onClick: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [component, setComponent] = useState<React.ComponentType<any> | null>(null)

  const tplDef = getTemplateOrDefault(video.template)
  const durationInFrames = tplDef.calculateDuration(video.scenes, FPS)

  useEffect(() => {
    tplDef.loadComponent().then((comp) => setComponent(() => comp))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.template])

  const inputProps = {
    scenes: video.scenes,
    repoName: video.repoName,
    repoUrl: video.repoUrl,
    theme: video.theme,
    audioConfig: video.audioConfig,
  }

  const totalSeconds = Math.round(durationInFrames / FPS)
  const trackLabel = video.audioConfig.musicTrackId === 'none'
    ? 'No Music'
    : video.audioConfig.musicTrackId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
      style={{
        animation: `cardReveal 0.8s cubic-bezier(.16,1,.3,1) ${index * 0.12}s both`,
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered
          ? '0 20px 60px -12px rgba(79,70,229,0.25), 0 0 0 1px rgba(129,140,248,0.15)'
          : '0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      {/* Video thumbnail */}
      <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
        {component ? (
          <Player
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            component={component as any}
            inputProps={inputProps}
            durationInFrames={durationInFrames}
            fps={FPS}
            compositionWidth={1920}
            compositionHeight={1080}
            style={{ width: '100%', height: '100%', display: 'block' }}
            // No controls, no autoplay — static thumbnail
            numberOfSharedAudioTags={0}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black/50">
            <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-indigo-400 animate-spin" />
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-all duration-500"
          style={{
            backgroundColor: isHovered ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)',
            backdropFilter: isHovered ? 'blur(2px)' : 'blur(0)',
          }}
        >
          {/* Play button */}
          <div
            className="transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'scale(1)' : 'scale(0.7)',
            }}
          >
            <div className="w-16 h-16 rounded-full bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-md">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="ml-1">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
          <span className="text-[11px] font-mono text-white/80 tabular-nums">{totalSeconds}s</span>
        </div>

        {/* Template badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
          <span className="text-[11px] font-mono text-white/80 uppercase tracking-wider">
            {video.template}
          </span>
        </div>
      </div>

      {/* Card footer */}
      <div className="bg-[#0c0c0e] px-5 py-4 border-t border-white/[0.04]">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-white truncate mb-0.5">
              {video.repoName}
            </h3>
            <p className="text-[11px] text-white/30 font-mono truncate">
              {video.scenes.length} scenes · {trackLabel}
            </p>
          </div>

          {/* Audio config indicator */}
          <div
            className="shrink-0 ml-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-300"
            style={{
              backgroundColor: isHovered ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: isHovered ? 'rgba(129,140,248,0.2)' : 'rgba(255,255,255,0.06)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white/40">
              <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
              <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span className="text-[10px] font-mono text-white/40 tabular-nums">
              {Math.round(video.audioConfig.musicVolume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
