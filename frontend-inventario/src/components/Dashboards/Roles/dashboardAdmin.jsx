import React from "react";
import LayoutDashboard from "../../Layouts/LayoutDashboard";
import GraficoUsuariosPorRol from "../../Graficos/GraficoUsuariosPorRol"
import ChartExportContainer from "../../Graficos/ChartExportContainer";
import FeedActividad from "../../Graficos/FeedActividad";
import CampaniaWidget from "../../Graficos/CampaniaWidget";
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
                    <div className="grid-item-kpi" style={{ gridColumn: 'span 1', minHeight: '250px' }}>
                        <CampaniaWidget />
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
                            <ChartExportContainer title="Usuarios por Rol">
                                <GraficoUsuariosPorRol />
                            </ChartExportContainer>
                        </div>
                    </div>
                    <div className="grid-item-large">
                        <FeedActividad/>
                    </div>
                </div>
            </div>
            <ChatWidget />
        </LayoutDashboard>
    );
}
