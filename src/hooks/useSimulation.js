import { useState, useEffect, useRef, useMemo } from "react";
import { solveSystem } from "../solver/rlcSolver";

export function useSimulation(params) {
  const [animIdx, setAnimIdx]   = useState(0);
  const [playing, setPlaying]   = useState(true);
  const animRef                 = useRef(null);

  // Recompute only when params change
  const data = useMemo(() => solveSystem(params), [params]);

  // Reset animation index when data changes
  useEffect(() => {
    setAnimIdx(0);
  }, [data]);

  // Animation loop
  useEffect(() => {
    if (!playing || data.length === 0) return;

    let idx = animIdx;
    const step = () => {
      idx = (idx + 1) % data.length;
      setAnimIdx(idx);
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animRef.current);
  }, [playing, data]);

  const togglePlay = () => setPlaying((p) => !p);

  const currentPoint = data[animIdx] ?? data[0] ?? {};

  return { data, animIdx, playing, togglePlay, currentPoint };
}
