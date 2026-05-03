import { analyzeGitHubRepo } from '@/lib/github'
import { generateVideoScript, generateMultiTemplateScript } from '@/lib/scriptGenerator'
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

    // Run all three in parallel — script (legacy), multi-template directives, and theme
    const [scriptScenes, sceneDirectives, theme] = await Promise.all([
      generateVideoScript(repoData),
      generateMultiTemplateScript(repoData),
      extractProjectTheme(repoData, repoData.forks, repoData.openIssues, repoData.homepage),
    ])

    console.log('[analyze] legacy scenes:', scriptScenes.length)
    console.log('[analyze] directives:', sceneDirectives.map((s) => `${s.title}:${s.templateId}`).join(' | '))
    console.log('[analyze] theme mood:', theme.mood, '| primary:', theme.primaryColor)

    const totalDurationSeconds = scriptScenes.reduce((sum, s) => sum + s.duration, 0)

    return Response.json({
      repoName: `${repoData.owner}/${repoData.repo}`,
      repoUrl: url,
      description: repoData.description,
      stars: repoData.stars,
      language: repoData.language,
      topics: repoData.topics,
      scriptScenes,
      sceneDirectives,
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
