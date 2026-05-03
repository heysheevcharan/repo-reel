import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

export interface TerminalTypingProps {
  variableName: string;
  typedText: string;
  backgroundColor: string;
  editorColor: string;
  headerColor: string;
  keywordColor: string;
  variableColor: string;
  stringColor: string;
  operatorColor: string;
  cursorColor: string;
  scale: number;
  animationSpeed: number;
  typingSpeed: number;
}

export const defaultTerminalTypingProps: TerminalTypingProps = {
  variableName: "greeting",
  typedText: "hello world",
  backgroundColor: "#1ca7e3",
  editorColor: "#0a0a0a",
  headerColor: "#d4d4d4",
  keywordColor: "#c586c0",
  variableColor: "#9cdcfe",
  stringColor: "#ce9178",
  operatorColor: "#d4d4d4",
  cursorColor: "#ffffff",
  scale: 1,
  animationSpeed: 1,
  typingSpeed: 3,
};

const CRTOverlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 10 }}>
    {/* Scanlines */}
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
      backgroundSize: '100% 4px, 3px 100%',
      pointerEvents: 'none',
    }} />
    {/* Vignette */}
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.4) 100%)',
      pointerEvents: 'none',
    }} />
  </AbsoluteFill>
);

export const Scene: React.FC<TerminalTypingProps> = (props) => {
  const p = { ...defaultTerminalTypingProps, ...props };
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  const speed = p.animationSpeed;
  const adjustedFrame = frame * speed;
  const minDim = Math.min(width, height);
  
  const editorEntrance = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 18, stiffness: 100 }
  });

  const text = p.typedText;
  const startTypingFrame = 20;
  const typingFrame = Math.max(0, adjustedFrame - startTypingFrame);
  const charsVisible = Math.floor(typingFrame / p.typingSpeed);
  const displayText = text.substring(0, Math.min(charsVisible, text.length));
  
  const cursorBlink = Math.sin(adjustedFrame * 0.3) > 0 ? 1 : 0;
  
  return (
    <AbsoluteFill style={{ 
      backgroundColor: p.backgroundColor, 
      justifyContent: "center", 
      alignItems: "center",
      perspective: 1000,
    }}>
      <div style={{ 
        transform: `scale(${p.scale * interpolate(editorEntrance, [0, 1], [0.8, 1])}) rotateX(${interpolate(editorEntrance, [0, 1], [15, 0])}deg)`, 
        opacity: editorEntrance,
        boxShadow: `0 40px 100px -20px rgba(0,0,0,0.6)`,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          width: width * 0.75,
          backgroundColor: p.editorColor,
          position: 'relative',
        }}>
          <CRTOverlay />
          
          {/* Header */}
          <div style={{
            height: 48,
            backgroundColor: p.headerColor,
            display: "flex",
            alignItems: "center",
            padding: '0 20px',
            gap: 10,
          }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ff5f56" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#27ca40" }} />
            <div style={{ marginLeft: 'auto', opacity: 0.4, fontSize: 12, fontFamily: 'monospace' }}>bash — 80x24</div>
          </div>
          
          <div style={{ padding: 60 }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center",
              fontSize: minDim * 0.05,
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              lineHeight: 1.4,
              filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))'
            }}>
              <span style={{ color: p.keywordColor, fontStyle: 'italic' }}>const</span>
              <span style={{ color: p.variableColor, marginLeft: 20 }}>{p.variableName}</span>
              <span style={{ color: p.operatorColor, marginLeft: 15 }}>=</span>
              <span style={{ color: p.stringColor, marginLeft: 15 }}>"</span>
              <span style={{ color: p.stringColor }}>{displayText}</span>
              <span style={{ 
                width: 12, 
                height: 40, 
                backgroundColor: p.cursorColor, 
                opacity: cursorBlink,
                display: "inline-block",
                marginLeft: 4,
                boxShadow: `0 0 10px ${p.cursorColor}`
              }} />
              <span style={{ color: p.stringColor }}>"</span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

export default Scene;
