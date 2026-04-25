'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RepoData } from '@/lib/types'
import { SceneCard } from './SceneCard'
import { RepoSummaryPanel } from './RepoSummaryPanel'

type Template = 'launch' | 'kinetic'

interface ScriptEditorProps {
  data: RepoData
  onBack: () => void
  onRender: (scenes: RepoData['scriptScenes'], template: Template) => void
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

  const handleSceneTextChange = (sceneId: string, newText: string) => {
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === sceneId ? { ...scene, narrative: newText } : scene
      )
    )
  }

  const handleRender = () => {
    onRender(scenes, template)
  }

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

          {/* Template picker */}
          <div className="mb-6">
            <p className="text-xs text-white/40 font-mono uppercase tracking-widest mb-3">Style</p>
            <div className="flex gap-3">
              {([
                { id: 'launch', label: 'Launch Video', desc: 'Cinematic, glowing scenes' },
                { id: 'kinetic', label: 'Kinetic Type', desc: 'Bold words, pure black' },
              ] as { id: Template; label: string; desc: string }[]).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={[
                    'flex flex-col gap-0.5 px-5 py-3 rounded-lg border text-left transition-all',
                    template === t.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70',
                  ].join(' ')}
                >
                  <span className="text-sm font-semibold">{t.label}</span>
                  <span className="text-xs font-mono opacity-60">{t.desc}</span>
                </button>
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
        <div>
          <RepoSummaryPanel data={data} />
        </div>
      </div>
    </div>
  )
}
