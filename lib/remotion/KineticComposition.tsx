import React from 'react'
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing
} from 'remotion'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import type { ScriptScene } from '../scriptGenerator'
import type { ProjectTheme, AudioConfig } from '../types'
import { MUSIC_TRACKS } from '../audioConfig'

export type KineticVideoProps = {
  scenes: ScriptScene[]
  repoName: string
  repoUrl: string
  theme?: ProjectTheme
  audioConfig?: AudioConfig
}

export const KINETIC_TRANSITION_FRAMES = 6

// Max frames a single word stays on screen — keeps pace aggressive
const MAX_FRAMES_PER_WORD = 20
const MIN_FRAMES_PER_WORD = 10
const MAX_FRAMES_PER_BULLET = 26

// ─── Motion constants ─────────────────────────────────────────────────────────

const FONT = {
  HEAVY:   '"Arial Black", "Impact", "Haas Grotesk Display", "Helvetica Neue", sans-serif',
  DISPLAY: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  MONO:    '"SF Mono", "JetBrains Mono", "Fira Code", Menlo, Monaco, "Courier New", monospace',
}

const SPRING = {
  WORD:  { damping: 8,  stiffness: 450 }, // very snappy, intentional overshoot — kinetic words
  SUB:   { damping: 16, stiffness: 150 }, // smooth settle — subtext reveals
  BADGE: { damping: 10, stiffness: 250 }, // crisp — install badge, url card
}

const EASE = {
  OUT_EXPO: (t: number) => 1 - Math.pow(1 - t, 4),
}

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

  // Snappy, aggressive spring — hits fast, deliberate overshoot
  const s = spring({ frame, fps, config: SPRING.WORD })

  const exitProgress =
    exitFrame != null
      ? interpolate(frame, [exitFrame, exitFrame + 4], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 0

  const scale =
    interpolate(s, [0, 1], [1.8, 1.0]) *
    interpolate(exitProgress, [0, 1], [1, 0.8])
  const opacity =
    interpolate(s, [0, 0.15], [0, 1], { extrapolateRight: 'clamp' }) *
    interpolate(exitProgress, [0, 1], [1, 0])

  // Letter spacing compresses as word slams in — eased so compression accelerates
  const easedS = EASE.OUT_EXPO(Math.min(1, Math.max(0, s)))
  const letterSpacing = interpolate(easedS, [0, 1], [60, -4])

  // Motion blur simulation
  const blur = interpolate(s, [0, 0.5, 1], [20, 5, 0])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${scale})`, opacity, filter: `blur(${blur}px)` }}>
      <div style={{
        fontSize,
        fontWeight: 900,
        color,
        fontFamily: FONT.HEAVY,
        letterSpacing,
        textTransform: 'uppercase',
        lineHeight: 1,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        textShadow: `0 0 20px ${color}40`,
      }}>
        {text}
      </div>
      {showAccentLine && (
        <div style={{
          marginTop: 24,
          height: 6,
          width: interpolate(frame, [0, 10], [0, 300], { extrapolateRight: 'clamp' }),
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
  const s = spring({ frame, fps, config: SPRING.SUB })

  return (
    <div style={{
      fontSize: 34,
      fontFamily: FONT.DISPLAY,
      fontWeight: 400,
      color,
      letterSpacing: 6,
      textTransform: 'uppercase',
      opacity: interpolate(s, [0, 1], [0, 1]),
      transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
      textAlign: 'center',
      maxWidth: 1300,
      lineHeight: 1.6,
    }}>
      {text}
    </div>
  )
}

// ─── KineticBackground — senior motion designer level black bg ────────────────

const KineticBackground: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()
  
  // Subtle moving vignette
  const driftX = Math.sin(frame * 0.04) * 20
  const driftY = Math.cos(frame * 0.03) * 15
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>
      {/* Moving Accent Glow */}
      <div style={{
        position: 'absolute',
        width: width * 1.2,
        height: height * 1.2,
        left: -width * 0.1 + driftX,
        top: -height * 0.1 + driftY,
        background: `radial-gradient(circle at center, ${color}15 0%, transparent 65%)`,
        filter: 'blur(80px)',
      }} />
      
      {/* Scanline / Grid effect */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.04,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '100% 4px',
        pointerEvents: 'none',
      }} />

      {/* Vignette Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle, transparent 40%, black 100%)',
        opacity: 0.7,
      }} />
    </AbsoluteFill>
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
      display: 'flex', alignItems: 'center', gap: 12, opacity,
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 15px ${color}` }} />
      <span style={{ color: '#ffffff60', fontSize: 14, fontFamily: FONT.MONO, letterSpacing: 5, textTransform: 'uppercase' }}>
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

  const naturalFramesPerWord = Math.floor(durationInFrames / (words.length + (hasSubtext ? 1 : 0)))
  const framesPerWord = Math.max(MIN_FRAMES_PER_WORD, Math.min(MAX_FRAMES_PER_WORD, naturalFramesPerWord))
  const subtextStart = words.length * framesPerWord

  const fontSize =
    words.length === 1 ? 380 :
    words.length === 2 ? 300 :
    words.length <= 4 ? 220 : 160

  return (
    <AbsoluteFill>
      <KineticBackground color={accentColor} />
      <SceneIndexLabel index={index} title={scene.title} color={accentColor} />
      <FlashCut color={isShock ? accentColor : '#ffffff'} frames={isShock ? 5 : 3} />

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
            <SubtextReveal text={scene.subtext!} color={`${accentColor}ee`} />
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

  const wordCounts = bullets.map(b => b.split(' ').length)
  const totalWords = wordCounts.reduce((a, b) => a + b, 0)
  const bulletFrames = wordCounts.map(wc => Math.max(MIN_FRAMES_PER_WORD * 2, Math.min(MAX_FRAMES_PER_BULLET, Math.floor((wc / totalWords) * durationInFrames))))
  const bulletOffsets = bulletFrames.reduce<number[]>((acc, _, i) =>
    [...acc, i === 0 ? 0 : acc[i - 1] + bulletFrames[i - 1]], [])

  return (
    <AbsoluteFill>
      <KineticBackground color={accentColor} />
      <SceneIndexLabel index={index} title={scene.title} color={accentColor} />
      <FlashCut color="#ffffff" frames={3} />

      {bullets.map((bullet, i) => {
        const wordCount = bullet.split(' ').length
        const fontSize = wordCount <= 2 ? 240 : wordCount <= 4 ? 160 : 120
        const isLast = i === bullets.length - 1
        return (
          <Sequence key={i} from={bulletOffsets[i]} durationInFrames={isLast ? 9999 : bulletFrames[i] + 2} layout="none">
            <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
              <div style={{ fontSize: 16, fontFamily: FONT.MONO, color: accentColor, textTransform: 'uppercase', letterSpacing: 8 }}>
                {String(i + 1).padStart(2, '0')} / {String(bullets.length).padStart(2, '0')}
              </div>
              <WordHit
                text={bullet}
                exitFrame={isLast ? undefined : bulletFrames[i] - 4}
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

// ─── KineticCTAScene ──────────────────────────────────────────────────────────

function KineticCTAScene({ scene, repoUrl, index, theme }: {
  scene: ScriptScene; repoUrl: string; index: number; theme?: ProjectTheme
}) {
  const { durationInFrames } = useVideoConfig()
  const accentColor = sceneColor(scene.id, theme)
  const words = (scene.headline || 'Star on GitHub').split(' ').filter(Boolean)

  const naturalPerWord = Math.floor((durationInFrames * 0.55) / words.length)
  const wordSlots = Math.max(MIN_FRAMES_PER_WORD, Math.min(MAX_FRAMES_PER_WORD, naturalPerWord))
  const urlStart = words.length * wordSlots
  const shortUrl = repoUrl.replace(/^https?:\/\//, '')
  const installCmd = theme?.installCommand

  return (
    <AbsoluteFill>
      <KineticBackground color={accentColor} />
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
                fontSize={words.length <= 2 ? 340 : 220}
                accentColor={accentColor}
              />
            </AbsoluteFill>
          </Sequence>
        )
      })}

      <Sequence from={urlStart} durationInFrames={9999} layout="none">
        <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 120, gap: 24 }}>
          {installCmd && (
             <div style={{ padding: '16px 36px', border: `1px solid ${accentColor}80`, borderRadius: 12, background: `${accentColor}20`, display: 'flex', gap: 16, alignItems: 'center' }}>
               <span style={{ color: accentColor, fontFamily: FONT.MONO, fontSize: 20 }}>$</span>
               <span style={{ color: 'white', fontFamily: FONT.MONO, fontSize: 24 }}>{installCmd}</span>
             </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
             <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: accentColor }} />
             <span style={{ color: '#ffffff80', fontSize: 24, fontFamily: FONT.MONO }}>{shortUrl}</span>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
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

export const KineticVideo: React.FC<KineticVideoProps> = (props) => {
  if (!props || !props.scenes) return null
  const { scenes, repoName, repoUrl, theme, audioConfig } = props
  const { fps } = useVideoConfig()

  const musicUrl = audioConfig
    ? MUSIC_TRACKS.find((t) => t.id === audioConfig.musicTrackId)?.url
    : undefined
  const musicVolume = audioConfig?.musicVolume ?? 0.3

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {musicUrl && (
        <Audio
          src={musicUrl}
          loop
          volume={(f) =>
            interpolate(f, [0, fps], [0, musicVolume], { extrapolateRight: 'clamp' })
          }
        />
      )}

      <TransitionSeries>
        {scenes.map((scene, i) => (
          <React.Fragment key={scene.id}>
            <TransitionSeries.Sequence durationInFrames={(scene.duration || (scene as any).durationSeconds || 5) * fps}>
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
