'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Player, type PlayerRef } from '@remotion/player'
import { getTemplateOrDefault } from '@/lib/remotion/registry'
import type { ScriptScene } from '@/lib/scriptGenerator'
import type { ProjectTheme, AudioConfig, TemplateId } from '@/lib/types'
import { MUSIC_TRACKS } from '@/lib/audioConfig'

const FPS = 30

export interface VideoEntry {
  id: string
  repoName: string
  repoUrl: string
  scenes: ScriptScene[]
  template: TemplateId
  theme?: ProjectTheme
  audioConfig: AudioConfig
  createdAt: number
}

interface VideoModalProps {
  video: VideoEntry
  onClose: () => void
  onAudioUpdate: (id: string, config: AudioConfig) => void
}

export function VideoModal({ video, onClose, onAudioUpdate }: VideoModalProps) {
  const [audioConfig, setAudioConfig] = useState<AudioConfig>(video.audioConfig)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playerRef = useRef<PlayerRef>(null)

  const tplDef = getTemplateOrDefault(video.template)
  const durationInFrames = tplDef.calculateDuration(video.scenes, FPS)
  const [component, setComponent] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    tplDef.loadComponent().then((comp) => setComponent(() => comp))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.template])

  const inputProps = {
    scenes: video.scenes,
    repoName: video.repoName,
    repoUrl: video.repoUrl,
    theme: video.theme,
    audioConfig,
  }

  // Entrance animation
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    })
  }, [])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Propagate audio config changes
  useEffect(() => {
    onAudioUpdate(video.id, audioConfig)
  }, [audioConfig, video.id, onAudioUpdate])

  // Escape key closes modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setTimeout(() => onClose(), 400)
  }, [onClose])

  const togglePreview = (trackId: string, url: string) => {
    if (!url) return
    if (playingTrackId === trackId) {
      audioRef.current?.pause()
      audioRef.current = null
      setPlayingTrackId(null)
      return
    }
    if (audioRef.current) audioRef.current.pause()
    const audio = new Audio(url)
    audio.volume = audioConfig.musicVolume
    audio.play()
    audio.addEventListener('ended', () => setPlayingTrackId(null))
    audioRef.current = audio
    setPlayingTrackId(trackId)
  }

  const updateAudio = (partial: Partial<AudioConfig>) => {
    setAudioConfig((prev) => ({ ...prev, ...partial }))
  }

  const percent = Math.round(audioConfig.musicVolume * 100)
  const animState = isClosing ? 'closing' : isVisible ? 'visible' : 'hidden'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-all duration-500 ease-out"
        style={{
          backgroundColor: animState === 'visible' ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0)',
          backdropFilter: animState === 'visible' ? 'blur(20px) saturate(0.5)' : 'blur(0px)',
        }}
      />

      {/* Modal content */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-6xl mx-6 transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
        style={{
          opacity: animState === 'visible' ? 1 : 0,
          transform:
            animState === 'visible'
              ? 'scale(1) translateY(0)'
              : animState === 'closing'
                ? 'scale(0.96) translateY(10px)'
                : 'scale(0.92) translateY(30px)',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 group flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors duration-300"
        >
          <span className="text-xs font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            esc
          </span>
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-white/10 transition-all duration-200">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </div>
        </button>

        {/* Main layout */}
        <div className="flex gap-0 rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0a0a0c]/95 backdrop-blur-2xl shadow-2xl shadow-black/60">
          {/* Left: Video player */}
          <div className="flex-1 min-w-0">
            {/* Video header */}
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
                <h2 className="text-base font-semibold text-white tracking-tight">
                  {video.repoName}
                </h2>
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest ml-auto">
                  {Math.round(durationInFrames / FPS)}s · {video.template}
                </span>
              </div>
            </div>

            {/* Player */}
            <div className="bg-black">
              <div style={{ aspectRatio: '16/9' }}>
                {component ? (
                  <Player
                    ref={playerRef}
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
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-indigo-400 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Audio config sidebar */}
          <div className="w-[320px] shrink-0 border-l border-white/[0.06] flex flex-col bg-[#0c0c0e]/80">
            {/* Sidebar header */}
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/50">
                  <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span className="text-sm font-semibold text-white">Audio</span>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Track selection */}
              <div className="mb-6">
                <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono mb-3">
                  Background Music
                </div>
                <div className="space-y-1">
                  {MUSIC_TRACKS.map((track) => {
                    const isSelected = audioConfig.musicTrackId === track.id
                    const isPlaying = playingTrackId === track.id
                    const hasAudio = !!track.url

                    return (
                      <div
                        key={track.id}
                        onClick={() => updateAudio({ musicTrackId: track.id })}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 border"
                        style={{
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.06)' : 'transparent',
                          borderColor: isSelected ? 'rgba(255,255,255,0.08)' : 'transparent',
                        }}
                      >
                        {/* Radio indicator */}
                        <div
                          className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0"
                          style={{
                            borderColor: isSelected ? '#818cf8' : 'rgba(255,255,255,0.15)',
                          }}
                        >
                          <div
                            className="rounded-full transition-all duration-300"
                            style={{
                              width: isSelected ? 8 : 0,
                              height: isSelected ? 8 : 0,
                              backgroundColor: '#818cf8',
                              boxShadow: isSelected ? '0 0 8px rgba(129,140,248,0.5)' : 'none',
                            }}
                          />
                        </div>

                        {/* Label */}
                        <span
                          className="text-sm flex-1 transition-colors duration-300"
                          style={{
                            color: isSelected ? '#fff' : 'rgba(255,255,255,0.5)',
                            fontWeight: isSelected ? 500 : 400,
                          }}
                        >
                          {track.label}
                        </span>

                        {/* Preview button */}
                        {hasAudio && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              togglePreview(track.id, track.url)
                            }}
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shrink-0"
                            style={{
                              backgroundColor: isPlaying ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                              color: isPlaying ? '#a5b4fc' : 'rgba(255,255,255,0.3)',
                              opacity: isPlaying ? 1 : undefined,
                            }}
                          >
                            {isPlaying ? (
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                                <rect x="1" y="1" width="3" height="8" rx="0.5" />
                                <rect x="6" y="1" width="3" height="8" rx="0.5" />
                              </svg>
                            ) : (
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                                <path d="M2 1.5v7l6.5-3.5L2 1.5z" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/[0.06] mb-6" />

              {/* Volume control */}
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono mb-4">
                  Volume
                </div>

                <div className="space-y-4">
                  {/* Volume slider */}
                  <div className="flex items-center gap-3">
                    {/* Speaker icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/40 shrink-0">
                      <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      {percent > 0 && (
                        <path d="M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      )}
                      {percent > 50 && (
                        <path d="M19.07 4.93a10 10 0 010 14.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      )}
                    </svg>

                    <div className="relative flex-1 h-6 flex items-center">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={percent}
                        onChange={(e) => {
                          const v = Number(e.target.value) / 100
                          updateAudio({ musicVolume: v })
                          if (audioRef.current) audioRef.current.volume = v
                        }}
                        className="
                          w-full h-1.5 appearance-none rounded-full cursor-pointer
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:w-4
                          [&::-webkit-slider-thumb]:h-4
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:bg-white
                          [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(255,255,255,0.3)]
                          [&::-webkit-slider-thumb]:transition-transform
                          [&::-webkit-slider-thumb]:duration-150
                          [&::-webkit-slider-thumb]:hover:scale-110
                          [&::-moz-range-thumb]:w-4
                          [&::-moz-range-thumb]:h-4
                          [&::-moz-range-thumb]:rounded-full
                          [&::-moz-range-thumb]:bg-white
                          [&::-moz-range-thumb]:border-none
                        "
                        style={{
                          background: `linear-gradient(90deg, rgba(129,140,248,0.6) ${percent}%, rgba(255,255,255,0.08) ${percent}%)`,
                        }}
                      />
                    </div>

                    <span className="text-xs text-white/40 font-mono w-10 text-right tabular-nums">
                      {percent}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="px-6 py-4 border-t border-white/[0.06]">
              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                  bg-white/[0.06] text-white/70 hover:bg-white/[0.1] hover:text-white
                  border border-white/[0.08] hover:border-white/[0.12]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .video-modal-track:hover .track-preview-btn {
          opacity: 1;
        }
      `}} />
    </div>
  )
}
