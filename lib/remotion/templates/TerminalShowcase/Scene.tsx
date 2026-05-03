// Template: terminal-showcase
// Description: No description available
// Scene: Scene 1

import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig, Img, Audio, Sequence, Loop, OffthreadVideo } from "remotion";
import React from "react";

const SCENE_PARAMS = {
  command: { type: "text", label: "Command", value: "npx skills add link-dev/skills" },
  promptSymbol: { type: "text", label: "Prompt Symbol", value: "~" },
  outputBody: { type: "multilineText", label: "Output Body", value: "◇  Source: https://github.com/link-dev/skills.git\n│\n◇  Repository cloned\n│\n◇  Found 1 skill\n│\n●  Skill: link-best-practices\n│\n│  Best practices for link\n│\n◇  Detected 2 agents\n│\n└  Installation complete" },
  fontFamily: { type: "font", label: "Font", value: "Inter" },
  backgroundColor: { type: "color", label: "Background", value: "#f8fafc" },
  terminalBg: { type: "color", label: "Terminal Background", value: "#ffffff" },
  titleBarBg: { type: "color", label: "Title Bar", value: "#f6f6f6" },
  textColor: { type: "color", label: "Text Color", value: "#333333" },
  promptColor: { type: "color", label: "Prompt Color", value: "#2ecc71" },
  accentColor: { type: "color", label: "Accent Color", value: "#3d9970" },
  scale: { type: "number", label: "Scale", value: 1, min: 0.5, max: 2, step: 0.05 },
  animationSpeed: { type: "number", label: "Animation Speed", value: 1, min: 0.5, max: 2, step: 0.1 },
  staggerDelay: { type: "number", label: "Stagger Delay (frames)", value: 8, min: 2, max: 20, step: 1 },
  entranceOffset: { type: "number", label: "Entrance Distance", value: 25, min: 10, max: 50, step: 5 },
  blur: { type: "number", label: "Blur Amount", value: 0, min: 0, max: 20, step: 1 },
  rotation: { type: "number", label: "Rotation", value: 0, min: -180, max: 180, step: 5 },
  opacity: { type: "number", label: "Max Opacity", value: 1, min: 0, max: 1, step: 0.05 },
  typingSpeed: { type: "number", label: "Typing Speed (chars/sec)", value: 15, min: 5, max: 30, step: 1 },
  rotationAmount: { type: "number", label: "Rotation Amount", value: 10, min: 0, max: 30, step: 2 },
  showOutput: { type: "boolean", label: "Show Output", value: true }
};

function Scene(props: any) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const minDim = Math.min(width, height);
  const speed = (props.animationSpeed ?? SCENE_PARAMS.animationSpeed.value);
  const adjustedFrame = frame * speed;
  
  const command = (props.command ?? SCENE_PARAMS.command.value);
  const charsPerSecond = (props.typingSpeed ?? SCENE_PARAMS.typingSpeed.value);
  const framesPerChar = fps / charsPerSecond;
  const typingEndFrame = command.length * framesPerChar;
  const outputStartFrame = typingEndFrame + fps * 0.5;
  
  const SKILLS_LOGO = "███████╗██╗  ██╗██╗██╗     ██╗     ███████╗\n██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝\n███████╗█████╔╝ ██║██║     ██║     ███████╗\n╚════██║██╔═██╗ ██║██║     ██║     ╚════██║\n███████║██║  ██╗██║███████╗███████╗███████║\n╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝";
  
  const OUTPUT_LINES = (props.outputBody ?? SCENE_PARAMS.outputBody.value).split("\n");
  
  const visibleChars = Math.floor(
    interpolate(adjustedFrame, [0, typingEndFrame], [0, command.length], {
      extrapolateRight: "clamp",
    })
  );
  
  const displayedText = command.slice(0, visibleChars);
  const isTyping = visibleChars < command.length;
  const showOutput = (props.showOutput ?? SCENE_PARAMS.showOutput.value) && adjustedFrame >= outputStartFrame;
  
  const framesPerLine = fps * 0.08;
  const linesStartFrame = outputStartFrame + framesPerLine;
  const visibleLines = Math.floor(
    interpolate(
      adjustedFrame,
      [linesStartFrame, linesStartFrame + OUTPUT_LINES.length * framesPerLine],
      [0, OUTPUT_LINES.length],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    )
  );
  
  const blinkCycle = Math.floor((adjustedFrame / fps) * 2) % 2;
  const cursorOpacity = isTyping ? 1 : blinkCycle === 0 ? 1 : 0;
  
  const slideIn = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 20, stiffness: 90 },
  });
  
  const translateY = interpolate(slideIn, [0, 1], [height * 0.3, 0], { extrapolateRight: "clamp" });
  const rotationAmount = (props.rotationAmount ?? SCENE_PARAMS.rotationAmount.value);
  const rotateY = interpolate(adjustedFrame, [0, fps * 8], [rotationAmount, -rotationAmount], { extrapolateRight: "clamp" });
  const terminalScale = interpolate(adjustedFrame, [0, fps * 8], [0.9, 1], { extrapolateRight: "clamp" });
  
  const isPortrait = height > width;
  const containerWidth = isPortrait ? width * 0.92 : width * 0.7;
  const containerHeight = isPortrait ? height * 0.68 : height * 0.75;
  const titleBarHeight = minDim * 0.04;
  const trafficLightSize = minDim * 0.015;
  const fontSize = minDim * 0.028;
  const outputFontSize = minDim * 0.018;
  
  return (
    <AbsoluteFill style={{ backgroundColor: (props.backgroundColor ?? SCENE_PARAMS.backgroundColor.value), justifyContent: "center", alignItems: "center", perspective: 1000 }}>
      <div style={{ transform: "scale(" + (props.scale ?? SCENE_PARAMS.scale.value) + ") rotate(" + (props.rotation ?? SCENE_PARAMS.rotation.value) + "deg)", transformOrigin: "center center", filter: "blur(" + (props.blur ?? SCENE_PARAMS.blur.value) + "px)" }}>
        <div style={{
          transform: "translateY(" + translateY + "px) rotateX(12deg) rotateY(" + rotateY + "deg) scale(" + terminalScale + ")",
          transformStyle: "preserve-3d",
          opacity: (props.opacity ?? SCENE_PARAMS.opacity.value),
        }}>
          <div style={{
            width: containerWidth,
            height: containerHeight,
            display: "flex",
            gap: containerWidth * 0.04,
          }}>
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: minDim * 0.02,
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
              backgroundColor: (props.terminalBg ?? SCENE_PARAMS.terminalBg.value),
            }}>
              <div style={{
                height: titleBarHeight,
                minHeight: titleBarHeight,
                backgroundColor: (props.titleBarBg ?? SCENE_PARAMS.titleBarBg.value),
                display: "flex",
                alignItems: "center",
                padding: "0 " + (minDim * 0.015) + "px",
                borderBottom: "1px solid #e0e0e0",
              }}>
                <div style={{ display: "flex", gap: minDim * 0.006 }}>
                  <div style={{ width: trafficLightSize, height: trafficLightSize, borderRadius: "50%", backgroundColor: "#ff5f57" }} />
                  <div style={{ width: trafficLightSize, height: trafficLightSize, borderRadius: "50%", backgroundColor: "#febc2e" }} />
                  <div style={{ width: trafficLightSize, height: trafficLightSize, borderRadius: "50%", backgroundColor: "#28c840" }} />
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <span style={{ color: "#4d4d4d", fontSize: minDim * 0.018, fontWeight: 500, fontFamily: (props.fontFamily ?? SCENE_PARAMS.fontFamily.value) + ", system-ui, sans-serif" }}>Terminal</span>
                </div>
                <div style={{ width: minDim * 0.04 }} />
              </div>
              
              <div style={{
                flex: 1,
                backgroundColor: (props.terminalBg ?? SCENE_PARAMS.terminalBg.value),
                padding: minDim * 0.02,
                fontFamily: "Monaco, Menlo, monospace",
                fontSize: fontSize,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}>
                <div style={{ display: "flex", alignItems: "center", color: (props.textColor ?? SCENE_PARAMS.textColor.value) }}>
                  <span style={{ color: (props.promptColor ?? SCENE_PARAMS.promptColor.value), fontWeight: 600 }}>{(props.promptSymbol ?? SCENE_PARAMS.promptSymbol.value)}</span>
                  <span style={{ color: (props.textColor ?? SCENE_PARAMS.textColor.value), margin: "0 " + (minDim * 0.008) + "px" }}>$</span>
                  <span>{displayedText}</span>
                  {!showOutput && (
                    <span style={{
                      width: minDim * 0.01,
                      height: fontSize * 1.2,
                      backgroundColor: (props.textColor ?? SCENE_PARAMS.textColor.value),
                      marginLeft: minDim * 0.003,
                      opacity: cursorOpacity,
                    }} />
                  )}
                </div>
                
                {showOutput && (
                  <div style={{ marginTop: minDim * 0.015, fontSize: outputFontSize, lineHeight: 1.4, flex: 1, overflow: "hidden" }}>
                    <pre style={{ color: (props.textColor ?? SCENE_PARAMS.textColor.value), margin: 0, marginBottom: minDim * 0.012, fontFamily: "Monaco, Menlo, monospace", whiteSpace: "pre", fontSize: outputFontSize * 0.7 }}>{SKILLS_LOGO}</pre>
                    {OUTPUT_LINES.slice(0, visibleLines).map(function(line: string, i: number) {
                      var lineProgress = spring({
                        frame: Math.max(0, adjustedFrame - linesStartFrame - i * framesPerLine),
                        fps: fps,
                        config: { damping: 20, stiffness: 90 },
                      });
                      var lineOpacity = interpolate(lineProgress, [0, 1], [0, 1], { extrapolateRight: "clamp" });
                      var lineX = interpolate(lineProgress, [0, 1], [15, 0], { extrapolateRight: "clamp" });
                      var isHighlight = line.indexOf("●") !== -1;
                      return (
                        <div key={i} style={{ 
                          color: isHighlight ? (props.accentColor ?? SCENE_PARAMS.accentColor.value) : (props.textColor ?? SCENE_PARAMS.textColor.value), 
                          minHeight: outputFontSize * 1.4,
                          opacity: lineOpacity,
                          transform: "translateX(" + lineX + "px)",
                          fontWeight: isHighlight ? 600 : 400,
                        }}>{line}</div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

export default Scene;
