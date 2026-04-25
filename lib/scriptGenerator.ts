import { generateText } from 'ai'
import { GitHubRepoData } from './github'

export interface ScriptScene {
  id: string
  title: string
  duration: number
  narrative: string
  visuals: string
}

export async function generateVideoScript(
  repoData: GitHubRepoData
): Promise<ScriptScene[]> {
  const prompt = `You are a creative video scriptwriter for a 58-second short-form video explaining GitHub repositories. 
  
The video has exactly 4 scenes, each with specific durations:
- Scene 1 (Hook): 10 seconds - Grab attention, what is this project
- Scene 2 (Problem): 15 seconds - What problem does it solve
- Scene 3 (Features): 18 seconds - Key features and why it's great
- Scene 4 (Call to Action): 15 seconds - Stars on GitHub, language, how to get started

Repository Information:
- Name: ${repoData.repo}
- Owner: ${repoData.owner}
- Description: ${repoData.description}
- Stars: ${repoData.stars}
- Language: ${repoData.language}
- Topics: ${repoData.topics.join(', ')}
- README Preview: ${repoData.readme.slice(0, 1000)}
${repoData.packageJson.description ? `- Package.json description: ${repoData.packageJson.description}` : ''}

Generate a JSON response with exactly 4 scenes. Each scene must have:
- id: "scene1", "scene2", "scene3", or "scene4"
- title: Scene title
- duration: Duration in seconds (10, 15, 18, 15 respectively)
- narrative: The exact script/dialogue to speak (50-100 words per scene)
- visuals: A short description of what visuals should be shown

Make the script engaging, punchy, and suitable for TikTok/YouTube shorts. Focus on why developers should care about this project.

Return ONLY valid JSON, no markdown, no extra text.`

  try {
    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    const parsed = JSON.parse(text)
    return parsed.scenes || parsed
  } catch (error) {
    console.error('[v0] Script generation error:', error)
    // Fallback script if AI fails
    return generateFallbackScript(repoData)
  }
}

function generateFallbackScript(repoData: GitHubRepoData): ScriptScene[] {
  return [
    {
      id: 'scene1',
      title: 'Hook',
      duration: 10,
      narrative: `Meet ${repoData.repo} – the ${repoData.language} project that's changing how developers build. With ${repoData.stars} stars on GitHub, it's exactly what you've been looking for.`,
      visuals: 'Animated title with repo name and language badge',
    },
    {
      id: 'scene2',
      title: 'Problem',
      duration: 15,
      narrative: `${repoData.description || `Building with traditional approaches is slow and repetitive. ${repoData.repo} solves this by streamlining the entire workflow.`} Developers waste time on boilerplate. Not anymore.`,
      visuals: 'Show problem visualization: frustrated developer, slow workflow',
    },
    {
      id: 'scene3',
      title: 'Features',
      duration: 18,
      narrative: `Here's what makes it special: lightning-fast performance, beautiful developer experience, and a thriving community. Whether you're a beginner or expert, it just works. The codebase is clean, well-documented, and actively maintained by passionate developers.`,
      visuals: 'Feature cards appearing: performance, DX, community, documentation',
    },
    {
      id: 'scene4',
      title: 'CTA',
      duration: 15,
      narrative: `Check out ${repoData.repo} today. ${repoData.stars} developers are already building amazing things. Star it on GitHub, read the docs, and join the community. Your next project starts here.`,
      visuals: 'GitHub repo page, star button animation, GitHub link',
    },
  ]
}
