import React from "react";
import { getReporteSalidas } from "../../api/reporteApi";
import ReporteMovimientos from "./ReporteMovimientos";

function ReporteSalidas() {
  return (
    <ReporteMovimientos
      title="Reporte de Salidas"
      queryKeyBase="reporteSalidas"
      queryFn={getReporteSalidas}
    />
  );
}

export default ReporteSalidas;
