/**
 * EditorialDesignAdapter
 *
 * Maps repo-reel's standard VideoProps onto the EditorialDesign template's
 * flat { smallText, mainText, subText, … } props.
 *
 * Scene mapping:
 *   smallText  → scene.title (uppercase e.g. "HOOK", "PROBLEM")
 *   mainText   → scene.headline (the big italic serif word)
 *   subText    → scene.subtext ?? short narrative (uppercase)
 *   backgroundColor → alternates dark/light per scene using theme
 *   textColor  → '#FFFFFF' (dark bg) or '#111111' (light bg)
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
import { Scene } from '../templates/EditorialDesign/Scene'
import { MUSIC_TRACKS } from '../../audioConfig'

const TRANSITION_FRAMES = 6

function mapSceneToProps(
  scene: VideoProps['scenes'][number],
  theme: VideoProps['theme'],
) {
  const isDark = theme?.isDark !== false
  const bg     = isDark ? (theme?.backgroundColor ?? '#0a0a0a') : '#f5f5f5'
  const text   = isDark ? '#FFFFFF' : '#111111'

  return {
    smallText:      scene.title.toUpperCase(),
    mainText:       scene.headline || scene.title,
    subText:        (scene.subtext ?? scene.narrative.slice(0, 55)).toUpperCase(),
    backgroundColor: bg,
    textColor:      text,
    scale:          1.0,
    animationSpeed: 0.9,
  }
}

export const EditorialDesignAdapter: React.FC<VideoProps> = (props) => {
  // Guard: Remotion Player may call the component with null props during initial mount
  if (!props || !props.scenes) return null
  const { scenes, theme, audioConfig } = props
  const { fps } = useVideoConfig()

  const musicUrl = audioConfig
    ? MUSIC_TRACKS.find((t) => t.id === audioConfig.musicTrackId)?.url
    : undefined
  const musicVolume = audioConfig?.musicVolume ?? 0.3

  return (
    <AbsoluteFill style={{ backgroundColor: theme?.backgroundColor ?? '#0a0a0a' }}>
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
