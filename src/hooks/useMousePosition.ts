import { useEffect, useState } from "react";

const useMousePosition = () => {
  const [coords, setCoords] = useState({x: 0, y: 0});

  useEffect(() => {
    const updateCoords = (e: MouseEvent) => {
      setCoords({x: e.clientX, y: e.clientY});
    };

    document.addEventListener("mousemove", updateCoords);
    return () => {
      document.removeEventListener("mousemove", updateCoords);
    };
  }, []);

  return coords;
};

export {useMousePosition}