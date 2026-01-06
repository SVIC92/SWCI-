import React from "react";
import LayoutDashboard from "../../Layouts/LayoutDashboard";
import WidgetReabastecimiento from "../../Graficos/WidgetReabastecimiento";

function DashboardJInventario() {
  return (
    <LayoutDashboard>
      <div style={{ padding: "20px" }}>
        <h1>Panel del Jefe de Inventario</h1>
        <p>Desde aquí puedes controlar los productos, movimientos y stock actual.</p>
        <WidgetReabastecimiento idSede={1} />
      </div>
    </LayoutDashboard>
  );
}

export default DashboardJInventario;
