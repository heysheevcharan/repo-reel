import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { fitText } from '@remotion/layout-utils'
import React from 'react'

export interface FutureOfDesignProps {
  smallText: string
  mainText: string
  subText: string
  textColor: string
  glowColor: string
  backgroundColor: string
  scale: number
  animationSpeed: number
  blurAmount: number
  slideDistance: number
  glowIntensity: number
  letterSpacing: number
}

export const defaultFutureOfDesignProps: FutureOfDesignProps = {
  smallText: 'the',
  mainText: 'future',
  subText: 'of design',
  textColor: '#FFFFFF',
  glowColor: '#FFFFFF',
  backgroundColor: '#0f172a',
  scale: 1.2,
  animationSpeed: 0.6,
  blurAmount: 30,
  slideDistance: 400,
  glowIntensity: 6,
  letterSpacing: -2,
}

export const Scene: React.FC<FutureOfDesignProps> = ({
  smallText = defaultFutureOfDesignProps.smallText,
  mainText = defaultFutureOfDesignProps.mainText,
  subText = defaultFutureOfDesignProps.subText,
  textColor = defaultFutureOfDesignProps.textColor,
  glowColor = defaultFutureOfDesignProps.glowColor,
  backgroundColor = defaultFutureOfDesignProps.backgroundColor,
  scale = defaultFutureOfDesignProps.scale,
  animationSpeed = defaultFutureOfDesignProps.animationSpeed,
  blurAmount = defaultFutureOfDesignProps.blurAmount,
  slideDistance = defaultFutureOfDesignProps.slideDistance,
  glowIntensity = defaultFutureOfDesignProps.glowIntensity,
  letterSpacing = defaultFutureOfDesignProps.letterSpacing,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()

  const minDim = Math.min(width, height)
  const speed = animationSpeed
  const adjustedFrame = frame * speed
  const scaleValue = scale

  // Calculate optimized font sizes
  const mainFontFamily = 'Georgia, serif'
  const subFontFamily = 'system-ui, -apple-system, sans-serif'
  const containerWidth = width * 0.9

  const { fontSize: mainFontSize } = fitText({
    text: mainText,
    fontFamily: mainFontFamily,
    withinWidth: containerWidth,
    fontWeight: '400',
  })

  const { fontSize: subFontSize } = fitText({
    text: subText,
    fontFamily: subFontFamily,
    withinWidth: containerWidth,
    fontWeight: '600',
  })

  // Main text — blur + slide from left
  const mainProgress = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 22, stiffness: 70 },
  })

  const mainX = interpolate(mainProgress, [0, 1], [-slideDistance, 0])
  const mainBlur = interpolate(mainProgress, [0, 0.6, 1], [blurAmount, 5, 0])
  const mainOpacity = interpolate(mainProgress, [0, 0.3, 1], [0, 0.8, 1])

  // Secondary text — delayed fade/slide
  const textDelay = 15
  const secondaryProgress = spring({
    frame: Math.max(0, adjustedFrame - textDelay),
    fps,
    config: { damping: 20, stiffness: 90 },
  })

  const secondaryY = interpolate(secondaryProgress, [0, 1], [20, 0])

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: backgroundColor,
    }}>
      <div style={{
        transform: `scale(${scaleValue})`,
        transformOrigin: 'center center',
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Small text — floats above */}
          <div style={{
            color: textColor,
            fontSize: minDim * 0.055,
            fontFamily: subFontFamily,
            fontWeight: 400,
            opacity: Number(secondaryProgress) * 0.8,
            transform: `translateY(${secondaryY}px)`,
            letterSpacing: 1,
            marginBottom: minDim * 0.02,
            textAlign: 'center',
            textTransform: 'uppercase',
          }}>
            {smallText}
          </div>

          {/* Main text — italic serif, blur + slide */}
          <h1 style={{
            color: textColor,
            fontSize: Math.min(mainFontSize, minDim * 0.22),
            fontFamily: mainFontFamily,
            fontWeight: 400,
            fontStyle: 'italic',
            margin: 0,
            letterSpacing: `${letterSpacing}px`,
            opacity: mainOpacity,
            transform: `translateX(${mainX}px)`,
            filter: `blur(${mainBlur}px) drop-shadow(0 0 ${glowIntensity}px ${glowColor})`,
            textShadow: `0 0 ${glowIntensity * 0.5}px ${glowColor}`,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}>
            {mainText}
          </h1>

          {/* Sub text — slides up from below */}
          <div style={{
            color: textColor,
            fontSize: Math.min(subFontSize, minDim * 0.05),
            fontFamily: subFontFamily,
            fontWeight: 600,
            marginTop: minDim * 0.01,
            opacity: Number(secondaryProgress) * 0.9,
            transform: `translateY(${-secondaryY}px)`,
            letterSpacing: minDim * 0.008,
            textAlign: 'center',
            textTransform: 'uppercase',
            width: '90%',
            whiteSpace: 'nowrap',
          }}>
            {subText}
          </div>

        </div>
      </div>
    </AbsoluteFill>
  )
}
