/**
 * MultiTemplateComposition
 *
 * The main composition for the new multi-template video pipeline.
 * Each scene in `sceneDirectives` is rendered with its own Remotion template
 * and stitched together with fade transitions via TransitionSeries.
 *
 * Input props: MultiTemplateVideoProps
 * - sceneDirectives: SceneDirective[] — from the AI director
 * - audioConfig?: AudioConfig — optional background music
 *
 * This is registered in registry.ts as "multiTemplate".
 */

import React from 'react'
import { AbsoluteFill, Audio, interpolate, useVideoConfig } from 'remotion'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import type { SceneDirective, AudioConfig } from '../types'
import { DynamicTemplateRenderer } from './DynamicTemplateRenderer'
import { MUSIC_TRACKS } from '../audioConfig'

const TRANSITION_FRAMES = 8 // ~0.27s fade between scenes

export interface MultiTemplateVideoProps {
  sceneDirectives: SceneDirective[]
  audioConfig?: AudioConfig
}

/** Calculate total duration in frames for a set of SceneDirectives */
export function calcMultiTemplateDurationInFrames(
  scenes: SceneDirective[],
  fps: number
): number {
  if (!scenes || !Array.isArray(scenes) || scenes.length === 0) return 30 // Fallback to 1 second
  const totalSeconds = scenes.reduce((sum, s) => sum + (s.durationSeconds || 0), 0)
  return totalSeconds * fps + (scenes.length - 1) * TRANSITION_FRAMES
}

export const MultiTemplateVideo: React.FC<MultiTemplateVideoProps> = (props) => {
  if (!props?.sceneDirectives?.length) return null

  const { sceneDirectives, audioConfig } = props
  const { fps } = useVideoConfig()

  const musicUrl = audioConfig
    ? MUSIC_TRACKS.find((t) => t.id === audioConfig.musicTrackId)?.url
    : undefined
  const musicVolume = audioConfig?.musicVolume ?? 0.3

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Background music */}
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
        {sceneDirectives.map((scene, i) => (
          <React.Fragment key={scene.id}>
            <TransitionSeries.Sequence
              durationInFrames={scene.durationSeconds * fps}
            >
              <DynamicTemplateRenderer
                templateId={scene.templateId}
                templateProps={scene.templateProps}
              />
            </TransitionSeries.Sequence>

            {i < sceneDirectives.length - 1 && (
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
