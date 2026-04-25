'use client'

import { useState } from 'react'
import { ScreenState, RepoData, Scene } from '@/lib/types'
import { LandingScreen } from '@/components/LandingScreen'
import { ProgressScreen } from '@/components/ProgressScreen'
import { ScriptEditor } from '@/components/ScriptEditor'
import { VideoOutput } from '@/components/VideoOutput'

export default function Home() {
  const [screen, setScreen] = useState<ScreenState>('landing')
  const [repoUrl, setRepoUrl] = useState('')
  const [repoData, setRepoData] = useState<RepoData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const extractRepoName = (url: string): string => {
    const parts = url.replace('https://github.com/', '').split('/')
    return `${parts[0]} / ${parts[1]}`
  }

  const handleLandingSubmit = async (url: string) => {
    setRepoUrl(url)
    setScreen('progress')
    setIsLoading(true)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await response.json()
      setRepoData(data)
    } catch (error) {
      console.error('Failed to analyze repo:', error)
      setScreen('landing')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProgressComplete = () => {
    setScreen('editor')
  }

  const handleRender = async (scenes: Scene[]) => {
    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes }),
      })
      const data = await response.json()
      // Store video URL if needed
      setScreen('output')
    } catch (error) {
      console.error('Failed to render video:', error)
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
        />
      )}

      {screen === 'output' && (
        <VideoOutput
          repoName={extractRepoName(repoUrl)}
          duration={repoData?.totalDurationSeconds || 58}
          onEdit={handleEditBack}
        />
      )}
    </div>
  )
}
