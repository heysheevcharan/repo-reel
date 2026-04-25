import { analyzeGitHubRepo } from '@/lib/github'
import { generateVideoScript } from '@/lib/scriptGenerator'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return Response.json({ error: 'URL required' }, { status: 400 })
    }

    console.log('[v0] Analyzing GitHub repo:', url)

    // Analyze the GitHub repository
    const repoData = await analyzeGitHubRepo(url)
    console.log('[v0] Repo analysis complete:', repoData.repo)

    // Generate the video script using AI
    const scriptScenes = await generateVideoScript(repoData)
    console.log('[v0] Script generated with', scriptScenes.length, 'scenes')

    // Calculate total duration
    const totalDurationSeconds = scriptScenes.reduce((sum, s) => sum + s.duration, 0)

    return Response.json({
      repoName: `${repoData.owner}/${repoData.repo}`,
      repoUrl: url,
      description: repoData.description,
      stars: repoData.stars,
      language: repoData.language,
      topics: repoData.topics,
      scriptScenes,
      totalDurationSeconds,
      analysisTimestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[v0] Analyze API error:', error)
    return Response.json(
      { error: error.message || 'Failed to analyze repository' },
      { status: 500 }
    )
  }
}
