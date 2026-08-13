import { motion } from 'framer-motion';

const LATITUDES = [-60, -30, 0, 30, 60];
const N_LONG = 12;

function latLngToXY(lat: number, lng: number, r: number, rotate: number) {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = ((lng + rotate) * Math.PI) / 180;
  const x = r * Math.cos(latRad) * Math.sin(lngRad);
  const y = r * Math.sin(latRad);
  const z = r * Math.cos(latRad) * Math.cos(lngRad);
  return { x, y, z };
}

export default function HoloGlobe() {
  return (
    <div className="relative aspect-square w-full max-w-[420px]">
      <div className="absolute inset-0 rounded-full bg-sentinel-cyan/10 blur-3xl" />

      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <svg viewBox="-110 -110 220 220" className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id="globeFill" cx="35%" cy="35%">
              <stop offset="0%" stopColor="rgba(0,229,255,0.12)" />
              <stop offset="60%" stopColor="rgba(0,229,255,0.04)" />
              <stop offset="100%" stopColor="rgba(0,229,255,0)" />
            </radialGradient>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(0,229,255,0.6)" />
              <stop offset="100%" stopColor="rgba(0,229,255,0.1)" />
            </linearGradient>
          </defs>

          <circle cx="0" cy="0" r="90" fill="url(#globeFill)" />
          <circle cx="0" cy="0" r="90" fill="none" stroke="rgba(0,229,255,0.3)" strokeWidth="0.8" />

          {LATITUDES.map((lat) => {
            const points: string[] = [];
            for (let i = 0; i <= N_LONG * 2; i++) {
              const lng = (i / (N_LONG * 2)) * 360;
              const p = latLngToXY(lat, lng, 90, 0);
              if (p.z >= -10) points.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
              else points.push('');
            }
            const validPts = points.filter(Boolean);
            if (validPts.length < 2) return null;
            return (
              <polyline
                key={`lat-${lat}`}
                points={validPts.join(' ')}
                fill="none"
                stroke="rgba(0,229,255,0.25)"
                strokeWidth="0.5"
              />
            );
          })}

          {Array.from({ length: 8 }, (_, i) => i * 45).map((lng) => {
            const points: string[] = [];
            for (let j = 0; j <= 48; j++) {
              const lat = -90 + (j / 48) * 180;
              const p = latLngToXY(lat, lng, 90, 0);
              if (p.z >= -10) points.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
              else points.push('');
            }
            const segments = points.join(' ').split('  ').filter((s) => s.trim());
            return segments.map((seg, si) => (
              <polyline
                key={`lng-${lng}-${si}`}
                points={seg}
                fill="none"
                stroke="rgba(0,229,255,0.2)"
                strokeWidth="0.5"
              />
            ));
          })}

          {[
            { lat: 40, lng: -74, label: 'NYC' },
            { lat: 51, lng: 0, label: 'LDN' },
            { lat: 35, lng: 139, label: 'TKY' },
            { lat: -33, lng: 151, label: 'SYD' },
            { lat: 55, lng: 37, label: 'MOW' },
            { lat: 1, lng: 103, label: 'SGP' },
            { lat: 25, lng: 55, label: 'DXB' },
            { lat: -23, lng: -46, label: 'SAO' },
          ].map((node) => {
            const p = latLngToXY(node.lat, node.lng, 90, 0);
            if (p.z < -10) return null;
            const opacity = Math.max(0.2, p.z / 90);
            return (
              <g key={node.label} opacity={opacity}>
                <circle cx={p.x} cy={p.y} r="2.5" fill="#00E5FF" />
                <circle cx={p.x} cy={p.y} r="5" fill="none" stroke="rgba(0,229,255,0.5)" strokeWidth="0.5">
                  <animate attributeName="r" values="2.5;7;2.5" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
            );
          })}
        </svg>
      </motion.div>

      <motion.div
        className="absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="-110 -110 220 220" className="absolute inset-0 h-full w-full">
          <ellipse cx="0" cy="0" rx="100" ry="35" fill="none" stroke="url(#ringGrad)" strokeWidth="0.8" opacity="0.5" />
          <ellipse cx="0" cy="0" rx="35" ry="100" fill="none" stroke="url(#ringGrad)" strokeWidth="0.8" opacity="0.4" />
        </svg>
      </motion.div>

      <svg viewBox="-110 -110 220 220" className="absolute inset-0 h-full w-full">
        <circle cx="0" cy="0" r="105" fill="none" stroke="rgba(0,229,255,0.15)" strokeWidth="0.5" strokeDasharray="3 6" />
      </svg>

      <div className="absolute -right-2 top-4 font-mono text-[8px] uppercase tracking-widest text-sentinel-cyan/60">
        GLOBAL · LIVE
      </div>
      <div className="absolute -left-2 bottom-4 font-mono text-[8px] uppercase tracking-widest text-sentinel-cyan/60">
        8 NODES · TRACKING
      </div>
    </div>
  );
}
