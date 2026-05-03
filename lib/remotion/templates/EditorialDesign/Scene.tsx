import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
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

  // Background scale (Ken Burns)
  const bgScale = interpolate(adjustedFrame, [0, 150], [1, 1.05], {
    extrapolateRight: 'clamp',
  })

  // Tracking animation for supporting text
  const trackingProgress = spring({
    frame: Math.max(0, adjustedFrame - 20),
    fps,
    config: { damping: 26, stiffness: 40 },
  })
  const letterSpacing = interpolate(trackingProgress, [0, 1], [0, 4])
  const secondaryOpacity = interpolate(trackingProgress, [0, 1], [0, 0.8])

  const minDim = Math.min(width, height)
  
  // Calculate optimized font sizes
  const mainFontFamily = 'Georgia, serif'
  const subFontFamily = 'system-ui, -apple-system, sans-serif'
  const maxLabelWidth = width * 0.7

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

  return (
    <AbsoluteFill style={{
      backgroundColor: backgroundColor,
      overflow: 'hidden',
    }}>
      {/* Background layer for Ken Burns */}
      <AbsoluteFill style={{
        transform: `scale(${bgScale})`,
        backgroundColor: backgroundColor,
      }} />

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
            letterSpacing: `${letterSpacing}px`,
            opacity: secondaryOpacity,
            marginBottom: minDim * 0.02,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            {smallText}
          </div>

          {/* Main Hero text with Mask */}
          <div style={{
            color: textColor,
            fontSize: Math.min(mainFontSize, minDim * 0.18),
            fontFamily: mainFontFamily,
            fontWeight: 400,
            fontStyle: 'italic',
            lineHeight: 0.9,
            marginBottom: minDim * 0.02,
            whiteSpace: 'nowrap',
          }}>
            <TextMask direction="up" delay={5 / speed}>
              {mainText}
            </TextMask>
          </div>

          {/* Sub text below with Mask */}
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
            {/* Decorative line */}
            <div style={{
              width: minDim * 0.08,
              height: 1,
              backgroundColor: textColor,
              marginRight: minDim * 0.03,
              opacity: secondaryOpacity,
              transform: `scaleX(${trackingProgress})`,
              transformOrigin: 'left',
            }} />

            <TextMask direction="down" delay={25 / speed}>
              {subText}
            </TextMask>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
