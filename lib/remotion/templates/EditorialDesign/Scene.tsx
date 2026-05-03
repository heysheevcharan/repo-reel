import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion'
import { fitText } from '@remotion/layout-utils'
import React from 'react'
import { TextMask } from './Components/TextMask'

export interface EditorialDesignProps {
  smallText: string
  mainText: string
  subText: string
  textColor: string
  backgroundColor: string
  scale: number
  animationSpeed: number
}

export const defaultEditorialDesignProps: EditorialDesignProps = {
  smallText: 'THE',
  mainText: 'future',
  subText: 'OF DESIGN',
  textColor: '#FFFFFF',
  backgroundColor: '#000000',
  scale: 1,
  animationSpeed: 1,
}

const EditorialBg: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame()
  
  // Slow Ken Burns zoom + slight drift
  const scale = interpolate(frame, [0, 300], [1, 1.15], { extrapolateRight: 'clamp' })
  const driftX = Math.sin(frame * 0.01) * 20
  
  return (
    <AbsoluteFill style={{ backgroundColor: color, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        inset: -50,
        transform: `scale(${scale}) translateX(${driftX}px)`,
        background: `linear-gradient(135deg, ${color} 0%, #1a1a1a 100%)`,
      }} />
      
      {/* Subtle light leak */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.03) 0%, transparent 50%)',
        opacity: Math.sin(frame * 0.02) * 0.5 + 0.5,
      }} />
    </AbsoluteFill>
  )
}

export const Scene: React.FC<EditorialDesignProps> = ({
  smallText = defaultEditorialDesignProps.smallText,
  mainText = defaultEditorialDesignProps.mainText,
  subText = defaultEditorialDesignProps.subText,
  textColor = defaultEditorialDesignProps.textColor,
  backgroundColor = defaultEditorialDesignProps.backgroundColor,
  scale = defaultEditorialDesignProps.scale,
  animationSpeed = defaultEditorialDesignProps.animationSpeed,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()

  const speed = animationSpeed
  const adjustedFrame = frame * speed
  const minDim = Math.min(width, height)
  
  // Calculate optimized font sizes
  const mainFontFamily = 'Georgia, serif'
  const subFontFamily = 'system-ui, -apple-system, sans-serif'
  const maxLabelWidth = width * 0.75

  const { fontSize: mainFontSize } = fitText({
    text: mainText,
    fontFamily: mainFontFamily,
    withinWidth: maxLabelWidth,
    fontWeight: '400',
  })

  const { fontSize: subFontSize } = fitText({
    text: subText,
    fontFamily: subFontFamily,
    withinWidth: maxLabelWidth * 0.8,
    fontWeight: '600',
  })

  // Entrance tracking animation
  const trackingProgress = spring({
    frame: Math.max(0, adjustedFrame - 15),
    fps,
    config: { damping: 26, stiffness: 40 },
  })
  
  const letterSpacing = interpolate(trackingProgress, [0, 1], [0, 12], { easing: Easing.bezier(0.16, 1, 0.3, 1) })
  const secondaryOpacity = interpolate(trackingProgress, [0, 1], [0, 1])

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <EditorialBg color={backgroundColor} />

      <AbsoluteFill style={{
        padding: minDim * 0.1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          transform: `scale(${scale})`,
          transformOrigin: 'left center',
          width: '100%',
        }}>
          {/* Small text above */}
          <div style={{
            color: textColor,
            fontSize: minDim * 0.04,
            fontFamily: subFontFamily,
            fontWeight: 600,
            letterSpacing: `${letterSpacing * 0.5}px`,
            opacity: secondaryOpacity * 0.6,
            marginBottom: minDim * 0.02,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            <TextMask direction="up" delay={0}>
              {smallText}
            </TextMask>
          </div>

          {/* Main Hero text with Mask */}
          <div style={{
            color: textColor,
            fontSize: Math.min(mainFontSize, minDim * 0.18),
            fontFamily: mainFontFamily,
            fontWeight: 400,
            fontStyle: 'italic',
            lineHeight: 0.9,
            marginBottom: minDim * 0.04,
            whiteSpace: 'nowrap',
          }}>
            <TextMask direction="up" delay={8 / speed} stiffness={60} damping={18}>
              {mainText}
            </TextMask>
          </div>

          {/* Sub text below with Mask & Animated Line */}
          <div style={{
            color: textColor,
            fontSize: Math.min(subFontSize, minDim * 0.045),
            fontFamily: subFontFamily,
            fontWeight: 600,
            letterSpacing: `${letterSpacing}px`,
            opacity: secondaryOpacity,
            display: 'flex',
            alignItems: 'center',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            {/* Decorative line - animates from left */}
            <div style={{
              width: minDim * 0.12,
              height: 2,
              backgroundColor: textColor,
              marginRight: minDim * 0.04,
              opacity: secondaryOpacity * 0.8,
              transform: `scaleX(${interpolate(trackingProgress, [0, 1], [0, 1])})`,
              transformOrigin: 'left',
            }} />

            <TextMask direction="down" delay={28 / speed} stiffness={70} damping={22}>
              {subText}
            </TextMask>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
