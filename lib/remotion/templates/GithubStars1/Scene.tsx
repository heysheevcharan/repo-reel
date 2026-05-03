// Template: github-stars-1
// Description: No description available
// Scene: Scene 1

import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig, Img, Audio, Sequence, Loop, OffthreadVideo } from "remotion";
import React from "react";

const SCENE_PARAMS = {
  repoName: { type: "text", label: "Repository Name", value: "Mango Giraffe/create" },
  targetStars: { type: "text", label: "Target Stars", value: "27500" },
  backgroundColor: { type: "color", label: "Background", value: "#ffffff" },
  lineColor: { type: "color", label: "Line Color", value: "#e85d3b" },
  textColor: { type: "color", label: "Text Color", value: "#1a1a1a" },
  gridColor: { type: "color", label: "Grid Color", value: "#e5e5e5" },
  secondaryTextColor: { type: "color", label: "Secondary Text", value: "#666666" },
  scale: { type: "number", label: "Scale", value: 1, min: 0.5, max: 2, step: 0.05 },
  animationSpeed: { type: "number", label: "Animation Speed", value: 1, min: 0.5, max: 2, step: 0.1 },
  fontFamily: { type: "font", label: "Font", value: "Inter" },
};

function Scene(props: any) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  const minDim = Math.min(width, height);
  const speed = (props.animationSpeed ?? SCENE_PARAMS.animationSpeed.value);
  const adjustedFrame = frame * speed;
  const targetStars = parseInt((props.targetStars ?? SCENE_PARAMS.targetStars.value)) || 275;
  
  const isPortrait = height > width;
  
  const chartWidth = isPortrait ? width * 0.9 : width * 0.8;
  const chartHeight = isPortrait ? height * 0.5 : height * 0.6;
  const chartX = (width - chartWidth) / 2;
  const chartY = height * (isPortrait ? 0.3 : 0.25);
  
  const headerEntrance = spring({ frame: adjustedFrame, fps, config: { damping: 20, stiffness: 90 } });
  const headerY = interpolate(headerEntrance, [0, 1], [25, 0]);
  
  const chartEntrance = spring({ frame: Math.max(0, adjustedFrame - 15), fps, config: { damping: 22, stiffness: 85 } });
  const chartOpacity = interpolate(chartEntrance, [0, 1], [0, 1]);
  const chartScale = interpolate(chartEntrance, [0, 1], [0.95, 1]);
  
  const lineAnimationStart = 35;
  const lineAnimationDuration = 60;
  const lineProgress = interpolate(
    adjustedFrame,
    [lineAnimationStart, lineAnimationStart + lineAnimationDuration],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );
  
  const getCurveY = (x: number) => {
    if (x < 0.4) return x * 0.05;
    if (x < 0.6) return 0.02 + Math.pow((x - 0.4) * 5, 2) * 0.15;
    return 0.17 + Math.pow((x - 0.6) * 2.5, 1.8) * 0.83;
  };
  
  const numPoints = 100;
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const x = i / numPoints;
    const y = getCurveY(x);
    points.push({ x, y });
  }
  
  const graphPadding = { left: minDim * 0.14, right: minDim * 0.04, top: minDim * 0.04, bottom: minDim * 0.1 };
  const graphWidth = chartWidth - graphPadding.left - graphPadding.right;
  const graphHeight = chartHeight - graphPadding.top - graphPadding.bottom;
  
  const getPixelX = (normalizedX: number) => graphPadding.left + normalizedX * graphWidth;
  const getPixelY = (normalizedY: number) => graphPadding.top + graphHeight - normalizedY * graphHeight;
  
  let pathD = "";
  const animatedPointIndex = Math.floor(lineProgress * numPoints);
  
  for (let i = 0; i <= animatedPointIndex; i++) {
    const point = points[i];
    const px = getPixelX(point.x);
    const py = getPixelY(point.y);
    if (i === 0) {
      pathD += "M " + px + " " + py;
    } else {
      const prevPoint = points[i - 1];
      const prevPx = getPixelX(prevPoint.x);
      const prevPy = getPixelY(prevPoint.y);
      const cpx1 = prevPx + (px - prevPx) * 0.5;
      const cpy1 = prevPy;
      const cpx2 = prevPx + (px - prevPx) * 0.5;
      const cpy2 = py;
      pathD += " C " + cpx1 + " " + cpy1 + ", " + cpx2 + " " + cpy2 + ", " + px + " " + py;
    }
  }
  
  const currentPoint = points[animatedPointIndex] || points[0];
  const currentStars = Math.round(currentPoint.y * targetStars);
  const dotX = getPixelX(currentPoint.x);
  const dotY = getPixelY(currentPoint.y);
  
  const yAxisLabels = [0, 0.2, 0.4, 0.6, 0.8, 1].map(fraction => ({
    value: Math.round(fraction * targetStars),
    y: getPixelY(fraction),
  }));
  
  const xAxisLabels = ["06 PM", "Thu 29", "06 AM", "12 PM", "06 PM", "Fri 30", "06 AM"];
  
  const legendEntrance = spring({ frame: Math.max(0, adjustedFrame - 20), fps, config: { damping: 20, stiffness: 90 } });
  const legendY = interpolate(legendEntrance, [0, 1], [15, 0]);
  
  const borderDrawProgress = interpolate(adjustedFrame, [5, 40], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  
  return (
    <AbsoluteFill style={{ backgroundColor: (props.backgroundColor ?? SCENE_PARAMS.backgroundColor.value) }}>
      <div style={{ transform: "scale(" + (props.scale ?? SCENE_PARAMS.scale.value) + ")", transformOrigin: "center center", width: "100%", height: "100%" }}>
        
        <div style={{
          position: "absolute",
          top: height * 0.06,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: minDim * 0.02,
          opacity: headerEntrance,
          transform: "translateY(" + headerY + "px)",
        }}>
          <svg width={minDim * 0.05} height={minDim * 0.05} viewBox="0 0 24 24" fill={(props.textColor ?? SCENE_PARAMS.textColor.value)}>
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
          <span style={{
            color: (props.textColor ?? SCENE_PARAMS.textColor.value),
            fontSize: minDim * 0.055,
            fontWeight: 600,
            fontFamily: (props.fontFamily ?? SCENE_PARAMS.fontFamily.value) + ", system-ui, sans-serif",
          }}>
            Star History
          </span>
        </div>
        
        <div style={{
          position: "absolute",
          top: height * 0.16,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: legendEntrance,
          transform: "translateY(" + legendY + "px)",
        }}>
          <div style={{
            backgroundColor: (props.backgroundColor ?? SCENE_PARAMS.backgroundColor.value),
            border: "1px solid " + (props.gridColor ?? SCENE_PARAMS.gridColor.value),
            borderRadius: minDim * 0.01,
            padding: minDim * 0.012 + "px " + minDim * 0.02 + "px",
            display: "flex",
            alignItems: "center",
            gap: minDim * 0.012,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}>
            <div style={{
              width: minDim * 0.02,
              height: minDim * 0.02,
              backgroundColor: (props.lineColor ?? SCENE_PARAMS.lineColor.value),
              borderRadius: minDim * 0.003,
            }} />
            <span style={{
              color: (props.textColor ?? SCENE_PARAMS.textColor.value),
              fontSize: minDim * 0.026,
              fontWeight: 400,
              fontFamily: (props.fontFamily ?? SCENE_PARAMS.fontFamily.value) + ", system-ui, sans-serif",
            }}>
              {(props.repoName ?? SCENE_PARAMS.repoName.value)}
            </span>
          </div>
        </div>
        
        <div style={{
          position: "absolute",
          left: chartX,
          top: chartY,
          width: chartWidth,
          height: chartHeight,
          opacity: chartOpacity,
          transform: "scale(" + chartScale + ")",
          transformOrigin: "center center",
        }}>
          
          <svg width={chartWidth} height={chartHeight} style={{ position: "absolute", top: 0, left: 0 }}>
            <rect
              x={graphPadding.left}
              y={graphPadding.top}
              width={graphWidth}
              height={graphHeight}
              fill="none"
              stroke={(props.gridColor ?? SCENE_PARAMS.gridColor.value)}
              strokeWidth={1}
              strokeDasharray={(graphWidth + graphHeight) * 2}
              strokeDashoffset={(graphWidth + graphHeight) * 2 * (1 - borderDrawProgress)}
            />
            
            {yAxisLabels.slice(1).map((label, i) => (
              <line
                key={i}
                x1={graphPadding.left}
                y1={label.y}
                x2={chartWidth - graphPadding.right}
                y2={label.y}
                stroke={(props.gridColor ?? SCENE_PARAMS.gridColor.value)}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            ))}
          </svg>
          
          <div style={{
            position: "absolute",
            left: -minDim * 0.01,
            top: graphPadding.top + graphHeight / 2,
            transform: "rotate(-90deg)",
            transformOrigin: "center center",
            color: (props.secondaryTextColor ?? SCENE_PARAMS.secondaryTextColor.value),
            fontSize: minDim * 0.022,
            fontWeight: 500,
            fontFamily: (props.fontFamily ?? SCENE_PARAMS.fontFamily.value) + ", system-ui, sans-serif",
            whiteSpace: "nowrap",
          }}>
            GitHub Stars
          </div>
          
          {yAxisLabels.map((label, i) => (
            <div key={i} style={{
              position: "absolute",
              left: minDim * 0.02,
              top: label.y - minDim * 0.012,
              width: graphPadding.left - minDim * 0.03,
              textAlign: "right",
              color: (props.secondaryTextColor ?? SCENE_PARAMS.secondaryTextColor.value),
              fontSize: minDim * 0.022,
              fontFamily: (props.fontFamily ?? SCENE_PARAMS.fontFamily.value) + ", system-ui, sans-serif",
            }}>
              {label.value}
            </div>
          ))}
          
          {xAxisLabels.map((label, i) => (
            <div key={i} style={{
              position: "absolute",
              left: getPixelX(i / (xAxisLabels.length - 1)) - minDim * 0.04,
              top: chartHeight - graphPadding.bottom + minDim * 0.015,
              width: minDim * 0.08,
              textAlign: "center",
              color: (props.secondaryTextColor ?? SCENE_PARAMS.secondaryTextColor.value),
              fontSize: minDim * 0.018,
              fontFamily: (props.fontFamily ?? SCENE_PARAMS.fontFamily.value) + ", system-ui, sans-serif",
            }}>
              {label}
            </div>
          ))}
          
          <div style={{
            position: "absolute",
            left: graphPadding.left + graphWidth / 2,
            top: chartHeight - minDim * 0.015,
            transform: "translateX(-50%)",
            color: (props.secondaryTextColor ?? SCENE_PARAMS.secondaryTextColor.value),
            fontSize: minDim * 0.022,
            fontWeight: 500,
            fontFamily: (props.fontFamily ?? SCENE_PARAMS.fontFamily.value) + ", system-ui, sans-serif",
          }}>
            Date
          </div>
          
          <svg width={chartWidth} height={chartHeight} style={{ position: "absolute", top: 0, left: 0 }}>
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke={(props.lineColor ?? SCENE_PARAMS.lineColor.value)}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            
            {lineProgress > 0 && (
              <circle
                cx={dotX}
                cy={dotY}
                r={minDim * 0.01}
                fill={(props.lineColor ?? SCENE_PARAMS.lineColor.value)}
              />
            )}
          </svg>
        </div>
        
      </div>
    </AbsoluteFill>
  );
}

export default Scene;
