import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

interface TextMaskProps {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  stiffness?: number
  damping?: number
}

export const TextMask: React.FC<TextMaskProps> = ({
  children,
  direction = 'up',
  delay = 0,
  stiffness = 70,
  damping = 22,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { stiffness, damping },
  })

  const getTransform = () => {
    const offset = 100
    switch (direction) {
      case 'up':   return `translateY(${interpolate(progress, [0, 1], [offset, 0])}%)`
      case 'down': return `translateY(${interpolate(progress, [0, 1], [-offset, 0])}%)`
      case 'left': return `translateX(${interpolate(progress, [0, 1], [offset, 0])}%)`
      case 'right':return `translateX(${interpolate(progress, [0, 1], [-offset, 0])}%)`
      default:     return 'none'
    }
  }

  return (
    <div style={{ overflow: 'hidden' }}>
      <div style={{ transform: getTransform(), display: 'inline-block' }}>
        {children}
      </div>
    </div>
  )
}
