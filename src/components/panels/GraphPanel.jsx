import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { PanelHeader } from "../ui/PanelHeader";
import { panelStyle } from "../../constants";

const TABS = [
  { id: "currents", label: "I(t)" },
  { id: "field",    label: "B(t) & Φ(t)" },
  { id: "emf",      label: "FEM" },
  { id: "voltage",  label: "V_C(t)" },
];

const AXIS_STYLE  = { fontSize: 9, fontFamily: "monospace", fill: "#6b7280" };
const GRID_STYLE  = { stroke: "#1f2937", strokeDasharray: "3 3" };
const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#111827", border: "1px solid #374151",
    borderRadius: 6, fontSize: 10, fontFamily: "monospace",
  },
};
const LEGEND_STYLE = { wrapperStyle: { fontSize: 10, fontFamily: "monospace" } };
const CHART_MARGIN = { top: 5, right: 10, left: 0, bottom: 5 };

function Chart({ data, lines }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={CHART_MARGIN}>
        <CartesianGrid {...GRID_STYLE} />
        <XAxis dataKey="t" tick={AXIS_STYLE}
          label={{ value: "t (ms)", position: "bottom", offset: -2, style: { fontSize: 9, fill: "#6b7280" } }} />
        <YAxis tick={AXIS_STYLE} />
        <Tooltip {...TOOLTIP_STYLE} />
        <Legend {...LEGEND_STYLE} />
        {lines.map(({ key, color, name }) => (
          <Line key={key} type="monotone" dataKey={key}
            stroke={color} strokeWidth={2} dot={false} name={name} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

const TAB_LINES = {
  currents: [
    { key: "I1",  color: "#3b82f6", name: "I₁ (A)" },
    { key: "I2",  color: "#10b981", name: "I₂ (A)" },
  ],
  field: [
    { key: "B",   color: "#f59e0b", name: "B (mT)" },
    { key: "phi", color: "#a855f7", name: "Φ (mWb)" },
  ],
  emf: [
    { key: "emf", color: "#ef4444", name: "ε inducida (V)" },
  ],
  voltage: [
    { key: "Vc1", color: "#3b82f6", name: "V_C1 (V)" },
    { key: "Vc2", color: "#10b981", name: "V_C2 (V)" },
  ],
};

export function GraphPanel({ data }) {
  const [active, setActive] = useState("currents");

  return (
    <div style={panelStyle}>
      <PanelHeader color="#a855f7" title="Panel 3: Gráficas Temporales" />

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 2, padding: "4px 8px" }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActive(tab.id)}
            style={{
              padding: "2px 8px", fontSize: 9, fontFamily: "monospace",
              background: active === tab.id ? "#1e2a3a" : "transparent",
              border: "none", borderRadius: 3,
              color: active === tab.id ? "#e0e6f0" : "#4b5563",
              cursor: "pointer",
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 4px 4px" }}>
        <Chart data={data} lines={TAB_LINES[active]} />
      </div>
    </div>
  );
}
