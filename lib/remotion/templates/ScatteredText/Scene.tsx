// Template: scattered-text
// Description: No description available
// Scene: Scene 1

import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig, Img, Audio, Sequence, Loop, OffthreadVideo } from "remotion";
import React from "react";

const SCENE_PARAMS = {
  phrase: { type: "text", label: "Phrase", value: "HIP-HOP IN THE HOLY LAND" },
  rowCount: { type: "number", label: "Row Count", value: 12, min: 5, max: 20, step: 1 },
  backgroundColor: { type: "color", label: "Background", value: "#f0f0f0" },
  textColor: { type: "color", label: "Text Color", value: "#000000" },
  fontFamily: { type: "font", label: "Font", value: "Inter" },
  fontSize: { type: "number", label: "Font Size Scale", value: 1, min: 0.5, max: 2, step: 0.1 },
  animationSpeed: { type: "number", label: "Animation Speed", value: 1, min: 0.1, max: 2, step: 0.1 },
  scale: { type: "number", label: "Global Scale", value: 1, min: 0.5, max: 2, step: 0.05 },
};

function Scene(props: any) {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const minDim = Math.min(width, height);
  
  const speed = (props.animationSpeed ?? SCENE_PARAMS.animationSpeed.value);
  const adjustedFrame = frame * speed;
  
  // Determine text properties
  const text = (props.phrase ?? SCENE_PARAMS.phrase.value).toUpperCase();
  const chars = text.split("");
  const rows = Math.floor((props.rowCount ?? SCENE_PARAMS.rowCount.value));
  
  // Deterministic pseudo-random function
  const getCharRandom = (row: number, col: number) => {
    const seed = (row * 333) + (col * 777);
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Global reveal progress (0 to 1)
  // We use the first 80% of the video for the reveal
  const revealProgress = interpolate(
    adjustedFrame, 
    [0, durationInFrames * 0.8 * speed], 
    [0, 1.2], // Go slightly over 1 to ensure everything eventually fills
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ 
      backgroundColor: (props.backgroundColor ?? SCENE_PARAMS.backgroundColor.value), 
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden"
    }}>
      <div style={{ 
        transform: `scale(${(props.scale ?? SCENE_PARAMS.scale.value)})`, 
        display: "flex", 
        flexDirection: "column",
        width: "100%",
        alignItems: "center"
      }}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={rowIndex} 
            style={{ 
              display: "flex", 
              whiteSpace: "pre",
              lineHeight: "1.1",
              marginBottom: "2px"
            }}
          >
            {chars.map((char: string, charIndex: number) => {
              const randomVal = getCharRandom(rowIndex, charIndex);
              // Each character appears based on its random value vs the reveal progress
              const isVisible = revealProgress > randomVal;
              
              return (
                <span
                  key={charIndex}
                  style={{ 
                    fontFamily: `${(props.fontFamily ?? SCENE_PARAMS.fontFamily.value)}, system-ui, sans-serif`, 
                    fontSize: minDim * 0.06 * (props.fontSize ?? SCENE_PARAMS.fontSize.value),
                    fontWeight: 900,
                    color: (props.textColor ?? SCENE_PARAMS.textColor.value),
                    opacity: isVisible ? 1 : 0,
                    // Fixed character width to ensure columns align perfectly like the image
                    width: char === " " ? "0.3em" : "0.6em",
                    display: "inline-block",
                    textAlign: "center"
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

export default Scene;
