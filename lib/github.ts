export interface GitHubRepoData {
  owner: string
  repo: string
  url: string
  description: string
  stars: number
  language: string
  topics: string[]
  readme: string
  packageJson: Record<string, any>
  recentActivity: {
    commits: number
    contributors: number
    lastUpdate: string
  }
}

function parseGitHubUrl(url: string): { owner: string; repo: string } {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/i)
  if (!match) throw new Error('Invalid GitHub URL')
  return { owner: match[1], repo: match[2] }
}

async function fetchGitHubAPI(
  endpoint: string,
  token?: string
): Promise<any> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3.raw',
  }

  if (token) {
    headers.Authorization = `token ${token}`
  }

  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers,
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Repository not found')
    }
    throw new Error(`GitHub API error: ${response.status}`)
  }

  return response.json()
}

export async function analyzeGitHubRepo(
  url: string,
  token?: string
): Promise<GitHubRepoData> {
  const { owner, repo } = parseGitHubUrl(url)
  const baseUrl = `/repos/${owner}/${repo}`

  try {
    // Fetch repo details
    const repoData = await fetchGitHubAPI(baseUrl, token)

    // Fetch README
    let readme = ''
    try {
      const readmeResponse = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`
      )
      if (!readmeResponse.ok) {
        const readmeResponse2 = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`
        )
        if (readmeResponse2.ok) {
          readme = await readmeResponse2.text()
        }
      } else {
        readme = await readmeResponse.text()
      }
    } catch (e) {
      console.log('[v0] README fetch failed, continuing without it')
    }

    // Fetch package.json
    let packageJson = {}
    try {
      const pkgResponse = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/main/package.json`
      )
      if (!pkgResponse.ok) {
        const pkgResponse2 = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/master/package.json`
        )
        if (pkgResponse2.ok) {
          packageJson = await pkgResponse2.json()
        }
      } else {
        packageJson = await pkgResponse.json()
      }
    } catch (e) {
      console.log('[v0] package.json fetch failed, continuing without it')
    }

    // Fetch recent commits
    const commitsData = await fetchGitHubAPI(
      `${baseUrl}/commits?per_page=1`,
      token
    )
    const recentActivity = {
      commits: repoData.pushed_at ? 1 : 0,
      contributors: repoData.watchers_count || 0,
      lastUpdate: repoData.pushed_at || new Date().toISOString(),
    }

    return {
      owner,
      repo,
      url,
      description: repoData.description || '',
      stars: repoData.stargazers_count || 0,
      language: repoData.language || 'Unknown',
      topics: repoData.topics || [],
      readme,
      packageJson,
      recentActivity,
    }
  } catch (error) {
    console.error('[v0] GitHub analysis error:', error)
    throw error
  }
}
