import React from 'react'
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import type { ScriptScene } from '../scriptGenerator'
import type { ProjectTheme, AudioConfig } from '../types'
import { MUSIC_TRACKS } from '../audioConfig'

export type VideoProps = {
  scenes: ScriptScene[]
  repoName: string
  repoUrl: string
  theme?: ProjectTheme
  audioConfig?: AudioConfig
}

// Keep in sync with LAUNCH_TRANSITION_FRAMES in duration.ts
export const TRANSITION_FRAMES = 2

function buildPalette(theme?: ProjectTheme) {
  const brand = theme?.primaryColor ?? '#a855f7'
  const dim = (c: string) => `${c}40`
  const glow = (c: string) => `${c}28`
  return {
    scene1: { primary: brand,     dim: dim(brand),     glow: glow(brand) },
    scene2: { primary: '#ef4444', dim: '#ef444440',    glow: '#dc262628' },
    scene3: { primary: brand,     dim: dim(brand),     glow: glow(brand) },
    scene4: { primary: brand,     dim: dim(brand),     glow: glow(brand) },
    scene5: { primary: brand,     dim: dim(brand),     glow: glow(brand) },
    fallback: { primary: '#ffffff', dim: '#ffffff40',  glow: '#ffffff14' },
  }
}

const p = (id: string, theme?: ProjectTheme) => {
  const pal = buildPalette(theme)
  return (pal as any)[id] ?? pal.fallback
}

// ─── FlashCut — bright overlay at scene entry ────────────────────────────────

function FlashCut({ color = '#ffffff', accent }: { color?: string; accent?: string }) {
  const frame = useCurrentFrame()
  const flashOpacity = interpolate(frame, [0, 3], [0.85, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })
  if (flashOpacity <= 0) return null
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100, pointerEvents: 'none',
      backgroundColor: accent ?? color,
      opacity: flashOpacity,
    }} />
  )
}

// ─── MicroMotionBg — breathing radial glow background ────────────────────────

function MicroMotionBg({ sceneId, theme }: { sceneId: string; theme?: ProjectTheme }) {
  const frame = useCurrentFrame()
  const pal = p(sceneId, theme)
  const bg = theme?.backgroundColor ?? '#050505'
  const dotColor = theme?.isDark === false ? '#00000008' : '#ffffff0a'

  const breathe = 1 + 0.018 * Math.sin(frame * 0.09)
  const drift = Math.sin(frame * 0.04) * 6
  const glowX = 50 + drift
  const glowY = 50 + Math.sin(frame * 0.055) * 5

  return (
    <AbsoluteFill style={{ backgroundColor: bg, transform: `scale(${breathe})` }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at ${glowX}% ${glowY}%, ${pal.glow} 0%, transparent 58%)`,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />
    </AbsoluteFill>
  )
}

// ─── TextReveal — word-by-word spring stagger ─────────────────────────────────

function TextReveal({
  text, startDelay = 0, wordDelay = 3, style = {},
}: {
  text: string
  startDelay?: number
  wordDelay?: number
  style?: React.CSSProperties
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const words = text.split(' ')

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2em', ...style }}>
      {words.map((word, i) => {
        const wf = Math.max(0, frame - startDelay - i * wordDelay)
        const s = spring({ frame: wf, fps, config: { damping: 9, stiffness: 320 } })
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: interpolate(s, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(s, [0, 1], [28, 0])}px)`,
            }}
          >
            {word}
          </span>
        )
      })}
    </div>
  )
}

// ─── SceneLabel — top-left indicator ─────────────────────────────────────────

function SceneLabel({ title, index, total, sceneId, theme }: {
  title: string; index: number; total: number; sceneId: string; theme?: ProjectTheme
}) {
  const frame = useCurrentFrame()
  const pal = p(sceneId, theme)
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  return (
    <div style={{
      position: 'absolute', top: 44, left: 64,
      display: 'flex', alignItems: 'center', gap: 12, opacity, zIndex: 10,
    }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        backgroundColor: pal.primary,
        boxShadow: `0 0 10px ${pal.primary}`,
      }} />
      <span style={{
        color: '#ffffff60', fontSize: 13, fontFamily: 'monospace',
        letterSpacing: 3, textTransform: 'uppercase',
      }}>
        {String(index + 1).padStart(2, '0')} — {title}
      </span>
    </div>
  )
}

// ─── BottomBar — progress line ────────────────────────────────────────────────

function BottomBar({ sceneId, theme }: { sceneId: string; theme?: ProjectTheme }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const pal = p(sceneId, theme)
  const width = (frame / durationInFrames) * 100

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 3, backgroundColor: '#ffffff0a', zIndex: 10,
    }}>
      <div style={{
        height: '100%', width: `${width}%`,
        background: `linear-gradient(90deg, ${pal.primary}, ${pal.dim})`,
      }} />
    </div>
  )
}

// ─── AccentLines — fast sweep on scene entry ──────────────────────────────────

function AccentLines({ sceneId, theme }: { sceneId: string; theme?: ProjectTheme }) {
  const frame = useCurrentFrame()
  const pal = p(sceneId, theme)
  const w1 = interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const w2 = interpolate(frame, [2, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <div style={{ position: 'absolute', bottom: 80, left: 80, zIndex: 5, pointerEvents: 'none' }}>
      <div style={{ height: 3, width: `${w1 * 200}px`, background: pal.primary, borderRadius: 2, marginBottom: 6, opacity: 0.9 }} />
      <div style={{ height: 2, width: `${w2 * 120}px`, background: pal.primary, borderRadius: 2, opacity: 0.4 }} />
    </div>
  )
}

// ─── SCENE 1: Hook ───────────────────────────────────────────────────────────

function HookScene({ scene, repoName, theme }: { scene: ScriptScene; repoName: string; theme?: ProjectTheme }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const pal = p(scene.id, theme)
  const textColor = theme?.isDark === false ? '#111111' : '#ffffff'

  const eyebrowOpacity = interpolate(frame, [4, 14], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })
  const lineWidth = interpolate(frame, [10, 28], [0, 320], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  const avatarS = spring({ frame: Math.max(0, frame - 1), fps, config: { damping: 9, stiffness: 320 } })
  const avatarScale = interpolate(avatarS, [0, 1], [0.6, 1.0])
  const avatarOpacity = interpolate(avatarS, [0, 1], [0, 1])

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <MicroMotionBg sceneId={scene.id} theme={theme} />
      <FlashCut />
      <SceneLabel title={scene.title} index={0} total={5} sceneId={scene.id} theme={theme} />
      <BottomBar sceneId={scene.id} theme={theme} />
      <AccentLines sceneId={scene.id} theme={theme} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 80px' }}>
        {(theme?.logoUrl ?? theme?.avatarUrl) && (
          <div style={{
            marginBottom: 28,
            opacity: avatarOpacity,
            transform: `scale(${avatarScale})`,
            display: 'flex', justifyContent: 'center',
          }}>
            <Img
              src={theme.logoUrl ?? theme.avatarUrl}
              style={{
                maxHeight: 120, maxWidth: 320,
                borderRadius: theme.logoUrl ? 12 : '50%',
                border: `1px solid ${pal.primary}40`,
                boxShadow: `0 0 28px ${pal.primary}30`,
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        <div style={{
          opacity: eyebrowOpacity,
          color: pal.primary, fontSize: 15, fontFamily: 'monospace',
          letterSpacing: 5, textTransform: 'uppercase', marginBottom: 28,
        }}>
          github.com / {repoName.split('/').pop()?.toLowerCase() ?? repoName}
        </div>

        <TextReveal
          text={scene.headline || repoName}
          startDelay={2}
          wordDelay={3}
          style={{
            fontSize: 108, fontWeight: 900, fontFamily: 'sans-serif',
            color: textColor, lineHeight: 0.95, letterSpacing: -3,
            justifyContent: 'center',
          }}
        />

        <div style={{
          height: 4, width: lineWidth,
          background: `linear-gradient(90deg, ${pal.primary}, ${pal.dim})`,
          borderRadius: 2, margin: '32px auto 0',
        }} />

        {scene.subtext && (
          <div style={{
            marginTop: 24, color: `${textColor}70`, fontSize: 22,
            fontFamily: 'sans-serif', fontWeight: 400,
            opacity: interpolate(frame, [18, 30], [0, 1], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            }),
            transform: `translateY(${interpolate(frame, [18, 30], [12, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
          }}>
            {scene.subtext}
          </div>
        )}
      </div>
    </AbsoluteFill>
  )
}

// ─── SCENE 2: Problem ────────────────────────────────────────────────────────

function ProblemScene({ scene, theme }: { scene: ScriptScene; theme?: ProjectTheme }) {
  const frame = useCurrentFrame()
  const pal = p(scene.id, theme)
  const textColor = theme?.isDark === false ? '#111111' : '#ffffff'

  const labelOpacity = interpolate(frame, [0, 8], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })
  const subtextOpacity = interpolate(frame, [20, 34], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })
  const subtextY = interpolate(frame, [20, 34], [14, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px' }}>
      <MicroMotionBg sceneId={scene.id} theme={theme} />
      <FlashCut color='#ef4444' />
      <SceneLabel title={scene.title} index={1} total={5} sceneId={scene.id} theme={theme} />
      <BottomBar sceneId={scene.id} theme={theme} />
      <AccentLines sceneId={scene.id} theme={theme} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100 }}>
        <div style={{
          opacity: labelOpacity,
          color: pal.primary, fontSize: 14, fontFamily: 'monospace',
          letterSpacing: 4, textTransform: 'uppercase', marginBottom: 24,
        }}>
          The problem
        </div>

        <TextReveal
          text={scene.headline || 'The old way is broken'}
          startDelay={0}
          wordDelay={3}
          style={{
            fontSize: 80, fontWeight: 900, fontFamily: 'sans-serif',
            color: textColor, lineHeight: 1.05, letterSpacing: -2,
            marginBottom: 32,
          }}
        />

        {scene.subtext && (
          <div style={{
            opacity: subtextOpacity,
            transform: `translateY(${subtextY}px)`,
            color: `${textColor}60`, fontSize: 24, fontFamily: 'sans-serif',
            lineHeight: 1.6, maxWidth: 720,
          }}>
            {scene.subtext}
          </div>
        )}
      </div>
    </AbsoluteFill>
  )
}

// ─── SCENE 3: Solution ───────────────────────────────────────────────────────

function SolutionScene({ scene, repoName, theme }: { scene: ScriptScene; repoName: string; theme?: ProjectTheme }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const pal = p(scene.id, theme)
  const textColor = theme?.isDark === false ? '#111111' : '#ffffff'

  // Shock flash — accent colored "aha" moment
  const shockOpacity = interpolate(frame, [0, 4], [0.9, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  const burst = spring({ frame: Math.max(0, frame - 2), fps, config: { damping: 7, stiffness: 80 } })
  const burstScale = interpolate(burst, [0, 1], [0.2, 2.8])
  const burstOpacity = interpolate(burst, [0, 0.4, 1], [0, 0.5, 0])

  const introOpacity = interpolate(frame, [2, 12], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  const subtextOpacity = interpolate(frame, [22, 36], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <MicroMotionBg sceneId={scene.id} theme={theme} />
      <SceneLabel title={scene.title} index={2} total={5} sceneId={scene.id} theme={theme} />
      <BottomBar sceneId={scene.id} theme={theme} />
      <AccentLines sceneId={scene.id} theme={theme} />

      {/* Accent-colored shock flash — the "aha" moment */}
      {shockOpacity > 0 && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100, pointerEvents: 'none',
          backgroundColor: pal.primary, opacity: shockOpacity,
        }} />
      )}

      <div style={{
        position: 'absolute',
        width: 480, height: 480,
        border: `2px solid ${pal.primary}`,
        borderRadius: '50%',
        transform: `scale(${burstScale})`,
        opacity: burstOpacity,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 100px' }}>
        <div style={{
          opacity: introOpacity,
          color: pal.primary, fontSize: 14, fontFamily: 'monospace',
          letterSpacing: 5, textTransform: 'uppercase', marginBottom: 22,
        }}>
          Introducing
        </div>

        <TextReveal
          text={scene.headline || repoName}
          startDelay={4}
          wordDelay={3}
          style={{
            fontSize: 96, fontWeight: 900, fontFamily: 'sans-serif',
            color: textColor, lineHeight: 0.95, letterSpacing: -3,
            justifyContent: 'center', marginBottom: 28,
          }}
        />

        {scene.subtext && (
          <div style={{
            opacity: subtextOpacity,
            color: `${textColor}a0`, fontSize: 24, fontFamily: 'sans-serif',
            lineHeight: 1.6, maxWidth: 780, margin: '0 auto',
            transform: `translateY(${interpolate(frame, [22, 36], [14, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
          }}>
            {scene.subtext}
          </div>
        )}
      </div>
    </AbsoluteFill>
  )
}

// ─── SCENE 4: Features — rapid-fire one at a time ────────────────────────────

function FeatureSlide({ text, index, total, sceneId, theme }: {
  text: string; index: number; total: number; sceneId: string; theme?: ProjectTheme
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const pal = p(sceneId, theme)
  const textColor = theme?.isDark === false ? '#111111' : '#ffffff'

  const s = spring({ frame, fps, config: { damping: 9, stiffness: 320 } })
  const opacity = interpolate(frame, [0, 5], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })
  const translateX = interpolate(s, [0, 1], [80, 0])
  const lineWidth = interpolate(frame, [3, 14], [0, 280], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px' }}>
      <div style={{
        opacity, marginBottom: 16,
        color: pal.primary, fontSize: 13, fontFamily: 'monospace', letterSpacing: 4,
      }}>
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>

      <div style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        fontSize: 72, fontWeight: 900, fontFamily: 'sans-serif',
        color: textColor, lineHeight: 1.05, letterSpacing: -2,
        maxWidth: 1100,
      }}>
        {text}
      </div>

      <div style={{
        marginTop: 24, height: 4, width: lineWidth,
        background: `linear-gradient(90deg, ${pal.primary}, ${pal.dim})`,
        borderRadius: 2,
      }} />
    </AbsoluteFill>
  )
}

function FeaturesScene({ scene, theme }: { scene: ScriptScene; theme?: ProjectTheme }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const pal = p(scene.id, theme)

  const bullets = scene.bullets?.filter(Boolean).slice(0, 4)
    ?? scene.narrative.split(/[.·•]/).map(s => s.trim()).filter(Boolean).slice(0, 4)

  const framesPerFeature = Math.floor(durationInFrames / bullets.length)

  return (
    <AbsoluteFill>
      <MicroMotionBg sceneId={scene.id} theme={theme} />
      <FlashCut />
      <SceneLabel title={scene.title} index={3} total={5} sceneId={scene.id} theme={theme} />
      <BottomBar sceneId={scene.id} theme={theme} />

      <div style={{
        position: 'absolute', top: 100, left: 80, zIndex: 10,
        color: pal.primary, fontSize: 14, fontFamily: 'monospace', letterSpacing: 4,
        opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        textTransform: 'uppercase',
      }}>
        Key features
      </div>

      {bullets.map((feature, i) => (
        <Sequence key={i} from={i * framesPerFeature} durationInFrames={framesPerFeature} layout="none">
          <FeatureSlide
            text={feature}
            index={i}
            total={bullets.length}
            sceneId={scene.id}
            theme={theme}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}

// ─── SCENE 5: Get Started / CTA ──────────────────────────────────────────────

function CTAScene({ scene, repoName, repoUrl, theme }: {
  scene: ScriptScene; repoName: string; repoUrl: string; theme?: ProjectTheme
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const pal = p(scene.id, theme)
  const textColor = theme?.isDark === false ? '#111111' : '#ffffff'

  const mainS = spring({ frame, fps, config: { damping: 9, stiffness: 280 } })
  const mainOpacity = interpolate(mainS, [0, 1], [0, 1])
  const mainScale = interpolate(mainS, [0, 1], [0.88, 1])

  const cardOpacity = interpolate(frame, [14, 24], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })
  const pulse = interpolate(Math.sin((frame * Math.PI) / 20), [-1, 1], [0.97, 1.03])

  const shortUrl = repoUrl.replace(/^https?:\/\//, '')
  const installCmd = theme?.installCommand

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <MicroMotionBg sceneId={scene.id} theme={theme} />
      <FlashCut />
      <SceneLabel title={scene.title} index={4} total={5} sceneId={scene.id} theme={theme} />
      <BottomBar sceneId={scene.id} theme={theme} />
      <AccentLines sceneId={scene.id} theme={theme} />

      <div style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        opacity: mainOpacity, transform: `scale(${mainScale})`,
      }}>
        <div style={{
          fontSize: 80, fontWeight: 900, fontFamily: 'sans-serif',
          color: textColor, lineHeight: 1.05, letterSpacing: -2, marginBottom: 12,
        }}>
          {scene.headline || 'Star on GitHub'}
        </div>

        {scene.subtext && (
          <div style={{
            color: `${textColor}60`, fontSize: 22, fontFamily: 'sans-serif',
            marginBottom: 36,
            opacity: interpolate(frame, [10, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}>
            {scene.subtext}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: cardOpacity }}>
          {installCmd && (
            <div style={{
              transform: `scale(${pulse})`,
              display: 'inline-flex', alignItems: 'center', gap: 14,
              padding: '14px 28px',
              background: `${pal.primary}22`,
              border: `1px solid ${pal.primary}60`,
              borderRadius: 10,
            }}>
              <span style={{ color: pal.primary, fontSize: 14, fontFamily: 'monospace', letterSpacing: 2 }}>$</span>
              <span style={{ color: `${textColor}ee`, fontSize: 22, fontFamily: 'monospace', letterSpacing: 0.5 }}>
                {installCmd}
              </span>
            </div>
          )}

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: '12px 24px',
            background: `${pal.primary}10`,
            border: `1px solid ${pal.primary}30`,
            borderRadius: 10,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              backgroundColor: pal.primary, boxShadow: `0 0 10px ${pal.primary}`,
            }} />
            <span style={{ color: `${textColor}80`, fontSize: 18, fontFamily: 'monospace', letterSpacing: 0.5 }}>
              {shortUrl}
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ─── Scene router ─────────────────────────────────────────────────────────────

function SceneRouter({ scene, repoName, repoUrl, theme }: {
  scene: ScriptScene; repoName: string; repoUrl: string; theme?: ProjectTheme
}) {
  switch (scene.id) {
    case 'scene1': return <HookScene scene={scene} repoName={repoName} theme={theme} />
    case 'scene2': return <ProblemScene scene={scene} theme={theme} />
    case 'scene3': return <SolutionScene scene={scene} repoName={repoName} theme={theme} />
    case 'scene4': return <FeaturesScene scene={scene} theme={theme} />
    case 'scene5': return <CTAScene scene={scene} repoName={repoName} repoUrl={repoUrl} theme={theme} />
    default:       return <HookScene scene={scene} repoName={repoName} theme={theme} />
  }
}

// ─── Root composition ─────────────────────────────────────────────────────────

export const RepoReelVideo: React.FC<VideoProps> = ({ scenes, repoName, repoUrl, theme, audioConfig }) => {
  const { fps } = useVideoConfig()

  // Resolve music track URL
  const musicUrl = audioConfig
    ? MUSIC_TRACKS.find((t) => t.id === audioConfig.musicTrackId)?.url
    : undefined
  const musicVolume = audioConfig?.musicVolume ?? 0.3

  return (
    <AbsoluteFill style={{ backgroundColor: theme?.backgroundColor ?? '#050505' }}>
      {/* Background music — looped, with fade-in */}
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
            <TransitionSeries.Sequence durationInFrames={scene.duration * fps}>
              <SceneRouter scene={scene} repoName={repoName} repoUrl={repoUrl} theme={theme} />
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
