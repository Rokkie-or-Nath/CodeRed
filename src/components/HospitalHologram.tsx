import { useEffect, useRef } from 'react';
import { X, Phone, Navigation, Globe, BedDouble, Zap, Accessibility } from 'lucide-react';

interface HospitalHologramProps {
  hospital: {
    name: string;
    distance: string;
    phone: string;
    address: string | null;
    emergency: boolean | null;
    wheelchair: string | null;
    beds: string | null;
    speciality: string | null;
    operator: string | null;
    website: string | null;
  };
  index: number;
  onClose: () => void;
  onNavigate: () => void;
  /** Map pixel position of the marker (set by AppInterfaceSection) */
  anchorPoint?: { x: number; y: number };
}

if (!document.getElementById('hologram-style')) {
  const s = document.createElement('style');
  s.id = 'hologram-style';
  s.textContent = `
    @keyframes holoFadeIn {
      from { opacity:0; transform:scale(0.88) translateY(10px); }
      to   { opacity:1; transform:scale(1) translateY(0); }
    }
    @keyframes holoFloat {
      0%,100% { transform: translateY(0px); }
      50%      { transform: translateY(-4px); }
    }
    @keyframes scanLine {
      0%   { top: 0%; opacity:0.6; }
      100% { top: 100%; opacity:0; }
    }
    @keyframes holoPulseRing {
      0%   { transform:scale(1); opacity:0.7; }
      100% { transform:scale(2.4); opacity:0; }
    }
    @keyframes crossPulse {
      0%,100% { filter: drop-shadow(0 0 3px rgba(255,60,60,0.8)); }
      50%      { filter: drop-shadow(0 0 8px rgba(255,60,60,1)) drop-shadow(0 0 16px rgba(255,60,60,0.5)); }
    }
    @keyframes heliFan {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes ambuBlink {
      0%,49% { fill: rgba(255,80,0,0.9); }
      50%,100%{ fill: rgba(0,180,255,0.9); }
    }
    @keyframes markerHoloPop {
      0%   { transform: scale(0) translateY(10px); opacity:0; }
      70%  { transform: scale(1.1) translateY(-2px); opacity:1; }
      100% { transform: scale(1) translateY(0); opacity:1; }
    }
    @keyframes baseRingPulse {
      0%,100% { opacity:0.6; transform:scaleX(1); }
      50%      { opacity:1; transform:scaleX(1.08); }
    }
    .holo-building-anim { animation: holoFloat 3.5s ease-in-out infinite; }
    .holo-cross { animation: crossPulse 2s ease-in-out infinite; }
    .holo-scanline {
      position:absolute; left:0; width:100%; height:2px;
      background: linear-gradient(90deg, transparent, rgba(0,210,255,0.9), transparent);
      animation: scanLine 2.8s linear infinite;
      pointer-events:none; z-index:20;
    }
    .heli-blade { animation: heliFan 0.4s linear infinite; transform-origin: center; }
    .ambu-dot { animation: ambuBlink 0.6s step-start infinite; }
    .holo-marker-root { animation: markerHoloPop 0.45s cubic-bezier(.34,1.56,.64,1) forwards; }
    .holo-base-ring { animation: baseRingPulse 2s ease-in-out infinite; }
    .holo-pulse-ring {
      position:absolute; border-radius:50%;
      border: 1.5px solid rgba(0,210,255,0.7);
      animation: holoPulseRing 2.2s ease-out infinite;
    }
    .holo-popup-card {
      animation: holoFadeIn 0.3s ease-out forwards;
    }
  `;
  document.head.appendChild(s);
}

/** Standalone mini holographic building SVG used inside the popup */
function MiniHoloBuilding({ index }: { index: number }) {
  const floors = 6;
  const fH = 14;
  const bW = 72;
  const bD = 38;

  const wins = (cols: number, rows: number, w: number, h: number) =>
    Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ({
        x: 6 + c * ((w - 12) / cols),
        y: 5 + r * ((h - 6) / rows),
        lit: Math.random() > 0.32,
      }))
    ).flat();

  const frontWins = wins(5, floors, bW, floors * fH);
  const sideWins  = wins(3, floors, bD, floors * fH);

  return (
    <div className="flex flex-col items-center">
      <div style={{ perspective: '500px' }}>
        <div
          className="holo-building-anim"
          style={{ transformStyle: 'preserve-3d', width: bW, height: floors * fH, position: 'relative' }}
        >
          {/* Front */}
          <svg width={bW} height={floors * fH}
            style={{ position:'absolute', top:0, left:0, transform:`translateZ(${bD/2}px)`, transformStyle:'preserve-3d' }}>
            <rect width={bW} height={floors * fH} fill="rgba(0,18,55,0.88)" stroke="rgba(0,210,255,0.9)" strokeWidth="1.2" />
            {Array.from({ length: floors - 1 }, (_, i) => (
              <line key={i} x1="0" y1={(i+1)*fH} x2={bW} y2={(i+1)*fH} stroke="rgba(0,180,255,0.25)" strokeWidth="0.5" />
            ))}
            {frontWins.map((w, i) => (
              <rect key={i} x={w.x} y={w.y} width={7} height={8} rx="1"
                fill={w.lit ? 'rgba(150,230,255,0.75)' : 'rgba(0,25,65,0.8)'}
                stroke="rgba(0,180,255,0.35)" strokeWidth="0.4" />
            ))}
            {/* ER entrance */}
            <rect x={bW/2-10} y={floors*fH-16} width={20} height={16} rx="1.5"
              fill="rgba(0,35,90,0.9)" stroke="rgba(255,55,55,0.8)" strokeWidth="1.2" />
            <text x={bW/2} y={floors*fH-5} textAnchor="middle"
              fill="rgba(255,55,55,0.95)" fontSize="5" fontWeight="bold" fontFamily="monospace">ER</text>
            {/* Cross */}
            <g className="holo-cross" transform={`translate(${bW/2-6},4)`}>
              <rect x="3" y="0" width="6" height="15" rx="1.5" fill="rgba(255,40,40,0.9)" />
              <rect x="0" y="4.5" width="15" height="6" rx="1.5" fill="rgba(255,40,40,0.9)" />
            </g>
            {/* Edge glow */}
            <rect width={bW} height={floors*fH} fill="none" stroke="rgba(0,210,255,0.45)" strokeWidth="2.5" style={{ filter:'blur(1.5px)' }} />
          </svg>

          {/* Left side */}
          <svg width={bD} height={floors * fH}
            style={{ position:'absolute', top:0, left:0, transform:`translateX(${-bD/2}px) rotateY(-90deg)`, transformOrigin:'left center' }}>
            <rect width={bD} height={floors*fH} fill="rgba(0,12,45,0.9)" stroke="rgba(0,160,220,0.45)" strokeWidth="0.8" />
            {sideWins.map((w, i) => (
              <rect key={i} x={w.x} y={w.y} width={5} height={7} rx="1"
                fill={w.lit ? 'rgba(130,215,255,0.6)' : 'rgba(0,20,55,0.8)'}
                stroke="rgba(0,140,200,0.3)" strokeWidth="0.4" />
            ))}
          </svg>

          {/* Roof */}
          <svg width={bW} height={bD}
            style={{ position:'absolute', top:0, left:0, transform:`translateY(${-bD/2}px) rotateX(90deg)`, transformOrigin:'top center' }}>
            <rect width={bW} height={bD} fill="rgba(0,22,65,0.95)" stroke="rgba(0,200,255,0.55)" strokeWidth="1.2" />
            <circle cx={bW/2} cy={bD/2} r={11} fill="none" stroke="rgba(255,200,0,0.8)" strokeWidth="1.2" />
            <text x={bW/2} y={bD/2+3} textAnchor="middle" fill="rgba(255,215,0,0.9)" fontSize="7" fontWeight="bold" fontFamily="monospace">H</text>
            <g transform={`translate(${bW/2},${bD/2})`}>
              <g className="heli-blade">
                <line x1="-9" y1="0" x2="9" y2="0" stroke="rgba(0,210,255,0.7)" strokeWidth="1.2" />
                <line x1="0" y1="-9" x2="0" y2="9" stroke="rgba(0,210,255,0.7)" strokeWidth="1.2" />
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* Base glow */}
      <div style={{ position:'relative', marginTop: 4, width: bW }}>
        <div className="holo-base-ring" style={{
          height: 8, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,210,255,0.55) 0%, transparent 70%)',
          filter: 'blur(3px)',
        }} />
      </div>

      <div className="mt-2 text-center">
        <div className="text-[9px] font-mono text-cyan-400/65 tracking-widest uppercase">Hologram Preview</div>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[8px] font-mono text-cyan-300/55">#{String(index+1).padStart(3,'0')} · Active</span>
        </div>
      </div>
    </div>
  );
}

export default function HospitalHologram({ hospital, index, onClose, onNavigate, anchorPoint }: HospitalHologramProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  /* click-outside to close */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  /* position: if anchorPoint given, float above marker; else centered */
  const positionStyle: React.CSSProperties = anchorPoint
    ? {
        position: 'absolute',
        left: anchorPoint.x,
        top: anchorPoint.y,
        transform: 'translate(-50%, calc(-100% - 16px))',
        zIndex: 3000,
      }
    : {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 3000,
      };

  return (
    <div
      ref={cardRef}
      className="holo-popup-card"
      style={{
        ...positionStyle,
        width: 320,
        background: 'rgba(0,8,28,0.96)',
        border: '1px solid rgba(0,210,255,0.35)',
        borderRadius: 16,
        boxShadow: '0 0 32px rgba(0,210,255,0.25), 0 0 64px rgba(0,210,255,0.08), inset 0 1px 0 rgba(0,210,255,0.1)',
        overflow: 'hidden',
      }}
    >
      {/* Scanline */}
      <div className="holo-scanline" />

      {/* Grid bg */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" style={{ zIndex:0 }}>
        <defs>
          <pattern id="hpop-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0,210,255,1)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hpop-grid)" />
      </svg>

      <div style={{ position:'relative', zIndex:1 }}>
        {/* Header bar */}
        <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid rgba(0,210,255,0.12)' }}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="px-1.5 py-0.5 rounded-full text-[8px] font-mono tracking-widest uppercase"
                  style={{ background:'rgba(0,210,255,0.12)', border:'1px solid rgba(0,210,255,0.3)', color:'#22d3ee' }}>
                  Hospital {index + 1}
                </span>
                {hospital.emergency && (
                  <span className="px-1.5 py-0.5 rounded-full text-[8px] font-mono tracking-widest uppercase"
                    style={{ background:'rgba(255,60,60,0.12)', border:'1px solid rgba(255,60,60,0.35)', color:'#f87171' }}>
                    ER
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-white leading-tight truncate"
                style={{ textShadow:'0 0 12px rgba(0,210,255,0.4)' }}>
                {hospital.name}
              </h3>
              {hospital.address && (
                <p className="text-[9px] truncate mt-0.5" style={{ color:'rgba(100,220,255,0.5)' }}>
                  📍 {hospital.address}
                </p>
              )}
            </div>
            <button onClick={onClose}
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all"
              style={{ background:'rgba(0,210,255,0.08)', border:'1px solid rgba(0,210,255,0.25)', color:'#22d3ee' }}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Building + stats row */}
        <div className="flex gap-3 p-3">
          <MiniHoloBuilding index={index} />

          {/* Stats */}
          <div className="flex-1 grid grid-cols-2 gap-1.5 content-start">
            {[
              { icon: Navigation, label: 'Distance', value: hospital.distance },
              { icon: BedDouble,  label: 'Beds',     value: hospital.beds ?? 'N/A' },
              { icon: Zap, label: 'Emergency',
                value: hospital.emergency === true ? 'Yes' : hospital.emergency === false ? 'No' : 'N/A' },
              { icon: Accessibility, label: 'Access', value: hospital.wheelchair ?? 'N/A' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="p-2 rounded-lg"
                style={{ background:'rgba(0,20,55,0.7)', border:'1px solid rgba(0,210,255,0.12)' }}>
                <Icon className="w-2.5 h-2.5 mb-0.5" style={{ color:'#22d3ee' }} />
                <div className="text-[8px] font-mono uppercase tracking-wider" style={{ color:'rgba(100,220,255,0.5)' }}>{label}</div>
                <div className="text-[10px] font-semibold text-white truncate">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floor map strip */}
        <div className="mx-3 mb-3 p-2 rounded-xl" style={{ background:'rgba(0,15,45,0.6)', border:'1px solid rgba(0,210,255,0.1)' }}>
          <div className="text-[8px] font-mono text-cyan-400/55 uppercase tracking-widest mb-1.5">Floor Map</div>
          <div className="flex gap-0.5">
            {[
              { label:'Roof', sub:'Helipad', col:'rgba(255,200,0,0.75)' },
              { label:'F5+', sub:'ICU/OR', col:'rgba(255,100,100,0.75)' },
              { label:'F3–4', sub:'Lab/Rad', col:'rgba(100,180,255,0.75)' },
              { label:'F1–2', sub:'Wards', col:'rgba(80,230,180,0.75)' },
              { label:'G', sub:'ER/Bay', col:'rgba(255,60,60,0.75)' },
            ].map(({ label, sub, col }) => (
              <div key={label} className="flex-1 rounded overflow-hidden" style={{ background:'rgba(0,12,40,0.8)' }}>
                <div style={{ height:3, background: col }} />
                <div className="px-0.5 py-1 text-center">
                  <div className="text-[7px] font-mono font-bold text-white/80">{label}</div>
                  <div className="text-[6px] font-mono" style={{ color:'rgba(100,220,255,0.45)' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 px-3 pb-3">
          <button
            onClick={onNavigate}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{
              background:'linear-gradient(135deg, rgba(0,90,190,0.85), rgba(0,190,255,0.6))',
              border:'1px solid rgba(0,210,255,0.5)',
              color:'white',
              boxShadow:'0 0 16px rgba(0,210,255,0.25)',
            }}
          >
            <Navigation className="w-3 h-3" />
            Navigate
          </button>
          {hospital.phone !== 'N/A' && (
            <a href={`tel:${hospital.phone}`}
              className="flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{ background:'rgba(0,18,55,0.8)', border:'1px solid rgba(0,210,255,0.25)', color:'#22d3ee' }}>
              <Phone className="w-3 h-3" />
            </a>
          )}
          {hospital.website && (
            <a href={hospital.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{ background:'rgba(0,18,55,0.8)', border:'1px solid rgba(0,210,255,0.25)', color:'#22d3ee' }}>
              <Globe className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
