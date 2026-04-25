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
    const { scenes, repoName, repoUrl } = await request.json()

    if (!scenes || !Array.isArray(scenes)) {
      return Response.json({ error: 'Scenes required' }, { status: 400 })
    }

    const result = await renderVideo(scenes, repoName, repoUrl)

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
