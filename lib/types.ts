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
}

export type ScreenState = 'landing' | 'progress' | 'editor' | 'output'
