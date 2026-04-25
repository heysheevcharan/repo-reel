import { analyzeGitHubRepo } from '@/lib/github'
import { generateVideoScript } from '@/lib/scriptGenerator'
import { extractProjectTheme } from '@/lib/themeExtractor'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return Response.json({ error: 'URL required' }, { status: 400 })
    }

    console.log('[analyze] fetching repo:', url)
    const repoData = await analyzeGitHubRepo(url)
    console.log('[analyze] repo fetched:', repoData.repo)

    // Run script generation and theme extraction in parallel
    const [scriptScenes, theme] = await Promise.all([
      generateVideoScript(repoData),
      extractProjectTheme(repoData, repoData.forks, repoData.openIssues, repoData.homepage),
    ])

    console.log('[analyze] scenes:', scriptScenes.length, '| mood:', theme.mood, '| color:', theme.primaryColor)

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
      theme,
    })
  } catch (error: any) {
    console.error('[analyze] error:', error)
    return Response.json(
      { error: error.message || 'Failed to analyze repository' },
      { status: 500 }
    )
  }
}
