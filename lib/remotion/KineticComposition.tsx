import React from 'react'
import {
  AbsoluteFill,
  Easing,
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

export const KINETIC_TRANSITION_FRAMES = 5

// Problem scene stays red (intentional contrast); all others use brand color
function sceneColor(sceneId: string, theme?: ProjectTheme): string {
  if (sceneId === 'scene2') return '#ef4444'
  return theme?.primaryColor ?? '#a855f7'
}

// ─── WordHit ──────────────────────────────────────────────────────────────────
// Slams in with spring, optionally exits before the next word

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

  const s = spring({ frame, fps, config: { damping: 13, stiffness: 210 } })

  const exitProgress =
    exitFrame != null
      ? interpolate(frame, [exitFrame, exitFrame + 6], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 0

  const scale =
    interpolate(s, [0, 1], [1.45, 1.0]) *
    interpolate(exitProgress, [0, 1], [1, 0.82])
  const opacity =
    interpolate(s, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' }) *
    interpolate(exitProgress, [0, 1], [1, 0])
  const letterSpacing = interpolate(s, [0, 1], [28, -1])
  const lineWidth = interpolate(frame, [0, 16], [0, 220], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          fontSize,
          fontWeight: 900,
          color,
          fontFamily: '"Arial Black", "Helvetica Neue", Impact, sans-serif',
          letterSpacing,
          textTransform: 'uppercase',
          lineHeight: 1,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
      {showAccentLine && (
        <div
          style={{
            marginTop: 20,
            height: 5,
            width: lineWidth,
            background: `linear-gradient(90deg, ${accentColor}, transparent)`,
            borderRadius: 3,
          }}
        />
      )}
    </div>
  )
}

// ─── SubtextReveal ────────────────────────────────────────────────────────────

function SubtextReveal({ text, color }: { text: string; color: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame, fps, config: { damping: 18, stiffness: 120 } })

  return (
    <div
      style={{
        fontSize: 34,
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        fontWeight: 300,
        color,
        letterSpacing: 3,
        textTransform: 'uppercase',
        opacity: interpolate(s, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(s, [0, 1], [32, 0])}px)`,
        textAlign: 'center',
        maxWidth: 1200,
        lineHeight: 1.7,
      }}
    >
      {text}
    </div>
  )
}

// ─── AccentLines — bottom decorative stripes ──────────────────────────────────

function AccentLines({ color }: { color: string }) {
  const frame = useCurrentFrame()
  const w1 = interpolate(frame, [0, 18], [0, 1920], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const w2 = interpolate(frame, [6, 24], [0, 1920], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
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

// ─── SceneIndexLabel ──────────────────────────────────────────────────────────

function SceneIndexLabel({ index, title, color }: { index: number; title: string; color: string }) {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, 14], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
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
// Shows headline words one at a time, then subtext

function KineticSceneBase({
  scene,
  index,
  accentColor,
  highlightWordIndex = 0,
}: {
  scene: ScriptScene
  index: number
  accentColor: string
  highlightWordIndex?: number
}) {
  const { durationInFrames } = useVideoConfig()
  const words = (scene.headline || scene.title).split(' ').filter(Boolean)
  const hasSubtext = !!scene.subtext
  const totalSlots = words.length + (hasSubtext ? 1 : 0)
  const framesPerSlot = Math.floor(durationInFrames / totalSlots)

  const fontSize =
    words.length === 1 ? 300 :
    words.length === 2 ? 240 :
    words.length <= 4 ? 180 : 130

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <AccentLines color={accentColor} />
      <SceneIndexLabel index={index} title={scene.title} color={accentColor} />

      {words.map((word, i) => {
        const isLast = i === words.length - 1
        return (
          <Sequence
            key={i}
            from={i * framesPerSlot}
            durationInFrames={isLast && !hasSubtext ? 9999 : framesPerSlot + 4}
            layout="none"
          >
            <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WordHit
                text={word}
                exitFrame={isLast && !hasSubtext ? undefined : framesPerSlot - 7}
                color={i === highlightWordIndex ? accentColor : '#ffffff'}
                fontSize={fontSize}
                accentColor={accentColor}
                showAccentLine={isLast}
              />
            </AbsoluteFill>
          </Sequence>
        )
      })}

      {hasSubtext && (
        <Sequence from={words.length * framesPerSlot} durationInFrames={9999} layout="none">
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
  const { durationInFrames } = useVideoConfig()
  const accentColor = sceneColor(scene.id, theme)
  const bullets = scene.bullets?.filter(Boolean).slice(0, 4) ?? []
  const framesPerBullet = Math.floor(durationInFrames / bullets.length)

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <AccentLines color={accentColor} />
      <SceneIndexLabel index={index} title={scene.title} color={accentColor} />

      {bullets.map((bullet, i) => {
        const wordCount = bullet.split(' ').length
        const fontSize = wordCount <= 2 ? 200 : wordCount <= 4 ? 130 : 96
        const isLast = i === bullets.length - 1
        return (
          <Sequence key={i} from={i * framesPerBullet} durationInFrames={isLast ? 9999 : framesPerBullet + 4} layout="none">
            <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
              {/* Counter */}
              <BulletCounter index={i} total={bullets.length} accentColor={accentColor} />
              <WordHit
                text={bullet}
                exitFrame={isLast ? undefined : framesPerBullet - 7}
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
  const s = spring({ frame, fps, config: { damping: 16, stiffness: 200 } })
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
  const { durationInFrames } = useVideoConfig()
  const accentColor = sceneColor(scene.id, theme)
  const words = (scene.headline || 'Star on GitHub').split(' ').filter(Boolean)
  const wordSlots = Math.floor(durationInFrames * 0.6 / words.length)
  const urlStart = words.length * wordSlots
  const shortUrl = repoUrl.replace(/^https?:\/\//, '')
  const installCmd = theme?.installCommand

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <AccentLines color={accentColor} />
      <SceneIndexLabel index={index} title={scene.title} color={accentColor} />

      {words.map((word, i) => {
        const isLast = i === words.length - 1
        return (
          <Sequence key={i} from={i * wordSlots} durationInFrames={isLast ? 9999 : wordSlots + 4} layout="none">
            <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WordHit
                text={word}
                exitFrame={isLast ? undefined : wordSlots - 7}
                color={isLast ? accentColor : '#ffffff'}
                fontSize={words.length <= 2 ? 260 : 180}
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
  const s = spring({ frame, fps, config: { damping: 16, stiffness: 110 } })
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
  const s = spring({ frame, fps, config: { damping: 16, stiffness: 110 } })

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 14,
      padding: '18px 38px',
      border: `1px solid ${accentColor}55`,
      borderRadius: 12,
      background: `${accentColor}10`,
      opacity: interpolate(s, [0, 1], [0, 1]),
      transform: `translateY(${interpolate(s, [0, 1], [28, 0])}px)`,
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: accentColor, boxShadow: `0 0 14px ${accentColor}` }} />
      <span style={{ color: '#ffffffcc', fontSize: 22, fontFamily: 'monospace', letterSpacing: 1 }}>
        {url}
      </span>
    </div>
  )
}

// ─── Scene router ─────────────────────────────────────────────────────────────

function KineticSceneRouter({ scene, repoName, repoUrl, index, theme }: {
  scene: ScriptScene; repoName: string; repoUrl: string; index: number; theme?: ProjectTheme
}) {
  const accentColor = sceneColor(scene.id, theme)

  if (scene.id === 'scene4') {
    return <KineticFeaturesScene scene={scene} index={index} theme={theme} />
  }
  if (scene.id === 'scene5') {
    return <KineticCTAScene scene={scene} repoUrl={repoUrl} index={index} theme={theme} />
  }

  const highlightWordIndex = scene.id === 'scene2' ? 999 : 0

  return (
    <KineticSceneBase
      scene={scene}
      index={index}
      accentColor={accentColor}
      highlightWordIndex={highlightWordIndex}
    />
  )
}

// ─── KineticVideo — main export ───────────────────────────────────────────────

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
