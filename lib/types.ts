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
  scriptScenes: ScriptScene[]
  totalDurationSeconds: number
  analysisTimestamp: string
  theme?: ProjectTheme
}

export type ScreenState = 'landing' | 'progress' | 'editor' | 'output'
