import React from 'react'
import type { ScriptScene } from '../scriptGenerator'
import type { SceneDirective } from '../types'
import type { VideoProps } from './VideoComposition'
import { calcDurationInFrames, calcKineticDurationInFrames } from './duration'
import { calcMultiTemplateDurationInFrames } from './MultiTemplateComposition'

// ─── Template Definition ──────────────────────────────────────────────────────

export interface TemplateDefinition {
  id: string
  label: string
  desc: string
  category: 'narrative' | 'kinetic' | 'editorial' | 'cinematic' | 'multi'
  isMultiTemplate?: boolean  // true for the new multi-template pipeline
  /** Lazily import the composition component */
  loadComponent: () => Promise<React.ComponentType<any>>
  calculateDuration: (scenes: ScriptScene[] | SceneDirective[], fps: number) => number
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const TEMPLATE_REGISTRY: TemplateDefinition[] = [
  {
    id: 'multiTemplate',
    label: 'AI Director',
    desc: 'AI picks the best template for each scene — 5+ different animations stitched into one video',
    category: 'multi',
    isMultiTemplate: true,
    loadComponent: () =>
      import('./MultiTemplateComposition').then((m) => m.MultiTemplateVideo as React.ComponentType<any>),
    calculateDuration: (scenes: ScriptScene[] | SceneDirective[], fps: number) => {
      // If we have SceneDirectives use their durationSeconds, otherwise fallback
      const directives = scenes as SceneDirective[]
      if (directives[0] && 'durationSeconds' in directives[0]) {
        return calcMultiTemplateDurationInFrames(directives, fps)
      }
      return calcDurationInFrames(scenes as ScriptScene[], fps)
    },
  },
  {
    id: 'launch',
    label: 'Launch Video',
    desc: 'Cinematic, glowing scenes with word-by-word reveals',
    category: 'cinematic',
    loadComponent: () =>
      import('./VideoComposition').then((m) => m.RepoReelVideo as React.ComponentType<VideoProps>),
    calculateDuration: (scenes, fps) => calcDurationInFrames(scenes as ScriptScene[], fps),
  },
  {
    id: 'kinetic',
    label: 'Kinetic Type',
    desc: 'Bold words, pure black — one word slams at a time',
    category: 'kinetic',
    loadComponent: () =>
      import('./KineticComposition').then((m) => m.KineticVideo as React.ComponentType<VideoProps>),
    calculateDuration: (scenes, fps) => calcKineticDurationInFrames(scenes as ScriptScene[], fps),
  },
  {
    id: 'futureOfDesign',
    label: 'Future of Design',
    desc: 'Blur-slide reveals with italic serif and glow — editorial luxury feel',
    category: 'editorial',
    loadComponent: () =>
      import('./adapters/FutureOfDesignAdapter').then((m) => m.FutureOfDesignAdapter as React.ComponentType<VideoProps>),
    calculateDuration: (scenes, fps) => calcDurationInFrames(scenes as ScriptScene[], fps),
  },
  {
    id: 'editorialDesign',
    label: 'Editorial Minimalist',
    desc: 'Masked text reveals with Ken Burns background — left-aligned drama',
    category: 'editorial',
    loadComponent: () =>
      import('./adapters/EditorialDesignAdapter').then((m) => m.EditorialDesignAdapter as React.ComponentType<VideoProps>),
    calculateDuration: (scenes, fps) => calcDurationInFrames(scenes as ScriptScene[], fps),
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATE_REGISTRY.find((t) => t.id === id)
}

export function getTemplateOrDefault(id: string): TemplateDefinition {
  return getTemplate(id) ?? TEMPLATE_REGISTRY[0]
}

/** All valid template ID strings */
export type TemplateId = string
