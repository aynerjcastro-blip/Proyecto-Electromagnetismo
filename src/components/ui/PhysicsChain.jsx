const CHAIN = [
  { text: "Corriente I(t)", color: "#3b82f6" },
  { text: "→" },
  { text: "Campo B(t)",     color: "#f59e0b" },
  { text: "→" },
  { text: "Flujo Φ(t)",     color: "#a855f7" },
  { text: "→" },
  { text: "FEM ε(t)",       color: "#ef4444" },
  { text: "→" },
  { text: "Transferencia E",color: "#10b981" },
];

export function PhysicsChain() {
  return (
    <div style={{
      marginTop: 12, padding: 10, background: "#0d1117",
      border: "1px solid #1e2a3a", borderRadius: 8, textAlign: "center",
    }}>
      <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 4 }}>
        Cadena de Fenómenos Electromagnéticos
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {CHAIN.map((item, i) => (
          <span key={i} style={{
            fontSize: 11, fontWeight: item.color ? 700 : 400,
            color: item.color ?? "#4b5563", fontFamily: "monospace",
          }}>
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
