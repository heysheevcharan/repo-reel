import { generateText } from 'ai'
import { GitHubRepoData } from './github'
import type { ScriptScene } from './types'

export type { ScriptScene }

// Fixed structure — AI only fills content, never changes order/duration
const SCENE_TEMPLATES: Pick<ScriptScene, 'id' | 'title' | 'duration'>[] = [
  { id: 'scene1', title: 'Hook',        duration: 5 },
  { id: 'scene2', title: 'Problem',     duration: 7 },
  { id: 'scene3', title: 'Solution',    duration: 7 },
  { id: 'scene4', title: 'Features',    duration: 6 },
  { id: 'scene5', title: 'Get Started', duration: 5 },
]

export const TOTAL_DURATION_SECONDS = SCENE_TEMPLATES.reduce((s, sc) => s + sc.duration, 0)

export async function generateVideoScript(repoData: GitHubRepoData): Promise<ScriptScene[]> {
  const prompt = `You are an elite creative director writing a 30-second product launch video script for a GitHub repo.

Think: Apple launch energy. Linear.app aesthetic. Viral YC startup video.
Every word must earn its place. Max 6 words per headline.

Repository:
- Name: ${repoData.repo}
- Description: ${repoData.description || 'No description'}
- Language: ${repoData.language}
- Stars: ${repoData.stars}
- Topics: ${repoData.topics.join(', ')}
- README: ${repoData.readme.slice(0, 600)}

Generate content for EXACTLY these 5 scenes in this EXACT order:

scene1 "Hook" (5s) — Pattern interrupt. One bold claim. Make someone stop scrolling.
scene2 "Problem" (7s) — The painful reality developers face without this. Be specific and felt.
scene3 "Solution" (7s) — How ${repoData.repo} obliterates that problem. The aha moment.
scene4 "Features" (6s) — Exactly 4 rapid-fire killer features. Short, punchy, specific.
scene5 "Get Started" (5s) — The CTA. Clear action. Mention stars and language.

Return ONLY a JSON array of 5 objects. Each object:
{
  "id": "scene1",                          // FIXED — do not change
  "headline": "2-5 word bold display text",  // shown BIG on screen, max 6 words
  "subtext": "One supporting sentence.",     // smaller text below headline
  "bullets": ["feature 1","feature 2","feature 3","feature 4"],  // ONLY for scene4, else omit or []
  "narrative": "Full spoken narration."      // 20-35 words
}

Rules:
- headline: SHORT and PUNCHY. Max 6 words. No punctuation except "—".
- subtext: one clean sentence, no filler words
- bullets (scene4 only): exactly 4 items, each 2-5 words, specific features not generic claims
- narrative: energetic spoken words, present tense, active voice

Return ONLY the JSON array. No markdown fences, no extra text.`

  try {
    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt,
      temperature: 0.65,
      maxOutputTokens: 900,
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
