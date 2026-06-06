import { PanelHeader } from "../ui/PanelHeader";
import { panelStyle } from "../../constants";

const BARS = [
  { key: "E_L1", label: "½L₁I₁²", color: "#3b82f6" },
  { key: "E_C1", label: "½C₁V²",  color: "#60a5fa" },
  { key: "E_L2", label: "½L₂I₂²", color: "#10b981" },
  { key: "E_C2", label: "½C₂V²",  color: "#34d399" },
];

export function EnergyPanel({ point }) {
  const values = BARS.map((b) => point?.[b.key] ?? 0);
  const total  = values.reduce((a, b) => a + b, 0) + 1e-10;
  const maxVal = Math.max(...values, 1e-10);

  return (
    <div style={panelStyle}>
      <PanelHeader color="#10b981" title="Panel 4: Energía" />

      <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: 11, fontFamily: "monospace", color: "#e0e6f0", fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
          Distribución de Energía
        </div>

        {BARS.map((bar, i) => {
          const val = values[i];
          const pct = ((val / total) * 100).toFixed(0);
          const barW = Math.max(1, (val / maxVal) * 100);
          const display = val < 0.001 ? val.toExponential(1) : val.toFixed(4);

          return (
            <div key={bar.key} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontFamily: "monospace", color: "#9ca3af", marginBottom: 2 }}>
                <span style={{ color: bar.color }}>{bar.label}</span>
                <span>{display} J ({pct}%)</span>
              </div>
              <div style={{ height: 10, background: "#1a2030", borderRadius: 5, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${barW}%`,
                  background: `linear-gradient(90deg, ${bar.color}aa, ${bar.color})`,
                  borderRadius: 5, transition: "width 0.15s ease",
                }} />
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: 6, textAlign: "center", fontSize: 9, fontFamily: "monospace", color: "#f59e0b" }}>
          E_total = {total.toFixed(6)} J
        </div>
      </div>
    </div>
  );
}
