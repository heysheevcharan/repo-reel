// Template: terminal-typing
// Description: No description available
// Scene: Scene 1

import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig, Img, Audio, Sequence, Loop, OffthreadVideo } from "remotion";
import React from "react";

const SCENE_PARAMS = {
  // Content
  variableName: { type: "text", label: "Variable Name", value: "greeting" },
  typedText: { type: "text", label: "Typed Text", value: "hello world" },
  
  // Typography
  fontFamily: { type: "font", label: "Font", value: "JetBrains Mono" },
  
  // Colors
  backgroundColor: { type: "color", label: "Background", value: "#1ca7e3" },
  editorColor: { type: "color", label: "Editor Background", value: "#0a0a0a" },
  headerColor: { type: "color", label: "Header Background", value: "#d4d4d4" },
  keywordColor: { type: "color", label: "Keyword Color", value: "#c586c0" },
  variableColor: { type: "color", label: "Variable Color", value: "#9cdcfe" },
  stringColor: { type: "color", label: "String Color", value: "#ce9178" },
  operatorColor: { type: "color", label: "Operator Color", value: "#d4d4d4" },
  cursorColor: { type: "color", label: "Cursor Color", value: "#ffffff" },
  
  // Transform
  scale: { type: "number", label: "Scale", value: 1, min: 0.5, max: 2, step: 0.05 },
  
  // Animation
  animationSpeed: { type: "number", label: "Animation Speed", value: 1, min: 0.5, max: 2, step: 0.1 },
  typingSpeed: { type: "number", label: "Typing Speed (frames per char)", value: 4, min: 2, max: 15, step: 1 },
  
  // Options
  showWindowButtons: { type: "boolean", label: "Show Window Buttons", value: true },
};

function Scene(props: any) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  const scaleValue = (props.scale ?? SCENE_PARAMS.scale.value);
  const typingSpeed = (props.typingSpeed ?? SCENE_PARAMS.typingSpeed.value);
  const animSpeed = (props.animationSpeed ?? SCENE_PARAMS.animationSpeed.value);
  const adjustedFrame = frame * animSpeed;
  
  const minDim = Math.min(width, height);
  const isPortrait = height > width;
  
  const editorWidth = isPortrait ? width * 0.9 : width * 0.7;
  const editorPadding = minDim * 0.04;
  const fontSize = minDim * 0.038;
  const headerHeight = minDim * 0.045;
  const buttonSize = minDim * 0.022;
  const borderRadius = minDim * 0.02;
  
  const text = (props.typedText ?? SCENE_PARAMS.typedText.value);
  const startTypingFrame = 15;
  const typingFrame = Math.max(0, adjustedFrame - startTypingFrame);
  const charsVisible = Math.floor(typingFrame / typingSpeed);
  const displayText = text.substring(0, Math.min(charsVisible, text.length));
  
  const cursorBlink = Math.sin(adjustedFrame * 0.25) > 0 ? 1 : 0;
  
  const editorEntrance = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 20, stiffness: 90 }
  });
  
  const editorY = interpolate(editorEntrance, [0, 1], [30, 0], { extrapolateRight: "clamp" });
  
  return (
    <AbsoluteFill style={{ 
      backgroundColor: (props.backgroundColor ?? SCENE_PARAMS.backgroundColor.value), 
      justifyContent: "center", 
      alignItems: "center"
    }}>
      <div style={{ 
        transform: "scale(" + scaleValue + ") translateY(" + editorY + "px)", 
        transformOrigin: "center center",
        opacity: editorEntrance
      }}>
        <div style={{
          width: editorWidth,
          backgroundColor: (props.editorColor ?? SCENE_PARAMS.editorColor.value),
          borderRadius: borderRadius,
          overflow: "hidden",
          boxShadow: "0 25px 60px -15px rgba(0,0,0,0.4)",
        }}>
          {(props.showWindowButtons ?? SCENE_PARAMS.showWindowButtons.value) && (
            <div style={{
              height: headerHeight,
              backgroundColor: (props.headerColor ?? SCENE_PARAMS.headerColor.value),
              display: "flex",
              alignItems: "center",
              paddingLeft: editorPadding * 0.6,
              gap: buttonSize * 0.5,
            }}>
              <div style={{ 
                width: buttonSize, 
                height: buttonSize, 
                borderRadius: "50%", 
                backgroundColor: "#ff5f56" 
              }} />
              <div style={{ 
                width: buttonSize, 
                height: buttonSize, 
                borderRadius: "50%", 
                backgroundColor: "#ffbd2e" 
              }} />
              <div style={{ 
                width: buttonSize, 
                height: buttonSize, 
                borderRadius: "50%", 
                backgroundColor: "#27ca40" 
              }} />
            </div>
          )}
          
          <div style={{ 
            padding: editorPadding,
            paddingTop: editorPadding * 0.8,
            paddingBottom: editorPadding * 0.8
          }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center",
              flexWrap: "wrap"
            }}>
              <span style={{ 
                color: (props.keywordColor ?? SCENE_PARAMS.keywordColor.value), 
                fontSize: fontSize, 
                fontFamily: (props.fontFamily ?? SCENE_PARAMS.fontFamily.value) + ", monospace",
                fontStyle: "italic"
              }}>const</span>
              <span style={{ 
                color: (props.variableColor ?? SCENE_PARAMS.variableColor.value), 
                fontSize: fontSize, 
                fontFamily: (props.fontFamily ?? SCENE_PARAMS.fontFamily.value) + ", monospace", 
                marginLeft: fontSize * 0.5 
              }}>{(props.variableName ?? SCENE_PARAMS.variableName.value)}</span>
              <span style={{ 
                color: (props.operatorColor ?? SCENE_PARAMS.operatorColor.value), 
                fontSize: fontSize, 
                fontFamily: (props.fontFamily ?? SCENE_PARAMS.fontFamily.value) + ", monospace", 
                marginLeft: fontSize * 0.4 
              }}>=</span>
              <span style={{ 
                color: (props.stringColor ?? SCENE_PARAMS.stringColor.value), 
                fontSize: fontSize, 
                fontFamily: (props.fontFamily ?? SCENE_PARAMS.fontFamily.value) + ", monospace", 
                marginLeft: fontSize * 0.4 
              }}>"</span>
              <span style={{ 
                color: (props.stringColor ?? SCENE_PARAMS.stringColor.value), 
                fontSize: fontSize, 
                fontFamily: (props.fontFamily ?? SCENE_PARAMS.fontFamily.value) + ", monospace"
              }}>{displayText}</span>
              <span style={{ 
                width: fontSize * 0.12, 
                height: fontSize * 1.1, 
                backgroundColor: (props.cursorColor ?? SCENE_PARAMS.cursorColor.value), 
                opacity: cursorBlink,
                display: "inline-block",
                marginLeft: 1
              }} />
              <span style={{ 
                color: (props.stringColor ?? SCENE_PARAMS.stringColor.value), 
                fontSize: fontSize, 
                fontFamily: (props.fontFamily ?? SCENE_PARAMS.fontFamily.value) + ", monospace"
              }}>"</span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

export default Scene;
