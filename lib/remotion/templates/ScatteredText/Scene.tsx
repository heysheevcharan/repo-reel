import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import React from "react";

export interface ScatteredTextProps {
  phrase: string;
  rowCount: number;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  animationSpeed: number;
  scale: number;
}

export const defaultScatteredTextProps: ScatteredTextProps = {
  phrase: "KINETIC ENERGY",
  rowCount: 10,
  backgroundColor: "#f0f0f0",
  textColor: "#000000",
  fontSize: 1,
  animationSpeed: 1,
  scale: 1,
};

const Char: React.FC<{ char: string; delay: number; color: string; size: number }> = ({ char, delay, color, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const s = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const opacity = interpolate(s, [0, 1], [0, 1]);
  const scale = interpolate(s, [0, 1], [1.5, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const blur = interpolate(s, [0, 1], [20, 0]);
  const y = interpolate(s, [0, 1], [20, 0]);

  return (
    <span style={{ 
      display: 'inline-block',
      opacity,
      transform: `scale(${scale}) translateY(${y}px)`,
      filter: `blur(${blur}px)`,
      color,
      fontSize: size,
      fontWeight: 900,
      width: char === " " ? "0.3em" : "0.6em",
      textAlign: 'center',
    }}>
      {char}
    </span>
  );
};

export const Scene: React.FC<ScatteredTextProps> = (props) => {
  const p = { ...defaultScatteredTextProps, ...props };
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const minDim = Math.min(width, height);
  
  const speed = p.animationSpeed;
  const adjustedFrame = frame * speed;
  
  const text = p.phrase.toUpperCase();
  const chars = text.split("");
  const rows = Math.floor(p.rowCount);
  
  const getCharDelay = (row: number, col: number) => {
    const seed = (row * 13) + (col * 37);
    const x = Math.sin(seed) * 10000;
    const random = x - Math.floor(x);
    return random * 50 / speed; // Stagger over ~1.5s
  };

  return (
    <AbsoluteFill style={{ 
      backgroundColor: p.backgroundColor, 
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden"
    }}>
      {/* Background kinetic grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.05,
        backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        transform: `scale(${1 + Math.sin(frame * 0.01) * 0.1}) rotate(${frame * 0.05}deg)`,
      }} />

      <div style={{ 
        transform: `scale(${p.scale})`, 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center",
      }}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} style={{ display: "flex", whiteSpace: "pre", lineHeight: 1.1 }}>
            {chars.map((char: string, charIndex: number) => (
              <Char 
                key={charIndex} 
                char={char} 
                delay={getCharDelay(rowIndex, charIndex)}
                color={p.textColor}
                size={minDim * 0.07 * p.fontSize}
              />
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
