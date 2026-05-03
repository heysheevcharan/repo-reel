import path from 'path'
import fs from 'fs'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import { ScriptScene } from './scriptGenerator'
import { ProjectTheme, AudioConfig, SceneDirective } from './types'
import { getTemplateOrDefault } from './remotion/registry'
import { calcMultiTemplateDurationInFrames } from './remotion/MultiTemplateComposition'

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

const FPS = 30

export async function renderVideo(
  scenes: ScriptScene[],
  repoName: string,
  repoUrl: string,
  templateId: string = 'launch',
  theme?: ProjectTheme,
  audioConfig?: AudioConfig,
  sceneDirectives?: SceneDirective[]
): Promise<RenderResult> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const outputFile = path.join(OUTPUT_DIR, `${repoName.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.mp4`)
  const bundled = await getBundleUrl()

  // ─── Multi-template pipeline ────────────────────────────────────────────────
  if (templateId === 'multiTemplate' && sceneDirectives?.length) {
    const durationInFrames = calcMultiTemplateDurationInFrames(sceneDirectives, FPS)
    const inputProps = { sceneDirectives, audioConfig }

    const composition = await selectComposition({
      serveUrl: bundled,
      id: 'multiTemplate',
      inputProps,
    })

    await renderMedia({
      composition: {
        ...composition,
        durationInFrames,
        width: 1920,
        height: 1080,
        defaultProps: inputProps,
      },
      serveUrl: bundled,
      codec: 'h264',
      outputLocation: outputFile,
      inputProps,
      chromiumOptions: { disableWebSecurity: true },
    })

    const totalDuration = sceneDirectives.reduce((sum, s) => sum + s.durationSeconds, 0)
    return { videoUrl: `/videos/${path.basename(outputFile)}`, duration: totalDuration, format: 'mp4' }
  }

  // ─── Legacy pipeline ────────────────────────────────────────────────────────
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0)
  const template = getTemplateOrDefault(templateId)
  const durationInFrames = template.calculateDuration(scenes, FPS)
  const compositionId = template.id

  const inputProps = { scenes, repoName, repoUrl, theme, audioConfig }

  const composition = await selectComposition({
    serveUrl: bundled,
    id: compositionId,
    inputProps,
  })

  await renderMedia({
    composition: {
      ...composition,
      durationInFrames,
      width: 1920,
      height: 1080,
      defaultProps: inputProps,
    },
    serveUrl: bundled,
    codec: 'h264',
    outputLocation: outputFile,
    inputProps,
    chromiumOptions: { disableWebSecurity: true },
  })

  return {
    videoUrl: `/videos/${path.basename(outputFile)}`,
    duration: totalDuration,
    format: 'mp4',
  }
}
