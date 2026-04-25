import path from 'path'
import fs from 'fs'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import { ScriptScene } from './scriptGenerator'

export interface RenderResult {
  videoUrl: string
  duration: number
  format: 'mp4' | 'webm'
}

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'videos')

// Cache the bundle URL so webpack only runs once per server lifecycle
let cachedBundleUrl: string | null = null
let bundleInProgress: Promise<string> | null = null

export function warmBundle(): void {
  // Skip warm-up on Vercel or when Chrome is unavailable
  if (process.env.VERCEL) return
  getBundleUrl().catch(() => {})
}

async function getBundleUrl(): Promise<string> {
  if (cachedBundleUrl) return cachedBundleUrl
  if (bundleInProgress) return bundleInProgress

  const entryPoint = path.join(process.cwd(), 'lib', 'remotion', 'Root.tsx')
  bundleInProgress = bundle({ entryPoint, webpackOverride: (c) => c }).then((url) => {
    cachedBundleUrl = url
    bundleInProgress = null
    return url
  })
  return bundleInProgress
}

export async function renderVideo(
  scenes: ScriptScene[],
  repoName: string,
  repoUrl: string
): Promise<RenderResult> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const outputFile = path.join(OUTPUT_DIR, `${repoName.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.mp4`)
  const bundled = await getBundleUrl()

  const fps = 30
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0)
  const durationInFrames = totalDuration * fps

  const composition = await selectComposition({
    serveUrl: bundled,
    id: 'RepoReelVideo',
    inputProps: { scenes, repoName, repoUrl },
  })

  await renderMedia({
    composition: {
      ...composition,
      durationInFrames,
      defaultProps: { scenes, repoName, repoUrl },
    },
    serveUrl: bundled,
    codec: 'h264',
    outputLocation: outputFile,
    inputProps: { scenes, repoName, repoUrl },
    chromiumOptions: { disableWebSecurity: true },
  })

  const videoUrl = `/videos/${path.basename(outputFile)}`

  return {
    videoUrl,
    duration: totalDuration,
    format: 'mp4',
  }
}
