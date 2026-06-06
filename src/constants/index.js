// ─── Casos de estudio predefinidos ────────────────────────────────────────────
export const PRESETS = {
  weak: {
    label: "Acoplamiento Débil (k=0.2)",
    k: 0.2, R1: 10, R2: 10, L1: 0.01, L2: 0.01,
    C1: 0.0001, C2: 0.0001, V0: 10, freq: 100, mode: "AC",
  },
  medium: {
    label: "Acoplamiento Medio (k=0.5)",
    k: 0.5, R1: 5, R2: 5, L1: 0.01, L2: 0.01,
    C1: 0.0001, C2: 0.0001, V0: 10, freq: 100, mode: "AC",
  },
  strong: {
    label: "Acoplamiento Fuerte (k=0.9)",
    k: 0.9, R1: 2, R2: 2, L1: 0.01, L2: 0.01,
    C1: 0.0001, C2: 0.0001, V0: 10, freq: 100, mode: "AC",
  },
  resonance: {
    label: "Resonancia",
    k: 0.7, R1: 1, R2: 1, L1: 0.01, L2: 0.01,
    C1: 0.000025, C2: 0.000025, V0: 10, freq: 318, mode: "AC",
  },
  dc: {
    label: "Excitación DC",
    k: 0.6, R1: 5, R2: 5, L1: 0.01, L2: 0.01,
    C1: 0.0001, C2: 0.0001, V0: 12, freq: 100, mode: "DC",
  },
};

export const DEFAULT_PARAMS = {
  R1: 5, R2: 5, L1: 0.01, L2: 0.01,
  C1: 0.0001, C2: 0.0001,
  k: 0.5, V0: 10, freq: 100,
  mode: "AC", N1: 100, N2: 100,
};

// ─── Tokens de color ──────────────────────────────────────────────────────────
export const COLORS = {
  primary:   "#3b82f6",
  secondary: "#10b981",
  coupling:  "#f59e0b",
  emf:       "#ef4444",
  flux:      "#a855f7",
  bg:        "#080c14",
  surface:   "#0d1117",
  border:    "#1e2a3a",
  muted:     "#6b7280",
  text:      "#e0e6f0",
  panel:     "#111827",
};

// ─── Estilos de panel reutilizables ───────────────────────────────────────────
export const panelStyle = {
  background: COLORS.surface,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  overflow: "hidden",
};

export const panelHeaderStyle = {
  padding: "6px 12px",
  background: COLORS.panel,
  borderBottom: `1px solid ${COLORS.border}`,
  fontSize: 10,
  fontFamily: "monospace",
  color: COLORS.muted,
  display: "flex",
  alignItems: "center",
  gap: 6,
};
