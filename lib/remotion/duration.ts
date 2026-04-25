import type { ScriptScene } from '../scriptGenerator'

// Keep in sync with TRANSITION_FRAMES in VideoComposition.tsx
const LAUNCH_TRANSITION_FRAMES = 2
// Keep in sync with KINETIC_TRANSITION_FRAMES in KineticComposition.tsx
const KINETIC_TRANSITION_FRAMES = 2

export function calcDurationInFrames(scenes: ScriptScene[], fps: number): number {
  const totalSceneFrames = scenes.reduce((s, sc) => s + sc.duration * fps, 0)
  return totalSceneFrames - (scenes.length - 1) * LAUNCH_TRANSITION_FRAMES
}

export function calcKineticDurationInFrames(scenes: ScriptScene[], fps: number): number {
  const totalSceneFrames = scenes.reduce((s, sc) => s + sc.duration * fps, 0)
  return totalSceneFrames - (scenes.length - 1) * KINETIC_TRANSITION_FRAMES
}
