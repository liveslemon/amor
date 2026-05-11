"use client";

import React, { useMemo } from "react";

interface ZigZagSeparatorProps {
  className?: string;
  color?: string;
  height?: number;
  pointsDensity?: number;
}

export const ZigZagSeparator = ({ 
  className = "", 
  color = "#0a0f1a", 
  height = 16,
}: ZigZagSeparatorProps) => {
  
  const [density, setDensity] = React.useState(40);

  React.useEffect(() => {
    const handleResize = () => {
      // Calculate density dynamically to target roughly 16px per peak
      const calculatedDensity = Math.max(20, Math.floor(window.innerWidth / 16));
      setDensity(calculatedDensity);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const polygonPoints = useMemo(() => {
    let points = "0,10 ";
    const step = 100 / density;
    
    for (let i = 0; i <= density; i++) {
      const x = i * step;
      const y = i % 2 === 0 ? 10 : 0;
      points += `${x.toFixed(2)},${y} `;
    }
    
    points += "100,10 0,10";
    return points;
  }, [density]);

  return (
    <div 
      className={`absolute top-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none -translate-y-full z-30 ${className}`} 
      style={{ height: `${height}px` }}
    >
      <svg
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        className="w-full h-full"
        style={{ fill: color }}
      >
        <polygon points={polygonPoints} />
      </svg>
    </div>
  );
};

export default ZigZagSeparator;
