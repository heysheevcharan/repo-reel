import { renderVideo, warmBundle } from '@/lib/videoRenderer'

// Warm the Remotion bundle cache as soon as this route module loads
warmBundle()

export async function POST(request: Request) {
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
