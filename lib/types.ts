export interface MusicTrack {
  id: string
  label: string
  url: string
}

export interface AudioConfig {
  musicTrackId: string
  musicVolume: number   // 0–1
}

export interface ScriptScene {
  id: string
  title: string
  duration: number
  headline: string      // 2–5 words shown BIG on screen
  subtext?: string      // one supporting sentence
  bullets?: string[]    // rapid-fire list (used in Features scene)
  narrative: string     // full narration / voiceover
  visuals: string
}

/**
 * SceneDirective — the new per-scene data model used by the multi-template pipeline.
 * Each scene is assigned a specific template from TEMPLATE_DICT with all props filled in.
 */
export interface SceneDirective {
  id: string                          // "scene1", "scene2", ...
  title: string                       // "Hook", "Problem", "Solution", "Features", "CTA"
  durationSeconds: number             // How long this clip plays (3–7s)
  templateId: string                  // Must match an entry in TEMPLATE_DICT
  templateProps: Record<string, any>  // Flat props for that specific template
  narrative: string                   // Voiceover/narration text
}

export interface ProjectTheme {
  primaryColor: string        // main brand / accent color
  backgroundColor: string     // video background
  isDark: boolean             // dark or light aesthetic
  mood: 'minimal' | 'energetic' | 'technical' | 'playful' | 'enterprise'
  avatarUrl: string           // owner avatar as data URL (fallback)
  logoUrl?: string            // README-extracted project logo as data URL (preferred)
  socialPreviewUrl?: string   // og:image as data URL
  installCommand?: string     // e.g. "npm install shadcn"
  websiteUrl?: string
  forks: number
  openIssues: number
}

export interface RepoData {
  repoName: string
  repoUrl: string
  description: string
  stars: number
  language: string
  topics: string[]
  scriptScenes: ScriptScene[]          // legacy — used by 'launch' and 'kinetic' templates
  sceneDirectives?: SceneDirective[]   // new — used by 'multiTemplate' pipeline
  totalDurationSeconds: number
  analysisTimestamp: string
  theme?: ProjectTheme
}

export type ScreenState = 'landing' | 'progress' | 'editor' | 'output'

/**
 * Template identifiers are arbitrary strings that map to entries in
 * `TEMPLATE_REGISTRY` (lib/remotion/registry.ts). The built-in values are
 * 'launch' and 'kinetic', but new templates can be added to the registry
 * without changing this type.
 */
export type TemplateId = string
