import type { ScriptScene } from '../scriptGenerator'

// Keep in sync with TRANSITION_FRAMES in VideoComposition.tsx
const LAUNCH_TRANSITION_FRAMES = 6
// Keep in sync with KINETIC_TRANSITION_FRAMES in KineticComposition.tsx
const KINETIC_TRANSITION_FRAMES = 6

export function calcDurationInFrames(scenes: any[], fps: number): number {
  if (!scenes || !Array.isArray(scenes) || scenes.length === 0) return 30
  const totalSceneFrames = scenes.reduce((s, sc) => {
    const d = sc.durationSeconds || sc.duration || 5
    return s + d * fps
  }, 0)
  return Math.max(30, totalSceneFrames - (scenes.length - 1) * LAUNCH_TRANSITION_FRAMES)
}

export function calcKineticDurationInFrames(scenes: any[], fps: number): number {
  if (!scenes || !Array.isArray(scenes) || scenes.length === 0) return 30
  const totalSceneFrames = scenes.reduce((s, sc) => {
    const d = sc.durationSeconds || sc.duration || 5
    return s + d * fps
  }, 0)
  return Math.max(30, totalSceneFrames - (scenes.length - 1) * KINETIC_TRANSITION_FRAMES)
}
