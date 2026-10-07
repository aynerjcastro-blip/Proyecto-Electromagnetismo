export function ModeToggle({ mode, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
      {["DC", "AC"].map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          style={{
            flex: 1, padding: "5px", fontSize: 10, fontFamily: "monospace",
            background: mode === m ? "#1e3a5f" : "#111827",
            border: `1px solid ${mode === m ? "#3b82f6" : "#1e2a3a"}`,
            borderRadius: 4,
            color: mode === m ? "#60a5fa" : "#6b7280",
            cursor: "pointer",
          }}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
