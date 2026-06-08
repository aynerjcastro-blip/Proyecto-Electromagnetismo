import { ParamSlider }  from "./controls/ParamSlider";
import { ModeToggle }   from "./controls/ModeToggle";
import { LiveReadings } from "./ui/LiveReadings";
import { COLORS }       from "../constants";

const SECTION = (label) => (
  <div style={{ fontSize: 9, color: COLORS.muted, marginBottom: 4, marginTop: 8 }}>
    {label}
  </div>
);

export function ControlsSidebar({ params, updateParam, currentPoint }) {
  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      padding: 10,
      height: "100%",       // ← era maxHeight: "80vh"
      overflowY: "auto",
      boxSizing: "border-box",
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: COLORS.text,
        marginBottom: 8, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 6,
      }}>
        Parámetros del Sistema
      </div>

      {SECTION("Circuito Primario")}
      <ParamSlider label="R₁" value={params.R1} min={0.1}    max={50}     step={0.1}     onChange={(v) => updateParam("R1", v)}   unit="Ω"     color={COLORS.primary} />
      <ParamSlider label="L₁" value={params.L1} min={0.001}  max={0.1}    step={0.001}   onChange={(v) => updateParam("L1", v)}   unit="H"     color={COLORS.primary} />
      <ParamSlider label="C₁" value={params.C1} min={0.00001} max={0.001} step={0.00001} onChange={(v) => updateParam("C1", v)}   unit="F"     color={COLORS.primary} />
      <ParamSlider label="N₁" value={params.N1} min={10}     max={500}    step={10}      onChange={(v) => updateParam("N1", v)}   unit="esp."  color={COLORS.primary} />

      {SECTION("Circuito Secundario")}
      <ParamSlider label="R₂" value={params.R2} min={0.1}    max={50}     step={0.1}     onChange={(v) => updateParam("R2", v)}   unit="Ω"     color={COLORS.secondary} />
      <ParamSlider label="L₂" value={params.L2} min={0.001}  max={0.1}    step={0.001}   onChange={(v) => updateParam("L2", v)}   unit="H"     color={COLORS.secondary} />
      <ParamSlider label="C₂" value={params.C2} min={0.00001} max={0.001} step={0.00001} onChange={(v) => updateParam("C2", v)}   unit="F"     color={COLORS.secondary} />
      <ParamSlider label="N₂" value={params.N2} min={10}     max={500}    step={10}      onChange={(v) => updateParam("N2", v)}   unit="esp."  color={COLORS.secondary} />

      {SECTION("Acoplamiento y Fuente")}
      <ParamSlider label="k"          value={params.k}    min={0}  max={0.99} step={0.01} onChange={(v) => updateParam("k",    v)} unit=""   color={COLORS.coupling} />
      <ParamSlider label="V₀"         value={params.V0}   min={1}  max={50}   step={0.5}  onChange={(v) => updateParam("V0",   v)} unit="V"  color={COLORS.emf} />
      <ParamSlider label="Frecuencia" value={params.freq} min={10} max={1000} step={1}    onChange={(v) => updateParam("freq", v)} unit="Hz" color={COLORS.flux} />

      <ModeToggle mode={params.mode} onChange={(m) => updateParam("mode", m)} />
      <LiveReadings point={currentPoint} />
    </div>
  );
}