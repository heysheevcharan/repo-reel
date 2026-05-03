import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import React from "react";

export interface EnergyTextProps {
  beText: string;
  theText: string;
  mainWord: string;
  youText: string;
  wantText: string;
  toText: string;
  attractText: string;
  backgroundColor: string;
  textColor: string;
  disintegrationIntensity: number;
  scale: number;
  animationSpeed: number;
}

export const defaultEnergyTextProps: EnergyTextProps = {
  beText: "BE",
  theText: "THE",
  mainWord: "ENERGY",
  youText: "YOU",
  wantText: "WANT",
  toText: "TO",
  attractText: "ATTRACT",
  backgroundColor: "#ffffff",
  textColor: "#000000",
  disintegrationIntensity: 120,
  scale: 1,
  animationSpeed: 1,
};

const NoiseOverlay: React.FC<{ opacity: number }> = ({ opacity }) => (
  <AbsoluteFill style={{ 
    opacity, 
    pointerEvents: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
  }} />
);

export const Scene: React.FC<EnergyTextProps> = (props) => {
  const p = { ...defaultEnergyTextProps, ...props };
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const minDim = Math.min(width, height);
  const speed = p.animationSpeed;
  const adjustedFrame = frame * speed;

  // Staggered springs for words
  const springConfig = { damping: 12, stiffness: 120 };
  
  const textEntrance = spring({
    frame: adjustedFrame,
    fps,
    config: springConfig,
  });

  const energyEntrance = spring({
    frame: Math.max(0, adjustedFrame - 10),
    fps,
    config: { damping: 8, stiffness: 180 },
  });

  // Kinetic "pulse" throughout the scene
  const pulse = 1 + Math.sin(frame * 0.15) * 0.02 * energyEntrance;

  // Disintegration effect progress
  const noiseProgress = interpolate(
    adjustedFrame,
    [40, 60, 90],
    [0, 1.2, 1],
    { extrapolateRight: "clamp", easing: Easing.bezier(0.33, 1, 0.68, 1) }
  );

  const displacementScale = noiseProgress * p.disintegrationIntensity;
  const turbulenceSeed = Math.floor(adjustedFrame / 2);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: p.backgroundColor,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: p.textColor,
        overflow: "hidden",
      }}
    >
      <NoiseOverlay opacity={0.05} />

      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <filter id="disintegrateFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.2"
            numOctaves="2"
            seed={turbulenceSeed}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={displacementScale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -9"
          />
        </filter>
      </svg>

      <div
        style={{
          width: "90%",
          height: "70%",
          position: "relative",
          transform: `scale(${p.scale * pulse})`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '40px 0',
        }}
      >
        {/* Top Line */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', opacity: textEntrance }}>
          <div style={{ 
            fontSize: minDim * 0.06, 
            fontWeight: 700, 
            letterSpacing: interpolate(textEntrance, [0, 1], [10, 2]),
            transform: `translateX(${interpolate(textEntrance, [0, 1], [-40, 0])}px)`
          }}>
            {p.beText}
          </div>
          <div style={{ 
            fontSize: minDim * 0.06, 
            fontWeight: 700, 
            letterSpacing: interpolate(textEntrance, [0, 1], [10, 2]),
            transform: `translateX(${interpolate(textEntrance, [0, 1], [40, 0])}px)`
          }}>
            {p.theText}
          </div>
        </div>

        {/* Main Word "ENERGY" */}
        <div
          style={{
            transform: `scale(${interpolate(energyEntrance, [0, 1], [0.8, 1])}) rotate(${interpolate(energyEntrance, [0, 1], [-5, 0])}deg)`,
            opacity: energyEntrance,
            filter: "url(#disintegrateFilter)",
            fontSize: minDim * 0.28,
            fontWeight: 900,
            textAlign: "center",
            width: "100%",
            lineHeight: 0.8,
            fontFamily: 'Arial Black, sans-serif',
            letterSpacing: interpolate(energyEntrance, [0, 1], [20, -10]),
          }}
        >
          {p.mainWord}
        </div>

        {/* Bottom Line */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            opacity: textEntrance,
            fontSize: minDim * 0.045,
            fontWeight: 600,
            letterSpacing: interpolate(textEntrance, [0, 1], [0, 6]),
            textTransform: 'uppercase',
          }}
        >
          <span>{p.youText}</span>
          <span>{p.wantText}</span>
          <span>{p.toText}</span>
          <span>{p.attractText}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
