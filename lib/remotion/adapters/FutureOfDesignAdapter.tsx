/**
 * FutureOfDesignAdapter
 *
 * Maps repo-reel's standard VideoProps (5 ScriptScenes + ProjectTheme) onto the
 * FutureOfDesign template's flat { smallText, mainText, subText, … } props.
 *
 * Each ScriptScene becomes one FutureOfDesign clip (5s default). The 5 clips are
 * stitched together with fade transitions — identical to how RepoReelVideo works.
 *
 * Scene mapping:
 *   smallText  → scene.title (e.g. "Hook", "Problem")
 *   mainText   → scene.headline (the big word / phrase)
 *   subText    → scene.subtext ?? scene.narrative (first 60 chars)
 *   backgroundColor → theme.backgroundColor ?? '#0f172a'
 *   textColor  → '#FFFFFF'
 *   glowColor  → theme.primaryColor ?? '#a855f7'
 */
import React from 'react'
import {
  AbsoluteFill,
  Audio,
  interpolate,
  useVideoConfig,
} from 'remotion'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import type { VideoProps } from '../VideoComposition'
import { Scene } from '../templates/FutureOfDesign/Scene'
import { MUSIC_TRACKS } from '../../audioConfig'

const TRANSITION_FRAMES = 6

function mapSceneToProps(
  scene: VideoProps['scenes'][number],
  theme: VideoProps['theme'],
) {
  const bg   = theme?.backgroundColor ?? '#0f172a'
  const glow = theme?.primaryColor     ?? '#a855f7'

  return {
    smallText:     scene.title.toUpperCase(),
    mainText:      scene.headline || scene.title,
    subText:       (scene.subtext ?? scene.narrative.slice(0, 60)).toUpperCase(),
    backgroundColor: bg,
    textColor:     '#FFFFFF',
    glowColor:     glow,
    scale:         1.2,
    animationSpeed: 0.7,
    blurAmount:    25,
    slideDistance: 300,
    glowIntensity: 5,
    letterSpacing: -2,
  }
}

export const FutureOfDesignAdapter: React.FC<VideoProps> = (props) => {
  // Guard: Remotion Player may call the component with null props during initial mount
  if (!props || !props.scenes) return null
  const { scenes, theme, audioConfig } = props
  const { fps } = useVideoConfig()

  const musicUrl = audioConfig
    ? MUSIC_TRACKS.find((t) => t.id === audioConfig.musicTrackId)?.url
    : undefined
  const musicVolume = audioConfig?.musicVolume ?? 0.3

  return (
    <AbsoluteFill style={{ backgroundColor: theme?.backgroundColor ?? '#0f172a' }}>
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
              <Scene {...mapSceneToProps(scene, theme)} />
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
