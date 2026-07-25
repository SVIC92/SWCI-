import React from "react";
import { getReporteEntradas } from "../../api/reporteApi";
import ReporteMovimientos from "./ReporteMovimientos";

function ReporteEntradas() {
  return (
    <ReporteMovimientos
      title="Reporte de Entradas"
      queryKeyBase="reporteEntradas"
      queryFn={getReporteEntradas}
    />
  );
}

export default ReporteEntradas;
