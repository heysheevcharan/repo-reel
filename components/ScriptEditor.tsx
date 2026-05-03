'use client'

import { useState, useCallback, useEffect } from 'react'
import { Player } from '@remotion/player'
import { Button } from '@/components/ui/button'
import { RepoData, AudioConfig, TemplateId, SceneDirective } from '@/lib/types'
import { DEFAULT_AUDIO_CONFIG } from '@/lib/audioConfig'
import { TEMPLATE_REGISTRY, getTemplateOrDefault, TemplateDefinition } from '@/lib/remotion/registry'
import { SceneCard } from './SceneCard'
import { RepoSummaryPanel } from './RepoSummaryPanel'
import { VideoModal, type VideoEntry } from './VideoModal'

const FPS = 30

interface ScriptEditorProps {
  data: RepoData
  onBack: () => void
  onRender: (scenes: RepoData['scriptScenes'], template: TemplateId, audioConfig: AudioConfig, sceneDirectives?: SceneDirective[]) => void
  isRendering?: boolean
}

// ─── Per-template component cache ─────────────────────────────────────────────
// We lazily load each template component once and cache it in a module-level map
// so the Player doesn't remount every render.
const componentCache = new Map<string, React.ComponentType<any>>()

function useTemplateComponent(templateId: string) {
  const [component, setComponent] = useState<React.ComponentType<any> | null>(() =>
    componentCache.get(templateId) ?? null
  )

  useEffect(() => {
    if (componentCache.has(templateId)) {
      setComponent(componentCache.get(templateId)!)
      return
    }
    const tpl = getTemplateOrDefault(templateId)
    tpl.loadComponent().then((comp) => {
      componentCache.set(templateId, comp)
      setComponent(() => comp)
    })
  }, [templateId])

  return component
}

// ─── Template Card ─────────────────────────────────────────────────────────────

function TemplateCard({
  tpl,
  isSelected,
  inputProps,
  onClick,
}: {
  tpl: TemplateDefinition
  isSelected: boolean
  inputProps: any
  onClick: () => void
}) {
  const component = useTemplateComponent(tpl.id)
  const durationInFrames = tpl.id === 'multiTemplate' 
    ? tpl.calculateDuration(inputProps.sceneDirectives, FPS)
    : tpl.calculateDuration(inputProps.scenes, FPS)

  return (
    <button
      onClick={onClick}
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
        {component ? (
          <Player
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            component={component as any}
            inputProps={{ 
              ...inputProps, 
              audioConfig: { musicTrackId: 'none', musicVolume: 0 } 
            }}
            durationInFrames={durationInFrames || 1}
            fps={FPS}
            compositionWidth={1920}
            compositionHeight={1080}
            style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
            numberOfSharedAudioTags={0}
            autoPlay
            loop
          />
        ) : (
          /* Loading skeleton */
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-indigo-400 animate-spin" />
          </div>
        )}

        {/* Selected check */}
        {isSelected && (
          <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6l3 3 5-5" />
            </svg>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/10">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">{tpl.category}</span>
        </div>
      </div>

      {/* Label */}
      <div className="px-4 py-3 bg-[#0c0c0e]">
        <span className={[
          'text-sm font-semibold block transition-colors duration-200',
          isSelected ? 'text-white' : 'text-white/60 group-hover:text-white/80',
        ].join(' ')}>
          {tpl.label}
        </span>
        <span className="text-[11px] font-mono text-white/30">{tpl.desc}</span>
      </div>
    </button>
  )
}

// ─── ScriptEditor ──────────────────────────────────────────────────────────────

export function ScriptEditor({
  data,
  onBack,
  onRender,
  isRendering = false,
}: ScriptEditorProps) {
  const [scenes, setScenes] = useState(data.scriptScenes)
  const [templateId, setTemplateId] = useState<TemplateId>(
    data.sceneDirectives?.length ? 'multiTemplate' : 'launch'
  )
  const [audioConfig, setAudioConfig] = useState<AudioConfig>(DEFAULT_AUDIO_CONFIG)
  const [modalTemplateId, setModalTemplateId] = useState<TemplateId | null>(null)

  const handleSceneTextChange = (sceneId: string, newText: string) => {
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === sceneId ? { ...scene, narrative: newText } : scene
      )
    )
  }

  const handleRender = () => {
    onRender(scenes, templateId, audioConfig, data.sceneDirectives)
  }

  const handleCardClick = (id: TemplateId) => {
    setTemplateId(id)
    setModalTemplateId(id)
  }

  const handleAudioUpdate = useCallback((_id: string, config: AudioConfig) => {
    setAudioConfig(config)
  }, [])

  const inputProps = {
    scenes,
    sceneDirectives: data.sceneDirectives,
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
        sceneDirectives: data.sceneDirectives,
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
            {scenes.map((scene, i) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                assignedTemplateId={templateId === 'multiTemplate' ? data.sceneDirectives?.[i]?.templateId : undefined}
                onTextChange={(text) => handleSceneTextChange(scene.id, text)}
              />
            ))}
          </div>

          {/* Template picker — live video previews from registry */}
          <div className="mb-6">
            <p className="text-xs text-white/40 font-mono uppercase tracking-widest mb-4">Style</p>
            <div className="grid grid-cols-2 gap-4">
              {TEMPLATE_REGISTRY.map((tpl) => (
                <TemplateCard
                  key={tpl.id}
                  tpl={tpl}
                  isSelected={templateId === tpl.id}
                  inputProps={inputProps}
                  onClick={() => handleCardClick(tpl.id)}
                />
              ))}
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
