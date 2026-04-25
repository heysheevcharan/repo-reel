import { generateText } from 'ai'
import { GitHubRepoData } from './github'
import { LANGUAGE_COLORS } from './languageColors'
import { ProjectTheme } from './types'

// Fetch a URL and return it as a base64 data URL (for passing to Remotion)
async function toDataUrl(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RepoReel/1.0)' },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return undefined
    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const contentType = res.headers.get('content-type') ?? 'image/png'
    return `data:${contentType};base64,${base64}`
  } catch {
    return undefined
  }
}

async function scrapeMetaTags(url: string): Promise<{ themeColor?: string; ogImage?: string }> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RepoReel/1.0)' },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return {}
    const html = await res.text()

    const tcMatch =
      html.match(/name=["']theme-color["'][^>]+content=["']([#\w()%, ]+)["']/i) ??
      html.match(/content=["']([#\w()%, ]+)["'][^>]+name=["']theme-color["']/i)

    const ogMatch =
      html.match(/property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/content=["']([^"']+)["'][^>]+property=["']og:image["']/i)

    return { themeColor: tcMatch?.[1], ogImage: ogMatch?.[1] }
  } catch {
    return {}
  }
}

const BADGE_PATTERNS = [
  'shields.io', 'badge.fury.io', 'badgen.net', 'badge.svg',
  'github.com/actions', 'github.com/workflows', 'circleci.com',
  'travis-ci', 'codecov.io', 'coveralls.io', 'snyk.io',
  'buymeacoffee', 'ko-fi', 'patreon', '?style=', '?branch=',
]

function isBadgeUrl(url: string): boolean {
  const lower = url.toLowerCase()
  return BADGE_PATTERNS.some(p => lower.includes(p))
}

function resolveReadmeImageUrl(src: string, owner: string, repo: string): string {
  if (src.startsWith('http://') || src.startsWith('https://')) return src
  // Relative path → raw.githubusercontent.com
  const clean = src.replace(/^\.?\//, '')
  return `https://raw.githubusercontent.com/${owner}/${repo}/main/${clean}`
}

async function extractLogoFromReadme(
  readme: string,
  owner: string,
  repo: string
): Promise<string | undefined> {
  // Only scan the first 40 lines — logos are always at the top
  const topSection = readme.split('\n').slice(0, 40).join('\n')

  const candidates: string[] = []

  // Match markdown images: ![alt](url)
  const mdMatches = [...topSection.matchAll(/!\[[^\]]*\]\(([^)\s"]+)/g)]
  for (const m of mdMatches) candidates.push(m[1])

  // Match HTML img tags: <img src="url"
  const htmlMatches = [...topSection.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)]
  for (const m of htmlMatches) candidates.push(m[1])

  for (const raw of candidates) {
    if (isBadgeUrl(raw)) continue
    // Prefer known logo-like filenames
    const lower = raw.toLowerCase()
    const isLikelyLogo =
      lower.includes('logo') ||
      lower.includes('icon') ||
      lower.includes('banner') ||
      lower.endsWith('.svg') ||
      lower.endsWith('.png') ||
      lower.endsWith('.jpg') ||
      lower.endsWith('.gif') ||
      lower.endsWith('.webp')
    if (!isLikelyLogo) continue

    const resolved = resolveReadmeImageUrl(raw, owner, repo)
    const dataUrl = await toDataUrl(resolved)
    if (dataUrl) return dataUrl
  }

  // Second pass: accept any non-badge image if no logo-named one found
  for (const raw of candidates) {
    if (isBadgeUrl(raw)) continue
    const resolved = resolveReadmeImageUrl(raw, owner, repo)
    const dataUrl = await toDataUrl(resolved)
    if (dataUrl) return dataUrl
  }

  return undefined
}

function extractInstallCommand(readme: string, pkg: Record<string, any>, language: string): string | undefined {
  // Derive from package.json
  if (pkg?.name) {
    const name = pkg.name as string
    if (pkg.bin) return `npx ${name}`
    return `npm install ${name}`
  }

  // Scan README code blocks
  const patterns: RegExp[] = [
    /```(?:bash|sh|shell|zsh|console)?\n((?:npm|yarn|pnpm) (?:install|add|i) [^\n]{2,50})/m,
    /```(?:bash|sh|shell|zsh|console)?\n(pip(?:3)? install [^\n]{2,50})/m,
    /```(?:bash|sh|shell|zsh|console)?\n(cargo add [^\n]{2,50})/m,
    /```(?:bash|sh|shell|zsh|console)?\n(go get [^\n]{2,50})/m,
    /```(?:bash|sh|shell|zsh|console)?\n(brew install [^\n]{2,50})/m,
    /`(npm install [^`\n]{2,40})`/,
    /`(pip install [^`\n]{2,40})`/,
    /`(cargo add [^`\n]{2,40})`/,
    /`(go get [^`\n]{2,40})`/,
  ]

  for (const p of patterns) {
    const m = readme.match(p)
    if (m) return m[1].trim()
  }
  return undefined
}

async function inferMoodAndTheme(data: GitHubRepoData): Promise<{
  mood: ProjectTheme['mood']
  isDark: boolean
}> {
  try {
    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt: `Analyze this GitHub repository and output a JSON object describing its visual personality.

Name: ${data.repo}
Description: ${data.description}
Language: ${data.language}
Topics: ${data.topics.join(', ')}
README excerpt: ${data.readme.slice(0, 400)}

Return ONLY valid JSON with exactly these two fields:
{
  "mood": one of "minimal" | "energetic" | "technical" | "playful" | "enterprise",
  "isDark": true or false
}

mood guide:
- minimal: utility tools, developer productivity, clean APIs
- energetic: exciting, fast, viral, gaming, social media
- technical: systems programming, CLI tools, infra, databases, compilers
- playful: creative tools, design, art, games, fun experiments
- enterprise: business software, analytics, security, compliance

isDark: true if the project targets developers or has a dark/code aesthetic. false if it's a consumer-facing product, design tool, or light-themed UI library.

Return ONLY the JSON object, no markdown fences.`,
      temperature: 0.1,
      maxOutputTokens: 60,
    })
    const parsed = JSON.parse(text.trim())
    return {
      mood: parsed.mood ?? 'minimal',
      isDark: parsed.isDark ?? true,
    }
  } catch {
    // Heuristic fallback
    const techTopics = ['cli', 'terminal', 'compiler', 'database', 'infrastructure', 'systems', 'rust', 'c++']
    const playfulTopics = ['game', 'fun', 'creative', 'art', 'music']
    const enterpriseTopics = ['enterprise', 'security', 'compliance', 'analytics', 'saas']

    const mood = data.topics.some(t => techTopics.includes(t))
      ? 'technical'
      : data.topics.some(t => playfulTopics.includes(t))
      ? 'playful'
      : data.topics.some(t => enterpriseTopics.includes(t))
      ? 'enterprise'
      : 'minimal'

    return { mood, isDark: true }
  }
}

export async function extractProjectTheme(
  repoData: GitHubRepoData,
  forks: number,
  openIssues: number,
  homepage?: string
): Promise<ProjectTheme> {
  const avatarRawUrl = `https://github.com/${repoData.owner}.png`

  // Run everything in parallel
  const [githubMeta, websiteMeta, moodResult, avatarDataUrl, logoDataUrl] = await Promise.all([
    scrapeMetaTags(`https://github.com/${repoData.owner}/${repoData.repo}`),
    homepage ? scrapeMetaTags(homepage) : Promise.resolve({}),
    inferMoodAndTheme(repoData),
    toDataUrl(avatarRawUrl),
    extractLogoFromReadme(repoData.readme, repoData.owner, repoData.repo),
  ])

  // Resolve social preview as data URL if found
  const socialPreviewDataUrl = githubMeta.ogImage
    ? await toDataUrl(githubMeta.ogImage)
    : undefined

  // Color priority: website theme-color → language color → neutral
  const primaryColor =
    (websiteMeta.themeColor && websiteMeta.themeColor.startsWith('#'))
      ? websiteMeta.themeColor
      : LANGUAGE_COLORS[repoData.language] ?? '#6e7681'

  const isDark = moodResult.isDark
  const backgroundColor = isDark ? '#060606' : '#f8f8f8'

  const installCommand = extractInstallCommand(
    repoData.readme,
    repoData.packageJson,
    repoData.language
  )

  return {
    primaryColor,
    backgroundColor,
    isDark,
    mood: moodResult.mood,
    avatarUrl: avatarDataUrl ?? avatarRawUrl,
    logoUrl: logoDataUrl,             // README-extracted logo (preferred for video)
    socialPreviewUrl: socialPreviewDataUrl,
    installCommand,
    websiteUrl: homepage,
    forks,
    openIssues,
  }
}
