import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pulse: number;
}

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];

    const resize = () => {
      width = canvas.parentElement?.clientWidth ?? window.innerWidth;
      height = canvas.parentElement?.clientHeight ?? window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(70, Math.floor((width * height) / 18000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.8 + 0.6,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.02;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.4;
            ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        const pulseR = n.r + Math.sin(n.pulse) * 0.4;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
        ctx.shadowColor = 'rgba(0, 229, 255, 0.9)';
        ctx.shadowBlur = 10;
        ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(tick);
    };

    resize();
    tick();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 grid-bg-fine opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sentinel-cyan/20"
            style={{
              animation: `pulse-ring 3s cubic-bezier(0.4,0,0.6,1) ${i * 0.75}s infinite`,
            }}
          />
        ))}
        {[180, 280, 380].map((s) => (
          <div
            key={s}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sentinel-cyan/10"
            style={{ width: s, height: s }}
          />
        ))}
        <div className="absolute left-1/2 top-1/2 h-[400px] w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-sentinel-cyan/15 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-px w-[400px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-sentinel-cyan/15 to-transparent" />
        <div
          className="absolute left-1/2 top-1/2 h-[200px] w-[200px] origin-bottom-left"
          style={{ animation: 'radar-sweep 4s linear infinite' }}
        >
          <div
            className="absolute bottom-0 left-0 h-[200px] w-[200px] rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0,229,255,0.15) 60deg, transparent 90deg)',
            }}
          />
        </div>
      </div>

      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-sentinel-cyan/70 to-transparent"
        initial={{ top: '0%' }}
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 h-8 -translate-y-7 bg-gradient-to-b from-transparent to-sentinel-cyan/10" />
      </motion.div>

      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-sentinel-cyan/30 to-transparent"
        initial={{ top: '100%' }}
        animate={{ top: ['100%', '0%', '100%'] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      />

      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-sentinel-cyan/[0.04] to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#050816_92%)]" />
    </div>
  );
}
