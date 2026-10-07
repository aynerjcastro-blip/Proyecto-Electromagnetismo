import { PanelHeader } from "../ui/PanelHeader";
import { panelStyle } from "../../constants";

export function MagneticField({ I1, I2, k, B }) {
  const intensity = Math.min(Math.abs(I1) * 50, 1);
  const dir       = I1 >= 0 ? 1 : -1;
  const fieldColor = dir > 0 ? "#f59e0b" : "#ef4444";

  const fieldLines = Array.from({ length: 8 }, (_, i) => ({
    spread:  15 + i * 12,
    opacity: Math.max(0.1, intensity * (1 - i / 8)),
    i,
  }));

  return (
    <div style={panelStyle}>
      <PanelHeader color="#f59e0b" title="Panel 2: Campo Magnético" />
      <div style={{ padding: 4 }}>
        <svg viewBox="0 0 340 200" style={{ width: "100%", height: "100%" }}>
          <rect width={340} height={200} fill="#0a0f18" rx={4} />

          {/* Grid */}
          {Array.from({ length: 18 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 20} y1={0} x2={i * 20} y2={200} stroke="#111827" strokeWidth={0.5} />
          ))}
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 20} x2={340} y2={i * 20} stroke="#111827" strokeWidth={0.5} />
          ))}

          {/* Coil 1 */}
          <rect x={100} y={70} width={20} height={60} rx={3} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1.5} />
          <text x={110} y={105} textAnchor="middle" fontSize={9} fill="#60a5fa" fontFamily="monospace">L1</text>

          {/* Coil 2 */}
          <rect x={220} y={70} width={20} height={60} rx={3} fill="#134e3a" stroke="#10b981" strokeWidth={1.5} />
          <text x={230} y={105} textAnchor="middle" fontSize={9} fill="#34d399" fontFamily="monospace">L2</text>

          {/* Field lines */}
          {fieldLines.map(({ spread, opacity, i }) => (
            <g key={i}>
              <ellipse cx={170} cy={100} rx={50 + i * 8} ry={spread}
                fill="none" stroke={fieldColor} strokeWidth={1}
                strokeDasharray="4,3" opacity={opacity} />
              {opacity > 0.2 && (
                <>
                  <polygon
                    points={`${170 + 50 + i * 8},97 ${170 + 50 + i * 8},103 ${170 + 54 + i * 8},100`}
                    fill={fieldColor} opacity={opacity} />
                  <polygon
                    points={`${170 - 50 - i * 8},103 ${170 - 50 - i * 8},97 ${170 - 54 - i * 8},100`}
                    fill={fieldColor} opacity={opacity} />
                </>
              )}
            </g>
          ))}

          {/* Coupling region */}
          <rect x={130} y={75} width={80} height={50} rx={4}
            fill="none" stroke="#f59e0b" strokeWidth={1.5}
            strokeDasharray="6,3" opacity={k * intensity * 0.8} />

          {/* Labels */}
          <text x={170} y={18} textAnchor="middle" fontSize={10} fill="#e0e6f0" fontFamily="monospace" fontWeight="bold">
            Campo Magnético
          </text>
          <text x={170} y={190} textAnchor="middle" fontSize={9} fill="#9ca3af" fontFamily="monospace">
            B = {(B ?? 0).toFixed(3)} mT | k = {k}
          </text>

          {/* Intensity bar */}
          <rect x={10} y={30} width={8} height={140} rx={4} fill="#1a2030" />
          <rect x={10} y={30 + 140 * (1 - intensity)} width={8} height={140 * intensity} rx={4}
            fill={fieldColor} />
          <text x={14} y={25} textAnchor="middle" fontSize={7} fill="#9ca3af" fontFamily="monospace">|B|</text>
        </svg>
      </div>
    </div>
  );
}
