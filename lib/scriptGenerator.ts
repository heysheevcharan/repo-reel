import { generateText } from 'ai'
import { GitHubRepoData } from './github'
import type { ScriptScene, SceneDirective } from './types'
import { getDictionaryForPrompt, TEMPLATE_DICT, getDictEntry } from './remotion/templateDictionary'

export type { ScriptScene }

// ─── Legacy Pipeline (used by 'launch' and 'kinetic' templates) ───────────────

const SCENE_TEMPLATES: Pick<ScriptScene, 'id' | 'title' | 'duration'>[] = [
  { id: 'scene1', title: 'Hook',        duration: 4 },
  { id: 'scene2', title: 'Problem',     duration: 5 },
  { id: 'scene3', title: 'Solution',    duration: 5 },
  { id: 'scene4', title: 'Features',    duration: 5 },
  { id: 'scene5', title: 'Get Started', duration: 3 },
]

export const TOTAL_DURATION_SECONDS = SCENE_TEMPLATES.reduce((s, sc) => s + sc.duration, 0)

export async function generateVideoScript(repoData: GitHubRepoData): Promise<ScriptScene[]> {
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
  subtext: One sharp sentence — who this is for or what it replaces.

scene2 "Problem" (5s)
  headline: 3–5 words. The specific pain this repo fixes.
  subtext: One sentence that makes the reader feel the frustration.

scene3 "Solution" (5s)
  headline: 2–4 words. How ${repoData.repo} kills that pain. Active. Present tense.
  subtext: One sentence that explains the mechanism, not just the benefit.

scene4 "Features" (5s)
  bullets: Exactly 4 items. Each 2–4 words.
  headline: 3–5 words that frame the list.
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

// ─── Multi-Template Pipeline ──────────────────────────────────────────────────

/**
 * generateMultiTemplateScript
 *
 * Uses gpt-4o to produce an array of SceneDirective objects where each scene
 * is assigned a specific Remotion template from the TEMPLATE_DICT, complete
 * with all the template-specific props filled in with repo-appropriate content.
 *
 * The AI acts as a video director:
 *  1. It reads the repo data
 *  2. It reads the template dictionary (what templates exist, what props they have)
 *  3. It selects the best template for each narrative beat
 *  4. It fills in all required props with creative, specific content
 */
export async function generateMultiTemplateScript(repoData: GitHubRepoData): Promise<SceneDirective[]> {
  const installCommand = repoData.packageJson?.name
    ? (repoData.packageJson.bin ? `npx ${repoData.packageJson.name}` : `npm install ${repoData.packageJson.name}`)
    : repoData.readme.match(/```(?:bash|sh)?\n((?:npm|pip|cargo|go get|yarn|pnpm)[^\n]{2,50})/m)?.[1]?.trim()

  const isDevTool = ['cli', 'terminal', 'command-line', 'npm', 'package', 'library', 'framework', 'sdk', 'api'].some(
    (t) => repoData.topics.includes(t) || repoData.description?.toLowerCase().includes(t)
  )

  const templateDictJson = getDictionaryForPrompt()

  const systemPrompt = `You are an elite cinematic video director and creative technologist. Your specialty is creating 30-second launch videos for developer tools and open source projects. You have an encyclopedic knowledge of motion design principles.

You will be given:
1. A GitHub repository to create a video for
2. A dictionary of Remotion templates (animation presets) you MUST choose from

Your job: produce a JSON array of "scene directives" — one per narrative beat. For each scene, choose the most visually impactful template and fill in its props with creative, repo-specific content.

TEMPLATE SELECTION RULES:
- The video MUST use at least 5 DIFFERENT template IDs across the scenes
- Never use the same template twice unless you have 6+ scenes
- For "hook" scenes: prefer FutureOfDesign, EditorialDesign, KineticTunnel, or EnergyText
- For "problem" scenes: prefer EditorialDesign, SentenceReveal  
- For "solution" scenes: prefer TerminalShowcase (if dev/CLI tool), EnergyText, EditorialDesign
- For "features" scenes: prefer ListOfThings, SentenceReveal
- For "CTA/data" scenes: prefer GithubStars1 (if repo has stars), KineticTunnel, FutureOfDesign, TerminalTyping
- GithubStars1 should be used when the repo has social proof worth showing (any stars > 0)

CONTENT RULES:
- Be SPECIFIC to this repository — use the actual repo name, real features, real install commands
- For TerminalShowcase: make the outputBody realistic — show 3–5 lines of plausible terminal output
- For EnergyText: the 7 words should flow as a punchy phrase about the repo's value
- For SentenceReveal: words1–7 should be 7 different key concepts/features of the repo
- For ListOfThings: use relevant emojis that match the repo's domain
- Colors should match the repo's theme (you'll receive primaryColor and backgroundColor)
- All text must be SPECIFIC and POWERFUL — no generic phrases like "easy to use"

CRITICAL: Return ONLY valid JSON. No markdown, no explanation.`

  const userPrompt = `Repository:
- Name: ${repoData.repo}
- Owner: ${repoData.owner}
- Description: ${repoData.description || 'No description'}
- Language: ${repoData.language}
- Stars: ${repoData.stars.toLocaleString()} | Forks: ${repoData.forks}
- Topics: ${repoData.topics.slice(0, 10).join(', ')}
- Install command: ${installCommand ?? 'not found — use GitHub URL as CTA'}
- Is developer tool / CLI: ${isDevTool}
- README excerpt: ${repoData.readme.slice(0, 2000)}

Brand colors (use these in your color props):
- primaryColor: TBD — infer from repo language/topics
- backgroundColor: TBD — dark theme preferred

AVAILABLE TEMPLATES (DICTIONARY):
${templateDictJson}

Produce EXACTLY 5 scene directives. Return a JSON array matching this schema exactly:

[
  {
    "id": "scene1",
    "title": "Hook",
    "durationSeconds": 4,
    "templateId": "<one of the template IDs from the dictionary>",
    "templateProps": { <all required props for that template, plus any optional ones you want to set> },
    "narrative": "<20-30 word voiceover text, energetic present tense>"
  },
  {
    "id": "scene2",
    "title": "Problem",
    "durationSeconds": 5,
    "templateId": "...",
    "templateProps": { ... },
    "narrative": "..."
  },
  {
    "id": "scene3",
    "title": "Solution",
    "durationSeconds": 5,
    "templateId": "...",
    "templateProps": { ... },
    "narrative": "..."
  },
  {
    "id": "scene4",
    "title": "Features",
    "durationSeconds": 5,
    "templateId": "...",
    "templateProps": { ... },
    "narrative": "..."
  },
  {
    "id": "scene5",
    "title": "CTA",
    "durationSeconds": 4,
    "templateId": "...",
    "templateProps": { ... },
    "narrative": "..."
  }
]

Return ONLY the JSON array. No markdown fences.`

  try {
    const { text } = await generateText({
      model: 'openai/gpt-4o',
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxOutputTokens: 3000,
    })

    // Strip potential markdown fences
    const cleaned = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    const parsed: SceneDirective[] = JSON.parse(cleaned)

    // Validate: every templateId must exist in our dictionary
    const validIds = new Set(TEMPLATE_DICT.map((t) => t.id))
    const validated = parsed.map((scene, idx) => {
      if (!validIds.has(scene.templateId)) {
        console.warn(`[scriptGenerator] Unknown templateId "${scene.templateId}" in scene ${idx + 1} — falling back to FutureOfDesign`)
        scene.templateId = 'FutureOfDesign'
        scene.templateProps = {
          smallText: scene.title.toUpperCase(),
          mainText: repoData.repo,
          subText: repoData.description?.slice(0, 40) ?? 'Open Source',
        }
      }

      // Ensure all required props are present — fill in defaults for missing ones
      const dictEntry = getDictEntry(scene.templateId)
      if (dictEntry) {
        for (const [key, propDef] of Object.entries(dictEntry.props)) {
          if (propDef.required && !(key in scene.templateProps)) {
            console.warn(`[scriptGenerator] Missing required prop "${key}" for ${scene.templateId} in scene ${idx + 1}`)
            scene.templateProps[key] = propDef.defaultValue ?? ''
          }
        }
      }

      return scene
    })

    // Check template diversity — at least 4 unique templates
    const uniqueTemplates = new Set(validated.map((s) => s.templateId))
    if (uniqueTemplates.size < 3) {
      console.warn(`[scriptGenerator] Only ${uniqueTemplates.size} unique templates used — expected at least 4`)
    }

    console.log('[scriptGenerator] Multi-template scenes:', validated.map((s) => `${s.title}:${s.templateId}`).join(' | '))
    return validated
  } catch (error) {
    console.error('[scriptGenerator] generateMultiTemplateScript error:', error)
    return generateFallbackDirectives(repoData, installCommand)
  }
}

function generateFallbackDirectives(repoData: GitHubRepoData, installCommand?: string): SceneDirective[] {
  return [
    {
      id: 'scene1',
      title: 'Hook',
      durationSeconds: 4,
      templateId: 'FutureOfDesign',
      templateProps: {
        smallText: 'MEET',
        mainText: repoData.repo,
        subText: (repoData.description ?? 'Open Source').slice(0, 30).toUpperCase(),
        backgroundColor: '#0f172a',
        textColor: '#FFFFFF',
        glowColor: '#a855f7',
      },
      narrative: `${repoData.repo} — the ${repoData.language} project redefining what's possible.`,
    },
    {
      id: 'scene2',
      title: 'Problem',
      durationSeconds: 5,
      templateId: 'EditorialDesign',
      templateProps: {
        smallText: 'THE PROBLEM',
        mainText: 'friction',
        subText: 'SLOWING YOUR WORKFLOW DOWN',
        backgroundColor: '#0a0a0a',
        textColor: '#FFFFFF',
      },
      narrative: `Every developer knows the frustration. Manual work, broken configs, wasted time.`,
    },
    {
      id: 'scene3',
      title: 'Solution',
      durationSeconds: 5,
      templateId: 'EnergyText',
      templateProps: {
        beText: 'BUILD',
        theText: 'WITH',
        mainWord: repoData.repo.toUpperCase(),
        youText: 'NO',
        wantText: 'SETUP',
        toText: 'NO',
        attractText: 'FRICTION',
        backgroundColor: '#ffffff',
        textColor: '#000000',
      },
      narrative: `${repoData.repo} eliminates the friction. Works out of the box, instantly.`,
    },
    {
      id: 'scene4',
      title: 'Features',
      durationSeconds: 5,
      templateId: 'ListOfThings',
      templateProps: {
        venue1Icon: '⚡',
        venue1Label: 'Zero config',
        venue2Icon: '🔒',
        venue2Label: 'Secure by default',
        venue3Icon: '📦',
        venue3Label: 'One-line install',
        venue4Icon: '🌍',
        venue4Label: 'Open source',
        backgroundColor: '#ffffff',
        textColor: '#111827',
        accentColor: '#6366f1',
      },
      narrative: `Zero config. Secure by default. One-line install. Open source and actively maintained.`,
    },
    {
      id: 'scene5',
      title: 'CTA',
      durationSeconds: 4,
      templateId: 'GithubStars1',
      templateProps: {
        repoName: `${repoData.owner}/${repoData.repo}`,
        targetStars: repoData.stars || 0,
        backgroundColor: '#ffffff',
        lineColor: '#6366f1',
        textColor: '#1a1a1a',
      },
      narrative: installCommand ? `Run ${installCommand} and start building in seconds.` : `Star it on GitHub and join the community.`,
    },
  ]
}
