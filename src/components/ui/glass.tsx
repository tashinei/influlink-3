import React, { CSSProperties, ReactNode } from "react";

type GlassPanelProps = {
  width?: string | number;       // e.g., '95vw' or 400
  height?: string | number;      // e.g., '400px'
  borderRadius?: string | number; // e.g., '30px'
  blur?: number;                  // e.g., 20
  saturation?: number;            // e.g., 180 (%)
  brightness?: number;            // e.g., 1.1
  tintColor?: string;             // e.g., 'rgba(255,255,255,0.1)'
  border?: string;                // e.g., '2px solid rgba(255,255,255,0.2)'
  children?: ReactNode;
  style?: CSSProperties;
};

export const GlassPanel: React.FC<GlassPanelProps> = ({
  width = "100%",
  height = "400px",
  borderRadius = "30px",
  blur = 20,
  saturation = 180,
  brightness = 1.1,
  tintColor = "rgba(255,255,255,0.1)",
  border = "2px solid rgba(255,255,255,0.2)",
  children,
  style = {},
}) => {
  const panelStyle: CSSProperties = {
    width,
    height,
    borderRadius,
    backdropFilter: `blur(${blur}px) saturate(${saturation}%) brightness(${brightness})`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%) brightness(${brightness})`,
    backgroundColor: tintColor,
    border,
    boxShadow: `0 8px 32px rgba(0,0,0,0.25), inset 0 0 16px rgba(255,255,255,0.1)`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    ...style,
  };

  return <div style={panelStyle}>{children}</div>;
};
