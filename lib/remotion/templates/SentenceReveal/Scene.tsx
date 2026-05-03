import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import React from "react";

export interface SentenceRevealProps {
  word1: string;
  word2: string;
  word3: string;
  word4: string;
  word5: string;
  word6: string;
  word7: string;
  backgroundColor: string;
  mutedTextColor: string;
  activeTextColor: string;
  scale: number;
  animationSpeed: number;
  cycleFrames: number;
  fontSize: number;
  lineSpacing: number;
  curveIntensity: number;
  blurAmount: number;
}

export const defaultSentenceRevealProps: SentenceRevealProps = {
  word1: "ui-design-system",
  word2: "interface-design",
  word3: "swiftui-ui-patterns",
  word4: "interaction-design",
  word5: "ui-ux-pro-max",
  word6: "web-design-guidelines",
  word7: "frontend-design",
  backgroundColor: "#fcfcfc",
  mutedTextColor: "#999999",
  activeTextColor: "#1a1a1a",
  scale: 1.1,
  animationSpeed: 1,
  cycleFrames: 45,
  fontSize: 0.045,
  lineSpacing: 2.2,
  curveIntensity: 280,
  blurAmount: 8,
};

const CinemaBackground: React.FC<{ color: string }> = ({ color }) => (
  <AbsoluteFill style={{ backgroundColor: color }}>
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.03) 100%)',
    }} />
    <div style={{
      position: 'absolute',
      inset: 0,
      opacity: 0.04,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }} />
  </AbsoluteFill>
);

export const Scene: React.FC<SentenceRevealProps> = (props) => {
  const p = { ...defaultSentenceRevealProps, ...props };
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  const minDim = Math.min(width, height);
  const adjustedFrame = frame * p.animationSpeed;
  
  const words = [p.word1, p.word2, p.word3, p.word4, p.word5, p.word6, p.word7].filter(w => w?.trim());
  const totalWords = words.length;
  
  const currentActiveIndex = Math.floor(adjustedFrame / p.cycleFrames) % totalWords;
  const frameInCycle = adjustedFrame % p.cycleFrames;
  
  const fontSize = minDim * p.fontSize;
  const lineHeight = fontSize * p.lineSpacing;
  
  const entrance = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 20, stiffness: 100 }
  });

  const centerSlotIndex = Math.floor(totalWords / 2);
  const transitionPhase = frameInCycle / p.cycleFrames;
  
  const smoothTransition = interpolate(
    transitionPhase,
    [0, 0.4, 0.6, 1],
    [0, 0, 1, 1],
    { easing: Easing.bezier(0.45, 0, 0.55, 1) }
  );
  
  const baseOpacities = [0.15, 0.35, 0.6, 1, 0.6, 0.35, 0.15];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      <CinemaBackground color={p.backgroundColor} />

      <div style={{
        transform: `scale(${p.scale * entrance})`,
        opacity: entrance,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        {Array.from({ length: totalWords }).map((_, i) => {
          const offset = (currentActiveIndex - centerSlotIndex + totalWords) % totalWords;
          const currentWordIndex = (i + offset) % totalWords;
          const nextWordIndex = (currentWordIndex + 1) % totalWords;
          
          const isActive = i === centerSlotIndex;
          const dist = i - centerSlotIndex;
          const normalizedDist = dist / (totalWords / 2);
          const horizontalOffset = -Math.pow(Math.abs(normalizedDist), 1.3) * p.curveIntensity;
          
          const slotOpacity = baseOpacities[i] || 0.2;
          
          return (
            <div key={i} style={{
              position: "relative",
              height: lineHeight,
              transform: `translateX(${horizontalOffset}px)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {/* Exit Word */}
              <span style={{
                fontSize: fontSize,
                fontWeight: isActive ? 800 : 500,
                color: isActive ? p.activeTextColor : p.mutedTextColor,
                opacity: (1 - smoothTransition) * (isActive ? 1 : slotOpacity),
                position: "absolute",
                whiteSpace: "nowrap",
                filter: `blur(${interpolate(smoothTransition, [0, 1], [0, p.blurAmount])}px)`,
                transform: `translateY(${interpolate(smoothTransition, [0, 1], [0, -lineHeight * 0.5])}px)`,
                letterSpacing: interpolate(smoothTransition, [0, 1], [0, 10]),
              }}>
                {words[currentWordIndex]}
              </span>

              {/* Enter Word */}
              <span style={{
                fontSize: fontSize,
                fontWeight: isActive ? 800 : 500,
                color: isActive ? p.activeTextColor : p.mutedTextColor,
                opacity: smoothTransition * (isActive ? 1 : slotOpacity),
                position: "absolute",
                whiteSpace: "nowrap",
                filter: `blur(${interpolate(smoothTransition, [0, 1], [p.blurAmount, 0])}px)`,
                transform: `translateY(${interpolate(smoothTransition, [0, 1], [lineHeight * 0.5, 0])}px)`,
                letterSpacing: interpolate(smoothTransition, [0, 1], [10, 0]),
              }}>
                {words[nextWordIndex]}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
