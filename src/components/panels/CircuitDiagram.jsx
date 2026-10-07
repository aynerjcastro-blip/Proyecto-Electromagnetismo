import { PanelHeader } from "../ui/PanelHeader";
import { panelStyle } from "../../constants";

function coilPath(cx, cy, turns, dir) {
  let d = "";
  for (let i = 0; i < turns; i++) {
    const y0 = cy - 18 + i * (36 / turns);
    const y1 = y0 + 36 / turns;
    d += `M ${cx - 10 * dir} ${y0} C ${cx - 20 * dir} ${y0}, ${cx - 20 * dir} ${y1}, ${cx - 10 * dir} ${y1} `;
  }
  return d;
}

export function CircuitDiagram({ I1, I2, k, animIdx }) {
  const flow1  = Math.sin(animIdx * 0.05 * 15) * Math.sign(I1 + 0.001);
  const flow2  = Math.sin(animIdx * 0.05 * 15 + 1) * Math.sign(I2 + 0.001);
  const absI1  = Math.min(Math.abs(I1) * 80, 1);
  const absI2  = Math.min(Math.abs(I2) * 80, 1);

  return (
    <div style={panelStyle}>
      <PanelHeader color="#3b82f6" title="Panel 1: Circuito Animado" />
      <div style={{ padding: 4 }}>
        <svg viewBox="0 0 340 200" style={{ width: "100%", height: "100%" }}>
          <defs>
            <filter id="glow1">
              <feGaussianBlur stdDeviation="2" result="g" />
              <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Grid */}
          {Array.from({ length: 18 }).map((_, i) => (
            <line key={`gv${i}`} x1={i * 20} y1={0} x2={i * 20} y2={200} stroke="#1a2030" strokeWidth={0.5} />
          ))}
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`gh${i}`} x1={0} y1={i * 20} x2={340} y2={i * 20} stroke="#1a2030" strokeWidth={0.5} />
          ))}

          {/* Coupling zone */}
          <rect x={145} y={55} width={50} height={90} rx={5}
            fill="#f59e0b" opacity={k * 0.15} />
          <text x={170} y={48} textAnchor="middle" fontSize={9} fill="#f59e0b" fontFamily="monospace">
            k={k}
          </text>

          {/* Primary circuit */}
          <g filter="url(#glow1)" opacity={0.5 + absI1 * 0.5}>
            <circle cx={30} cy={100} r={14} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
            <text x={30} y={103} textAnchor="middle" fontSize={8} fill="#60a5fa" fontFamily="monospace">V</text>
            <line x1={30} y1={86} x2={30} y2={40} stroke="#3b82f6" strokeWidth={1.5} />
            <line x1={30} y1={40} x2={70} y2={40} stroke="#3b82f6" strokeWidth={1.5} />
            <rect x={70} y={34} width={30} height={12} rx={2} fill="none" stroke="#60a5fa" strokeWidth={1.2} />
            <text x={85} y={43} textAnchor="middle" fontSize={7} fill="#93c5fd" fontFamily="monospace">R1</text>
            <line x1={100} y1={40} x2={130} y2={40} stroke="#3b82f6" strokeWidth={1.5} />
            <path d={coilPath(150, 82, 5, 1)} fill="none" stroke="#3b82f6" strokeWidth={1.8} />
            <line x1={130} y1={40} x2={140} y2={64} stroke="#3b82f6" strokeWidth={1.5} />
            <line x1={140} y1={118} x2={130} y2={160} stroke="#3b82f6" strokeWidth={1.5} />
            <text x={128} y={95} textAnchor="middle" fontSize={7} fill="#93c5fd" fontFamily="monospace">L1</text>
            <line x1={130} y1={160} x2={80} y2={160} stroke="#3b82f6" strokeWidth={1.5} />
            <line x1={78} y1={152} x2={78} y2={168} stroke="#60a5fa" strokeWidth={2} />
            <line x1={72} y1={152} x2={72} y2={168} stroke="#60a5fa" strokeWidth={2} />
            <text x={75} y={180} textAnchor="middle" fontSize={7} fill="#93c5fd" fontFamily="monospace">C1</text>
            <line x1={70} y1={160} x2={30} y2={160} stroke="#3b82f6" strokeWidth={1.5} />
            <line x1={30} y1={160} x2={30} y2={114} stroke="#3b82f6" strokeWidth={1.5} />
          </g>

          {absI1 > 0.05 && (
            <g>
              <polygon
                points={`${55 + flow1 * 5},36 ${62 + flow1 * 5},40 ${55 + flow1 * 5},44`}
                fill="#60a5fa" opacity={absI1}
              />
              <text x={55} y={32} fontSize={7} fill="#93c5fd" fontFamily="monospace">I₁</text>
            </g>
          )}

          {/* Secondary circuit */}
          <g opacity={0.5 + absI2 * 0.5}>
            <path d={coilPath(190, 82, 5, -1)} fill="none" stroke="#10b981" strokeWidth={1.8} />
            <text x={212} y={95} textAnchor="middle" fontSize={7} fill="#6ee7b7" fontFamily="monospace">L2</text>
            <line x1={200} y1={64} x2={210} y2={40} stroke="#10b981" strokeWidth={1.5} />
            <line x1={200} y1={118} x2={210} y2={160} stroke="#10b981" strokeWidth={1.5} />
            <line x1={210} y1={40} x2={240} y2={40} stroke="#10b981" strokeWidth={1.5} />
            <rect x={240} y={34} width={30} height={12} rx={2} fill="none" stroke="#34d399" strokeWidth={1.2} />
            <text x={255} y={43} textAnchor="middle" fontSize={7} fill="#6ee7b7" fontFamily="monospace">R2</text>
            <line x1={270} y1={40} x2={310} y2={40} stroke="#10b981" strokeWidth={1.5} />
            <line x1={310} y1={40} x2={310} y2={160} stroke="#10b981" strokeWidth={1.5} />
            <line x1={268} y1={152} x2={268} y2={168} stroke="#34d399" strokeWidth={2} />
            <line x1={262} y1={152} x2={262} y2={168} stroke="#34d399" strokeWidth={2} />
            <text x={265} y={180} textAnchor="middle" fontSize={7} fill="#6ee7b7" fontFamily="monospace">C2</text>
            <line x1={310} y1={160} x2={270} y2={160} stroke="#10b981" strokeWidth={1.5} />
            <line x1={260} y1={160} x2={210} y2={160} stroke="#10b981" strokeWidth={1.5} />
          </g>

          {absI2 > 0.05 && (
            <g>
              <polygon
                points={`${285 + flow2 * 5},36 ${292 + flow2 * 5},40 ${285 + flow2 * 5},44`}
                fill="#34d399" opacity={absI2}
              />
              <text x={285} y={32} fontSize={7} fill="#6ee7b7" fontFamily="monospace">I₂</text>
            </g>
          )}

          {/* Flux lines */}
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={170} cy={100 + (i - 1) * 12} rx={12 + i * 3} ry={6}
              fill="none" stroke="#f59e0b" strokeWidth={0.8} strokeDasharray="3,2"
              opacity={k * (0.4 + absI1 * 0.6)} />
          ))}
        </svg>
      </div>
    </div>
  );
}
