export interface GitHubRepoData {
  owner: string
  repo: string
  url: string
  description: string
  stars: number
  forks: number
  openIssues: number
  language: string
  topics: string[]
  homepage?: string
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

async function fetchGitHubAPI(endpoint: string, token?: string): Promise<any> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (token) headers.Authorization = `token ${token}`

  const response = await fetch(`https://api.github.com${endpoint}`, { headers })
  if (!response.ok) {
    if (response.status === 404) throw new Error('Repository not found')
    throw new Error(`GitHub API error: ${response.status}`)
  }
  return response.json()
}

async function fetchRaw(owner: string, repo: string, file: string): Promise<string | null> {
  for (const branch of ['main', 'master']) {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file}`)
      if (res.ok) return res.text()
    } catch {}
  }
  return null
}

export async function analyzeGitHubRepo(url: string, token?: string): Promise<GitHubRepoData> {
  const { owner, repo } = parseGitHubUrl(url)
  const baseUrl = `/repos/${owner}/${repo}`

  const repoData = await fetchGitHubAPI(baseUrl, token)

  // Fetch README and package.json in parallel
  const [readmeText, pkgText] = await Promise.all([
    fetchRaw(owner, repo, 'README.md'),
    fetchRaw(owner, repo, 'package.json'),
  ])

  const readme = readmeText ?? ''
  let packageJson: Record<string, any> = {}
  if (pkgText) {
    try { packageJson = JSON.parse(pkgText) } catch {}
  }

  const recentActivity = {
    commits: repoData.pushed_at ? 1 : 0,
    contributors: repoData.subscribers_count || 0,
    lastUpdate: repoData.pushed_at || new Date().toISOString(),
  }

  return {
    owner,
    repo,
    url,
    description: repoData.description || '',
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    openIssues: repoData.open_issues_count || 0,
    language: repoData.language || 'Unknown',
    topics: repoData.topics || [],
    homepage: repoData.homepage || undefined,
    readme,
    packageJson,
    recentActivity,
  }
}
