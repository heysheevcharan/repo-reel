import React from 'react'
import { Composition, registerRoot } from 'remotion'
import { RepoReelVideo } from './VideoComposition'
import { ScriptScene } from '../scriptGenerator'

const DEFAULT_SCENES: ScriptScene[] = [
  { id: 'scene1', title: 'Hook', duration: 10, narrative: 'Sample hook narrative.', visuals: '' },
  { id: 'scene2', title: 'Problem', duration: 15, narrative: 'Sample problem narrative.', visuals: '' },
  { id: 'scene3', title: 'Features', duration: 18, narrative: 'Sample features narrative.', visuals: '' },
  { id: 'scene4', title: 'CTA', duration: 15, narrative: 'Sample call to action.', visuals: '' },
]

const TOTAL_DURATION = DEFAULT_SCENES.reduce((s, sc) => s + sc.duration, 0)

const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="RepoReelVideo"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={RepoReelVideo as any}
      durationInFrames={TOTAL_DURATION * 30}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        scenes: DEFAULT_SCENES,
        repoName: 'repo-reel',
        repoUrl: 'https://github.com/heysheevcharan/repo-reel',
      }}
    />
  )
}

registerRoot(RemotionRoot)
