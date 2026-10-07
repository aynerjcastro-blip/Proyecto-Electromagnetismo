// ─── RK4 Solver ───────────────────────────────────────────────────────────────
export function rk4Step(f, t, y, dt) {
  const k1 = f(t, y);
  const k2 = f(t + dt / 2, y.map((v, i) => v + (dt / 2) * k1[i]));
  const k3 = f(t + dt / 2, y.map((v, i) => v + (dt / 2) * k2[i]));
  const k4 = f(t + dt, y.map((v, i) => v + dt * k3[i]));
  return y.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}

// ─── Sistema de ecuaciones acopladas ──────────────────────────────────────────
// Variables de estado: [I1, I2, Vc1, Vc2]
//
// [L1  M ] [I1']   [Vs - R1*I1 - Vc1]
// [M   L2] [I2'] = [-R2*I2 - Vc2    ]
//
// Vc1' = I1/C1
// Vc2' = I2/C2
export function solveSystem(params) {
  const { R1, R2, L1, L2, C1, C2, k, V0, freq, mode, N2 } = params;

  const M   = k * Math.sqrt(L1 * L2);
  const det = L1 * L2 - M * M;
  if (Math.abs(det) < 1e-15) return [];

  const omega = 2 * Math.PI * freq;
  const tMax  = mode === "AC" ? Math.max(0.05, 5 / freq) : 0.05;
  const dt    = tMax / 1500;
  const steps = Math.floor(tMax / dt);
  const skip  = Math.max(1, Math.floor(steps / 500));
  const CORE_LENGTH = 0.05;
  const MU0 = 4 * Math.PI * 1e-7;

  const derivatives = (t, y) => {
    const [I1, I2, Vc1, Vc2] = y;
    const Vs   = mode === "AC" ? V0 * Math.sin(omega * t) : V0;
    const rhs1 = Vs - R1 * I1 - Vc1;
    const rhs2 = -R2 * I2 - Vc2;
    return [
      (L2 * rhs1 - M * rhs2) / det,
      (L1 * rhs2 - M * rhs1) / det,
      I1 / C1,
      I2 / C2,
    ];
  };

  let y = [0, 0, 0, 0];
  const data = [];

  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    if (i % skip === 0) {
      const [I1, I2, Vc1, Vc2] = y;
      const B      = MU0 * params.N1 * I1 / CORE_LENGTH;
      const phi    = M * I1;
      const dI1    = derivatives(t, y)[0];
      const emf    = -N2 * M * dI1;
      data.push({
        t:    parseFloat((t * 1000).toFixed(4)),
        I1:   parseFloat(I1.toFixed(6)),
        I2:   parseFloat(I2.toFixed(6)),
        B:    parseFloat((B * 1000).toFixed(6)),
        phi:  parseFloat((phi * 1000).toFixed(6)),
        emf:  parseFloat(emf.toFixed(4)),
        E_L1: 0.5 * L1 * I1 * I1,
        E_L2: 0.5 * L2 * I2 * I2,
        E_C1: 0.5 * C1 * Vc1 * Vc1,
        E_C2: 0.5 * C2 * Vc2 * Vc2,
        Vc1,
        Vc2,
      });
    }
    y = rk4Step(derivatives, t, y, dt);
  }
  return data;
}
