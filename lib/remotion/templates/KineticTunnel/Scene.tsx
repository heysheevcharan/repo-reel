import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'

export interface KineticTunnelProps {
  text: string
  backgroundColor: string
  textColor: string
  accentColor: string
  scale: number
  animationSpeed: number
}

export const defaultKineticTunnelProps: KineticTunnelProps = {
  text: 'KINETIC TYPOGRAPHY TUNNEL ',
  backgroundColor: '#000000',
  textColor: '#FFFFFF',
  accentColor: '#007AFF',
  scale: 1,
  animationSpeed: 1.5,
}

export const Scene: React.FC<KineticTunnelProps> = ({
  text = defaultKineticTunnelProps.text,
  backgroundColor = defaultKineticTunnelProps.backgroundColor,
  textColor = defaultKineticTunnelProps.textColor,
  accentColor = defaultKineticTunnelProps.accentColor,
  scale = defaultKineticTunnelProps.scale,
  animationSpeed = defaultKineticTunnelProps.animationSpeed,
}) => {
  const frame = useCurrentFrame()
  const { width } = useVideoConfig()
  const speed = animationSpeed
  const adjustedFrame = frame * speed

  const numRings = 15
  const fullText = text.repeat(10)

  return (
    <AbsoluteFill style={{
      backgroundColor: backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      {/* Central Portal Glow */}
      <div style={{
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: '50%',
        backgroundColor: accentColor,
        filter: 'blur(40px)',
        boxShadow: `0 0 100px 50px ${accentColor}44`,
        zIndex: 0,
      }} />

      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: `scale(${scale})`,
      }}>
        {Array.from({ length: numRings }).map((_, i) => {
          const ringIndex = numRings - i
          const ringScale = Math.pow(ringIndex / numRings, 1.5)
          const ringOpacity = interpolate(ringIndex, [1, numRings], [1, 0.1])
          const ringBlur = interpolate(ringIndex, [1, numRings], [0, 10])
          const ringSpeedMultiplier = interpolate(ringIndex, [1, numRings], [2, 0.5])
          const offset = -(adjustedFrame * 10 * ringSpeedMultiplier)
          const radius = (width * 0.8) * ringScale

          return (
            <svg
              key={i}
              viewBox="0 0 1000 1000"
              style={{
                position: 'absolute',
                width: radius,
                height: radius,
                overflow: 'visible',
                opacity: ringOpacity,
                filter: `blur(${ringBlur}px)`,
                transform: `rotate(${i * 10}deg)`,
              }}
            >
              <defs>
                <path
                  id={`ringPath-${i}`}
                  d="M 500, 500 m -400, 0 a 400,400 0 1,1 800,0 a 400,400 0 1,1 -800,0"
                />
              </defs>
              <text style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: 60,
                fontWeight: 900,
                fill: textColor,
                textTransform: 'uppercase',
              }}>
                <textPath href={`#ringPath-${i}`} startOffset={`${offset}px`}>
                  {fullText}
                </textPath>
              </text>
              <text style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: 60,
                fontWeight: 900,
                fill: accentColor,
                textTransform: 'uppercase',
                opacity: 0.3,
              }}>
                <textPath href={`#ringPath-${i}`} startOffset={`${offset + 4}px`}>
                  {fullText}
                </textPath>
              </text>
            </svg>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
