'use client'

import { useState } from 'react'
import { ScreenState, RepoData, ScriptScene } from '@/lib/types'
import { LandingScreen } from '@/components/LandingScreen'
import { ProgressScreen } from '@/components/ProgressScreen'
import { ScriptEditor } from '@/components/ScriptEditor'
import { VideoOutput } from '@/components/VideoOutput'

export default function Home() {
  const [screen, setScreen] = useState<ScreenState>('landing')
  const [repoUrl, setRepoUrl] = useState('')
  const [repoData, setRepoData] = useState<RepoData | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isRendering, setIsRendering] = useState(false)

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

  const handleRender = async (scenes: ScriptScene[], template: 'launch' | 'kinetic' = 'launch') => {
    try {
      setError('')
      setIsRendering(true)
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes,
          repoName: repoData?.repoName,
          repoUrl,
          template,
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        let message = 'Failed to render video'
        try { message = JSON.parse(text).error ?? message } catch {}
        throw new Error(message)
      }

      const data = await response.json()
      setVideoUrl(data.videoUrl)
      setScreen('output')
    } catch (err: any) {
      console.error('[v0] Render error:', err)
      setError(err.message)
    } finally {
      setIsRendering(false)
    }
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

      {screen === 'progress' && repoData && (
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
          isRendering={isRendering}
        />
      )}

      {screen === 'output' && (
        <VideoOutput
          repoName={extractRepoName(repoUrl)}
          duration={repoData?.totalDurationSeconds || 58}
          onEdit={handleEditBack}
          videoUrl={videoUrl}
        />
      )}
    </div>
  )
}
