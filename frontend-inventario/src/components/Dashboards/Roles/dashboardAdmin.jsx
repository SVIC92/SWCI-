import React from "react";
import LayoutDashboard from "../../Layouts/LayoutDashboard";
import GraficoUsuariosPorRol from "../../Graficos/GraficoUsuariosPorRol"
import FeedActividad from "../../Graficos/FeedActividad";
import "../../styles/dashboardAdmin.css";
import WidgetReabastecimiento from "../../Graficos/WidgetReabastecimiento";
import ChatWidget from "../../IA/ChatWidget";

export default function DashboardAdmin() {
    return (
        <LayoutDashboard>
            <div className="dashboard-admin-container">
                <h1>Dashboard de Administrador</h1>

                <div className="dashboard-grid">

                    {/* --- FILA 1: TARJETAS KPI --- */}
                    <div className="grid-item-kpi">
                        <WidgetReabastecimiento idSede={1} />
                    </div>
                    <div className="grid-item-kpi">
                        {/* <StatCard  ... /> */}
                    </div>
                    <div className="grid-item-kpi">
                        {/* <StatCard  ... /> */}
                    </div>
                    <div className="grid-item-kpi">
                        {/* <StatCard  ... /> */}
                    </div>
                    {/** Gráficos y Listas */}
                    <div className="grid-item-large">
                        <div className="card-widget">
                            <h3>Usuarios por Rol</h3>
                            <GraficoUsuariosPorRol />
                        </div>
                    </div>
                    <div className="grid-item-large">
                        <FeedActividad />
                    </div>
                </div>
            </div>
            <ChatWidget />
        </LayoutDashboard>
    );
}
