import { Scene } from '@/lib/types'

export async function POST(request: Request) {
  const { scenes } = await request.json()

  // Simulate 3 second rendering time
  await new Promise((resolve) => setTimeout(resolve, 3000))

  // Return mock video URL
  const videoUrl = '/mock-video.mp4'

  return Response.json({ videoUrl })
}
