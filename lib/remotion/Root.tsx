import React from 'react'
import { Composition, registerRoot } from 'remotion'
import { RepoReelVideo, VideoProps } from './VideoComposition'
import { KineticVideo, KineticVideoProps } from './KineticComposition'
import { calcDurationInFrames, calcKineticDurationInFrames } from './duration'
import { ScriptScene } from '../scriptGenerator'

export { calcDurationInFrames, calcKineticDurationInFrames }

const FPS = 30

const DEFAULT_SCENES: ScriptScene[] = [
  { id: 'scene1', title: 'Hook',        duration: 5, headline: 'repo-reel',          subtext: 'Turn any GitHub repo into a video.', bullets: [], narrative: 'Sample hook narrative.', visuals: '' },
  { id: 'scene2', title: 'Problem',     duration: 7, headline: 'The old way is broken', subtext: 'Writing docs nobody reads.', bullets: [], narrative: 'Sample problem narrative.', visuals: '' },
  { id: 'scene3', title: 'Solution',    duration: 7, headline: 'Meet repo-reel',     subtext: 'AI-generated launch videos in seconds.', bullets: [], narrative: 'Sample solution narrative.', visuals: '' },
  { id: 'scene4', title: 'Features',    duration: 6, headline: 'What makes it different', subtext: '', bullets: ['AI script generation', 'Real Remotion rendering', '30-second format', 'One GitHub URL'], narrative: 'Sample features narrative.', visuals: '' },
  { id: 'scene5', title: 'Get Started', duration: 5, headline: 'Star on GitHub',     subtext: 'Open source. Always free.', bullets: [], narrative: 'Sample call to action.', visuals: '' },
]


const RemotionRoot: React.FC = () => {
  return (
    <>
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
      <Composition
        id="KineticVideo"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={KineticVideo as any}
        durationInFrames={calcKineticDurationInFrames(DEFAULT_SCENES, FPS)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={
          {
            scenes: DEFAULT_SCENES,
            repoName: 'repo-reel',
            repoUrl: 'https://github.com/heysheevcharan/repo-reel',
          } satisfies KineticVideoProps
        }
      />
    </>
  )
}

registerRoot(RemotionRoot)
