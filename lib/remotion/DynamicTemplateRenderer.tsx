'use client'

/**
 * DynamicTemplateRenderer
 *
 * Maps a templateId string → the correct React component, then renders it
 * with the provided flat props. This is the bridge between the AI's template
 * selection and the actual Remotion components.
 *
 * All 11 templates in the TEMPLATE_DICT are registered here. Components are
 * imported synchronously (not lazy) so Remotion's bundler can tree-shake properly.
 */

import React from 'react'
import { AbsoluteFill } from 'remotion'

// Core templates
import { Scene as FutureOfDesignScene } from './templates/FutureOfDesign/Scene'
import { Scene as EditorialDesignScene } from './templates/EditorialDesign/Scene'
import { Scene as KineticTunnelScene } from './templates/KineticTunnel/Scene'

// MangoGiraffe templates (all use `export default Scene` pattern with `props: any`)
// We import them as default exports
import EnergyTextScene from './templates/EnergyText/Scene'
import SentenceRevealScene from './templates/SentenceReveal/Scene'
import TerminalShowcaseScene from './templates/TerminalShowcase/Scene'
import TerminalTypingScene from './templates/TerminalTyping/Scene'
import GithubStars1Scene from './templates/GithubStars1/Scene'
import ListOfThingsScene from './templates/ListOfThings/Scene'
import ScatteredTextScene from './templates/ScatteredText/Scene'
import BarChartScene from './templates/BarChart/Scene'

// ─── Component Map ─────────────────────────────────────────────────────────────

const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  FutureOfDesign:  FutureOfDesignScene,
  EditorialDesign: EditorialDesignScene,
  KineticTunnel:   KineticTunnelScene,
  EnergyText:      EnergyTextScene,
  SentenceReveal:  SentenceRevealScene,
  TerminalShowcase: TerminalShowcaseScene,
  TerminalTyping:  TerminalTypingScene,
  GithubStars1:    GithubStars1Scene,
  ListOfThings:    ListOfThingsScene,
  ScatteredText:   ScatteredTextScene,
  BarChart:        BarChartScene,
}

export { COMPONENT_MAP }

// ─── Renderer Component ────────────────────────────────────────────────────────

interface DynamicTemplateRendererProps {
  templateId: string
  templateProps: Record<string, any>
}

export const DynamicTemplateRenderer: React.FC<DynamicTemplateRendererProps> = ({
  templateId,
  templateProps = {},
}) => {
  const Component = COMPONENT_MAP[templateId]

  if (!Component) {
    // Graceful fallback — render a black screen with the template ID for debugging
    console.warn(`[DynamicTemplateRenderer] Unknown templateId: "${templateId}"`)
    return (
      <AbsoluteFill style={{
        backgroundColor: '#0a0a0a',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'monospace',
          fontSize: 14,
        }}>
          Unknown template: {templateId}
        </div>
      </AbsoluteFill>
    )
  }

  return <Component {...templateProps} />
}
