'use client'

import { useState, useRef, useEffect } from 'react'
import type { AudioConfig } from '@/lib/types'
import { VOICE_STYLES, MUSIC_TRACKS } from '@/lib/audioConfig'

interface AudioPanelProps {
  config: AudioConfig
  onChange: (config: AudioConfig) => void
}

export function AudioPanel({ config, onChange }: AudioPanelProps) {
  const [showFineTune, setShowFineTune] = useState(false)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const update = (partial: Partial<AudioConfig>) => {
    onChange({ ...config, ...partial })
  }

  const togglePreview = (trackId: string, url: string) => {
    if (!url) return

    if (playingTrackId === trackId) {
      // Stop
      audioRef.current?.pause()
      audioRef.current = null
      setPlayingTrackId(null)
      return
    }

    // Stop previous
    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(url)
    audio.volume = config.musicVolume
    audio.play()
    audio.addEventListener('ended', () => setPlayingTrackId(null))
    audioRef.current = audio
    setPlayingTrackId(trackId)
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm p-6">
      <h3 className="text-sm font-semibold text-white mb-6">Audio</h3>

      {/* ─── Voice Style ──────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mb-4">
          Voice Style
        </div>
        <div className="grid grid-cols-2 gap-2">
          {VOICE_STYLES.map((v) => (
            <button
              key={v.id}
              onClick={() => update({ voiceStyle: v.id })}
              title={v.desc}
              className={[
                'px-3 py-2 rounded-md text-xs font-medium transition-all duration-300 text-center border',
                config.voiceStyle === v.id
                  ? 'bg-indigo-500/10 text-white border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                  : 'bg-white/2 text-white/50 border-white/5 hover:border-white/20 hover:text-white/80',
              ].join(' ')}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Music Track ──────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mb-4">
          Background Music
        </div>
        <div className="space-y-1.5">
          {MUSIC_TRACKS.map((track) => {
            const isSelected = config.musicTrackId === track.id
            const isPlaying = playingTrackId === track.id
            const hasAudio = !!track.url

            return (
              <div
                key={track.id}
                onClick={() => update({ musicTrackId: track.id })}
                className={[
                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-300 border',
                  isSelected
                    ? 'bg-white/10 border-white/10 shadow-sm'
                    : 'bg-transparent border-transparent hover:bg-white/5',
                ].join(' ')}
              >
                {/* Selection Dot */}
                <div
                  className={[
                    'w-1.5 h-1.5 rounded-full transition-all duration-500',
                    isSelected ? 'bg-indigo-400 scale-110 shadow-[0_0_8px_rgba(129,140,248,0.6)]' : 'bg-white/10',
                  ].join(' ')}
                />

                {/* Label */}
                <span
                  className={[
                    'text-sm flex-1 transition-colors duration-300',
                    isSelected ? 'text-white font-medium' : 'text-white/60 group-hover:text-white/80',
                  ].join(' ')}
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
                    className={[
                      'w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200',
                      isPlaying
                        ? 'bg-indigo-500/30 text-indigo-300'
                        : 'bg-white/5 text-white/40 opacity-0 group-hover:opacity-100 hover:bg-white/10 hover:text-white/60',
                    ].join(' ')}
                  >
                    {isPlaying ? (
                      // Pause icon
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                        <rect x="1" y="1" width="3" height="8" rx="0.5" />
                        <rect x="6" y="1" width="3" height="8" rx="0.5" />
                      </svg>
                    ) : (
                      // Play icon
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

      {/* ─── Fine-tune disclosure ──────────────────────────────────── */}
      <div className="border-t border-white/5 pt-4">
        <button
          onClick={() => setShowFineTune(!showFineTune)}
          className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors duration-200 font-mono uppercase tracking-wide w-full"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="currentColor"
            className={[
              'transition-transform duration-300',
              showFineTune ? 'rotate-90' : '',
            ].join(' ')}
          >
            <path d="M3 1l4 4-4 4V1z" />
          </svg>
          Fine-tune audio
        </button>

        {/* Volume sliders — collapsible */}
        <div
          className={[
            'overflow-hidden transition-all duration-300 ease-out',
            showFineTune ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0',
          ].join(' ')}
        >
          <VolumeSlider
            label="Voiceover"
            value={config.voiceVolume}
            onChange={(v) => update({ voiceVolume: v })}
          />
          <div className="h-3" />
          <VolumeSlider
            label="Music"
            value={config.musicVolume}
            onChange={(v) => {
              update({ musicVolume: v })
              // Live-update preview audio if playing
              if (audioRef.current) {
                audioRef.current.volume = v
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Minimal volume slider ────────────────────────────────────────────────────

function VolumeSlider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  const percent = Math.round(value * 100)

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/40 font-mono w-20 shrink-0">{label}</span>
      <div className="relative flex-1 h-5 flex items-center group">
        <input
          type="range"
          min="0"
          max="100"
          value={percent}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
          className="
            w-full h-1 appearance-none bg-white/10 rounded-full cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-indigo-400
            [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(99,102,241,0.4)]
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:duration-150
            [&::-webkit-slider-thumb]:hover:scale-125
            [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:h-3
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-indigo-400
            [&::-moz-range-thumb]:border-none
          "
          style={{
            background: `linear-gradient(90deg, rgba(99,102,241,0.4) ${percent}%, rgba(255,255,255,0.1) ${percent}%)`,
          }}
        />
      </div>
      <span className="text-xs text-white/30 font-mono w-8 text-right">{percent}%</span>
    </div>
  )
}
