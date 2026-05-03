import React, { useEffect, useState } from 'react'
import { Composition, registerRoot } from 'remotion'
import { RepoReelVideo, VideoProps } from './VideoComposition'
import { KineticVideo } from './KineticComposition'
import { calcDurationInFrames, calcKineticDurationInFrames } from './duration'
import { ScriptScene } from '../scriptGenerator'
import { DEFAULT_AUDIO_CONFIG } from '../audioConfig'
import { TEMPLATE_REGISTRY } from './registry'

export { calcDurationInFrames, calcKineticDurationInFrames }

const FPS = 30

const DEFAULT_SCENES: ScriptScene[] = [
  { id: 'scene1', title: 'Hook',        duration: 5, headline: 'repo-reel',              subtext: 'Turn any GitHub repo into a video.', bullets: [], narrative: 'Sample hook narrative.', visuals: '' },
  { id: 'scene2', title: 'Problem',     duration: 7, headline: 'The old way is broken',  subtext: 'Writing docs nobody reads.', bullets: [], narrative: 'Sample problem narrative.', visuals: '' },
  { id: 'scene3', title: 'Solution',    duration: 7, headline: 'Meet repo-reel',          subtext: 'AI-generated launch videos in seconds.', bullets: [], narrative: 'Sample solution narrative.', visuals: '' },
  { id: 'scene4', title: 'Features',    duration: 6, headline: 'What makes it different', subtext: '', bullets: ['AI script generation', 'Real Remotion rendering', '30-second format', 'One GitHub URL'], narrative: 'Sample features narrative.', visuals: '' },
  { id: 'scene5', title: 'Get Started', duration: 5, headline: 'Star on GitHub',          subtext: 'Open source. Always free.', bullets: [], narrative: 'Sample call to action.', visuals: '' },
]

const DEFAULT_INPUT_PROPS: VideoProps = {
  scenes: DEFAULT_SCENES,
  repoName: 'repo-reel',
  repoUrl: 'https://github.com/heysheevcharan/repo-reel',
  audioConfig: DEFAULT_AUDIO_CONFIG,
}

// ─── Registry-driven root ────────────────────────────────────────────────────
//
// Each template in TEMPLATE_REGISTRY is registered as a Remotion <Composition>.
// The composition ID matches the template's `id` field so the renderer can look
// it up by ID.

const RemotionRoot: React.FC = () => {
  return (
    <>
      {TEMPLATE_REGISTRY.map((tpl) => {
        const durationInFrames = tpl.calculateDuration(DEFAULT_SCENES, FPS)

        // For the two built-in templates we can import the component synchronously.
        // For lazy-loaded adapter templates we render a thin wrapper that handles
        // the async load — but since Remotion Root runs at bundle time we use
        // static imports for all registered templates to keep bundling simple.
        // The registry `loadComponent` is used only by the browser Player.
        const component =
          tpl.id === 'launch'
            ? (RepoReelVideo as React.ComponentType<VideoProps>)
            : tpl.id === 'kinetic'
            ? (KineticVideo as React.ComponentType<VideoProps>)
            : tpl.id === 'futureOfDesign'
            ? require('./adapters/FutureOfDesignAdapter').FutureOfDesignAdapter
            : tpl.id === 'editorialDesign'
            ? require('./adapters/EditorialDesignAdapter').EditorialDesignAdapter
            : (RepoReelVideo as React.ComponentType<VideoProps>)

        return (
          <Composition
            key={tpl.id}
            id={tpl.id}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            component={component as any}
            durationInFrames={durationInFrames}
            fps={FPS}
            width={1920}
            height={1080}
            defaultProps={DEFAULT_INPUT_PROPS}
          />
        )
      })}
    </>
  )
}

registerRoot(RemotionRoot)
