"use client";

import React, { useRef, useEffect, useState } from "react";

export default function StickySection({ 
  children, 
  className = "", 
  stickyOnMobile = false 
}: { 
  children: React.ReactNode; 
  className?: string;
  stickyOnMobile?: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [topStyle, setTopStyle] = useState("0px");

  useEffect(() => {
    const handleResize = () => {
      if (!sectionRef.current) return;
      const height = sectionRef.current.getBoundingClientRect().height;
      const windowHeight = window.innerHeight;
      
      // If the section is taller than the viewport, stick it when the bottom hits the bottom of the viewport.
      // Otherwise, stick it to the top.
      if (height > windowHeight) {
        setTopStyle(`calc(100vh - ${height}px)`);
      } else {
        setTopStyle("0px");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    // Also re-calculate if content changes (e.g. FAQ expanding)
    const observer = new ResizeObserver(handleResize);
    observer.observe(sectionRef.current!);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  const baseClasses = stickyOnMobile 
    ? "sticky" 
    : "relative md:sticky";

  return (
    <section 
      ref={sectionRef} 
      className={`${baseClasses} ${className}`}
      style={{ top: topStyle }}
    >
      {children}
    </section>
  );
}
