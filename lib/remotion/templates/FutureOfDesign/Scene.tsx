import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion'
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
  scale: 1.15,
  animationSpeed: 0.8,
  blurAmount: 40,
  slideDistance: 300,
  glowIntensity: 12,
  letterSpacing: -2,
}

const CinemaBg: React.FC<{ color: string; glowColor: string }> = ({ color, glowColor }) => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()
  
  const moveX = Math.sin(frame * 0.02) * 50
  const moveY = Math.cos(frame * 0.015) * 30
  
  return (
    <AbsoluteFill style={{ backgroundColor: color, overflow: 'hidden' }}>
      {/* Dynamic Glow 1 */}
      <div style={{
        position: 'absolute',
        width: width * 1.5,
        height: height * 1.5,
        left: -width * 0.25 + moveX,
        top: -height * 0.25 + moveY,
        background: `radial-gradient(circle, ${glowColor}20 0%, transparent 70%)`,
        filter: 'blur(100px)',
      }} />
      
      {/* Dynamic Glow 2 */}
      <div style={{
        position: 'absolute',
        width: width * 1.2,
        height: height * 1.2,
        right: -width * 0.3 - moveX * 0.5,
        bottom: -height * 0.3 - moveY * 0.5,
        background: `radial-gradient(circle, ${glowColor}15 0%, transparent 60%)`,
        filter: 'blur(120px)',
      }} />

      {/* Film Grain / Noise Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  )
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
  
  // Subtle "breathing" scale for the whole scene
  const breatheScale = 1 + Math.sin(frame * 0.03) * 0.02
  const totalScale = scale * breatheScale

  // Calculate optimized font sizes
  const mainFontFamily = 'Georgia, serif'
  const subFontFamily = 'system-ui, -apple-system, sans-serif'
  const containerWidth = width * 0.85

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

  // Main text animation progress
  const mainProgress = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 18, stiffness: 60 },
  })

  // Entrance animations using interpolate with custom easings
  const mainX = interpolate(mainProgress, [0, 1], [-slideDistance, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1)
  })
  const mainBlur = interpolate(mainProgress, [0, 0.7, 1], [blurAmount, 10, 0])
  const mainOpacity = interpolate(mainProgress, [0, 0.4, 1], [0, 0.9, 1])
  const mainScaleIn = interpolate(mainProgress, [0, 1], [0.95, 1])

  // Secondary elements delay
  const secondaryDelay = 18
  const secondaryProgress = spring({
    frame: Math.max(0, adjustedFrame - secondaryDelay),
    fps,
    config: { damping: 20, stiffness: 80 },
  })

  const secondaryY = interpolate(secondaryProgress, [0, 1], [30, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1)
  })
  const secondaryOpacity = interpolate(secondaryProgress, [0, 1], [0, 1])

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <CinemaBg color={backgroundColor} glowColor={glowColor} />
      
      <div style={{
        transform: `scale(${totalScale})`,
        transformOrigin: 'center center',
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Small text — floats above with subtle tracking */}
          <div style={{
            color: textColor,
            fontSize: minDim * 0.05,
            fontFamily: subFontFamily,
            fontWeight: 400,
            opacity: secondaryOpacity * 0.7,
            transform: `translateY(${secondaryY}px)`,
            letterSpacing: interpolate(secondaryProgress, [0, 1], [2, 6]),
            marginBottom: minDim * 0.03,
            textAlign: 'center',
            textTransform: 'uppercase',
          }}>
            {smallText}
          </div>

          {/* Main text — cinematic serif with deep glow */}
          <h1 style={{
            color: textColor,
            fontSize: Math.min(mainFontSize, minDim * 0.22),
            fontFamily: mainFontFamily,
            fontWeight: 400,
            fontStyle: 'italic',
            margin: 0,
            letterSpacing: `${letterSpacing}px`,
            opacity: mainOpacity,
            transform: `translateX(${mainX}px) scale(${mainScaleIn})`,
            filter: `blur(${mainBlur}px) drop-shadow(0 0 ${glowIntensity}px ${glowColor})`,
            textShadow: `0 0 ${glowIntensity * 0.6}px ${glowColor}80`,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}>
            {mainText}
          </h1>

          {/* Sub text — wide tracking, elegant entry */}
          <div style={{
            color: textColor,
            fontSize: Math.min(subFontSize, minDim * 0.045),
            fontFamily: subFontFamily,
            fontWeight: 600,
            marginTop: minDim * 0.02,
            opacity: secondaryOpacity * 0.9,
            transform: `translateY(${-secondaryY}px)`,
            letterSpacing: interpolate(secondaryProgress, [0, 1], [2, 10]),
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
