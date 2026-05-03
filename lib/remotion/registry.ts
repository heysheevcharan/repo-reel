import React from 'react'
import type { ScriptScene } from '../scriptGenerator'
import type { VideoProps } from './VideoComposition'
import { calcDurationInFrames, calcKineticDurationInFrames } from './duration'

// ─── Template Definition ──────────────────────────────────────────────────────
//
// Every template must:
//  1. Accept the standard VideoProps (scenes, repoName, repoUrl, theme?, audioConfig?)
//  2. Provide a function to calculate its total duration in frames from scenes + fps
//
// This contract means any template can be dropped into the Player or server renderer
// without any call-site changes.

export interface TemplateDefinition {
  id: string
  label: string
  desc: string
  category: 'narrative' | 'kinetic' | 'editorial' | 'cinematic'
  /** Lazily import the composition component */
  loadComponent: () => Promise<React.ComponentType<VideoProps>>
  calculateDuration: (scenes: ScriptScene[], fps: number) => number
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const TEMPLATE_REGISTRY: TemplateDefinition[] = [
  {
    id: 'launch',
    label: 'Launch Video',
    desc: 'Cinematic, glowing scenes with word-by-word reveals',
    category: 'cinematic',
    loadComponent: () =>
      import('./VideoComposition').then((m) => m.RepoReelVideo as React.ComponentType<VideoProps>),
    calculateDuration: calcDurationInFrames,
  },
  {
    id: 'kinetic',
    label: 'Kinetic Type',
    desc: 'Bold words, pure black — one word slams at a time',
    category: 'kinetic',
    loadComponent: () =>
      import('./KineticComposition').then((m) => m.KineticVideo as React.ComponentType<VideoProps>),
    calculateDuration: calcKineticDurationInFrames,
  },
  {
    id: 'futureOfDesign',
    label: 'Future of Design',
    desc: 'Blur-slide reveals with italic serif and glow — editorial luxury feel',
    category: 'editorial',
    loadComponent: () =>
      import('./adapters/FutureOfDesignAdapter').then((m) => m.FutureOfDesignAdapter as React.ComponentType<VideoProps>),
    calculateDuration: calcDurationInFrames,
  },
  {
    id: 'editorialDesign',
    label: 'Editorial Minimalist',
    desc: 'Masked text reveals with Ken Burns background — left-aligned drama',
    category: 'editorial',
    loadComponent: () =>
      import('./adapters/EditorialDesignAdapter').then((m) => m.EditorialDesignAdapter as React.ComponentType<VideoProps>),
    calculateDuration: calcDurationInFrames,
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
