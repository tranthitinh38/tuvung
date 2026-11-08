import React, { useEffect, useRef, useState } from 'react';
import { VocabCard } from '../types';
import { X, Layers, Box, Eye, Sparkles, Compass, Radio, Maximize2, RotateCcw } from 'lucide-react';

interface ARHologramViewerProps {
  card: VocabCard;
  onClose: () => void;
}

export const ARHologramViewer: React.FC<ARHologramViewerProps> = ({ card, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [backdropMode, setBackdropMode] = useState<'grid' | 'lab' | 'camera'>('grid');
  const [wireframeOnly, setWireframeOnly] = useState<boolean>(false);
  const [pulseCount, setPulseCount] = useState<number>(0);
  const [rotation, setRotation] = useState({ x: 15, y: 35 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // 3D Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    // Generate fixed random particles
    const particles = Array.from({ length: 45 }, () => ({
      x: (Math.random() - 0.5) * 300,
      y: (Math.random() - 0.5) * 300,
      z: (Math.random() - 0.5) * 300,
      size: Math.random() * 2.5 + 1,
      speed: Math.random() * 0.02 + 0.005,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      angle += 0.015;

      // Draw background cyber scan lines
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
      ctx.lineWidth = 1;
      for (let y = 0; y < canvas.height; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw holographic floor pedestal (concentric perspective ellipses)
      ctx.save();
      ctx.translate(centerX, centerY + 110);
      for (let r = 130; r >= 30; r -= 25) {
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = r === 130 ? 'rgba(236, 72, 153, 0.5)' : 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Pedestal tick marks
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
        const x1 = Math.cos(a + angle * 0.5) * 115;
        const y1 = Math.sin(a + angle * 0.5) * (115 * 0.35);
        const x2 = Math.cos(a + angle * 0.5) * 135;
        const y2 = Math.sin(a + angle * 0.5) * (135 * 0.35);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.stroke();
      }
      ctx.restore();

      // Project and draw 3D floating object: Polyhedral Hologram Core
      const rotY = (rotation.y * Math.PI) / 180 + angle;
      const rotX = (rotation.x * Math.PI) / 180;

      // Define 3D vertices for an icosahedron / jewel prism
      const scale = 80;
      const t = (1 + Math.sqrt(5)) / 2;
      const rawVertices = [
        [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
        [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
        [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
      ];

      // Projected points
      const projected = rawVertices.map(([x, y, z]) => {
        // Rotate Y
        let x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
        let z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
        // Rotate X
        let y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
        let z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);

        const fov = 350;
        const pScale = fov / (fov + z2 * scale * 0.5);
        return {
          px: centerX + x1 * scale * 0.45 * pScale,
          py: centerY - 15 + y2 * scale * 0.45 * pScale,
          pz: z2,
        };
      });

      // Draw connecting holographic edges
      ctx.lineWidth = 1.8;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = rawVertices[i][0] - rawVertices[j][0];
          const dy = rawVertices[i][1] - rawVertices[j][1];
          const dz = rawVertices[i][2] - rawVertices[j][2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // Edge connections in icosahedron have distance == 2
          if (dist < 2.1) {
            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            
            const grad = ctx.createLinearGradient(
              projected[i].px, projected[i].py, projected[j].px, projected[j].py
            );
            grad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
            grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.85)');
            grad.addColorStop(1, 'rgba(236, 72, 153, 0.85)');
            ctx.strokeStyle = grad;
            ctx.stroke();
          }
        }
      }

      // Draw vertices nodes
      projected.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.px, p.py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Orbiting Energy Ring
      ctx.save();
      ctx.translate(centerX, centerY - 15);
      ctx.rotate(-angle * 0.8);
      ctx.beginPath();
      ctx.ellipse(0, 0, 110, 45, angle * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.stroke();
      ctx.restore();

      // Floating particles
      particles.forEach((p) => {
        const px = centerX + p.x * Math.cos(angle * p.speed) - p.z * Math.sin(angle * p.speed);
        const py = centerY - 15 + p.y + Math.sin(angle * 2) * 10;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(129, 140, 248, 0.6)';
        ctx.fill();
      });

      // Laser scan beam sweeps vertically
      const scanY = centerY - 100 + ((Math.sin(angle * 2) + 1) / 2) * 200;
      const scanGrad = ctx.createLinearGradient(0, scanY - 15, 0, scanY + 15);
      scanGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      scanGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.35)');
      scanGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(centerX - 160, scanY - 10, 320, 20);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [rotation, backdropMode, wireframeOnly, pulseCount]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setRotation((prev) => ({
      x: Math.max(-60, Math.min(60, prev.x + deltaY * 0.5)),
      y: prev.y + deltaX * 0.5,
    }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-950/50 flex flex-col max-h-[92vh]">
        
        {/* Top AR Status Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/70 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>AR_HUD // METAVERSE 3D VIEWPORT</span>
            </div>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              FREQ: 5.8 GHz • LATENCY: 2ms
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRotation({ x: 15, y: 35 })}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
              title="Reset góc nhìn 3D"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hologram Viewport Area */}
        <div
          className={`relative flex-1 min-h-[340px] flex items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing ${
            backdropMode === 'camera'
              ? 'bg-slate-900/90'
              : backdropMode === 'lab'
              ? 'bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950'
              : 'bg-radial from-slate-900 via-slate-950 to-black'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Simulated Camera Feed overlay elements if camera mode */}
          {backdropMode === 'camera' && (
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="w-full h-full bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />
              <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-cyan-400" />
            </div>
          )}

          {/* Interactive 3D Canvas */}
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="w-full max-w-[640px] max-h-[360px] object-contain drop-shadow-[0_0_35px_rgba(56,189,248,0.35)]"
          />

          {/* Floating Target Word Hologram Banner */}
          <div className="absolute top-4 left-6 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-pink-400">
                {card.word}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                {card.ipa}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5 max-w-sm">
              {card.meaning}
            </p>
          </div>

          {/* Drag instruction overlay */}
          <div className="absolute bottom-3 left-6 flex items-center gap-1.5 text-[11px] font-mono text-cyan-400/80 bg-slate-950/70 px-2.5 py-1 rounded-md border border-cyan-500/20 pointer-events-none">
            <Compass className="w-3.5 h-3.5" />
            <span>Kéo chuột để xoay mô hình 3D đa chiều</span>
          </div>

          {/* Backdrop Mode Switcher */}
          <div className="absolute top-4 right-6 flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-700/60 z-10">
            <button
              onClick={() => setBackdropMode('grid')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                backdropMode === 'grid' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Grid 3D
            </button>
            <button
              onClick={() => setBackdropMode('lab')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                backdropMode === 'lab' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cyber Lab
            </button>
            <button
              onClick={() => setBackdropMode('camera')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                backdropMode === 'camera' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              AR Cam
            </button>
          </div>
        </div>

        {/* Bottom AR Specification Panel (Strict adherence to System Instruction) */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-cyan-500/20 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0 mt-0.5">
              <Box className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  AR 3D Object Prompt
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  {card.globalSuccessContext}
                </span>
              </div>
              <p className="text-sm text-slate-200 font-medium leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                "{card.arPrompt}"
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>
                Kích hoạt tương tác thực tế ảo giúp kích thích trí nhớ không gian (Spatial Memory).
              </span>
            </div>

            <button
              onClick={() => setPulseCount((c) => c + 1)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/25 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              Phát Xung Lượng Tử (Pulse)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
