"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";

const DEFAULT_COLORS = ["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"];

/*
 * Performance notes (see docs/lighthouse.md):
 * The original drew a blurred, full-window canvas every animation frame, even
 * when it was scrolled off-screen, which produced ~160 s of Total Blocking
 * Time on the home page. This version:
 *   - sizes the canvas to its section (ResizeObserver), not the window;
 *   - renders at half resolution and lets CSS upscale it (the waves are
 *     blurred anyway, so it's visually identical at a quarter of the pixels);
 *   - blurs with a CSS filter on the element (GPU) instead of ctx.filter,
 *     which also removes the Safari special case;
 *   - only animates while the section is on screen (IntersectionObserver)
 *     and the tab is visible;
 *   - draws a single static frame for prefers-reduced-motion.
 */
const SCALE = 0.5;

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth = 50,
  backgroundFill = "black",
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const noise = createNoise3D();
    const step = speed === "fast" ? 0.002 : 0.001;
    const waveColors = colors ?? DEFAULT_COLORS;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let nt = 0;
    let frame = 0;
    let onScreen = false;

    const draw = () => {
      ctx.globalAlpha = 1;
      ctx.fillStyle = backgroundFill;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = waveOpacity;
      ctx.lineWidth = waveWidth * SCALE;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.strokeStyle = waveColors[i % waveColors.length];
        for (let x = 0; x <= w; x += 4) {
          const y = noise(x / (800 * SCALE), 0.3 * i, nt) * 100 * SCALE;
          ctx.lineTo(x, y + h * 0.5);
        }
        ctx.stroke();
      }
    };

    const loop = () => {
      nt += step;
      draw();
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reducedMotion || frame || !onScreen || document.hidden) return;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const resize = () => {
      w = canvas.width = Math.max(1, Math.round(canvas.clientWidth * SCALE));
      h = canvas.height = Math.max(1, Math.round(canvas.clientHeight * SCALE));
      draw();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    visibility.observe(canvas);

    const onVisibilityChange = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibilityChange);

    resize();
    return () => {
      stop();
      resizeObserver.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [backgroundFill, colors, speed, waveOpacity, waveWidth]);

  return (
    <div className={cn("flex h-full w-full flex-col items-center justify-center", containerClassName)}>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 z-0 h-full w-full"
        style={{ filter: `blur(${blur * SCALE}px)` }}
      />
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  );
};
