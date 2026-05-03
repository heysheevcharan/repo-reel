// Template: bar-chart
// Description: No description available
// Scene: Scene 1

import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig, Img, Audio, Sequence, Loop, OffthreadVideo } from "remotion";
import React from "react";

const SCENE_PARAMS = {
  backgroundColor: { type: "color", label: "Background", value: "#000000" },
  barColor: { type: "color", label: "Bar Color", value: "#ffffff" },
  accentColor: { type: "color", label: "Accent/Green", value: "#22c55e" },
  scale: { type: "number", label: "Scale", value: 1, min: 0.5, max: 2, step: 0.05 },
  animationSpeed: { type: "number", label: "Animation Speed", value: 1, min: 0.5, max: 2, step: 0.1 },
  staggerDelay: { type: "number", label: "Stagger Delay", value: 6, min: 2, max: 15, step: 1 },
  barCount: { type: "number", label: "Bar Count", value: 7, min: 4, max: 12, step: 1 },
  glowIntensity: { type: "number", label: "Glow Intensity", value: 0.8, min: 0, max: 1, step: 0.1 },
  pulseAmount: { type: "number", label: "Pulse Amount", value: 0.08, min: 0, max: 0.2, step: 0.02 },
  showConnectors: { type: "boolean", label: "Show Connectors", value: true },
};

function Scene(props: any) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  const minDim = Math.min(width, height);
  const speed = (props.animationSpeed ?? SCENE_PARAMS.animationSpeed.value);
  const adjustedFrame = frame * speed;
  const stagger = (props.staggerDelay ?? SCENE_PARAMS.staggerDelay.value);
  const barCount = Math.round((props.barCount ?? SCENE_PARAMS.barCount.value));
  const scaleValue = (props.scale ?? SCENE_PARAMS.scale.value);
  
  const barHeights = [0.45, 0.72, 0.58, 0.88, 0.65, 0.78, 0.52, 0.68, 0.75, 0.6, 0.82, 0.55];
  
  const graphWidth = width * 0.7;
  const graphHeight = height * 0.5;
  const barWidth = graphWidth / (barCount * 1.8);
  const barGap = barWidth * 0.8;
  const totalBarsWidth = barCount * barWidth + (barCount - 1) * barGap;
  const startX = (width - totalBarsWidth) / 2;
  const baseY = height * 0.65;
  
  const bars = [];
  const barPositions = [];
  
  for (let i = 0; i < barCount; i++) {
    const delay = i * stagger;
    const targetHeight = barHeights[i % barHeights.length] * graphHeight;
    const isGreen = i % 3 === 1;
    
    const growProgress = spring({
      frame: Math.max(0, adjustedFrame - delay),
      fps,
      config: { damping: 20, stiffness: 90 }
    });
    
    const currentHeight = targetHeight * growProgress;
    
    const pulseDelay = delay + 25;
    const pulseFrame = Math.max(0, adjustedFrame - pulseDelay);
    const pulseProgress = spring({
      frame: pulseFrame,
      fps,
      config: { damping: 12, stiffness: 150 }
    });
    const pulse = growProgress > 0.9 ? Math.sin(pulseFrame * 0.15) * (props.pulseAmount ?? SCENE_PARAMS.pulseAmount.value) * pulseProgress : 0;
    const pulseScale = 1 + pulse;
    
    const sweepDelay = delay + 35;
    const sweepProgress = interpolate(
      adjustedFrame,
      [sweepDelay, sweepDelay + 15, sweepDelay + 30],
      [0, 1, 0],
      { extrapolateRight: "clamp" }
    );
    
    const barX = startX + i * (barWidth + barGap);
    const barY = baseY - currentHeight;
    
    barPositions.push({
      x: barX + barWidth / 2,
      y: barY,
      height: currentHeight,
      progress: growProgress
    });
    
    const barColorFinal = isGreen ? (props.accentColor ?? SCENE_PARAMS.accentColor.value) : (props.barColor ?? SCENE_PARAMS.barColor.value);
    const glowColor = isGreen ? (props.accentColor ?? SCENE_PARAMS.accentColor.value) : "rgba(255,255,255,0.5)";
    const glowIntensity = (props.glowIntensity ?? SCENE_PARAMS.glowIntensity.value) * sweepProgress;
    
    bars.push(
      <div key={"bar-" + i} style={{
        position: "absolute",
        left: barX,
        bottom: height - baseY,
        width: barWidth,
        height: currentHeight,
        backgroundColor: barColorFinal,
        borderRadius: barWidth * 0.15,
        transform: "scaleY(" + pulseScale + ")",
        transformOrigin: "bottom center",
        boxShadow: glowIntensity > 0 
          ? "0 0 " + (20 * glowIntensity) + "px " + glowColor + ", 0 0 " + (40 * glowIntensity) + "px " + glowColor
          : "none",
        transition: "box-shadow 0.1s",
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: Math.min(currentHeight * 0.15, 20),
          background: "linear-gradient(180deg, " + (props.accentColor ?? SCENE_PARAMS.accentColor.value) + " 0%, transparent 100%)",
          opacity: sweepProgress * (props.glowIntensity ?? SCENE_PARAMS.glowIntensity.value),
          borderRadius: barWidth * 0.15 + " " + barWidth * 0.15 + " 0 0",
        }} />
      </div>
    );
  }
  
  const connectors = [];
  if ((props.showConnectors ?? SCENE_PARAMS.showConnectors.value)) {
    for (let i = 0; i < barPositions.length - 1; i++) {
      const connectorDelay = (i + barCount) * stagger + 10;
      const connectorProgress = spring({
        frame: Math.max(0, adjustedFrame - connectorDelay),
        fps,
        config: { damping: 25, stiffness: 80 }
      });
      
      const startPos = barPositions[i];
      const endPos = barPositions[i + 1];
      
      if (startPos.progress > 0.8 && endPos.progress > 0.8) {
        const dx = endPos.x - startPos.x;
        const dy = endPos.y - startPos.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        connectors.push(
          <div key={"connector-" + i} style={{
            position: "absolute",
            left: startPos.x,
            top: startPos.y,
            width: length * connectorProgress,
            height: 2,
            backgroundColor: "rgba(255,255,255,0.3)",
            transform: "rotate(" + angle + "deg)",
            transformOrigin: "left center",
            boxShadow: "0 0 8px rgba(255,255,255,0.2)",
          }} />
        );
        
        const dotProgress = interpolate(connectorProgress, [0.5, 1], [0, 1], { extrapolateRight: "clamp" });
        if (dotProgress > 0) {
          connectors.push(
            <div key={"dot-" + i} style={{
              position: "absolute",
              left: startPos.x + dx * dotProgress - 4,
              top: startPos.y + dy * dotProgress - 4,
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: (props.accentColor ?? SCENE_PARAMS.accentColor.value),
              boxShadow: "0 0 12px " + (props.accentColor ?? SCENE_PARAMS.accentColor.value),
              opacity: dotProgress,
            }} />
          );
        }
      }
    }
  }
  
  const gridLines = [];
  const gridOpacity = interpolate(adjustedFrame, [0, 20], [0, 0.1], { extrapolateRight: "clamp" });
  for (let i = 0; i <= 4; i++) {
    const y = baseY - (graphHeight * i / 4);
    gridLines.push(
      <div key={"grid-" + i} style={{
        position: "absolute",
        left: startX - 20,
        top: y,
        width: totalBarsWidth + 40,
        height: 1,
        backgroundColor: "rgba(255,255,255," + gridOpacity + ")",
      }} />
    );
  }
  
  const ambientGlow1 = interpolate(
    Math.sin(adjustedFrame * 0.03),
    [-1, 1],
    [0.02, 0.06]
  );
  const ambientGlow2 = interpolate(
    Math.sin(adjustedFrame * 0.02 + 1),
    [-1, 1],
    [0.01, 0.04]
  );
  
  return (
    <AbsoluteFill style={{
      backgroundColor: (props.backgroundColor ?? SCENE_PARAMS.backgroundColor.value),
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        top: "20%",
        left: "30%",
        width: "40%",
        height: "60%",
        background: "radial-gradient(ellipse at center, " + (props.accentColor ?? SCENE_PARAMS.accentColor.value) + " 0%, transparent 70%)",
        opacity: ambientGlow1,
        filter: "blur(60px)",
      }} />
      <div style={{
        position: "absolute",
        top: "40%",
        right: "20%",
        width: "30%",
        height: "40%",
        background: "radial-gradient(ellipse at center, rgba(255,255,255,0.5) 0%, transparent 70%)",
        opacity: ambientGlow2,
        filter: "blur(80px)",
      }} />
      
      <div style={{
        transform: "scale(" + scaleValue + ")",
        transformOrigin: "center center",
        width: "100%",
        height: "100%",
        position: "relative",
      }}>
        {gridLines}
        {bars}
        {connectors}
      </div>
    </AbsoluteFill>
  );
}

export default Scene;
