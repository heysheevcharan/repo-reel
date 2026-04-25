import React from 'react'
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { ScriptScene } from '../scriptGenerator'

export type VideoProps = {
  scenes: ScriptScene[]
  repoName: string
  repoUrl: string
}

export const TRANSITION_FRAMES = 12

const SCENE_PALETTES = [
  { bg: '#0f0a1e', accent: '#7c3aed', secondary: '#a78bfa', glow: '#7c3aed' },
  { bg: '#0a1628', accent: '#1d4ed8', secondary: '#60a5fa', glow: '#1d4ed8' },
  { bg: '#0a1f1a', accent: '#065f46', secondary: '#34d399', glow: '#10b981' },
  { bg: '#1a0a0a', accent: '#991b1b', secondary: '#f87171', glow: '#ef4444' },
]

// --- Reusable animation helpers (Easing.bezier per timing.md) ---

function useFadeUp(frame: number, startAt = 0, yFrom = 30) {
  const progress = interpolate(frame, [startAt, startAt + 20], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return {
    opacity: progress,
    transform: `translateY(${interpolate(progress, [0, 1], [yFrom, 0])}px)`,
  }
}

function useFadeIn(frame: number, startAt = 0, durationFrames = 18) {
  return interpolate(frame, [startAt, startAt + durationFrames], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
}

// --- Scene number indicator ---
function SceneNumber({ index, total, accent, secondary }: { index: number; total: number; accent: string; secondary: string }) {
  const frame = useCurrentFrame()
  const scale = interpolate(frame, [0, 14], [0.7, 1], {
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const opacity = useFadeIn(frame, 0, 10)

  return (
    <div style={{
      position: 'absolute', top: 48, left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
      opacity, transform: `scale(${scale})`,
    }}>
      <div style={{
        background: `${accent}28`,
        border: `1px solid ${accent}55`,
        borderRadius: 999,
        padding: '6px 22px',
        color: secondary,
        fontSize: 16,
        fontFamily: 'monospace',
        letterSpacing: 3,
      }}>
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>
    </div>
  )
}

// --- Progress bar ---
function ProgressBar({ accent, secondary }: { accent: string; secondary: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const progress = frame / durationInFrames

  return (
    <div style={{
      position: 'absolute', bottom: 20, left: 80, right: 80,
      height: 3, background: '#ffffff14', borderRadius: 2,
    }}>
      <div style={{
        height: '100%',
        width: `${progress * 100}%`,
        background: `linear-gradient(90deg, ${accent}, ${secondary})`,
        borderRadius: 2,
      }} />
    </div>
  )
}

// --- Repo name footer ---
function RepoFooter({ repoName, secondary }: { repoName: string; secondary: string }) {
  const frame = useCurrentFrame()
  const opacity = useFadeIn(frame, 20, 15)

  return (
    <div style={{
      position: 'absolute', bottom: 44, left: 0, right: 0,
      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12,
      opacity,
    }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: secondary }} />
      <span style={{ color: secondary, fontSize: 18, fontFamily: 'monospace', letterSpacing: 1 }}>
        {repoName}
      </span>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: secondary }} />
    </div>
  )
}

// --- Individual scene ---
function Scene({ scene, index, total, repoName }: { scene: ScriptScene; index: number; total: number; repoName: string }) {
  const frame = useCurrentFrame()
  const palette = SCENE_PALETTES[index % SCENE_PALETTES.length]

  const titleStyle = useFadeUp(frame, 0)
  // Divider grows in
  const dividerWidth = interpolate(frame, [10, 28], [0, 64], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const narrativeStyle = useFadeUp(frame, 18, 24)

  return (
    <AbsoluteFill style={{
      backgroundColor: palette.bg,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 45%, ${palette.glow}1a 0%, transparent 62%)`,
        pointerEvents: 'none',
      }} />

      {/* Side accent bars */}
      <div style={{
        position: 'absolute', left: 64, top: '50%',
        transform: 'translateY(-50%)',
        width: 3, height: 96,
        background: `linear-gradient(180deg, transparent, ${palette.accent}, transparent)`,
        borderRadius: 2,
      }} />
      <div style={{
        position: 'absolute', right: 64, top: '50%',
        transform: 'translateY(-50%)',
        width: 3, height: 96,
        background: `linear-gradient(180deg, transparent, ${palette.secondary}, transparent)`,
        borderRadius: 2,
      }} />

      {/* Scene number */}
      <Sequence from={0} durationInFrames={Infinity} layout="none">
        <SceneNumber index={index} total={total} accent={palette.accent} secondary={palette.secondary} />
      </Sequence>

      {/* Center content */}
      <div style={{ textAlign: 'center', maxWidth: 1100, padding: '0 140px', position: 'relative', zIndex: 1 }}>
        {/* Title */}
        <div style={{ ...titleStyle, marginBottom: 20 }}>
          <div style={{
            fontSize: 68,
            fontWeight: 800,
            fontFamily: 'sans-serif',
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: 18,
          }}>
            {scene.title}
          </div>
          {/* Animated divider */}
          <div style={{
            height: 4,
            width: dividerWidth,
            background: `linear-gradient(90deg, ${palette.accent}, ${palette.secondary})`,
            borderRadius: 2,
            margin: '0 auto',
          }} />
        </div>

        {/* Narrative */}
        <div style={narrativeStyle}>
          <p style={{
            fontSize: 28,
            color: '#e2e8f0',
            fontFamily: 'sans-serif',
            lineHeight: 1.75,
            textAlign: 'center',
            margin: 0,
          }}>
            {scene.narrative}
          </p>
        </div>
      </div>

      {/* Footer */}
      <Sequence from={0} durationInFrames={Infinity} layout="none">
        <RepoFooter repoName={repoName} secondary={palette.secondary} />
        <ProgressBar accent={palette.accent} secondary={palette.secondary} />
      </Sequence>
    </AbsoluteFill>
  )
}

// --- Root composition ---
export const RepoReelVideo: React.FC<VideoProps> = ({ scenes, repoName }) => {
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <TransitionSeries>
        {scenes.map((scene, i) => (
          <React.Fragment key={scene.id}>
            <TransitionSeries.Sequence durationInFrames={scene.duration * fps}>
              <Scene
                scene={scene}
                index={i}
                total={scenes.length}
                repoName={repoName}
              />
            </TransitionSeries.Sequence>
            {i < scenes.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  )
}
