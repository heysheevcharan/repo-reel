import { bufferMockData } from '@/lib/mockData'
import { RepoData } from '@/lib/types'

export async function POST(request: Request) {
  const { url } = await request.json()

  // Simulate 12 second processing time
  await new Promise((resolve) => setTimeout(resolve, 12000))

  // Return mock data for Buffer repo
  // In a real implementation, this would analyze the actual GitHub repo
  const repoData: RepoData = bufferMockData

  return Response.json(repoData)
}
