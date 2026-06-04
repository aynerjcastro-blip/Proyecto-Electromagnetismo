import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";

// ─── RK4 Solver ───
function rk4Step(f, t, y, dt) {
  const k1 = f(t, y);
  const k2 = f(
    t + dt / 2,
    y.map((v, i) => v + (dt / 2) * k1[i]),
  );
  const k3 = f(
    t + dt / 2,
    y.map((v, i) => v + (dt / 2) * k2[i]),
  );
  const k4 = f(
    t + dt,
    y.map((v, i) => v + dt * k3[i]),
  );
  return y.map(
    (v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]),
  );
}

function solveSystem(params) {
  const { R1, R2, L1, L2, C1, C2, k, V0, freq, mode, N1, N2 } = params;
  const M = k * Math.sqrt(L1 * L2);
  const det = L1 * L2 - M * M;
  if (Math.abs(det) < 1e-15) return [];

  const omega = 2 * Math.PI * freq;
  const tMax = mode === "AC" ? Math.max(0.05, 5 / freq) : 0.05;
  const dt = tMax / 1500;
  const steps = Math.floor(tMax / dt);

  const derivatives = (t, y) => {
    const [I1, I2, Vc1, Vc2] = y;
    const Vs = mode === "AC" ? V0 * Math.sin(omega * t) : t < 0.001 ? V0 : V0;
    const rhs1 = Vs - R1 * I1 - Vc1;
    const rhs2 = -R2 * I2 - Vc2;
    const dI1 = (L2 * rhs1 - M * rhs2) / det;
    const dI2 = (L1 * rhs2 - M * rhs1) / det;
    const dVc1 = I1 / C1;
    const dVc2 = I2 / C2;
    return [dI1, dI2, dVc1, dVc2];
  };

  let y = [0, 0, 0, 0];
  const data = [];
  const skip = Math.max(1, Math.floor(steps / 500));
  const coreLength = 0.05;

  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    if (i % skip === 0) {
      const [I1, I2, Vc1, Vc2] = y;
      const mu0 = 4 * Math.PI * 1e-7;
      const B = (mu0 * N1 * I1) / coreLength;
      const phi = M * I1;
      const dI1_approx = derivatives(t, y)[0];
      const emf = -N2 * M * dI1_approx;
      const E_L1 = 0.5 * L1 * I1 * I1;
      const E_L2 = 0.5 * L2 * I2 * I2;
      const E_C1 = 0.5 * C1 * Vc1 * Vc1;
      const E_C2 = 0.5 * C2 * Vc2 * Vc2;
      data.push({
        t: parseFloat((t * 1000).toFixed(4)),
        I1: parseFloat(I1.toFixed(6)),
        I2: parseFloat(I2.toFixed(6)),
        B: parseFloat((B * 1000).toFixed(6)),
        phi: parseFloat((phi * 1000).toFixed(6)),
        emf: parseFloat(emf.toFixed(4)),
        E_L1,
        E_L2,
        E_C1,
        E_C2,
        Vc1,
        Vc2,
      });
    }
    y = rk4Step(derivatives, i * dt, y, dt);
  }
  return data;
}

// ─── Slider Component ───
function ParamSlider({ label, value, min, max, step, onChange, unit, color }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          color: "#b0b8c8",
        }}
      >
        <span style={{ color: color || "#8ec8f0" }}>{label}</span>
        <span style={{ color: "#e0e6f0", fontWeight: 600 }}>
          {typeof value === "number"
            ? value >= 0.001
              ? value
              : value.toExponential(1)
            : value}{" "}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%",
          height: 6,
          appearance: "none",
          background: `linear-gradient(90deg, ${color || "#3b82f6"} ${pct}%, #2a3040 ${pct}%)`,
          borderRadius: 3,
          outline: "none",
          cursor: "pointer",
          accentColor: color || "#3b82f6",
        }}
      />
    </div>
  );
}

// ─── Circuit SVG ───
function CircuitDiagram({ I1, I2, k, t }) {
  const flow1 = Math.sin(t * 15) * Math.sign(I1 + 0.001);
  const flow2 = Math.sin(t * 15 + 1) * Math.sign(I2 + 0.001);
  const absI1 = Math.min(Math.abs(I1) * 80, 1);
  const absI2 = Math.min(Math.abs(I2) * 80, 1);

  const coilPath = (cx, cy, turns, dir) => {
    let d = "";
    for (let i = 0; i < turns; i++) {
      const y0 = cy - 18 + i * (36 / turns);
      const y1 = y0 + 36 / turns;
      d += `M ${cx - 10 * dir} ${y0} C ${cx - 20 * dir} ${y0}, ${cx - 20 * dir} ${y1}, ${cx - 10 * dir} ${y1} `;
    }
    return d;
  };

  return (
    <svg viewBox="0 0 340 200" style={{ width: "100%", height: "100%" }}>
      <defs>
        <filter id="glow1">
          <feGaussianBlur stdDeviation="2" result="g" />
          <feMerge>
            <feMergeNode in="g" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow2">
          <feGaussianBlur stdDeviation="2" result="g" />
          <feMerge>
            <feMergeNode in="g" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="couplingGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity={k} />
          <stop offset="50%" stopColor="#f59e0b" stopOpacity={k * 0.3} />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity={k} />
        </linearGradient>
      </defs>

      {/* Background grid */}
      {Array.from({ length: 18 }).map((_, i) => (
        <line
          key={`gv${i}`}
          x1={i * 20}
          y1={0}
          x2={i * 20}
          y2={200}
          stroke="#1a2030"
          strokeWidth={0.5}
        />
      ))}
      {Array.from({ length: 11 }).map((_, i) => (
        <line
          key={`gh${i}`}
          x1={0}
          y1={i * 20}
          x2={340}
          y2={200 > 0 ? i * 20 : 0}
          stroke="#1a2030"
          strokeWidth={0.5}
        />
      ))}

      {/* Coupling region */}
      <rect
        x={145}
        y={55}
        width={50}
        height={90}
        rx={5}
        fill="url(#couplingGrad)"
        opacity={0.3}
      />
      <text
        x={170}
        y={48}
        textAnchor="middle"
        fontSize={9}
        fill="#f59e0b"
        fontFamily="monospace"
      >
        k={k}
      </text>

      {/* Primary circuit */}
      <g filter="url(#glow1)" opacity={0.5 + absI1 * 0.5}>
        {/* Source */}
        <circle
          cx={30}
          cy={100}
          r={14}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={1.5}
        />
        <text
          x={30}
          y={103}
          textAnchor="middle"
          fontSize={8}
          fill="#60a5fa"
          fontFamily="monospace"
        >
          V
        </text>
        {/* Wires top */}
        <line
          x1={30}
          y1={86}
          x2={30}
          y2={40}
          stroke="#3b82f6"
          strokeWidth={1.5}
        />
        <line
          x1={30}
          y1={40}
          x2={70}
          y2={40}
          stroke="#3b82f6"
          strokeWidth={1.5}
        />
        {/* R1 */}
        <rect
          x={70}
          y={34}
          width={30}
          height={12}
          rx={2}
          fill="none"
          stroke="#60a5fa"
          strokeWidth={1.2}
        />
        <text
          x={85}
          y={43}
          textAnchor="middle"
          fontSize={7}
          fill="#93c5fd"
          fontFamily="monospace"
        >
          R1
        </text>
        <line
          x1={100}
          y1={40}
          x2={130}
          y2={40}
          stroke="#3b82f6"
          strokeWidth={1.5}
        />
        {/* L1 coil */}
        <path
          d={coilPath(150, 82, 5, 1)}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={1.8}
        />
        <line
          x1={130}
          y1={40}
          x2={140}
          y2={64}
          stroke="#3b82f6"
          strokeWidth={1.5}
        />
        <line
          x1={140}
          y1={118}
          x2={130}
          y2={160}
          stroke="#3b82f6"
          strokeWidth={1.5}
        />
        <text
          x={128}
          y={95}
          textAnchor="middle"
          fontSize={7}
          fill="#93c5fd"
          fontFamily="monospace"
        >
          L1
        </text>
        {/* C1 */}
        <line
          x1={130}
          y1={160}
          x2={70}
          y2={160}
          stroke="#3b82f6"
          strokeWidth={1.5}
        />
        <line
          x1={78}
          y1={152}
          x2={78}
          y2={168}
          stroke="#60a5fa"
          strokeWidth={2}
        />
        <line
          x1={72}
          y1={152}
          x2={72}
          y2={168}
          stroke="#60a5fa"
          strokeWidth={2}
        />
        <text
          x={75}
          y={180}
          textAnchor="middle"
          fontSize={7}
          fill="#93c5fd"
          fontFamily="monospace"
        >
          C1
        </text>
        {/* Wire bottom */}
        <line
          x1={70}
          y1={160}
          x2={30}
          y2={160}
          stroke="#3b82f6"
          strokeWidth={1.5}
        />
        <line
          x1={30}
          y1={160}
          x2={30}
          y2={114}
          stroke="#3b82f6"
          strokeWidth={1.5}
        />
      </g>

      {/* Current arrows primary */}
      {absI1 > 0.05 && (
        <g>
          <polygon
            points={`${55 + flow1 * 5},36 ${62 + flow1 * 5},40 ${55 + flow1 * 5},44`}
            fill="#60a5fa"
            opacity={absI1}
          />
          <text
            x={55}
            y={32}
            fontSize={7}
            fill="#93c5fd"
            fontFamily="monospace"
          >
            I₁
          </text>
        </g>
      )}

      {/* Secondary circuit */}
      <g filter="url(#glow2)" opacity={0.5 + absI2 * 0.5}>
        {/* L2 coil */}
        <path
          d={coilPath(190, 82, 5, -1)}
          fill="none"
          stroke="#10b981"
          strokeWidth={1.8}
        />
        <text
          x={212}
          y={95}
          textAnchor="middle"
          fontSize={7}
          fill="#6ee7b7"
          fontFamily="monospace"
        >
          L2
        </text>
        <line
          x1={200}
          y1={64}
          x2={210}
          y2={40}
          stroke="#10b981"
          strokeWidth={1.5}
        />
        <line
          x1={200}
          y1={118}
          x2={210}
          y2={160}
          stroke="#10b981"
          strokeWidth={1.5}
        />
        {/* R2 */}
        <line
          x1={210}
          y1={40}
          x2={240}
          y2={40}
          stroke="#10b981"
          strokeWidth={1.5}
        />
        <rect
          x={240}
          y={34}
          width={30}
          height={12}
          rx={2}
          fill="none"
          stroke="#34d399"
          strokeWidth={1.2}
        />
        <text
          x={255}
          y={43}
          textAnchor="middle"
          fontSize={7}
          fill="#6ee7b7"
          fontFamily="monospace"
        >
          R2
        </text>
        <line
          x1={270}
          y1={40}
          x2={310}
          y2={40}
          stroke="#10b981"
          strokeWidth={1.5}
        />
        {/* C2 */}
        <line
          x1={310}
          y1={40}
          x2={310}
          y2={160}
          stroke="#10b981"
          strokeWidth={1.5}
        />
        <line
          x1={268}
          y1={152}
          x2={268}
          y2={168}
          stroke="#34d399"
          strokeWidth={2}
        />
        <line
          x1={262}
          y1={152}
          x2={262}
          y2={168}
          stroke="#34d399"
          strokeWidth={2}
        />
        <text
          x={265}
          y={180}
          textAnchor="middle"
          fontSize={7}
          fill="#6ee7b7"
          fontFamily="monospace"
        >
          C2
        </text>
        <line
          x1={310}
          y1={160}
          x2={270}
          y2={160}
          stroke="#10b981"
          strokeWidth={1.5}
        />
        <line
          x1={260}
          y1={160}
          x2={210}
          y2={160}
          stroke="#10b981"
          strokeWidth={1.5}
        />
      </g>

      {/* Current arrows secondary */}
      {absI2 > 0.05 && (
        <g>
          <polygon
            points={`${285 + flow2 * 5},36 ${292 + flow2 * 5},40 ${285 + flow2 * 5},44`}
            fill="#34d399"
            opacity={absI2}
          />
          <text
            x={285}
            y={32}
            fontSize={7}
            fill="#6ee7b7"
            fontFamily="monospace"
          >
            I₂
          </text>
        </g>
      )}

      {/* Flux lines */}
      {[0, 1, 2].map((i) => {
        const yOff = -12 + i * 12;
        return (
          <ellipse
            key={i}
            cx={170}
            cy={100 + yOff}
            rx={12 + i * 3}
            ry={6}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={0.8}
            strokeDasharray="3,2"
            opacity={k * (0.4 + absI1 * 0.6)}
          />
        );
      })}
    </svg>
  );
}

// ─── Magnetic Field Visualization ───
function MagneticFieldViz({ I1, I2, k, B }) {
  const intensity = Math.min(Math.abs(I1) * 50, 1);
  const dir = I1 >= 0 ? 1 : -1;

  const fieldLines = [];
  const numLines = 8;
  for (let i = 0; i < numLines; i++) {
    const spread = 15 + i * 12;
    const opacity = Math.max(0.1, intensity * (1 - i / numLines));
    fieldLines.push({ spread, opacity });
  }

  return (
    <svg viewBox="0 0 340 200" style={{ width: "100%", height: "100%" }}>
      {/* Dark background */}
      <rect width={340} height={200} fill="#0a0f18" rx={4} />

      {/* Grid */}
      {Array.from({ length: 18 }).map((_, i) => (
        <line
          key={`v${i}`}
          x1={i * 20}
          y1={0}
          x2={i * 20}
          y2={200}
          stroke="#111827"
          strokeWidth={0.5}
        />
      ))}
      {Array.from({ length: 11 }).map((_, i) => (
        <line
          key={`h${i}`}
          x1={0}
          y1={i * 20}
          x2={340}
          y2={i * 20}
          stroke="#111827"
          strokeWidth={0.5}
        />
      ))}

      {/* Coil 1 */}
      <rect
        x={100}
        y={70}
        width={20}
        height={60}
        rx={3}
        fill="#1e3a5f"
        stroke="#3b82f6"
        strokeWidth={1.5}
      />
      <text
        x={110}
        y={105}
        textAnchor="middle"
        fontSize={9}
        fill="#60a5fa"
        fontFamily="monospace"
      >
        L1
      </text>

      {/* Coil 2 */}
      <rect
        x={220}
        y={70}
        width={20}
        height={60}
        rx={3}
        fill="#134e3a"
        stroke="#10b981"
        strokeWidth={1.5}
      />
      <text
        x={230}
        y={105}
        textAnchor="middle"
        fontSize={9}
        fill="#34d399"
        fontFamily="monospace"
      >
        L2
      </text>

      {/* Field lines from L1 */}
      {fieldLines.map((fl, i) => (
        <g key={i}>
          {/* Through coupling region */}
          <ellipse
            cx={170}
            cy={100}
            rx={50 + i * 8}
            ry={fl.spread}
            fill="none"
            stroke={dir > 0 ? "#f59e0b" : "#ef4444"}
            strokeWidth={1}
            strokeDasharray="4,3"
            opacity={fl.opacity}
          />
          {/* Arrows */}
          {fl.opacity > 0.2 && (
            <>
              <polygon
                points={`${170 + 50 + i * 8},${97} ${170 + 50 + i * 8},${103} ${170 + 54 + i * 8},${100}`}
                fill={dir > 0 ? "#f59e0b" : "#ef4444"}
                opacity={fl.opacity}
              />
              <polygon
                points={`${170 - 50 - i * 8},${103} ${170 - 50 - i * 8},${97} ${170 - 54 - i * 8},${100}`}
                fill={dir > 0 ? "#f59e0b" : "#ef4444"}
                opacity={fl.opacity}
              />
            </>
          )}
        </g>
      ))}

      {/* Coupled flux indicator */}
      <rect
        x={130}
        y={75}
        width={80}
        height={50}
        rx={4}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={1.5}
        strokeDasharray="6,3"
        opacity={k * intensity * 0.8}
      />

      {/* Labels */}
      <text
        x={170}
        y={18}
        textAnchor="middle"
        fontSize={10}
        fill="#e0e6f0"
        fontFamily="monospace"
        fontWeight="bold"
      >
        Campo Magnético
      </text>
      <text
        x={170}
        y={190}
        textAnchor="middle"
        fontSize={9}
        fill="#9ca3af"
        fontFamily="monospace"
      >
        B = {(B || 0).toFixed(3)} mT | Φ enlazado: k={k}
      </text>

      {/* Intensity bar */}
      <rect x={10} y={30} width={8} height={140} rx={4} fill="#1a2030" />
      <rect
        x={10}
        y={30 + 140 * (1 - intensity)}
        width={8}
        height={140 * intensity}
        rx={4}
        fill={dir > 0 ? "#f59e0b" : "#ef4444"}
      />
      <text
        x={14}
        y={25}
        textAnchor="middle"
        fontSize={7}
        fill="#9ca3af"
        fontFamily="monospace"
      >
        |B|
      </text>
    </svg>
  );
}

// ─── Energy Panel ───
function EnergyPanel({ dataPoint }) {
  if (!dataPoint) return null;
  const { E_L1, E_L2, E_C1, E_C2, I1, I2, Vc1, Vc2 } = dataPoint;
  const total = E_L1 + E_L2 + E_C1 + E_C2 + 0.0001;

  const bars = [
    {
      name: "E_L1",
      label: "½L₁I₁²",
      value: E_L1,
      color: "#3b82f6",
      pct: (E_L1 / total) * 100,
    },
    {
      name: "E_C1",
      label: "½C₁V²",
      value: E_C1,
      color: "#60a5fa",
      pct: (E_C1 / total) * 100,
    },
    {
      name: "E_L2",
      label: "½L₂I₂²",
      value: E_L2,
      color: "#10b981",
      pct: (E_L2 / total) * 100,
    },
    {
      name: "E_C2",
      label: "½C₂V²",
      value: E_C2,
      color: "#34d399",
      pct: (E_C2 / total) * 100,
    },
  ];

  const maxE = Math.max(...bars.map((b) => b.value), 1e-10);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "8px 12px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontFamily: "monospace",
          color: "#e0e6f0",
          fontWeight: 700,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Distribución de Energía
      </div>
      {bars.map((b) => (
        <div key={b.name} style={{ marginBottom: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 9,
              fontFamily: "monospace",
              color: "#9ca3af",
              marginBottom: 2,
            }}
          >
            <span style={{ color: b.color }}>{b.label}</span>
            <span>
              {b.value < 0.001 ? b.value.toExponential(1) : b.value.toFixed(4)}{" "}
              J ({b.pct.toFixed(0)}%)
            </span>
          </div>
          <div
            style={{
              height: 10,
              background: "#1a2030",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.max(1, (b.value / maxE) * 100)}%`,
                background: `linear-gradient(90deg, ${b.color}aa, ${b.color})`,
                borderRadius: 5,
                transition: "width 0.15s ease",
              }}
            />
          </div>
        </div>
      ))}
      <div
        style={{
          marginTop: 6,
          textAlign: "center",
          fontSize: 9,
          fontFamily: "monospace",
          color: "#f59e0b",
        }}
      >
        E_total = {total.toFixed(6)} J
      </div>
    </div>
  );
}

// ─── Preset buttons ───
const PRESETS = {
  weak: {
    label: "Acoplamiento Débil (k=0.2)",
    k: 0.2,
    R1: 10,
    R2: 10,
    L1: 0.01,
    L2: 0.01,
    C1: 0.0001,
    C2: 0.0001,
    V0: 10,
    freq: 100,
    mode: "AC",
  },
  medium: {
    label: "Acoplamiento Medio (k=0.5)",
    k: 0.5,
    R1: 5,
    R2: 5,
    L1: 0.01,
    L2: 0.01,
    C1: 0.0001,
    C2: 0.0001,
    V0: 10,
    freq: 100,
    mode: "AC",
  },
  strong: {
    label: "Acoplamiento Fuerte (k=0.9)",
    k: 0.9,
    R1: 2,
    R2: 2,
    L1: 0.01,
    L2: 0.01,
    C1: 0.0001,
    C2: 0.0001,
    V0: 10,
    freq: 100,
    mode: "AC",
  },
  resonance: {
    label: "Resonancia",
    k: 0.7,
    R1: 1,
    R2: 1,
    L1: 0.01,
    L2: 0.01,
    C1: 0.000025,
    C2: 0.000025,
    V0: 10,
    freq: 318,
    mode: "AC",
  },
  dc: {
    label: "Excitación DC",
    k: 0.6,
    R1: 5,
    R2: 5,
    L1: 0.01,
    L2: 0.01,
    C1: 0.0001,
    C2: 0.0001,
    V0: 12,
    freq: 100,
    mode: "DC",
  },
};

// ─── Main App ───
export default function App() {
  const [params, setParams] = useState({
    R1: 5,
    R2: 5,
    L1: 0.01,
    L2: 0.01,
    C1: 0.0001,
    C2: 0.0001,
    k: 0.5,
    V0: 10,
    freq: 100,
    mode: "AC",
    N1: 100,
    N2: 100,
  });

  const [animIdx, setAnimIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [activeGraph, setActiveGraph] = useState("currents");
  const animRef = useRef(null);

  const data = useMemo(() => solveSystem(params), [params]);

  useEffect(() => {
    if (!playing || data.length === 0) return;
    let idx = animIdx;
    const step = () => {
      idx = (idx + 1) % data.length;
      setAnimIdx(idx);
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, data.length]);

  const updateParam = useCallback((key, val) => {
    setParams((p) => ({ ...p, [key]: val }));
    setAnimIdx(0);
  }, []);

  const loadPreset = useCallback((preset) => {
    setParams((p) => ({ ...p, ...preset }));
    setAnimIdx(0);
  }, []);

  const currentPoint = data[animIdx] || data[0] || {};
  const M = params.k * Math.sqrt(params.L1 * params.L2);

  const graphTabs = [
    { id: "currents", label: "I(t)" },
    { id: "field", label: "B(t) & Φ(t)" },
    { id: "emf", label: "FEM" },
    { id: "voltage", label: "V_C(t)" },
  ];

  const renderGraph = () => {
    const common = { width: "100%", height: 180 };
    const axisStyle = { fontSize: 9, fontFamily: "monospace", fill: "#6b7280" };
    const gridStyle = { stroke: "#1f2937", strokeDasharray: "3 3" };

    switch (activeGraph) {
      case "currents":
        return (
          <ResponsiveContainer {...common}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid {...gridStyle} />
              <XAxis
                dataKey="t"
                tick={axisStyle}
                label={{
                  value: "t (ms)",
                  position: "bottom",
                  offset: -2,
                  style: { fontSize: 9, fill: "#6b7280" },
                }}
              />
              <YAxis
                tick={axisStyle}
                label={{
                  value: "A",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 9, fill: "#6b7280" },
                }}
              />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: 6,
                  fontSize: 10,
                  fontFamily: "monospace",
                }}
              />
              <Line
                type="monotone"
                dataKey="I1"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="I₁ (A)"
              />
              <Line
                type="monotone"
                dataKey="I2"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="I₂ (A)"
              />
              <Legend
                wrapperStyle={{ fontSize: 10, fontFamily: "monospace" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "field":
        return (
          <ResponsiveContainer {...common}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="t" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: 6,
                  fontSize: 10,
                  fontFamily: "monospace",
                }}
              />
              <Line
                type="monotone"
                dataKey="B"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name="B (mT)"
              />
              <Line
                type="monotone"
                dataKey="phi"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
                name="Φ (mWb)"
              />
              <Legend
                wrapperStyle={{ fontSize: 10, fontFamily: "monospace" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "emf":
        return (
          <ResponsiveContainer {...common}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="t" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: 6,
                  fontSize: 10,
                  fontFamily: "monospace",
                }}
              />
              <Line
                type="monotone"
                dataKey="emf"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="ε inducida (V)"
              />
              <Legend
                wrapperStyle={{ fontSize: 10, fontFamily: "monospace" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "voltage":
        return (
          <ResponsiveContainer {...common}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="t" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: 6,
                  fontSize: 10,
                  fontFamily: "monospace",
                }}
              />
              <Line
                type="monotone"
                dataKey="Vc1"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="V_C1 (V)"
              />
              <Line
                type="monotone"
                dataKey="Vc2"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="V_C2 (V)"
              />
              <Legend
                wrapperStyle={{ fontSize: 10, fontFamily: "monospace" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  const panelStyle = {
    background: "#0d1117",
    border: "1px solid #1e2a3a",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  };
  const panelHeaderStyle = {
    padding: "6px 12px",
    background: "#111827",
    borderBottom: "1px solid #1e2a3a",
    fontSize: 10,
    fontFamily: "'JetBrains Mono', monospace",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    gap: 6,
  };
  const dotStyle = (color) => ({
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: color,
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080c14",
        fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
        color: "#e0e6f0",
        padding: 12,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 800,
            margin: 0,
            background: "linear-gradient(135deg, #3b82f6, #10b981, #f59e0b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Simulador RLC Acoplado Magnéticamente
        </h1>
        <p style={{ fontSize: 10, color: "#6b7280", margin: "4px 0 0" }}>
          Circuitos acoplados por inductancia mutua M = k√(L₁L₂) ={" "}
          {(M * 1000).toFixed(3)} mH
        </p>
      </div>

      {/* Presets */}
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        {Object.entries(PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => loadPreset(preset)}
            style={{
              padding: "4px 10px",
              fontSize: 9,
              fontFamily: "monospace",
              background: "#111827",
              border: "1px solid #1e2a3a",
              borderRadius: 4,
              color: "#93c5fd",
              cursor: "pointer",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#1e2a3a";
              e.target.style.borderColor = "#3b82f6";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#111827";
              e.target.style.borderColor = "#1e2a3a";
            }}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => setPlaying((p) => !p)}
          style={{
            padding: "4px 12px",
            fontSize: 9,
            fontFamily: "monospace",
            background: playing ? "#1a2030" : "#10b981",
            border: "1px solid " + (playing ? "#374151" : "#10b981"),
            borderRadius: 4,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {playing ? "⏸ Pausar" : "▶ Iniciar"}
        </button>
      </div>

      {/* Main grid */}
      <div
        style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 10 }}
      >
        {/* Left: Controls */}
        <div
          style={{
            ...panelStyle,
            padding: 12,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#e0e6f0",
              marginBottom: 8,
              borderBottom: "1px solid #1e2a3a",
              paddingBottom: 6,
            }}
          >
            Parámetros del Sistema
          </div>

          <div
            style={{
              fontSize: 9,
              color: "#6b7280",
              marginBottom: 4,
              marginTop: 4,
            }}
          >
            Circuito Primario
          </div>
          <ParamSlider
            label="R₁"
            value={params.R1}
            min={0.1}
            max={50}
            step={0.1}
            onChange={(v) => updateParam("R1", v)}
            unit="Ω"
            color="#3b82f6"
          />
          <ParamSlider
            label="L₁"
            value={params.L1}
            min={0.001}
            max={0.1}
            step={0.001}
            onChange={(v) => updateParam("L1", v)}
            unit="H"
            color="#3b82f6"
          />
          <ParamSlider
            label="C₁"
            value={params.C1}
            min={0.00001}
            max={0.001}
            step={0.00001}
            onChange={(v) => updateParam("C1", v)}
            unit="F"
            color="#3b82f6"
          />
          <ParamSlider
            label="N₁"
            value={params.N1}
            min={10}
            max={500}
            step={10}
            onChange={(v) => updateParam("N1", v)}
            unit="espiras"
            color="#3b82f6"
          />

          <div
            style={{
              fontSize: 9,
              color: "#6b7280",
              marginBottom: 4,
              marginTop: 8,
            }}
          >
            Circuito Secundario
          </div>
          <ParamSlider
            label="R₂"
            value={params.R2}
            min={0.1}
            max={50}
            step={0.1}
            onChange={(v) => updateParam("R2", v)}
            unit="Ω"
            color="#10b981"
          />
          <ParamSlider
            label="L₂"
            value={params.L2}
            min={0.001}
            max={0.1}
            step={0.001}
            onChange={(v) => updateParam("L2", v)}
            unit="H"
            color="#10b981"
          />
          <ParamSlider
            label="C₂"
            value={params.C2}
            min={0.00001}
            max={0.001}
            step={0.00001}
            onChange={(v) => updateParam("C2", v)}
            unit="F"
            color="#10b981"
          />
          <ParamSlider
            label="N₂"
            value={params.N2}
            min={10}
            max={500}
            step={10}
            onChange={(v) => updateParam("N2", v)}
            unit="espiras"
            color="#10b981"
          />

          <div
            style={{
              fontSize: 9,
              color: "#6b7280",
              marginBottom: 4,
              marginTop: 8,
            }}
          >
            Acoplamiento y Fuente
          </div>
          <ParamSlider
            label="k"
            value={params.k}
            min={0}
            max={0.99}
            step={0.01}
            onChange={(v) => updateParam("k", v)}
            unit=""
            color="#f59e0b"
          />
          <ParamSlider
            label="V₀"
            value={params.V0}
            min={1}
            max={50}
            step={0.5}
            onChange={(v) => updateParam("V0", v)}
            unit="V"
            color="#ef4444"
          />
          <ParamSlider
            label="Frecuencia"
            value={params.freq}
            min={10}
            max={1000}
            step={1}
            onChange={(v) => updateParam("freq", v)}
            unit="Hz"
            color="#a855f7"
          />

          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {["DC", "AC"].map((m) => (
              <button
                key={m}
                onClick={() => updateParam("mode", m)}
                style={{
                  flex: 1,
                  padding: "5px",
                  fontSize: 10,
                  fontFamily: "monospace",
                  background: params.mode === m ? "#1e3a5f" : "#111827",
                  border: `1px solid ${params.mode === m ? "#3b82f6" : "#1e2a3a"}`,
                  borderRadius: 4,
                  color: params.mode === m ? "#60a5fa" : "#6b7280",
                  cursor: "pointer",
                }}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Live readings */}
          <div
            style={{
              marginTop: 12,
              padding: 8,
              background: "#111827",
              borderRadius: 6,
              border: "1px solid #1e2a3a",
            }}
          >
            <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 4 }}>
              Lecturas Instantáneas
            </div>
            <div style={{ fontSize: 10, color: "#3b82f6" }}>
              I₁ = {(currentPoint.I1 || 0).toFixed(4)} A
            </div>
            <div style={{ fontSize: 10, color: "#10b981" }}>
              I₂ = {(currentPoint.I2 || 0).toFixed(4)} A
            </div>
            <div style={{ fontSize: 10, color: "#f59e0b" }}>
              B = {(currentPoint.B || 0).toFixed(3)} mT
            </div>
            <div style={{ fontSize: 10, color: "#a855f7" }}>
              Φ = {(currentPoint.phi || 0).toFixed(4)} mWb
            </div>
            <div style={{ fontSize: 10, color: "#ef4444" }}>
              ε = {(currentPoint.emf || 0).toFixed(3)} V
            </div>
            <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
              t = {(currentPoint.t || 0).toFixed(2)} ms
            </div>
          </div>
        </div>

        {/* Right: Panels */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "auto auto",
            gap: 10,
          }}
        >
          {/* Panel 1: Circuit */}
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div style={dotStyle("#3b82f6")} /> Panel 1: Circuito Animado
            </div>
            <div style={{ padding: 4 }}>
              <CircuitDiagram
                I1={currentPoint.I1 || 0}
                I2={currentPoint.I2 || 0}
                k={params.k}
                t={animIdx * 0.05}
              />
            </div>
          </div>

          {/* Panel 2: Magnetic Field */}
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div style={dotStyle("#f59e0b")} /> Panel 2: Campo Magnético
            </div>
            <div style={{ padding: 4 }}>
              <MagneticFieldViz
                I1={currentPoint.I1 || 0}
                I2={currentPoint.I2 || 0}
                k={params.k}
                B={currentPoint.B || 0}
              />
            </div>
          </div>

          {/* Panel 3: Graphs */}
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div style={dotStyle("#a855f7")} /> Panel 3: Gráficas Temporales
            </div>
            <div style={{ display: "flex", gap: 2, padding: "4px 8px" }}>
              {graphTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveGraph(tab.id)}
                  style={{
                    padding: "2px 8px",
                    fontSize: 9,
                    fontFamily: "monospace",
                    background:
                      activeGraph === tab.id ? "#1e2a3a" : "transparent",
                    border: "none",
                    borderRadius: 3,
                    color: activeGraph === tab.id ? "#e0e6f0" : "#4b5563",
                    cursor: "pointer",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div style={{ padding: "0 4px 4px" }}>{renderGraph()}</div>
          </div>

          {/* Panel 4: Energy */}
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div style={dotStyle("#10b981")} /> Panel 4: Energía
            </div>
            <EnergyPanel dataPoint={currentPoint} />
          </div>
        </div>
      </div>

      {/* Footer: Physics chain */}
      <div
        style={{
          marginTop: 12,
          padding: 10,
          background: "#0d1117",
          border: "1px solid #1e2a3a",
          borderRadius: 8,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 4 }}>
          Cadena de Fenómenos Electromagnéticos
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {[
            { text: "Corriente I(t)", color: "#3b82f6" },
            { text: "→" },
            { text: "Campo B(t)", color: "#f59e0b" },
            { text: "→" },
            { text: "Flujo Φ(t)", color: "#a855f7" },
            { text: "→" },
            { text: "FEM ε(t)", color: "#ef4444" },
            { text: "→" },
            { text: "Transferencia E", color: "#10b981" },
          ].map((item, i) => (
            <span
              key={i}
              style={{
                fontSize: 11,
                fontWeight: item.color ? 700 : 400,
                color: item.color || "#4b5563",
                fontFamily: "monospace",
              }}
            >
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
