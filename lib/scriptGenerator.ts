import { generateText } from 'ai'
import { GitHubRepoData } from './github'
import type { ScriptScene } from './types'

export type { ScriptScene }

// Fixed structure — AI only fills content, never changes order/duration
const SCENE_TEMPLATES: Pick<ScriptScene, 'id' | 'title' | 'duration'>[] = [
  { id: 'scene1', title: 'Hook',        duration: 4 },
  { id: 'scene2', title: 'Problem',     duration: 5 },
  { id: 'scene3', title: 'Solution',    duration: 5 },
  { id: 'scene4', title: 'Features',    duration: 5 },
  { id: 'scene5', title: 'Get Started', duration: 3 },
]

export const TOTAL_DURATION_SECONDS = SCENE_TEMPLATES.reduce((s, sc) => s + sc.duration, 0)

export async function generateVideoScript(repoData: GitHubRepoData): Promise<ScriptScene[]> {
  // Extract install command to inform scene 5 narrative
  const installCommand = repoData.packageJson?.name
    ? (repoData.packageJson.bin ? `npx ${repoData.packageJson.name}` : `npm install ${repoData.packageJson.name}`)
    : repoData.readme.match(/```(?:bash|sh)?\n((?:npm|pip|cargo|go get|yarn|pnpm)[^\n]{2,50})/m)?.[1]?.trim()

  const activityContext = repoData.stars > 10000
    ? `This is a major open-source project with ${repoData.stars.toLocaleString()} stars.`
    : repoData.stars > 1000
    ? `This is a popular project with ${repoData.stars.toLocaleString()} stars and real community traction.`
    : `This is an emerging project with ${repoData.stars.toLocaleString()} stars.`

  const prompt = `You are an elite creative director writing a 22-second product launch video script for a GitHub repository. Your output will be displayed word-by-word on screen at cinematic scale.

Reference energy: Apple keynote, Linear.app launch, Vercel ship videos.
Every single word is seen at 100px+ size. Vague words look weak. Specific words look powerful.

Repository:
- Name: ${repoData.repo}
- Description: ${repoData.description || 'No description'}
- Language: ${repoData.language}
- Stars: ${repoData.stars.toLocaleString()} | Forks: ${repoData.forks}
- Topics: ${repoData.topics.slice(0, 8).join(', ')}
- Install: ${installCommand ?? 'see README'}
- Activity: ${activityContext}
- README: ${repoData.readme.slice(0, 1500)}

Generate content for EXACTLY these 5 scenes:

scene1 "Hook" (4s)
  headline: 1–3 words MAXIMUM. One concept. Stop the scroll. No verbs unless they punch hard.
  Examples of good: "Zero config." / "Ship faster." / "The terminal, reimagined."
  subtext: One sharp sentence — who this is for or what it replaces.

scene2 "Problem" (5s)
  headline: 3–5 words. The specific pain this repo fixes. Name the enemy (slow builds, broken configs, manual work).
  subtext: One sentence that makes the reader feel the frustration.

scene3 "Solution" (5s)
  headline: 2–4 words. How ${repoData.repo} kills that pain. Active. Present tense.
  subtext: One sentence that explains the mechanism, not just the benefit.

scene4 "Features" (5s)
  bullets: Exactly 4 items. Each 2–4 words. Name what it DOES, not how great it is.
  Bad: "Lightning fast performance" — Good: "Builds in 200ms"
  Bad: "Easy to use" — Good: "Zero-config setup"
  headline: 3–5 words that frame the list (e.g. "Built for speed" or "Four reasons to switch")
  subtext: omit

scene5 "Get Started" (3s)
  headline: 3–5 words. Action-first. Urgency without hype.
  subtext: The install command verbatim if one exists, otherwise the GitHub URL.
  If install command: "${installCommand ?? ''}" — use it exactly.

JSON format — return ONLY this array, no markdown:
[
  { "id": "scene1", "headline": "...", "subtext": "...", "bullets": [], "narrative": "..." },
  { "id": "scene2", "headline": "...", "subtext": "...", "bullets": [], "narrative": "..." },
  { "id": "scene3", "headline": "...", "subtext": "...", "bullets": [], "narrative": "..." },
  { "id": "scene4", "headline": "...", "subtext": "", "bullets": ["...","...","...","..."], "narrative": "..." },
  { "id": "scene5", "headline": "...", "subtext": "...", "bullets": [], "narrative": "..." }
]

narrative: 20–30 words, spoken aloud, energetic present tense. No filler phrases like "introducing" or "check out".
Return ONLY the JSON array.`

  try {
    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt,
      temperature: 0.65,
      maxOutputTokens: 1200,
    })

    const parsed: Partial<ScriptScene>[] = JSON.parse(text.trim())

    return SCENE_TEMPLATES.map((template) => {
      const ai = parsed.find((s) => s.id === template.id) ?? {}
      return {
        ...template,
        headline: ai.headline || fallbackHeadline(template.id, repoData),
        subtext: ai.subtext || '',
        bullets: ai.bullets ?? [],
        narrative: ai.narrative || fallbackNarrative(template.id, repoData),
        visuals: '',
      }
    })
  } catch (error) {
    console.error('[scriptGenerator] error:', error)
    return generateFallbackScript(repoData)
  }
}

function fallbackHeadline(id: string, r: GitHubRepoData): string {
  switch (id) {
    case 'scene1': return r.repo
    case 'scene2': return 'The old way is broken'
    case 'scene3': return `Meet ${r.repo}`
    case 'scene4': return 'What makes it different'
    case 'scene5': return 'Star it on GitHub'
    default: return r.repo
  }
}

function fallbackNarrative(id: string, r: GitHubRepoData): string {
  switch (id) {
    case 'scene1': return `${r.repo} — the ${r.language} project every developer needs. ${r.stars} stars and counting.`
    case 'scene2': return `You're wasting hours on boilerplate, config, and repetitive setup. There's a better way.`
    case 'scene3': return `${r.repo} ${r.description || 'eliminates the friction and gets you shipping faster.'}`
    case 'scene4': return `Fast. Minimal setup. Works out of the box. Actively maintained.`
    case 'scene5': return `Star it on GitHub. Run the install command. Be building in minutes.`
    default: return ''
  }
}

function generateFallbackScript(r: GitHubRepoData): ScriptScene[] {
  return SCENE_TEMPLATES.map((template) => ({
    ...template,
    headline: fallbackHeadline(template.id, r),
    subtext: '',
    bullets: template.id === 'scene4' ? ['Zero config setup', 'Lightning fast', 'Actively maintained', 'Open source'] : [],
    narrative: fallbackNarrative(template.id, r),
    visuals: '',
  }))
}
