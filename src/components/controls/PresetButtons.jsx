import { PRESETS } from "../../constants";

export function PresetButtons({ onLoad, playing, onTogglePlay }) {
  const btnBase = {
    padding: "4px 10px", fontSize: 9, fontFamily: "monospace",
    background: "#111827", border: "1px solid #1e2a3a",
    borderRadius: 4, color: "#93c5fd", cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 12 }}>
      {Object.entries(PRESETS).map(([key, preset]) => (
        <button
          key={key}
          onClick={() => onLoad(key)}
          style={btnBase}
          onMouseEnter={(e) => { e.target.style.background = "#1e2a3a"; e.target.style.borderColor = "#3b82f6"; }}
          onMouseLeave={(e) => { e.target.style.background = "#111827"; e.target.style.borderColor = "#1e2a3a"; }}
        >
          {preset.label}
        </button>
      ))}

      <button
        onClick={onTogglePlay}
        style={{
          ...btnBase,
          background: playing ? "#1a2030" : "#10b981",
          border: `1px solid ${playing ? "#374151" : "#10b981"}`,
          color: "#fff",
        }}
      >
        {playing ? "⏸ Pausar" : "▶ Iniciar"}
      </button>
    </div>
  );
}
