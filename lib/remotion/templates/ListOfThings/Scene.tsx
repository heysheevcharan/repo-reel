// Template: list-of-things
// Description: No description available
// Scene: Scene 1

import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig, Img, Audio, Sequence, Loop, OffthreadVideo } from "remotion";
import React from "react";

const SCENE_PARAMS = {
  venue1Icon: { type: "text", label: "Venue 1 Icon", value: "🏨" },
  venue1Label: { type: "text", label: "Venue 1 Label", value: "Hotels" },
  venue2Icon: { type: "text", label: "Venue 2 Icon", value: "💍" },
  venue2Label: { type: "text", label: "Venue 2 Label", value: "Wedding Venues" },
  venue3Icon: { type: "text", label: "Venue 3 Icon", value: "🏝️" },
  venue3Label: { type: "text", label: "Venue 3 Label", value: "Resorts" },
  venue4Icon: { type: "text", label: "Venue 4 Icon", value: "💆" },
  venue4Label: { type: "text", label: "Venue 4 Label", value: "Spas" },

  fontFamily: { type: "font", label: "Font", value: "DM Sans" },

  backgroundColor: { type: "color", label: "Background", value: "#ffffff" },
  textColor: { type: "color", label: "Primary Text", value: "#111827" },
  accentColor: { type: "color", label: "Accent", value: "#3b82f6" },
  secondaryColor: { type: "color", label: "Secondary", value: "#6b7280" },

  scale: { type: "number", label: "Scale", value: 2, min: 0.5, max: 2, step: 0.05 },
  animationSpeed: { type: "number", label: "Animation Speed", value: 1, min: 0.5, max: 2, step: 0.1 },
  staggerDelay: { type: "number", label: "Stagger Delay (frames)", value: 20, min: 2, max: 20, step: 1 },
  entranceOffset: { type: "number", label: "Entrance Distance", value: 20, min: 10, max: 50, step: 5 },
  blur: { type: "number", label: "Blur Amount", value: 0, min: 0, max: 20, step: 1 },
  rotation: { type: "number", label: "Rotation", value: 0, min: -180, max: 180, step: 5 },
  opacity: { type: "number", label: "Max Opacity", value: 1, min: 0, max: 1, step: 0.05 }
};

function Scene(props: any) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const minDim = Math.min(width, height);
  const adjustedFrame = frame * (props.animationSpeed ?? SCENE_PARAMS.animationSpeed.value);

  const items = [
    { icon: (props.venue1Icon ?? SCENE_PARAMS.venue1Icon.value), label: (props.venue1Label ?? SCENE_PARAMS.venue1Label.value) },
    { icon: (props.venue2Icon ?? SCENE_PARAMS.venue2Icon.value), label: (props.venue2Label ?? SCENE_PARAMS.venue2Label.value) },
    { icon: (props.venue3Icon ?? SCENE_PARAMS.venue3Icon.value), label: (props.venue3Label ?? SCENE_PARAMS.venue3Label.value) },
    { icon: (props.venue4Icon ?? SCENE_PARAMS.venue4Icon.value), label: (props.venue4Label ?? SCENE_PARAMS.venue4Label.value) }
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: (props.backgroundColor ?? SCENE_PARAMS.backgroundColor.value), justifyContent: "center", alignItems: "center" }}>
      <div style={{ transform: "scale(" + (props.scale ?? SCENE_PARAMS.scale.value) + ")", transformOrigin: "center center" }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
          {items.map((item, i) => {
            const delay = i * (props.staggerDelay ?? SCENE_PARAMS.staggerDelay.value);
            const progress = spring({ frame: Math.max(0, adjustedFrame - delay), fps, config: { damping: 20, stiffness: 90 } });
            const slideY = interpolate(progress, [0, 1], [(props.entranceOffset ?? SCENE_PARAMS.entranceOffset.value), 0], { extrapolateRight: "clamp" });
            const scale = interpolate(progress, [0, 1], [0.95, 1], { extrapolateRight: "clamp" });

            return (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: minDim * 0.02,
                marginBottom: minDim * 0.03,
                opacity: progress * (props.opacity ?? SCENE_PARAMS.opacity.value),
                transform: "translateY(" + slideY + "px) scale(" + scale + ")",
                filter: (props.blur ?? SCENE_PARAMS.blur.value) > 0 ? "blur(" + (props.blur ?? SCENE_PARAMS.blur.value) + "px)" : "none"
              }}>
                <div style={{
                  fontSize: minDim * 0.06,
                  lineHeight: 1,
                  color: (props.accentColor ?? SCENE_PARAMS.accentColor.value),
                  fontFamily: (props.fontFamily ?? SCENE_PARAMS.fontFamily.value) + ", system-ui, sans-serif"
                }}>
                  {item.icon}
                </div>
                <div style={{
                  fontSize: minDim * 0.045,
                  fontWeight: 600,
                  color: (props.textColor ?? SCENE_PARAMS.textColor.value),
                  fontFamily: (props.fontFamily ?? SCENE_PARAMS.fontFamily.value) + ", system-ui, sans-serif"
                }}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

export default Scene;
