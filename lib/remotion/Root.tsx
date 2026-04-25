import React from 'react'
import { Composition, registerRoot } from 'remotion'
import { RepoReelVideo, VideoProps, TRANSITION_FRAMES } from './VideoComposition'
import { ScriptScene } from '../scriptGenerator'

const FPS = 30

const DEFAULT_SCENES: ScriptScene[] = [
  { id: 'scene1', title: 'Hook', duration: 10, narrative: 'Sample hook narrative.', visuals: '' },
  { id: 'scene2', title: 'Problem', duration: 15, narrative: 'Sample problem narrative.', visuals: '' },
  { id: 'scene3', title: 'Features', duration: 18, narrative: 'Sample features narrative.', visuals: '' },
  { id: 'scene4', title: 'CTA', duration: 15, narrative: 'Sample call to action.', visuals: '' },
]

export function calcDurationInFrames(scenes: ScriptScene[], fps: number): number {
  const totalSceneFrames = scenes.reduce((s, sc) => s + sc.duration * fps, 0)
  const transitionFrames = (scenes.length - 1) * TRANSITION_FRAMES
  return totalSceneFrames - transitionFrames
}

const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="RepoReelVideo"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={RepoReelVideo as any}
      durationInFrames={calcDurationInFrames(DEFAULT_SCENES, FPS)}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={
        {
          scenes: DEFAULT_SCENES,
          repoName: 'repo-reel',
          repoUrl: 'https://github.com/heysheevcharan/repo-reel',
        } satisfies VideoProps
      }
    />
  )
}

registerRoot(RemotionRoot)
