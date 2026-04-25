import { generateText } from 'ai'
import { GitHubRepoData } from './github'

export interface ScriptScene {
  id: string
  title: string
  duration: number
  narrative: string
  visuals: string
}

// Fixed scene structure — titles, order, and durations are never changed by AI
const SCENE_TEMPLATES: Omit<ScriptScene, 'narrative' | 'visuals'>[] = [
  { id: 'scene1', title: 'Hook',       duration: 5 },
  { id: 'scene2', title: 'Problem',    duration: 7 },
  { id: 'scene3', title: 'Solution',   duration: 7 },
  { id: 'scene4', title: 'Features',   duration: 6 },
  { id: 'scene5', title: 'Get Started', duration: 5 },
]

export const TOTAL_DURATION_SECONDS = SCENE_TEMPLATES.reduce((s, sc) => s + sc.duration, 0) // 30s

export async function generateVideoScript(
  repoData: GitHubRepoData
): Promise<ScriptScene[]> {
  const prompt = `You are writing narration for a 30-second GitHub repo video.

The video has EXACTLY 5 scenes in this FIXED order. Do NOT change the scene IDs, titles, or order:

1. scene1 "Hook" (5s) — One punchy sentence that grabs attention. Name the project and its core value.
2. scene2 "Problem" (7s) — Describe the pain point developers face WITHOUT this tool. Be specific and relatable.
3. scene3 "Solution" (7s) — Explain how ${repoData.repo} solves that problem. What does it actually do?
4. scene4 "Features" (6s) — 2-3 standout features. Be concrete, not generic.
5. scene5 "Get Started" (5s) — How to install/use it. Mention stars (${repoData.stars}) and language (${repoData.language}).

Repository context:
- Name: ${repoData.repo}
- Description: ${repoData.description || 'No description'}
- Language: ${repoData.language}
- Stars: ${repoData.stars}
- Topics: ${repoData.topics.join(', ')}
- README: ${repoData.readme.slice(0, 800)}
${repoData.packageJson.description ? `- Package description: ${repoData.packageJson.description}` : ''}

Return ONLY a JSON array of exactly 5 objects. Each object must have:
- id: exactly "scene1" through "scene5" (do NOT change these)
- narrative: spoken narration for that scene (20-40 words, punchy and direct)
- visuals: one short sentence describing what to show on screen

Example format:
[
  {"id":"scene1","narrative":"...","visuals":"..."},
  {"id":"scene2","narrative":"...","visuals":"..."},
  {"id":"scene3","narrative":"...","visuals":"..."},
  {"id":"scene4","narrative":"...","visuals":"..."},
  {"id":"scene5","narrative":"...","visuals":"..."}
]

Return ONLY the JSON array. No markdown, no extra text.`

  try {
    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt,
      temperature: 0.6,
      maxOutputTokens: 800,
    })

    const parsed: { id: string; narrative: string; visuals: string }[] =
      JSON.parse(text.trim())

    // Merge AI narratives into hardcoded scene templates — structure is always enforced
    return SCENE_TEMPLATES.map((template) => {
      const aiScene = parsed.find((s) => s.id === template.id)
      return {
        ...template,
        narrative: aiScene?.narrative || fallbackNarrative(template.id, repoData),
        visuals: aiScene?.visuals || '',
      }
    })
  } catch (error) {
    console.error('[scriptGenerator] error:', error)
    return generateFallbackScript(repoData)
  }
}

function fallbackNarrative(id: string, repoData: GitHubRepoData): string {
  switch (id) {
    case 'scene1': return `Meet ${repoData.repo} — the ${repoData.language} project with ${repoData.stars} stars that every developer needs.`
    case 'scene2': return `Developers waste hours on repetitive setup and boilerplate. There has to be a better way.`
    case 'scene3': return `${repoData.repo} ${repoData.description || 'streamlines your entire workflow so you can focus on what matters.'}`
    case 'scene4': return `Fast, well-documented, and actively maintained. It handles the hard parts so you don't have to.`
    case 'scene5': return `Star it on GitHub, run the install command, and start building in minutes. Join ${repoData.stars} developers already using it.`
    default: return ''
  }
}

function generateFallbackScript(repoData: GitHubRepoData): ScriptScene[] {
  return SCENE_TEMPLATES.map((template) => ({
    ...template,
    narrative: fallbackNarrative(template.id, repoData),
    visuals: '',
  }))
}
