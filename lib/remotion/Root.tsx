import React from 'react'
import { Composition, registerRoot } from 'remotion'
import { RepoReelVideo, VideoProps } from './VideoComposition'
import { KineticVideo } from './KineticComposition'
import { MultiTemplateVideo, calcMultiTemplateDurationInFrames } from './MultiTemplateComposition'
import { calcDurationInFrames, calcKineticDurationInFrames } from './duration'
import { ScriptScene } from '../scriptGenerator'
import { SceneDirective } from '../types'
import { DEFAULT_AUDIO_CONFIG } from '../audioConfig'
import { TEMPLATE_REGISTRY } from './registry'
import { FutureOfDesignAdapter } from './adapters/FutureOfDesignAdapter'
import { EditorialDesignAdapter } from './adapters/EditorialDesignAdapter'

export { calcDurationInFrames, calcKineticDurationInFrames }

const FPS = 30

// ─── Default props for development / preview ──────────────────────────────────

const DEFAULT_SCENES: ScriptScene[] = [
  { id: 'scene1', title: 'Hook',        duration: 4, headline: 'repo-reel',              subtext: 'Turn any GitHub repo into a video.', bullets: [], narrative: 'Sample hook.', visuals: '' },
  { id: 'scene2', title: 'Problem',     duration: 5, headline: 'The old way is broken',  subtext: 'Writing docs nobody reads.', bullets: [], narrative: 'Sample problem.', visuals: '' },
  { id: 'scene3', title: 'Solution',    duration: 5, headline: 'Meet repo-reel',          subtext: 'AI-generated launch videos.', bullets: [], narrative: 'Sample solution.', visuals: '' },
  { id: 'scene4', title: 'Features',    duration: 5, headline: 'What makes it different', subtext: '', bullets: ['AI script generation', 'Multiple templates', '30-second format', 'Open source'], narrative: 'Sample features.', visuals: '' },
  { id: 'scene5', title: 'Get Started', duration: 4, headline: 'Star on GitHub',          subtext: 'Open source. Always free.', bullets: [], narrative: 'Sample CTA.', visuals: '' },
]

const DEFAULT_DIRECTIVES: SceneDirective[] = [
  {
    id: 'scene1', title: 'Hook', durationSeconds: 4,
    templateId: 'FutureOfDesign',
    templateProps: { smallText: 'MEET', mainText: 'repo-reel', subText: 'AI VIDEO GENERATOR', backgroundColor: '#0f172a', textColor: '#FFFFFF', glowColor: '#a855f7', glowIntensity: 5 },
    narrative: 'repo-reel turns any GitHub URL into a cinematic launch video in seconds.',
  },
  {
    id: 'scene2', title: 'Problem', durationSeconds: 5,
    templateId: 'EditorialDesign',
    templateProps: { smallText: 'THE PROBLEM', mainText: 'README', subText: 'NOBODY READS THEM', backgroundColor: '#0a0a0a', textColor: '#FFFFFF' },
    narrative: "Documentation that nobody reads. Projects that never get discovered. There's a better way.",
  },
  {
    id: 'scene3', title: 'Solution', durationSeconds: 5,
    templateId: 'EnergyText',
    templateProps: { beText: 'TURN', theText: 'YOUR', mainWord: 'REPO', youText: 'INTO', wantText: 'A', toText: 'LAUNCH', attractText: 'VIDEO', backgroundColor: '#ffffff', textColor: '#000000' },
    narrative: 'Paste a GitHub URL. Get a cinematic video. No editing. No design skills needed.',
  },
  {
    id: 'scene4', title: 'Features', durationSeconds: 5,
    templateId: 'ListOfThings',
    templateProps: { venue1Icon: '🤖', venue1Label: 'AI Script Generation', venue2Icon: '🎬', venue2Label: 'Multiple Templates', venue3Icon: '⚡', venue3Label: 'Seconds to Render', venue4Icon: '🌍', venue4Label: 'Open Source', backgroundColor: '#ffffff', textColor: '#111827', accentColor: '#6366f1' },
    narrative: 'AI-written script. Multiple cinematic templates. Renders in seconds. Completely free.',
  },
  {
    id: 'scene5', title: 'CTA', durationSeconds: 4,
    templateId: 'KineticTunnel',
    templateProps: { text: 'STAR ON GITHUB ', backgroundColor: '#000000', textColor: '#FFFFFF', accentColor: '#6366f1' },
    narrative: 'Star it on GitHub. Share your video. Let your code speak for itself.',
  },
]

const DEFAULT_VIDEO_PROPS: VideoProps = {
  scenes: DEFAULT_SCENES,
  repoName: 'repo-reel',
  repoUrl: 'https://github.com/heysheevcharan/repo-reel',
  audioConfig: DEFAULT_AUDIO_CONFIG,
}

const DEFAULT_MULTI_PROPS = {
  sceneDirectives: DEFAULT_DIRECTIVES,
  audioConfig: DEFAULT_AUDIO_CONFIG,
}

// ─── Registry-driven root ─────────────────────────────────────────────────────

const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* multiTemplate — the new AI director composition */}
      <Composition
        id="multiTemplate"
        component={MultiTemplateVideo as React.ComponentType<any>}
        durationInFrames={calcMultiTemplateDurationInFrames(DEFAULT_DIRECTIVES, FPS)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={DEFAULT_MULTI_PROPS}
      />

      {/* Legacy compositions */}
      <Composition
        id="launch"
        component={RepoReelVideo as React.ComponentType<any>}
        durationInFrames={calcDurationInFrames(DEFAULT_SCENES, FPS)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={DEFAULT_VIDEO_PROPS}
      />
      <Composition
        id="kinetic"
        component={KineticVideo as React.ComponentType<any>}
        durationInFrames={calcKineticDurationInFrames(DEFAULT_SCENES, FPS)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={DEFAULT_VIDEO_PROPS}
      />
      <Composition
        id="futureOfDesign"
        component={FutureOfDesignAdapter as React.ComponentType<any>}
        durationInFrames={calcDurationInFrames(DEFAULT_SCENES, FPS)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={DEFAULT_VIDEO_PROPS}
      />
      <Composition
        id="editorialDesign"
        component={EditorialDesignAdapter as React.ComponentType<any>}
        durationInFrames={calcDurationInFrames(DEFAULT_SCENES, FPS)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={DEFAULT_VIDEO_PROPS}
      />
    </>
  )
}

registerRoot(RemotionRoot)
