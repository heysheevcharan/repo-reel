import { renderVideo, warmBundle } from '@/lib/videoRenderer'

// Warm the bundle cache on first load (no-op when Chrome isn't available)
warmBundle()

export async function POST(request: Request) {
  // Vercel serverless has no Chrome binary — rendering must be self-hosted
  if (process.env.VERCEL) {
    return Response.json(
      { error: 'Video rendering requires a self-hosted server. Deploy locally or on a VPS to use this feature.' },
      { status: 501 }
    )
  }

  try {
    const { scenes, repoName, repoUrl, template } = await request.json()

    if (!scenes || !Array.isArray(scenes)) {
      return Response.json({ error: 'Scenes required' }, { status: 400 })
    }

    // Back-fill headline for scenes analyzed before the field was added
    const normalizedScenes = scenes.map((s: any) => ({
      ...s,
      headline: s.headline || s.narrative?.split(' ').slice(0, 5).join(' ') || s.title,
      subtext: s.subtext ?? '',
      bullets: s.bullets ?? [],
    }))

    const result = await renderVideo(normalizedScenes, repoName, repoUrl, template ?? 'launch')

    return Response.json({
      success: true,
      videoUrl: result.videoUrl,
      duration: result.duration,
      format: result.format,
    })
  } catch (error: any) {
    console.error('[render] error:', error)
    return Response.json(
      { error: error.message || 'Failed to render video' },
      { status: 500 }
    )
  }
}
