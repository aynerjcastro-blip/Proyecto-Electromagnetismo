export function ParamSlider({ label, value, min, max, step, onChange, unit, color = "#3b82f6" }) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = value >= 0.001
    ? value
    : value.toExponential(1);

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontSize: 11, fontFamily: "monospace", color: "#b0b8c8",
      }}>
        <span style={{ color }}>{label}</span>
        <span style={{ color: "#e0e6f0", fontWeight: 600 }}>
          {display} {unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%", height: 6, appearance: "none",
          background: `linear-gradient(90deg, ${color} ${pct}%, #2a3040 ${pct}%)`,
          borderRadius: 3, outline: "none", cursor: "pointer",
          accentColor: color,
        }}
      />
    </div>
  );
}
