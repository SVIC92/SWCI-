import { useState, useEffect } from "react";

const options = {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

const formatTime = (date) => date.toLocaleTimeString("es-PE", options);
export const HookTiempoReal = () => {
  const [horaActual, setHoraActual] = useState(formatTime(new Date()));

  useEffect(() => {
    const timerId = setInterval(() => {
      setHoraActual(formatTime(new Date()));
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  return horaActual;
};
