import { panelHeaderStyle } from "../../constants";

export function PanelHeader({ color, title }) {
  return (
    <div style={panelHeaderStyle}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      {title}
    </div>
  );
}
