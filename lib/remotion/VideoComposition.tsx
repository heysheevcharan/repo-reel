import React from 'react'
import { Composition } from 'remotion'
import { ScriptScene } from '../scriptGenerator'

interface VideoCompositionProps {
  scenes: ScriptScene[]
  repoName: string
  repoUrl: string
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  scenes,
  repoName,
  repoUrl,
}) => {
  const totalFrames = Math.ceil(
    (scenes.reduce((sum, s) => sum + s.duration, 0) / 1000) * 30
  )

  return (
    <Composition
      id="RepoReelVideo"
      component={VideoScene}
      durationInFrames={totalFrames}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        scenes,
        repoName,
        repoUrl,
      }}
    />
  )
}

interface VideoSceneProps {
  scenes: ScriptScene[]
  repoName: string
  repoUrl: string
}

const VideoScene: React.FC<VideoSceneProps> = ({
  scenes,
  repoName,
  repoUrl,
}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#09090b',
        color: '#ffffff',
        fontFamily: "'Fira Code', monospace",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(99, 102, 241, 0) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Scene rendering placeholder */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '40px',
        }}
      >
        <h1
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {repoName}
        </h1>
        <p style={{ fontSize: '24px', color: '#9ca3af', marginBottom: '40px' }}>
          Rendering video composition...
        </p>
        <div
          style={{
            fontSize: '18px',
            color: '#6b7280',
            fontFamily: "'Fira Code', monospace",
          }}
        >
          {scenes.length} scenes, {scenes.reduce((sum, s) => sum + s.duration, 0)}s total
        </div>
      </div>
    </div>
  )
}
