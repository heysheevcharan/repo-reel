// Template: sentence-reveal
// Description: No description available
// Scene: Scene 1

import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig, Img, Audio, Sequence, Loop, OffthreadVideo } from "remotion";
import React from "react";

const SCENE_PARAMS = {
  word1: { type: "text", label: "Word 1", value: "ui-design-system" },
  word2: { type: "text", label: "Word 2", value: "interface-design" },
  word3: { type: "text", label: "Word 3", value: "swiftui-ui-patterns" },
  word4: { type: "text", label: "Word 4", value: "interaction-design" },
  word5: { type: "text", label: "Word 5", value: "ui-ux-pro-max" },
  word6: { type: "text", label: "Word 6", value: "web-design-guidelines" },
  word7: { type: "text", label: "Word 7", value: "frontend-design" },
  fontFamily: { type: "font", label: "Font", value: "Roboto" },
  backgroundColor: { type: "color", label: "Background", value: "#fcfcfc" },
  mutedTextColor: { type: "color", label: "Muted Text", value: "#999999" },
  activeTextColor: { type: "color", label: "Active Text", value: "#1a1a1a" },
  scale: { type: "number", label: "Scale", value: 1.2, min: 0.5, max: 2, step: 0.05 },
  animationSpeed: { type: "number", label: "Animation Speed", value: 1, min: 0.5, max: 2, step: 0.1 },
  cycleFrames: { type: "number", label: "Frames Per Word", value: 50, min: 20, max: 90, step: 5 },
  fontSize: { type: "number", label: "Font Size", value: 0.042, min: 0.025, max: 0.08, step: 0.005 },
  lineSpacing: { type: "number", label: "Line Spacing", value: 2.2, min: 1.5, max: 3.5, step: 0.1 },
  curveIntensity: { type: "number", label: "Curve Intensity", value: 300, min: 0, max: 300, step: 10 },
  blurAmount: { type: "number", label: "Blur Amount", value: 5, min: 0, max: 20, step: 1 },
};

function Scene(props: any) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  const minDim = Math.min(width, height);
  const speed = (props.animationSpeed ?? SCENE_PARAMS.animationSpeed.value);
  const adjustedFrame = frame * speed;
  const cycleFrames = (props.cycleFrames ?? SCENE_PARAMS.cycleFrames.value);
  
  const words = [
    (props.word1 ?? SCENE_PARAMS.word1.value),
    (props.word2 ?? SCENE_PARAMS.word2.value),
    (props.word3 ?? SCENE_PARAMS.word3.value),
    (props.word4 ?? SCENE_PARAMS.word4.value),
    (props.word5 ?? SCENE_PARAMS.word5.value),
    (props.word6 ?? SCENE_PARAMS.word6.value),
    (props.word7 ?? SCENE_PARAMS.word7.value),
  ].filter(function(w) { return w.trim(); });
  
  const totalWords = words.length;
  
  const currentActiveIndex = Math.floor(adjustedFrame / cycleFrames) % totalWords;
  const frameInCycle = adjustedFrame % cycleFrames;
  
  const fontSize = minDim * (props.fontSize ?? SCENE_PARAMS.fontSize.value);
  const lineHeight = fontSize * (props.lineSpacing ?? SCENE_PARAMS.lineSpacing.value);
  const curveIntensity = (props.curveIntensity ?? SCENE_PARAMS.curveIntensity.value);
  const blurAmount = (props.blurAmount ?? SCENE_PARAMS.blurAmount.value);
  
  const entranceProgress = spring({
    frame: adjustedFrame,
    fps: fps,
    config: { damping: 25, stiffness: 80 }
  });
  const containerOpacity = interpolate(entranceProgress, [0, 1], [0, 1]);
  
  const centerSlotIndex = Math.floor(totalWords / 2);
  
  var getWordAtSlot = function(slotIndex: number) {
    var offset = (currentActiveIndex - centerSlotIndex + totalWords) % totalWords;
    return (slotIndex + offset) % totalWords;
  };
  
  var transitionPhase = frameInCycle / cycleFrames;
  
  var smoothTransition = interpolate(
    transitionPhase,
    [0, 0.3, 0.5, 0.7, 1],
    [0, 0, 0.5, 1, 1],
    { extrapolateRight: "clamp" }
  );
  
  var slots = [];
  for (var i = 0; i < totalWords; i++) {
    var currentWordIndex = getWordAtSlot(i);
    var nextWordIndex = (currentWordIndex + 1) % totalWords;
    
    var isActiveSlot = i === centerSlotIndex;
    
    var distanceFromCenter = i - centerSlotIndex;
    var normalizedDistance = distanceFromCenter / (totalWords / 2);
    
    // Aggressive curve to the LEFT - top and bottom words touch left edge
    var horizontalOffset = -Math.pow(Math.abs(normalizedDistance), 1.2) * curveIntensity;
    
    var currentWord = words[currentWordIndex];
    var nextWord = words[nextWordIndex];
    
    var exitOpacity = interpolate(smoothTransition, [0, 0.5], [1, 0], { extrapolateRight: "clamp" });
    var enterOpacity = interpolate(smoothTransition, [0.5, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    
    var exitBlur = interpolate(smoothTransition, [0, 0.5], [0, blurAmount], { extrapolateRight: "clamp" });
    var enterBlur = interpolate(smoothTransition, [0.5, 1], [blurAmount, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    
    var exitY = interpolate(smoothTransition, [0, 0.5], [0, -lineHeight * 0.3], { extrapolateRight: "clamp" });
    var enterY = interpolate(smoothTransition, [0.5, 1], [lineHeight * 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    
    slots.push({
      slotIndex: i,
      currentWord: currentWord,
      nextWord: nextWord,
      isActiveSlot: isActiveSlot,
      horizontalOffset: horizontalOffset,
      exitOpacity: exitOpacity,
      enterOpacity: enterOpacity,
      exitBlur: exitBlur,
      enterBlur: enterBlur,
      exitY: exitY,
      enterY: enterY,
      distanceFromCenter: Math.abs(distanceFromCenter),
    });
  }
  
  var baseOpacities = [0.25, 0.4, 0.6, 1, 0.6, 0.4, 0.25];
  
  return React.createElement(
    AbsoluteFill,
    { 
      style: { 
        backgroundColor: (props.backgroundColor ?? SCENE_PARAMS.backgroundColor.value), 
        justifyContent: "center", 
        alignItems: "center",
        overflow: "hidden",
      }
    },
    React.createElement(
      "div",
      {
        style: {
          transform: "scale(" + (props.scale ?? SCENE_PARAMS.scale.value) + ")",
          transformOrigin: "center center",
          opacity: containerOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          width: "100%",
        }
      },
      slots.map(function(slot, idx) {
        var slotOpacity = baseOpacities[idx] || 0.3;
        if (slot.isActiveSlot) slotOpacity = 1;
        
        return React.createElement(
          "div",
          {
            key: slot.slotIndex,
            style: {
              position: "relative",
              height: lineHeight,
              transform: "translateX(" + slot.horizontalOffset + "px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }
          },
          React.createElement(
            "span",
            {
              style: {
                fontFamily: (props.fontFamily ?? SCENE_PARAMS.fontFamily.value) + ", system-ui, sans-serif",
                fontSize: fontSize,
                fontWeight: slot.isActiveSlot ? 700 : 400,
                color: slot.isActiveSlot ? (props.activeTextColor ?? SCENE_PARAMS.activeTextColor.value) : (props.mutedTextColor ?? SCENE_PARAMS.mutedTextColor.value),
                opacity: slot.exitOpacity * slotOpacity,
                position: "absolute",
                whiteSpace: "nowrap",
                filter: "blur(" + slot.exitBlur + "px)",
                transform: "translateY(" + slot.exitY + "px)",
              }
            },
            slot.currentWord
          ),
          React.createElement(
            "span",
            {
              style: {
                fontFamily: (props.fontFamily ?? SCENE_PARAMS.fontFamily.value) + ", system-ui, sans-serif",
                fontSize: fontSize,
                fontWeight: slot.isActiveSlot ? 700 : 400,
                color: slot.isActiveSlot ? (props.activeTextColor ?? SCENE_PARAMS.activeTextColor.value) : (props.mutedTextColor ?? SCENE_PARAMS.mutedTextColor.value),
                opacity: slot.enterOpacity * slotOpacity,
                position: "absolute",
                whiteSpace: "nowrap",
                filter: "blur(" + slot.enterBlur + "px)",
                transform: "translateY(" + slot.enterY + "px)",
              }
            },
            slot.nextWord
          )
        );
      })
    )
  );
}

export default Scene;
