import { useState, useCallback } from "react";
import { DEFAULT_PARAMS, PRESETS } from "../constants";

export function useParams() {
  const [params, setParams] = useState(DEFAULT_PARAMS);

  const updateParam = useCallback((key, val) => {
    setParams((p) => ({ ...p, [key]: val }));
  }, []);

  const loadPreset = useCallback((presetKey) => {
    const preset = PRESETS[presetKey];
    if (preset) setParams((p) => ({ ...p, ...preset }));
  }, []);

  return { params, updateParam, loadPreset };
}
