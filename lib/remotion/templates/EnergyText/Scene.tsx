// Template: energy-text
// Description: No description available
// Scene: Scene 1

import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig, Img, Audio, Sequence, Loop, OffthreadVideo } from "remotion";
import React from "react";

const SCENE_PARAMS = {
  beText: { type: "text", label: "Top Left Text", value: "BE" },
  theText: { type: "text", label: "Top Right Text", value: "THE" },
  mainWord: { type: "text", label: "Main Word", value: "ENERGY" },
  youText: { type: "text", label: "Bottom 1", value: "YOU" },
  wantText: { type: "text", label: "Bottom 2", value: "WANT" },
  toText: { type: "text", label: "Bottom 3", value: "TO" },
  attractText: { type: "text", label: "Bottom 4", value: "ATTRACT" },
  fontFamily: { type: "font", label: "Font", value: "Inter" },
  backgroundColor: { type: "color", label: "Background Color", value: "#ffffff" },
  textColor: { type: "color", label: "Text Color", value: "#000000" },
  disintegrationIntensity: { type: "number", label: "Max Disintegration", value: 120, min: 20, max: 300, step: 10 },
  scale: { type: "number", label: "Overall Scale", value: 1, min: 0.5, max: 2, step: 0.05 },
  animationSpeed: { type: "number", label: "Animation Speed", value: 1, min: 0.5, max: 2, step: 0.1 },
};

function Scene(props: any) {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const minDim = Math.min(width, height);
  const speed = (props.animationSpeed ?? SCENE_PARAMS.animationSpeed.value);
  const adjustedFrame = frame * speed;

  // Timings based on a 120-frame cycle (re-calibrated to clip duration)
  const relativeFrame = (frame / durationInFrames) * 120 * speed;

  // Surrounding text entry
  const textEntrance = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  // "ENERGY" entry
  const energyEntrance = spring({
    frame: Math.max(0, relativeFrame - 15),
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  // Disintegration logic
  // The effect starts after the word is visible and increases over time
  const noiseStart = 45;
  const noiseProgress = interpolate(
    relativeFrame,
    [noiseStart, noiseStart + 40, noiseStart + 60],
    [0, 1, 0.9], // Peak disintegration then settles slightly
    { extrapolateRight: "clamp" }
  );

  const displacementScale = noiseProgress * (props.disintegrationIntensity ?? SCENE_PARAMS.disintegrationIntensity.value);
  const turbulenceSeed = Math.floor(relativeFrame / 2); // Animate the noise texture

  // Text Style constants
  const secondaryFontSize = minDim * 0.045;
  const mainFontSize = minDim * 0.22;
  const fontStack = (props.fontFamily ?? SCENE_PARAMS.fontFamily.value) + ", system-ui, sans-serif";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: (props.backgroundColor ?? SCENE_PARAMS.backgroundColor.value),
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: fontStack,
        color: (props.textColor ?? SCENE_PARAMS.textColor.value),
        overflow: "hidden",
      }}
    >
      {/* SVG Filters for Disintegration Effect */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <filter id="disintegrateFilter">
          {/* fractalNoise creates the high-frequency displacement map */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.25"
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
          {/* This matrix sharpens the resulting noise for that "shredded black and white" look */}
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 15 -7"
          />
        </filter>
      </svg>

      <div
        style={{
          width: "90%",
          height: "60%",
          position: "relative",
          transform: `scale(${(props.scale ?? SCENE_PARAMS.scale.value)})`,
        }}
      >
        {/* Top Line */}
        <div
          style={{
            position: "absolute",
            top: "0%",
            left: "5%",
            opacity: textEntrance,
            fontSize: secondaryFontSize,
            fontWeight: 400,
            letterSpacing: "0.05em",
          }}
        >
          {(props.beText ?? SCENE_PARAMS.beText.value)}
        </div>
        <div
          style={{
            position: "absolute",
            top: "0%",
            right: "5%",
            opacity: textEntrance,
            fontSize: secondaryFontSize,
            fontWeight: 400,
            letterSpacing: "0.05em",
          }}
        >
          {(props.theText ?? SCENE_PARAMS.theText.value)}
        </div>

        {/* Main Word "ENERGY" */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${interpolate(energyEntrance, [0, 1], [0.95, 1])})`,
            opacity: energyEntrance,
            filter: "url(#disintegrateFilter)",
            fontSize: mainFontSize,
            fontWeight: 800,
            textAlign: "center",
            width: "100%",
            lineHeight: 1,
          }}
        >
          {(props.mainWord ?? SCENE_PARAMS.mainWord.value)}
        </div>

        {/* Bottom Line */}
        <div
          style={{
            position: "absolute",
            bottom: "0%",
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            opacity: textEntrance,
            fontSize: secondaryFontSize,
            fontWeight: 400,
            letterSpacing: "0.02em",
            padding: "0 2%",
          }}
        >
          <span>{(props.youText ?? SCENE_PARAMS.youText.value)}</span>
          <span>{(props.wantText ?? SCENE_PARAMS.wantText.value)}</span>
          <span>{(props.toText ?? SCENE_PARAMS.toText.value)}</span>
          <span>{(props.attractText ?? SCENE_PARAMS.attractText.value)}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

export default Scene;
