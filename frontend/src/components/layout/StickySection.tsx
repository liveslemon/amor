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

  // Only let the computed offset take effect at the breakpoint where the
  // section is actually `sticky` — on a `relative` box (non-stickyOnMobile
  // sections on mobile) a `top` offset still shifts the box visually without
  // the document flow accounting for it, leaving its original flow slot
  // empty and exposing whatever sticky content sits behind it.
  const topClasses = stickyOnMobile
    ? "top-[var(--sticky-top)]"
    : "top-0 md:top-[var(--sticky-top)]";

  return (
    <section
      ref={sectionRef}
      className={`${baseClasses} ${topClasses} ${className}`}
      style={{ "--sticky-top": topStyle } as React.CSSProperties}
    >
      {children}
    </section>
  );
}
