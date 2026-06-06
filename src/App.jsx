import { useParams }       from "./hooks/useParams";
import { useSimulation }   from "./hooks/useSimulation";
import { ControlsSidebar } from "./components/ControlsSidebar";
import { PresetButtons }   from "./components/controls/PresetButtons";
import { CircuitDiagram }  from "./components/panels/CircuitDiagram";
import { MagneticField }   from "./components/panels/MagneticField";
import { GraphPanel }      from "./components/panels/GraphPanel";
import { EnergyPanel }     from "./components/panels/EnergyPanel";
import { PhysicsChain }    from "./components/ui/PhysicsChain";

export default function App() {
  const { params, updateParam, loadPreset } = useParams();
  const { data, animIdx, playing, togglePlay, currentPoint } = useSimulation(params);

  const M = params.k * Math.sqrt(params.L1 * params.L2);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080c14",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
      color: "#e0e6f0",
      padding: 12,
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <h1 style={{
          fontSize: 18, fontWeight: 800, margin: 0,
          background: "linear-gradient(135deg, #3b82f6, #10b981, #f59e0b)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Simulador RLC Acoplado Magnéticamente
        </h1>
        <p style={{ fontSize: 10, color: "#6b7280", margin: "4px 0 0" }}>
          M = k√(L₁L₂) = {(M * 1000).toFixed(3)} mH
        </p>
      </div>

      {/* Presets + play control */}
      <PresetButtons onLoad={loadPreset} playing={playing} onTogglePlay={togglePlay} />

      {/* Main layout */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 10 }}>
        {/* Left sidebar */}
        <ControlsSidebar
          params={params}
          updateParam={updateParam}
          currentPoint={currentPoint}
        />

        {/* Right 2x2 grid of panels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <CircuitDiagram
            I1={currentPoint.I1 ?? 0}
            I2={currentPoint.I2 ?? 0}
            k={params.k}
            animIdx={animIdx}
          />
          <MagneticField
            I1={currentPoint.I1 ?? 0}
            I2={currentPoint.I2 ?? 0}
            k={params.k}
            B={currentPoint.B ?? 0}
          />
          <GraphPanel data={data} />
          <EnergyPanel point={currentPoint} />
        </div>
      </div>

      <PhysicsChain />
    </div>
  );
}
