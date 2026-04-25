export interface ScriptScene {
  id: string
  title: string
  duration: number
  narrative: string
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
