export type SceneType = 'hook' | 'problem' | 'solution' | 'unique-angle' | 'social-proof' | 'cta'

export interface Scene {
  id: string
  type: SceneType
  label: string
  text: string
  maxChars: number
  durationSeconds: number
}

export interface Competitor {
  name: string
}

export interface RepoData {
  repoId: string
  name: string
  description: string
  logoUrl: string | null
  screenshotUrls: string[]
  techStack: string[]
  competitors: Competitor[]
  uniqueAngle: string
  scenes: Scene[]
  totalDurationSeconds: number
}

export type ScreenState = 'landing' | 'progress' | 'editor' | 'output'
