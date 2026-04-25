import React from 'react'
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import type { ScriptScene } from '../scriptGenerator'
import type { ProjectTheme } from '../types'

export type KineticVideoProps = {
  scenes: ScriptScene[]
  repoName: string
  repoUrl: string
  theme?: ProjectTheme
}

export const KINETIC_TRANSITION_FRAMES = 2

// Max frames a single word stays on screen — keeps pace aggressive
const MAX_FRAMES_PER_WORD = 16
const MAX_FRAMES_PER_BULLET = 22

// Problem scene stays red; all others use brand color
function sceneColor(sceneId: string, theme?: ProjectTheme): string {
  if (sceneId === 'scene2') return '#ef4444'
  return theme?.primaryColor ?? '#a855f7'
}

// ─── FlashCut — bright flash at scene entry to simulate hard cut feel ─────────

function FlashCut({ color = '#ffffff', frames = 3 }: { color?: string; frames?: number }) {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, frames], [0.85, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  if (opacity <= 0.01) return null
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      backgroundColor: color, opacity, pointerEvents: 'none',
    }} />
  )
}

// ─── WordHit ──────────────────────────────────────────────────────────────────

function WordHit({
  text,
  exitFrame,
  color = '#ffffff',
  fontSize = 220,
  accentColor = '#ffffff',
  showAccentLine = false,
}: {
  text: string
  exitFrame?: number
  color?: string
  fontSize?: number
  accentColor?: string
  showAccentLine?: boolean
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Snappy, aggressive spring — hits fast, no wobble
  const s = spring({ frame, fps, config: { damping: 9, stiffness: 380 } })

  const exitProgress =
    exitFrame != null
      ? interpolate(frame, [exitFrame, exitFrame + 4], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 0

  const scale =
    interpolate(s, [0, 1], [1.6, 1.0]) *
    interpolate(exitProgress, [0, 1], [1, 0.75])
  const opacity =
    interpolate(s, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' }) *
    interpolate(exitProgress, [0, 1], [1, 0])

  // Letter spacing compresses as word slams in — very cinematic
  const letterSpacing = interpolate(s, [0, 1], [40, -2])

  // Accent line draws in quickly
  const lineWidth = interpolate(frame, [0, 8], [0, 240], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${scale})`, opacity }}>
      <div style={{
        fontSize,
        fontWeight: 900,
        color,
        fontFamily: '"Arial Black", "Helvetica Neue", Impact, sans-serif',
        letterSpacing,
        textTransform: 'uppercase',
        lineHeight: 1,
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}>
        {text}
      </div>
      {showAccentLine && (
        <div style={{
          marginTop: 18,
          height: 5,
          width: lineWidth,
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
          borderRadius: 3,
        }} />
      )}
    </div>
  )
}

// ─── SubtextReveal ────────────────────────────────────────────────────────────

function SubtextReveal({ text, color }: { text: string; color: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame, fps, config: { damping: 12, stiffness: 200 } })

  return (
    <div style={{
      fontSize: 32,
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      fontWeight: 300,
      color,
      letterSpacing: 4,
      textTransform: 'uppercase',
      opacity: interpolate(s, [0, 1], [0, 1]),
      transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`,
      textAlign: 'center',
      maxWidth: 1200,
      lineHeight: 1.7,
    }}>
      {text}
    </div>
  )
}

// ─── AccentLines — sweep in fast from left ────────────────────────────────────

function AccentLines({ color, frame }: { color: string; frame: number }) {
  const w1 = interpolate(frame, [0, 8], [0, 1920], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const w2 = interpolate(frame, [3, 11], [0, 1920], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <>
      <div style={{ position: 'absolute', bottom: 68, left: 0, height: 3, width: w1, backgroundColor: color, opacity: 0.7 }} />
      <div style={{ position: 'absolute', bottom: 58, left: 0, height: 1, width: w2, backgroundColor: color, opacity: 0.25 }} />
    </>
  )
}

// ─── MicroMotionBg — subtle breathing to keep every frame alive ──────────────

function MicroMotionBg({ color }: { color: string }) {
  const frame = useCurrentFrame()
  const breathe = 1 + 0.018 * Math.sin(frame * 0.09)
  const driftX = 50 + 8 * Math.sin(frame * 0.04)
  const driftY = 50 + 6 * Math.cos(frame * 0.05)

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden',
      transform: `scale(${breathe})`,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at ${driftX}% ${driftY}%, ${color}22 0%, transparent 60%)`,
      }} />
    </div>
  )
}

// ─── SceneIndexLabel ──────────────────────────────────────────────────────────

function SceneIndexLabel({ index, title, color }: { index: number; title: string; color: string }) {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <div style={{
      position: 'absolute', top: 52, left: 72, zIndex: 10,
      display: 'flex', alignItems: 'center', gap: 10, opacity,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
      <span style={{ color: '#ffffff50', fontSize: 12, fontFamily: 'monospace', letterSpacing: 4, textTransform: 'uppercase' }}>
        {String(index + 1).padStart(2, '0')} — {title}
      </span>
    </div>
  )
}

// ─── KineticSceneBase ─────────────────────────────────────────────────────────

function KineticSceneBase({
  scene, index, accentColor, highlightWordIndex = 0, isShock = false,
}: {
  scene: ScriptScene; index: number; accentColor: string
  highlightWordIndex?: number; isShock?: boolean
}) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const words = (scene.headline || scene.title).split(' ').filter(Boolean)
  const hasSubtext = !!scene.subtext

  // Hard cap: no word stays on screen longer than MAX_FRAMES_PER_WORD
  const naturalFramesPerWord = Math.floor(durationInFrames / (words.length + (hasSubtext ? 1 : 0)))
  const framesPerWord = Math.min(MAX_FRAMES_PER_WORD, naturalFramesPerWord)
  const subtextStart = words.length * framesPerWord

  const fontSize =
    words.length === 1 ? 340 :
    words.length === 2 ? 260 :
    words.length <= 4 ? 190 : 140

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <MicroMotionBg color={accentColor} />
      <AccentLines color={accentColor} frame={frame} />
      <SceneIndexLabel index={index} title={scene.title} color={accentColor} />
      {/* Shock flash on problem→solution cut */}
      <FlashCut color={isShock ? accentColor : '#ffffff'} frames={isShock ? 4 : 3} />

      {words.map((word, i) => {
        const isLast = i === words.length - 1
        return (
          <Sequence
            key={i}
            from={i * framesPerWord}
            durationInFrames={isLast && !hasSubtext ? 9999 : framesPerWord + 2}
            layout="none"
          >
            <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WordHit
                text={word}
                exitFrame={isLast && !hasSubtext ? undefined : framesPerWord - 4}
                color={i === highlightWordIndex ? accentColor : '#ffffff'}
                fontSize={fontSize}
                accentColor={accentColor}
                showAccentLine={isLast && !hasSubtext}
              />
            </AbsoluteFill>
          </Sequence>
        )
      })}

      {hasSubtext && (
        <Sequence from={subtextStart} durationInFrames={9999} layout="none">
          <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SubtextReveal text={scene.subtext!} color={`${accentColor}cc`} />
          </AbsoluteFill>
        </Sequence>
      )}
    </AbsoluteFill>
  )
}

// ─── KineticFeaturesScene ─────────────────────────────────────────────────────

function KineticFeaturesScene({ scene, index, theme }: { scene: ScriptScene; index: number; theme?: ProjectTheme }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const accentColor = sceneColor(scene.id, theme)
  const bullets = scene.bullets?.filter(Boolean).slice(0, 4) ?? []

  const naturalFramesPerBullet = Math.floor(durationInFrames / bullets.length)
  const framesPerBullet = Math.min(MAX_FRAMES_PER_BULLET, naturalFramesPerBullet)

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <MicroMotionBg color={accentColor} />
      <AccentLines color={accentColor} frame={frame} />
      <SceneIndexLabel index={index} title={scene.title} color={accentColor} />
      <FlashCut color="#ffffff" frames={3} />

      {bullets.map((bullet, i) => {
        const wordCount = bullet.split(' ').length
        const fontSize = wordCount <= 2 ? 210 : wordCount <= 4 ? 140 : 100
        const isLast = i === bullets.length - 1
        return (
          <Sequence key={i} from={i * framesPerBullet} durationInFrames={isLast ? 9999 : framesPerBullet + 2} layout="none">
            <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <BulletCounter index={i} total={bullets.length} accentColor={accentColor} />
              <WordHit
                text={bullet}
                exitFrame={isLast ? undefined : framesPerBullet - 4}
                color="#ffffff"
                fontSize={fontSize}
                accentColor={accentColor}
                showAccentLine={isLast}
              />
            </AbsoluteFill>
          </Sequence>
        )
      })}
    </AbsoluteFill>
  )
}

function BulletCounter({ index, total, accentColor }: { index: number; total: number; accentColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame, fps, config: { damping: 10, stiffness: 300 } })
  return (
    <div style={{
      fontSize: 13, fontFamily: 'monospace', letterSpacing: 5,
      color: accentColor, textTransform: 'uppercase',
      opacity: interpolate(s, [0, 1], [0, 1]),
    }}>
      {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
    </div>
  )
}

// ─── KineticCTAScene ──────────────────────────────────────────────────────────

function KineticCTAScene({ scene, repoUrl, index, theme }: {
  scene: ScriptScene; repoUrl: string; index: number; theme?: ProjectTheme
}) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const accentColor = sceneColor(scene.id, theme)
  const words = (scene.headline || 'Star on GitHub').split(' ').filter(Boolean)

  const naturalPerWord = Math.floor((durationInFrames * 0.55) / words.length)
  const wordSlots = Math.min(MAX_FRAMES_PER_WORD, naturalPerWord)
  const urlStart = words.length * wordSlots
  const shortUrl = repoUrl.replace(/^https?:\/\//, '')
  const installCmd = theme?.installCommand

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <MicroMotionBg color={accentColor} />
      <AccentLines color={accentColor} frame={frame} />
      <SceneIndexLabel index={index} title={scene.title} color={accentColor} />
      <FlashCut color={accentColor} frames={4} />

      {words.map((word, i) => {
        const isLast = i === words.length - 1
        return (
          <Sequence key={i} from={i * wordSlots} durationInFrames={isLast ? 9999 : wordSlots + 2} layout="none">
            <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WordHit
                text={word}
                exitFrame={isLast ? undefined : wordSlots - 4}
                color={isLast ? accentColor : '#ffffff'}
                fontSize={words.length <= 2 ? 300 : 200}
                accentColor={accentColor}
              />
            </AbsoluteFill>
          </Sequence>
        )
      })}

      <Sequence from={urlStart} durationInFrames={9999} layout="none">
        <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 100, gap: 16 }}>
          {installCmd && <InstallBadge cmd={installCmd} accentColor={accentColor} />}
          <UrlCard url={shortUrl} accentColor={accentColor} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}

function InstallBadge({ cmd, accentColor }: { cmd: string; accentColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame, fps, config: { damping: 10, stiffness: 250 } })
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 12,
      padding: '14px 30px',
      border: `1px solid ${accentColor}70`,
      borderRadius: 10,
      background: `${accentColor}18`,
      opacity: interpolate(s, [0, 1], [0, 1]),
      transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`,
    }}>
      <span style={{ color: accentColor, fontSize: 16, fontFamily: 'monospace', letterSpacing: 2 }}>$</span>
      <span style={{ color: '#ffffffee', fontSize: 20, fontFamily: 'monospace', letterSpacing: 0.5 }}>{cmd}</span>
    </div>
  )
}

function UrlCard({ url, accentColor }: { url: string; accentColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 10, stiffness: 200 } })
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 14,
      padding: '14px 32px',
      border: `1px solid ${accentColor}40`,
      borderRadius: 10,
      background: `${accentColor}0e`,
      opacity: interpolate(s, [0, 1], [0, 1]),
      transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
    }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: accentColor, boxShadow: `0 0 12px ${accentColor}` }} />
      <span style={{ color: '#ffffffbb', fontSize: 20, fontFamily: 'monospace', letterSpacing: 1 }}>{url}</span>
    </div>
  )
}

// ─── Scene router ─────────────────────────────────────────────────────────────

function KineticSceneRouter({ scene, repoName, repoUrl, index, theme }: {
  scene: ScriptScene; repoName: string; repoUrl: string; index: number; theme?: ProjectTheme
}) {
  const accentColor = sceneColor(scene.id, theme)

  if (scene.id === 'scene4') return <KineticFeaturesScene scene={scene} index={index} theme={theme} />
  if (scene.id === 'scene5') return <KineticCTAScene scene={scene} repoUrl={repoUrl} index={index} theme={theme} />

  const highlightWordIndex = scene.id === 'scene2' ? 999 : 0
  // scene3 (solution) gets an accent-colored shock flash — the "aha" moment
  const isShock = scene.id === 'scene3'

  return (
    <KineticSceneBase
      scene={scene}
      index={index}
      accentColor={accentColor}
      highlightWordIndex={highlightWordIndex}
      isShock={isShock}
    />
  )
}

// ─── KineticVideo ─────────────────────────────────────────────────────────────

export const KineticVideo: React.FC<KineticVideoProps> = ({ scenes, repoName, repoUrl, theme }) => {
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <TransitionSeries>
        {scenes.map((scene, i) => (
          <React.Fragment key={scene.id}>
            <TransitionSeries.Sequence durationInFrames={scene.duration * fps}>
              <KineticSceneRouter scene={scene} repoName={repoName} repoUrl={repoUrl} index={i} theme={theme} />
            </TransitionSeries.Sequence>
            {i < scenes.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: KINETIC_TRANSITION_FRAMES })}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  )
}
