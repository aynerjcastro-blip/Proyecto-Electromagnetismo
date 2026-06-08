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
      height: "100vh",
      width: "100vw",
      background: "#080c14",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
      color: "#e0e6f0",
      padding: 8,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      gap: 6,
    }}>

      {/* Header */}
      <div style={{ textAlign: "center", flexShrink: 0 }}>
        <h1 style={{
          fontSize: 16, fontWeight: 800, margin: 0,
          background: "linear-gradient(135deg, #3b82f6, #10b981, #f59e0b)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Simulador RLC Acoplado Magnéticamente
        </h1>
        <p style={{ fontSize: 9, color: "#6b7280", margin: "2px 0 0" }}>
          M = k√(L₁L₂) = {(M * 1000).toFixed(3)} mH
        </p>
      </div>

      {/* Presets */}
      <div style={{ flexShrink: 0 }}>
        <PresetButtons onLoad={loadPreset} playing={playing} onTogglePlay={togglePlay} />
      </div>

      {/* Main layout — ocupa todo el espacio restante */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: 8,
        flex: 1,
        minHeight: 0,        // crítico para que flex respete overflow
        overflow: "hidden",
      }}>

        {/* Sidebar */}
        <ControlsSidebar
          params={params}
          updateParam={updateParam}
          currentPoint={currentPoint}
        />

        {/* 2x2 paneles */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 8,
          minHeight: 0,
          overflow: "hidden",
        }}>
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

      {/* Footer */}
      <div style={{ flexShrink: 0 }}>
        <PhysicsChain />
      </div>

    </div>
  );
}