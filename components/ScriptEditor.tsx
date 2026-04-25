'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RepoData } from '@/lib/types'
import { SceneCard } from './SceneCard'
import { RepoSummaryPanel } from './RepoSummaryPanel'

interface ScriptEditorProps {
  data: RepoData
  onBack: () => void
  onRender: (scenes: RepoData['scriptScenes']) => void
}

export function ScriptEditor({
  data,
  onBack,
  onRender,
}: ScriptEditorProps) {
  const [scenes, setScenes] = useState(data.scriptScenes)

  const handleSceneTextChange = (sceneId: string, newText: string) => {
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === sceneId ? { ...scene, narrative: newText } : scene
      )
    )
  }

  const handleRender = () => {
    onRender(scenes)
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              Render Video →
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
