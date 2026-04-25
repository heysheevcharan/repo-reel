'use client'

import { useState, useCallback } from 'react'
import { Player } from '@remotion/player'
import { Button } from '@/components/ui/button'
import { RepoData, AudioConfig } from '@/lib/types'
import { DEFAULT_AUDIO_CONFIG } from '@/lib/audioConfig'
import { RepoReelVideo } from '@/lib/remotion/VideoComposition'
import { KineticVideo } from '@/lib/remotion/KineticComposition'
import { calcDurationInFrames, calcKineticDurationInFrames } from '@/lib/remotion/duration'
import { SceneCard } from './SceneCard'
import { RepoSummaryPanel } from './RepoSummaryPanel'
import { VideoModal, type VideoEntry } from './VideoModal'

const FPS = 30

type Template = 'launch' | 'kinetic'

interface ScriptEditorProps {
  data: RepoData
  onBack: () => void
  onRender: (scenes: RepoData['scriptScenes'], template: Template, audioConfig: AudioConfig) => void
  isRendering?: boolean
}

export function ScriptEditor({
  data,
  onBack,
  onRender,
  isRendering = false,
}: ScriptEditorProps) {
  const [scenes, setScenes] = useState(data.scriptScenes)
  const [template, setTemplate] = useState<Template>('launch')
  const [audioConfig, setAudioConfig] = useState<AudioConfig>(DEFAULT_AUDIO_CONFIG)
  const [modalTemplateId, setModalTemplateId] = useState<Template | null>(null)

  const handleSceneTextChange = (sceneId: string, newText: string) => {
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === sceneId ? { ...scene, narrative: newText } : scene
      )
    )
  }

  const handleRender = () => {
    onRender(scenes, template, audioConfig)
  }

  const handleCardClick = (templateId: Template) => {
    setTemplate(templateId)
    setModalTemplateId(templateId)
  }

  const handleAudioUpdate = useCallback((_id: string, config: AudioConfig) => {
    setAudioConfig(config)
  }, [])

  const TEMPLATES: { id: Template; label: string; desc: string }[] = [
    { id: 'launch', label: 'Launch Video', desc: 'Cinematic, glowing scenes' },
    { id: 'kinetic', label: 'Kinetic Type', desc: 'Bold words, pure black' },
  ]

  const inputProps = {
    scenes,
    repoName: data.repoName,
    repoUrl: data.repoUrl,
    theme: data.theme,
    audioConfig,
  }

  // Build a VideoEntry for the modal
  const modalVideo: VideoEntry | null = modalTemplateId
    ? {
        id: `preview-${modalTemplateId}`,
        repoName: data.repoName,
        repoUrl: data.repoUrl,
        scenes,
        template: modalTemplateId,
        theme: data.theme,
        audioConfig,
        createdAt: Date.now(),
      }
    : null

  return (
    <div className="min-h-screen px-6 py-8 bg-gradient-to-b from-background to-background">
      {/* Header with back button */}
      <div className="mb-12">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-white/60 hover:text-white hover:bg-white/5"
        >
          ← Back
        </Button>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Left column - Script editor */}
        <div className="col-span-2">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Your Script</h2>
            <p className="text-sm text-white/50 font-mono">
              {scenes.length} scenes · ~{data.totalDurationSeconds} seconds · Edit text only
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {scenes.map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                onTextChange={(text) => handleSceneTextChange(scene.id, text)}
              />
            ))}
          </div>

          {/* Template picker — live video previews */}
          <div className="mb-6">
            <p className="text-xs text-white/40 font-mono uppercase tracking-widest mb-4">Style</p>
            <div className="grid grid-cols-2 gap-4">
              {TEMPLATES.map((t) => {
                const isSelected = template === t.id
                const isKinetic = t.id === 'kinetic'
                const comp = isKinetic ? KineticVideo : RepoReelVideo
                const dur = isKinetic
                  ? calcKineticDurationInFrames(scenes, FPS)
                  : calcDurationInFrames(scenes, FPS)

                return (
                  <button
                    key={t.id}
                    onClick={() => handleCardClick(t.id)}
                    className="group relative rounded-xl overflow-hidden text-left transition-all duration-400 border-2"
                    style={{
                      borderColor: isSelected ? 'rgba(99,102,241,0.7)' : 'rgba(255,255,255,0.06)',
                      boxShadow: isSelected
                        ? '0 0 24px rgba(99,102,241,0.2), 0 0 0 1px rgba(99,102,241,0.3)'
                        : 'none',
                    }}
                  >
                    {/* Video preview */}
                    <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
                      <Player
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        component={comp as any}
                        inputProps={{ ...inputProps, audioConfig: { musicTrackId: 'none', musicVolume: 0 } }}
                        durationInFrames={dur}
                        fps={FPS}
                        compositionWidth={1920}
                        compositionHeight={1080}
                        style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
                        numberOfSharedAudioTags={0}
                        autoPlay
                        loop
                      />

                      {/* Hover overlay with play icon */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <div
                          className="transition-all duration-300 ease-out"
                          style={{
                            opacity: 0,
                          }}
                        >
                          <div className="w-12 h-12 rounded-full bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-md">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="ml-0.5">
                              <path d="M8 5.14v14l11-7-11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Selected check */}
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 6l3 3 5-5" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    <div className="px-4 py-3 bg-[#0c0c0e]">
                      <span className={[
                        'text-sm font-semibold block transition-colors duration-200',
                        isSelected ? 'text-white' : 'text-white/60 group-hover:text-white/80',
                      ].join(' ')}>
                        {t.label}
                      </span>
                      <span className="text-[11px] font-mono text-white/30">{t.desc}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-white/20 text-white/70 hover:text-white hover:bg-white/5"
            >
              ← Back
            </Button>
            <Button
              onClick={handleRender}
              disabled={isRendering}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-60"
            >
              {isRendering ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Rendering…
                </span>
              ) : (
                'Preview Animation →'
              )}
            </Button>
          </div>
        </div>

        {/* Right column - Summary panel */}
        <div className="space-y-6 sticky top-8 h-fit">
          <RepoSummaryPanel data={data} />
        </div>
      </div>

      {/* Video Modal */}
      {modalVideo && (
        <VideoModal
          video={modalVideo}
          onClose={() => setModalTemplateId(null)}
          onAudioUpdate={handleAudioUpdate}
        />
      )}
    </div>
  )
}
