import { renderVideo } from '@/lib/videoRenderer'

export async function POST(request: Request) {
  try {
    const { scenes, repoName, repoUrl } = await request.json()

    if (!scenes || !Array.isArray(scenes)) {
      return Response.json({ error: 'Scenes required' }, { status: 400 })
    }

    console.log('[v0] Starting video render for:', repoName)

    // Render the video
    const result = await renderVideo(scenes, repoName, repoUrl)

    return Response.json({
      success: true,
      videoUrl: result.videoUrl,
      duration: result.duration,
      format: result.format,
    })
  } catch (error: any) {
    console.error('[v0] Render API error:', error)
    return Response.json(
      { error: error.message || 'Failed to render video' },
      { status: 500 }
    )
  }
}
