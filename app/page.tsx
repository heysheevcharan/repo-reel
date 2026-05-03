'use client'

import { useState } from 'react'
import { ScreenState, RepoData, ScriptScene, AudioConfig, TemplateId, SceneDirective } from '@/lib/types'
import { LandingScreen } from '@/components/LandingScreen'
import { ProgressScreen } from '@/components/ProgressScreen'
import { ScriptEditor } from '@/components/ScriptEditor'
import { VideoOutput } from '@/components/VideoOutput'
import type { ProjectTheme } from '@/lib/types'
import { DEFAULT_AUDIO_CONFIG } from '@/lib/audioConfig'

export default function Home() {
  const [screen, setScreen] = useState<ScreenState>('landing')
  const [repoUrl, setRepoUrl] = useState('')
  const [repoData, setRepoData] = useState<RepoData | null>(null)
  const [error, setError] = useState<string>('')

  // Output state — set when user clicks render in the editor
  const [outputScenes, setOutputScenes] = useState<ScriptScene[]>([])
  const [outputDirectives, setOutputDirectives] = useState<SceneDirective[] | undefined>()
  const [outputTemplate, setOutputTemplate] = useState<TemplateId>('launch')
  const [outputTheme, setOutputTheme] = useState<ProjectTheme | undefined>()
  const [outputAudioConfig, setOutputAudioConfig] = useState<AudioConfig>(DEFAULT_AUDIO_CONFIG)

  const extractRepoName = (url: string): string => {
    const parts = url.replace('https://github.com/', '').split('/')
    return `${parts[0]} / ${parts[1]}`
  }

  const handleLandingSubmit = async (url: string) => {
    setRepoUrl(url)
    setScreen('progress')
    setError('')

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const text = await response.text()
        let message = 'Failed to analyze repository'
        try { message = JSON.parse(text).error ?? message } catch {}
        throw new Error(message)
      }

      const data = await response.json()
      setRepoData(data)
    } catch (err: any) {
      console.error('[v0] Landing error:', err)
      setError(err.message)
      setScreen('landing')
    }
  }

  const handleProgressComplete = () => {
    setScreen('editor')
  }

  const handleRender = (scenes: ScriptScene[], template: TemplateId = 'launch', audioConfig: AudioConfig = DEFAULT_AUDIO_CONFIG, sceneDirectives?: SceneDirective[]) => {
    setOutputScenes(scenes)
    setOutputDirectives(sceneDirectives)
    setOutputTemplate(template)
    setOutputTheme(repoData?.theme)
    setOutputAudioConfig(audioConfig)
    setScreen('output')
  }

  const handleEditBack = () => {
    setScreen('editor')
  }

  const handleProgressBack = () => {
    setScreen('landing')
    setRepoData(null)
  }

  const handleEditorBack = () => {
    setScreen('progress')
  }

  return (
    <div className="bg-background">
      {error && (
        <div className="fixed top-0 left-0 right-0 bg-red-900/20 border-b border-red-500/50 p-4 text-red-200 text-sm">
          Error: {error}
        </div>
      )}

      {screen === 'landing' && (
        <LandingScreen onSubmit={handleLandingSubmit} />
      )}

      {screen === 'progress' && (
        <ProgressScreen
          repoName={extractRepoName(repoUrl)}
          onComplete={handleProgressComplete}
          onBack={handleProgressBack}
        />
      )}

      {screen === 'editor' && repoData && (
        <ScriptEditor
          data={repoData}
          onBack={handleEditorBack}
          onRender={handleRender}
          isRendering={false}
        />
      )}

      {screen === 'output' && repoData && (
        <VideoOutput
          repoName={extractRepoName(repoUrl)}
          repoUrl={repoUrl}
          scenes={outputScenes}
          sceneDirectives={outputDirectives}
          template={outputTemplate}
          theme={outputTheme}
          audioConfig={outputAudioConfig}
          onEdit={handleEditBack}
        />
      )}
    </div>
  )
}
