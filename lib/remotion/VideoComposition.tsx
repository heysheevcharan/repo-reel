import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { ScriptScene } from '../scriptGenerator'

interface VideoProps {
  scenes: ScriptScene[]
  repoName: string
  repoUrl: string
}

const SCENE_COLORS = [
  { bg: '#0f0a1e', accent: '#7c3aed', secondary: '#a78bfa' },
  { bg: '#0a1628', accent: '#1d4ed8', secondary: '#60a5fa' },
  { bg: '#0a1f1a', accent: '#065f46', secondary: '#34d399' },
  { bg: '#1a0a0a', accent: '#991b1b', secondary: '#f87171' },
]

function SceneView({ scene, index, startFrame }: { scene: ScriptScene; index: number; startFrame: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const localFrame = frame - startFrame
  const durationFrames = scene.duration * fps
  const colors = SCENE_COLORS[index % SCENE_COLORS.length]

  const fadeIn = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })
  const fadeOut = interpolate(localFrame, [durationFrames - 15, durationFrames], [1, 0], { extrapolateLeft: 'clamp' })
  const opacity = Math.min(fadeIn, fadeOut)

  const titleY = interpolate(
    spring({ frame: localFrame, fps, config: { damping: 12 } }),
    [0, 1],
    [60, 0]
  )

  const textY = interpolate(
    spring({ frame: Math.max(0, localFrame - 8), fps, config: { damping: 14 } }),
    [0, 1],
    [40, 0]
  )

  const sceneNumScale = spring({ frame: localFrame, fps, config: { damping: 10, stiffness: 100 } })

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: colors.bg }}>
      {/* Background radial glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 30%, ${colors.accent}22 0%, transparent 70%)`,
      }} />

      {/* Scene number pill */}
      <div style={{
        position: 'absolute', top: 80, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        transform: `scale(${sceneNumScale})`,
      }}>
        <div style={{
          background: `${colors.accent}33`,
          border: `1px solid ${colors.accent}66`,
          borderRadius: 999,
          padding: '8px 24px',
          color: colors.secondary,
          fontSize: 24,
          fontFamily: 'monospace',
          letterSpacing: 2,
        }}>
          {String(index + 1).padStart(2, '0')} / 04
        </div>
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', top: 200, left: 0, right: 0,
        padding: '0 60px',
        transform: `translateY(${titleY}px)`,
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 52,
          fontWeight: 800,
          fontFamily: 'sans-serif',
          color: '#ffffff',
          lineHeight: 1.1,
          marginBottom: 12,
        }}>
          {scene.title}
        </div>
        <div style={{
          width: 60, height: 4,
          background: `linear-gradient(90deg, ${colors.accent}, ${colors.secondary})`,
          borderRadius: 2, margin: '0 auto',
        }} />
      </div>

      {/* Narrative text */}
      <div style={{
        position: 'absolute', top: 380, left: 0, right: 0,
        padding: '0 64px',
        transform: `translateY(${textY}px)`,
      }}>
        <p style={{
          fontSize: 34,
          color: '#e2e8f0',
          fontFamily: 'sans-serif',
          lineHeight: 1.6,
          textAlign: 'center',
          margin: 0,
        }}>
          {scene.narrative}
        </p>
      </div>

      {/* Repo name footer */}
      <div style={{
        position: 'absolute', bottom: 120, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: colors.secondary,
        }} />
        <span style={{
          color: colors.secondary,
          fontSize: 28,
          fontFamily: 'monospace',
          letterSpacing: 1,
        }}>
          {repoNameFromProps}
        </span>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: colors.secondary,
        }} />
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 60, left: 60, right: 60,
        height: 4, background: '#ffffff18', borderRadius: 2,
      }}>
        <div style={{
          height: '100%',
          width: `${(localFrame / durationFrames) * 100}%`,
          background: `linear-gradient(90deg, ${colors.accent}, ${colors.secondary})`,
          borderRadius: 2,
        }} />
      </div>
    </AbsoluteFill>
  )
}

// Module-level ref trick so SceneView can read repoName without prop drilling issues in Remotion
let repoNameFromProps = ''

export const RepoReelVideo: React.FC<VideoProps> = ({ scenes, repoName }) => {
  const { fps } = useVideoConfig()
  repoNameFromProps = repoName

  let frameOffset = 0
  const sceneFrames = scenes.map((s) => {
    const start = frameOffset
    frameOffset += s.duration * fps
    return start
  })

  const frame = useCurrentFrame()

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {scenes.map((scene, i) => {
        const start = sceneFrames[i]
        const end = start + scene.duration * fps
        if (frame < start || frame >= end) return null
        return <SceneView key={scene.id} scene={scene} index={i} startFrame={start} />
      })}
    </AbsoluteFill>
  )
}
