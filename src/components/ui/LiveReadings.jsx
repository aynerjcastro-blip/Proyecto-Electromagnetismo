export function LiveReadings({ point }) {
  const rows = [
    { label: "I₁", value: (point.I1 ?? 0).toFixed(4), unit: "A",   color: "#3b82f6" },
    { label: "I₂", value: (point.I2 ?? 0).toFixed(4), unit: "A",   color: "#10b981" },
    { label: "B",  value: (point.B  ?? 0).toFixed(3), unit: "mT",  color: "#f59e0b" },
    { label: "Φ",  value: (point.phi?? 0).toFixed(4), unit: "mWb", color: "#a855f7" },
    { label: "ε",  value: (point.emf?? 0).toFixed(3), unit: "V",   color: "#ef4444" },
  ];

  return (
    <div style={{
      marginTop: 12, padding: 8, background: "#111827",
      borderRadius: 6, border: "1px solid #1e2a3a",
    }}>
      <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 4 }}>
        Lecturas Instantáneas
      </div>
      {rows.map(({ label, value, unit, color }) => (
        <div key={label} style={{ fontSize: 10, color }}>
          {label} = {value} {unit}
        </div>
      ))}
      <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
        t = {(point.t ?? 0).toFixed(2)} ms
      </div>
    </div>
  );
}
