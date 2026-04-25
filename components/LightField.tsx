"use client";

import { useEffect, useRef } from "react";

export default function LightField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const lines = Array.from({ length: 14 }).map((_, i) => ({
      y: height * (i / 10),
      offset: Math.random() * 1000,
      speed: 0.15 + Math.random() * 0.2,
    }));

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = 1.2;

      lines.forEach((line) => {
        ctx.beginPath();
ctx.strokeStyle = "rgba(60, 0, 150, 0.18)";


        for (let x = 0; x <= width; x += 10) {
          const y =
            line.y +
            Math.sin((x + time * line.speed + line.offset) * 0.002) * 60;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.stroke();
      });

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 opacity-70 pointer-events-none"
    />
  );
}
